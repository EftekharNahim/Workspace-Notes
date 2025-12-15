import { useState } from 'react'
import { api } from '../api/axios'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const navigate = useNavigate()

  const submit = async () => {
    await api.post('/register', form)
    navigate('/login')
  }

  return (
    <>
      <input placeholder="Username" onChange={e => setForm({...form, username:e.target.value})} />
      <input placeholder="Email" onChange={e => setForm({...form, email:e.target.value})} />
      <input type="password" placeholder="Password" onChange={e => setForm({...form, password:e.target.value})} />
      <button onClick={submit}>Register</button>
    </>
  )
}
