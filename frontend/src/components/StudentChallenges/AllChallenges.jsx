import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AllChallenges.css";
import Sidebar from "../Sidebar/Sidebar";
import { supabase } from "../../supabaseClient";

function AllChallenges() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittedMap, setSubmittedMap] = useState({});

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const {
          data: { user },
          error: sessionError,
        } = await supabase.auth.getUser();

        if (sessionError || !user) {
          setError("Failed to get user");
          setLoading(false);
          return;
        }

        // Fetch all challenges with class information
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:8000/api"
          }/classes/student/${user.id}/all-challenges`
        );
        const data = await response.json();

        if (data.success) {
          setChallenges(data.challenges || []);
        } else {
          setError(data.message || "Failed to load challenges");
        }

        // Get submitted challenges
        const { data: est } = await supabase
          .from("student_cost_estimates")
          .select("challenge_id, submitted_at")
          .eq("student_id", user.id);

        const map = {};
        (est || []).forEach((e) => {
          if (e.submitted_at) map[e.challenge_id] = true;
        });
        setSubmittedMap(map);
      } catch (err) {
        console.error("Error fetching challenges:", err);
        setError("Error loading challenges");
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "No date set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="all-challenges-wrapper">
        <Sidebar />
        <div className="all-challenges-content">
          <div className="loading-container">
            <p>Loading challenges...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="all-challenges-wrapper">
        <Sidebar />
        <div className="all-challenges-content">
          <div className="error-container">
            <p>{error}</p>
            <button
              onClick={() => navigate("/student-dashboard")}
              className="back-btn"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="all-challenges-wrapper">
      <Sidebar />

      <div className="all-challenges-content">
        {/* Header */}
        <div className="all-challenges-header">
          <h1>🎯 All Challenges</h1>
          <p className="all-challenges-subtitle">
            View all challenges from your enrolled classes
          </p>
        </div>

        {/* Challenges List */}
        {challenges.length === 0 ? (
          <div className="no-challenges">
            <p>No challenges available yet.</p>
            <p className="sub-text">
              Challenges will appear here when your teachers create them.
            </p>
          </div>
        ) : (
          <div className="challenges-list">
            {challenges.map((challenge) => (
              <div key={challenge.challenge_id} className="challenge-item">
                <div className="challenge-header-section">
                  <div className="challenge-title-section">
                    <h3>{challenge.challenge_name}</h3>
                    <div className="challenge-meta">
                      <span className="class-badge">
                        {challenge.class_name}
                      </span>
                      <span className="teacher-badge">
                        By: {challenge.teacher_name}
                      </span>
                    </div>
                  </div>
                  <div className="challenge-actions">
                    {submittedMap[challenge.challenge_id] ? (
                      <button className="submitted-btn" disabled>
                        ✓ Submitted
                      </button>
                    ) : (
                      <button
                        className="start-challenge-btn"
                        onClick={() =>
                          navigate(
                            `/student-challenges/${challenge.challenge_id}`
                          )
                        }
                      >
                        Start Challenge
                      </button>
                    )}
                  </div>
                </div>

                {challenge.challenge_objectives && (
                  <div className="challenge-info">
                    <h4>📋 Objectives</h4>
                    <p>{challenge.challenge_objectives}</p>
                  </div>
                )}

                {challenge.challenge_instructions && (
                  <div className="challenge-info">
                    <h4>📝 Instructions</h4>
                    <p>{challenge.challenge_instructions}</p>
                  </div>
                )}

                {challenge.file_url && (
                  <div className="challenge-info">
                    <h4>📎 Plan File</h4>
                    <a
                      href={challenge.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="file-link"
                    >
                      View Plan File →
                    </a>
                  </div>
                )}

                <div className="challenge-footer-section">
                  <div className="challenge-dates">
                    <span className="created-date">
                      Created: {formatDate(challenge.created_at)}
                    </span>
                    {challenge.due_date && (
                      <span
                        className={`due-date ${
                          isOverdue(challenge.due_date) ? "overdue" : ""
                        }`}
                      >
                        Due: {formatDate(challenge.due_date)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllChallenges;
