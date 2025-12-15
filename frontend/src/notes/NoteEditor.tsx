import { useState } from 'react'
import { noteApi } from '../api/note.api'
import { useParams } from 'react-router-dom'

export default function NoteEditor() {
  const { id } = useParams()
  const [content, setContent] = useState('')

  const save = async () => {
    await noteApi.update(Number(id), { content })
    alert('Saved')
  }

  return (
    <>
      <textarea onChange={e => setContent(e.target.value)} />
      <button onClick={save}>Save</button>
    </>
  )
}
