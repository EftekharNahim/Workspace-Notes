import { createBrowserRouter } from 'react-router'
import AppLayout from '../components/layout/AppLayout'
import AuthLayout from '../components/layout/AuthLayout'

import Login from '../auth/Login'
import Register from '@/auth/Register'
import CreateCompany from '@/company/CreateCompany'
import WorkspaceList from '@/workspace/WorkspaceList'
import NoteList from '@/notes/NoteList'
import NoteEditor from '@/notes/NoteEditor'
import NoteView from '@/notes/NoteView'

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
      { path: '/workspaces', element: <WorkspaceList /> },
      { path: '/workspaces/:id/notes', element: <NoteList /> },
      { path: '/notes/:id', element: <NoteView /> },
      { path: '/notes/:id/edit', element: <NoteEditor /> },
    ],
  },
])
