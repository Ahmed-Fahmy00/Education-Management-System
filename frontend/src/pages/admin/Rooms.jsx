import { useState, useCallback, useEffect } from "react";
import {
  RefreshCw,
  AlertCircle,
  DoorOpen,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Building2,
  Users,
  Calendar,
} from "lucide-react";
import { apiFetch, Badge, Spinner, EmptyState } from "./shared";

function RoomDetail({ room, onBack }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const today = new Date().toISOString().slice(0, 10);
        const end = new Date(Date.now() + 30 * 86400000)
          .toISOString()
          .slice(0, 10);
        const res = await apiFetch(
          `/api/bookings?room=${room._id}&startDate=${today}&endDate=${end}`,
        );
        const data = res.ok ? await res.json() : [];
        setBookings(Array.isArray(data) ? data : []);
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [room._id]);

  function fmtTime(iso) {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={onBack}>
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <h2 style={{ marginBottom: 2 }}>{room.name}</h2>
            <p>
              {room.building || "No building"} · {room.type}
            </p>
          </div>
        </div>
        <Badge variant="info">{room.type}</Badge>
      </div>

      <div className="detail-grid-layout">
        {/* Info */}
        <div className="detail-card" style={{ alignSelf: "start" }}>
          <div className="detail-card-title">Room Information</div>
          <div className="detail-rows">
            <div className="detail-row">
              <span className="detail-label">Name</span>
              <span className="detail-value">{room.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Type</span>
              <span className="detail-value">
                <Badge variant="info">{room.type}</Badge>
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">
                <Building2 size={13} /> Building
              </span>
              <span className="detail-value">{room.building || "—"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">
                <Users size={13} /> Capacity
              </span>
              <span className="detail-value">{room.capacity}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Projector</span>
              <span className="detail-value">
                {room.hasProjector ? (
                  <span
                    style={{
                      color: "var(--accent-success)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <CheckCircle2 size={15} /> Yes
                  </span>
                ) : (
                  <span
                    style={{
                      color: "var(--text-tertiary)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <XCircle size={15} /> No
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Upcoming bookings */}
        <div className="detail-card">
          <div className="detail-card-title">
            <Calendar size={15} /> Upcoming Bookings (next 30 days)
          </div>
          {loading ? (
            <div className="loading" style={{ padding: 24 }}>
              <Spinner size={16} /> Loading…
            </div>
          ) : bookings.length === 0 ? (
            <p
              style={{
                fontSize: 13,
                color: "var(--text-tertiary)",
                padding: "12px 0",
              }}
            >
              No upcoming bookings.
            </p>
          ) : (
            <div
              className="table-container"
              style={{ boxShadow: "none", border: "none" }}
            >
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Title</th>
                    <th>Booked By</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td>{fmtDate(b.startsAt)}</td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {fmtTime(b.startsAt)} – {fmtTime(b.endsAt)}
                      </td>
                      <td style={{ fontWeight: 600 }}>{b.title}</td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {b.bookedByName}{" "}
                        <Badge variant="secondary">{b.bookedByRole}</Badge>
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

export default function Rooms() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailTarget, setDetailTarget] = useState(null);

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

  if (detailTarget) {
    return (
      <RoomDetail room={detailTarget} onBack={() => setDetailTarget(null)} />
    );
  }

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
                  <tr
                    key={r._id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setDetailTarget(r)}
                  >
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
