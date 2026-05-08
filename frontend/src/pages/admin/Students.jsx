import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  FileText,
  Printer,
} from "lucide-react";
import { apiFetch, Badge, Spinner, EmptyState } from "./shared";
import TranscriptDocument from "./TranscriptDocument";

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
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [rData, tData] = await Promise.allSettled([
          apiFetch(`/api/registrations?student=${student._id}`).then(res => res.json()),
          apiFetch(`/api/transcripts/${student._id}`).then(res => res.json()),
        ]);

        setRegistrations(
          rData.status === "fulfilled" && Array.isArray(rData.value)
            ? rData.value
            : [],
        );
        setTranscript(tData.status === "fulfilled" ? tData.value : null);
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
  const handleGenerateTranscript = async () => {
    setGenerating(true);
    try {
      const res = await apiFetch(
        `/api/transcripts/${student._id}/generate`,
        {
          method: "POST",
        },
      );
      const updatedTranscript = await res.json();
      setTranscript(updatedTranscript);
    } catch (err) {
      console.error("Failed to generate transcript", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={onBack}>
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <h2 style={{ marginBottom: 2 }}>{student.name}</h2>
            <p>{student.email}</p>
          </div>
        </div>
        <Badge variant={student.isActive ? "success" : "danger"}>
          {student.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="detail-grid-layout">
        {/* Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="detail-card">
            <div className="detail-card-title">Student Information</div>
            <div className="detail-rows">
              <div className="detail-row">
                <span className="detail-label">
                  <Hash size={13} /> Student ID
                </span>
                <span className="detail-value">{student.studentId || "—"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">
                  <Mail size={13} /> Email
                </span>
                <span className="detail-value">{student.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">
                  <Building2 size={13} /> Department
                </span>
                <span className="detail-value">
                  {student.department || "—"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Role</span>
                <span className="detail-value">
                  <Badge variant="info">student</Badge>
                </span>
              </div>
              {student.parentEmail && (
                <div className="detail-row">
                  <span className="detail-label">Parent Email</span>
                  <span className="detail-value">{student.parentEmail}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Joined</span>
                <span className="detail-value">
                  {new Date(student.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* CGPA */}
          <div className="detail-card">
            <div
              className="detail-card-title"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Academic Summary</span>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleGenerateTranscript}
                disabled={generating}
              >
                {generating ? <Spinner size={12} /> : <FileText size={14} />}
                {transcript ? "Update Transcript" : "Generate Transcript"}
              </button>
            </div>
            {transcript ? (
              <div className="detail-rows">
                <div className="detail-row">
                  <span className="detail-label">CGPA</span>
                  <span
                    className="detail-value"
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "var(--accent-primary)",
                    }}
                  >
                    {transcript.cgpa?.toFixed(2) ?? "—"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Courses Completed</span>
                  <span className="detail-value">
                    {transcript.records?.length ?? 0}
                  </span>
                </div>
                <div style={{ marginTop: 16 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowTranscriptModal(true)}
                  >
                    <FileText size={14} /> View Transcript Document
                  </button>
                </div>
              </div>
            ) : (
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-tertiary)",
                  padding: "12px 0",
                }}
              >
                No transcript generated yet.
              </p>
            )}
          </div>
        </div>

        {/* Registrations */}
        <div className="detail-card">
          <div className="detail-card-title">
            <BookOpen size={15} /> Course Registrations ({registrations.length})
          </div>
          {loading ? (
            <div className="loading" style={{ padding: 24 }}>
              <Spinner size={16} /> Loading…
            </div>
          ) : registrations.length === 0 ? (
            <p
              style={{
                fontSize: 13,
                color: "var(--text-tertiary)",
                padding: "12px 0",
              }}
            >
              No registrations found.
            </p>
          ) : (
            <div
              className="table-container"
              style={{ boxShadow: "none", border: "none" }}
            >
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
                      <td style={{ fontWeight: 600 }}>
                        {r.course?.code || "—"}{" "}
                        <span
                          style={{
                            fontWeight: 400,
                            color: "var(--text-secondary)",
                          }}
                        >
                          {r.course?.title}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {r.semester}
                      </td>
                      <td>{r.grade || "—"}</td>
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
      </div>

      {showTranscriptModal && (
        <div
          className="modal-backdrop"
          style={{ display: "flex", flexDirection: "column", padding: "40px" }}
        >
          <div
            className="modal-content"
            style={{
              maxWidth: "900px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 0,
            }}
          >
            <div
              style={{
                padding: "16px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "var(--bg-secondary)",
                position: "sticky",
                top: 0,
                zIndex: 10,
              }}
            >
              <h3 style={{ margin: 0 }}>Transcript Preview</h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => window.print()}
                >
                  <Printer size={14} /> Print / Save PDF
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowTranscriptModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
            <div
              id="print-area"
              style={{
                padding: "40px",
                backgroundColor: "#e5e7eb",
                minHeight: "800px",
              }}
            >
              <TranscriptDocument transcript={transcript} student={student} />
            </div>
          </div>
        </div>
      )}
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
  const navigate = useNavigate();
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

  useEffect(() => {
    onSubtitle?.(detailTarget ? detailTarget.name : "");
  }, [detailTarget, onSubtitle]);

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
                    onClick={() => navigate(`/profile/student/${s._id}`)}
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
