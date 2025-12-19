import { useState } from 'react'
import { workspaceApi } from '../api/workspace.api'

export default function CreateWorkspace({ onCreated }: any) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isNameValid = name.trim().length >= 2
  const isDisabled = !isNameValid || submitting

  const submit = async () => {
    if (!isNameValid || submitting) return

    try {
      setSubmitting(true)

      await workspaceApi.create({ name: name.trim() })
      onCreated?.()
      setName('')

      // keep button disabled for 2 seconds
      setTimeout(() => {
        setSubmitting(false)
      }, 2000)
    } catch (err) {
      console.error('Create workspace failed', err)
      setSubmitting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={name}
        placeholder="Workspace name"
        onChange={(e) => setName(e.target.value)}
        className="border px-2 py-1 rounded"
      />

      <button
        onClick={submit}
        disabled={isDisabled}
        className={`px-3 py-1 rounded transition
          ${isDisabled
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'}
        `}
      >
        {submitting ? 'Creating…' : 'Create'}
      </button>
    </div>
  )
}
