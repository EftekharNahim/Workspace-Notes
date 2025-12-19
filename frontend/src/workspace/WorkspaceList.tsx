import { useEffect, useState, useCallback } from 'react'
import { workspaceApi } from '../api/workspace.api'
import { useNavigate } from 'react-router-dom'
import CreateWorkspace from './CreateWorkspace'
import { useWorkspace } from '../context/WorkspaceContext'

export default function WorkspaceList() {
  const [items, setItems] = useState<any[]>([])
  const [meta, setMeta] = useState<any | null>(null)
  const [page, setPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(10)
  const [loading, setLoading] = useState<boolean>(false)
  const { setWorkspaceId, setWorkspaceName } = useWorkspace()
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await workspaceApi.list(page, limit)
      // IMPORTANT: paginator shape is { meta, data }
      setItems(Array.isArray(res.data?.data) ? res.data.data : [])
      setMeta(res.data?.meta ?? null)
    } catch (err) {
      console.error('Failed to load workspaces', err)
      setItems([])
      setMeta(null)
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    load()
  }, [load])

  const handleWorkspaceClick = (id: any, name: string) => {
    setWorkspaceId(id)
    setWorkspaceName(name)
    navigate(`/workspaces/${id}/notes`)
  }

  const handleCreated = () => {
    // reload current page after creating a workspace
    load()
  }

  const prevDisabled = !meta || (meta.current_page ?? meta.currentPage ?? page) <= 1
  const nextDisabled = !meta || (meta.current_page ?? meta.currentPage ?? page) >= (meta.last_page ?? meta.lastPage ?? page)

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2>Workspaces</h2>
        <div>
          <button onClick={() => navigate('/notes-app')}>Dashboard</button>
        </div>
      </div>

      <CreateWorkspace onCreated={handleCreated} />

      <div className="my-4">
        <label>
          Items per page:&nbsp;
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : items.length === 0 ? (
        <div>No workspaces</div>
      ) : (
        items.map(w => (
          <div key={w.id} className="py-1">
            <button
              onClick={() => handleWorkspaceClick(w.id, w.name)}
              style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
            >
              {w.name}
            </button>
          </div>
        ))
      )}

      {/* Pagination controls */}
      <div className="mt-4 flex items-center gap-2">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={prevDisabled}>
          Prev
        </button>

        <span>
          Page {meta?.currentPage ?? page} {meta ? `of ${meta.lastPage}` : ''}
        </span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={nextDisabled}
        >
          Next
        </button>
      </div>
    </>
  )
}
