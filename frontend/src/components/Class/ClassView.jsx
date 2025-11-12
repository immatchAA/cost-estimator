import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ClassView.css";
import Sidebar from "../Sidebar/Sidebar";
import { supabase } from "../../supabaseClient";

function ClassView() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:8000/api"
          }/classes/${classId}/student-view`
        );
        const data = await response.json();

        if (data.success) {
          setClassData(data.class);
          setChallenges(data.challenges || []);
        } else {
          setError(data.message || "Failed to load class data");
        }
      } catch (err) {
        console.error("Error fetching class data:", err);
        setError("Error loading class information");
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchClassData();
    }
  }, [classId]);

  const formatDate = (dateString) => {
    if (!dateString) return "No date set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="class-view-wrapper">
        <Sidebar />
        <div className="class-view-content">
          <div className="loading-container">
            <p>Loading class information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="class-view-wrapper">
        <Sidebar />
        <div className="class-view-content">
          <div className="error-container">
            <p>{error || "Class not found"}</p>
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
    <div className="class-view-wrapper">
      <Sidebar />

      <div className="class-view-content">
        {/* Header */}
        <div className="class-view-header">
          <button
            onClick={() => navigate("/student-dashboard")}
            className="back-btn"
          >
            ← Back
          </button>
          <div>
            <h1>{classData.class_name}</h1>
            <p className="class-view-subtitle">Class Details & Challenges</p>
          </div>
        </div>

        {/* Class Information Card */}
        <div className="class-info-card">
          <h2>📚 Class Information</h2>
          <div className="class-info-grid">
            <div className="info-item">
              <span className="info-label">Class Name:</span>
              <span className="info-value">{classData.class_name}</span>
            </div>
            {classData.description && (
              <div className="info-item">
                <span className="info-label">Description:</span>
                <span className="info-value">{classData.description}</span>
              </div>
            )}
            <div className="info-item">
              <span className="info-label">Class Key:</span>
              <span className="info-value code">{classData.class_key}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Teacher:</span>
              <span className="info-value">{classData.teacher_name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Created:</span>
              <span className="info-value">
                {formatDate(classData.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Challenges Section */}
        <div className="challenges-section">
          <h2>🎯 Challenges</h2>
          {challenges.length === 0 ? (
            <div className="no-challenges">
              <p>No challenges have been created for this class yet.</p>
              <p className="sub-text">
                Check back later for assignments from your teacher.
              </p>
            </div>
          ) : (
            <div className="challenges-grid">
              {challenges.map((challenge) => (
                <div key={challenge.challenge_id} className="challenge-card">
                  <div className="challenge-header">
                    <h3>{challenge.challenge_name}</h3>
                    {challenge.due_date && (
                      <span
                        className={`due-date ${
                          new Date(challenge.due_date) < new Date()
                            ? "overdue"
                            : ""
                        }`}
                      >
                        Due: {formatDate(challenge.due_date)}
                      </span>
                    )}
                  </div>

                  {challenge.challenge_objectives && (
                    <div className="challenge-section">
                      <h4>📋 Objectives</h4>
                      <p>{challenge.challenge_objectives}</p>
                    </div>
                  )}

                  {challenge.challenge_instructions && (
                    <div className="challenge-section">
                      <h4>📝 Instructions</h4>
                      <p>{challenge.challenge_instructions}</p>
                    </div>
                  )}

                  {challenge.file_url && (
                    <div className="challenge-section">
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

                  <div className="challenge-footer">
                    <span className="challenge-date">
                      Created: {formatDate(challenge.created_at)}
                    </span>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClassView;
