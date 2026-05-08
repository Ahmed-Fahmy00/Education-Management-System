import React, { useState, useEffect, useCallback } from 'react';
import { officeHoursApi } from '../api/officeHours';
import AddOfficeHour from './AddOfficeHour';
import '../styles/OfficeHours.css';

const OfficeHours = ({ staffId, currentUser }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if current user is the owner or an admin/staff with permission
  const isOwner = currentUser && currentUser.id === staffId;
  const canManage = isOwner && (currentUser.role === 'professor' || currentUser.role === 'TA' || currentUser.role === 'instructor');

  const fetchOfficeHours = useCallback(async () => {
    try {
      const response = await officeHoursApi.getByStaffId(staffId);
      if (response.success) {
        setSlots(response.data);
      }
    } catch (err) {
      console.error('Error fetching office hours:', err);
      setError('Failed to load office hours');
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    fetchOfficeHours();

    // Auto-refresh every 30 seconds to update status
    const interval = setInterval(() => {
      fetchOfficeHours();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchOfficeHours]);

  const handleAddSlot = async (newSlot) => {
    const response = await officeHoursApi.create(newSlot, currentUser.id, currentUser.role);
    if (response.success) {
      await fetchOfficeHours();
    } else {
      throw new Error(response.message || 'Failed to add slot');
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;
    
    try {
      const response = await officeHoursApi.delete(id, currentUser.id, currentUser.role);
      if (response.success) {
        await fetchOfficeHours();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete slot');
    }
  };

  if (loading && slots.length === 0) {
    return <div className="office-hours-container">Loading office hours...</div>;
  }

  return (
    <div className="office-hours-container">
      <div className="office-hours-header">
        <h2>Office Hours</h2>
        {canManage && <span className="admin-pill">Manage Mode</span>}
      </div>

      {canManage && (
        <AddOfficeHour 
          onAdd={handleAddSlot} 
          userId={currentUser.id} 
          userRole={currentUser.role} 
        />
      )}

      {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="slots-grid">
        {slots.length === 0 ? (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
            No office hours scheduled.
          </p>
        ) : (
          slots.map((slot) => (
            <div key={slot._id} className="slot-card">
              <div className="slot-day">{slot.dayOfWeek}</div>
              <div className="slot-time">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {slot.startTime} - {slot.endTime}
              </div>
              <div className={`status-badge ${slot.status === 'Available' ? 'status-available' : 'status-not-available'}`}>
                {slot.status}
              </div>
              
              {canManage && (
                <button 
                  className="delete-btn" 
                  onClick={() => handleDeleteSlot(slot._id)}
                  title="Delete Slot"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OfficeHours;
