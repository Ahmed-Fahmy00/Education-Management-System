import { useState, useCallback, useEffect } from "react";
import { RefreshCw, AlertCircle, Wrench, CheckCircle2 } from "lucide-react";
import { apiFetch, Badge, Spinner, EmptyState } from "./shared";

const PRIORITY_VARIANT = {
  low: "success",
  medium: "warning",
  high: "danger",
  critical: "danger",
};
const STATUS_VARIANT = {
  open: "danger",
  "in-progress": "warning",
  resolved: "success",
};

export default function Maintenance() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const url =
        filter !== "all"
          ? `/api/maintenance?status=${filter}`
          : "/api/maintenance";
      const res = await apiFetch(url, { headers: { "x-user-role": "admin" } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id, status) => {
    setActionId(id);
    try {
      const res = await apiFetch(`/api/maintenance/${id}/status`, {
        method: "PATCH",
        headers: { "x-user-role": "admin" },
        body: JSON.stringify({ status }),
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

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Maintenance</h2>
          <p>Track and resolve facility maintenance reports</p>
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
        <div className="filter-tabs">
          {["all", "open", "in-progress", "resolved"].map((t) => (
            <button
              key={t}
              className={`filter-tab ${filter === t ? "active" : ""}`}
              onClick={() => setFilter(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
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
            <Spinner /> Loading reports…
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={Wrench} title="No maintenance reports" />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Reported By</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600, maxWidth: 280 }}>
                      {r.issueDescription}
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {r.reportedBy || "—"}
                    </td>
                    <td>
                      <Badge
                        variant={PRIORITY_VARIANT[r.priority] || "secondary"}
                      >
                        {r.priority}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={STATUS_VARIANT[r.status] || "secondary"}>
                        {r.status}
                      </Badge>
                    </td>
                    <td>
                      {r.status !== "resolved" && (
                        <div className="action-buttons">
                          {r.status === "open" && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => updateStatus(r._id, "in-progress")}
                              disabled={actionId === r._id}
                            >
                              {actionId === r._id ? (
                                <Spinner size={13} />
                              ) : null}{" "}
                              In Progress
                            </button>
                          )}
                          {r.status === "in-progress" && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => updateStatus(r._id, "resolved")}
                              disabled={actionId === r._id}
                            >
                              {actionId === r._id ? (
                                <Spinner size={13} />
                              ) : (
                                <CheckCircle2 size={13} />
                              )}{" "}
                              Resolve
                            </button>
                          )}
                        </div>
                      )}
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
