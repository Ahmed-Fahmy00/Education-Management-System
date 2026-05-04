export async function apiFetch(path, options) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  const response = await fetch(normalizedPath, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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
