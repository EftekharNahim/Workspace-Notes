import { Outlet, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import { useCompany } from "../../hooks/useCompany"

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { company } = useCompany()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout() // Ensure this is called as a function
      navigate('/login')
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  return (
    <>
      <nav className="container flex items-center justify-between py-3 border-b mb-6">
        {/* LEFT */}
        <div className="flex items-center gap-6">
          <Link to="/workspaces" className="font-semibold text-lg">
            {user && company ? company.name : "My App"}
          </Link>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {user ? (
            // Shown when Logged In
            <>
              <span className="text-sm text-gray-600 pr-2 border-r">
                {user.username}
              </span>
              <button 
                onClick={handleLogout} 
                className="text-sm font-medium text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </>
          ) : (
            // Shown when NOT Logged In
            <Link 
              to="/login" 
              className="bg-blue-200 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      <div className="container">
        <Outlet />
      </div>
    </>
  )
}