import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  RefreshCw,
  CheckCircle2,
  Clock,
  GraduationCap,
  Award,
} from "lucide-react";
import { listRegistrations } from "../api/registrations";
import { UserLayout } from "./Home";
import "../styles/course-requirements.css";

function CourseAvatar({ code, variant = "default" }) {
  const prefix = (code || "?").split("-")[0];
  return (
    <div className={`mycr-course-avatar mycr-avatar-${variant}`}>{prefix}</div>
  );
}

export default function CourseRequirements() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    try {
      const regs = await listRegistrations(`student=${user.id}`);
      setRegistrations(Array.isArray(regs) ? regs : []);
    } catch (e) {
      setError(e?.message || "Unable to load your courses");
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

  const inProgress = registrations.filter((r) => r.status === "enrolled");
  const completed = registrations.filter((r) => r.status === "completed");

  return (
    <UserLayout user={user} onLogout={handleLogout}>
      {/* ── Header ── */}
      <div className="mycr-header">
        <div>
          <h2 className="mycr-title">My Courses</h2>
          <p className="mycr-subtitle">
            {inProgress.length} in progress · {completed.length} completed
          </p>
        </div>
        <button className="mycr-refresh-btn" onClick={load} disabled={loading}>
          <RefreshCw size={14} className={loading ? "mycr-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && <div className="mycr-alert">{error}</div>}

      {loading ? (
        <div className="mycr-loading">Loading your courses…</div>
      ) : (
        <>
          {/* ── In Progress ── */}
          <section className="mycr-section">
            <div className="mycr-section-title">
              <Clock size={14} />
              <span>In Progress</span>
              <span className="mycr-count">{inProgress.length}</span>
            </div>

            {inProgress.length === 0 ? (
              <div className="mycr-empty">
                <BookOpen size={28} style={{ opacity: 0.3 }} />
                <p>
                  No courses in progress. Go to{" "}
                  <strong>Register Courses</strong> to enroll.
                </p>
              </div>
            ) : (
              <div className="mycr-table-wrap">
                <table className="mycr-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Department</th>
                      <th>Credits</th>
                      <th>Semester</th>
                      <th>Instructor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inProgress.map((reg) => {
                      const c = reg.course || {};
                      return (
                        <tr
                          key={reg._id}
                          className="mycr-row mycr-row-enrolled"
                        >
                          <td>
                            <div className="mycr-course-cell">
                              <CourseAvatar code={c.code} variant="enrolled" />
                              <div>
                                <div className="mycr-course-name">
                                  {c.title || "—"}
                                </div>
                                <code className="mycr-course-code">
                                  {c.code || "—"}
                                </code>
                              </div>
                            </div>
                          </td>
                          <td className="mycr-td-sec">{c.department || "—"}</td>
                          <td className="mycr-td-center">{c.credits ?? "—"}</td>
                          <td className="mycr-td-sec">{reg.semester}</td>
                          <td className="mycr-td-sec">
                            {c.instructorId?.name || c.instructorName || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ── Completed ── */}
          <section className="mycr-section">
            <div className="mycr-section-title">
              <Award size={14} />
              <span>Completed Courses</span>
              <span className="mycr-count">{completed.length}</span>
            </div>

            {completed.length === 0 ? (
              <div className="mycr-empty">
                <CheckCircle2
                  size={28}
                  style={{ opacity: 0.3, color: "#10b981" }}
                />
                <p>No completed courses yet.</p>
              </div>
            ) : (
              <div className="mycr-table-wrap">
                <table className="mycr-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Department</th>
                      <th>Credits</th>
                      <th>Semester</th>
                      <th>Instructor</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completed.map((reg) => {
                      const c = reg.course || {};
                      return (
                        <tr
                          key={reg._id}
                          className="mycr-row mycr-row-completed"
                        >
                          <td>
                            <div className="mycr-course-cell">
                              <CourseAvatar code={c.code} variant="completed" />
                              <div>
                                <div className="mycr-course-name">
                                  {c.title || "—"}
                                </div>
                                <code className="mycr-course-code">
                                  {c.code || "—"}
                                </code>
                              </div>
                            </div>
                          </td>
                          <td className="mycr-td-sec">{c.department || "—"}</td>
                          <td className="mycr-td-center">{c.credits ?? "—"}</td>
                          <td className="mycr-td-sec">{reg.semester}</td>
                          <td className="mycr-td-sec">
                            {c.instructorId?.name || c.instructorName || "—"}
                          </td>
                          <td className="mycr-td-center">
                            {reg.grade ? (
                              <span className="mycr-grade">{reg.grade}</span>
                            ) : (
                              <span className="mycr-grade-empty">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </UserLayout>
  );
}
