import { api } from './axios'

export const workspaceApi = {
  list(page = 1, limit = 10) {
    return api.get('/workspaces',{ params: { page, limit } })
  },

  create(data: { name: string }) {
    return api.post('/workspaces', data)
  },

  update(id: number, data: { name: string }) {
    return api.put(`/workspaces/${id}`, data)
  },

  remove(id: number) {
    return api.delete(`/workspaces/${id}`)
  },
}
