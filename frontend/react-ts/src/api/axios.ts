import axios from 'axios'
import { getTenantHostname } from '../utils/tenant'

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  config.headers['X-Tenant-Host'] = getTenantHostname()
  return config
})
