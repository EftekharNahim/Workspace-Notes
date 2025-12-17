import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { CompanyProvider } from '../context/CompanyContext'
import { WorkspaceProvider } from '../context/WorkspaceContext'

import AppLayout from '../components/layout/AppLayout'
import AuthLayout from '../components/layout/AuthLayout'

import Login from '../auth/Login'
import Register from '../auth/Register'
import CreateCompany from '../company/CreateCompany'
import WorkspaceList from '../workspace/WorkspaceList'
import NoteList from '../notes/NoteList'
import NoteEditor from '../notes/NoteEditor'
import NoteView from '../notes/NoteView'
import NotesApp from '../NotesApp/NotesApp'
import NoteCreate from '../notes/NoteCreate'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <CreateCompany />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/notes-app', element: <NotesApp /> },
      { path: '/workspaces', element: <WorkspaceList /> },
      { path: '/workspaces/:id/notes', element: <NoteList /> },
      { path: '/notes/:id', element: <NoteView /> },
      { path: '/notes/:id/edit', element: <NoteEditor /> },
      { path: '/workspaces/:id/notes/create', element: <NoteCreate /> },
    ],
  },
])


export default function AppContainer() {
  return (
    <AuthProvider>
      <CompanyProvider>
      <WorkspaceProvider>
          <RouterProvider router={router} />
      </WorkspaceProvider>
      </CompanyProvider>
    </AuthProvider>
  )
}