import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, LogOut, RefreshCw, XCircle } from "lucide-react";
import "../styles/admin.css";

export default function Admin() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/users/admin/pending-applications");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load applications");
      }

      setApplications(data.applications || []);
    } catch (err) {
      setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const response = await fetch("/api/users/admin/pending-applications");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load applications");
        }

        if (isMounted) {
          setApplications(data.applications || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load applications");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleApprove = async (applicationId) => {
    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/users/admin/approve/${applicationId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminId: user?.id || "super-admin" }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to approve application");
      }

      await fetchApplications();
    } catch (err) {
      alert(err.message || "Failed to approve application");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (applicationId) => {
    const reason = window.prompt("Enter rejection reason (optional):", "");
    if (reason === null) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/users/admin/reject/${applicationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: user?.id || "super-admin",
          reason: reason.trim() || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to reject application");
      }

      await fetchApplications();
    } catch (err) {
      alert(err.message || "Failed to reject application");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <header className="admin-header">
          <div>
            <p className="admin-kicker">Admin Dashboard</p>
            <h1>Application Review Center</h1>
            <p className="admin-subtitle">
              Review pending admissions and move approved users into the correct
              table.
            </p>
          </div>
          <div className="admin-header-actions">
            <button
              className="btn-ghost"
              onClick={fetchApplications}
              disabled={loading || actionLoading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button className="btn-ghost btn-logout" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <section className="admin-stats">
          <article className="stat-card">
            <span className="stat-label">Pending Applications</span>
            <span className="stat-value">{applications.length}</span>
          </article>
          <article className="stat-card">
            <span className="stat-label">Admin Email</span>
            <span className="stat-value stat-small">
              {user?.email || "super admin"}
            </span>
          </article>
          <article className="stat-card">
            <span className="stat-label">Active Role</span>
            <span className="stat-value">{user?.role || "admin"}</span>
          </article>
        </section>

        {error ? <div className="admin-alert error">{error}</div> : null}

        <main className="admin-content">
          {loading ? (
            <div className="admin-empty">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="admin-empty">
              No pending applications right now.
            </div>
          ) : (
            <div className="application-grid">
              {applications.map((application) => (
                <article key={application._id} className="application-card">
                  <div className="application-card-header">
                    <div>
                      <h2>{application.name}</h2>
                      <p>{application.email}</p>
                    </div>
                    <span
                      className={`status-pill status-${application.status}`}
                    >
                      {application.status}
                    </span>
                  </div>

                  <div className="application-meta">
                    <div>
                      <span className="meta-label">Role</span>
                      <span className="meta-value">{application.role}</span>
                    </div>
                    <div>
                      <span className="meta-label">Submitted</span>
                      <span className="meta-value">
                        {new Date(application.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="application-actions">
                    <button
                      className="btn-approve"
                      onClick={() => handleApprove(application._id)}
                      disabled={actionLoading}
                    >
                      <CheckCircle2 size={16} />
                      Approve
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleReject(application._id)}
                      disabled={actionLoading}
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
