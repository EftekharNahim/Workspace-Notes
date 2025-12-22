import { createContext, useEffect, useState } from 'react'
import { authApi } from '../api/auth.api'

export const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [company, setCompany] = useState<any>(null)

  useEffect(() => {
  let isMounted = true

  const fetchMe = async () => {
    try {
      const res = await authApi.me()
      console.log('Fetched user:', res.data);
      if (!isMounted) return
      setUser(res.data.user)
      setCompany(res.data.company)
    } catch (err) {
      if (!isMounted) return
      setUser(null)
      setCompany(null)
      console.error('Failed to fetch user', err)
    } finally {
      if (!isMounted) return
      setLoading(false)
    }
  }

  fetchMe()

  return () => {
    isMounted = false
  }
}, [])


  const login = async (data: any) => {
    await authApi.login(data)
    const res = await authApi.me()
    setUser(res.data.user)
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, company }}>
      {children}
    </AuthContext.Provider>
  )
}
