import { Outlet, Link } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import { useCompany } from "../../hooks/useCompany"
import { useNavigate } from "react-router-dom"
export default function AppLayout() {
  const { user, logout } = useAuth()
  const { company } = useCompany()
  const navigate = useNavigate()
  const handleLogout = async () => {
    try {
      await logout
      alert("Logged out successfully")
    }
    catch (error) {
      console.error("Logout failed", error)
    }
    finally {
      navigate('/login')
    }
  }

  return (
    <>
      <nav className="container flex items-center justify-between py-3 border-b mb-6">
        {/* LEFT */}
        <div className="flex items-center gap-6">
          <Link to="/workspaces" className="font-semibold text-lg">
            {company ? company.name : "Loading..."}
          </Link>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-600 pr-4">
              {user.username}
            </span>
          )}
          <button onClick={handleLogout} className="btn">
            Logout
          </button>
        </div>
      </nav>

      <div className="container">
        <Outlet />
      </div>
    </>
  )
}
