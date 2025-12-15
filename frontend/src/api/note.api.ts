import { api } from './axios'

export const noteApi = {
  create(data: any) {
    return api.post('/notes', data)
  },

  update(id: number, data: any) {
    return api.put(`/notes/${id}`, data)
  },

  remove(id: number) {
    return api.delete(`/notes/${id}`)
  },

  listPrivate(workspaceId: number) {
    return api.get(`/notes/workspace/${workspaceId}`)
  },

  listPublic(params?: any) {
    return api.get('/public', { params })
  },

  show(id: number) {
    return api.get(`/notes/${id}`)
  },

  vote(id: number, voteType: 'upvote' | 'downvote') {
    return api.post(`/notes/${id}/vote`, { voteType })
  },
}
