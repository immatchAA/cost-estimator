// UploadChallenge.jsx
import React, { useState, useRef } from "react";
import Sidebar from "../Sidebar/Sidebar";
import EstimatesTable from "../CostEstimates/EstimatesTable";
import "../CostEstimates/UploadChallenge.css";
import { supabase } from "../../supabaseClient";
const UploadChallenge = () => {
  const [fileName, setFileName] = useState(null);
  const fileInputRef = useRef();
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planInstructions, setPlanInstructions] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [estimating, setEstimating] = useState(false);
  const [estimation, setEstimation] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);

      // reset input so reselecting the same file works
      e.target.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleSubmit = async () => {
    if (!planName || !planDescription || !planInstructions || !file) {
      alert("Please fill in all the fields and upload a file");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Please sign in first");
      return;
    }

    setIsSubmitting(true);
    setEstimation(null);

    const formData = new FormData();
    formData.append("challenge_name", planName);
    formData.append("challenge_objectives", planDescription);
    formData.append("challenge_instructions", planInstructions);
    formData.append("teacher_id", user.id);
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/challenges", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        alert("❌ Error: " + (data.detail || "Something went wrong"));
        setIsSubmitting(false);
        return;
      }

      const challengeId = data?.challenge_id;
      const planFileUrl =
        data?.plan_file_url || data?.file_url || data?.public_url;

      if (!challengeId || !planFileUrl) {
        alert("Challenge created but missing challenge_id or plan_file_url.");
        setIsSubmitting(false);
        return;
      }

      // 2) Run AI estimate
      setEstimating(true);
      const estRes = await fetch(
        `http://localhost:8000/api/challenges/${challengeId}/estimate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan_file_url: planFileUrl }),
        }
      );
      const estData = await estRes.json();

      if (!estRes.ok) {
        alert("❌ Estimation failed: " + (estData.detail || "Unknown error"));
        setIsSubmitting(false);
        setEstimating(false);
        return;
      }

      const payload = estData?.data || null;
      if (payload) payload.challenge_id = challengeId;

      setEstimation(payload);
      setEstimating(false);
      setIsSubmitting(false);

      setSuccessMessage(
        "✅ Successfully published! AI Cost Estimation generated."
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to connect to server");
      setIsSubmitting(false);
      setEstimating(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="page-main">
        <div className="page-content">
          <header className="page-header">
            <h1>ArchiQuest</h1>
            <p>Automated Floor Plan Analysis and Cost Estimates by AI</p>
          </header>

          {successMessage && (
            <div className="toast-success">{successMessage}</div>
          )}

          <div className="upload-container">
            <h3 className="upload-title">Instructor Portal</h3>
            <p className="upload-description">
              Upload architectural plans and details to create a new student
              challenge.
            </p>

            {/* Challenge Name */}
            <div className="challenge-details">
              <label htmlFor="planName">Challenge Name</label>
              <input
                type="text"
                id="planName"
                name="planName"
                className="challenge-input"
                placeholder="Residential Bungalow..."
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
              />
            </div>

            {/* Project Objectives */}
            <div className="challenge-details">
              <label htmlFor="planDescription">Project Objectives</label>
              <textarea
                id="planDescription"
                name="planDescription"
                className="challenge-textarea"
                placeholder="Based on the uploaded floor plan and elevation drawing..."
                rows="4"
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
              />
            </div>

            {/* Instructions */}
            <div className="challenge-details">
              <label htmlFor="planInstructions">Instructions</label>
              <textarea
                id="planInstructions"
                name="planInstructions"
                className="challenge-textarea"
                placeholder="Put instructions here"
                rows="6"
                value={planInstructions}
                onChange={(e) => setPlanInstructions(e.target.value)}
              />
            </div>

            {/* Upload Box */}
            <div className="upload-flex-wrapper">
              <div
                className="drag-drop-box"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current.click()}
              >
                <div className="upload-icon">⬆️</div>
                <p className="drag-text">
                  Drag & Drop Floor Plan <br />
                  <span className="or-text">or Click to browse files</span>
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
                />

                {fileName && <p className="file-name">Selected: {fileName}</p>}
                <button
                  type="button"
                  className="select-btn"
                  onClick={() => fileInputRef.current.click()}
                >
                  Select Floor Plan
                </button>
                <p className="supported-formats">
                  Supported formats: PDF, JPG, PNG, DWG, DXF <br />
                  Maximum file size: 10MB
                </p>
              </div>

              <div className="right-container">
                <h3>How it Works</h3>
                <ol className="how-it-works-list">
                  <li>
                    <strong>Upload Floor Plan</strong>
                    <br />
                    <span>Select and upload your architectural drawing</span>
                  </li>
                  <li>
                    <strong>AI Analysis</strong>
                    <br />
                    <span>
                      Our AI extracts structural elements automatically
                    </span>
                  </li>
                  <li>
                    <strong>Generate Cost Estimates</strong>
                    <br />
                    <span>Receive detailed cost estimates</span>
                  </li>
                </ol>
              </div>
            </div>

            {/* Publish Button with Spinner */}
            <div className="publish-container">
              <button
                className="publish-btn"
                onClick={handleSubmit}
                disabled={isSubmitting || estimating}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner" /> Publishing...
                  </>
                ) : estimating ? (
                  <>
                    <span className="spinner" /> Generating AI Estimates...
                  </>
                ) : (
                  "📢 Publish to Class"
                )}
              </button>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <EstimatesTable data={estimation} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadChallenge;
