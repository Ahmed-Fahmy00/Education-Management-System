import {
  UserCheck,
  GraduationCap,
  Users,
  BookOpen,
  DoorOpen,
} from "lucide-react";

export default function Overview({ stats }) {
  const cards = [
    {
      label: "Pending Applications",
      value: stats.pending,
      icon: UserCheck,
      color: "blue",
    },
    {
      label: "Total Students",
      value: stats.students,
      icon: GraduationCap,
      color: "purple",
    },
    { label: "Staff Members", value: stats.staff, icon: Users, color: "cyan" },
    {
      label: "Active Courses",
      value: stats.courses,
      icon: BookOpen,
      color: "orange",
    },
    { label: "Rooms", value: stats.rooms, icon: DoorOpen, color: "green" },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Overview</h2>
          <p>A snapshot of the Education Management System</p>
        </div>
      </div>
      <div className="stats-grid">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <div className={`stat-icon ${c.color}`}>
              <c.icon size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-label">{c.label}</div>
              <div className="stat-value">{c.value ?? "—"}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
