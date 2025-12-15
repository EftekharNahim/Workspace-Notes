import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="container">
      <h1 className="center">Welcome</h1>
      <Outlet />
    </div>
  )
}
