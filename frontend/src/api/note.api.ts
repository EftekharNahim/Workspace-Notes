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

  listPublic() {
    return api.get('/notes/public')
  },

  show(id: number) {
    return api.get(`/notes/${id}`)
  },


  vote(id: number, voteType: 'upvote' | 'downvote') {
    return api.post(`/notes/${id}/vote`, { voteType })
  },
  
  getHistory(noteId: number) {
    return api.get(`/notes/${noteId}/history`)
  },

  restoreHistory(historyId: number) {
    return api.post(`/notes/history/${historyId}/restore`)
  },
}
