export async function apiFetch(path, options) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  let storedUser = null

  if (typeof window !== 'undefined') {
    const rawUser = window.localStorage.getItem('user')
    if (rawUser) {
      try {
        storedUser = JSON.parse(rawUser)
      } catch {
        storedUser = null
      }
    }
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
  }

  if (storedUser?.id) {
    defaultHeaders['x-user-id'] = storedUser.id
  }

  if (storedUser?.role) {
    defaultHeaders['x-user-role'] = storedUser.role
  }

  if (storedUser?.department) {
    defaultHeaders['x-user-department'] = storedUser.department
  }

  const response = await fetch(normalizedPath, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options && options.headers ? options.headers : {}),
    },
  })

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const body = isJson ? await response.json().catch(() => null) : await response.text().catch(() => '')

  if (!response.ok) {
    const message = body && typeof body === 'object' && body.message ? body.message : `Request failed (${response.status})`
    const error = new Error(message)
    error.status = response.status
    error.body = body
    throw error
  }

  return body
}
