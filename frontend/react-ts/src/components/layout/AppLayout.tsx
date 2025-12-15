import { Outlet } from 'react-router'

export default function AppLayout() {
  return (
    <div className="app-layout">
      <header>Workspace App</header>
      <Outlet />
    </div>
  )
}
