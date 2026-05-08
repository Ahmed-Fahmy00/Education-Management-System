import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  ThumbsUp,
  Clock,
  Loader2,
  X,
  AlertCircle
} from "lucide-react";
import { UserLayout } from "./Home";

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

export default function Forum() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [posts, setPosts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [formError, setFormError] = useState("");
  const [formSaving, setFormSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    course: ""
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [postsRes, coursesRes] = await Promise.all([
        fetch("/api/forum/posts", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }),
        fetch("/api/courses", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
      ]);
      const pData = await postsRes.json();
      const cData = await coursesRes.json();
      setPosts(Array.isArray(pData) ? pData : []);
      setCourses(Array.isArray(cData) ? cData : []);
    } catch (err) {
      setError("Failed to load forum data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setCurrentPostId(null);
    setForm({ title: "", body: "", course: "" });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (post) => {
    setIsEditMode(true);
    setCurrentPostId(post._id);
    setForm({
      title: post.title,
      body: post.body,
      course: post.course?._id || ""
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setFormError("Title is required");
    if (!form.body.trim()) return setFormError("Body is required");
    if (!form.course) return setFormError("Please select a course");

    setFormSaving(true);
    setFormError("");

    try {
      const url = isEditMode ? `/api/forum/posts/${currentPostId}` : "/api/forum/posts";
      const method = isEditMode ? "PATCH" : "POST";
      
      const payload = {
        title: form.title.trim(),
        body: form.body.trim(),
        course: form.course
      };

      if (!isEditMode) {
        payload.authorName = user.name;
        payload.authorRole = user.role;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save post");
      }

      await loadData();
      closeModal();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSaving(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      const res = await fetch(`/api/forum/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (!res.ok) throw new Error("Failed to delete post");
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpvote = async (postId) => {
    try {
      const res = await fetch(`/api/forum/posts/${postId}/upvote`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div className="home-loading">No user data</div>;

  return (
    <UserLayout user={user} onLogout={handleLogout}>
      <div className="hs-home-grid" style={{ display: "block", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: "var(--text-primary)" }}>Course Forums</h2>
          <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
            <Plus size={16} /> New Post
          </button>
        </div>

        {error && <div className="cr-alert" style={{ marginBottom: 20 }}>{error}</div>}

        {loading ? (
          <div className="hs-col-loading" style={{ height: 200 }}>
            <Loader2 size={24} className="hs-spin" /> Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="hs-col-empty" style={{ height: 300 }}>
            <MessageSquare size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
            <p>No forum posts yet. Be the first to start a discussion!</p>
          </div>
        ) : (
          <div className="hs-posts-list">
            {posts.map((p) => (
              <div key={p._id} className="hs-post-card">
                <div className="hs-post-header">
                  <div className="hs-post-author-avatar">
                    {p.authorName?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="hs-post-author" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{p.authorName}</span>
                      {p.authorName === user.name && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-secondary btn-sm" style={{ padding: "4px 8px" }} onClick={() => openEditModal(p)}>
                            <Pencil size={12} /> Edit
                          </button>
                          <button className="btn btn-danger btn-sm" style={{ padding: "4px 8px" }} onClick={() => handleDelete(p._id)}>
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="hs-post-meta">
                      <span className={`hs-author-role hs-role-${p.authorRole}`}>
                        {p.authorRole}
                      </span>
                      <span>·</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} /> {timeAgo(p.createdAt)}</span>
                      {p.course && <span>· {p.course.code}</span>}
                    </div>
                  </div>
                </div>
                <div className="hs-post-title" style={{ fontSize: 18, margin: "12px 0 8px 0" }}>{p.title}</div>
                <div className="hs-post-body" style={{ color: "var(--text-secondary)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{p.body}</div>
                <div className="hs-post-footer" style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                  <button 
                    className="hs-post-upvotes" 
                    style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", cursor: "pointer", padding: "4px 8px", borderRadius: 4, transition: "background 0.2s" }}
                    onClick={() => handleUpvote(p._id)}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-secondary)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                  >
                    <ThumbsUp size={14} /> {p.upvotes ?? 0} Upvotes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-head">
              <div>
                <h3 className="modal-title">{isEditMode ? "Edit Post" : "Create New Post"}</h3>
                <p className="modal-subtitle">Ask a question or start a discussion</p>
              </div>
              <button className="modal-close-btn" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              {formError && (
                <div className="alert alert-error" style={{ marginBottom: 16 }}>
                  <AlertCircle size={14} /> {formError}
                </div>
              )}

              <div className="modal-field">
                <label className="modal-label">Course <span className="modal-required">*</span></label>
                <div className="modal-select-wrap">
                  <select 
                    className="modal-input modal-select" 
                    value={form.course} 
                    onChange={e => setForm({...form, course: e.target.value})}
                  >
                    <option value="">Select a course...</option>
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>{c.code} - {c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label">Title <span className="modal-required">*</span></label>
                <input 
                  className="modal-input" 
                  placeholder="What is your question?" 
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  maxLength={100}
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Details <span className="modal-required">*</span></label>
                <textarea 
                  className="modal-input" 
                  placeholder="Provide more details..." 
                  value={form.body}
                  onChange={e => setForm({...form, body: e.target.value})}
                  rows={6}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className="modal-footer" style={{ marginTop: 24, borderTop: "none", paddingTop: 0 }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formSaving}>
                  {formSaving ? <><Loader2 size={14} className="spin" /> Saving...</> : isEditMode ? "Save Changes" : "Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UserLayout>
  );
}
