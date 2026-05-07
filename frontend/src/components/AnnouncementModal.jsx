import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createAnnouncement } from '../api/announcements';
import '../styles/announcement-modal.css';

export default function AnnouncementModal({ isOpen, onClose, courses, onSuccess }) {
  const [formData, setFormData] = useState({
    type: 'general',
    title: '',
    body: '',
    course: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.title.trim()) {
        setError('Title is required');
        setLoading(false);
        return;
      }
      if (!formData.body.trim()) {
        setError('Body is required');
        setLoading(false);
        return;
      }
      if (formData.type === 'course' && !formData.course) {
        setError('Course is required for course announcements');
        setLoading(false);
        return;
      }

      const payload = {
        type: formData.type,
        title: formData.title.trim(),
        body: formData.body.trim(),
      };

      if (formData.type === 'course') {
        payload.course = formData.course;
      }

      await createAnnouncement(payload);
      
      setFormData({
        type: 'general',
        title: '',
        body: '',
        course: '',
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="announcement-modal-overlay" onClick={onClose}>
      <div className="announcement-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="announcement-modal-header">
          <h2>Create Announcement</h2>
          <button className="announcement-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="announcement-form">
          {error && <div className="announcement-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="type">Announcement Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input"
            >
              <option value="general">General</option>
              <option value="course">Course Specific</option>
            </select>
          </div>

          {formData.type === 'course' && (
            <div className="form-group">
              <label htmlFor="course">Select Course</label>
              <select
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">-- Select a course --</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.code} - {course.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Announcement title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="body">Message</label>
            <textarea
              id="body"
              name="body"
              placeholder="Write your announcement here..."
              value={formData.body}
              onChange={handleChange}
              className="input textarea"
              rows="6"
              required
            />
          </div>

          <div className="announcement-modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
