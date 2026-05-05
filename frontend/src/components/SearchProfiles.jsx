import React, { useState, useEffect, useCallback } from 'react';
import { staffApi } from '../api/staff';
import { Link } from 'react-router-dom';
import '../styles/StaffSystem.css';

const DEPARTMENTS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Engineering',
  'Business Administration',
  'Medicine',
  'Architecture'
];

const SearchProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.name = searchTerm;
      if (deptFilter) params.department = deptFilter;
      
      const response = await staffApi.getProfiles(params);
      if (response.success) {
        setProfiles(response.data);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, deptFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProfiles();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchProfiles]);

  return (
    <div className="staff-container">
      <div className="leave-header">
        <h2>Staff Directory</h2>
      </div>

      <div className="search-box">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Searching profiles...</div>
      ) : (
        <div className="profile-grid">
          {profiles.length === 0 ? (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
              No profiles found matching your search.
            </p>
          ) : (
            profiles.map(profile => (
              <Link to={`/staff/${profile._id}`} key={profile._id} style={{ textDecoration: 'none' }}>
                <div className="profile-card">
                  <div className="profile-dept">{profile.department}</div>
                  <h3 className="profile-name">{profile.name}</h3>
                  
                  <div className="profile-info-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    {profile.email}
                  </div>
                  
                  {profile.phone && (
                    <div className="profile-info-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      {profile.phone}
                    </div>
                  )}

                  <div className="profile-info-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {profile.officeLocation || 'Main Campus'}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchProfiles;
