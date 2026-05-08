import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, RefreshCw, Building2, Clock } from "lucide-react";
import { apiFetch, Badge, Spinner, EmptyState } from "./shared";

function fmtDate(iso) {
    return new Date(iso).toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
function fmtTime(iso) {
    return new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function BookingRequests() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await apiFetch("/api/bookings?status=pending");
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to load");
            setBookings(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    async function handleAction(id, status) {
        setActionLoading(id + status);
        try {
            const res = await apiFetch(`/api/bookings/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.message || "Action failed");
            }
            setBookings((prev) => prev.filter((b) => b._id !== id));
        } catch (e) {
            alert(e.message);
        } finally {
            setActionLoading(null);
        }
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <h2>Booking Requests</h2>
                    <p>Pending room booking requests from students and instructors</p>
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
                <p style={{ color: "#dc2626", padding: "0.75rem 0" }}>{error}</p>
            )}

            {loading ? (
                <div className="loading" style={{ padding: 40 }}>
                    <Spinner size={18} /> Loading…
                </div>
            ) : bookings.length === 0 ? (
                <EmptyState
                    icon={CheckCircle2}
                    title="No pending requests"
                    desc="All booking requests have been reviewed."
                />
            ) : (
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Requested By</th>
                                <th>Room</th>
                                <th>Title</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((b) => (
                                <tr key={b._id}>
                                    <td>
                                        <span style={{ fontWeight: 500 }}>{b.bookedByName}</span>
                                        <br />
                                        <Badge variant="secondary">{b.bookedByRole}</Badge>
                                    </td>
                                    <td>
                                        {b.room?.name ? (
                                            <>
                                                <span style={{ fontWeight: 500 }}>{b.room.name}</span>
                                                {b.room.building && (
                                                    <>
                                                        <br />
                                                        <small style={{ color: "var(--text-secondary)" }}>
                                                            <Building2
                                                                size={11}
                                                                style={{ verticalAlign: "middle" }}
                                                            />{" "}
                                                            {b.room.building}
                                                        </small>
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <span style={{ color: "var(--text-secondary)" }}>
                                                Room #{b.room}
                                            </span>
                                        )}
                                    </td>
                                    <td>{b.title}</td>
                                    <td style={{ whiteSpace: "nowrap" }}>{fmtDate(b.startsAt)}</td>
                                    <td style={{ whiteSpace: "nowrap", color: "var(--text-secondary)", fontSize: 13 }}>
                                        <Clock size={12} style={{ verticalAlign: "middle" }} />{" "}
                                        {fmtTime(b.startsAt)} – {fmtTime(b.endsAt)}
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: "0.4rem" }}>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleAction(b._id, "approved")}
                                                disabled={actionLoading !== null}
                                                style={{ fontSize: 12 }}
                                            >
                                                <CheckCircle2 size={13} /> Approve
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleAction(b._id, "rejected")}
                                                disabled={actionLoading !== null}
                                                style={{ fontSize: 12 }}
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
        </>
    );
}
