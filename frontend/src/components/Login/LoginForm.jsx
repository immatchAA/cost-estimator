import React, { useState } from "react";
import "../Register/Register.css";
import backgroundImage from "../../assets/bgbg.png";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient"; // make sure this path is correct

function Login() {
  const navigate = useNavigate();

  // Store form values
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Update input values
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Use Supabase signInWithPassword directly
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.session) {
        setSuccess("Login successful!");
        // Optionally store user info in localStorage if needed
        localStorage.setItem("supabaseSession", JSON.stringify(data.session));
        localStorage.setItem("supabaseUser", JSON.stringify(data.user));

        // Get user role and redirect accordingly
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.error("Failed to fetch user profile:", profileError.message);
          setError("Failed to fetch user profile. Please try again.");
          return;
        }

        // Redirect based on role
        if (profile.role === "teacher") {
          setTimeout(() => navigate("/teacher-dashboard"), 1000);
        } else if (profile.role === "student") {
          setTimeout(() => navigate("/student-dashboard"), 1000);
        } else {
          setError("Invalid user role. Please contact administrator.");
        }
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div
      className="login-page background-blur"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="login-container">
        <div className="login-cards">
          <div className="left-card">
            <div className="architectural-scene">
              <div className="building-container">
                <div className="modern-building">
                  <div className="building-roof"></div>
                  <div className="building-facade">
                    <div className="window-grid">
                      <div className="window"></div>
                      <div className="window"></div>
                      <div className="window"></div>
                      <div className="window"></div>
                      <div className="window"></div>
                      <div className="window"></div>
                    </div>
                  </div>
                  <div className="building-platform"></div>
                </div>
                <div className="water-reflection"></div>
                <div className="warm-lights"></div>
              </div>
            </div>

            <div className="brand-content">
              <div className="logo-section">
                <div className="logo-icon">🏗️</div>
                <span className="logo-text">ArchiQuest</span>
              </div>

              <div className="main-title">
                <span className="font-medium text-5xl mb-3">
                  Transform Your Vision
                </span>
                <p>Bridging Design and Budget Seamlessly</p>
              </div>

              <div className="action-section">
                <button
                  className="register-btn"
                  onClick={() => navigate("/register")}
                >
                  CREATE ACCOUNT
                </button>
                <div className="progress-indicators">
                  <div className="indicator active"></div>
                  <div className="indicator"></div>
                  <div className="indicator"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="right-card">
            <h2>SIGN IN</h2>
            <form onSubmit={handleSubmit}>
              {["email", "password"].map((field) => (
                <div key={field} className="input-container">
                  <label htmlFor={field}>
                    {field === "email" ? "Email" : "Password"}
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={
                        field === "password"
                          ? showPassword
                            ? "text"
                            : "password"
                          : "email"
                      }
                      id={field}
                      placeholder={field === "password" ? "PASSWORD" : "EMAIL"}
                      value={formData[field]}
                      onChange={handleChange}
                      required
                    />
                    {field === "password" && (
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        ) : (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {error && <p style={{ color: "red" }}>{error}</p>}
              {success && <p style={{ color: "green" }}>{success}</p>}

              <div className="actions">
                <button type="submit">LOGIN</button>
                <p className="forgot-password">Forgot Password?</p>
              </div>
            </form>

            <p className="register-text">
              Don't have an Account? <a href="/register">Sign Up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
