import React, { useState } from 'react';
import { leaveApi } from '../api/leave';

const LEAVE_TYPES = [
  'Annual Leave',
  'Sick Leave',
  'Casual Leave',
  'Maternity Leave',
  'Paternity Leave',
  'Study Leave',
  'Unpaid Leave'
];

const LeaveForm = ({ currentUser, onSuccess }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'Annual Leave'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await leaveApi.create(formData, currentUser.id, currentUser.role);
      if (response.success) {
        setSuccess('Leave request submitted successfully!');
        setFormData({
          startDate: '',
          endDate: '',
          leaveType: 'Annual Leave'
        });
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="leave-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Start Date</label>
        <input
          type="date"
          name="startDate"
          className="form-input"
          value={formData.startDate}
          onChange={handleChange}
          required
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="form-group">
        <label>End Date</label>
        <input
          type="date"
          name="endDate"
          className="form-input"
          value={formData.endDate}
          onChange={handleChange}
          required
          min={formData.startDate || new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="form-group full-width">
        <label>Leave Type</label>
        <select
          name="leaveType"
          className="form-input"
          value={formData.leaveType}
          onChange={handleChange}
          required
        >
          {LEAVE_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {error && <div className="error-msg full-width" style={{ color: '#ef4444', background: '#fef2f2', padding: '0.8rem', borderRadius: '8px', border: '1px solid #fee2e2' }}>{error}</div>}
      {success && <div className="success-msg full-width" style={{ color: '#16a34a', background: '#f0fdf4', padding: '0.8rem', borderRadius: '8px', border: '1px solid #dcfce7' }}>{success}</div>}

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  );
};

export default LeaveForm;
