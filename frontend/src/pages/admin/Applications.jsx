import { useState, useCallback, useEffect } from "react";
import {
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCheck,
  X,
} from "lucide-react";
import { apiFetch, Badge, Spinner, EmptyState } from "./shared";

export default function Applications({ adminId, onCountChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/users/admin/pending-applications");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const apps = data.applications || [];
      setItems(apps);
      onCountChange?.(apps.length);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (id) => {
    setActionId(id);
    try {
      const res = await apiFetch(`/api/users/admin/approve/${id}`, {
        method: "POST",
        body: JSON.stringify({ adminId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setActionId(null);
    }
  };

  const reject = async (id) => {
    const reason = window.prompt("Rejection reason (optional):", "");
    if (reason === null) return;
    setActionId(id);
    try {
      const res = await apiFetch(`/api/users/admin/reject/${id}`, {
        method: "POST",
        body: JSON.stringify({ adminId, reason: reason.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setActionId(null);
    }
  };

  const filtered = items.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (a.name || "").toLowerCase().includes(q) ||
      (a.email || "").toLowerCase().includes(q) ||
      (a.role || "").toLowerCase().includes(q) ||
      (a.department || "").toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Applications</h2>
          <p>Review and approve or reject pending user registrations</p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={load}
          disabled={loading}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={15} />
          <input
            placeholder="Search by name, email, role, or department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-tertiary)",
                display: "flex",
                padding: 0,
              }}
              onClick={() => setSearch("")}
            >
              <X size={14} />
            </button>
          )}
        </div>
        {!loading && (
          <span
            style={{
              fontSize: 13,
              color: "var(--text-tertiary)",
              marginLeft: "auto",
            }}
          >
            {filtered.length} of {items.length} application
            {items.length !== 1 ? "s" : ""}
          </span>
        )}
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
            <Spinner /> Loading applications…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No pending applications"
            desc="All caught up!"
          />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a._id}>
                    <td style={{ fontWeight: 600 }}>{a.name}</td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {a.email}
                    </td>
                    <td>
                      <Badge variant={a.role === "student" ? "info" : "purple"}>
                        {a.role}
                      </Badge>
                    </td>
                    <td
                      style={{ color: "var(--text-secondary)", fontSize: 13 }}
                    >
                      {a.department || "—"}
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => approve(a._id)}
                          disabled={actionId === a._id}
                        >
                          {actionId === a._id ? (
                            <Spinner size={13} />
                          ) : (
                            <CheckCircle2 size={13} />
                          )}{" "}
                          Approve
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{
                            color: "var(--accent-danger)",
                            borderColor: "rgba(239,68,68,0.3)",
                          }}
                          onClick={() => reject(a._id)}
                          disabled={actionId === a._id}
                        >
                          <XCircle size={13} /> Reject
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
