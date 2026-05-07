import { useState, useCallback, useEffect, useRef } from "react";
import {
  RefreshCw,
  Plus,
  AlertCircle,
  BookOpen,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  ChevronDown,
  Users,
  BarChart2,
  ArrowLeft,
} from "lucide-react";
import { apiFetch, Badge, Spinner, EmptyState } from "./shared";

/* ── Static data ──────────────────────────────────────────────────────────── */
const DEPARTMENTS = [
  { label: "All Departments", prefix: "GEN" },
  { label: "Engineering Physics and Mathematics", prefix: "PHM" },
  { label: "Computer and Systems Engineering", prefix: "CSE" },
  { label: "Design and Production Engineering", prefix: "MDP" },
  { label: "Mechanical Power Engineering", prefix: "MEP" },
  { label: "Automotive Engineering", prefix: "MEA" },
  { label: "Mechatronics Engineering", prefix: "MCT" },
  { label: "Architectural Engineering", prefix: "ARC" },
];

// Given a department label and the existing courses list, suggest the next code
// e.g. CSE-001, CSE-002 …
function suggestCode(departmentLabel, existingCourses) {
  const dept = DEPARTMENTS.find((d) => d.label === departmentLabel);
  if (!dept) return "";
  const prefix = dept.prefix;
  const existing = existingCourses
    .map((c) => c.code)
    .filter((code) => code.startsWith(prefix + "-"))
    .map((code) => parseInt(code.split("-")[1], 10))
    .filter((n) => !isNaN(n));
  const next = existing.length ? Math.max(...existing) + 1 : 1;
  return `${prefix}-${String(next).padStart(3, "0")}`;
}

const GRADE_COLORS = {
  "A+": "#10b981",
  A: "#10b981",
  "A-": "#34d399",
  "B+": "#3b82f6",
  B: "#3b82f6",
  "B-": "#60a5fa",
  "C+": "#f59e0b",
  C: "#f59e0b",
  "C-": "#fbbf24",
  "D+": "#f97316",
  D: "#f97316",
  F: "#ef4444",
};

/* ── Instructor search input ──────────────────────────────────────────────── */
function InstructorSearch({ value, onChange, staffList = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = (staffList || []).filter(
    (s) =>
      s &&
      s.role === "instructor" &&
      s.name &&
      s.name.toLowerCase().includes(value.toLowerCase()),
  );

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="instructor-search" ref={ref}>
      <input
        className="modal-input"
        placeholder="Search instructors…"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className="instructor-dropdown">
          {filtered.map((s) => (
            <li
              key={s._id}
              className="instructor-option"
              onMouseDown={() => {
                onChange(s.name);
                setOpen(false);
              }}
            >
              <span className="instructor-option-name">{s.name}</span>
              <span className="instructor-option-dept">
                {s.department || s.role}
              </span>
            </li>
          ))}
        </ul>
      )}
      {open && value && filtered.length === 0 && (
        <ul className="instructor-dropdown">
          <li className="instructor-option-empty">
            No instructors found — you can still type a name
          </li>
        </ul>
      )}
    </div>
  );
}

/* ── Validation ───────────────────────────────────────────────────────────── */
function validate(form) {
  if (!form.code.trim()) return "Course code is required.";
  if (!form.title.trim()) return "Title is required.";
  if (!form.department.trim()) return "Department is required.";
  const cr = Number(form.credits);
  if (isNaN(cr) || cr < 0 || cr > 4)
    return "Credit hours must be between 0 and 4.";
  if (Number(form.capacity) < 1) return "Capacity must be at least 1.";
  return null;
}

