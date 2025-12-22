import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { noteApi } from '../api/note.api'

export default function NoteEditor() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    noteApi.show(Number(id)).then(res => {
      setTitle(res.data.title)
      setContent(res.data.content)
      setLoading(false)
    })
  }, [id])

  const save = async () => {
    if (!id) return
    await noteApi.update(Number(id), { title, content })
    navigate(`/notes/${id}`)
  }

  if (loading) return <div>Loading editor...</div>

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-3">
      <h2 className="text-xl font-semibold">Edit Note</h2>

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full border p-2 rounded"
        placeholder="Title"
      />

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={10}
        className="w-full border p-2 rounded"
        placeholder="Content"
      />

      <div className="flex gap-2">
        <button
          onClick={save}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Save
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
