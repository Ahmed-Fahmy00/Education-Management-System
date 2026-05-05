import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { staffApi } from '../api/staff';

const DEPARTMENTS = [
  'Computer Science', 'Mathematics', 'Physics', 'Engineering', 
  'Business Administration', 'Medicine', 'Architecture'
];

const EditProfile = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    officeLocation: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await staffApi.getProfileById(id);
        if (response.success) {
          const { name, email, phone, department, officeLocation, userId } = response.data;
          
          // Authorization Check: Must be owner or admin
          if (currentUser.id !== userId && currentUser.role !== 'admin') {
            setError('Unauthorized access');
            setLoading(false);
            return;
          }

          setFormData({ name, email, phone, department, officeLocation });
        }
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await staffApi.updateProfile(id, formData, currentUser.id, currentUser.role);
      if (response.success) {
        navigate(`/staff/${id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="staff-container">Loading...</div>;
  if (error) return <div className="staff-container error-msg">{error}</div>;

  return (
    <div className="staff-container">
      <div className="leave-container">
        <div className="leave-header">
          <h2>Edit Staff Profile</h2>
        </div>

        <form className="leave-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Official Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Department</label>
            <select
              name="department"
              className="form-input"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full-width">
            <label>Office Location</label>
            <input
              name="officeLocation"
              className="form-input"
              value={formData.officeLocation}
              onChange={handleChange}
              placeholder="e.g. Building B, Room 302"
            />
          </div>

          <div className="profile-actions full-width" style={{ marginTop: '1rem' }}>
            <button type="submit" className="submit-btn" disabled={saving} style={{ width: 'auto', padding: '0.8rem 3rem' }}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            <button 
              type="button" 
              className="btn-edit" 
              style={{ background: '#f1f5f9', color: '#475569' }}
              onClick={() => navigate(`/staff/${id}`)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
