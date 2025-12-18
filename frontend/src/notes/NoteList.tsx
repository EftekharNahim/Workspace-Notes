import { useEffect, useState } from "react";
import { noteApi } from "../api/note.api";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useWorkspace } from "../context/WorkspaceContext";

export default function NoteList() {
  const { workspaceId } = useParams();
  const [notes, setNotes] = useState<any[]>([]);
  const navigate = useNavigate();
  const { name } = useWorkspace();
 console.log("Workspace ID in NoteList:", workspaceId);
  useEffect(() => {
    if (!workspaceId) return;

    noteApi
      .listPrivate(Number(workspaceId))
      .then((res) => {
        console.log("Notes API response:", res);
        setNotes(res.data.data);
      })
      .catch((err) => {
        console.error("Notes API error:", err);
        setNotes([]);
      });
  }, [workspaceId]);

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-3">
        Notes in Workspace: {name || "..."}
      </h3>

      {notes.length === 0 && (
        <p className="text-sm text-gray-500">No notes found.</p>
      )}

      <ul className="space-y-2">
        {notes.map((n) => (
          <li key={n.id}>
            <Link
              className="text-blue-600 hover:underline"
              to={`/notes/${n.id}`}
            >
              {n.title}
            </Link>
          </li>
        ))}
      </ul>

      <button
        className="mt-4 text-sm text-blue-600"
        onClick={() => navigate(`/workspaces/${workspaceId}/notes/create`)}
      >
        + Create new note
      </button>
    </div>
  );
}
