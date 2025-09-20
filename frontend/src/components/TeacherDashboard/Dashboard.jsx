import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import Sidebar from "../Sidebar/Sidebar";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [challenges, setChallenges] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallenges = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Failed to fetch user:", error?.message);
        return;
      }

      setUserId(user.id);

      const { data, error: challengeError } = await supabase
        .from("design_plan")
        .select("*")
        .eq("teacher_id", user.id); // Make sure you store teacher_id in design_plan

      if (challengeError) {
        console.error("Error fetching challenges:", challengeError.message);
      } else {
        setChallenges(data);
      }
    };

    fetchChallenges();
  }, []);

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className="dashboard-main">
        <div className="dashboard-content">
          <header className="dashboard-header">
            <h1>INSTRUCTOR DASHBOARD</h1>
            <p>Here's your analytics details</p>
          </header>

          {/* 🟦 Summary Cards */}
          <div className="dashboard-grid">
            <div className="card">
              <h2>0</h2>
              <p>Total Classes</p>
            </div>
            <div className="card">
              <h2>{challenges.length}</h2>
              <p>Total Design Plans Created</p>
            </div>
            <div className="card">
              <h2>85%</h2>
              <p>Average Class Participation</p>
            </div>
            <div className="card">
              <h2>{challenges[0]?.plan_name || "None"}</h2>
              <p>Most Recent Challenge</p>
            </div>
          </div>

          {/* 📋 Challenges Table */}
          <div className="dashboard-row">
            <div className="long-card">
              <h3>Design Plans Created</h3>
              {challenges.length === 0 ? (
                <p>No Design Plans created yet.</p>
              ) : (
                <table className="challenge-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Budget</th>
                      <th>Currency</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challenges.map((challenge) => (
                      <tr
                        key={challenge.id}
                        className="clickable-row"
                        onClick={() =>
                          navigate("/createdesign", { state: { challenge } })
                        }
                      >
                        <td>{challenge.plan_name}</td>
                        <td>{challenge.description}</td>
                        <td>₱{challenge.budget}</td>
                        <td>{challenge.currency}</td>
                        <td>
                          {new Date(challenge.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel stays as-is for now */}
        <div className="dashboard-right-panel">
          <div className="right-card">
            <h3>Top-Performing Students</h3>
            <ul>
              <li>
                <span>Ben Tennyson</span>
                <strong>99</strong>
              </li>
              {/* ... keep the rest for now or replace later */}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
