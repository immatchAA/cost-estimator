import React, { useState, useEffect } from "react";
import backgroundImage from "../../assets/bgbg.png";
import "../Register/Register.css";
import { useNavigate } from "react-router-dom";

function EmailVerification({
  email,
  onVerificationComplete, // kept for compatibility, but no longer required
  onBack,
  registrationData, // used to finish registration after verification
}) {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Start countdown timer (10 minutes = 600 seconds)
    setTimeLeft(600);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleVerificationCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 6) {
      setVerificationCode(value);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    if (!registrationData) {
      setError("Registration data missing. Please go back and fill the form.");
      return;
    }

    setIsLoading(true);

    try {
      // ✅ Single call that verifies AND creates the account.
      const registerRes = await fetch(
        "http://127.0.0.1:8000/auth/register-with-verification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...registrationData, // name / password / etc.
            email, // ensure email is included
            verification_code: verificationCode,
            // optionally also send "code" if your backend accepts either key:
            // code: verificationCode,
          }),
        }
      );

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        setError(registerData.detail || "Registration failed.");
        setIsLoading(false);
        return;
      }

      setSuccess(registerData.message || "Account created successfully!");
      if (typeof onVerificationComplete === "function") {
        onVerificationComplete(verificationCode);
      }
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/verification/resend-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data.detail || "Failed to resend code");
        return;
      }

      setSuccess("Verification code resent successfully!");
      setCanResend(false);
      setTimeLeft(600); // Reset timer

      // Restart countdown
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

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
                <span className="font-medium text-2xl mb-3">
                  You're Almost There!
                </span>
                <span className="text-l font-light text-md mb-3">
                  Secure your account with verification
                </span>
              </div>

              <div className="action-section">
                <button className="register-btn" onClick={onBack}>
                  BACK TO REGISTER
                </button>
                <div className="progress-indicators">
                  <div className="indicator"></div>
                  <div className="indicator"></div>
                  <div className="indicator active"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="right-card">
            <h2>VERIFY YOUR EMAIL</h2>
            <p
              style={{
                textAlign: "center",
                marginBottom: "20px",
                color: "#666",
              }}
            >
              We've sent a 6-digit verification code to:
              <br />
              <strong>{email}</strong>
            </p>

            <form onSubmit={handleVerifyCode}>
              <div className="input-container" style={{ marginBottom: "20px" }}>
                <label htmlFor="verificationCode">Verification Code</label>
                <input
                  type="text"
                  id="verificationCode"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={handleVerificationCodeChange}
                  maxLength="6"
                  style={{
                    textAlign: "center",
                    fontSize: "16px",
                    letterSpacing: "8px",
                    fontFamily: "monospace",
                  }}
                  required
                />
              </div>

              {/* Timer */}
              {timeLeft > 0 && (
                <p
                  style={{
                    textAlign: "center",
                    color: "#666",
                    marginBottom: "10px",
                  }}
                >
                  Code expires in: <strong>{formatTime(timeLeft)}</strong>
                </p>
              )}

              {/* Errors / Success */}
              {error && (
                <p style={{ color: "red", textAlign: "center" }}>{error}</p>
              )}
              {success && (
                <p style={{ color: "green", textAlign: "center" }}>{success}</p>
              )}

              {/* Submit */}
              <div className="actions">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "VERIFYING..." : "VERIFY EMAIL"}
                </button>
              </div>
            </form>

            {/* Resend Code */}
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#007bff",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  {isLoading ? "Sending..." : "Resend verification code"}
                </button>
              ) : (
                <p style={{ color: "#666", fontSize: "14px" }}>
                  Resend code available in {formatTime(timeLeft)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailVerification;
