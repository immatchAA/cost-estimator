import React, { useState, useEffect } from "react";
import "./CostEstimationChallengeDetails.css";
import Sidebar from "../Sidebar/Sidebar";

function CostEstimationChallenge() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });

  // Close modal with ESC or reset with R
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsModalOpen(false);
      if (e.key === "r" || e.key === "R") {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      }
    };

    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  // Dragging (panning)
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartDrag({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - startDrag.x, y: e.clientY - startDrag.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Scroll wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    if (e.deltaY < 0) {
      setZoom((z) => Math.min(z + zoomIntensity, 3));
    } else {
      setZoom((z) => Math.max(z - zoomIntensity, 0.5));
    }
  };

  return (
    <div className="cec-page">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="cec-wrapper">
        <h2 className="cec-title">Cost Estimation Challenge</h2>

        {/* Shared Subtitle */}
        <h3 className="cec-shared-subtitle">Wildcats Canteen</h3>

        <div className="cec-content">
          {/* Floor Plan Section */}
          <div className="cec-floorplan-section">
            <div
              className="cec-floorplan-box"
              onClick={() => {
                setIsModalOpen(true);
                setZoom(1);
                setPosition({ x: 0, y: 0 });
              }}
            >
              <p>Floor Plan Placeholder</p>
            </div>

            {/* Start Button */}
            <div className="cec-button-wrapper">
              <button className="cec-start-button">Start Estimating</button>
            </div>
          </div>

          {/* Challenge Info */}
          <div className="cec-info">
            <div className="cec-card">
              <h4>Challenge Details</h4>
              <p>
                This challenge requires students to analyze a provided
                residential floor plan and prepare a preliminary cost estimate
                for structural works. Students will apply their knowledge of
                material pricing, quantity estimation, and cost computation.
              </p>
            </div>

            <div className="cec-card">
              <h4>Challenge Instructions</h4>
              <p>Generate a structural cost estimate.</p>
            </div>

            <div className="cec-card">
              <h4>Challenge Objectives</h4>
              <p>Learn how to generate a structural cost estimate.</p>
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div
            className="cec-modal-overlay"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="cec-modal-viewer"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="cec-modal-floorplan"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  cursor: isDragging ? "grabbing" : "grab",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
              >
                <p>Enlarged Floor Plan</p>
              </div>

              {/* Controls */}
              <div className="cec-controls">
                <button
                  onClick={() => {
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                  }}
                >
                  🔄 Reset
                </button>
              </div>

              {/* Close Button */}
              <button
                className="cec-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✖
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CostEstimationChallenge;
