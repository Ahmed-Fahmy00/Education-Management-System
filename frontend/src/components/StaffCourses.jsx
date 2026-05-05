import React, { useState, useEffect } from 'react';
import { assignmentApi } from '../api/assignments';
import '../styles/AssignmentSystem.css';

const StaffCourses = ({ currentUser }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await assignmentApi.getStaffCourses(
          currentUser.id, 
          currentUser.id, 
          currentUser.role
        );
        if (response.success) {
          setCourses(response.data);
        }
      } catch (err) {
        setError('Failed to load your assigned courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [currentUser]);

  if (loading) return <div className="assignment-container">Loading assignments...</div>;

  return (
    <div className="assignment-container">
      <div className="assignment-header" style={{ marginBottom: '2rem' }}>
        <h2>My Teaching Assignments</h2>
        <p style={{ color: '#64748b' }}>View all courses you are currently assigned to teach.</p>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="course-grid">
        {courses.length === 0 ? (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
            You are not currently assigned to any courses.
          </p>
        ) : (
          courses.map((course) => (
            <div key={course._id} className="course-card">
              <div className="course-code">{course.code}</div>
              <h3 className="course-title">{course.title}</h3>
              <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
                {course.department}
              </div>
              <div style={{ fontSize: '0.85rem', lineHeight: '1.5', color: '#475569' }}>
                {course.description || 'No description available for this course.'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffCourses;
