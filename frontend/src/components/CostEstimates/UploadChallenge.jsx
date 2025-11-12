import React, { useState, useRef } from "react";
import Sidebar from "../Sidebar/Sidebar";
import EstimatesTable from "../CostEstimates/EstimatesTable";
import "./UploadChallenge.css";
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
  const [dueDate, setDueDate] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
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
    if (dueDate) formData.append("due_date", dueDate);

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

      setEstimating(true);
      const estRes = await fetch(
        `http://localhost:8000/api/cost-estimates/challenges/${challengeId}/estimate`,
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
      setSuccessMessage("✅ Successfully published! AI Cost Estimation generated.");
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
      <div className="upload-main">
        <div className="upload-header">
          <h1>Create New Challenge</h1>
          <p>Upload architectural plans and details to create a new student challenge.</p>
        </div>

        {successMessage && <div className="toast-success">{successMessage}</div>}

        <div className="upload-grid">
          {/* LEFT SIDE */}
          <div className="left-column">
            <div className="form-card">
              <label>Challenge Name</label>
              <input
                type="text"
                placeholder="e.g. Residential Bungalow Design"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
              />
            </div>

            <div className="form-card">
              <label>Project Objectives</label>
              <textarea
                rows="4"
                placeholder="Based on the uploaded floor plan and elevation drawing..."
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
              />
            </div>

            <div className="form-card">
              <label>Instructions</label>
              <textarea
                rows="5"
                placeholder="Put instructions here"
                value={planInstructions}
                onChange={(e) => setPlanInstructions(e.target.value)}
              />
            </div>

            <div className="form-card">
              <label>Set Due Date</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="right-column">
            <div
              className="upload-box"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current.click()}
            >
              <div className="upload-icon">⬆️</div>
              <p className="upload-text">
                Drag & Drop Floor Plan <br />
                <span>or Click to Browse Files</span>
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
                Max size: 10MB
              </p>
            </div>

            <div className="how-it-works">
              <h3>How It Works</h3>
              <ol>
                <li><strong>Upload Floor Plan</strong> — Select and upload your architectural drawing.</li>
                <li><strong>AI Analysis</strong> — Our AI extracts structural elements automatically.</li>
                <li><strong>Generate Estimates</strong> — Receive detailed cost estimates.</li>
              </ol>
            </div>

            <button
              className="publish-btn"
              onClick={handleSubmit}
              disabled={isSubmitting || estimating}
            >
              {isSubmitting
                ? "Publishing..."
                : estimating
                ? "Generating AI Estimates..."
                : "📢 Publish to Class"}
            </button>
          </div>
        </div>

        <div className="estimates-section">
        <h3>Cost Estimates Preview</h3>
        <EstimatesTable data={estimation || {}} />
      </div>
      </div>
    </div>
  );
};

export default UploadChallenge;
