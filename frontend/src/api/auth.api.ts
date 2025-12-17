import { api } from './axios'

export const authApi = {

  register(data: { username: string; email: string; password: string }) {
    return api.post('/register', data)
  },

  login(data: { email: string; password: string }) {
    return api.post('/login', data)
  },

  me() {
    return api.get('/me')
  },

  logout() {
    return api.post('/logout')
    
  },
}
