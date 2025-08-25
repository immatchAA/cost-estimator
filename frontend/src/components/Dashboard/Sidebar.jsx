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
} from "react-icons/fa";
import { supabase } from "../../supabaseClient";

function Sidebar() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [userProfile, setUserProfile] = useState({ name: "", role: "" });

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.getUser();

      if (sessionError || !user) {
        console.error("Failed to get user: ", sessionError?.message);
        navigate("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("first_name, last_name, role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Failed to fetch user profile: ", profileError.message);
      } else {
        setUserProfile({
          name: `${profile.first_name} ${profile.last_name}`,
          role: profile.role || "Unknown",
        });
      }
    };

    fetchUserData();
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
        <div className="custom-profile-pic"></div>
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
        <Link to="/dashboard" className="custom-nav-item">
          <FaHome className="custom-icon" /> Dashboard
        </Link>

        <Link to="/classkey" className="custom-nav-item">
          <FaTasks className="custom-icon" /> Class Keys
        </Link>

        <Link to="/student-progress" className="custom-nav-item">
          <FaChartLine className="custom-icon" /> Student Progress
        </Link>

        <Link to="/designPlanList" className="custom-nav-item">
          <FaPencilRuler className="custom-icon" /> Create Design
        </Link>

        <Link to="/reading-materials" className="custom-nav-item">
          <FaBook className="custom-icon" /> Reading Materials
        </Link>

        <Link to="/Virtualstore" className="custom-nav-item">
          <FaStore className="custom-icon" /> Virtual Store
        </Link>

        <Link to="/accountE" className="custom-nav-item">
          <FaUser className="custom-icon" /> Account
        </Link>

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
