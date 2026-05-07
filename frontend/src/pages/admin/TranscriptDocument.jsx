import React from "react";

export default function TranscriptDocument({ transcript, student }) {
  if (!transcript || !student) return null;

  return (
    <div className="transcript-document">
      <div className="transcript-header">
        <div className="university-info">
          <h1 style={{ margin: 0 }}>University of Technology</h1>
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>
            Official Academic Transcript
          </p>
        </div>
        <div className="document-meta">
          <p>
            <strong>Date Issued:</strong> {new Date().toLocaleDateString()}
          </p>
          <p>
            <strong>Student ID:</strong> {student.studentId || "—"}
          </p>
        </div>
      </div>

      <div className="student-info-section">
        <div className="info-group">
          <label>Name:</label>
          <span>
            {student.name || `${student.firstName} ${student.lastName}`}
          </span>
        </div>
        <div className="info-group">
          <label>Department:</label>
          <span>{student.department || "—"}</span>
        </div>
        <div className="info-group">
          <label>Status:</label>
          <span>{student.isActive ? "Active" : "Inactive"}</span>
        </div>
      </div>

      <div className="transcript-body">
        <table className="transcript-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Title</th>
              <th>Semester</th>
              <th>Credits</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {transcript.records && transcript.records.length > 0 ? (
              transcript.records.map((r, i) => (
                <tr key={i}>
                  <td>{r.courseCode}</td>
                  <td>{r.courseTitle}</td>
                  <td>{r.semester}</td>
                  <td>{r.credits}</td>
                  <td>
                    <strong>{r.grade}</strong>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No completed courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="transcript-footer">
        <div className="cgpa-box">
          <span className="cgpa-label">Cumulative GPA:</span>
          <span className="cgpa-value">
            {transcript.cgpa?.toFixed(2) || "0.00"}
          </span>
        </div>
      </div>

      <style>{`
        .transcript-document {
          font-family: 'Inter', system-ui, sans-serif;
          background: white;
          color: #111827;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          max-width: 800px;
          margin: 0 auto;
        }
        
        .transcript-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .university-info h1 {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }
        
        .document-meta p {
          font-size: 14px;
          margin: 4px 0;
          text-align: right;
        }
        
        .student-info-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          background: #f9fafb;
          padding: 20px;
          border-radius: 6px;
          margin-bottom: 30px;
        }
        
        .info-group label {
          display: block;
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }
        
        .info-group span {
          font-size: 16px;
          font-weight: 600;
        }
        
        .transcript-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        
        .transcript-table th {
          text-align: left;
          padding: 12px 16px;
          background: #f3f4f6;
          color: #374151;
          font-size: 13px;
          text-transform: uppercase;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .transcript-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }
        
        .transcript-footer {
          display: flex;
          justify-content: flex-end;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
        }
        
        .cgpa-box {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          padding: 15px 25px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .cgpa-label {
          font-size: 14px;
          color: #1e40af;
          font-weight: 600;
        }
        
        .cgpa-value {
          font-size: 24px;
          color: #1d4ed8;
          font-weight: 700;
        }

        /* Print styles - scoped to standard letter size, hide everything else */
        @media print {
          @page {
            size: letter;
            margin: 0.5in;
          }
          body * {
            visibility: hidden;
          }
          /* We will wrap our modal in a container with an ID that we make visible */
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
          }
          .transcript-document {
            box-shadow: none;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}
