import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  BookOpen,
  DoorOpen,
  FileText,
  MessageSquare,
  LayoutDashboard,
  User,
  Search,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Bell,
  Settings,
  ThumbsUp,
  Clock,
  Megaphone,
  Loader2,
  CalendarDays,
  Wrench,
} from "lucide-react";
import InstructorHome from "./InstructorHome";
import { staffApi } from "../api/staff";
import { studentApi } from "../api/students";
import "../styles/home.css";

/* ── helpers ──────────────────────────────────────────────────────────────── */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function matchesSearch(item, needle) {
  if (!needle) return true;

  const haystacks = [
    item?.name,
    item?.email,
    item?.department,
    item?.role,
    item?.staffId,
    item?.studentId,
    item?.parentEmail,
    item?.phone,
    item?.officeLocation,
    item?.firstName,
    item?.lastName,
  ];

  return haystacks.some((value) =>
    String(value || "").toLowerCase().includes(needle),
  );
}

/* ── Shared layout ────────────────────────────────────────────────────────── */
export function UserLayout({ children, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const isInstructor = user?.role === "instructor";
  const COURSES_PATHS = ["/course-requirements"];
  const [coursesOpen, setCoursesOpen] = useState(() =>
    COURSES_PATHS.includes(location.pathname),
  );
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const query = searchTerm.trim();
    const needle = query.toLowerCase();

    if (query.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      setSearchLoading(true);
      try {
        const [staffRows, studentRows] = await Promise.allSettled([
          staffApi.getProfiles({ q: query }),
          studentApi.searchStudents(query),
        ]);

        if (!active) return;

        const staffResults =
          staffRows.status === "fulfilled" && Array.isArray(staffRows.value)
            ? staffRows.value.map((item) => ({
                ...item,
                kind: "staff",
                label: item._type === "profile" ? "Staff profile" : "Staff member",
              }))
            : [];

        const studentResults =
          studentRows.status === "fulfilled" && Array.isArray(studentRows.value)
            ? studentRows.value.map((item) => ({
                ...item,
                kind: "student",
                label: "Student",
              }))
            : [];

        const filteredResults = [...staffResults, ...studentResults].filter((item) =>
          matchesSearch(item, needle),
        );

        setSearchResults(filteredResults.slice(0, 8));
        setSearchOpen(true);
      } catch {
        if (active) {
          setSearchResults([]);
          setSearchOpen(true);
        }
      } finally {
        if (active) {
          setSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchTerm]);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isActive = (path) => location.pathname === path;

  const navTo = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const openProfile = (result) => {
    setSearchTerm("");
    setSearchResults([]);
    setSearchOpen(false);
    navigate(
      result.kind === "student"
        ? `/profile/student/${result._id}`
        : `/profile/staff/${result._id}`,
    );
  };

  return (
    <div className="hs-app">
      {sidebarOpen && (
        <div className="hs-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`hs-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="hs-sidebar-header">
          <span className="hs-sidebar-title">EMS</span>
          <button
            className="hs-sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="hs-nav">
          {/* Dashboard */}
          <button
            className={`hs-nav-item ${isActive("/home") ? "active" : ""}`}
            onClick={() => navTo("/home")}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          {/* Courses (expandable) — hidden for instructors */}
          {!isInstructor && (
            <>
              <button
                className={`hs-nav-item ${COURSES_PATHS.includes(location.pathname) ? "hs-nav-item-parent-active" : ""}`}
                onClick={() => setCoursesOpen((o) => !o)}
              >
                <BookOpen size={20} />
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
                <div className="hs-subnav">
                  <button
                    className={`hs-subnav-item ${isActive("/course-requirements") ? "active" : ""}`}
                    onClick={() => navTo("/course-requirements")}
                  >
                    <BookOpen size={15} />
                    My Courses
                  </button>
                  <button className="hs-subnav-item disabled" title="Coming soon">
                    <FileText size={15} />
                    Register Courses
                    <span className="hs-nav-soon">Soon</span>
                  </button>
                </div>
              )}
            </>
          )}

          {/* Room Booking */}
          <button
            className={`hs-nav-item ${isActive("/rooms") ? "active" : ""}`}
            onClick={() => navTo("/rooms")}
          >
            <DoorOpen size={20} />
            <span>Room Booking</span>
          </button>

          {/* Maintenance */}
          <button
            className={`hs-nav-item ${isActive("/maintenance") ? "active" : ""}`}
            onClick={() => navTo("/maintenance")}
          >
            <Wrench size={20} />
            <span>Maintenance</span>
          </button>

          {/* Calendar — hidden for instructors */}
          {!isInstructor && (
            <button className="hs-nav-item disabled" title="Coming soon">
              <CalendarDays size={20} />
              <span>Calendar</span>
              <span className="hs-nav-soon">Soon</span>
            </button>
          )}

          {/* Chats */}
          <button
            className={`hs-nav-item ${isActive("/chats") ? "active" : ""}`}
            onClick={() => navTo("/chats")}
          >
            <MessageSquare size={20} />
            <span>Chats</span>
          </button>

          {/* Forums */}
          <button
            className={`hs-nav-item ${isActive("/forums") ? "active" : ""}`}
            onClick={() => navTo("/forums")}
          >
            <MessageSquare size={20} />
            <span>Forums</span>
          </button>
        </nav>

        {/* Sidebar footer — empty, no logout */}
        <div className="hs-sidebar-footer-spacer" />
      </aside>

      {/* ── Main ── */}
      <div className="hs-main">
        <header className="hs-topbar">
          <button className="hs-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <span className="hs-topbar-title">
            {location.pathname === "/home" && "Dashboard"}
            {location.pathname === "/course-requirements" && "Courses"}
            {location.pathname === "/rooms" && "Room Booking"}
            {location.pathname === "/maintenance" && "Maintenance"}
            {location.pathname.startsWith("/profile") && "Profile"}
            {location.pathname === "/announcements" && "Announcements"}
            {location.pathname === "/chats" && "Chats"}
          </span>

          <div className="hs-topbar-search" ref={searchRef}>
            <div className="hs-topbar-search-input">
              <Search size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (searchTerm.trim().length >= 2) {
                    setSearchOpen(true);
                  }
                }}
                placeholder="Search staff or students"
                aria-label="Search profiles"
              />
              {searchLoading && <Loader2 size={14} className="hs-spin" />}
            </div>

            {searchOpen && searchTerm.trim().length >= 2 && (
              <div className="hs-topbar-search-results">
                {searchResults.length === 0 ? (
                  <div className="hs-topbar-search-empty">
                    No matching profiles found.
                  </div>
                ) : (
                  searchResults.map((result) => (
                    <button
                      key={`${result.kind}-${result._id}`}
                      type="button"
                      className="hs-topbar-search-result"
                      onClick={() => openProfile(result)}
                    >
                      <div className="hs-topbar-search-avatar">
                        {(result.name || "?")
                          .split(" ")
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="hs-topbar-search-copy">
                        <strong>{result.name || "Unnamed profile"}</strong>
                        <span>
                          {result.label}
                          {result.department ? ` · ${result.department}` : ""}
                        </span>
                      </div>
                      <ChevronRight size={14} />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="hs-topbar-right" ref={menuRef}>
            {/* Bell icon → announcements */}
            <button
              className="hs-topbar-icon-btn"
              title="Announcements"
              onClick={() => navigate("/announcements")}
            >
              <Bell size={18} />
            </button>

            {/* Avatar dropdown */}
            <button
              className="hs-avatar-btn"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Account menu"
            >
              <div className="hs-avatar">{initials}</div>
              <ChevronDown
                size={13}
                style={{
                  transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                  color: "var(--text-tertiary)",
                }}
              />
            </button>

            {menuOpen && (
              <div className="hs-dropdown">
                <div className="hs-dropdown-header">
                  <div className="hs-dropdown-name">{user.name}</div>
                  <div className="hs-dropdown-email">{user.email}</div>
                </div>
                <div className="hs-dropdown-divider" />
                <button
                  className="hs-dropdown-item"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                >
                  <User size={14} /> View Profile
                </button>
                <button className="hs-dropdown-item hs-dropdown-item-disabled">
                  <Settings size={14} /> Settings
                  <span className="hs-dropdown-soon">Soon</span>
                </button>
                <div className="hs-dropdown-divider" />
                <button
                  className="hs-dropdown-item hs-dropdown-logout"
                  onClick={onLogout}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="hs-content">{children}</main>
      </div>
    </div>
  );
}

/* ── Home page ────────────────────────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingAnn, setLoadingAnn] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

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

  const loadAnnouncements = useCallback(async () => {
    setLoadingAnn(true);
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      // Sort by createdAt descending (newest first)
      const sorted = Array.isArray(data)
        ? [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        )
        : [];
      setAnnouncements(sorted);
    } catch {
      setAnnouncements([]);
    } finally {
      setLoadingAnn(false);
    }
  }, []);

  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch("/api/forum/posts");
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
    loadPosts();
  }, [loadAnnouncements, loadPosts]);

  if (!user) return <div className="home-loading">No user data</div>;

  // Show instructor home for instructor users
  if (user.role === "instructor") {
    return (
      <UserLayout user={user} onLogout={handleLogout}>
        <InstructorHome user={user} />
      </UserLayout>
    );
  }
  return (
    <UserLayout user={user} onLogout={handleLogout}>
      <div className="hs-home-grid">
        {/* ── Left: Forum Posts ── */}
        <section className="hs-posts-col">
          {loadingPosts ? (
            <div className="hs-col-loading">
              <Loader2 size={20} className="hs-spin" /> Loading posts…
            </div>
          ) : posts.length === 0 ? (
            <div className="hs-col-empty">
              <MessageSquare size={36} />
              <p>No posts yet</p>
            </div>
          ) : (
            <div className="hs-posts-list">
              {posts.map((p) => (
                <div
                  key={p._id}
                  className="hs-post-card"
                  onClick={() => navigate("/forums")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="hs-post-header">
                    <div className="hs-post-author-avatar">
                      {p.authorName?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="hs-post-author">{p.authorName}</div>
                      <div className="hs-post-meta">
                        <span
                          className={`hs-author-role hs-role-${p.authorRole}`}
                        >
                          {p.authorRole}
                        </span>
                        <span>·</span>
                        <span>{timeAgo(p.createdAt)}</span>
                        {p.course && <span>· {p.course.code}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="hs-post-title">{p.title}</div>
                  <div className="hs-post-body">{p.body}</div>
                  <div className="hs-post-footer">
                    <span className="hs-post-upvotes">
                      <ThumbsUp size={13} /> {p.upvotes ?? 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Right: Announcements ── */}
        <aside className="hs-ann-col">
          <div className="hs-col-header">
            <Megaphone size={16} />
            <span>Announcements</span>
          </div>

          {loadingAnn ? (
            <div className="hs-col-loading">
              <Loader2 size={20} className="hs-spin" /> Loading…
            </div>
          ) : announcements.length === 0 ? (
            <div className="hs-col-empty">
              <Bell size={32} />
              <p>No announcements</p>
            </div>
          ) : (
            <div className="hs-ann-list">
              {announcements.map((a) => (
                <div key={a._id} className="hs-ann-card">
                  <div className="hs-ann-title">{a.title}</div>
                  <div className="hs-ann-body">{a.body}</div>
                  <div className="hs-ann-footer">
                    <span className="hs-ann-course">
                      {a.course?.code ?? "General"}
                    </span>
                    <span className="hs-ann-time">
                      <Clock size={11} /> {timeAgo(a.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </UserLayout>
  );
}
