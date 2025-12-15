import { api } from './axios'

export const workspaceApi = {
  list() {
    return api.get('/workspaces')
  },

  create(data: { name: string; hostname?: string }) {
    return api.post('/workspaces', data)
  },

  update(id: number, data: { name: string }) {
    return api.put(`/workspaces/${id}`, data)
  },

  remove(id: number) {
    return api.delete(`/workspaces/${id}`)
  },
}
