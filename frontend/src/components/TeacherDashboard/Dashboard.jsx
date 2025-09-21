import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import Sidebar from "../Sidebar/Sidebar";
import ClassManagement from "../ClassManagement/ClassManagement";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [challenges, setChallenges] = useState([]);
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // 🔍 search state
  const navigate = useNavigate();

  // Mock student data
  const students = [
    {
      initials: "AJ",
      name: "Alex Johnson",
      email: "alex.johnson@email.com",
      streak: "9 5d streak",
      avgAccuracy: "87% ↑",
      aiAccuracy: "92%",
      project: "Bridge Structural",
      progress: 90,
      rank: "#3",
      trend: "green",
    },
    {
      initials: "SC",
      name: "Sarah Chen",
      email: "sarah.chen@email.com",
      streak: "12 8d streak",
      avgAccuracy: "91% ↑",
      aiAccuracy: "89%",
      project: "Commercial Steel",
      progress: 75,
      rank: "#1",
      trend: "green",
    },
    {
      initials: "MR",
      name: "Michael Rodriguez",
      email: "michael.r@email.com",
      streak: "7 2d streak",
      avgAccuracy: "79% ↓",
      aiAccuracy: "94%",
      project: "Residential Foundation",
      progress: 45,
      rank: "#8",
      trend: "red",
    },
  ];

  // Filter students by search query
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        .eq("teacher_id", user.id);

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
            <h1>Construction Cost Estimation - Teacher Dashboard</h1>
            <p>
              Monitor student progress, AI accuracy, and class performance
              metrics
            </p>
          </header>

          {/* 🟦 Summary Cards */}
          <div className="dashboard-grid">
            <div className="card">
              <div className="card-icon">👥</div>
              <p className="card-title">Total Students</p>
              <h2 className="card-value">28</h2>
              <span className="card-subtext">+2 from last week</span>
            </div>

            <div className="card">
              <div className="card-icon">🎯</div>
              <p className="card-title">Class Avg Accuracy</p>
              <h2 className="card-value green">84%</h2>
              <span className="card-subtext">+3% from last month</span>
            </div>

            <div className="card">
              <div className="card-icon">⏱️</div>
              <p className="card-title">AI Accuracy Rate</p>
              <h2 className="card-value orange">91%</h2>
              <span className="card-subtext">Across all projects</span>
            </div>

            <div className="card">
              <div className="card-icon">📂</div>
              <p className="card-title">Active Projects</p>
              <h2 className="card-value">42</h2>
              <span className="card-subtext">15 due this week</span>
            </div>
          </div>

          {/* Class Management Section */}
          <div className="dashboard-row">
            <div className="long-card">
              <ClassManagement />
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

          {/* 📊 Student Performance Overview */}
          <div className="dashboard-row">
            <div className="long-card">
              <div className="student-header">
                <h3>Student Performance Overview</h3>
                <div className="student-controls">
                  <input
                    type="text"
                    placeholder="🔍 Search students..."
                    className="student-search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="student-filter">⚙️ Filter</button>
                </div>
              </div>

              <table className="student-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Completed</th>
                    <th>Avg Accuracy</th>
                    <th>AI Accuracy</th>
                    <th>Current Project</th>
                    <th>Progress</th>
                    <th>Rank</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="student-info">
                          <div className="avatar">{student.initials}</div>
                          <div>
                            <strong>{student.name}</strong>
                            <p>{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="streak">{student.streak}</span>
                      </td>
                      <td className={student.trend}>{student.avgAccuracy}</td>
                      <td>{student.aiAccuracy}</td>
                      <td>{student.project}</td>
                      <td>
                        <div className="progress">
                          <div style={{ width: `${student.progress}%` }}></div>
                        </div>
                      </td>
                      <td>
                        <span className="rank">{student.rank}</span>
                      </td>
                      <td>
                        <button className="view-btn">👁️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
