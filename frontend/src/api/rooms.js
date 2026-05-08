import { apiFetch } from './http'

export function getAvailableRooms({ date, startTime, endTime, type, building, minCapacity, hasProjector }) {
    const params = new URLSearchParams({ date, startTime, endTime })
    if (type) params.set('type', type)
    if (building) params.set('building', building)
    if (minCapacity) params.set('minCapacity', minCapacity)
    if (hasProjector !== undefined && hasProjector !== '') params.set('hasProjector', hasProjector)
    return apiFetch(`/api/rooms/available?${params}`)
}

export function getRoomsStatus({ date, time, type, building } = {}) {
    const params = new URLSearchParams()
    if (date) params.set('date', date)
    if (time) params.set('time', time)
    if (type) params.set('type', type)
    if (building) params.set('building', building)
    return apiFetch(`/api/rooms/status?${params}`)
}

export function getRoomTimetable(roomId, { startDate, endDate }) {
    const params = new URLSearchParams({ startDate, endDate })
    return apiFetch(`/api/rooms/${roomId}/timetable?${params}`)
}

export function getCalendarBookings({ startDate, endDate, roomId, type, building } = {}) {
    const params = new URLSearchParams({ startDate, endDate })
    if (roomId) params.set('roomId', roomId)
    if (type) params.set('type', type)
    if (building) params.set('building', building)
    return apiFetch(`/api/bookings/calendar?${params}`)
}

export function listRooms() {
    return apiFetch('/api/rooms')
}

export function createBooking(payload) {
    return apiFetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

export function deleteBooking(id) {
    return apiFetch(`/api/bookings/${id}`, { method: 'DELETE' })
}

export function getMyBookings(bookedByName) {
    const params = new URLSearchParams({ bookedByName })
    return apiFetch(`/api/bookings?${params}`)
}

export function getPendingBookings() {
    return apiFetch('/api/bookings?status=pending')
}

export function updateBookingStatus(id, status) {
    return apiFetch(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    })
}
