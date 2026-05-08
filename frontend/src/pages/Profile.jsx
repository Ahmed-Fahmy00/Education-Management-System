import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  BookOpen,
  FileText,
  GraduationCap,
  Loader2,
  Mail,
  PencilLine,
  Phone,
  Printer,
  Shield,
  User,
  Users,
  Save,
  X,
} from "lucide-react";
import { UserLayout } from "./Home";
import { apiFetch } from "../api/http";
import { staffApi } from "../api/staff";
import { studentApi } from "../api/students";
import { getCoursesByInstructorId } from "../api/courses";
import { listRegistrations } from "../api/registrations";
import TranscriptDocument from "./admin/TranscriptDocument";
import "../styles/admin.css";
import "../styles/home.css";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function getYearClassification(studentId) {
  if (!studentId) return null;
  const match = studentId.match(/^(\d{2})[se]/i);
  if (!match) return null;

  const enrollYY = parseInt(match[1], 10);
  const currentYY = new Date().getFullYear() % 100;
  const diff =
    enrollYY <= currentYY ? currentYY - enrollYY : currentYY + (100 - enrollYY);
  const year = diff + 1;

  if (year <= 1) return { label: "Freshman", color: "#3b82f6", year: 1 };
  if (year === 2) return { label: "Sophomore", color: "#10b981", year: 2 };
  if (year === 3) return { label: "Junior", color: "#f59e0b", year: 3 };
  return { label: "Senior", color: "#8b5cf6", year: 4 };
}

