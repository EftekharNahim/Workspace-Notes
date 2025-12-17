import { useState } from "react";
import { noteApi } from "../api/note.api";
import { useWorkspace } from "../context/WorkspaceContext";
type Props = {
  workspaceId: number;
  onCreated?: () => void;
};

export default function NoteCreate({ onCreated }: Props) {
  const { workspaceId ,name} = useWorkspace();
  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: "",
    type: "private" as "private" | "public",
    status: "draft" as "draft" | "published",
  });

  if (!workspaceId) {
    return <p className="text-red-500">No workspace selected</p>;
  }
  const createNote = async () => {
    await noteApi.create({
      title: form.title,
      content: form.content,
      workspaceId,
      type: form.type,
      status: form.status,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });

    // reset form
    setForm({
      title: "",
      content: "",
      tags: "",
      type: "private",
      status: "draft",
    });

    onCreated?.();
  };

  return (
      <div className="card space-y-3">
          <h1>Create your Note on Workspace: {name }</h1>
      <input
        className="input"
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      <textarea
        className="input"
        rows={6}
        placeholder="Content"
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
      />

      <input
        className="input"
        placeholder="tags: api, backend"
        value={form.tags}
        onChange={(e) => setForm({ ...form, tags: e.target.value })}
      />

      <div className="flex gap-2">
        <select
          className="input"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as any })}
        >
          <option value="private">Private</option>
          <option value="public">Public</option>
        </select>

        <select
          className="input"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as any })}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <button onClick={createNote} className="btn-primary">
        Save
      </button>
    </div>
  );
}
