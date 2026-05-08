import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { staffApi } from '../api/staff';
import '../styles/StaffSystem.css';

const Profile = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await staffApi.getProfileById(id);
        if (response.success) {
          setProfile(response.data);
        }
      } catch (err) {
        setError('Profile not found or access denied');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <div className="staff-container">Loading profile...</div>;
  if (error || !profile) return <div className="staff-container error-msg">{error || 'Profile not found'}</div>;

  const canEdit = currentUser && (currentUser.id === profile.userId || currentUser.role === 'admin');

  return (
    <div className="staff-container">
      <div className="profile-view">
        <div className="profile-banner"></div>
        <div className="profile-content">
          <div className="profile-avatar-large">
            {profile.name.charAt(0)}
          </div>
          
          <div className="profile-dept">{profile.department}</div>
          <h2 className="profile-name" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            {profile.name}
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Official Staff Profile
          </p>

          <div className="profile-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="profile-info-item">{profile.email}</div>
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <div className="profile-info-item">{profile.phone || 'Not provided'}</div>
            </div>
            <div className="form-group">
              <label>Office Location</label>
              <div className="profile-info-item">{profile.officeLocation || 'Main Campus'}</div>
            </div>
          </div>

          <div className="profile-actions">
            {canEdit && (
              <button 
                className="btn-edit"
                onClick={() => navigate(`/staff/${id}/edit`)}
              >
                Edit Profile
              </button>
            )}
            <button 
              className="btn-edit" 
              style={{ background: '#f1f5f9', color: '#475569' }}
              onClick={() => navigate('/staff')}
            >
              Back to Directory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
