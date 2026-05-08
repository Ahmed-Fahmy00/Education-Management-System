import React, { useState, useEffect, useCallback } from "react";
import { X, Loader2, CheckCircle2, Award } from "lucide-react";
import {
  getStudentsInCourse,
  gradeStudent,
  completeCourse,
} from "../api/registrations";
import "../styles/course-students-modal.css";

const VALID_GRADES = [
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "F",
];

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

export default function CourseStudentsModal({ isOpen, onClose, course }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gradingId, setGradingId] = useState(null);
  const [pendingGrades, setPendingGrades] = useState({});
  const [savingGrade, setSavingGrade] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchStudents = useCallback(async () => {
    if (!course?._id) return;
    setLoading(true);
    setError("");
    try {
      const data = await getStudentsInCourse(course._id);
      setRegistrations(Array.isArray(data) ? data : []);
      // Check if all enrolled are already completed
      const allDone =
        data.length > 0 && data.every((r) => r.status === "completed");
      setCompleted(allDone);
    } catch (err) {
      setError(err.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  }, [course?._id]);

  useEffect(() => {
    if (isOpen && course?._id) {
      fetchStudents();
      setPendingGrades({});
      setSuccessMsg("");
      setCompleted(false);
    }
  }, [isOpen, course?._id, fetchStudents]);

  const handleGradeChange = (registrationId, grade) => {
    setPendingGrades((prev) => ({ ...prev, [registrationId]: grade }));
  };

  const handleSaveGrade = async (registrationId) => {
    const grade = pendingGrades[registrationId];
    if (!grade) return;
    setSavingGrade(registrationId);
    setError("");
    try {
      await gradeStudent(registrationId, grade);
      setSuccessMsg(`Grade saved.`);
      setTimeout(() => setSuccessMsg(""), 2500);
      await fetchStudents();
      setPendingGrades((prev) => {
        const next = { ...prev };
        delete next[registrationId];
        return next;
      });
    } catch (err) {
      setError(err.message || "Failed to save grade");
    } finally {
      setSavingGrade(null);
    }
  };

  const handleCompleteCourse = async () => {
    if (!course?._id) return;
    const ungradedEnrolled = registrations.filter(
      (r) => r.status === "enrolled" && !r.grade,
    );
    if (ungradedEnrolled.length > 0) {
      setError(
        `${ungradedEnrolled.length} enrolled student(s) have no grade yet. Please assign grades before completing the course.`,
      );
      return;
    }
    if (
      !window.confirm(
        `Mark "${course.code} — ${course.title}" as completed? All enrolled students will be moved to completed status and transcripts will be generated. This cannot be undone.`,
      )
    )
      return;

    setCompleting(true);
    setError("");
    try {
      await completeCourse(course._id);
      setCompleted(true);
      setSuccessMsg(
        "Course completed! Transcripts have been generated for all students.",
      );
      await fetchStudents();
    } catch (err) {
      setError(err.message || "Failed to complete course");
    } finally {
      setCompleting(false);
    }
  };

  if (!isOpen || !course) return null;

  const enrolledCount = registrations.filter(
    (r) => r.status === "enrolled",
  ).length;
  const completedCount = registrations.filter(
    (r) => r.status === "completed",
  ).length;
  const gradedCount = registrations.filter((r) => r.grade).length;

  return (
    <div className="course-students-overlay" onClick={onClose}>
      <div
        className="course-students-modal csm-wide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="course-students-header">
          <div>
            <h2>
              {course.code} — {course.title}
            </h2>
            <p className="course-students-count">
              {registrations.length} student
              {registrations.length !== 1 ? "s" : ""} · {enrolledCount} enrolled
              · {completedCount} completed · {gradedCount} graded
            </p>
          </div>
          <button className="course-students-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Success / error banners */}
        {successMsg && (
          <div className="csm-banner csm-banner-success">
            <CheckCircle2 size={15} /> {successMsg}
          </div>
        )}
        {error && <div className="csm-banner csm-banner-error">{error}</div>}

        {/* Complete course action */}
        {!completed && registrations.length > 0 && (
          <div className="csm-complete-bar">
            <span className="csm-complete-hint">
              {enrolledCount > 0
                ? `${enrolledCount} student(s) still enrolled. Assign all grades then complete the course.`
                : "All students are graded. Ready to complete."}
            </span>
            <button
              className="csm-complete-btn"
              onClick={handleCompleteCourse}
              disabled={completing || enrolledCount === 0}
            >
              {completing ? (
                <>
                  <Loader2 size={14} className="csm-spin" /> Completing…
                </>
              ) : (
                <>
                  <Award size={14} /> Complete Course
                </>
              )}
            </button>
          </div>
        )}

        {completed && (
          <div className="csm-completed-badge">
            <CheckCircle2 size={16} /> This course has been completed
          </div>
        )}

        {/* Body */}
        <div className="course-students-content">
          {loading ? (
            <div className="loading-container">
              <Loader2 size={32} className="spinner" />
              <p>Loading students…</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="empty-state">
              <p>No students enrolled in this course yet.</p>
            </div>
          ) : (
            <div className="students-list">
              <div className="students-table-header csm-header-grade">
                <div className="col-name">Student</div>
                <div className="col-email">Email</div>
                <div className="col-department">Department</div>
                <div className="col-status">Status</div>
                <div className="col-grade">Grade</div>
                <div className="col-action"></div>
              </div>
              <div className="students-table-body">
                {registrations.map((reg) => {
                  const student = reg.student || {};
                  const isEnrolled = reg.status === "enrolled";
                  const isCompleted = reg.status === "completed";
                  const currentGrade =
                    pendingGrades[reg._id] ?? reg.grade ?? "";
                  const isDirty =
                    pendingGrades[reg._id] !== undefined &&
                    pendingGrades[reg._id] !== reg.grade;

                  return (
                    <div key={reg._id} className="student-row csm-row-grade">
                      <div className="col-name" style={{ fontWeight: 600 }}>
                        {student.name || "—"}
                        {student.studentId && (
                          <span
                            style={{
                              display: "block",
                              fontSize: 11,
                              color: "#6b7280",
                              fontFamily: "monospace",
                              fontWeight: 400,
                            }}
                          >
                            {student.studentId}
                          </span>
                        )}
                      </div>
                      <div
                        className="col-email"
                        style={{ fontSize: 13, color: "#6b7280" }}
                      >
                        {student.email || "—"}
                      </div>
                      <div
                        className="col-department"
                        style={{ fontSize: 13, color: "#6b7280" }}
                      >
                        {student.department || "—"}
                      </div>
                      <div className="col-status">
                        <span
                          className={`csm-status-badge csm-status-${reg.status}`}
                        >
                          {reg.status}
                        </span>
                      </div>
                      <div className="col-grade">
                        {isCompleted && !isEnrolled ? (
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: 15,
                              color: GRADE_COLORS[reg.grade] || "#374151",
                            }}
                          >
                            {reg.grade || "—"}
                          </span>
                        ) : (
                          <select
                            className="csm-grade-select"
                            value={currentGrade}
                            onChange={(e) =>
                              handleGradeChange(reg._id, e.target.value)
                            }
                            disabled={isCompleted}
                            style={{
                              color: GRADE_COLORS[currentGrade] || undefined,
                              fontWeight: currentGrade ? 700 : 400,
                            }}
                          >
                            <option value="">— Grade —</option>
                            {VALID_GRADES.map((g) => (
                              <option
                                key={g}
                                value={g}
                                style={{ color: GRADE_COLORS[g] }}
                              >
                                {g}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <div className="col-action">
                        {isEnrolled && isDirty && (
                          <button
                            className="csm-save-btn"
                            onClick={() => handleSaveGrade(reg._id)}
                            disabled={savingGrade === reg._id}
                          >
                            {savingGrade === reg._id ? (
                              <Loader2 size={13} className="csm-spin" />
                            ) : (
                              "Save"
                            )}
                          </button>
                        )}
                      </div>
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
