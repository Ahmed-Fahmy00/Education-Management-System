import React, { useState, useEffect, useCallback } from 'react';
import { leaveApi } from '../api/leave';
import LeaveForm from './LeaveForm';
import '../styles/LeaveSystem.css';

const LeaveDashboard = ({ currentUser }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyRequests = useCallback(async () => {
    try {
      const response = await leaveApi.getMyRequests(currentUser.id, currentUser.role);
      if (response.success) {
        setRequests(response.data);
      }
    } catch (err) {
      setError('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

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
        <h2>My Leave Dashboard</h2>
      </div>

      <LeaveForm currentUser={currentUser} onSuccess={fetchMyRequests} />

      <div className="leave-table-container">
        {loading ? (
          <p>Loading requests...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : requests.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No leave requests found.</p>
        ) : (
          <table className="leave-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Submitted On</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id}>
                  <td style={{ fontWeight: 600 }}>{req.leaveType}</td>
                  <td>{new Date(req.startDate).toLocaleDateString()}</td>
                  <td>{new Date(req.endDate).toLocaleDateString()}</td>
                  <td>{getStatusBadge(req.status)}</td>
                  <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    {new Date(req.createdAt).toLocaleDateString()}
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

export default LeaveDashboard;
