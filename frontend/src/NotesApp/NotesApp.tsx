import { useEffect, useState, useCallback, use } from "react";
import { ThumbsUp, ThumbsDown, Search } from "lucide-react";
import { api } from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type RawNote = any;
type Note = {
  id: number;
  title: string;
  content: string;
  tags: { name: string }[];
  upvotesCount: number;
  downvotesCount: number;
  workspace?: { name: string };
};

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(12);
  const [meta, setMeta] = useState<any | null>(null);
  const [sort, setSort] = useState<
    "new" | "old" | "most_upvotes" | "most_downvotes"
  >("new");
  

  const navigate = useNavigate();
  const { user } = useAuth();

  // Normalize server note -> frontend Note
  const normalize = (raw: RawNote): Note => {
    return {
      id: raw.id,
      title: raw.title,
      content: raw.content,
      tags: Array.isArray(raw.tags)
        ? raw.tags.map((t: any) => ({ name: t.name ?? t }))
        : [],
      upvotesCount: raw.upvotes_count ?? raw.upvotesCount ?? raw.upvotes ?? 0,
      downvotesCount:
        raw.downvotes_count ?? raw.downvotesCount ?? raw.downvotes ?? 0,
      workspace: raw.workspace ? { name: raw.workspace.name ?? "" } : undefined,
    };
  };

  // loadNotes accepts explicit args (so it doesn't rely on stale closures)
  const loadNotes = useCallback(
    async (
      p: number,
      lim: number,
      q: string,
      s: "new" | "old" | "most_upvotes" | "most_downvotes"
    ) => {
      setLoading(true);
      try {
        const res = await api.get("/notes/public", {
          params: { page: p, limit: lim, q, sort: s },
        });

        // support both Adonis paginated { data, meta } and raw arrays
        const responseData = res.data?.data ?? res.data;
        const responseMeta = res.data?.meta ?? null;

        const normalized = Array.isArray(responseData)
          ? responseData.map(normalize)
          : [];

        setNotes(normalized);
        setMeta(responseMeta);
      } catch (err) {
        console.error("Error loading notes:", err);
        setNotes([]);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounce search — reset page to 1 when search changes
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1); // reset page
      setSearchDebounced(search);
    }, 400);

    return () => clearTimeout(t);
  }, [search]);

  // Load notes when page, limit, searchDebounced, or sort changes
  useEffect(() => {
    loadNotes(page, limit, searchDebounced, sort);
  }, [page, limit, searchDebounced, sort]);

  // Voting
  const vote = async (id: number, voteType: "upvote" | "downvote") => {
    try {
      await api.post(`/notes/${id}/vote`, { voteType });
      // refresh current page
      loadNotes(page, limit, search, sort);
    } catch (err) {
      console.error("Vote failed", err);
    }
  };

  if (!user)
    return (
      <div>
        <h2 className="text-center mt-20 text-2xl font-semibold">
          Please login to view notes.
        </h2>
      </div>
    );

  const currentPage = meta?.current_page ?? meta?.currentPage ?? page;
  const lastPage = meta?.last_page ?? meta?.lastPage ?? null;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-3">
        <h1 className="text-xl font-bold">Public Notes</h1>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => navigate("/workspaces")}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Workspaces
          </button>

          <div className="flex items-center gap-2 border rounded px-2 py-1">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search notes by title..."
              className="outline-none"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
          </div>

          <select
            value={sort}
            onChange={(e) => {
              setPage(1);
              setSort(
                (e.target.value as
                  | "new"
                  | "old"
                  | "most_upvotes"
                  | "most_downvotes") || "new"
              );
            }}
            className="border px-2 py-1 rounded"
          >
            <option value="new">Newest</option>
            <option value="old">Oldest</option>
            <option value="most_upvotes">Most Upvotes</option>
            <option value="most_downvotes">Most Downvotes</option>
          </select>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <p className="col-span-full">Loading notes...</p>}
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

            <div className="mt-3 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  vote(note.id, "upvote");
                }}
                className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded text-sm"
              >
                <ThumbsUp size={14} /> {note.upvotesCount || 0}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  vote(note.id, "downvote");
                }}
                className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded text-sm"
              >
                <ThumbsDown size={14} /> {note.downvotesCount || 0}
              </button>
            </div>

            {note.workspace?.name && (
              <div className="mt-2 text-xs text-gray-500">
                Workspace: {note.workspace.name}
              </div>
            )}
          </div>
        ))}
      </main>

      {/* Pagination */}
      <div className="max-w-5xl mx-auto p-6 flex flex-col md:flex-row justify-between items-center gap-3">
        <div>
          <label className="mr-2">Per page:</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="border px-2 py-1 rounded"
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span>
            Page {currentPage} {lastPage ? `of ${lastPage}` : ""}
          </span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={lastPage ? currentPage >= lastPage : false}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
