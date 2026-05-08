import React, { useState, useEffect, useCallback } from 'react';
import { leaveApi } from '../api/leave';
import '../styles/LeaveSystem.css';

const AdminLeavePanel = ({ currentUser }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  const fetchAllRequests = useCallback(async () => {
    try {
      const params = filter ? { status: filter } : {};
      const response = await leaveApi.getAllRequests(currentUser.id, currentUser.role, params);
      if (response.success) {
        setRequests(response.data);
      }
    } catch (err) {
      setError('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  }, [currentUser, filter]);

  useEffect(() => {
    fetchAllRequests();
  }, [fetchAllRequests]);

  const handleStatusUpdate = async (id, status) => {
    const reason = status === 'rejected' ? window.prompt('Enter rejection reason:') : null;
    if (status === 'rejected' && reason === null) return;

    try {
      const response = await leaveApi.updateStatus(id, status, reason, currentUser.id, currentUser.role);
      if (response.success) {
        fetchAllRequests();
      }
    } catch (err) {
      alert(err.message || 'Update failed');
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      pending: 'badge-pending',
      approved: 'badge-approved',
      rejected: 'badge-rejected'
    };
    return <span className={`badge ${classes[status] || ''}`}>{status}</span>;
  };

  return (
    <div className="leave-container">
      <div className="leave-header">
        <h2>Admin Leave Panel</h2>
        <select 
          className="form-input" 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{ width: '200px' }}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="leave-table-container">
        {loading ? (
          <p>Loading all requests...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : requests.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No leave requests found.</p>
        ) : (
          <table className="leave-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{req.staffId?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.staffId?.email}</div>
                  </td>
                  <td>{req.leaveType}</td>
                  <td>
                    <div style={{ fontSize: '0.9rem' }}>{new Date(req.startDate).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>to {new Date(req.endDate).toLocaleDateString()}</div>
                  </td>
                  <td>{getStatusBadge(req.status)}</td>
                  <td>
                    {req.status === 'pending' ? (
                      <div className="action-btns">
                        <button 
                          className="btn-approve" 
                          onClick={() => handleStatusUpdate(req._id, 'approved')}
                          title="Approve"
                        >
                          Approve
                        </button>
                        <button 
                          className="btn-reject" 
                          onClick={() => handleStatusUpdate(req._id, 'rejected')}
                          title="Reject"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminLeavePanel;