function initialsFromName(name) {
  return (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getInitialForm(profile) {
  if (!profile) return null;

  if (profile._type === "student") {
    return {
      name: profile.name || "",
      email: profile.email || "",
      department: profile.department || "",
      parentEmail: profile.parentEmail || "",
      password: "",
    };
  }

  return {
    name: profile.name || "",
    email: profile.email || "",
    department: profile.department || "",
    phone: profile.phone || "",
    officeLocation: profile.officeLocation || "",
    password: "",
  };
}

async function resolveStudentProfile(identifier) {
  try {
    const profile = await studentApi.getStudentById(identifier);
    return { ...profile, _type: "student" };
  } catch (error) {
    if (error?.status !== 404) {
      throw error;
    }

    const matches = await studentApi.searchStudents(identifier);
    const found = Array.isArray(matches)
      ? matches.find(
          (item) =>
            String(item._id) === String(identifier) ||
            String(item.studentId || "") === String(identifier),
        )
      : null;

    return found ? { ...found, _type: "student" } : null;
  }
}

async function resolveStaffProfile(identifier) {
  try {
    const profile = await staffApi.getProfileById(identifier);
    return { ...profile, _type: profile._type || "profile" };
  } catch (error) {
    if (error?.status !== 404) {
      throw error;
    }

    const matches = await staffApi.getProfiles();
    const found = Array.isArray(matches)
      ? matches.find(
          (item) =>
            String(item._id) === String(identifier) ||
            String(item.userId || "") === String(identifier) ||
            String(item.staffId || "") === String(identifier),
        )
      : null;

    return found ? { ...found, _type: found._type || "profile" } : null;
  }
}

function EditField({ label, value, onChange, type = "text", icon, fullWidth = false, required = false }) {
  return (
    <div className={`modal-field ${fullWidth ? "modal-field-full" : ""}`}>
      <label className="modal-label">
        {icon}
        {label}
        {required ? <span className="modal-required">*</span> : null}
      </label>
      <input
        className="modal-input"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function ProfileEditModal({ profile, form, error, saving, onClose, onSave, onChange }) {
  const isStudent = profile?._type === "student";
  const profileId = isStudent ? (profile.studentId || profile._id) : (profile.staffId || profile.userId || profile._id);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3 className="modal-title">Edit Profile</h3>
            <p className="modal-subtitle">
              Editing {profile.name || "Unnamed profile"}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSave} className="modal-body">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              <Shield size={14} /> {error}
            </div>
          )}

          <div className="modal-grid">
            <EditField
              label="Full Name"
              icon={<User size={14} />}
              value={form.name}
              onChange={(value) => onChange("name", value)}
              required
            />

            <div className="modal-field">
              <label className="modal-label">{isStudent ? "Student ID" : "Staff ID"}</label>
              <input
                className="modal-input"
                value={profileId || "—"}
                disabled
                style={{
                  background: "var(--bg-tertiary)",
                  fontFamily: "monospace",
                  color: "var(--text-secondary)",
                  cursor: "not-allowed",
                }}
              />
            </div>

            <EditField
              label="Email"
              icon={<Mail size={14} />}
              type="email"
              value={form.email}
              onChange={(value) => onChange("email", value)}
              required
            />

            <EditField
              label="Department"
              icon={<Building2 size={14} />}
              value={form.department}
              onChange={(value) => onChange("department", value)}
              required={isStudent}
            />

            <EditField
              label="New Password"
              icon={<Shield size={14} />}
              type="password"
              value={form.password || ""}
              onChange={(value) => onChange("password", value)}
              fullWidth
            />

            {isStudent ? (
              <EditField
                label="Parent Email"
                icon={<Users size={14} />}
                type="email"
                value={form.parentEmail}
                onChange={(value) => onChange("parentEmail", value)}
              />
            ) : (
              <>
                <EditField
                  label="Phone"
                  icon={<Phone size={14} />}
                  value={form.phone}
                  onChange={(value) => onChange("phone", value)}
                />
                <EditField
                  label="Office Location"
                  icon={<Building2 size={14} />}
                  value={form.officeLocation}
                  onChange={(value) => onChange("officeLocation", value)}
                  fullWidth
                />
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              <X size={14} /> Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 size={14} className="hs-spin" /> : <Save size={14} />}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { kind, id } = useParams();

  const [currentUser] = useState(getStoredUser);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [courseRows, setCourseRows] = useState([]);
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        let nextProfile = null;

        if (kind === "student" && id) {
          nextProfile = await resolveStudentProfile(id);
        } else if (kind === "staff" && id) {
          nextProfile = await resolveStaffProfile(id);
        } else if (currentUser?.role === "student") {
          nextProfile = await resolveStudentProfile(currentUser.id);
        } else if (currentUser?.role === "instructor" || currentUser?.role === "admin") {
          nextProfile = await resolveStaffProfile(currentUser.id);
        }

        if (!active) return;

        if (!nextProfile) {
          setError("Profile not found.");
          setProfile(null);
          setForm(null);
          setCourseRows([]);
          setTranscript(null);
        } else {
          setProfile(nextProfile);
          setForm(getInitialForm(nextProfile));
          setIsEditing(false);
          if (nextProfile._type !== "student") {
            setTranscript(null);
            setShowTranscriptModal(false);
          }
        }
      } catch {
        if (active) {
          setError("Profile not found or access denied.");
          setProfile(null);
          setForm(null);
          setCourseRows([]);
          setTranscript(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [kind, id, currentUser]);

  useEffect(() => {
    if (!profile) return;

    let active = true;

    async function loadCourses() {
      setCoursesLoading(true);
      try {
        const rows =
          profile._type === "student"
            ? await listRegistrations(`student=${profile._id}`)
            : profile.role === "instructor"
              ? await getCoursesByInstructorId(profile._id)
              : [];
        if (!active) return;
        setCourseRows(Array.isArray(rows) ? rows : []);
      } catch {
        if (active) {
          setCourseRows([]);
        }
      } finally {
        if (active) setCoursesLoading(false);
      }
    }

    loadCourses();

    return () => {
      active = false;
    };
  }, [profile]);

  useEffect(() => {
    if (!profile || profile._type !== "student" || currentUser?.role !== "admin") {
      return;
    }

    let active = true;

    async function loadTranscript() {
      setTranscriptLoading(true);
      try {
        const row = await apiFetch(`/api/transcripts/${profile._id}`);
        if (!active) return;
        setTranscript(row || null);
      } catch {
        if (active) {
          setTranscript(null);
        }
      } finally {
        if (active) setTranscriptLoading(false);
      }
    }

    loadTranscript();

    return () => {
      active = false;
    };
  }, [profile, currentUser]);

  const classification = useMemo(() => {
    if (!profile || profile._type !== "student") return null;
    return getYearClassification(profile.studentId);
  }, [profile]);

  const canEdit = Boolean(
    currentUser &&
      profile &&
      (currentUser.role === "admin" ||
        String(currentUser.id) === String(profile._id) ||
        String(currentUser.id) === String(profile.userId)),
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleCancelEdit = () => {
    setForm(getInitialForm(profile));
    setIsEditing(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!profile || !form) return;

    setSaving(true);
    setError("");

    try {
      let updatedProfile;

      if (profile._type === "student") {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim(),
          department: form.department.trim(),
          parentEmail: form.parentEmail.trim(),
        };
        if (form.password?.trim()) {
          payload.password = form.password;
        }

        updatedProfile = await studentApi.updateStudent(
          profile._id,
          payload,
          currentUser.id,
          currentUser.role,
        );
        updatedProfile = { ...updatedProfile, _type: "student" };
      } else {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim(),
          department: form.department.trim(),
          phone: form.phone.trim(),
          officeLocation: form.officeLocation.trim(),
        };
        if (form.password?.trim()) {
          payload.password = form.password;
        }

        updatedProfile = await staffApi.updateProfile(
          profile._id,
          payload,
          currentUser.id,
          currentUser.role,
        );

        updatedProfile = { ...updatedProfile, _type: profile._type || "staff" };
      }

      setProfile(updatedProfile);
      setForm(getInitialForm(updatedProfile));
      setIsEditing(false);

      if (String(currentUser?.id) === String(updatedProfile._id)) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...currentUser,
            name: updatedProfile.name || currentUser.name,
            email: updatedProfile.email || currentUser.email,
            department: updatedProfile.department || currentUser.department,
          }),
        );
      }
    } catch (saveError) {
      setError(saveError.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile?.name || "Unnamed profile";
  const avatar = initialsFromName(displayName);
  const isStudent = profile?._type === "student";
  const isInstructor = !isStudent && profile?.role === "instructor";
  const showAcademicSummary = isStudent && currentUser?.role === "admin";
  const backLabel = currentUser?.role === "admin" ? "Back to Admin" : "Back to Home";
  const backPath = currentUser?.role === "admin" ? "/admin" : "/home";
  const enrolledCourses = courseRows.filter(
    (row) => row.status === "enrolled" || row.status === "completed",
  );
  const courseTitle = isStudent ? "Courses Taken" : "Courses Teaching";

  if (loading) {
    return (
      <UserLayout user={currentUser} onLogout={handleLogout}>
        <div style={{ padding: 24 }}>
          <div className="detail-card" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Loader2 size={18} className="hs-spin" /> Loading profile...
          </div>
        </div>
      </UserLayout>
    );
  }

  if (error && !profile) {
    return (
      <UserLayout user={currentUser} onLogout={handleLogout}>
        <div style={{ padding: 24 }}>
          <div className="detail-card" style={{ color: "var(--accent-danger)" }}>
            {error}
          </div>
        </div>
      </UserLayout>
    );
  }

  if (!profile || !form) {
    return (
      <UserLayout user={currentUser} onLogout={handleLogout}>
        <div style={{ padding: 24 }}>
          <div className="detail-card">No profile data available.</div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout user={currentUser} onLogout={handleLogout}>
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(backPath)}>
            <ArrowLeft size={14} /> {backLabel}
          </button>
          {canEdit && !isEditing && (
            <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)}>
              <PencilLine size={14} /> Edit profile
            </button>
          )}
        </div>

        <div
          className="detail-hero-card"
          style={{ alignItems: "flex-start" }}
        >
          <div
            className="detail-hero-avatar"
            style={{
              background:
                "linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-purple) 100%)",
              flexShrink: 0,
            }}
          >
            {avatar}
          </div>

          <div className="detail-hero-info">
            <div className="detail-hero-name">{displayName}</div>
            <div className="detail-hero-sub">{profile.email || "No email provided"}</div>
            <div className="detail-hero-sub" style={{ marginTop: 0, marginBottom: 10 }}>
              {isStudent ? (profile.studentId || profile._id) : (profile.staffId || profile.userId || profile._id)}
            </div>
            <div className="detail-hero-meta" style={{ marginBottom: 14 }}>
              <span
                className={`badge ${isStudent ? "badge-info" : profile.role === "admin" ? "badge-purple" : "badge-secondary"}`}
              >
                {isStudent ? "Student" : profile.role || "Staff"}
              </span>
              {profile.department && (
                <span className="detail-hero-chip">
                  <Building2 size={12} /> {profile.department}
                </span>
              )}
              {classification && (
                <span
                  className="detail-hero-chip"
                  style={{
                    background: `${classification.color}14`,
                    color: classification.color,
                    borderColor: `${classification.color}30`,
                  }}
                >
                  <GraduationCap size={12} /> Year {classification.year}
                </span>
              )}
              {profile.isActive !== undefined && (
                <span className="detail-hero-chip">
                  <Shield size={12} /> {profile.isActive ? "Active" : "Inactive"}
                </span>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <ProfileEditModal
            profile={profile}
            form={form}
            error={error}
            saving={saving}
            onClose={handleCancelEdit}
            onSave={handleSave}
            onChange={handleChange}
          />
        )}

        {isStudent && (
          <section className="detail-card" style={{ marginTop: 20 }}>
            <div className="detail-card-title">
              <BookOpen size={14} /> {courseTitle}
              <span className="detail-card-count">
                {enrolledCourses.length} active / {courseRows.length} total
              </span>
            </div>

            {coursesLoading ? (
              <div className="detail-empty">
                <Loader2 size={18} className="hs-spin" />
                <p>Loading courses...</p>
              </div>
            ) : courseRows.length === 0 ? (
              <div className="detail-empty">
                <BookOpen size={32} />
                <p>No courses found for this student.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Title</th>
                      <th>Semester</th>
                      <th>Grade</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseRows.map((row) => (
                      <tr key={row._id}>
                        <td>
                          <code
                            style={{
                              background: "var(--bg-tertiary)",
                              padding: "2px 8px",
                              borderRadius: 4,
                              fontSize: 12,
                            }}
                          >
                            {row.course?.code || "—"}
                          </code>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {row.course?.title || "Untitled course"}
                        </td>
                        <td style={{ color: "var(--text-secondary)" }}>
                          {row.semester || "—"}
                        </td>
                        <td>{row.grade || "—"}</td>
                        <td>
                          <span
                            className={`badge ${row.status === "completed" ? "badge-info" : row.status === "enrolled" ? "badge-success" : "badge-secondary"}`}
                          >
                            {row.status || "enrolled"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {isInstructor && (
          <section className="detail-card" style={{ marginTop: 20 }}>
            <div className="detail-card-title">
              <BookOpen size={14} /> {courseTitle}
              <span className="detail-card-count">{courseRows.length}</span>
            </div>

            {coursesLoading ? (
              <div className="detail-empty">
                <Loader2 size={18} className="hs-spin" />
                <p>Loading courses...</p>
              </div>
            ) : courseRows.length === 0 ? (
              <div className="detail-empty">
                <BookOpen size={32} />
                <p>No courses assigned to this instructor.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Title</th>
                      <th>Department</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseRows.map((row) => (
                      <tr key={row._id}>
                        <td>
                          <code
                            style={{
                              background: "var(--bg-tertiary)",
                              padding: "2px 8px",
                              borderRadius: 4,
                              fontSize: 12,
                            }}
                          >
                            {row.code || "—"}
                          </code>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {row.title || "Untitled course"}
                        </td>
                        <td style={{ color: "var(--text-secondary)" }}>
                          {row.department || "—"}
                        </td>
                        <td>
                          <span
                            className={`badge ${row.type === "elective" ? "badge-warning" : "badge-info"}`}
                          >
                            {row.type || "core"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${row.isActive ? "badge-success" : "badge-secondary"}`}
                          >
                            {row.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {showAcademicSummary && (
          <section className="detail-card" style={{ marginTop: 20 }}>
            <div className="detail-card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Academic Summary</span>
              <button
                className="btn btn-primary btn-sm"
                onClick={async () => {
                  setTranscriptLoading(true);
                  try {
                    const updatedTranscript = await apiFetch(`/api/transcripts/${profile._id}/generate`, {
                      method: "POST",
                    });
                    setTranscript(updatedTranscript);
                  } finally {
                    setTranscriptLoading(false);
                  }
                }}
                disabled={transcriptLoading}
              >
                {transcriptLoading ? <Loader2 size={12} className="hs-spin" /> : <FileText size={14} />}
                {transcript ? "Update Transcript" : "Generate Transcript"}
              </button>
            </div>
            {transcript ? (
              <div className="detail-rows">
                <div className="detail-row">
                  <span className="detail-label">CGPA</span>
                  <span
                    className="detail-value"
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "var(--accent-primary)",
                    }}
                  >
                    {transcript.cgpa?.toFixed(2) ?? "—"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Courses Completed</span>
                  <span className="detail-value">{transcript.records?.length ?? 0}</span>
                </div>
                <div style={{ marginTop: 16 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowTranscriptModal(true)}
                  >
                    <FileText size={14} /> View Transcript Document
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "var(--text-tertiary)", padding: "12px 0" }}>
                No transcript generated yet.
              </p>
            )}
          </section>
        )}

        {showTranscriptModal && (
          <div
            className="modal-backdrop"
            style={{ display: "flex", flexDirection: "column", padding: "40px" }}
          >
            <div
              className="modal-content"
              style={{
                maxWidth: "900px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: 0,
              }}
            >
              <div
                style={{
                  padding: "16px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "var(--bg-secondary)",
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                }}
              >
                <h3 style={{ margin: 0 }}>Transcript Preview</h3>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                    <Printer size={14} /> Print / Save PDF
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowTranscriptModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
              <div
                id="print-area"
                style={{ padding: "40px", backgroundColor: "#e5e7eb", minHeight: "800px" }}
              >
                <TranscriptDocument transcript={transcript} student={profile} />
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
