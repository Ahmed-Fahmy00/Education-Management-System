import { useState, useCallback, useEffect } from "react";
import {
  RefreshCw,
  Search,
  AlertCircle,
  GraduationCap,
  ArrowLeft,
  Mail,
  Hash,
  Building2,
  BookOpen,
  FileText,
  Printer
} from "lucide-react";
import { apiFetch, Badge, Spinner, EmptyState } from "./shared";
import TranscriptDocument from "./TranscriptDocument";

function StudentDetail({ student, onBack }) {
  const [transcript, setTranscript] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [tRes, rRes] = await Promise.all([
          apiFetch(`/api/transcripts/${student._id}`),
          apiFetch(`/api/registrations?student=${student._id}`),
        ]);
        const tData = tRes.ok ? await tRes.json() : null;
        const rData = rRes.ok ? await rRes.json() : [];
        setTranscript(tData);
        setRegistrations(Array.isArray(rData) ? rData : []);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [student._id]);

  const handleGenerateTranscript = async () => {
    setGenerating(true);
    try {
      const res = await apiFetch(`/api/transcripts/${student._id}/generate`, {
        method: "POST"
      });
      if (res.ok) {
        const updatedTranscript = await res.json();
        setTranscript(updatedTranscript);
      }
    } catch (err) {
      console.error("Failed to generate transcript", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={onBack}>
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <h2 style={{ marginBottom: 2 }}>{student.name}</h2>
            <p>{student.email}</p>
          </div>
        </div>
        <Badge variant={student.isActive ? "success" : "danger"}>
          {student.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="detail-grid-layout">
        {/* Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="detail-card">
            <div className="detail-card-title">Student Information</div>
            <div className="detail-rows">
              <div className="detail-row">
                <span className="detail-label">
                  <Hash size={13} /> Student ID
                </span>
                <span className="detail-value">{student.studentId || "—"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">
                  <Mail size={13} /> Email
                </span>
                <span className="detail-value">{student.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">
                  <Building2 size={13} /> Department
                </span>
                <span className="detail-value">
                  {student.department || "—"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Role</span>
                <span className="detail-value">
                  <Badge variant="info">student</Badge>
                </span>
              </div>
              {student.parentEmail && (
                <div className="detail-row">
                  <span className="detail-label">Parent Email</span>
                  <span className="detail-value">{student.parentEmail}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Joined</span>
                <span className="detail-value">
                  {new Date(student.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* CGPA */}
          <div className="detail-card">
            <div className="detail-card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Academic Summary</span>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={handleGenerateTranscript} 
                disabled={generating}
              >
                {generating ? <Spinner size={12} /> : <FileText size={14} />} 
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
                  <span className="detail-value">
                    {transcript.records?.length ?? 0}
                  </span>
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
          </div>
        </div>

        {/* Registrations */}
        <div className="detail-card">
          <div className="detail-card-title">
            <BookOpen size={15} /> Course Registrations ({registrations.length})
          </div>
          {loading ? (
            <div className="loading" style={{ padding: 24 }}>
              <Spinner size={16} /> Loading…
            </div>
          ) : registrations.length === 0 ? (
            <p
              style={{
                fontSize: 13,
                color: "var(--text-tertiary)",
                padding: "12px 0",
              }}
            >
              No registrations found.
            </p>
          ) : (
            <div
              className="table-container"
              style={{ boxShadow: "none", border: "none" }}
            >
              <table className="table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Semester</th>
                    <th>Grade</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((r) => (
                    <tr key={r._id}>
                      <td style={{ fontWeight: 600 }}>
                        {r.course?.code || "—"}{" "}
                        <span
                          style={{
                            fontWeight: 400,
                            color: "var(--text-secondary)",
                          }}
                        >
                          {r.course?.title}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {r.semester}
                      </td>
                      <td>{r.grade || "—"}</td>
                      <td>
                        <Badge
                          variant={
                            r.status === "enrolled"
                              ? "success"
                              : r.status === "completed"
                                ? "info"
                                : "danger"
                          }
                        >
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showTranscriptModal && (
        <div className="modal-backdrop" style={{ display: 'flex', flexDirection: 'column', padding: '40px' }}>
          <div className="modal-content" style={{ maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 0 }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', position: 'sticky', top: 0, zIndex: 10 }}>
              <h3 style={{ margin: 0 }}>Transcript Preview</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Printer size={14} /> Print / Save PDF
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowTranscriptModal(false)}>
                  Close
                </button>
              </div>
            </div>
            <div id="print-area" style={{ padding: '40px', backgroundColor: '#e5e7eb', minHeight: '800px' }}>
              <TranscriptDocument transcript={transcript} student={student} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Students() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [detailTarget, setDetailTarget] = useState(null);

  const load = useCallback(async (q = "") => {
    setLoading(true);
    setError("");
    try {
      const url = q
        ? `/api/students?q=${encodeURIComponent(q)}`
        : "/api/students";
      const res = await apiFetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    load(v);
  };

  if (detailTarget) {
    return (
      <StudentDetail
        student={detailTarget}
        onBack={() => setDetailTarget(null)}
      />
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Students</h2>
          <p>All registered students in the system</p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => load(search)}
          disabled={loading}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={15} />
          <input
            placeholder="Search students…"
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <div className="loading">
            <Spinner /> Loading students…
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No students found" />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Student ID</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr
                    key={s._id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setDetailTarget(s)}
                  >
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {s.email}
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {s.studentId || "—"}
                    </td>
                    <td>{s.department || "—"}</td>
                    <td>
                      <Badge variant={s.isActive ? "success" : "danger"}>
                        {s.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
