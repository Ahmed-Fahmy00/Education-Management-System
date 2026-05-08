import { useState, useCallback, useEffect } from "react";
import {
  RefreshCw,
  AlertCircle,
  Users,
  ArrowLeft,
  Mail,
  BookOpen,
  Search,
  X,
  Hash,
  Plus,
  Calendar,
  Pencil,
  Trash2,
} from "lucide-react";
import { apiFetch, Badge, Spinner, EmptyState } from "./shared";

/* ── Avatar initials ────────────────────────────────────────────────────── */
function Avatar({ name }) {
  const initials = name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";
  return (
    <span
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background:
          "linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-cyan) 100%)",
        color: "white",
        fontSize: 13,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        letterSpacing: "0.5px",
      }}
    >
      {initials}
    </span>
  );
}

/* ── Email validation ───────────────────────────────────────────────────── */
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/* ── Add Staff Modal ────────────────────────────────────────────────────── */
const EMPTY_STAFF = {
  name: "",
  email: "",
  password: "",
  role: "instructor",
};

function StaffModal({ onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_STAFF);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.email.trim()) return setError("Email is required.");
    if (!isValidEmail(form.email))
      return setError("Enter a valid email address (e.g. name@domain.com).");
    if (!form.password.trim()) return setError("Password is required.");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters.");

    setSaving(true);
    setError("");
    try {
      const res = await apiFetch("/api/staff", {
        method: "POST",
        headers: { "x-user-role": "admin" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create staff");
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3 className="modal-title">Add Staff Member</h3>
            <p className="modal-subtitle">Staff ID will be auto-generated</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="modal-grid">
            <div className="modal-field">
              <label className="modal-label">
                Full Name <span className="modal-required">*</span>
              </label>
              <input
                className="modal-input"
                placeholder="e.g. Dr. Sara Ahmed"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>

            <div className="modal-field">
              <label className="modal-label">
                Role <span className="modal-required">*</span>
              </label>
              <div className="modal-select-wrap">
                <select
                  className="modal-input modal-select"
                  value={form.role}
                  onChange={(e) => set("role", e.target.value)}
                >
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="modal-field modal-field-full">
              <label className="modal-label">
                Email <span className="modal-required">*</span>
              </label>
              <input
                className="modal-input"
                type="email"
                placeholder="staff@example.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>

            <div className="modal-field modal-field-full">
              <label className="modal-label">
                Password <span className="modal-required">*</span>
              </label>
              <input
                className="modal-input"
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <Spinner size={14} /> Creating…
                </>
              ) : (
                <>
                  <Plus size={14} /> Add Staff Member
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StaffDetail({ member, onBack }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Fetch all courses then filter client-side — the API doesn't support
        // filtering by instructorName as a query param reliably.
        const res = await apiFetch("/api/courses");
        const data = res.ok ? await res.json() : [];
        const name = (member.name || member.fullName || "")
          .trim()
          .toLowerCase();
        const assigned = Array.isArray(data)
          ? data.filter(
              (c) =>
                c.instructorName &&
                c.instructorName.trim().toLowerCase() === name,
            )
          : [];
        setCourses(assigned);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [member.name, member.fullName]);

  const displayName = member.name || member.fullName || "—";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <>
      {/* ── Back bar ── */}
      <div style={{ marginBottom: 24 }}>
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={14} /> Back to Staff
        </button>
      </div>

      {/* ── Hero card — all info here, no separate info card ── */}
      <div
        className="detail-hero-card"
        style={{ marginBottom: 20, alignItems: "flex-start" }}
      >
        <div
          className="detail-hero-avatar"
          style={{
            background:
              "linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-cyan) 100%)",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>

        <div className="detail-hero-info" style={{ flex: 1 }}>
          {/* Name + quick badges */}
          <div className="detail-hero-name">{displayName}</div>
          <div className="detail-hero-sub">{member.email}</div>
          <div className="detail-hero-meta" style={{ marginBottom: 14 }}>
            <span className="detail-hero-chip mono">
              <Hash size={12} /> {member.staffId || "Not assigned"}
            </span>
            <Badge variant="purple">{member.role}</Badge>
          </div>

          {/* Inline detail grid */}
          <div className="room-hero-details">
            <div className="room-hero-detail-item">
              <span className="room-hero-detail-label">
                <Mail size={12} /> Email
              </span>
              <span
                className="room-hero-detail-value"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  wordBreak: "break-all",
                }}
              >
                {member.email}
              </span>
            </div>
            <div className="room-hero-detail-item">
              <span className="room-hero-detail-label">Role</span>
              <span className="room-hero-detail-value">
                <Badge variant="purple">{member.role}</Badge>
              </span>
            </div>
            <div className="room-hero-detail-item">
              <span className="room-hero-detail-label">
                <Hash size={12} /> Staff ID
              </span>
              <span
                className="room-hero-detail-value"
                style={{ fontFamily: "monospace", fontSize: 13 }}
              >
                {member.staffId || "—"}
              </span>
            </div>
            <div className="room-hero-detail-item">
              <span className="room-hero-detail-label">
                <Calendar size={12} /> Joined
              </span>
              <span
                className="room-hero-detail-value"
                style={{ fontSize: 13, fontWeight: 500 }}
              >
                {new Date(member.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Courses card — full width ── */}
      <div className="detail-card">
        <div className="detail-card-title">
          <BookOpen size={14} /> Courses Teaching
          <span className="detail-card-count">{courses.length}</span>
        </div>
        {loading ? (
          <div className="loading" style={{ padding: 32 }}>
            <Spinner size={16} /> Loading…
          </div>
        ) : courses.length === 0 ? (
          <div className="detail-empty">
            <BookOpen size={32} />
            <p>No courses assigned to this instructor</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Credits</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <code
                        style={{
                          background: "var(--bg-tertiary)",
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 12,
                        }}
                      >
                        {c.code}
                      </code>
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.title}</td>
                    <td>
                      <Badge variant={c.type === "core" ? "info" : "warning"}>
                        {c.type}
                      </Badge>
                    </td>
                    <td style={{ textAlign: "center" }}>{c.credits}</td>
                    <td>
                      <Badge variant={c.isActive ? "success" : "danger"}>
                        {c.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Edit Staff Modal ───────────────────────────────────────────────────── */
function StaffEditModal({ member, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: member.name || member.fullName || "",
    email: member.email || "",
    role: member.role || "instructor",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.email.trim()) return setError("Email is required.");
    if (!isValidEmail(form.email))
      return setError("Enter a valid email address.");

    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
      };
      if (form.password.trim()) {
        if (form.password.length < 6) {
          setSaving(false);
          return setError("Password must be at least 6 characters.");
        }
        payload.password = form.password;
      }
      const res = await apiFetch(`/api/staff/${member._id}`, {
        method: "PATCH",
        headers: { "x-user-role": "admin" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update staff");
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3 className="modal-title">Edit Staff Member</h3>
            <p className="modal-subtitle">
              Editing {member.name || member.fullName}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <div className="modal-grid">
            <div className="modal-field">
              <label className="modal-label">
                Full Name <span className="modal-required">*</span>
              </label>
              <input
                className="modal-input"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label className="modal-label">
                Role <span className="modal-required">*</span>
              </label>
              <div className="modal-select-wrap">
                <select
                  className="modal-input modal-select"
                  value={form.role}
                  onChange={(e) => set("role", e.target.value)}
                >
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="modal-field modal-field-full">
              <label className="modal-label">
                Email <span className="modal-required">*</span>
              </label>
              <input
                className="modal-input"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div className="modal-field modal-field-full">
              <label className="modal-label">New Password</label>
              <input
                className="modal-input"
                type="password"
                placeholder="Leave blank to keep current"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <Spinner size={14} /> Saving…
                </>
              ) : (
                <>
                  <Pencil size={14} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Delete Staff Confirm ───────────────────────────────────────────────── */
function StaffDeleteConfirm({ member, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      const res = await apiFetch(`/api/staff/${member._id}`, {
        method: "DELETE",
        headers: { "x-user-role": "admin" },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete");
      }
      onDeleted();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h3 className="modal-title">Delete Staff Member</h3>
            <p className="modal-subtitle">This action cannot be undone</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <p
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              marginBottom: 20,
            }}
          >
            Are you sure you want to delete{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {member.name || member.fullName}
            </strong>
            ?
          </p>
          <div
            className="modal-footer"
            style={{ borderTop: "none", paddingTop: 0, marginTop: 0 }}
          >
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Spinner size={14} /> Deleting…
                </>
              ) : (
                <>
                  <Trash2 size={14} /> Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Staff({ onSubtitle }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/staff");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (s.name || s.fullName || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.role || "").toLowerCase().includes(q) ||
      (s.department || "").toLowerCase().includes(q) ||
      (s.staffId || "").toLowerCase().includes(q)
    );
  });

  if (detailTarget) {
    onSubtitle?.(detailTarget.name || detailTarget.fullName || "");
    return (
      <StaffDetail
        member={detailTarget}
        onBack={() => {
          setDetailTarget(null);
          onSubtitle?.("");
        }}
      />
    );
  }

  onSubtitle?.("");

  return (
    <>
      {addOpen && (
        <StaffModal
          onClose={() => setAddOpen(false)}
          onSaved={() => {
            load();
            setAddOpen(false);
          }}
        />
      )}
      {editTarget && (
        <StaffEditModal
          member={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            load();
            setEditTarget(null);
          }}
        />
      )}
      {deleteTarget && (
        <StaffDeleteConfirm
          member={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            load();
            setDeleteTarget(null);
          }}
        />
      )}

      <div className="page-header">
        <div>
          <h2>Staff</h2>
          <p>Instructors and staff members</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setAddOpen(true)}
          >
            <Plus size={14} /> Add Staff
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={load}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={15} />
          <input
            placeholder="Search by name, email, role, department, or staff ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-tertiary)",
                display: "flex",
                padding: 0,
              }}
              onClick={() => setSearch("")}
            >
              <X size={14} />
            </button>
          )}
        </div>
        {!loading && search && (
          <span
            style={{
              fontSize: 13,
              color: "var(--text-tertiary)",
              marginLeft: "auto",
            }}
          >
            {filtered.length} of {items.length} member
            {items.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <div className="loading">
            <Spinner /> Loading staff…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={
              search ? "No staff match your search" : "No staff members yet"
            }
            desc={
              search
                ? "Try a different name, email, or role."
                : 'Click "Add Staff" to create the first record.'
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Staff ID</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s._id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setDetailTarget(s)}
                  >
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <Avatar name={s.name || s.fullName} />
                        <div>
                          <div style={{ fontWeight: 600, lineHeight: 1.2 }}>
                            {s.name || s.fullName}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--text-secondary)",
                            }}
                          >
                            {s.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        color: "var(--text-secondary)",
                        fontFamily: "monospace",
                        fontSize: 13,
                      }}
                    >
                      {s.staffId || "—"}
                    </td>
                    <td>
                      <Badge variant="purple">{s.role}</Badge>
                    </td>
                    <td>{s.department || "—"}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="action-buttons">
                        <button
                          className="icon-btn"
                          title="Edit"
                          onClick={() => setEditTarget(s)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="icon-btn danger"
                          title="Delete"
                          onClick={() => setDeleteTarget(s)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
