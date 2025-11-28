import React, { useState } from "react";
import backgroundImage from "../../assets/bgbg.png";
import "../Register/Register.css";
import { useNavigate } from "react-router-dom";
// EmailVerification component kept for future use when verification is re-enabled
// import EmailVerification from "../EmailVerification/EmailVerification";

function RegisterForm() {
  const navigate = useNavigate();

  // store form values
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Verification step temporarily disabled
  // const [showVerification, setShowVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // update input values
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Direct registration without verification (verification feature temporarily disabled)
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      const apiBaseNoPrefix = apiBase.replace('/api', '') || "http://localhost:8000";
      
      const registerResponse = await fetch(
        `${apiBaseNoPrefix}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          }),
        }
      );

      if (!registerResponse.ok) {
        const data = await registerResponse.json();
        setError(data.detail || "Registration failed");
        setIsLoading(false);
        return;
      }

      const data = await registerResponse.json();
      setSuccess(data.message || "Registration successful!");

      // Auto-login after registration
      const loginRes = await fetch(`${apiBaseNoPrefix}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        localStorage.setItem("access_token", loginData.session.access_token);
        localStorage.setItem("refresh_token", loginData.session.refresh_token);
      }

      // Redirect to login page after successful registration
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Verification handlers temporarily disabled - will be re-enabled later
  // const handleVerificationComplete = async (verificationCode) => { ... }
  // const handleBackToRegister = () => { ... }
  
  // Verification component rendering temporarily disabled
  // if (showVerification) {
  //   return (
  //     <EmailVerification
  //       email={formData.email}
  //       onVerificationComplete={handleVerificationComplete}
  //       onBack={handleBackToRegister}
  //       registrationData={formData}
  //     />
  //   );
  // }

  return (
    <div
      className="register-page background-blur"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="register-container">
        <div className="login-cards">
          {/* Left section */}
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
                <span className="font-medium text-4xl mb-3">
                  Start Your Journey Here
                </span>

                <span className="text-l font-light text-md mb-3">
                  Plan smarter, save more, and make confident decisions with our
                  guided tools.
                </span>

                <span className="text-m font-light text-md mb-3">
                  With intelligent cost estimation
                </span>
              </div>

              <div className="action-section">
                <button
                  className="register-btn"
                  onClick={() => navigate("/login")}
                >
                  SIGN IN INSTEAD
                </button>
                <div className="progress-indicators">
                  <div className="indicator"></div>
                  <div className="indicator active"></div>
                  <div className="indicator"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="right-card">
            <h2>SIGN UP</h2>
            <form onSubmit={handleSubmit}>
              {/* Row 1: First + Last name */}
              <div className="form-row">
                <div className="input-container">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-container">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Row 2: Email + Role */}
              <div className="form-row">
                <div className="input-container">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-container">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Password + Confirm Password */}
              <div className="form-row">
                <div className="input-container">
                  <label htmlFor="password">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
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
                  </div>
                </div>

                <div className="input-container">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
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
                  </div>
                </div>
              </div>

              {/* Errors / Success */}
              {error && <p style={{ color: "red" }}>{error}</p>}
              {success && <p style={{ color: "green" }}>{success}</p>}

              {/* Submit */}
              <div className="actions">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "REGISTERING..." : "SIGN UP"}
                </button>
              </div>
            </form>

            <p className="register-text">
              Already have an account? <a href="/login">Log in here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
