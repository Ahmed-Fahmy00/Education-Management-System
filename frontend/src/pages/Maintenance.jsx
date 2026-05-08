import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Wrench,
    AlertTriangle,
    CheckCircle,
    Clock,
    RefreshCw,
    Send,
} from "lucide-react";
import { apiFetch } from "../api/http";
import { UserLayout } from "./Home";

const PRIORITIES = ["low", "medium", "high", "critical"];

const PRIORITY_COLORS = {
    low: { background: "#dcfce7", color: "#15803d" },
    medium: { background: "#fef9c3", color: "#854d0e" },
    high: { background: "#fee2e2", color: "#dc2626" },
    critical: { background: "#fce7f3", color: "#9d174d" },
};

const STATUS_COLORS = {
    open: { background: "#fee2e2", color: "#dc2626" },
    "in-progress": { background: "#fef9c3", color: "#854d0e" },
    resolved: { background: "#dcfce7", color: "#15803d" },
};

function fmtDate(iso) {
    return new Date(iso).toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function StatusIcon({ status }) {
    if (status === "resolved") return <CheckCircle size={14} />;
    if (status === "in-progress") return <Clock size={14} />;
    return <AlertTriangle size={14} />;
}

export default function Maintenance() {
    const navigate = useNavigate();
    const [user] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    });

    const [rooms, setRooms] = useState([]);
    const [form, setForm] = useState({
        room: "",
        issueDescription: "",
        priority: "medium",
    });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const [myReports, setMyReports] = useState(null);
    const [loadingReports, setLoadingReports] = useState(false);
    const [reportsError, setReportsError] = useState("");

    const [activeTab, setActiveTab] = useState(0); // 0 = report form, 1 = my submissions

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    // Load rooms for the select
    useEffect(() => {
        apiFetch("/api/rooms")
            .then((data) => setRooms(Array.isArray(data) ? data : []))
            .catch(() => { });
    }, []);

    const loadMyReports = useCallback(async () => {
        if (!user?.name) return;
        setLoadingReports(true);
        setReportsError("");
        try {
            const data = await apiFetch(`/api/maintenance`);
            // Backend already filters to own reports for non-admin users
            const all = Array.isArray(data) ? data : [];
            setMyReports(all);
        } catch (e) {
            setReportsError(e.message || "Failed to load");
        } finally {
            setLoadingReports(false);
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 1) loadMyReports();
    }, [activeTab, loadMyReports]);

    function set(field, value) {
        setForm((f) => ({ ...f, [field]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError("");
        setSuccessMsg("");
        if (!form.room) { setFormError("Please select a room."); return; }
        if (!form.issueDescription.trim()) { setFormError("Please describe the issue."); return; }

        setSubmitting(true);
        try {
            await apiFetch("/api/maintenance", {
                method: "POST",
                body: JSON.stringify({
                    room: form.room,
                    issueDescription: form.issueDescription.trim(),
                    priority: form.priority,
                    reportedBy: user?.name || "Unknown",
                }),
            });
            setSuccessMsg("Report submitted! The admin has been notified.");
            setForm({ room: "", issueDescription: "", priority: "medium" });
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    if (!user) {
        navigate("/login");
        return null;
    }

    return (
        <UserLayout user={user} onLogout={handleLogout}>
            <div style={{ maxWidth: 760, margin: "0 auto", padding: "1.5rem 1rem" }}>
                <div style={{ marginBottom: "1.5rem" }}>
                    <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Wrench size={20} /> Maintenance Reports
                    </h2>
                    <p style={{ margin: "0.25rem 0 0", color: "#6b7280", fontSize: "0.875rem" }}>
                        Report a facility issue and track its resolution status.
                    </p>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", borderBottom: "2px solid #e5e7eb", marginBottom: "1.5rem" }}>
                    {["Submit a Report", "My Submissions"].map((label, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveTab(i)}
                            style={{
                                background: "none",
                                border: "none",
                                padding: "0.6rem 1.2rem",
                                cursor: "pointer",
                                fontSize: "0.9rem",
                                fontWeight: activeTab === i ? 600 : 400,
                                color: activeTab === i ? "#2563eb" : "#6b7280",
                                borderBottom: activeTab === i ? "2px solid #2563eb" : "2px solid transparent",
                                marginBottom: -2,
                                transition: "color 0.15s",
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── Tab 0: Submit Form ── */}
                {activeTab === 0 && (
                    <div style={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        padding: "1.75rem",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}>
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            {/* Room */}
                            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem", fontWeight: 500 }}>
                                Room / Location *
                                <select
                                    required
                                    value={form.room}
                                    onChange={(e) => set("room", e.target.value)}
                                    style={{ padding: "0.6rem 0.75rem", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.9rem", background: "#fff" }}
                                >
                                    <option value="">Select a room…</option>
                                    {rooms.map((r) => (
                                        <option key={r._id} value={r._id}>
                                            {r.name} — {r.building} ({r.type})
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {/* Issue Description */}
                            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem", fontWeight: 500 }}>
                                Issue Description *
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Describe the problem in detail — e.g. 'Projector not working', 'Air conditioning broken', 'Leaking pipe near window'…"
                                    value={form.issueDescription}
                                    onChange={(e) => set("issueDescription", e.target.value)}
                                    style={{ padding: "0.6rem 0.75rem", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.9rem", resize: "vertical" }}
                                />
                            </label>

                            {/* Priority */}
                            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem", fontWeight: 500 }}>
                                Priority
                                <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                                    {PRIORITIES.map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => set("priority", p)}
                                            style={{
                                                padding: "0.4rem 1rem",
                                                border: form.priority === p ? "2px solid #2563eb" : "1px solid #d1d5db",
                                                borderRadius: 20,
                                                cursor: "pointer",
                                                fontSize: "0.85rem",
                                                fontWeight: form.priority === p ? 600 : 400,
                                                background: form.priority === p
                                                    ? (PRIORITY_COLORS[p]?.background || "#e0e7ff")
                                                    : "#fff",
                                                color: form.priority === p
                                                    ? (PRIORITY_COLORS[p]?.color || "#1e40af")
                                                    : "#374151",
                                                transition: "all 0.15s",
                                            }}
                                        >
                                            {p.charAt(0).toUpperCase() + p.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </label>

                            {/* Reported by (read-only) */}
                            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem", fontWeight: 500, color: "#6b7280" }}>
                                Reported By
                                <input
                                    readOnly
                                    value={user?.name || ""}
                                    style={{ padding: "0.6rem 0.75rem", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: "0.9rem", background: "#f9fafb", color: "#6b7280" }}
                                />
                            </label>

                            {formError && (
                                <p style={{ margin: 0, color: "#dc2626", fontSize: "0.85rem", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, padding: "0.5rem 0.75rem" }}>
                                    {formError}
                                </p>
                            )}
                            {successMsg && (
                                <p style={{ margin: 0, color: "#15803d", fontSize: "0.85rem", background: "#dcfce7", border: "1px solid #86efac", borderRadius: 6, padding: "0.5rem 0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                    <CheckCircle size={14} /> {successMsg}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    padding: "0.7rem 1.5rem",
                                    background: submitting ? "#93c5fd" : "#2563eb",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 7,
                                    fontSize: "0.9rem",
                                    fontWeight: 600,
                                    cursor: submitting ? "not-allowed" : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    alignSelf: "flex-start",
                                }}
                            >
                                <Send size={16} />
                                {submitting ? "Submitting…" : "Submit Report"}
                            </button>
                        </form>
                    </div>
                )}

                {/* ── Tab 1: My Submissions ── */}
                {activeTab === 1 && (
                    <div>
                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
                            <button
                                onClick={loadMyReports}
                                disabled={loadingReports}
                                style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.45rem 1rem", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: "0.85rem" }}
                            >
                                <RefreshCw size={14} /> Refresh
                            </button>
                        </div>
                        {reportsError && (
                            <p style={{ color: "#dc2626", fontSize: "0.85rem" }}>{reportsError}</p>
                        )}
                        {loadingReports ? (
                            <p style={{ color: "#6b7280", textAlign: "center", padding: "2rem 0" }}>Loading…</p>
                        ) : myReports === null ? null : myReports.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "3rem 0", color: "#6b7280" }}>
                                <Wrench size={36} style={{ opacity: 0.3, marginBottom: "0.75rem" }} />
                                <p>You have no maintenance reports yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {myReports.map((r) => (
                                    <div
                                        key={r._id}
                                        style={{
                                            background: "#fff",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: 8,
                                            padding: "1rem 1.25rem",
                                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                                            <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem", flex: 1 }}>
                                                {r.issueDescription}
                                            </p>
                                            <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                                                <span style={{ ...PRIORITY_COLORS[r.priority], padding: "0.2rem 0.6rem", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600 }}>
                                                    {r.priority}
                                                </span>
                                                <span style={{ ...STATUS_COLORS[r.status], padding: "0.2rem 0.6rem", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                                    <StatusIcon status={r.status} /> {r.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#6b7280", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                                            {r.room?.name && <span>📍 {r.room.name}, {r.room.building}</span>}
                                            <span>📅 {fmtDate(r.createdAt)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </UserLayout>
    );
}
