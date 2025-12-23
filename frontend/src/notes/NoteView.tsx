// src/notes/NoteView.tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { noteApi } from '../api/note.api'

export default function NoteView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [note, setNote] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyEntries, setHistoryEntries] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [restoring, setRestoring] = useState(false)

  const loadNote = () => {
    if (!id) return
    setLoading(true)
    noteApi.show(Number(id))
      .then(res => setNote(res.data))
      .finally(() => setLoading(false))
  }

  const openHistory = async () => {
    if (!id) return
    setHistoryOpen(true)
    setHistoryLoading(true)
    try {
      const res = await noteApi.getHistory(Number(id))
      // expecting res.data = array ordered newest->oldest
      setHistoryEntries(res.data)
    } catch (err) {
      console.error('Failed to load history', err)
      setHistoryEntries([])
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleRestore = async (historyId: number) => {
    if (!confirm('Restore this history entry? This will overwrite current note content.')) return
    setRestoring(true)
    try {
      await noteApi.restoreHistory(historyId)
      // reload note & history
      await loadNote()
      await openHistory()
      alert('Restored successfully')
      setHistoryOpen(false)
    } catch (err) {
      console.error('Restore failed', err)
      alert('Restore failed')
    } finally {
      setRestoring(false)
    }
  }

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!note) return
    await noteApi.vote(note.id, voteType)
    loadNote()
  }

  const handleDelete = async () => {
    if (!note) return
    if (!confirm('Delete this note?')) return
    await noteApi.remove(note.id)
    navigate(-1)
  }

  useEffect(loadNote, [id])

  if (loading) return <div>Loading note...</div>
  if (!note) return <div>Note not found.</div>

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold">{note.title}</h2>

        <div className="space-x-2">
          <button
            onClick={() => navigate(`/notes/${note.id}/edit`)}
            className="px-3 py-1 text-sm bg-blue-100 rounded"
          >
            ✏️ Edit
          </button>

          <button
            onClick={openHistory}
            className="px-3 py-1 text-sm bg-indigo-100 rounded"
          >
            🕘 History
          </button>

          <button
            onClick={handleDelete}
            className="px-3 py-1 text-sm bg-red-100 rounded"
          >
            🗑 Delete
          </button>
        </div>
      </div>

      <p className="text-gray-700 mb-4 whitespace-pre-line">
        {note.content}
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {note.tags?.map((t: any) => (
          <span key={t.id} className="text-xs px-2 py-1 bg-gray-200 rounded">
            {t.name}
          </span>
        ))}
      </div>

      <div className="space-x-3 mb-4">
        <button onClick={() => handleVote('upvote')} className="px-3 py-1 bg-green-100 rounded">
          👍 {note.upvotesCount || 0}
        </button>
        <button onClick={() => handleVote('downvote')} className="px-3 py-1 bg-red-100 rounded">
          👎 {note.downvotesCount || 0}
        </button>
      </div>

      <div className="text-sm text-gray-500">
        Status: {note.status} | Type: {note.type} | Workspace: {note.workspace?.name || '-'}
      </div>

      {/* History modal (simple inline drawer) */}
      {historyOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-6 z-50">
          <div className="w-full max-w-2xl bg-white rounded shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">History</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-gray-100 rounded" onClick={() => { setHistoryOpen(false) }}>
                  Close
                </button>
              </div>
            </div>

            {historyLoading ? (
              <div>Loading history...</div>
            ) : historyEntries.length === 0 ? (
              <div className="text-sm text-gray-500">No history available</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-auto">
                {historyEntries.map((h: any) => (
                  <div key={h.id} className="border p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium">{h.title}</div>
                        <div className="text-xs text-gray-500">
                          By {h.user?.username || 'Unknown'} — {new Date(h.createdAt || h.created_at || h.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <button
                          className="px-2 py-1 text-sm bg-blue-600 text-white rounded"
                          onClick={() => handleRestore(h.id)}
                          disabled={restoring}
                        >
                          Restore
                        </button>
                      </div>
                    </div>

                    <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{h.content}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
