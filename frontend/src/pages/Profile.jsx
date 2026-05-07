import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Shield } from "lucide-react";
import { UserLayout } from "./Home";
import "../styles/home.css";

export default function Profile() {
  const navigate = useNavigate();

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return <div className="home-loading">No user data</div>;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <UserLayout user={user} onLogout={handleLogout}>
      {/* Profile hero */}
      <div className="profile-hero">
        <div className="profile-avatar-lg">{initials}</div>
        <div>
          <h2 className="profile-hero-name">{user.name}</h2>
          <span className={`hs-role-badge hs-role-${user.role}`}>
            {user.role}
          </span>
        </div>
      </div>

      {/* Info card */}
      <div className="hs-card profile-info-card">
        <div className="hs-card-title">
          <User size={15} /> Account Information
        </div>
        <div className="profile-info-rows">
          <div className="profile-info-row">
            <div className="profile-info-label">
              <User size={14} /> Full Name
            </div>
            <div className="profile-info-value">{user.name}</div>
          </div>
          <div className="profile-info-row">
            <div className="profile-info-label">
              <Mail size={14} /> Email Address
            </div>
            <div className="profile-info-value">{user.email}</div>
          </div>
          <div className="profile-info-row">
            <div className="profile-info-label">
              <Shield size={14} /> Role
            </div>
            <div className="profile-info-value">
              <span className={`hs-role-badge hs-role-${user.role}`}>
                {user.role}
              </span>
            </div>
          </div>
          <div className="profile-info-row">
            <div className="profile-info-label">
              <Shield size={14} /> Account Status
            </div>
            <div className="profile-info-value">
              <span className="hs-status-badge hs-status-active">Active</span>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
