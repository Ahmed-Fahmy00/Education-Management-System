import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Application from "./pages/Application";
import Home from "./pages/Home";
import Admin from "./pages/admin/Admin";
import Profile from "./pages/Profile";
import Announcements from "./pages/Announcements";
import CourseRequirements from "./pages/CourseRequirements";
import Rooms from "./pages/Rooms";
import "./App.css";

function getStoredUser() {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const user = getStoredUser();
    if (!user || !allowedRoles.includes(user.role)) {
      return (
        <Navigate to={user?.role === "admin" ? "/admin" : "/home"} replace />
      );
    }
  }

  return children;
}

function AuthRoute({ children }) {
  const token = localStorage.getItem("token");
  if (token) {
    const user = getStoredUser();
    return (
      <Navigate to={user?.role === "admin" ? "/admin" : "/home"} replace />
    );
  }
  return children;
}

function RootRedirect() {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const user = getStoredUser();
  return <Navigate to={user?.role === "admin" ? "/admin" : "/home"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />
        <Route
          path="/application"
          element={
            <AuthRoute>
              <Application />
            </AuthRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={["student", "instructor"]}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["student", "instructor"]}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/announcements"
          element={
            <ProtectedRoute allowedRoles={["student", "instructor"]}>
              <Announcements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course-requirements"
          element={
            <ProtectedRoute allowedRoles={["student", "instructor"]}>
              <CourseRequirements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<RootRedirect />} />
        <Route
          path="/rooms"
          element={
            <ProtectedRoute allowedRoles={[]}>
              <Rooms />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
