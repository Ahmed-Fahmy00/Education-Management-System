import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Shield,
  GraduationCap,
  Hash,
  Building2,
} from "lucide-react";
import { UserLayout } from "./Home";
import "../styles/home.css";

/**
 * Derive academic year classification from a studentId like "26s0001".
 * The first two digits are the enrollment year (last 2 digits of the year).
 * Freshman: year 1, Sophomore: year 2, Junior: year 3, Senior: year 4+
 */
function getYearClassification(studentId) {
  if (!studentId) return null;
  const match = studentId.match(/^(\d{2})[se]/i);
  if (!match) return null;
  const enrollYY = parseInt(match[1], 10);
  const currentYY = new Date().getFullYear() % 100;
  // Handle century boundary: if enrollYY > currentYY, assume previous century
  const diff =
    enrollYY <= currentYY ? currentYY - enrollYY : currentYY + (100 - enrollYY);
  const year = diff + 1; // year 1 = freshman
  if (year <= 1) return { label: "Freshman", color: "#3b82f6", year: 1 };
  if (year === 2) return { label: "Sophomore", color: "#10b981", year: 2 };
  if (year === 3) return { label: "Junior", color: "#f59e0b", year: 3 };
  return { label: "Senior", color: "#8b5cf6", year: 4 };
}

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

  const classification =
    user.role === "student" ? getYearClassification(user.studentId) : null;

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
          {classification && (
            <span
              className="hs-role-badge"
              style={{
                marginLeft: 8,
                background: `${classification.color}18`,
                color: classification.color,
                border: `1px solid ${classification.color}40`,
              }}
            >
              {classification.label}
            </span>
          )}
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
          {user.role === "student" && user.studentId && (
            <div className="profile-info-row">
              <div className="profile-info-label">
                <Hash size={14} /> Student ID
              </div>
              <div
                className="profile-info-value"
                style={{ fontFamily: "monospace", fontWeight: 700 }}
              >
                {user.studentId}
              </div>
            </div>
          )}
          {user.role === "student" && user.department && (
            <div className="profile-info-row">
              <div className="profile-info-label">
                <Building2 size={14} /> Department
              </div>
              <div className="profile-info-value">{user.department}</div>
            </div>
          )}
          {classification && (
            <div className="profile-info-row">
              <div className="profile-info-label">
                <GraduationCap size={14} /> Academic Year
              </div>
              <div className="profile-info-value">
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "3px 12px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    background: `${classification.color}18`,
                    color: classification.color,
                    border: `1px solid ${classification.color}40`,
                  }}
                >
                  Year {classification.year} — {classification.label}
                </span>
              </div>
            </div>
          )}
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
