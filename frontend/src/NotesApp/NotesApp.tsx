import { useEffect, useState } from "react"
import { ThumbsUp, ThumbsDown, Search } from "lucide-react"
import { api } from "../api/axios"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
type Note = {
  id: number
  title: string
  content: string
  tags: { name: string }[]
  upvotesCount: number
  downvotesCount: number
  workspace?: { name: string }
}

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  /* ---------------- LOAD PUBLIC NOTES ---------------- */
  const loadNotes = async (query = "") => {
    setLoading(true)
    try {
      const res = await api.get("/notes/public", { params: { q: query } })
      setNotes(res.data.data || res.data)
    } catch (err) {
      console.error("Error loading notes:", err)
      setNotes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotes(search)
  }, [search])

  /* ---------------- VOTE ---------------- */
  const vote = async (id: number, voteType: "upvote" | "downvote") => {
    await api.post(`/notes/${id}/vote`, { voteType })
    loadNotes(search)
  }
  if (!user) return (
    <div>
      <h2 className="text-center mt-20 text-2xl font-semibold">Please login to view notes.</h2>
    </div>
  )
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Public Notes</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/workspaces")}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Workspaces
          </button>

          <Search size={18} />
          <input
            type="text"
            placeholder="Search notes..."
            className="border px-2 py-1 rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <p>Loading notes...</p>}
        {!loading && notes.length === 0 && (
          <p className="text-gray-500 col-span-full">No notes found.</p>
        )}

        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-white shadow p-4 rounded cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate(`/notes/${note.id}`)}
          >
            <h3 className="text-lg font-semibold">{note.title}</h3>
            <p className="text-gray-700 mt-1 line-clamp-3">{note.content}</p>

            {/* Tags */}
            <div className="mt-2 flex flex-wrap gap-1">
              {note.tags?.map((t) => (
                <span
                  key={t.name}
                  className="text-xs bg-gray-200 px-2 py-1 rounded"
                >
                  {t.name}
                </span>
              ))}
            </div>

            {/* Votes */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  vote(note.id, "upvote")
                }}
                className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded text-sm"
              >
                <ThumbsUp size={14} /> {note.upvotesCount || 0}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  vote(note.id, "downvote")
                }}
                className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded text-sm"
              >
                <ThumbsDown size={14} /> {note.downvotesCount || 0}
              </button>
            </div>

            {/* Workspace info */}
            {note.workspace?.name && (
              <div className="mt-2 text-xs text-gray-500">
                Workspace: {note.workspace.name}
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  )
}
