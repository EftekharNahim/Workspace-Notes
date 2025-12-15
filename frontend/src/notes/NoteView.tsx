import { useEffect, useState } from 'react'
import { noteApi } from '../api/note.api'
import { useParams } from 'react-router-dom'

export default function NoteView() {
  const { id } = useParams()
  const [note, setNote] = useState<any>(null)

  useEffect(() => {
    noteApi.show(Number(id)).then(res => setNote(res.data))
  }, [id])

  if (!note) return null

  return (
    <>
      <h2>{note.title}</h2>
      <p>{note.content}</p>
    </>
  )
}
