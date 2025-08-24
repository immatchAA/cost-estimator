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

        // Redirect to dashboard after a short delay
        setTimeout(() => navigate("/dashboard"), 1000);
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
            <h2 className="instructor-title">LOGIN HERE</h2>
            <button
              className="register-btn"
              onClick={() => navigate("/register")}
            >
              REGISTER HERE
            </button>
          </div>

          <div className="right-card">
            <h2>SIGN IN</h2>
            <form onSubmit={handleSubmit}>
              {["email", "password"].map((field) => (
                <div key={field} className="input-container">
                  <label htmlFor={field}>
                    {field === "email" ? "Email" : "Password"}
                  </label>
                  <input
                    type={field === "password" ? "password" : "email"}
                    id={field}
                    placeholder={field === "password" ? "PASSWORD" : "EMAIL"}
                    value={formData[field]}
                    onChange={handleChange}
                    required
                  />
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
