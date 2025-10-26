import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaTasks,
  FaChartLine,
  FaPencilRuler,
  FaStore,
  FaSignOutAlt,
  FaUser,
  FaBook,
  FaGraduationCap,
} from "react-icons/fa";
import { supabase } from "../../supabaseClient";

function Sidebar() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "",
    role: "",
    profile_image: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.getUser();

      if (sessionError || !user) {
        console.error("Failed to get user:", sessionError?.message);
        navigate("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("first_name, last_name, role, profile_image")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Failed to fetch user profile:", profileError.message);
      } else if (profile) {
        setUserProfile({
          name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
          role: profile.role || "Unknown",
          profile_image: profile.profile_image || "",
        });
      }
    };

    fetchUserData();

    // 🔁 Optional: re-fetch profile when user updates AccountE
    const channel = supabase
      .channel("profile-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "users" },
        (payload) => {
          const updated = payload.new;
          setUserProfile((prev) => ({
            ...prev,
            name: `${updated.first_name || ""} ${
              updated.last_name || ""
            }`.trim(),
            role: updated.role || prev.role,
            profile_image: updated.profile_image || prev.profile_image,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error.message);
      alert("Logout failed. Please try again.");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="custom-sidebar">
      {/* Profile Section */}
      <div className="custom-profile">
        <div className="custom-profile-pic">
          {userProfile.profile_image ? (
            <img
              src={`${userProfile.profile_image}?t=${Date.now()}`}
              alt="Profile"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <FaUser className="profile-icon" />
          )}
        </div>
        <div className="custom-profile-info">
          <h3>{userProfile.name}</h3>
          <p>{userProfile.role}</p>
        </div>
      </div>

      <hr className="custom-divider" />

      {/* Search Box */}
      <div className="custom-search-box">
        <input type="text" placeholder="Search..." />
      </div>

      {/* Navigation Links */}
      <nav className="custom-nav-links">
        {userProfile.role === "teacher" ? (
          <>
            <Link to="/teacher-dashboard" className="custom-nav-item">
              <FaHome className="custom-icon" /> Dashboard
            </Link>
            <Link to="/class-insights" className="custom-nav-item">
              <FaChartLine className="custom-icon" /> Class Insights
            </Link>
            <Link to="/uploadChallenge" className="custom-nav-item">
              <FaPencilRuler className="custom-icon" /> Create Challenge
            </Link>
            <Link to="/reading-materials" className="custom-nav-item">
              <FaBook className="custom-icon" /> Reading Materials
            </Link>
            <Link to="/material-search" className="custom-nav-item">
              <FaStore className="custom-icon" /> Virtual Store
            </Link>
            <Link to="/AccountE" className="custom-nav-item">
              <FaUser className="custom-icon" /> Account
            </Link>
          </>
        ) : (
          <>
            <Link to="/student-dashboard" className="custom-nav-item">
              <FaHome className="custom-icon" /> Dashboard
            </Link>
            <Link to="/student-challenges-details" className="custom-nav-item">
              <FaGraduationCap className="custom-icon" /> All Challenges
            </Link>
            <Link to="/reading-materials" className="custom-nav-item">
              <FaBook className="custom-icon" /> Reading Materials
            </Link>
            <Link to="/material-search" className="custom-nav-item">
              <FaStore className="custom-icon" /> Virtual Store
            </Link>
            <Link to="/AccountE" className="custom-nav-item">
              <FaUser className="custom-icon" /> Account
            </Link>
          </>
        )}

        <div
          className="custom-nav-item"
          onClick={() => setShowConfirm(true)}
          style={{ cursor: "pointer" }}
        >
          <FaSignOutAlt className="custom-icon" /> Logout
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="logout-confirm-overlay">
          <div className="logout-confirm-modal">
            <p>Are you sure you want to logout?</p>
            <div className="modal-buttons">
              <button className="yes-btn" onClick={handleLogout}>
                Yes
              </button>
              <button className="no-btn" onClick={() => setShowConfirm(false)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