/* ── Prerequisites select ────────────────────────────────────────────────── */
function PrerequisitesSelect({
  selected = [],
  onChange,
  availableCourses = [],
  currentCourseId,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  // Filter out current course and already selected ones
  const baseOptions = (availableCourses || []).filter(
    (c) => c._id !== currentCourseId && !selected.includes(c._id),
  );

  // Further filter by search term (code or title)
  const filtered = baseOptions.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="prerequisites-select" ref={ref}>
      <div className="modal-label">Prerequisites (Optional)</div>
      <div
        className="prerequisites-tags"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "8px",
          minHeight: "32px",
        }}
      >
        {selected.map((courseId) => {
          const course = availableCourses.find((c) => c._id === courseId);
          return (
            <div
              key={courseId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                backgroundColor: "var(--primary-light)",
                color: "var(--primary)",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "500",
              }}
            >
              <span>{course?.code}</span>
              <button
                type="button"
                onClick={() =>
                  onChange(selected.filter((id) => id !== courseId))
                }
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  padding: "0",
                }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
      <input
        type="text"
        className="modal-input"
        placeholder="Search courses by code or title…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul
          className="instructor-dropdown"
          style={{ maxHeight: "200px", overflowY: "auto" }}
        >
          {filtered.map((course) => (
            <li
              key={course._id}
              className="instructor-option"
              onMouseDown={() => {
                onChange([...selected, course._id]);
                setSearch("");
              }}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <input
                type="checkbox"
                checked={selected.includes(course._id)}
                readOnly
                style={{ cursor: "pointer" }}
              />
              <div>
                <span className="instructor-option-name">{course.code}</span>
                <span className="instructor-option-dept">{course.title}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {open && search && filtered.length === 0 && (
        <ul className="instructor-dropdown">
          <li className="instructor-option-empty">
            No courses found matching "{search}"
          </li>
        </ul>
      )}
    </div>
  );
}

/* ── Course Modal (create & edit) ─────────────────────────────────────────── */
const EMPTY = {
  code: "",
  title: "",
  description: "",
  credits: 3,
  type: "core",
  department: "",
  capacity: 80,
  instructorName: "",
  prerequisites: [],
  isActive: true,
};

function CourseModal({
  initial,
  onClose,
  onSaved,
  staffList,
  existingCourses,
}) {
  const isEdit = Boolean(initial?._id);
  const [form, setForm] = useState(
    initial
      ? {
          code: initial.code,
          title: initial.title,
          description: initial.description || "",
          credits: initial.credits,
          type: initial.type,
          department: initial.department,
          capacity: initial.capacity,
          instructorName: initial.instructorName || "",
          prerequisites: initial.prerequisites || [],
          isActive: initial.isActive,
        }
      : EMPTY,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // When department changes on a new course, auto-suggest the code
  function handleDepartmentChange(label) {
    if (!isEdit) {
      const suggested = suggestCode(label, existingCourses || []);
      setForm((f) => ({
        ...f,
        department: label,
        code: suggested,
      }));
    } else {
      set("department", label);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate before submission
    const err = validate({
      ...form,
      credits: Number(form.credits),
      capacity: Number(form.capacity),
    });
    if (err) {
      setError(err);
      return;
    }

    // Additional checks to ensure data is valid
    if (!form.code || form.code.trim() === "") {
      setError("Course code is required. Please select a department first.");
      return;
    }
    if (!form.title || form.title.trim() === "") {
      setError("Course title is required.");
      return;
    }
    if (!form.department || form.department.trim() === "") {
      setError("Department is required.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      const url = isEdit ? `/api/courses/${initial._id}` : "/api/courses";
      const method = isEdit ? "PATCH" : "POST";

      const payload = {
        code: form.code.toUpperCase().trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        credits: Number(form.credits),
        capacity: Number(form.capacity),
        type: form.type,
        instructorName: form.instructorName.trim(),
        prerequisites: form.prerequisites || [],
        isActive: form.isActive,
        department:
          form.department === "All Departments"
            ? "General"
            : form.department.trim(),
      };
      console.log("Sending course payload:", payload);

      const res = await apiFetch(url, {
        method,
        headers: { "x-user-role": "admin" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("Response from server:", data);
      if (!res.ok)
        throw new Error(
          data.message || (isEdit ? "Failed to update" : "Failed to create"),
        );
      onSaved();
      onClose();
    } catch (e) {
      setError(e.message);
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
              {isEdit ? "Edit Course" : "Create Course"}
            </h3>
            <p className="modal-subtitle">
              {isEdit
                ? `Editing ${initial.code}`
                : "Add a new course to the system"}
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
            {/* Row 1: Code (left) + Department (right) */}
            <div className="modal-field">
              <label className="modal-label">
                Course Code <span className="modal-required">*</span>
              </label>
              <input
                className="modal-input"
                placeholder={
                  form.department ? "Auto-generated" : "Select department first"
                }
                value={form.code}
                required
                style={{
                  textTransform: "uppercase",
                  backgroundColor: !form.department
                    ? "var(--bg-tertiary)"
                    : "var(--bg-primary)",
                }}
                disabled={true}
              />
              <span
                style={{
                  fontSize: 11,
                  color: form.code
                    ? "var(--text-tertiary)"
                    : "var(--accent-danger)",
                }}
              >
                {form.code
                  ? "Auto-generated from department"
                  : "⚠ Select a department to auto-generate code"}
              </span>
            </div>

            <div className="modal-field">
              <label className="modal-label">
                Department <span className="modal-required">*</span>
              </label>
              <div className="modal-select-wrap">
                <select
                  className="modal-input modal-select"
                  value={form.department}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  required
                >
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d.label} value={d.label}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="modal-select-icon" />
              </div>
            </div>

            {/* Title (full width) */}
            <div className="modal-field modal-field-full">
              <label className="modal-label">
                Title <span className="modal-required">*</span>
              </label>
              <input
                className="modal-input"
                placeholder="e.g. Introduction to Computer Science"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                required
              />
            </div>

            {/* Description (full width) */}
            <div className="modal-field modal-field-full">
              <label className="modal-label">Description</label>
              <textarea
                className="modal-input modal-textarea"
                placeholder="Brief course description…"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
              />
            </div>

            {/* Row 2: Instructor (left) + Type (right) */}
            <div className="modal-field">
              <label className="modal-label">Instructor</label>
              <InstructorSearch
                value={form.instructorName}
                onChange={(v) => set("instructorName", v)}
                staffList={staffList}
              />
            </div>

            <div className="modal-field">
              <label className="modal-label">Type</label>
              <div className="modal-select-wrap">
                <select
                  className="modal-input modal-select"
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                >
                  <option value="core">Core</option>
                  <option value="elective">Elective</option>
                </select>
                <ChevronDown size={14} className="modal-select-icon" />
              </div>
            </div>

            {/* Row 3: Credits (left) + Capacity (right) */}
            <div className="modal-field">
              <label className="modal-label">
                Credit Hours{" "}
                <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                  (0–4)
                </span>
              </label>
              <input
                className="modal-input"
                type="number"
                min={0}
                max={4}
                step={1}
                value={form.credits}
                onChange={(e) => set("credits", e.target.value)}
              />
            </div>

            <div className="modal-field">
              <label className="modal-label">Capacity</label>
              <input
                className="modal-input"
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => set("capacity", e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="modal-field">
              <label className="modal-label">Status</label>
              <div className="modal-select-wrap">
                <select
                  className="modal-input modal-select"
                  value={form.isActive ? "true" : "false"}
                  onChange={(e) => set("isActive", e.target.value === "true")}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <ChevronDown size={14} className="modal-select-icon" />
              </div>
            </div>

            {/* Prerequisites (full width) */}
            <div className="modal-field modal-field-full">
              <PrerequisitesSelect
                selected={form.prerequisites || []}
                onChange={(v) => set("prerequisites", v)}
                availableCourses={existingCourses || []}
                currentCourseId={isEdit ? initial._id : undefined}
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
                  <Spinner size={14} /> {isEdit ? "Saving…" : "Creating…"}
                </>
              ) : isEdit ? (
                <>
                  <CheckCircle2 size={14} /> Save Changes
                </>
              ) : (
                <>
                  <Plus size={14} /> Create Course
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Delete confirmation ──────────────────────────────────────────────────── */
function DeleteConfirm({ course, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      const res = await apiFetch(`/api/courses/${course._id}`, {
        method: "DELETE",
        headers: { "x-user-role": "admin" },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Failed to delete");
      }
      onDeleted();
      onClose();
    } catch (e) {
      setError(e.message);
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
            <h3 className="modal-title">Delete Course</h3>
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
              {course.code} — {course.title}
            </strong>
            ? This will permanently remove the course from the system.
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
                  <Trash2 size={14} /> Delete Course
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Course Detail Panel ──────────────────────────────────────────────────── */
function CourseDetail({ course, onBack, onEdit, onDelete, staffList }) {
  const [registrations, setRegistrations] = useState([]);
  const [loadingReg, setLoadingReg] = useState(true);

  useEffect(() => {
    async function load() {
      setLoadingReg(true);
      try {
        const res = await apiFetch(`/api/registrations?course=${course._id}`);
        const data = await res.json();
        setRegistrations(Array.isArray(data) ? data : []);
      } catch {
        setRegistrations([]);
      } finally {
        setLoadingReg(false);
      }
    }
    load();
  }, [course._id]);

  // Grade distribution from registrations that have a grade
  const graded = registrations.filter((r) => r.grade);
  const gradeCounts = graded.reduce((acc, r) => {
    acc[r.grade] = (acc[r.grade] || 0) + 1;
    return acc;
  }, {});
  const gradeEntries = Object.entries(gradeCounts).sort((a, b) => b[1] - a[1]);
  const maxCount = gradeEntries.length
    ? Math.max(...gradeEntries.map((e) => e[1]))
    : 1;

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={onBack}>
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <h2 style={{ marginBottom: 2 }}>
              <code
                style={{
                  background: "var(--bg-tertiary)",
                  padding: "2px 10px",
                  borderRadius: 6,
                  fontSize: 18,
                  marginRight: 10,
                }}
              >
                {course.code}
              </code>
              {course.title}
            </h2>
            <p>
              {course.department} · {course.credits} credit hour
              {course.credits !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onEdit(course)}
          >
            <Pencil size={14} /> Edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(course)}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="detail-grid-layout">
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Info card */}
          <div className="detail-card">
            <div className="detail-card-title">Course Information</div>
            <div className="detail-rows">
              <div className="detail-row">
                <span className="detail-label">Code</span>
                <span className="detail-value">
                  <code
                    style={{
                      background: "var(--bg-tertiary)",
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 13,
                    }}
                  >
                    {course.code}
                  </code>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Title</span>
                <span className="detail-value">{course.title}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Department</span>
                <span className="detail-value">{course.department}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Instructor</span>
                <span className="detail-value">
                  {course.instructorName || "—"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Type</span>
                <span className="detail-value">
                  <Badge variant={course.type === "core" ? "info" : "warning"}>
                    {course.type}
                  </Badge>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Credits</span>
                <span className="detail-value">{course.credits}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Capacity</span>
                <span className="detail-value">{course.capacity}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Enrolled</span>
                <span className="detail-value">
                  {registrations.filter((r) => r.status === "enrolled").length}{" "}
                  / {course.capacity}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className="detail-value">
                  <Badge variant={course.isActive ? "success" : "danger"}>
                    {course.isActive ? "Active" : "Inactive"}
                  </Badge>
                </span>
              </div>
              {course.description && (
                <div className="detail-row detail-row-full">
                  <span className="detail-label">Description</span>
                  <span
                    className="detail-value"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {course.description}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Grade distribution */}
          <div className="detail-card">
            <div className="detail-card-title">
              <BarChart2 size={15} /> Grade Distribution
            </div>
            {loadingReg ? (
              <div className="loading" style={{ padding: 24 }}>
                <Spinner size={16} /> Loading…
              </div>
            ) : gradeEntries.length === 0 ? (
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-tertiary)",
                  padding: "12px 0",
                }}
              >
                No graded registrations yet.
              </p>
            ) : (
              <div className="grade-chart">
                {gradeEntries.map(([grade, count]) => (
                  <div key={grade} className="grade-bar-row">
                    <span
                      className="grade-label"
                      style={{
                        color: GRADE_COLORS[grade] || "var(--text-secondary)",
                      }}
                    >
                      {grade}
                    </span>
                    <div className="grade-bar-track">
                      <div
                        className="grade-bar-fill"
                        style={{
                          width: `${(count / maxCount) * 100}%`,
                          background:
                            GRADE_COLORS[grade] || "var(--accent-primary)",
                        }}
                      />
                    </div>
                    <span className="grade-count">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — enrolled students */}
        <div className="detail-card">
          <div className="detail-card-title">
            <Users size={15} /> Enrolled Students (
            {registrations.filter((r) => r.status === "enrolled").length})
          </div>
          {loadingReg ? (
            <div className="loading" style={{ padding: 24 }}>
              <Spinner size={16} /> Loading…
            </div>
          ) : registrations.filter((r) => r.status === "enrolled").length ===
            0 ? (
            <p
              style={{
                fontSize: 13,
                color: "var(--text-tertiary)",
                padding: "12px 0",
              }}
            >
              No students enrolled.
            </p>
          ) : (
            <div
              className="table-container"
              style={{ boxShadow: "none", border: "none" }}
            >
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Semester</th>
                    <th>Grade</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations
                    .filter((r) => r.status === "enrolled")
                    .map((r) => (
                      <tr key={r._id}>
                        <td style={{ fontWeight: 600 }}>
                          {r.student?.firstName ||
                            r.student?.name ||
                            r.student?.studentId ||
                            "—"}
                        </td>
                        <td style={{ color: "var(--text-secondary)" }}>
                          {r.semester}
                        </td>
                        <td>
                          {r.grade ? (
                            <span
                              style={{
                                fontWeight: 600,
                                color: GRADE_COLORS[r.grade] || "inherit",
                              }}
                            >
                              {r.grade}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          <Badge variant="success">{r.status}</Badge>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Main section ─────────────────────────────────────────────────────────── */
export default function Courses() {
  const [items, setItems] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [cRes, sRes] = await Promise.all([
        apiFetch("/api/courses"),
        apiFetch("/api/staff"),
      ]);
      const [cData, sData] = await Promise.all([cRes.json(), sRes.json()]);
      if (!cRes.ok) throw new Error(cData.message);
      setItems(Array.isArray(cData) ? cData : []);
      setStaffList(Array.isArray(sData) ? sData : []);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered =
    filter === "all" ? items : items.filter((c) => c.type === filter);

  // If viewing detail, show detail panel
  if (detailTarget) {
    return (
      <>
        {editTarget && (
          <CourseModal
            initial={editTarget}
            onClose={() => setEditTarget(null)}
            onSaved={() => {
              load();
              setDetailTarget(
                (prev) => items.find((c) => c._id === prev._id) || prev,
              );
            }}
            staffList={staffList}
            existingCourses={items}
          />
        )}
        {deleteTarget && (
          <DeleteConfirm
            course={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onDeleted={() => {
              load();
              setDetailTarget(null);
            }}
          />
        )}
        <CourseDetail
          course={detailTarget}
          onBack={() => setDetailTarget(null)}
          onEdit={(c) => setEditTarget(c)}
          onDelete={(c) => setDeleteTarget(c)}
          staffList={staffList}
        />
      </>
    );
  }

  return (
    <>
      {createOpen && (
        <CourseModal
          onClose={() => setCreateOpen(false)}
          onSaved={load}
          staffList={staffList}
          existingCourses={items}
        />
      )}
      {editTarget && (
        <CourseModal
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={load}
          staffList={staffList}
          existingCourses={items}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          course={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={load}
        />
      )}

      <div className="page-header">
        <div>
          <h2>Courses</h2>
          <p>
            {items.length} course{items.length !== 1 ? "s" : ""} in the system
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={14} /> New Course
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-tabs">
          {["all", "core", "elective"].map((t) => (
            <button
              key={t}
              className={`filter-tab ${filter === t ? "active" : ""}`}
              onClick={() => setFilter(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <span
          style={{
            fontSize: 13,
            color: "var(--text-tertiary)",
            marginLeft: "auto",
          }}
        >
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <div className="loading">
            <Spinner /> Loading courses…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses found"
            desc='Click "New Course" to add one.'
          />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Instructor</th>
                  <th>Credits</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c._id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setDetailTarget(c)}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
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
                    <td style={{ color: "var(--text-secondary)" }}>
                      {c.department}
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {c.instructorName || "—"}
                    </td>
                    <td style={{ textAlign: "center" }}>{c.credits}</td>
                    <td>
                      <Badge variant={c.type === "core" ? "info" : "warning"}>
                        {c.type}
                      </Badge>
                    </td>
                    <td style={{ textAlign: "center" }}>{c.capacity}</td>
                    <td>
                      <Badge variant={c.isActive ? "success" : "danger"}>
                        {c.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="action-buttons">
                        <button
                          className="icon-btn"
                          title="Edit"
                          onClick={() => setEditTarget(c)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="icon-btn danger"
                          title="Delete"
                          onClick={() => setDeleteTarget(c)}
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
