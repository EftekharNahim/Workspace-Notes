import { useEffect, useState } from 'react'
import { noteApi } from '../api/note.api'
import { Link, useParams } from 'react-router-dom'

export default function NoteList() {
  const { id } = useParams()
  const [notes, setNotes] = useState<any[]>([])

  useEffect(() => {
    noteApi.listPrivate(Number(id)).then(res => setNotes(res.data.data))
  }, [id])

  return (
    <>
      <h3>Notes</h3>
      {notes.map(n => (
        <Link key={n.id} to={`/notes/${n.id}`}>
          {n.title}
        </Link>
      ))}
    </>
  )
}
