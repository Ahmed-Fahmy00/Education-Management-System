import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Clock, Megaphone, Loader2, RefreshCw, Trash2, Pencil } from "lucide-react";
import { UserLayout } from "./Home";
import { deleteAnnouncement } from "../api/announcements";
import AnnouncementModal from "../components/AnnouncementModal";
import "../styles/home.css";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function Announcements() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [editTarget, setEditTarget] = useState(null); // holds the announcement being edited

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const isInstructor = user?.role === "instructor";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      setAnnouncements(sorted);
    } catch {
      setError("Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    setDeletingId(id);
    try {
      await deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    } catch {
      setError("Failed to delete announcement.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) return <div className="home-loading">No user data</div>;

  return (
    <UserLayout user={user} onLogout={handleLogout}>
      {/* Page header */}
      <div className="ann-page-header">
        <div className="ann-page-title-row">
          <Megaphone size={20} />
          <h2>Announcements</h2>
        </div>
        <button className="ann-refresh-btn" onClick={load} disabled={loading}>
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Big card container */}
      <div className="ann-page-card">
        {error && (
          <div className="ann-error">
            <Bell size={14} /> {error}
          </div>
        )}

        {loading ? (
          <div className="hs-col-loading">
            <Loader2 size={22} className="hs-spin" /> Loading announcements…
          </div>
        ) : announcements.length === 0 ? (
          <div className="hs-col-empty">
            <Megaphone size={44} />
            <h3>No announcements yet</h3>
            <p>Check back later for updates from your instructors.</p>
          </div>
        ) : (
          <div className="ann-page-list">
            {announcements.map((a) => (
              <div key={a._id} className="ann-page-item">
                <div className="ann-page-item-left">
                  <div className="ann-page-dot" />
                </div>
                <div className="ann-page-item-body">
                  <div className="ann-page-item-header">
                    <span className="ann-page-item-title">{a.title}</span>
                    <div className="ann-page-item-header-right">
                      <span className="ann-page-item-time">
                        <Clock size={11} /> {timeAgo(a.createdAt)}
                      </span>
                      {isInstructor && (
                        <div className="ann-page-item-actions">
                          <button
                            className="ann-action-btn ann-edit-btn"
                            onClick={() => setEditTarget(a)}
                            title="Edit announcement"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            className="ann-action-btn ann-delete-btn"
                            onClick={() => handleDelete(a._id)}
                            disabled={deletingId === a._id}
                            title="Delete announcement"
                          >
                            {deletingId === a._id
                              ? <Loader2 size={13} className="hs-spin" />
                              : <Trash2 size={13} />
                            }
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="ann-page-item-text">{a.body}</p>
                  <div className="ann-page-item-footer">
                    <span className="ann-page-course">
                      {a.course?.code ?? "General"}
                    </span>
                    <span className="ann-page-by">
                      Professor {a.instructor?.name || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal — only mounts when an announcement is targeted */}
      {editTarget && (
        <AnnouncementModal
          mode="edit"
          isOpen={true}
          announcement={editTarget}
          courses={[]}         // pass your courses array here if available
          onSuccess={load}
          onClose={() => setEditTarget(null)}
        />
      )}
    </UserLayout>
  );
}