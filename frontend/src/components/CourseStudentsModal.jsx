import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { getStudentsInCourse } from '../api/registrations';
import '../styles/course-students-modal.css';

export default function CourseStudentsModal({ isOpen, onClose, course }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && course?._id) {
      fetchStudents();
    }
  }, [isOpen, course?._id]);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getStudentsInCourse(course._id);
      setStudents(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !course) return null;
  console.log("students in course", students[0]);
  return (
    <div className="course-students-overlay" onClick={onClose}>
      <div className="course-students-modal" onClick={(e) => e.stopPropagation()}>
        <div className="course-students-header">
          <div>
            <h2>{course.code} - {course.title}</h2>
            <p className="course-students-count">
              {students.length} student{students.length !== 1 ? 's' : ''} enrolled
            </p>
          </div>
          <button className="course-students-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="course-students-content">
          {loading ? (
            <div className="loading-container">
              <Loader2 size={32} className="spinner" />
              <p>Loading students...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>{error}</p>
              <button className="btn-retry" onClick={fetchStudents}>
                Retry
              </button>
            </div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <p>No students enrolled in this course</p>
            </div>
          ) : (
            <div className="students-list">
              <div className="students-table-header">
                <div className="col-name">Name</div>
                <div className="col-email">Email</div>
                <div className="col-department">Department</div>
              </div>
              <div className="students-table-body">
                {students.map((registration, index) => {
                  const student = registration.student;
                  return (
                    <div key={index} className="student-row">
                      <div className="col-name">
                      {student.name}
                      </div>
                      <div className="col-email">{student.email}</div>
                      <div className="col-department">{student.department || 'N/A'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
