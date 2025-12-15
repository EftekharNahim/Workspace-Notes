import { useState } from 'react'
import { workspaceApi } from '../api/workspace.api'

export default function CreateWorkspace({ onCreated }: any) {
  const [name, setName] = useState('')

  const submit = async () => {
    await workspaceApi.create({ name })
    onCreated()
  }

  return (
    <>
      <input placeholder="Workspace name" onChange={e => setName(e.target.value)} />
      <button onClick={submit}>Create</button>
    </>
  )
}
