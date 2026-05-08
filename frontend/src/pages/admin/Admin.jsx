import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  DoorOpen,
  Wrench,
  UserCheck,
  LogOut,
  Menu,
  X,
  ChevronDown,
  CalendarDays,
  ExternalLink,
  Clock,
} from "lucide-react";

import Overview from "./Overview";
import Applications from "./Applications";
import Students from "./Students";
import Staff from "./Staff";
import Courses from "./Courses";
import Rooms from "./Rooms";
import Maintenance from "./Maintenance";
import BookingRequests from "./BookingRequests";
import { apiFetch } from "./shared";

import "../../styles/admin.css";

/* ── Nav config ───────────────────────────────────────────────────────────── */
const COURSE_SECTIONS = ["courses", "sessions"];

/* ── Main component ───────────────────────────────────────────────────────── */
export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();

  const pathParts = location.pathname.split("/").filter(Boolean);
  const section = pathParts[1] || "overview";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(() =>
    COURSE_SECTIONS.includes(section),
  );
  const [pendingCount, setPendingCount] = useState(null);
  const [pendingBookingCount, setPendingBookingCount] = useState(null);
  const [openMaintenanceCount, setOpenMaintenanceCount] = useState(null);
  const [pageSubtitle, setPageSubtitle] = useState("");
  const [overviewStats, setOverviewStats] = useState({
    pending: null,
    students: null,
    staff: null,
    courses: null,
    rooms: null,
  });

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (location.pathname === "/admin" || location.pathname === "/admin/") {
      navigate("/admin/overview", { replace: true });
    }
  }, [location.pathname, navigate]);

  // Keep courses sub-nav open when on a courses sub-section
  useEffect(() => {
    if (COURSE_SECTIONS.includes(section)) setCoursesOpen(true);
  }, [section]);

  useEffect(() => {
    async function loadStats() {
      try {
        const results = await Promise.allSettled([
          apiFetch("/api/students"),
          apiFetch("/api/staff"),
          apiFetch("/api/courses"),
          apiFetch("/api/rooms"),
          apiFetch("/api/users/admin/pending-applications"),
          apiFetch("/api/bookings?status=pending"),
          apiFetch("/api/maintenance/open-count"),
        ]);
        const parse = async (r) => {
          if (r.status !== "fulfilled") return null;
          try {
            return await r.value.json();
          } catch {
            return null;
          }
        };
        const [sData, stData, cData, rData, aData, bData, mData] = await Promise.all(
          results.map(parse),
        );
        const pending = aData?.applications?.length ?? 0;
        setPendingCount(pending);
        setPendingBookingCount(Array.isArray(bData) ? bData.length : 0);
        setOpenMaintenanceCount(mData?.count ?? 0);
        setOverviewStats({
          pending,
          students: Array.isArray(sData) ? sData.length : null,
          staff: Array.isArray(stData) ? stData.length : null,
          courses: Array.isArray(cData) ? cData.length : null,
          rooms: Array.isArray(rData) ? rData.length : null,
        });
      } catch {
        /* non-critical */
      }
    }
    loadStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navTo = (id) => {
    navigate(`/admin/${id}`, { replace: false });
    setSidebarOpen(false);
    setPageSubtitle("");
  };

  const topbarLabel =
    {
      overview: "Overview",
      applications: "Applications",
      students: "Students",
      staff: "Staff",
      courses: "Courses",
      sessions: "Open Courses",
      rooms: "Rooms",
      maintenance: "Maintenance",
      "booking-requests": "Booking Requests",
    }[section] ?? "";

  return (
    <div className="admin-app">
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h1>EMS Admin</h1>
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {/* Overview */}
          <button
            className={`nav-item ${section === "overview" ? "active" : ""}`}
            onClick={() => navTo("overview")}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>

          {/* Applications */}
          <button
            className={`nav-item ${section === "applications" ? "active" : ""}`}
            onClick={() => navTo("applications")}
          >
            <UserCheck size={18} />
            <span>Applications</span>
            {pendingCount > 0 && (
              <span className="nav-badge">{pendingCount}</span>
            )}
          </button>

          {/* Students */}
          <button
            className={`nav-item ${section === "students" ? "active" : ""}`}
            onClick={() => navTo("students")}
          >
            <GraduationCap size={18} />
            <span>Students</span>
          </button>

          {/* Staff */}
          <button
            className={`nav-item ${section === "staff" ? "active" : ""}`}
            onClick={() => navTo("staff")}
          >
            <Users size={18} />
            <span>Staff</span>
          </button>

          {/* Courses — expandable parent */}
          <button
            className={`nav-item ${COURSE_SECTIONS.includes(section) ? "nav-item-parent-active" : ""}`}
            onClick={() => setCoursesOpen((o) => !o)}
          >
            <BookOpen size={18} />
            <span>Courses</span>
            <ChevronDown
              size={14}
              style={{
                marginLeft: "auto",
                transform: coursesOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
                opacity: 0.5,
              }}
            />
          </button>

          {coursesOpen && (
            <div className="admin-subnav">
              <button
                className={`admin-subnav-item ${section === "courses" ? "active" : ""}`}
                onClick={() => navTo("courses")}
              >
                <BookOpen size={14} /> Course Catalog
              </button>
              <button
                className={`admin-subnav-item ${section === "sessions" ? "active" : ""}`}
                onClick={() => navTo("sessions")}
              >
                <CalendarDays size={14} /> Open Courses
              </button>
            </div>
          )}

          {/* Rooms */}
          <button
            className={`nav-item ${section === "rooms" ? "active" : ""}`}
            onClick={() => navTo("rooms")}
          >
            <DoorOpen size={18} />
            <span>Rooms</span>
          </button>

          {/* Maintenance */}
          <button
            className={`nav-item ${section === "maintenance" ? "active" : ""}`}
            onClick={() => navTo("maintenance")}
          >
            <Wrench size={18} />
            <span>Maintenance</span>
            {openMaintenanceCount > 0 && (
              <span className="nav-badge">{openMaintenanceCount}</span>
            )}
          </button>

          {/* Book a Room — opens user-facing room booking page */}
          <button
            className="nav-item"
            onClick={() => navigate("/rooms")}
          >
            <ExternalLink size={18} />
            <span>Book a Room</span>
          </button>

          {/* Booking Requests */}
          <button
            className={`nav-item ${section === "booking-requests" ? "active" : ""}`}
            onClick={() => navTo("booking-requests")}
          >
            <Clock size={18} />
            <span>Booking Requests</span>
            {pendingBookingCount > 0 && (
              <span className="nav-badge">{pendingBookingCount}</span>
            )}
          </button>
        </nav>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="topbar-title-group">
            <span className="topbar-title">{topbarLabel}</span>
            {pageSubtitle && (
              <>
                <span className="topbar-title-sep">/</span>
                <span className="topbar-subtitle">{pageSubtitle}</span>
              </>
            )}
          </div>
          <div className="topbar-right">
            <span className="topbar-admin-label">Administrator</span>
            <button className="topbar-logout-btn" onClick={handleLogout}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        </header>

        <div className="page-content">
          {section === "overview" && <Overview stats={overviewStats} />}
          {section === "applications" && (
            <Applications
              adminId={user?.id || "super-admin"}
              onCountChange={setPendingCount}
            />
          )}
          {section === "students" && <Students onSubtitle={setPageSubtitle} />}
          {section === "staff" && <Staff onSubtitle={setPageSubtitle} />}
          {section === "courses" && <Courses onSubtitle={setPageSubtitle} />}
          {section === "sessions" && <CourseSessions />}
          {section === "rooms" && <Rooms onSubtitle={setPageSubtitle} />}
          {section === "maintenance" && <Maintenance />}
          {section === "booking-requests" && <BookingRequests />}
        </div>
      </div>
    </div>
  );
}

/* ── Course Sessions placeholder ─────────────────────────────────────────── */
function CourseSessions() {
  return (
    <>
      <div className="page-header">
        <div>
          <h2>Open Courses</h2>
          <p>
            Course sections offered each academic term — e.g. Math GEN-001 ·
            2025/2026 Fall
          </p>
        </div>
      </div>
      <div
        className="detail-card"
        style={{ textAlign: "center", padding: "60px 24px" }}
      >
        <CalendarDays
          size={48}
          style={{
            opacity: 0.25,
            marginBottom: 16,
            display: "block",
            margin: "0 auto 16px",
          }}
        />
        <p
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: 8,
          }}
        >
          Coming soon
        </p>
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          This section will let you open a course for a specific term, assign an
          instructor, set a schedule, and manage enrolled students per section.
        </p>
      </div>
    </>
  );
}
