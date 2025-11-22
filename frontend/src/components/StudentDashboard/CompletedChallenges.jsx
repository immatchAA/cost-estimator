import React, { useEffect, useState } from "react";
import "./CompletedChallenges.css"; 
import Sidebar from "../Sidebar/Sidebar";
import { supabase } from "../../supabaseClient";

export default function CompletedChallenges() {
  const [completed, setCompleted] = useState([]);
  const [avgAccuracy, setAvgAccuracy] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [filter, setFilter] = useState("recent");

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // FETCH completed list
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/cost-estimates/ai/student/${user.id}/completed-list`
      );
      const json = await res.json();

      if (json.success) {
        setCompleted(json.completed);

        // Compute averages
        const acc = json.completed.reduce((s, c) => s + (c.accuracy || 0), 0);
        const scr = json.completed.reduce((s, c) => s + (c.score || 0), 0);

        setAvgAccuracy(json.completed.length ? Math.round(acc / json.completed.length) : 0);
        setAvgScore(json.completed.length ? Math.round(scr / json.completed.length) : 0);
      }
    })();
  }, []);

  const filtered = [...completed].sort((a, b) => {
    if (filter === "recent") return new Date(b.submitted_at) - new Date(a.submitted_at);
    if (filter === "accuracy") return b.accuracy - a.accuracy;
    if (filter === "score") return b.score - a.score;
    return 0;
  });

  return (
    <div className="completed-wrapper">
      <Sidebar />

      <div className="completed-main">
        <div className="completed-header">
          <h1>✔ Completed Challenges</h1>
          <p>Review your completed architectural challenges and AI accuracy scores</p>
        </div>

        {/* Summary Cards */}
        <div className="completed-summary">
          <div className="summary-card green">
            <h3>{completed.length}</h3>
            <p>Challenges Completed</p>
          </div>

          <div className="summary-card blue">
            <h3>{avgAccuracy}%</h3>
            <p>Average AI Accuracy</p>
          </div>
        </div>

        {/* Challenge List */}
        <div className="completed-list">
          {filtered.map((item, idx) => (
            <div key={idx} className="completed-card">
              <div className="completed-left">
                <h2>{item.challenge_name}</h2>
                <p className="desc">{item.instructions}</p>

                <div className="completed-meta">
                  <span className="badge">Cost Estimation</span>
                  <span className="date">
                    📅 {new Date(item.submitted_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="completed-right">
                <div className="accuracy-box">
                  <span className="acc-label">AI Accuracy</span>
                  <h3 className="acc-value">{item.accuracy}%</h3>
                </div>

              </div>
            </div>
          ))}

          {completed.length === 0 && (
            <p className="no-results">No completed challenges yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
