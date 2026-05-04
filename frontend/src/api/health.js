import { apiFetch } from './http'

export function getHealth() {
  return apiFetch('/api/health')
}
