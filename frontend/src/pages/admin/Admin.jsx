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
  ChevronRight,
} from "lucide-react";

import Overview from "./Overview";
import Applications from "./Applications";
import Students from "./Students";
import Staff from "./Staff";
import Courses from "./Courses";
import Rooms from "./Rooms";
import Maintenance from "./Maintenance";
import { apiFetch } from "./shared";

import "../../styles/admin.css";

/* ── Nav config ───────────────────────────────────────────────────────────── */
const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "applications", label: "Applications", icon: UserCheck, badge: true },
  { id: "students", label: "Students", icon: GraduationCap },
  { id: "staff", label: "Staff", icon: Users },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "rooms", label: "Rooms", icon: DoorOpen },
  { id: "maintenance", label: "Maintenance", icon: Wrench },
];

/* ── Main component ───────────────────────────────────────────────────────── */
export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract section from URL path: /admin/courses -> 'courses'
  const pathParts = location.pathname.split("/").filter(Boolean);
  const section = pathParts[1] || "overview";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(null);
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

  // Redirect /admin to /admin/overview
  useEffect(() => {
    if (location.pathname === "/admin" || location.pathname === "/admin/") {
      navigate("/admin/overview", { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    async function loadStats() {
      try {
        const results = await Promise.allSettled([
          apiFetch("/api/students"),
          apiFetch("/api/staff"),
          apiFetch("/api/courses"),
          apiFetch("/api/rooms"),
          apiFetch("/api/users/admin/pending-applications"),
        ]);
        const parse = async (r) => {
          if (r.status !== "fulfilled") return null;
          try {
            return await r.value.json();
          } catch {
            return null;
          }
        };
        const [sData, stData, cData, rData, aData] = await Promise.all(
          results.map(parse),
        );
        const pending = aData?.applications?.length ?? 0;
        setPendingCount(pending);
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
  };
  const sectionLabel = NAV.find((n) => n.id === section)?.label ?? "";

  return (
    <div className="admin-app">
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
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
          {NAV.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              className={`nav-item ${section === id ? "active" : ""}`}
              onClick={() => navTo(id)}
            >
              <Icon size={20} />
              <span>{label}</span>
              {badge && pendingCount > 0 && (
                <span className="nav-badge">{pendingCount}</span>
              )}
              {section === id && (
                <ChevronRight
                  size={14}
                  style={{ marginLeft: "auto", opacity: 0.6 }}
                />
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <span className="topbar-title">{sectionLabel}</span>
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
          {section === "students" && <Students />}
          {section === "staff" && <Staff />}
          {section === "courses" && <Courses />}
          {section === "rooms" && <Rooms />}
          {section === "maintenance" && <Maintenance />}
        </div>
      </div>
    </div>
  );
}
