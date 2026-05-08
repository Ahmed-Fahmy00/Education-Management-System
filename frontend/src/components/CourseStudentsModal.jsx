import React, { useState, useEffect } from 'react';
import { X, Loader2, Pencil, Save } from 'lucide-react';
import { getStudentsInCourse, updateRegistrationGrade } from '../api/registrations';
import '../styles/course-students-modal.css';

const VALID_GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"];
const GRADE_COLORS = {
  "A+": "#10b981", A: "#10b981", "A-": "#34d399",
  "B+": "#3b82f6", B: "#3b82f6", "B-": "#60a5fa",
  "C+": "#f59e0b", C: "#f59e0b", "C-": "#fbbf24",
  "D+": "#f97316", D: "#f97316", F: "#ef4444",
};

function GradeCell({ registration, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(registration.grade || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      await updateRegistrationGrade(registration._id, {
        grade: selected,
        status: "completed",
      });
      onSaved(registration._id, selected, "completed");
      setEditing(false);
    } catch (err) {
      setError(err.message || "Failed to save grade");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{
          fontWeight: 700,
          color: GRADE_COLORS[registration.grade] || "#9ca3af",
        }}>
          {registration.grade || "—"}
        </span>
        <button
          title="Edit grade"
          onClick={() => { setSelected(registration.grade || ""); setEditing(true); }}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#9ca3af", display: "flex", alignItems: "center" }}
        >
          <Pencil size={13} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{
            fontSize: 12, padding: "2px 4px", borderRadius: 4,
            border: "1px solid #d1d5db", background: "#fff",
            color: "#111827",
          }}
          autoFocus
        >
          <option value="">— Select —</option>
          {VALID_GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <button
          onClick={handleSave}
          disabled={saving || !selected}
          title="Save"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#3b82f6", display: "flex", alignItems: "center" }}
        >
          {saving ? <Loader2 size={13} className="spinner" /> : <Save size={13} />}
        </button>
        <button
          onClick={() => { setEditing(false); setError(""); }}
          title="Cancel"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#9ca3af", display: "flex", alignItems: "center" }}
        >
          <X size={13} />
        </button>
      </div>
      {error && <span style={{ fontSize: 11, color: "#dc2626" }}>{error}</span>}
    </div>
  );
}

export default function CourseStudentsModal({ isOpen, onClose, course, user }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && course?._id) {
      fetchStudents();
    }
  }, [isOpen, course?._id]);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getStudentsInCourse(course._id);
      setRegistrations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  function handleGradeSaved(registrationId, grade, status) {
    setRegistrations((prev) =>
      prev.map((r) => r._id === registrationId ? { ...r, grade, status } : r),
    );
  }

  if (!isOpen || !course) return null;

  const canEditGrades = user?.role === "instructor" || user?.role === "admin";

  return (
    <div className="course-students-overlay" onClick={onClose}>
      <div className="course-students-modal" onClick={(e) => e.stopPropagation()}>
        <div className="course-students-header">
          <div>
            <h2>{course.code} - {course.title}</h2>
            <p className="course-students-count">
              {registrations.length} student{registrations.length !== 1 ? 's' : ''} enrolled
            </p>
          </div>
          <button className="course-students-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="course-students-content">
          {loading ? (
            <div className="loading-container">
              <Loader2 size={32} className="spinner" />
              <p>Loading students...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>{error}</p>
              <button className="btn-retry" onClick={fetchStudents}>
                Retry
              </button>
            </div>
          ) : registrations.length === 0 ? (
            <div className="empty-state">
              <p>No students enrolled in this course</p>
            </div>
          ) : (
            <div className="students-list">
              <div className={`students-table-header${canEditGrades ? " with-grade" : ""}`}>
                <div className="col-name">Name</div>
                <div className="col-email">Email</div>
                <div className="col-department">Department</div>
                {canEditGrades && <div className="col-grade">Grade</div>}
              </div>
              <div className="students-table-body">
                {registrations.map((registration, index) => {
                  const student = registration.student;
                  return (
                    <div key={registration._id || index} className={`student-row${canEditGrades ? " with-grade" : ""}`}>
                      <div className="col-name">{student.name}</div>
                      <div className="col-email">{student.email}</div>
                      <div className="col-department">{student.department || 'N/A'}</div>
                      {canEditGrades && (
                        <div className="col-grade">
                          <GradeCell registration={registration} onSaved={handleGradeSaved} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
