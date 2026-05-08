import React, { useState, useEffect, useCallback } from 'react';
import { assignmentApi } from '../api/assignments';
import '../styles/AssignmentSystem.css';

const AdminAssignment = ({ currentUser }) => {
  const [staffList, setStaffList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [staffRes, courseRes, assignRes] = await Promise.all([
        assignmentApi.getAllStaff(),
        assignmentApi.getCourses(),
        assignmentApi.getAllAssignments(currentUser.id, currentUser.role)
      ]);

      if (staffRes.success) setStaffList(staffRes.data);
      if (courseRes.success) setCourses(courseRes.data);
      if (assignRes.success) setAssignments(assignRes.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedStaff || !selectedCourse) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await assignmentApi.create(
        { staffId: selectedStaff, courseId: selectedCourse },
        currentUser.id,
        currentUser.role
      );

      if (response.success) {
        setSuccess('Staff assigned successfully!');
        setSelectedCourse('');
        await fetchData();
      }
    } catch (err) {
      setError(err.message || 'Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this assignment?')) return;
    try {
      const response = await assignmentApi.delete(id, currentUser.id, currentUser.role);
      if (response.success) {
        setAssignments(assignments.filter(a => a._id !== id));
      }
    } catch (err) {
      alert(err.message || 'Failed to remove');
    }
  };

  return (
    <div className="assignment-container">
      <div className="assignment-card">
        <h2 style={{ marginBottom: '1.5rem' }}>Course Assignment Matrix</h2>

        <form className="assignment-form" onSubmit={handleAssign}>
          <div className="form-group">
            <label>Select Staff</label>
            <select 
              className="form-input" 
              value={selectedStaff} 
              onChange={(e) => setSelectedStaff(e.target.value)}
              required
            >
              <option value="">-- Choose Staff --</option>
              {staffList.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.department})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Course</label>
            <select 
              className="form-input" 
              value={selectedCourse} 
              onChange={(e) => setSelectedCourse(e.target.value)}
              required
            >
              <option value="">-- Choose Course --</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.code}: {c.title}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-assign" disabled={loading}>
            {loading ? 'Assigning...' : 'Assign Staff'}
          </button>
        </form>

        {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}
        {success && <div className="success-msg" style={{ marginBottom: '1rem' }}>{success}</div>}

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Department</th>
                <th>Course</th>
                <th>Assigned On</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No assignments found</td></tr>
              ) : (
                assignments.map((a) => (
                  <tr key={a._id}>
                    <td style={{ fontWeight: 600 }}>{a.staffId?.name}</td>
                    <td>{a.staffId?.department}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.courseId?.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{a.courseId?.code}</div>
                    </td>
                    <td>{new Date(a.assignedAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-remove" onClick={() => handleRemove(a._id)}>Remove</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAssignment;
