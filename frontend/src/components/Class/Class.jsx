import React, { useState, useEffect } from "react";
import "./Class.css";
import { supabase } from "../../supabaseClient";

function Class() {
  const [classes, setClasses] = useState([]);
  const [classKey, setClassKey] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserAndClasses = async () => {
      // Get current user
      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.getUser();

      if (sessionError || !user) {
        console.error("Failed to get user:", sessionError?.message);
        return;
      }

      setUserId(user.id);

      // Fetch student's classes
      await fetchStudentClasses(user.id);
    };

    fetchUserAndClasses();
  }, []);

  const fetchStudentClasses = async (studentId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/classes/student/${studentId}`
      );
      const data = await response.json();

      if (data.success) {
        setClasses(data.classes);
      } else {
        setMessage(data.message || "Failed to fetch classes");
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      setMessage("Error fetching classes");
    }
  };

  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!classKey.trim()) {
      setMessage("Please enter a class key");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`http://localhost:8000/api/classes/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
        class_key: classKey,
        user_id: userId,
      }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Successfully joined the class!");
        setClassKey("");
        setShowJoinForm(false);
        // Refresh the classes list
        await fetchStudentClasses(userId);
      } else {
        setMessage(data.message || "Failed to join class");
      }
    } catch (error) {
      console.error("Error joining class:", error);
      setMessage("Error joining class");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="class-container">
      <div className="class-header">
        <h2>My Classes</h2>
        <button
          className="join-class-btn"
          onClick={() => setShowJoinForm(!showJoinForm)}
        >
          {showJoinForm ? "Cancel" : "Join Class"}
        </button>
      </div>

      {showJoinForm && (
        <div className="join-class-form">
          <form onSubmit={handleJoinClass}>
            <div className="form-group">
              <label htmlFor="classKey">Class Key:</label>
              <input
                className="text-black"
                type="text"
                id="classKey"
                value={classKey}
                onChange={(e) => setClassKey(e.target.value)}
                placeholder="Enter class key (e.g., ABC12345)"
                maxLength={8}
                style={{ textTransform: "uppercase" }}
              />
            </div>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Joining..." : "Join Class"}
            </button>
          </form>
        </div>
      )}

      {message && (
        <div
          className={`message ${
            message.includes("Successfully") ? "success" : "error"
          }`}
        >
          {message}
        </div>
      )}

      <div className="classes-list">
        {classes.length === 0 ? (
          <div className="no-classes">
            <p>You haven't joined any classes yet.</p>
            <p>
              Use the "Join Class" button above to join a class with a class
              key.
            </p>
          </div>
        ) : (
          classes.map((classItem) => (
            <div key={classItem.id} className="class-card">
              <div className="class-info">
                <h3>{classItem.class_name}</h3>
                {classItem.description && (
                  <p className="class-description">{classItem.description}</p>
                )}
                <div className="class-details">
                  <span className="teacher">
                    Teacher: {classItem.teacher_name}
                  </span>
                  <span className="joined-date">
                    Joined: {formatDate(classItem.joined_at)}
                  </span>
                </div>
              </div>
              <div className="class-actions">
                <button className="view-class-btn">View Class</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Class;
