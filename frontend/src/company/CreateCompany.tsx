import { useState } from 'react'
import { api } from '../api/axios'
import { useNavigate } from 'react-router'
export default function CreateCompany() {
  const [form, setForm] = useState({
    companyName: '',
    companyHostname: '',
    ownerUsername: '',
    ownerEmail: '',
    ownerPassword: '',
  })
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const submit = async () => {
    try {
      await api.post('/companies', form)
      alert('Company created. Use hostname to login.')
      navigate('/login')
    } catch (err: any) {
      alert(err.response?.data?.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow space-y-4">
        <h1 className="text-xl font-bold text-center">Create Company</h1>

        <input
          className="w-full border p-2 rounded"
          name="companyName"
          placeholder="Company Name"
          onChange={handleChange}
        />

        <input
          className="w-full border p-2 rounded"
          name="companyHostname"
          placeholder="Hostname (acme.localhost)"
          onChange={handleChange}
        />

        <input
          className="w-full border p-2 rounded"
          name="ownerUsername"
          placeholder="Owner Username"
          onChange={handleChange}
        />

        <input
          className="w-full border p-2 rounded"
          name="ownerEmail"
          placeholder="Owner Email"
          onChange={handleChange}
        />

        <input
          className="w-full border p-2 rounded"
          type="password"
          name="ownerPassword"
          placeholder="Owner Password"
          onChange={handleChange}
        />

        <button
          onClick={submit}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Create Company
        </button>
      </div>
    </div>
  )
}
