import { useState, useCallback, useEffect } from "react";
import {
  RefreshCw,
  AlertCircle,
  Users,
  ArrowLeft,
  Mail,
  Building2,
  BookOpen,
} from "lucide-react";
import { apiFetch, Badge, Spinner, EmptyState } from "./shared";

function StaffDetail({ member, onBack }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await apiFetch(
          `/api/courses?instructorName=${encodeURIComponent(member.name)}`,
        );
        const data = res.ok ? await res.json() : [];
        setCourses(Array.isArray(data) ? data : []);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [member.name]);

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={onBack}>
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <h2 style={{ marginBottom: 2 }}>{member.name}</h2>
            <p>{member.email}</p>
          </div>
        </div>
        <Badge variant={member.isActive ? "success" : "danger"}>
          {member.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="detail-grid-layout">
        {/* Info */}
        <div className="detail-card" style={{ alignSelf: "start" }}>
          <div className="detail-card-title">Staff Information</div>
          <div className="detail-rows">
            <div className="detail-row">
              <span className="detail-label">
                <Mail size={13} /> Email
              </span>
              <span className="detail-value">{member.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Role</span>
              <span className="detail-value">
                <Badge variant="purple">{member.role}</Badge>
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">
                <Building2 size={13} /> Department
              </span>
              <span className="detail-value">{member.department || "—"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Joined</span>
              <span className="detail-value">
                {new Date(member.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Courses taught */}
        <div className="detail-card">
          <div className="detail-card-title">
            <BookOpen size={15} /> Courses Teaching ({courses.length})
          </div>
          {loading ? (
            <div className="loading" style={{ padding: 24 }}>
              <Spinner size={16} /> Loading…
            </div>
          ) : courses.length === 0 ? (
            <p
              style={{
                fontSize: 13,
                color: "var(--text-tertiary)",
                padding: "12px 0",
              }}
            >
              No courses assigned.
            </p>
          ) : (
            <div
              className="table-container"
              style={{ boxShadow: "none", border: "none" }}
            >
              <table className="table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Credits</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c._id}>
                      <td>
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
                      <td>
                        <Badge variant={c.type === "core" ? "info" : "warning"}>
                          {c.type}
                        </Badge>
                      </td>
                      <td style={{ textAlign: "center" }}>{c.credits}</td>
                      <td>
                        <Badge variant={c.isActive ? "success" : "danger"}>
                          {c.isActive ? "Active" : "Inactive"}
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
    </>
  );
}

export default function Staff() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailTarget, setDetailTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/staff");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (detailTarget) {
    return (
      <StaffDetail member={detailTarget} onBack={() => setDetailTarget(null)} />
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Staff</h2>
          <p>Instructors and staff members</p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={load}
          disabled={loading}
        >
          <RefreshCw size={14} /> Refresh
        </button>
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
            <Spinner /> Loading staff…
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={Users} title="No staff members found" />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr
                    key={s._id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setDetailTarget(s)}
                  >
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {s.email}
                    </td>
                    <td>
                      <Badge variant="purple">{s.role}</Badge>
                    </td>
                    <td>{s.department || "—"}</td>
                    <td>
                      <Badge variant={s.isActive ? "success" : "danger"}>
                        {s.isActive ? "Active" : "Inactive"}
                      </Badge>
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
