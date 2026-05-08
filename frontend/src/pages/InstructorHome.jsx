import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Plus,
  Loader2,
  Users,
  ArrowLeft,
  RefreshCw,
  Hash,
  Building2,
  Award,
} from "lucide-react";
import { getCoursesByInstructorId } from "../api/courses";
import AnnouncementModal from "../components/AnnouncementModal";
import CourseStudentsModal from "../components/CourseStudentsModal";
import "../styles/instructor-home.css";

/* ── Course detail view ─────────────────────────────────────────────────── */
function CourseDetail({ course, onBack, onManageStudents }) {
  return (
    <div className="ih-detail">
      {/* Back bar */}
      <div className="ih-detail-topbar">
        <button className="ih-back-btn" onClick={onBack}>
          <ArrowLeft size={15} /> Back to My Courses
        </button>
      </div>

      {/* Hero */}
      <div className="ih-detail-hero">
        <div className="ih-detail-avatar">{course.code.split("-")[0]}</div>
        <div className="ih-detail-info">
          <div className="ih-detail-badges">
            <code className="ih-code-badge">{course.code}</code>
            <span className={`ih-type-badge ih-type-${course.type}`}>
              {course.type}
            </span>
            <span
              className={`ih-active-badge ${course.isActive ? "ih-active" : "ih-inactive"}`}
            >
              {course.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <h2 className="ih-detail-title">{course.title}</h2>
          <p className="ih-detail-dept">{course.department}</p>
          <div className="ih-detail-chips">
            <span className="ih-chip">
              <BookOpen size={13} /> {course.credits} credit
              {course.credits !== 1 ? "s" : ""}
            </span>
            <span className="ih-chip">
              <Users size={13} /> {course.capacity} capacity
            </span>
          </div>
          {course.description && (
            <p className="ih-detail-desc">{course.description}</p>
          )}
        </div>
      </div>

      {/* Manage students */}
      <div className="ih-detail-section">
        <div className="ih-detail-section-header">
          <Users size={16} />
          <span>Students & Grades</span>
        </div>
        <p className="ih-detail-section-hint">
          View enrolled students, assign grades, and complete the course when
          all grades are submitted.
        </p>
        <button
          className="ih-manage-btn"
          onClick={() => onManageStudents(course)}
        >
          <Users size={15} /> Manage Students &amp; Grades
        </button>
      </div>
    </div>
  );
}

/* ── Main InstructorHome ────────────────────────────────────────────────── */
export default function InstructorHome({ user }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [detailCourse, setDetailCourse] = useState(null);

  const fetchCourses = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    try {
      const data = await getCoursesByInstructorId(user.id);
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to fetch courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleRowClick = (course) => {
    setDetailCourse(course);
  };

  const handleManageStudents = (course) => {
    setSelectedCourse(course);
    setShowStudentsModal(true);
  };

  /* ── Detail view ── */
  if (detailCourse) {
    return (
      <div className="ih-wrap">
        <CourseDetail
          course={detailCourse}
          onBack={() => setDetailCourse(null)}
          onManageStudents={handleManageStudents}
        />
        <CourseStudentsModal
          isOpen={showStudentsModal}
          onClose={() => {
            setShowStudentsModal(false);
            setSelectedCourse(null);
          }}
          course={selectedCourse}
        />
      </div>
    );
  }

  /* ── List view ── */
  return (
    <div className="ih-wrap">
      {/* Header */}
      <div className="ih-header">
        <div>
          <h2 className="ih-title">My Courses</h2>
          <p className="ih-subtitle">
            Click a course to view details and manage students
          </p>
        </div>
        <div className="ih-header-actions">
          <button
            className="ih-btn-secondary"
            onClick={fetchCourses}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "ih-spin" : ""} />
          </button>
          <button
            className="ih-btn-primary"
            onClick={() => setShowAnnouncementModal(true)}
          >
            <Plus size={15} /> Create Announcement
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="ih-table-container">
        {loading ? (
          <div className="ih-state">
            <Loader2 size={28} className="ih-spin" />
            <p>Loading your courses…</p>
          </div>
        ) : error ? (
          <div className="ih-state ih-state-error">
            <p>{error}</p>
            <button className="ih-btn-primary" onClick={fetchCourses}>
              Retry
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="ih-state">
            <BookOpen size={40} style={{ opacity: 0.3 }} />
            <p style={{ fontWeight: 600 }}>No courses assigned</p>
            <p style={{ fontSize: 13, color: "#6b7280" }}>
              Contact your administrator to be assigned to a course.
            </p>
          </div>
        ) : (
          <div className="ih-table-responsive">
            <table className="ih-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Department</th>
                  <th>Type</th>
                  <th>Credits</th>
                  <th>Capacity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr
                    key={course._id}
                    className="ih-table-row"
                    onClick={() => handleRowClick(course)}
                  >
                    <td>
                      <div className="ih-course-cell">
                        <div className="ih-course-avatar">
                          {course.code.split("-")[0]}
                        </div>
                        <div>
                          <div className="ih-course-name">{course.title}</div>
                          <code className="ih-course-code">{course.code}</code>
                        </div>
                      </div>
                    </td>
                    <td className="ih-td-secondary">
                      {course.department || "—"}
                    </td>
                    <td>
                      <span className={`ih-type-badge ih-type-${course.type}`}>
                        {course.type}
                      </span>
                    </td>
                    <td className="ih-td-center">{course.credits}</td>
                    <td className="ih-td-center">{course.capacity}</td>
                    <td>
                      <span
                        className={`ih-active-badge ${course.isActive ? "ih-active" : "ih-inactive"}`}
                      >
                        {course.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnnouncementModal
        mode="create"
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        courses={courses}
        onSuccess={() => {}}
      />

      <CourseStudentsModal
        isOpen={showStudentsModal}
        onClose={() => {
          setShowStudentsModal(false);
          setSelectedCourse(null);
        }}
        course={selectedCourse}
      />
    </div>
  );
}
