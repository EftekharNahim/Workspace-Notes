import { useEffect, useState } from 'react'
import { noteApi } from '../api/note.api'
import { Link, useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '../context/WorkspaceContext'
export default function NoteList() {
  const { id } = useParams()
  const [notes, setNotes] = useState<any[]>([])
  const navigate = useNavigate();
  const { workspaceId,name } = useWorkspace();

  useEffect(() => {
    noteApi.listPrivate(Number(id)).then(res => setNotes(res.data.data))
  }, [id])
  if(!workspaceId) return <div>Loading...</div>
  return (
    <>
      <h3 className="bg-blue">Notes in Worksspace : { name  }</h3>
      {notes.map(n => (
        <Link key={n.id} to={`/notes/${n.id}`}>
          {n.title}
        </Link>
      ))}
      <h4 className='text-blue-600' onClick={()=>{navigate(`/workspaces/${workspaceId}/notes/create`)} }>create new notes</h4>
    </>
  )
}
