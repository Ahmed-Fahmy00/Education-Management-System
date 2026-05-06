import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  DoorOpen,
  Wrench,
  UserCheck,
  LogOut,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import "../styles/admin.css";

/* ── helpers ──────────────────────────────────────────────────────────────── */
function apiFetch(url, opts = {}) {
  return fetch(url, {
    headers: { "Content-Type": "application/json", ...opts.headers },
    ...opts,
  });
}

function Badge({ variant = "secondary", children }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

function Spinner({ size = 20 }) {
  return <Loader2 size={size} className="spin" />;
}

function EmptyState({ icon: Icon, title = "Nothing here", desc = "" }) {
  return (
    <div className="empty-state">
      <Icon />
      <h3>{title}</h3>
      {desc && <p>{desc}</p>}
    </div>
  );
}

/* ── Overview ─────────────────────────────────────────────────────────────── */
function OverviewSection({ stats }) {
  const cards = [
    {
      label: "Pending Applications",
      value: stats.pending,
      icon: UserCheck,
      color: "blue",
    },
    {
      label: "Total Students",
      value: stats.students,
      icon: GraduationCap,
      color: "purple",
    },
    { label: "Staff Members", value: stats.staff, icon: Users, color: "cyan" },
    {
      label: "Active Courses",
      value: stats.courses,
      icon: BookOpen,
      color: "orange",
    },
    { label: "Rooms", value: stats.rooms, icon: DoorOpen, color: "green" },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Overview</h2>
          <p>A snapshot of the Education Management System</p>
        </div>
      </div>
      <div className="stats-grid">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <div className={`stat-icon ${c.color}`}>
              <c.icon size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-label">{c.label}</div>
              <div className="stat-value">{c.value ?? "—"}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── Applications ─────────────────────────────────────────────────────────── */
function ApplicationsSection({ adminId, onCountChange }) {
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

  const filtered = items.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()),
  );

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
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                          )}
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

