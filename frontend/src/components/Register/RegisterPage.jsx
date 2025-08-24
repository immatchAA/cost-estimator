import React, { useState } from "react";
import backgroundImage from "../../assets/bgbg.png";
import googleIcon from "../../assets/google.png";
import "../Register/Register.css";
import { useNavigate } from "react-router-dom";

function Register() {
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

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      console.log(response);

      if (!response.ok) {
        const data = await response.json();
        setError(data.detail || "Registration failed");
        return;
      }

      const data = await response.json();
      setSuccess(data.message);
      // redirect after success
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div
      className="register-page background-blur"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="register-container">
        <div className="login-cards">
          <div className="left-card">
            <h2 className="register-title">REGISTER HERE</h2>
            <p>Don't have an account?</p>
            <button className="login-btn" onClick={() => navigate("/login")}>
              LOGIN HERE
            </button>
          </div>

          <div className="right-card">
            <h2>SIGN UP</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-container">
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  placeholder="FIRST NAME"
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
                  placeholder="LAST NAME"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>

              {["email", "password", "confirmPassword"].map((field) => (
                <div key={field} className="input-container">
                  <label htmlFor={field}>
                    {field === "email"
                      ? "Email"
                      : field === "password"
                      ? "Password"
                      : "Confirm Password"}
                  </label>
                  <input
                    type={field.includes("password") ? "password" : "email"}
                    id={field}
                    placeholder={
                      field === "email"
                        ? "EMAIL"
                        : field === "password"
                        ? "PASSWORD"
                        : "CONFIRM PASSWORD"
                    }
                    value={formData[field]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}

              <div className="input-container">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">SELECT ROLE</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              {error && <p style={{ color: "red" }}>{error}</p>}
              {success && <p style={{ color: "green" }}>{success}</p>}

              <div className="actions">
                <button type="submit">SIGN UP</button>
              </div>
            </form>

            <p className="register-text">
              Already have an account? <a href="/login">Log in here</a>
            </p>

            <div className="google-signin">
              <button className="google-btn">
                <img src={googleIcon} alt="google icon" />
                Or Register with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
