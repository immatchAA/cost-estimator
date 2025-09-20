import React, { useState, useRef} from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import '../CostEstimates/UploadFile.css';

const UploadFile = () => {
  const [fileName, setFileName] = useState(null);
  const fileInputRef = useRef();
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planInstructions, setPlanInstructions] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
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

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async () => {
    if (!planName || !planDescription || !planInstructions || !file) {
      alert("Please fill in all the fields and upload a file");
      return;
    }

    const formData = new FormData();
    formData.append("challenge_name", planName);
    formData.append("challenge_objectives", planDescription); 
    formData.append("challenge_instructions", planInstructions);
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/challenges", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if(!res.ok){
        alert("❌ Error: " + (data.detail || "Something went wrong"));
        setIsSubmitting(false);
        return;
      }

      const challengeId = data?.challenge_id;

      if(!challengeId){
        alert("Challenge published, but no challenge ID was returned. Please check the API response.");
        setIsSubmitting(false);
        return;
      }

      alert("✅ Challenge published. Redirecting you to the AI Automated Structural Cost Estimation");
        navigate(`/challenges/${challengeId}/estimate`, { replace: true });
    } catch (err) {
      console.error(err);
      alert("Failed to connect to server");
      setIsSubmitting(false);
    }   
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="page-main">
        <div className="page-content">
          <header className="page-header">
            <h1>ARchiquest</h1>
            <p>Automated Floor Plan Analysis and Cost Estimates by AI</p>
          </header>

          <div className="upload-container">
            <h3 className="upload-title">Instructor Portal</h3>
            <p className="upload-description">
              Upload architectural plans and details to create a new student
              challenge.
            </p>

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
              ></textarea>
            </div>

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
              ></textarea>
            </div>

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
                  accept=".pdf, .jpg, .jpeg, .png, .dwg"
                />

                {fileName && <p className="file-name">Selected: {fileName}</p>}
                <button
                  className="select-btn"
                  onClick={() => fileInputRef.current.click()}
                >
                  Select Floor Plan
                </button>
                <p className="supported-formats">
                  Supported formats: PDF, JPG, PNG <br />
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
                    <span>Our AI extracts structural elements automatically</span>
                  </li>
                  <li>
                    <strong>Generate Cost Estimates</strong>
                    <br />
                    <span>Receive detailed cost estimates</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          <div className="publish-container">
            <button className="publish-btn" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Publishing..." : "📢 Publish to Class"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadFile;
