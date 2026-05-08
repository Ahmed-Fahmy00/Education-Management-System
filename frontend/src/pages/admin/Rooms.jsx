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
  Search,
  X,
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
      {/* ── Back bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={14} /> Back to Rooms
        </button>
      </div>

      {/* ── Hero card — all room details here ── */}
      <div className="detail-hero-card">
        <div className="detail-hero-info" style={{ flex: 1 }}>
          <div className="detail-hero-name">{room.name}</div>
          <div className="detail-hero-sub">
            {room.building || "No building assigned"}
          </div>

          {/* ── Inline detail grid ── */}
          <div className="room-hero-details">
            <div className="room-hero-detail-item">
              <span className="room-hero-detail-label">
                <Building2 size={13} /> Building
              </span>
              <span className="room-hero-detail-value">
                {room.building || "—"}
              </span>
            </div>
            <div className="room-hero-detail-item">
              <span className="room-hero-detail-label">
                <DoorOpen size={13} /> Type
              </span>
              <span className="room-hero-detail-value">
                <Badge variant="info">{room.type}</Badge>
              </span>
            </div>
            <div className="room-hero-detail-item">
              <span className="room-hero-detail-label">
                <Users size={13} /> Capacity
              </span>
              <span className="room-hero-detail-value">{room.capacity}</span>
            </div>
            <div className="room-hero-detail-item">
              <span className="room-hero-detail-label">
                <CheckCircle2 size={13} /> Projector
              </span>
              <span className="room-hero-detail-value">
                {room.hasProjector ? (
                  <span
                    style={{
                      color: "var(--accent-success)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle2 size={14} /> Available
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
                    <XCircle size={14} /> Not available
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bookings card — full width ── */}
      <div className="detail-card">
        <div className="detail-card-title">
          <Calendar size={14} /> Upcoming Bookings (next 30 days)
          <span className="detail-card-count">{bookings.length}</span>
        </div>
        {loading ? (
          <div className="loading" style={{ padding: 32 }}>
            <Spinner size={16} /> Loading…
          </div>
        ) : bookings.length === 0 ? (
          <div className="detail-empty">
            <Calendar size={32} />
            <p>No upcoming bookings</p>
          </div>
        ) : (
          <div className="table-responsive">
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
                    <td style={{ fontWeight: 600 }}>{fmtDate(b.startsAt)}</td>
                    <td
                      style={{ color: "var(--text-secondary)", fontSize: 13 }}
                    >
                      {fmtTime(b.startsAt)} – {fmtTime(b.endsAt)}
                    </td>
                    <td>{b.title}</td>
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
    </>
  );
}

export default function Rooms() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
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

  const filtered = items.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const projectorText = r.hasProjector ? "yes projector" : "no projector";
    return (
      (r.name || "").toLowerCase().includes(q) ||
      (r.type || "").toLowerCase().includes(q) ||
      (r.building || "").toLowerCase().includes(q) ||
      String(r.capacity || "").includes(q) ||
      projectorText.includes(q)
    );
  });

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

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={15} />
          <input
            placeholder="Search by name, type, or building…"
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
            {filtered.length} of {items.length} room
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
            <Spinner /> Loading rooms…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={DoorOpen}
            title={search ? "No rooms match your search" : "No rooms found"}
            desc={search ? "Try a different name or building." : ""}
          />
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
                {filtered.map((r) => (
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
