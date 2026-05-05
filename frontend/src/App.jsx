import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Application from "./pages/Application";
import Home from "./pages/Home";
import "./App.css";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AuthRoute({ children }) {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/home" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route
          path="/login"
          element={
            <AuthRoute>
              {" "}
              <Login />{" "}
            </AuthRoute>
          }
        />
        <Route
          path="/application"
          element={
            <AuthRoute>
              {" "}
              <Application />{" "}
            </AuthRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              {" "}
              <Home />{" "}
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
