import React, { useState, useEffect } from "react";
import "./ClassManagement.css";
import { supabase } from "../../supabaseClient";

function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    class_name: "",
    description: "",
  });

  const [requests, setRequests] = useState([]);
  const [activeClassId, setActiveClassId] = useState(null);

  useEffect(() => {
    const fetchUserAndClasses = async () => {
      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.getUser();

      if (sessionError || !user) {
        console.error("Failed to get user:", sessionError?.message);
        return;
      }

      setUserId(user.id);
      await fetchTeacherClasses(user.id);
    };

    fetchUserAndClasses();
  }, []);

  const fetchTeacherClasses = async (teacherId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/classes/teacher/${teacherId}`
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

  const fetchRequests = async (classId) => {
    setActiveClassId(classId);
    const res = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/classes/${classId}/requests`
    );
    const data = await res.json();
    if (data.success) {
      setRequests(data.requests);
    }
  };

  const approveRequest = async (requestId) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/classes/requests/${requestId}/approve`,
      {
        method: "POST",
      }
    );
    const data = await res.json();
    if (data.success) {
      setMessage("Request approved!");
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      await fetchTeacherClasses(userId);
    }
  };

  const rejectRequest = async (requestId) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/classes/requests/${requestId}/reject`,
      {
        method: "POST",
      }
    );
    const data = await res.json();
    if (data.success) {
      setMessage("Request rejected.");
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!formData.class_name.trim()) {
      setMessage("Please enter a class name");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/classes/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_name: formData.class_name.trim(),
          description: formData.description.trim(),
          user_id: userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          `Class created successfully! Class Key: ${data.class.class_key}`
        );
        setFormData({ class_name: "", description: "" });
        setShowCreateForm(false);
        await fetchTeacherClasses(userId);
      } else {
        setMessage(data.message || "Failed to create class");
      }
    } catch (error) {
      console.error("Error creating class:", error);
      setMessage("Error creating class");
    } finally {
      setLoading(false);
    }
  };

  const copyClassKey = (classKey) => {
    navigator.clipboard.writeText(classKey);
    setMessage(`Class key ${classKey} copied to clipboard!`);
    setTimeout(() => setMessage(""), 3000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="class-management-container">
      <div className="class-management-header">
        <h2>Class Management</h2>
        <button
          className="create-class-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? "Cancel" : "Create New Class"}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-class-form">
          <form onSubmit={handleCreateClass}>
            <div className="form-group">
              <label htmlFor="class_name">Class Name:</label>
              <input
                className="text-black"
                type="text"
                id="class_name"
                name="class_name"
                value={formData.class_name}
                onChange={handleInputChange}
                placeholder="Enter class name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description (Optional):</label>
              <textarea
                className="text-black"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter class description"
                rows={3}
              />
            </div>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Creating..." : "Create Class"}
            </button>
          </form>
        </div>
      )}

      {message && (
        <div
          className={`message ${
            message.toLowerCase().includes("successfully") ||
            message.toLowerCase().includes("copied") ||
            message.toLowerCase().includes("approved")
              ? "success"
              : "error"
          }`}
        >
          {message}
        </div>
      )}

      <div className="classes-list">
        {classes.length === 0 ? (
          <div className="no-classes">
            <p>You haven't created any classes yet.</p>
            <p>
              Use the "Create New Class" button above to create your first
              class.
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
                  <span className="class-key">
                    Class Key: <strong>{classItem.class_key}</strong>
                    <button
                      className="copy-btn"
                      onClick={() => copyClassKey(classItem.class_key)}
                      title="Copy class key"
                    >
                      📋
                    </button>
                  </span>
                  <span className="student-count">
                    Students: {classItem.student_count}
                  </span>
                  <span className="created-date">
                    Created: {formatDate(classItem.created_at)}
                  </span>
                </div>
              </div>
              <div className="class-actions">
                <button className="view-class-btn">View Students</button>
                <button
                  className="manage-class-btn"
                  onClick={() => fetchRequests(classItem.id)}
                >
                  Manage Requests
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {activeClassId && (
        <div className="requests-list">
          <h3>Pending Requests</h3>
          {requests.length === 0 ? (
            <p>No pending requests.</p>
          ) : (
            requests.map((r) => (
              <div key={r.id} className="request-card">
                {/* ✅ Use student_name instead of r.users.first_name / last_name */}
                <p>{r.student_name || "Unknown student"}</p>
                <button
                  onClick={() => approveRequest(r.id)}
                  className="submit-btn"
                >
                  Accept
                </button>
                <button
                  onClick={() => rejectRequest(r.id)}
                  className="manage-class-btn"
                >
                  Reject
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default ClassManagement;
