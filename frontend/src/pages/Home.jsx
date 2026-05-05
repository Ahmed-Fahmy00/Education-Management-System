import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Bell, FileText, LogOut, Settings } from "lucide-react";
import "../styles/home.css";

export default function Home() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return <div className="home-loading">No user data</div>;
  }

  return (
    <div className="home-page">
      {/* Header with Logout */}
      <div className="home-header">
        <div>
          <h1>Education Management System</h1>
          <p className="welcome-text">Welcome, {user.name}!</p>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Main Container */}
      <div className="home-container">
        {/* User Profile Section */}
        <div className="profile-card">
          <div className="profile-header">
            <h2>Your Profile</h2>
          </div>
          <div className="profile-content">
            <div className="profile-item">
              <span className="profile-label">Name:</span>
              <span className="profile-value">{user.name}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Email:</span>
              <span className="profile-value">{user.email}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Role:</span>
              <span className="profile-value profile-role">{user.role}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="actions-section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <div className="action-card">
              <BookOpen size={32} className="action-icon" />
              <h3>Study Plan</h3>
              <p>View your core subjects and available electives</p>
              <button
                className="btn-action"
                onClick={() => navigate("/course-requirements")}
              >
                Open Study Plan
              </button>
            </div>

            <div className="action-card">
              <FileText size={32} className="action-icon" />
              <h3>Applications</h3>
              <p>View and manage your applications</p>
              <button className="btn-action">View Applications</button>
            </div>

            <div className="action-card">
              <Bell size={32} className="action-icon" />
              <h3>Announcements</h3>
              <p>Check latest university updates</p>
              <button className="btn-action">View Announcements</button>
            </div>

            <div className="action-card">
              <Settings size={32} className="action-icon" />
              <h3>Settings</h3>
              <p>Manage your account settings</p>
              <button className="btn-action">Go to Settings</button>
            </div>
          </div>
        </div>

        {/* Dashboard Info */}
        <div className="dashboard-info">
          <h2>Dashboard Information</h2>
          <div className="info-grid">
            <div className="info-box">
              <h4>Application Status</h4>
              <p>Pending Review</p>
            </div>
            <div className="info-box">
              <h4>Last Updated</h4>
              <p>{new Date().toLocaleDateString()}</p>
            </div>
            <div className="info-box">
              <h4>Account Type</h4>
              <p className="capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
