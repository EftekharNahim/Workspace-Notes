import { useEffect, useState } from 'react'
import { workspaceApi } from '../api/workspace.api'
import { Link } from 'react-router-dom'
import CreateWorkspace from './CreateWorkspace'

export default function WorkspaceList() {
  const [items, setItems] = useState<any[]>([])

  const load = () => {
    workspaceApi.list().then(res => setItems(res.data))
  }

  useEffect(load, [])

  return (
    <>
      <h2>Workspaces</h2>
      <CreateWorkspace onCreated={load} />

      {items.map(w => (
        <div key={w.id}>
          <Link to={`/workspaces/${w.id}/notes`}>{w.name}</Link>
        </div>
      ))}
    </>
  )
}
