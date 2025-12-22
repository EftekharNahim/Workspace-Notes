import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { noteApi } from '../api/note.api'

export default function NoteView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [note, setNote] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadNote = () => {
    if (!id) return
    setLoading(true)
    noteApi.show(Number(id))
      .then(res => setNote(res.data))
      .finally(() => setLoading(false))
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
    navigate(-1) // go back to notes list
  }

  useEffect(loadNote, [id])

  if (loading) return <div>Loading note...</div>
  if (!note) return <div>Note not found.</div>

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header */}
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
            onClick={handleDelete}
            className="px-3 py-1 text-sm bg-red-100 rounded"
          >
            🗑 Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-700 mb-4 whitespace-pre-line">
        {note.content}
      </p>

      {/* Tags */}
      <div className="mb-4 flex flex-wrap gap-2">
        {note.tags?.map((t: any) => (
          <span
            key={t.id}
            className="text-xs px-2 py-1 bg-gray-200 rounded"
          >
            {t.name}
          </span>
        ))}
      </div>

      {/* Votes */}
      <div className="space-x-3 mb-4">
        <button
          onClick={() => handleVote('upvote')}
          className="px-3 py-1 bg-green-100 rounded"
        >
          👍 {note.upvotesCount || 0}
        </button>
        <button
          onClick={() => handleVote('downvote')}
          className="px-3 py-1 bg-red-100 rounded"
        >
          👎 {note.downvotesCount || 0}
        </button>
      </div>

      {/* Metadata */}
      <div className="text-sm text-gray-500">
        Status: {note.status} | Type: {note.type} | Workspace:{' '}
        {note.workspace?.name || '-'}
      </div>
    </div>
  )
}
