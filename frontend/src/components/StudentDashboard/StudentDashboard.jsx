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
  const [submittedMap, setSubmittedMap] = useState({});
  const [completedCount, setCompletedCount] = useState(0);
  const [avgAccuracy, setAvgAccuracy] = useState(0);


  const sortedChallenges = [...challenges].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );

 useEffect(() => {
  (async () => {
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();
    if (sessionError || !user) return;

    // Fetch student name
    const { data: profile } = await supabase
      .from("users")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();
    if (profile) setUserName(`${profile.first_name} ${profile.last_name}`);

    setLoadingChallenges(true);

    const { data: enrolled, error: enrollErr } = await supabase
      .from("class_enrollments")
      .select("teacher_id")
      .eq("student_id", user.id);

    if (enrollErr) {
      console.error("Error fetching enrollments:", enrollErr);
      setChallenges([]);
      setLoadingChallenges(false);
      return;
    }

    const teacherIds = (enrolled || []).map((e) => e.teacher_id);

    if (teacherIds.length === 0) {
      setChallenges([]);
      setLoadingChallenges(false);
      return;
    }


    const { data: rows, error: challengeErr } = await supabase
      .from("student_challenges")
      .select("*")
      .in("teacher_id", teacherIds)
      .order("created_at", { ascending: false });

    if (challengeErr) {
      console.error("Error fetching challenges:", challengeErr);
    }

    const completedRes = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/cost-estimates/ai/student/${user.id}/completed`
    );
    const completedJson = await completedRes.json();
    if (completedJson.success) setCompletedCount(completedJson.completed);

    // Fetch average accuracy
    const accuracyRes = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/cost-estimates/ai/student/${user.id}/average-accuracy`
    );
    const accuracyJson = await accuracyRes.json();
    if (accuracyJson.success) setAvgAccuracy(accuracyJson.average_accuracy);


    setChallenges(rows || []);
    setLoadingChallenges(false);

    const { data: est } = await supabase
      .from("student_cost_estimates")
      .select("challenge_id, submitted_at")
      .eq("student_id", user.id);

    const map = {};
    (est || []).forEach((e) => {
      if (e.submitted_at) map[e.challenge_id] = true;
    });
    setSubmittedMap(map);
  })();
}, []);

  const truncate = (s, n = 160) =>
    s ? (s.length > n ? s.slice(0, n) + "…" : s) : "—";

  const activeChallenges = challenges.filter(
      (ch) => !submittedMap[ch.challenge_id]
    );

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
                <h3>{completedCount}</h3>
                <p>Completed</p>
              </div>
              <div className="student-metric-card">
                <h3 className="purple">{avgAccuracy}%</h3>
                <p>Avg Accuracy</p>
              </div>
            </div>
          </header>

          {/* Classes */}
          <div className="student-section">
            <Class />
          </div>

          {/* Active Cost Estimations (from Supabase) */}
          <div className="student-section">
            <h3 className="student-section-title">
              📂 Active Cost Estimations
            </h3>

            {loadingChallenges && <p>Loading challenges…</p>}

            {!loadingChallenges && challenges.length === 0 && (
              <p>No active challenges yet.</p>
            )}
            

            {!loadingChallenges &&
                [...activeChallenges]
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                  .map((c, idx) => (
                    <div key={idx} className="student-project-card">
                      <div className="student-project-header">
                        <h4 className="student-project-title">
                          {c.challenge_name || "Untitled Challenge"}
                        </h4>

                        <button
                          className="student-continue-btn"
                          onClick={() => navigate(`/student-challenges/${c.challenge_id}`)}
                        >
                          Start
                        </button>
                      </div>

                      <div className="student-project-tags">
                        <span className="tag">Challenge</span>
                      </div>

                      <p style={{ marginTop: 8 }}>
                        {truncate(c.challenge_instructions, 180)}
                      </p>
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
