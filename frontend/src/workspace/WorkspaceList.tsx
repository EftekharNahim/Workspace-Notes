import { useEffect, useState } from 'react'
import { workspaceApi } from '../api/workspace.api'
import { useNavigate } from 'react-router-dom' // Import useNavigate
import CreateWorkspace from './CreateWorkspace'
import { useWorkspace } from '../context/WorkspaceContext'

export default function WorkspaceList() {
  const [items, setItems] = useState<any[]>([])
  const { setWorkspaceId, setWorkspaceName } = useWorkspace();
  const navigate = useNavigate();

  const load = () => {
    workspaceApi.list().then(res => setItems(res.data))
  }

  useEffect(load, [])

  const handleWorkspaceClick = (id: any, name: string) => {
    setWorkspaceId(id);
    setWorkspaceName(name);
    // Navigation happens after state is set
    navigate(`/workspaces/${id}/notes`);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2>Workspaces</h2>
        <button onClick={()=>navigate('/notes-app')}>Dashboard</button>
      </div>
      <CreateWorkspace onCreated={load} />

      {items.map(w => (
        <div key={w.id}>
          {/* Use a button styled like a link or an onClick handler */}
          <button 
            onClick={() => handleWorkspaceClick(w.id, w.name)}
            style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
          >
            {w.name}
          </button>
        </div>
      ))}
    </>
  )
}
