import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Plus, Loader2, Users, ChevronRight } from 'lucide-react';
import { getCoursesByInstructorId } from '../api/courses';
import AnnouncementModal from '../components/AnnouncementModal';
import CourseStudentsModal from '../components/CourseStudentsModal';
import '../styles/instructor-home.css';

export default function InstructorHome({ user }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const fetchCourses = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const data = await getCoursesByInstructorId(user.id);
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setShowStudentsModal(true);
  };

  return (
    <div className="instructor-home">
      <div className="instructor-header">
        <div className="instructor-title-section">
          <h1>My Courses</h1>
          <p className="instructor-subtitle">Manage your courses and communicate with students</p>
        </div>
        <button
          className="btn-create-announcement"
          onClick={() => setShowAnnouncementModal(true)}
        >
          <Plus size={18} />
          Create Announcement
        </button>
      </div>

      <div className="instructor-content">
        {loading ? (
          <div className="instructor-loading">
            <Loader2 size={32} className="spinner" />
            <p>Loading your courses...</p>
          </div>
        ) : error ? (
          <div className="instructor-error">
            <p>{error}</p>
            <button className="btn-retry" onClick={fetchCourses}>
              Retry
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="instructor-empty">
            <BookOpen size={48} />
            <h3>No courses yet</h3>
            <p>You are not assigned to any courses. Contact your administrator.</p>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course._id} className="course-card">
                <div className="course-card-header">
                  <div className="course-code">{course.code}</div>
                  <div className="course-credits">{course.credits} credits</div>
                </div>

                <div className="course-card-content">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-description">{course.description || 'No description available'}</p>

                  <div className="course-meta">
                    <div className="meta-item">
                      <span className="meta-label">Department</span>
                      <span className="meta-value">{course.department}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Capacity</span>
                      <span className="meta-value">{course.capacity} students</span>
                    </div>
                  </div>
                </div>

                <button
                  className="course-students-btn"
                  onClick={() => handleCourseClick(course)}
                >
                  <Users size={16} />
                  View Students
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnnouncementModal
        mode={"create"}
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        courses={courses}
        onSuccess={() => {
          // Optionally refresh courses or show success message
        }}
      />

      <CourseStudentsModal
        isOpen={showStudentsModal}
        onClose={() => {
          setShowStudentsModal(false);
          setSelectedCourse(null);
        }}
        course={selectedCourse}
      />
    </div>
  );
}
