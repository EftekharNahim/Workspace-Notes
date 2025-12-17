import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  ThumbsUp,
  ThumbsDown,
  Edit2,
  Trash2,
  X,
  Save,
} from "lucide-react";
import { api } from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "../context/WorkspaceContext";

type Workspace = { id: number; name: string };
type Note = {
  id: number;
  title: string;
  content: string;
  tags: { name: string }[];
  workspaceId: number;
  upvotesCount: number;
  downvotesCount: number;
  status: "draft" | "published";
  type: "public" | "private";
  createdAt: string;
  updatedAt: string;
};

export default function NotesApp() {
  const [view, setView] = useState<
    "workspace" | "public" | "private" | "create" | "edit"
  >("public");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<number | null>(
    null
  );
  const [publicNotes, setPublicNotes] = useState<Note[]>([]);
  const [privateNotes, setPrivateNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { setWorkspaceId,setWorkspaceName } = useWorkspace();
  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: "",
    type: "private" as "private" | "public",
    status: "draft" as "draft" | "published",
  });
  /* ---------------- INIT ---------------- */
  useEffect(() => {
    loadWorkspaces();
    loadPublicNotes();
  }, []);

  /* ---------------- API ---------------- */

  const loadWorkspaces = async () => {
    const res = await api.get("/workspaces");
    setWorkspaces(res.data);
    if (res.data.length) setSelectedWorkspace(res.data[0].id);
  };

  const loadPublicNotes = async () => {
    const res = await api.get("/notes/public", {
      params: { q: search },
    });
    setPublicNotes(res.data.data || res.data);
  };

  const loadPrivateNotes = async () => {
    if (!selectedWorkspace) return;
    const res = await api.get(`/notes/workspace/${selectedWorkspace}`, {
      params: { q: search },
    });
    setPrivateNotes(res.data.data || res.data);
  };

  const updateNote = async () => {
    if (!editingNote) return;
    await api.put(`/notes/${editingNote.id}`, {
      title: form.title,
      content: form.content,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      type: form.type,
      status: form.status,
    });
    reset();
    loadPrivateNotes();
    setView("private");
  };

  const deleteNote = async (id: number) => {
    if (!confirm("Delete this note?")) return;
    await api.delete(`/notes/${id}`);
    loadPrivateNotes();
  };

  const vote = async (id: number, voteType: "upvote" | "downvote") => {
    await api.post(`/notes/${id}/vote`, { voteType });
    loadPublicNotes();
  };

  /* ---------------- HELPERS ---------------- */

  const reset = () => {
    setEditingNote(null);
    setForm({
      title: "",
      content: "",
      tags: "",
      type: "private",
      status: "draft",
    });
  };

  const startEdit = (note: Note) => {
    setEditingNote(note);
    setForm({
      title: note.title,
      content: note.content,
      tags: note.tags.map((t) => t.name).join(", "),
      type: note.type,
      status: note.status,
    });
    setView("edit");
  };

  const handleCreateNote = async (n:any) => {
    try {
      setWorkspaceId(n.id);
      setWorkspaceName(n.name);
      navigate("/notes/new");
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b px-6 py-4 flex justify-between">
        <h1 className="text-xl font-bold">NotesApp</h1>
        <div className="flex gap-2">
          <button onClick={() => setView("public")} className="btn">
            Public
          </button>
          <button
            onClick={() => {
              setView("workspace");
              loadWorkspaces;
            }}
            className="btn"
          >
            Workspace
          </button>
          <button onClick={() => setView("create")} className="btn-primary">
            <Plus size={16} /> New
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {/* PUBLIC */}
        {view === "public" &&
          publicNotes.map((n) => (
            <div key={n.id} className="card">
              <h3 className="text-lg font-semibold">{n.title}</h3>
              <p>{n.content}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => vote(n.id, "upvote")} className="vote">
                  <ThumbsUp size={14} /> {n.upvotesCount}
                </button>
                <button onClick={() => vote(n.id, "downvote")} className="vote">
                  <ThumbsDown size={14} /> {n.downvotesCount}
                </button>
              </div>
            </div>
          ))}

        {/* PRIVATE */}
        {view === "private" &&
          privateNotes.map((n) => (
            <div key={n.id} className="card">
              <h3 className="text-lg font-semibold">{n.title}</h3>
              <p>{n.content}</p>
              <div className="flex gap-2">
                <button onClick={() => startEdit(n)}>
                  <Edit2 size={16} />
                </button>
                <button onClick={() => deleteNote(n.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

        {/* WORKSPACE */}
        {view === "workspace" &&
          workspaces.map((n) => (
            <div key={n.id} className="card">
              <h3 className="text-lg font-semibold">{n.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => handleCreateNote(n)}>
                  Create Note
                </button>
              </div>
            </div>
          ))}
      </main>
    </div>
  );
}
