import React, { useEffect, useState } from "react";
import "./TeacherDashboard.css";
import Sidebar from "../Sidebar/Sidebar";
import ClassManagement from "../ClassManagement/ClassManagement";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

function TeacherDashboard() {
  const [challenges, setChallenges] = useState([]);
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalStudents, setTotalStudents] = useState(0);
  const [newStudentsThisWeek, setNewStudentsThisWeek] = useState(0);
  const [students, setStudents] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]); // NEW
  const navigate = useNavigate();

  const fetchTotalStudents = async (teacherId) => {
    const { data, error } = await supabase
      .from("class_enrollments")
      .select("student_id, created_at")
      .eq("teacher_id", teacherId);

    if (error) {
      console.error("Error fetching students:", error.message);
      return { total: 0, newThisWeek: 0 };
    }

    const uniqueStudents = new Set(data.map((row) => row.student_id));
    const total = uniqueStudents.size;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newThisWeek = data.filter(
      (enrollment) => new Date(enrollment.created_at) >= oneWeekAgo
    ).length;

    return { total, newThisWeek };
  };

  const fetchStudentsForTeacher = async (teacherId) => {
    const { data, error } = await supabase
      .from("class_enrollments")
      .select(
        `
      student_id,
      users:users!class_enrollments_student_id_fkey (
        id,
        first_name,
        last_name,
        email
      )
    `
      )
      .eq("teacher_id", teacherId)
      .eq("status", "accepted"); // ✅ only accepted students

    if (error) {
      console.error("Error fetching students:", error.message);
      return [];
    }

    return data.map((row) => {
      const user = row.users;
      const fullName = user
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
        : "";

      const initials = user
        ? `${user.first_name?.[0] || ""}${
            user.last_name?.[0] || ""
          }`.toUpperCase()
        : "";

      return {
        id: row.student_id,
        name: fullName,
        email: user?.email || "",
        initials,
      };
    });
  };

  // 🔹 Fetch pending requests for all teacher's classes
  const fetchPendingRequests = async (teacherId) => {
    try {
      const { data: classes } = await supabase
        .from("classes")
        .select("id, class_name")
        .eq("teacher_id", teacherId);

      let allRequests = [];
      for (const c of classes || []) {
        const res = await fetch(
          `http://localhost:8000/api/classes/${c.id}/requests`
        );
        const json = await res.json();
        if (json.success && json.requests.length > 0) {
          const mapped = json.requests.map((r) => ({
            ...r,
            class_name: c.class_name,
          }));
          allRequests = [...allRequests, ...mapped];
        }
      }
      setPendingRequests(allRequests);
    } catch (err) {
      console.error("Error fetching pending requests:", err);
    }
  };

  // 🔹 Approve request
  const approveRequest = async (requestId) => {
    const res = await fetch(
      `http://localhost:8000/api/classes/requests/${requestId}/approve`,
      { method: "POST" }
    );
    const data = await res.json();
    if (data.success) {
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      const studentList = await fetchStudentsForTeacher(userId);
      setStudents(studentList);
    }
  };

  // 🔹 Reject request
  const rejectRequest = async (requestId) => {
    const res = await fetch(
      `http://localhost:8000/api/classes/requests/${requestId}/reject`,
      { method: "POST" }
    );
    const data = await res.json();
    if (data.success) {
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Failed to fetch user:", error?.message);
        return;
      }

      setUserId(user.id);

      // fetch challenges
      const { data: challengesData, error: challengeError } = await supabase
        .from("student_challenges")
        .select("*")
        .eq("teacher_id", user.id);

      if (challengeError) {
        console.error("Error fetching challenges:", challengeError.message);
      } else {
        setChallenges(challengesData || []);
      }

      // fetch students
      const { total, newThisWeek } = await fetchTotalStudents(user.id);
      setTotalStudents(total);
      setNewStudentsThisWeek(newThisWeek);

      const studentList = await fetchStudentsForTeacher(user.id);
      setStudents(studentList);

      // fetch pending join requests
      await fetchPendingRequests(user.id);
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className="dashboard-main">
        <div className="dashboard-content">
          <header className="dashboard-header">
            <h1>Archiquest - Teacher Dashboard</h1>
            <p>Monitor student progress, AI accuracy, and class performance</p>
          </header>

          {/* 🟦 Summary Cards */}
          <div className="dashboard-grid">
            <div className="card">
              <div className="card-icon">👥</div>
              <p className="card-title">Total Students</p>
              <h2 className="card-value">{totalStudents}</h2>
              <span className="card-subtext">
                +{newStudentsThisWeek} from last week
              </span>
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
              <h2 className="card-value">{challenges.length}</h2>
              <span className="card-subtext">
                {
                  challenges.filter(
                    (c) =>
                      new Date(c.created_at) >=
                      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length
                }{" "}
                due this week
              </span>
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
              <h3>Cost Estimates Challenge</h3>
              {challenges.length === 0 ? (
                <p>No challenges created yet.</p>
              ) : (
                <table className="challenge-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Instructions</th>
                      <th>When Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challenges.map((challenge) => (
                      <tr
                        key={challenge.challenge_id}
                        className="clickable-row"
                        onClick={() =>
                          navigate("/createdesign", { state: { challenge } })
                        }
                      >
                        <td>{challenge.challenge_name}</td>
                        <td>{challenge.challenge_instructions}</td>
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
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="student-info">
                          <div className="avatar">{student.initials}</div>
                          <div>
                            <strong>{student.name}</strong>
                            <p>{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="streak">{student.streak}</td>
                      <td className={student.trend}>{student.avgAccuracy}</td>
                      <td>{student.aiAccuracy}</td>
                      <td>{student.project}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
