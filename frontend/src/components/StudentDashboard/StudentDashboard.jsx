import React, { useEffect, useState } from "react";
import "./StudentDashboard.css";
import Sidebar from "../Sidebar/Sidebar";
import Class from "../Class/Class";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";


function StudentDashboard() {
  const [userName, setUserName] = useState("");
  const [challenges, setChallenges] = useState([]);
  const [loadingChallenges, setLoadingChallenges] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      // 1) current user
      const { data: { user }, error: sessionError } = await supabase.auth.getUser();
      if (sessionError || !user) return;

      // 2) profile
      const { data: profile } = await supabase
        .from("users")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();
      if (profile) setUserName(`${profile.first_name} ${profile.last_name}`);


      setLoadingChallenges(true);
      const { data: rows, error } = await supabase
        .from("student_challenges")
        .select("challenge_id, challenge_name, challenge_instructions")
        .order("created_at", { ascending: false }); 

      if (!error && rows) setChallenges(rows);
      setLoadingChallenges(false);
    })();
  }, []);

  const truncate = (s, n = 160) => (s ? (s.length > n ? s.slice(0, n) + "…" : s) : "—");

  return (
    <div className="student-dashboard-wrapper">
      <Sidebar />

      <div className="student-dashboard-main">
        <div className="student-dashboard-content">
          {/* Header */}
          <header className="student-dashboard-header">
            <h2 className="student-welcome-text">👋 Welcome back, {userName || "Student"}!</h2>
            <div className="student-metrics">
              <div className="student-metric-card"><h3>9</h3><p>Completed</p></div>
              <div className="student-metric-card"><h3 className="purple">0%</h3><p>Avg Accuracy</p></div>
              <div className="student-metric-card"><h3 className="orange">0</h3><p>Day Streak</p></div>
              <div className="student-metric-card"><h3 className="green">#0</h3><p>Class Rank</p></div>
            </div>
          </header>

          {/* Classes */}
          <div className="student-section">
            <Class />
          </div>

          {/* Active Cost Estimations (from Supabase) */}
          <div className="student-section">
            <h3 className="student-section-title">📂 Active Cost Estimations</h3>

            {loadingChallenges && <p>Loading challenges…</p>}

            {!loadingChallenges && challenges.length === 0 && (
              <p>No active challenges yet.</p>
            )}

            {!loadingChallenges && challenges.map((c, idx) => (
              <div key={idx} className="student-project-card">
                <div className="student-project-header">
                  <h4 className="student-project-title">{c.challenge_name || "Untitled Challenge"}</h4>
                  <button className="student-continue-btn" onClick={() => navigate(`/student-challenges/${c.challenge_id}`)}
                  >Start
                  </button>
                </div>
                <div className="student-project-tags">
                  <span className="tag">Challenge</span>
                </div>
                <p className="student-due"></p>
                <p style={{ marginTop: 8 }}>{truncate(c.challenge_instructions, 180)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="student-dashboard-right-panel">
          <div className="student-right-card">
            <h3>📊 Estimation Overview</h3>
            <p>Completion Rate</p>
            <h2>0%</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
