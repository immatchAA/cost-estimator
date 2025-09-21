import React, { useEffect, useState } from "react";
import "./StudentDashboard.css";
import Sidebar from "../Sidebar/Sidebar";
import { supabase } from "../../supabaseClient";

function StudentDashboard() {
  const [userName, setUserName] = useState("");
  const [projects, setProjects] = useState([
    {
      title: "Residential Foundation Analysis",
      type: "Floor Plan",
      budget: 45000,
      due: "2024-01-15",
      progress: 75,
      aiAccuracy: null,
    },
    {
      title: "Commercial Steel Frame",
      type: "Elevation",
      budget: 125000,
      due: "2024-01-20",
      progress: 45,
      aiAccuracy: null,
    },
    {
      title: "Bridge Structural Elements",
      type: "Section View",
      budget: 280000,
      due: "2024-01-12",
      progress: 90,
      aiAccuracy: "92% accurate",
    },
  ]);

  useEffect(() => {
    const fetchUserData = async () => {
      // get current session user
      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.getUser();

      if (sessionError || !user) {
        console.error("Failed to get user:", sessionError?.message);
        return;
      }

      // fetch profile from "users" table
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Failed to fetch profile:", profileError.message);
      } else {
        setUserName(`${profile.first_name} ${profile.last_name}`);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="student-dashboard-wrapper">
      <Sidebar />

      <div className="student-dashboard-main">
        <div className="student-dashboard-content">
          {/* Header */}
          <header className="student-dashboard-header">
            <h2 className="student-welcome-text">
              👋 Welcome back, {userName || "Student"}!
            </h2>
            <div className="student-metrics">
              <div className="student-metric-card">
                <h3>9</h3>
                <p>Completed</p>
              </div>
              <div className="student-metric-card">
                <h3 className="purple">87%</h3>
                <p>Avg Accuracy</p>
              </div>
              <div className="student-metric-card">
                <h3 className="orange">5</h3>
                <p>Day Streak</p>
              </div>
              <div className="student-metric-card">
                <h3 className="green">#3</h3>
                <p>Class Rank</p>
              </div>
            </div>
          </header>

          {/* Active Projects */}
          <div className="student-section">
            <h3 className="student-section-title">📂 Active Cost Estimations</h3>
            {projects.map((proj, idx) => (
              <div key={idx} className="student-project-card">
                <div className="student-project-header">
                  <h4 className="student-project-title">{proj.title}</h4>
                  <button className="student-continue-btn">Continue</button>
                </div>
                <div className="student-project-tags">
                  <span className="tag">{proj.type}</span>
                  <span className="tag">💲{proj.budget.toLocaleString()}</span>
                  {proj.aiAccuracy && (
                    <span className="tag green">{proj.aiAccuracy}</span>
                  )}
                </div>
                <p className="student-due">Due {proj.due}</p>
                <div className="student-progress-bar">
                  <div style={{ width: `${proj.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="student-dashboard-right-panel">
          <div className="student-right-card">
            <h3>📊 Estimation Overview</h3>
            <p>Completion Rate</p>
            <h2>75%</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;