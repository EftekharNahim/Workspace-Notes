import axios from 'axios'
import { getTenantHostname } from '../utils/tenant'

export const api = axios.create({
  baseURL: `http://${getTenantHostname()}:3333`,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {}

  // Axios v1 may use AxiosHeaders (with a .set method) instead of a plain object.
  const headers: any = config.headers
  if (typeof headers.set === 'function') {
    headers.set('X-Tenant-Host', getTenantHostname())
  } else {
    headers['X-Tenant-Host'] = getTenantHostname()
  }

  return config
})