/* ── Students ─────────────────────────────────────────────────────────────── */
function StudentsSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async (q = "") => {
    setLoading(true);
    setError("");
    try {
      const url = q
        ? `/api/students?q=${encodeURIComponent(q)}`
        : "/api/students";
      const res = await apiFetch(url);
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

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    load(v);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Students</h2>
          <p>All registered students in the system</p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => load(search)}
          disabled={loading}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={15} />
          <input
            placeholder="Search students…"
            value={search}
            onChange={handleSearch}
          />
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
            <Spinner /> Loading students…
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No students found" />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Student ID</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {s.email}
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {s.studentId || "—"}
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

/* ── Staff ────────────────────────────────────────────────────────────────── */
function StaffSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
                  <tr key={s._id}>
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

/* ── Courses ──────────────────────────────────────────────────────────────── */
function CoursesSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/courses");
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

  const filtered =
    filter === "all" ? items : items.filter((c) => c.type === filter);

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Courses</h2>
          <p>All courses offered in the system</p>
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
          {["all", "core", "elective"].map((t) => (
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
            <Spinner /> Loading courses…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={BookOpen} title="No courses found" />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Credits</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
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
                    <td style={{ color: "var(--text-secondary)" }}>
                      {c.department}
                    </td>
                    <td style={{ textAlign: "center" }}>{c.credits}</td>
                    <td>
                      <Badge variant={c.type === "core" ? "info" : "warning"}>
                        {c.type}
                      </Badge>
                    </td>
                    <td style={{ textAlign: "center" }}>{c.capacity}</td>
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
    </>
  );
}

/* ── Rooms ────────────────────────────────────────────────────────────────── */
function RoomsSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/rooms");
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

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Rooms</h2>
          <p>{items.length} rooms registered</p>
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
            <Spinner /> Loading rooms…
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={DoorOpen} title="No rooms found" />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Building</th>
                  <th>Capacity</th>
                  <th>Projector</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td>
                      <Badge variant="info">{r.type}</Badge>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {r.building || "—"}
                    </td>
                    <td style={{ textAlign: "center" }}>{r.capacity}</td>
                    <td style={{ textAlign: "center" }}>
                      {r.hasProjector ? (
                        <CheckCircle2 size={16} color="var(--accent-success)" />
                      ) : (
                        <XCircle size={16} color="var(--text-tertiary)" />
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

/* ── Maintenance ──────────────────────────────────────────────────────────── */
function MaintenanceSection() {
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

  const priorityVariant = {
    low: "success",
    medium: "warning",
    high: "danger",
    critical: "danger",
  };
  const statusVariant = {
    open: "danger",
    "in-progress": "warning",
    resolved: "success",
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
                        variant={priorityVariant[r.priority] || "secondary"}
                      >
                        {r.priority}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={statusVariant[r.status] || "secondary"}>
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

/* ── Nav config ───────────────────────────────────────────────────────────── */
const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "applications", label: "Applications", icon: UserCheck, badge: true },
  { id: "students", label: "Students", icon: GraduationCap },
  { id: "staff", label: "Staff", icon: Users },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "rooms", label: "Rooms", icon: DoorOpen },
  { id: "maintenance", label: "Maintenance", icon: Wrench },
];

/* ── Main component ───────────────────────────────────────────────────────── */
export default function Admin() {
  const navigate = useNavigate();
  const [section, setSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(null);
  const [overviewStats, setOverviewStats] = useState({
    pending: null,
    students: null,
    staff: null,
    courses: null,
    rooms: null,
  });

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    async function loadStats() {
      try {
        const results = await Promise.allSettled([
          apiFetch("/api/students"),
          apiFetch("/api/staff"),
          apiFetch("/api/courses"),
          apiFetch("/api/rooms"),
          apiFetch("/api/users/admin/pending-applications"),
        ]);

        const parse = async (r) => {
          if (r.status !== "fulfilled") return null;
          try {
            return await r.value.json();
          } catch {
            return null;
          }
        };

        const [sData, stData, cData, rData, aData] = await Promise.all(
          results.map(parse),
        );
        const pending = aData?.applications?.length ?? 0;
        setPendingCount(pending);
        setOverviewStats({
          pending,
          students: Array.isArray(sData) ? sData.length : null,
          staff: Array.isArray(stData) ? stData.length : null,
          courses: Array.isArray(cData) ? cData.length : null,
          rooms: Array.isArray(rData) ? rData.length : null,
        });
      } catch {
        /* non-critical */
      }
    }
    loadStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navTo = (id) => {
    setSection(id);
    setSidebarOpen(false);
  };
  const sectionLabel = NAV.find((n) => n.id === section)?.label ?? "";

  return (
    <div className="admin-app">
      {/* overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h1>EMS Admin</h1>
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              className={`nav-item ${section === id ? "active" : ""}`}
              onClick={() => navTo(id)}
            >
              <Icon size={20} />
              <span>{label}</span>
              {badge && pendingCount > 0 && (
                <span className="nav-badge">{pendingCount}</span>
              )}
              {section === id && (
                <ChevronRight
                  size={14}
                  style={{ marginLeft: "auto", opacity: 0.6 }}
                />
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* main */}
      <div className="main-content">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <span className="topbar-title">{sectionLabel}</span>
          <div className="topbar-right">
            <span className="topbar-admin-label">Administrator</span>
            <button className="topbar-logout-btn" onClick={handleLogout}>
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </header>

        <div className="page-content">
          {section === "overview" && <OverviewSection stats={overviewStats} />}
          {section === "applications" && (
            <ApplicationsSection
              adminId={user?.id || "super-admin"}
              onCountChange={setPendingCount}
            />
          )}
          {section === "students" && <StudentsSection />}
          {section === "staff" && <StaffSection />}
          {section === "courses" && <CoursesSection />}
          {section === "rooms" && <RoomsSection />}
          {section === "maintenance" && <MaintenanceSection />}
        </div>
      </div>
    </div>
  );
}
