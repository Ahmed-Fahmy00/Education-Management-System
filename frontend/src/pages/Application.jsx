import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, BookOpen } from "lucide-react";
import "../styles/register.css";

export default function Application() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    level: "",
    role: "student",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!formData.name.trim()) return "Please enter your full name";
    if (!formData.email.trim()) return "Please enter your email";
    if (!formData.email.includes("@")) return "Please enter a valid email";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      alert(err);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          level: formData.level,
          role: formData.role,
        }),
      });

      if (response.ok) {
        alert("Application submitted successfully!");
        navigate("/login");
      } else {
        const error = await response.json();
        alert(error.message || "Application submission failed");
      }
    } catch (error) {
      console.error("Application error:", error);
      alert("Application submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <p className="register-subtitle">Registration Application</p>
            <p className="register-description">Complete your EMS registration</p>
          </div>
          <div className="register-content">
            <form onSubmit={handleSubmit} className="register-form two-column">
              <h3 className="step-title full-width">Applicant Details</h3>

              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input id="name" name="name" type="text" placeholder="John Doe" value={formData.name} onChange={handleChange} className="input-with-icon" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-with-icon"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input id="password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} className="input-with-icon"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-with-icon"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="level">Academic Level</label>
                <div className="input-wrapper">
                  <BookOpen size={18} className="input-icon" />
                  <input
                    id="level"
                    name="level"
                    type="text"
                    placeholder="e.g., Freshman, Sophomore"
                    value={formData.level}
                    onChange={handleChange}
                    className="input-with-icon"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="role">User Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input select-input"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>

              <button type="submit" className="btn-register-full full-width" disabled={loading}>
                {loading ? "Submitting..." : "Submit Application"}
              </button>

              <div className="register-footer full-width">
                <p>
                  Already registered?{" "}
                  <button type="button" onClick={() => navigate("/login")} className="signin-link">
                    Sign in here
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
