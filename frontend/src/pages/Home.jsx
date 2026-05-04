import { useEffect, useState } from 'react'
import Container from '../components/Container'
import { getHealth } from '../api/health'

export default function Home() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    getHealth()
      .then((data) => {
        if (isMounted) setHealth(data)
      })
      .catch((err) => {
        if (isMounted) setError(err && err.message ? err.message : 'Failed to reach backend')
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <Container>
      <h1>Education Management System</h1>
      <p>Frontend is running. Backend status:</p>

      {error ? (
        <pre>{error}</pre>
      ) : (
        <pre>{health ? JSON.stringify(health, null, 2) : 'Loading…'}</pre>
      )}
    </Container>
  )
}
