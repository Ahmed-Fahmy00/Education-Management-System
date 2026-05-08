import { Loader2 } from "lucide-react";

export function apiFetch(url, opts = {}) {
  const { headers, ...rest } = opts;
  let user = null;
  try { user = JSON.parse(localStorage.getItem("user")); } catch { /* ignore */ }
  const authHeaders = {};
  if (user?.id) authHeaders["x-user-id"] = user.id;
  if (user?.role) authHeaders["x-user-role"] = user.role;
  return fetch(url, {
    ...rest,
    headers: { "Content-Type": "application/json", ...authHeaders, ...(headers || {}) },
  });
}

export function Badge({ variant = "secondary", children }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

export function Spinner({ size = 20 }) {
  return <Loader2 size={size} className="spin" />;
}

export function EmptyState({ icon: Icon, title = "Nothing here", desc = "" }) {
  return (
    <div className="empty-state">
      <Icon />
      <h3>{title}</h3>
      {desc && <p>{desc}</p>}
    </div>
  );
}
