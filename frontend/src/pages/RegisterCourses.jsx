import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  RefreshCw,
  Layers3,
  Sparkles,
  Search,
  X,
} from "lucide-react";
import { getAllCourses } from "../api/courses";
import {
  dropStudentEnrollment,
  listRegistrations,
  registerStudentEnrollment,
} from "../api/registrations";
import { UserLayout } from "./Home";
import "../styles/course-requirements.css";

function getCurrentSemester() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const term = month >= 7 ? "FALL" : month <= 5 ? "SPRING" : "SUMMER";
  return `${year}-${term}`;
}

function CourseAvatar({ code, variant = "core" }) {
  const prefix = (code || "?").split("-")[0];
  return (
    <div className={`mycr-course-avatar mycr-avatar-${variant}`}>{prefix}</div>
  );
}

export default function RegisterCourses() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [courses, setCourses] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [enrollingId, setEnrollingId] = useState(null);
  const [droppingId, setDroppingId] = useState(null);

  const currentSemester = getCurrentSemester();

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    try {
      const [allCourses, regs] = await Promise.all([
        getAllCourses(),
        listRegistrations(`student=${user.id}`),
      ]);
      setCourses(Array.isArray(allCourses) ? allCourses : []);
      setRegistrations(Array.isArray(regs) ? regs : []);
    } catch (e) {
      setError(e?.message || "Unable to load courses");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return <div className="home-loading">No user data</div>;

  // Map courseId → current-semester registration
  const regByCourse = new Map(
    registrations
      .filter((r) => r.semester === currentSemester)
      .map((r) => [r.course?._id || r.course, r]),
  );

  const enrolledCount = [...regByCourse.values()].filter(
    (r) => r.status === "enrolled",
  ).length;

  // Active courses only, filtered by search
  const needle = search.trim().toLowerCase();
  const activeCourses = courses
    .filter((c) => c.isActive !== false)
    .filter((c) => {
      if (!needle) return true;
      return [c.code, c.title, c.department]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(needle));
    })
    .sort((a, b) => String(a.code || "").localeCompare(String(b.code || "")));

  const coreList = activeCourses.filter((c) => c.type === "core");
  const electiveList = activeCourses.filter((c) => c.type === "elective");

  const handleEnroll = async (courseId) => {
    if (!user?.id) return;
    setEnrollingId(courseId);
    setError("");
    try {
      await registerStudentEnrollment({
        student: user.id,
        course: courseId,
        semester: currentSemester,
      });
      await load();
    } catch (e) {
      setError(e?.message || "Unable to enroll");
    } finally {
      setEnrollingId(null);
    }
  };

  const handleLeave = async (registrationId) => {
    setDroppingId(registrationId);
    setError("");
    try {
      await dropStudentEnrollment(registrationId);
      await load();
    } catch (e) {
      setError(e?.message || "Unable to drop this course");
    } finally {
      setDroppingId(null);
    }
  };

  // Render a single course table (core or elective)
  function CourseTable({ list, variant }) {
    if (list.length === 0)
      return (
        <div className="mycr-empty">
          <BookOpen size={24} style={{ opacity: 0.3 }} />
          <p>
            {needle ? "No courses match your search." : "No courses available."}
          </p>
        </div>
      );

    return (
      <div className="mycr-table-wrap">
        <table className="mycr-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Department</th>
              <th>Credits</th>
              <th>Capacity</th>
              <th>Instructor</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const reg = regByCourse.get(c._id);
              const isEnrolled = reg?.status === "enrolled";
              const isCompleted = reg?.status === "completed";

              return (
                <tr
                  key={c._id}
                  className={`mycr-row${isEnrolled ? " mycr-row-enrolled" : ""}`}
                >
                  <td>
                    <div className="mycr-course-cell">
                      <CourseAvatar code={c.code} variant={variant} />
                      <div>
                        <div className="mycr-course-name">{c.title}</div>
                        <code className="mycr-course-code">{c.code}</code>
                      </div>
                    </div>
                  </td>
                  <td className="mycr-td-sec">{c.department || "—"}</td>
                  <td className="mycr-td-center">{c.credits}</td>
                  <td className="mycr-td-center">{c.capacity}</td>
                  <td className="mycr-td-sec">
                    {c.instructorId?.name || c.instructorName || "—"}
                  </td>
                  <td className="mycr-td-action">
                    {isCompleted ? (
                      <span className="mycr-completed-tag">Completed ✓</span>
                    ) : isEnrolled ? (
                      <button
                        className="mycr-leave-btn"
                        onClick={() => handleLeave(reg._id)}
                        disabled={droppingId === reg._id}
                      >
                        {droppingId === reg._id ? "Leaving…" : "Leave"}
                      </button>
                    ) : (
                      <button
                        className={`mycr-enroll-btn${variant === "elective" ? " mycr-enroll-btn-elective" : ""}`}
                        onClick={() => handleEnroll(c._id)}
                        disabled={enrollingId === c._id}
                      >
                        {enrollingId === c._id ? "Enrolling…" : "Enroll"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <UserLayout user={user} onLogout={handleLogout}>
      {/* ── Header ── */}
      <div className="mycr-header">
        <div>
          <h2 className="mycr-title">Register Courses</h2>
          <p className="mycr-subtitle">
            {currentSemester} · {enrolledCount} enrolled this semester
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Search */}
          <div className="mycr-search-wrap">
            <Search size={14} />
            <input
              className="mycr-search-input"
              placeholder="Search by code, title, or department…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="mycr-search-clear"
                onClick={() => setSearch("")}
              >
                <X size={13} />
              </button>
            )}
          </div>
          <button
            className="mycr-refresh-btn"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "mycr-spin" : ""} />
          </button>
        </div>
      </div>

      {error && <div className="mycr-alert">{error}</div>}

      {loading ? (
        <div className="mycr-loading">Loading available courses…</div>
      ) : (
        <>
          {/* ── Core Courses ── */}
          <section className="mycr-section">
            <div className="mycr-section-title">
              <Layers3 size={14} />
              <span>Core Courses</span>
              <span className="mycr-count">{coreList.length}</span>
            </div>
            <CourseTable list={coreList} variant="core" />
          </section>

          {/* ── Elective Courses ── */}
          <section className="mycr-section">
            <div className="mycr-section-title mycr-section-title-elective">
              <Sparkles size={14} />
              <span>Elective Courses</span>
              <span className="mycr-count">{electiveList.length}</span>
            </div>
            <CourseTable list={electiveList} variant="elective" />
          </section>
        </>
      )}
    </UserLayout>
  );
}
