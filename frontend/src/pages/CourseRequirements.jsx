import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Layers3,
} from "lucide-react";
import { getStudentCourseRequirements } from "../api/courses";
import { UserLayout } from "./Home";
import "../styles/course-requirements.css";

export default function CourseRequirements() {
  const navigate = useNavigate();

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [requirements, setRequirements] = useState({
    core: [],
    electives: [],
    department: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setError("");
      try {
        const data = await getStudentCourseRequirements();
        if (!isMounted) return;
        setRequirements({
          core: data.core || [],
          electives: data.electives || [],
          department: data.department || null,
        });
      } catch (e) {
        if (!isMounted) return;
        setError(e?.message || "Unable to load course requirements");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getStudentCourseRequirements();
      setRequirements({
        core: data.core || [],
        electives: data.electives || [],
        department: data.department || null,
      });
    } catch (e) {
      setError(e?.message || "Unable to load course requirements");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return <div className="home-loading">No user data</div>;

  return (
    <UserLayout user={user} onLogout={handleLogout}>
      {/* Stats row */}
      <div className="cr-stats-row">
        <div className="cr-stat-card">
          <div className="cr-stat-icon cr-stat-blue">
            <Layers3 size={20} />
          </div>
          <div>
            <div className="cr-stat-label">Core Subjects</div>
            <div className="cr-stat-value">{requirements.core.length}</div>
          </div>
        </div>
        <div className="cr-stat-card">
          <div className="cr-stat-icon cr-stat-purple">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="cr-stat-label">Available Electives</div>
            <div className="cr-stat-value">{requirements.electives.length}</div>
          </div>
        </div>
        <div className="cr-stat-card">
          <div className="cr-stat-icon cr-stat-green">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="cr-stat-label">Department</div>
            <div className="cr-stat-value cr-stat-value-sm">
              {requirements.department || user.department || "All"}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="cr-toolbar">
        <span className="cr-toolbar-label">Live catalog</span>
        <button
          className="cr-refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && <div className="cr-alert">{error}</div>}

      {loading ? (
        <div className="cr-loading">Loading course options…</div>
      ) : (
        <div className="cr-grid">
          {/* Core */}
          <div className="cr-card cr-card-core">
            <div className="cr-card-header">
              <div className="cr-icon-wrap cr-icon-blue">
                <Layers3 size={18} />
              </div>
              <div>
                <div className="cr-card-label">Core Subjects</div>
                <div className="cr-card-count">{requirements.core.length}</div>
              </div>
            </div>
            <ul className="cr-list">
              {requirements.core.length === 0 ? (
                <li className="cr-empty-item">
                  No active core subjects available.
                </li>
              ) : (
                requirements.core.map((c) => (
                  <li key={c._id} className="cr-item">
                    <div>
                      <strong>{c.code}</strong>
                      <span>{c.title}</span>
                    </div>
                    <CheckCircle2 size={16} />
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Electives */}
          <div className="cr-card cr-card-elective">
            <div className="cr-card-header">
              <div className="cr-icon-wrap cr-icon-purple">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="cr-card-label">Available Electives</div>
                <div className="cr-card-count">
                  {requirements.electives.length}
                </div>
              </div>
            </div>
            <ul className="cr-list">
              {requirements.electives.length === 0 ? (
                <li className="cr-empty-item">
                  No active electives available right now.
                </li>
              ) : (
                requirements.electives.map((c) => (
                  <li key={c._id} className="cr-item">
                    <div>
                      <strong>{c.code}</strong>
                      <span>{c.title}</span>
                    </div>
                    <ChevronRight size={16} />
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </UserLayout>
  );
}
