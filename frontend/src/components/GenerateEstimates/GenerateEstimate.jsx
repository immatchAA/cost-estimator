import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./GenerateEstimate.css";


function EstimateButton({ status = "idle", onClick }) {
  const label =
    status === "running" ? "Generating Estimates…"
    : status === "succeeded" ? "Regenerate"
    : "Generate Estimates";

  return (
    <button className="estimate-btn" onClick={onClick} disabled={status === "running"}>
      {label}
    </button>
  );
}


function EstimatesTable() {
  return (
    <div className="cost-estimate">
      <h4>Structural Cost Estimates</h4>
      <table className="cost-estimate-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>I.</td><td>Earthwork</td></tr>
          <tr><td>II.</td><td>Formwork &amp; Scaffolding</td></tr>
          <tr><td>III.</td><td>Masonry Work</td></tr>
          <tr><td>IV.</td><td>Concrete Work</td></tr>
          <tr><td>V.</td><td>Steelwork</td></tr>
          <tr><td>VI.</td><td>Carpentry Work</td></tr>
          <tr><td>VII.</td><td>Roofing Work</td></tr>

          <tr className="subtotal-row">
            <td colSpan={2}><strong>Subtotal</strong></td>
          </tr>

          <tr className="total-row">
            <td colSpan={2}><strong>Total (incl. 10% contingency)</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}


export default function GenerateEstimate() {
  const { challengeId } = useParams();
  const [status, setStatus] = useState("idle"); // "idle" | "running" | "succeeded" | "failed"

  // purely visual toggle (no backend)
  const handleGenerateClick = () => {
    if (status === "idle" || status === "failed") {
      setStatus("running");
      setTimeout(() => setStatus("succeeded"), 300); // instant UI feedback
    } else if (status === "succeeded") {
      setStatus("running");
      setTimeout(() => setStatus("succeeded"), 300);
    }
  };

  return (
    <div className="generate-container">
      <header className="generate-header">
        <h2>AI Automated Structural Cost Estimation</h2>
        <div className="challenge-id">Challenge ID: <code>{challengeId}</code></div>
      </header>

      <div className="generate-grid">
        {/* Left column: Confidence + Summary */}
        <aside className="left-column">
          <div className="analysis-confidence">
            <h6>Analysis Confidence</h6>
            <p><strong>Overall Accuracy:</strong></p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "92%" }}></div>
            </div>
            <p className="confidence-text">High confidence in structural cost estimation</p>
          </div>

          <div className="results-container">
            <div className="summary-cards">
              <div className="card project-summary">
                <h5>Project Summary</h5>
                <table className="summary-table">
                  <tbody>
                    <tr><td>I. EARTHWORK</td><td>₱6000</td></tr>
                    <tr><td>II. FORMWORK &amp; SCAFFOLDING</td><td>-</td></tr>
                    <tr><td>III. MASONRY WORK</td><td>-</td></tr>
                    <tr><td>IV. CONCRETE WORK</td><td>-</td></tr>
                    <tr><td>V. STEELWORK</td><td>-</td></tr>
                    <tr><td>VI. CARPENTRY WORK</td><td>-</td></tr>
                    <tr><td>VII. ROOFING WORK</td><td>-</td></tr>
                    <tr><td><strong>TOTAL MATERIAL COST (TC)</strong></td><td>-</td></tr>
                    <tr><td><strong>LABOR COST LC (40% of TC)</strong></td><td>-</td></tr>
                    <tr><td><strong>Contingencies C (5% of (TC+LC))</strong></td><td>-</td></tr>
                    <tr><td><strong>GRAND TOTAL COST</strong></td><td>-</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </aside>

        {/* Right column: Button + Estimates Table */}
        <main className="right-column">
          <div className="top-bar">
            <h3>Generate Estimate</h3>
            <EstimateButton status={status} onClick={handleGenerateClick} />
          </div>

          <EstimatesTable />

          {status === "running" && (
            <p className="status-text running">Preparing table preview…</p>
          )}
          {status === "failed" && (
            <p className="status-text failed">Estimation failed (UI preview).</p>
          )}
        </main>
      </div>
    </div>
  );
}
