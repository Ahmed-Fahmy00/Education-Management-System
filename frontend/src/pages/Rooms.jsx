import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Search, Calendar, Clock, Building2,
    CheckCircle, XCircle, Trash2, Plus, RefreshCw,
} from 'lucide-react'
import {
    getAvailableRooms, getRoomsStatus, getRoomTimetable,
    getCalendarBookings, createBooking, deleteBooking, listRooms,
} from '../api/rooms'
import '../styles/rooms.css'

const TABS = ['Available Rooms', 'Room Status', 'Timetable', 'Calendar']
const BOOKER_ROLES = ['staff', 'admin', 'professor', 'ta']
const ROOM_TYPES = ['', 'classroom', 'lab', 'hall']

function today() {
    return new Date().toISOString().slice(0, 10)
}

function fmtTime(iso) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function fmtDate(iso) {
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function StatusBadge({ status }) {
    return (
        <span className={`status-badge ${status === 'available' ? 'badge-available' : 'badge-booked'}`}>
            {status === 'available'
                ? <><CheckCircle size={13} /> Available</>
                : <><XCircle size={13} /> Booked</>}
        </span>
    )
}

// ─── Book Modal ────────────────────────────────────────────────────────────────
function BookModal({ room, user, onClose, onBooked }) {
    const [form, setForm] = useState({
        title: '',
        startsAt: '',
        endsAt: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    function set(field, value) {
        setForm(f => ({ ...f, [field]: value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await createBooking({
                room: room.roomId,
                title: form.title,
                bookedByName: user.name,
                bookedByRole: user.role,
                startsAt: form.startsAt,
                endsAt: form.endsAt,
            })
            onBooked()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Book Room — {room.name}</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <label>
                        Title
                        <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Physics Lab Session" />
                    </label>
                    <label>
                        Start (date &amp; time)
                        <input required type="datetime-local" value={form.startsAt} onChange={e => set('startsAt', e.target.value)} />
                    </label>
                    <label>
                        End (date &amp; time)
                        <input required type="datetime-local" value={form.endsAt} onChange={e => set('endsAt', e.target.value)} />
                    </label>
                    {error && <p className="form-error">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Booking…' : 'Confirm Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Tab 1: Available Rooms ────────────────────────────────────────────────────
function AvailableRoomsTab({ user }) {
    const [filters, setFilters] = useState({
        date: today(), startTime: '09:00', endTime: '11:00',
        type: '', building: '', minCapacity: '', hasProjector: '',
    })
    const [rooms, setRooms] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [bookingRoom, setBookingRoom] = useState(null)
    const [successMsg, setSuccessMsg] = useState('')

    function set(field, value) {
        setFilters(f => ({ ...f, [field]: value }))
    }

    async function handleSearch(e) {
        e.preventDefault()
        setError(''); setSuccessMsg(''); setLoading(true)
        try {
            const result = await getAvailableRooms(filters)
            setRooms(result)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    function handleBooked() {
        setBookingRoom(null)
        setSuccessMsg('Booking created successfully!')
        handleSearch({ preventDefault: () => { } })
    }

    const canBook = BOOKER_ROLES.includes(user?.role)

    return (
        <div>
            <form className="filter-form" onSubmit={handleSearch}>
                <div className="filter-row">
                    <label>
                        Date *
                        <input type="date" required value={filters.date} onChange={e => set('date', e.target.value)} />
                    </label>
                    <label>
                        Start Time *
                        <input type="time" required value={filters.startTime} onChange={e => set('startTime', e.target.value)} />
                    </label>
                    <label>
                        End Time *
                        <input type="time" required value={filters.endTime} onChange={e => set('endTime', e.target.value)} />
                    </label>
                </div>
                <div className="filter-row">
                    <label>
                        Type
                        <select value={filters.type} onChange={e => set('type', e.target.value)}>
                            <option value="">All types</option>
                            {ROOM_TYPES.filter(Boolean).map(t => <option key={t}>{t}</option>)}
                        </select>
                    </label>
                    <label>
                        Building
                        <input placeholder="Any building" value={filters.building} onChange={e => set('building', e.target.value)} />
                    </label>
                    <label>
                        Min Capacity
                        <input type="number" min="1" placeholder="Any" value={filters.minCapacity} onChange={e => set('minCapacity', e.target.value)} />
                    </label>
                    <label>
                        Projector
                        <select value={filters.hasProjector} onChange={e => set('hasProjector', e.target.value)}>
                            <option value="">Any</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </label>
                </div>
                <button className="btn-primary btn-search" type="submit" disabled={loading}>
                    <Search size={16} /> {loading ? 'Searching…' : 'Find Available Rooms'}
                </button>
            </form>

            {successMsg && <p className="success-msg">{successMsg}</p>}
            {error && <p className="form-error">{error}</p>}

            {rooms !== null && (
                <div className="results-section">
                    <p className="results-count">{rooms.length} room{rooms.length !== 1 ? 's' : ''} available</p>
                    {rooms.length === 0
                        ? <p className="empty-msg">No rooms match your criteria for that time slot.</p>
                        : (
                            <div className="rooms-grid">
                                {rooms.map(room => (
                                    <div key={room._id} className="room-card">
                                        <div className="room-card-header">
                                            <span className="room-id-badge">#{room.roomId}</span>
                                            <span className="room-type-tag">{room.type}</span>
                                        </div>
                                        <h4 className="room-name">{room.name}</h4>
                                        <div className="room-meta">
                                            <span><Building2 size={13} /> {room.building}</span>
                                            <span>👥 {room.capacity}</span>
                                            {room.hasProjector && <span>📽 Projector</span>}
                                        </div>
                                        {canBook && (
                                            <button className="btn-book" onClick={() => setBookingRoom(room)}>
                                                <Plus size={14} /> Book
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )
                    }
                </div>
            )}

            {bookingRoom && (
                <BookModal
                    room={bookingRoom}
                    user={user}
                    onClose={() => setBookingRoom(null)}
                    onBooked={handleBooked}
                />
            )}
        </div>
    )
}

// ─── Tab 2: Room Status ────────────────────────────────────────────────────────
function RoomStatusTab({ user }) {
    const [filters, setFilters] = useState({ date: '', time: '', type: '', building: '' })
    const [rooms, setRooms] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [bookingRoom, setBookingRoom] = useState(null)
    const [successMsg, setSuccessMsg] = useState('')

    function set(field, value) { setFilters(f => ({ ...f, [field]: value })) }

    const fetchStatus = useCallback(async () => {
        setError(''); setLoading(true)
        try {
            const result = await getRoomsStatus(filters)
            setRooms(result)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [filters])

    useEffect(() => { fetchStatus() }, [])

    const canBook = BOOKER_ROLES.includes(user?.role)

    return (
        <div>
            <div className="filter-form">
                <div className="filter-row">
                    <label>
                        Date <span className="optional">(blank = now)</span>
                        <input type="date" value={filters.date} onChange={e => set('date', e.target.value)} />
                    </label>
                    <label>
                        Time <span className="optional">(HH:MM)</span>
                        <input type="time" value={filters.time} onChange={e => set('time', e.target.value)} />
                    </label>
                    <label>
                        Type
                        <select value={filters.type} onChange={e => set('type', e.target.value)}>
                            <option value="">All types</option>
                            {ROOM_TYPES.filter(Boolean).map(t => <option key={t}>{t}</option>)}
                        </select>
                    </label>
                    <label>
                        Building
                        <input placeholder="Any" value={filters.building} onChange={e => set('building', e.target.value)} />
                    </label>
                </div>
                <button className="btn-primary btn-search" onClick={fetchStatus} disabled={loading}>
                    <RefreshCw size={16} /> {loading ? 'Loading…' : 'Refresh Status'}
                </button>
            </div>

            {error && <p className="form-error">{error}</p>}
            {successMsg && <p className="success-msg">{successMsg}</p>}

            {rooms !== null && (
                <div className="results-section">
                    <p className="results-count">{rooms.length} room{rooms.length !== 1 ? 's' : ''}</p>
                    <div className="rooms-grid">
                        {rooms.map(room => (
                            <div key={room._id} className={`room-card ${room.status === 'booked' ? 'room-card-booked' : ''}`}>
                                <div className="room-card-header">
                                    <span className="room-id-badge">#{room.roomId}</span>
                                    <StatusBadge status={room.status} />
                                </div>
                                <h4 className="room-name">{room.name}</h4>
                                <div className="room-meta">
                                    <span><Building2 size={13} /> {room.building}</span>
                                    <span className="room-type-tag">{room.type}</span>
                                    <span>👥 {room.capacity}</span>
                                </div>
                                {room.status === 'booked' && room.currentBooking && (
                                    <div className="current-booking-info">
                                        <p><strong>{room.currentBooking.title}</strong></p>
                                        <p>{room.currentBooking.bookedByName} · {fmtTime(room.currentBooking.startsAt)} – {fmtTime(room.currentBooking.endsAt)}</p>
                                    </div>
                                )}
                                {room.status === 'available' && canBook && (
                                    <button className="btn-book" onClick={() => setBookingRoom(room)}>
                                        <Plus size={14} /> Book
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {bookingRoom && (
                <BookModal
                    room={bookingRoom}
                    user={user}
                    onClose={() => setBookingRoom(null)}
                    onBooked={() => { setBookingRoom(null); setSuccessMsg('Booking created!'); fetchStatus() }}
                />
            )}
        </div>
    )
}

// ─── Tab 3: Timetable ─────────────────────────────────────────────────────────
function TimetableTab() {
    const [allRooms, setAllRooms] = useState([])
    const [selectedRoomId, setSelectedRoomId] = useState('')
    const [dates, setDates] = useState({ startDate: today(), endDate: today() })
    const [timetable, setTimetable] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        listRooms().then(setAllRooms).catch(() => { })
    }, [])

    async function handleFetch(e) {
        e.preventDefault()
        if (!selectedRoomId) return
        setError(''); setLoading(true)
        try {
            const result = await getRoomTimetable(selectedRoomId, dates)
            setTimetable(result)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <form className="filter-form" onSubmit={handleFetch}>
                <div className="filter-row">
                    <label>
                        Room *
                        <select required value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)}>
                            <option value="">Select a room…</option>
                            {allRooms.map(r => (
                                <option key={r._id} value={r.roomId}>#{r.roomId} — {r.name} ({r.building})</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        From *
                        <input type="date" required value={dates.startDate} onChange={e => setDates(d => ({ ...d, startDate: e.target.value }))} />
                    </label>
                    <label>
                        To *
                        <input type="date" required value={dates.endDate} onChange={e => setDates(d => ({ ...d, endDate: e.target.value }))} />
                    </label>
                </div>
                <button className="btn-primary btn-search" type="submit" disabled={loading || !selectedRoomId}>
                    <Calendar size={16} /> {loading ? 'Loading…' : 'View Timetable'}
                </button>
            </form>

            {error && <p className="form-error">{error}</p>}

            {timetable && (
                <div className="results-section">
                    <h4 className="section-sub">
                        {timetable.room?.name} — {timetable.room?.building}
                    </h4>
                    {timetable.bookings.length === 0
                        ? <p className="empty-msg">No bookings in this date range.</p>
                        : (
                            <table className="bookings-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Title</th>
                                        <th>Booked By</th>
                                        <th>Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {timetable.bookings.map(b => (
                                        <tr key={b._id}>
                                            <td>{fmtDate(b.startsAt)}</td>
                                            <td><Clock size={12} /> {fmtTime(b.startsAt)} – {fmtTime(b.endsAt)}</td>
                                            <td>{b.title}</td>
                                            <td>{b.bookedByName}</td>
                                            <td><span className="role-tag">{b.bookedByRole}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
                    }
                </div>
            )}
        </div>
    )
}

// ─── Tab 4: Calendar ──────────────────────────────────────────────────────────
function CalendarTab({ user }) {
    const [filters, setFilters] = useState({
        startDate: today(), endDate: today(), roomId: '', type: '', building: '',
    })
    const [events, setEvents] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [allRooms, setAllRooms] = useState([])

    useEffect(() => {
        listRooms().then(setAllRooms).catch(() => { })
    }, [])

    function set(field, value) { setFilters(f => ({ ...f, [field]: value })) }

    async function handleFetch(e) {
        e.preventDefault()
        setError(''); setLoading(true)
        try {
            const result = await getCalendarBookings(filters)
            setEvents(result)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const canDelete = BOOKER_ROLES.includes(user?.role)

    async function handleDelete(id) {
        if (!window.confirm('Cancel this booking?')) return
        try {
            await deleteBooking(id)
            setEvents(ev => ev.filter(e => e.id !== id))
        } catch (err) {
            alert(err.message)
        }
    }

    return (
        <div>
            <form className="filter-form" onSubmit={handleFetch}>
                <div className="filter-row">
                    <label>
                        From *
                        <input type="date" required value={filters.startDate} onChange={e => set('startDate', e.target.value)} />
                    </label>
                    <label>
                        To *
                        <input type="date" required value={filters.endDate} onChange={e => set('endDate', e.target.value)} />
                    </label>
                    <label>
                        Room
                        <select value={filters.roomId} onChange={e => set('roomId', e.target.value)}>
                            <option value="">All rooms</option>
                            {allRooms.map(r => (
                                <option key={r._id} value={r.roomId}>#{r.roomId} — {r.name}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Type
                        <select value={filters.type} onChange={e => set('type', e.target.value)}>
                            <option value="">All types</option>
                            {ROOM_TYPES.filter(Boolean).map(t => <option key={t}>{t}</option>)}
                        </select>
                    </label>
                </div>
                <button className="btn-primary btn-search" type="submit" disabled={loading}>
                    <Calendar size={16} /> {loading ? 'Loading…' : 'Load Bookings'}
                </button>
            </form>

            {error && <p className="form-error">{error}</p>}

            {events !== null && (
                <div className="results-section">
                    <p className="results-count">{events.length} booking{events.length !== 1 ? 's' : ''}</p>
                    {events.length === 0
                        ? <p className="empty-msg">No bookings in this range.</p>
                        : (
                            <table className="bookings-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Room</th>
                                        <th>Title</th>
                                        <th>Booked By</th>
                                        {canDelete && <th></th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map(ev => (
                                        <tr key={ev.id}>
                                            <td>{fmtDate(ev.start)}</td>
                                            <td>{fmtTime(ev.start)} – {fmtTime(ev.end)}</td>
                                            <td>
                                                <span className="room-type-tag">{ev.roomType}</span>
                                                {' '}{ev.roomName}
                                                <br /><small className="muted">{ev.building}</small>
                                            </td>
                                            <td>{ev.title}</td>
                                            <td>
                                                {ev.bookedByName}
                                                <br /><span className="role-tag">{ev.bookedByRole}</span>
                                            </td>
                                            {canDelete && (
                                                <td>
                                                    <button className="btn-delete" onClick={() => handleDelete(ev.id)} title="Cancel booking">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
                    }
                </div>
            )}
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Rooms() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState(0)
    const [user] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
    })

    return (
        <div className="rooms-page">
            <div className="rooms-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <ArrowLeft size={16} /> Back
                </button>
                <div>
                    <h1>Room Management</h1>
                    <p className="rooms-subtitle">Find, check and book university rooms</p>
                </div>
            </div>

            <div className="rooms-container">
                <div className="tab-bar">
                    {TABS.map((tab, i) => (
                        <button
                            key={tab}
                            className={`tab-btn ${activeTab === i ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab(i)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="tab-content">
                    {activeTab === 0 && <AvailableRoomsTab user={user} />}
                    {activeTab === 1 && <RoomStatusTab user={user} />}
                    {activeTab === 2 && <TimetableTab />}
                    {activeTab === 3 && <CalendarTab user={user} />}
                </div>
            </div>
        </div>
    )
}
