import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function AppLayout() {
  const { logout } = useAuth()

  return (
    <>
      <nav className="container" style={{ marginBottom: 20 }}>
        <Link to="/workspaces">Workspaces</Link>
        <button style={{ float: 'right' }} onClick={logout}>
          Logout
        </button>
      </nav>

      <div className="container">
        <Outlet />
      </div>
    </>
  )
}
