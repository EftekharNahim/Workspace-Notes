import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const navigate = useNavigate()

  const submit = async () => {
    await login(form)
    navigate('/notes-app')
  }

  return (
    <>
    <div className="form">
      <h2>Login</h2>

      <input
        placeholder="Email"
        onChange={e => setForm({ ...form, email: e.target.value })}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={e => setForm({ ...form, password: e.target.value })}
      />

      <button onClick={submit}>Login</button>
      </div>
      <h3>Not yet register? <Link to='/register'>Register now</Link></h3>
    </>
  )
}
