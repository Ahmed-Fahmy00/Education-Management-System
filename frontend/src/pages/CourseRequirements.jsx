import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Layers3,
} from "lucide-react";
import { getStudentCourseRequirements } from "../api/courses";
import "../styles/course-requirements.css";

function readStoredUser() {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

export default function CourseRequirements() {
  const navigate = useNavigate();
  const [user] = useState(readStoredUser);
  const [requirements, setRequirements] = useState({ core: [], electives: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRequirements() {
      setError("");

      try {
        const data = await getStudentCourseRequirements();
        if (!isMounted) return;

        setRequirements({
          core: data.core || [],
          electives: data.electives || [],
        });
      } catch (fetchError) {
        if (!isMounted) return;

        setError(fetchError?.message || "Unable to load course requirements");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRequirements();

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
      });
    } catch (fetchError) {
      setError(fetchError?.message || "Unable to load course requirements");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="course-requirements-loading">No user data</div>;
  }

  return (
    <div className="course-requirements-page">
      <header className="course-requirements-hero">
        <button className="back-button" type="button" onClick={() => navigate("/home")}>
          <ChevronLeft size={16} />
          Back to Home
        </button>

        <div className="hero-copy">
          <div className="hero-badge">
            <BookOpen size={16} />
            Study Plan
          </div>
          <h1>Your Required Core Subjects and Available Electives</h1>
          <p>
            Review the active courses available in the system so you can map out
            your study requirements and choose from the available electives.
          </p>
        </div>

        <div className="hero-stats">
          <article>
            <span>Core Subjects</span>
            <strong>{requirements.core.length}</strong>
          </article>
          <article>
            <span>Available Electives</span>
            <strong>{requirements.electives.length}</strong>
          </article>
          <article>
            <span>Student</span>
            <strong>{user.name}</strong>
          </article>
        </div>
      </header>

      <main className="course-requirements-shell">
        <div className="course-requirements-toolbar">
          <div>
            <p className="section-kicker">Live catalog</p>
            <h2>Current course requirements</h2>
          </div>

          <button
            className="refresh-button"
            type="button"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error ? <div className="requirements-alert">{error}</div> : null}

        {loading ? (
          <div className="requirements-empty">Loading course options...</div>
        ) : (
          <section className="requirements-grid">
            <article className="requirements-card core-card">
              <div className="requirements-card-header">
                <div className="requirements-icon-wrap core">
                  <Layers3 size={18} />
                </div>
                <div>
                  <span className="requirements-label">Core Subjects</span>
                  <h3>{requirements.core.length}</h3>
                </div>
              </div>

              <ul className="requirements-list">
                {requirements.core.length === 0 ? (
                  <li className="requirements-empty-item">
                    No active core subjects available.
                  </li>
                ) : (
                  requirements.core.map((course) => (
                    <li key={course._id} className="requirements-item">
                      <div>
                        <strong>{course.code}</strong>
                        <span>{course.title}</span>
                      </div>
                      <CheckCircle2 size={16} />
                    </li>
                  ))
                )}
              </ul>
            </article>

            <article className="requirements-card elective-card">
              <div className="requirements-card-header">
                <div className="requirements-icon-wrap elective">
                  <Sparkles size={18} />
                </div>
                <div>
                  <span className="requirements-label">Available Electives</span>
                  <h3>{requirements.electives.length}</h3>
                </div>
              </div>

              <ul className="requirements-list">
                {requirements.electives.length === 0 ? (
                  <li className="requirements-empty-item">
                    No active electives available right now.
                  </li>
                ) : (
                  requirements.electives.map((course) => (
                    <li key={course._id} className="requirements-item">
                      <div>
                        <strong>{course.code}</strong>
                        <span>{course.title}</span>
                      </div>
                      <ChevronRight size={16} />
                    </li>
                  ))
                )}
              </ul>
            </article>
          </section>
        )}
      </main>
    </div>
  );
}