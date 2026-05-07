import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Clock, Megaphone, Loader2, RefreshCw } from "lucide-react";
import { UserLayout } from "./Home";
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

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

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
        ? [...data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          )
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
                    <span className="ann-page-item-time">
                      <Clock size={11} /> {timeAgo(a.createdAt)}
                    </span>
                  </div>
                  <p className="ann-page-item-text">{a.body}</p>
                  <div className="ann-page-item-footer">
                    <span className="ann-page-course">
                      {a.course?.code ?? "General"}
                    </span>
                    <span className="ann-page-by">Professor {a.instructor?.name || "Unknown"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
