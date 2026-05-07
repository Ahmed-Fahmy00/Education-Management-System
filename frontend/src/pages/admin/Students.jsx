import { useState, useCallback, useEffect, useRef } from "react";
import {
  RefreshCw,
  Search,
  AlertCircle,
  GraduationCap,
  ArrowLeft,
  Mail,
  Hash,
  Building2,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle,
  Users,
  Calendar,
} from "lucide-react";
import { apiFetch, Badge, Spinner, EmptyState } from "./shared";

/* ── Shared department list (matches Courses.jsx) ───────────────────────── */
const DEPARTMENTS = [
  "Engineering Physics and Mathematics",
  "Computer and Systems Engineering",
  "Design and Production Engineering",
  "Mechanical Power Engineering",
  "Automotive Engineering",
  "Mechatronics Engineering",
  "Architectural Engineering",
];

/* ── Email validation ───────────────────────────────────────────────────── */
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

const EMPTY_STUDENT = {
  name: "",
  email: "",
  password: "",
  department: "",
  parentEmail: "",
};

function StudentModal({ initial, onClose, onSaved }) {
  const isEdit = Boolean(initial?._id);
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name || "",
          email: initial.email || "",
          password: "",
          department: initial.department || "",
          parentEmail: initial.parentEmail || "",
        }
      : EMPTY_STUDENT,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return setError("Full name is required.");
    if (!form.email.trim()) return setError("Email is required.");
    if (!isValidEmail(form.email))
      return setError("Enter a valid email address (e.g. student@domain.com).");
    if (!isEdit && !form.password.trim())
      return setError("Password is required for new students.");
    if (!isEdit && form.password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (!form.department) return setError("Department is required.");
    if (form.parentEmail.trim() && !isValidEmail(form.parentEmail))
      return setError("Parent email is not a valid email address.");

    setSaving(true);
    setError("");
    try {
      const url = isEdit ? `/api/students/${initial._id}` : "/api/students";
      const method = isEdit ? "PATCH" : "POST";

      // On create: do NOT send studentId — backend generates it automatically.
      // On edit: never overwrite studentId.
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        department: form.department,
        parentEmail: form.parentEmail.trim().toLowerCase(),
      };
      if (!isEdit) {
        payload.password = form.password;
      } else if (form.password.trim()) {
        payload.password = form.password;
      }

      const res = await apiFetch(url, {
        method,
        headers: { "x-user-role": "admin" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save student");
      onSaved(isEdit);
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
            <h3 className="modal-title">
              {isEdit ? "Edit Student" : "Add Student"}
            </h3>
            <p className="modal-subtitle">
              {isEdit
                ? `Editing ${initial.name}`
                : "Student ID will be auto-generated"}
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
            {/* Name */}
            <div className="modal-field">
              <label className="modal-label">
                Full Name <span className="modal-required">*</span>
              </label>
              <input
                className="modal-input"
                placeholder="e.g. Ahmed Hassan"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>

            {/* Student ID — read-only on edit, hidden on create */}
            {isEdit && (
              <div className="modal-field">
                <label className="modal-label">Student ID</label>
                <input
                  className="modal-input"
                  value={initial.studentId || "—"}
                  disabled
                  style={{
                    background: "var(--bg-tertiary)",
                    fontFamily: "monospace",
                    color: "var(--text-secondary)",
                    cursor: "not-allowed",
                  }}
                />
                <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                  Auto-generated — cannot be changed
                </span>
              </div>
            )}

            {/* Email */}
            <div className="modal-field">
              <label className="modal-label">
                Email <span className="modal-required">*</span>
              </label>
              <input
                className="modal-input"
                type="email"
                placeholder="student@example.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>

            {/* Department — dropdown */}
            <div className="modal-field">
              <label className="modal-label">
                Department <span className="modal-required">*</span>
              </label>
              <div className="modal-select-wrap">
                <select
                  className="modal-input modal-select"
                  value={form.department}
                  onChange={(e) => set("department", e.target.value)}
                >
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Parent email */}
            <div className="modal-field modal-field-full">
              <label className="modal-label">Parent Email</label>
              <input
                className="modal-input"
                type="email"
                placeholder="parent@example.com"
                value={form.parentEmail}
                onChange={(e) => set("parentEmail", e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="modal-field modal-field-full">
              <label className="modal-label">
                {isEdit ? "New Password" : "Password"}{" "}
                {!isEdit && <span className="modal-required">*</span>}
              </label>
              <input
                className="modal-input"
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder={
                  isEdit ? "Leave blank to keep current" : "Min 6 characters"
                }
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
              ) : isEdit ? (
                <>
                  <Pencil size={14} /> Save Changes
                </>
              ) : (
                <>
                  <Plus size={14} /> Create Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ student, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      const res = await apiFetch(`/api/students/${student._id}`, {
        method: "DELETE",
        headers: { "x-user-role": "admin" },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete student");
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
            <h3 className="modal-title">Delete Student</h3>
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
              {student.name}
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
                  <Trash2 size={14} /> Delete Student
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentDetail({ student, onBack, onEdit }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const rRes = await apiFetch(
          `/api/registrations?student=${student._id}`,
        );
        const rData = rRes.ok ? await rRes.json() : [];
        setRegistrations(Array.isArray(rData) ? rData : []);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [student._id]);

  const initials = student.name
    ? student.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <>
      {/* ── Back bar ── */}
      <div style={{ marginBottom: 24 }}>
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={14} /> Back to Students
        </button>
      </div>

      {/* ── Hero card — all info here ── */}
      <div
        className="detail-hero-card"
        style={{ marginBottom: 20, alignItems: "flex-start" }}
      >
        <div className="detail-hero-avatar" style={{ flexShrink: 0 }}>
          {initials}
        </div>
        <div className="detail-hero-info" style={{ flex: 1 }}>
          {/* Name + ID chip */}
          <div className="detail-hero-name">{student.name}</div>
          <div className="detail-hero-sub">{student.email}</div>
          <div className="detail-hero-meta" style={{ marginBottom: 14 }}>
            {student.studentId && (
              <span className="detail-hero-chip mono">
                <Hash size={12} /> {student.studentId}
              </span>
            )}
            {student.department && (
              <span className="detail-hero-chip">
                <Building2 size={12} /> {student.department}
              </span>
            )}
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
                {student.email}
              </span>
            </div>
            <div className="room-hero-detail-item">
              <span className="room-hero-detail-label">
                <Hash size={12} /> Student ID
              </span>
              <span
                className="room-hero-detail-value"
                style={{ fontFamily: "monospace", fontSize: 13 }}
              >
                {student.studentId || "—"}
              </span>
            </div>
            <div className="room-hero-detail-item">
              <span className="room-hero-detail-label">
                <Building2 size={12} /> Department
              </span>
              <span
                className="room-hero-detail-value"
                style={{ fontSize: 13, fontWeight: 500 }}
              >
                {student.department || "—"}
              </span>
            </div>
            {student.parentEmail && (
              <div className="room-hero-detail-item">
                <span className="room-hero-detail-label">
                  <Mail size={12} /> Parent Email
                </span>
                <span
                  className="room-hero-detail-value"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    wordBreak: "break-all",
                  }}
                >
                  {student.parentEmail}
                </span>
              </div>
            )}
            {(student.firstName || student.lastName) && (
              <div className="room-hero-detail-item">
                <span className="room-hero-detail-label">Full Name</span>
                <span
                  className="room-hero-detail-value"
                  style={{ fontSize: 13, fontWeight: 500 }}
                >
                  {[student.firstName, student.lastName]
                    .filter(Boolean)
                    .join(" ")}
                </span>
              </div>
            )}
            <div className="room-hero-detail-item">
              <span className="room-hero-detail-label">
                <Calendar size={12} /> Joined
              </span>
              <span
                className="room-hero-detail-value"
                style={{ fontSize: 13, fontWeight: 500 }}
              >
                {new Date(student.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          style={{ alignSelf: "flex-start" }}
          onClick={() => onEdit(student)}
        >
          <Pencil size={13} /> Edit
        </button>
      </div>

      {/* ── Registrations card — full width ── */}
      <div className="detail-card">
        <div className="detail-card-title">
          <BookOpen size={14} /> Course Registrations
          <span className="detail-card-count">{registrations.length}</span>
        </div>
        {loading ? (
          <div className="loading" style={{ padding: 32 }}>
            <Spinner size={16} /> Loading…
          </div>
        ) : registrations.length === 0 ? (
          <div className="detail-empty">
            <BookOpen size={32} />
            <p>No course registrations yet</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Semester</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>
                        {r.course?.code || "—"}
                      </span>
                      {r.course?.title && (
                        <span
                          style={{
                            color: "var(--text-secondary)",
                            marginLeft: 6,
                            fontSize: 13,
                          }}
                        >
                          {r.course.title}
                        </span>
                      )}
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {r.semester}
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.grade || "—"}</td>
                    <td>
                      <Badge
                        variant={
                          r.status === "enrolled"
                            ? "success"
                            : r.status === "completed"
                              ? "info"
                              : "danger"
                        }
                      >
                        {r.status}
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

/* ── Toast notification ─────────────────────────────────────────────────── */
function Toast({ message, type = "success", onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`students-toast students-toast-${type}`}>
      {type === "success" ? (
        <CheckCircle size={16} />
      ) : (
        <AlertCircle size={16} />
      )}
      {message}
    </div>
  );
}

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
  return <span className="student-avatar">{initials}</span>;
}

/* ── Main Students page ─────────────────────────────────────────────────── */
export default function Students({ onSubtitle }) {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [detailTarget, setDetailTarget] = useState(null);
  const [formTarget, setFormTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const debounceRef = useRef(null);

  const load = useCallback(async (q = "") => {
    setLoading(true);
    setError("");
    try {
      const url = q
        ? `/api/students?q=${encodeURIComponent(q)}`
        : "/api/students";
      const res = await apiFetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAllItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* Debounced search — fires API call 350ms after user stops typing */
  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(v), 350);
  };

  function handleSaved(isEdit) {
    load(search);
    setToast({
      message: isEdit
        ? "Student updated successfully."
        : "Student created successfully.",
      type: "success",
    });
  }

  function handleDeleted() {
    load(search);
    setToast({ message: "Student deleted.", type: "success" });
  }

  /* filtered = all items (no status filter) */
  const filtered = allItems;

  if (detailTarget) {
    onSubtitle?.(detailTarget.name);
    return (
      <StudentDetail
        student={detailTarget}
        onBack={() => {
          setDetailTarget(null);
          onSubtitle?.("");
        }}
        onEdit={(s) => {
          setDetailTarget(null);
          setFormTarget(s);
          onSubtitle?.("");
        }}
      />
    );
  }

  onSubtitle?.("");

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h2>Students</h2>
          <p>Manage student records — add, edit, search, and delete</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setFormTarget({})}
          >
            <Plus size={14} /> Add Student
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => load(search)}
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
            placeholder="Search by name, email, ID, department, or parent email…"
            value={search}
            onChange={handleSearch}
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
              onClick={() => {
                setSearch("");
                load("");
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* ── Table ── */}
      <div className="table-container">
        {loading ? (
          <div className="loading">
            <Spinner /> Loading students…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title={search ? "No students match your search" : "No students yet"}
            desc={
              search
                ? "Try a different name, email, or ID."
                : 'Click "Add Student" to create the first record.'
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Department</th>
                  <th>Parent Email</th>
                  <th>Joined</th>
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
                        <Avatar name={s.name} />
                        <div>
                          <div style={{ fontWeight: 600, lineHeight: 1.2 }}>
                            {s.name}
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
                      {s.studentId || "—"}
                    </td>
                    <td>{s.department || "—"}</td>
                    <td
                      style={{ color: "var(--text-secondary)", fontSize: 13 }}
                    >
                      {s.parentEmail || "—"}
                    </td>
                    <td
                      style={{ color: "var(--text-secondary)", fontSize: 13 }}
                    >
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="action-buttons">
                        <button
                          className="icon-btn"
                          title="Edit"
                          onClick={() => setFormTarget(s)}
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

      {/* ── Result count ── */}
      {!loading && filtered.length > 0 && (
        <p
          style={{
            fontSize: 13,
            color: "var(--text-tertiary)",
            marginTop: 12,
            textAlign: "right",
          }}
        >
          Showing {filtered.length} of {allItems.length} student
          {allItems.length !== 1 ? "s" : ""}
        </p>
      )}

      {formTarget && (
        <StudentModal
          initial={formTarget._id ? formTarget : null}
          onClose={() => setFormTarget(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          student={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}
