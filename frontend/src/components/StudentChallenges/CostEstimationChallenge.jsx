import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import "./CostEstimationChallenge.css";

function CostEstimationChallenge() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });

  // Editable rows
  const [rows, setRows] = useState([
    { id: "I.", description: "Earthwork", quantity: "", unit: "", price: "", amount: 0 },
    { id: "II.", description: "Formwork & Scaffolding", quantity: "", unit: "", price: "", amount: 0 },
    { id: "III.", description: "Masonry Work", quantity: "", unit: "", price: "", amount: 0 },
    { id: "IV.", description: "Concrete Work", quantity: "", unit: "", price: "", amount: 0 },
    { id: "V.", description: "Steelwork", quantity: "", unit: "", price: "", amount: 0 },
    { id: "VI.", description: "Carpentry Work", quantity: "", unit: "", price: "", amount: 0 },
    { id: "VII.", description: "Roofing Work", quantity: "", unit: "", price: "", amount: 0 },
  ]);

  // Update row values
  const handleChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    if (field === "quantity" || field === "price") {
      const qty = parseFloat(updatedRows[index].quantity) || 0;
      const price = parseFloat(updatedRows[index].price) || 0;
      updatedRows[index].amount = qty * price;
    }

    setRows(updatedRows);
  };

  // Calculate totals
  const subtotal = rows.reduce((sum, row) => sum + row.amount, 0);
  const contingency = subtotal * 0.1;
  const grandTotal = subtotal + contingency;

  // Reset or close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsModalOpen(false);
      if (e.key.toLowerCase() === "r") {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      }
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // Dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartDrag({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - startDrag.x, y: e.clientY - startDrag.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Zoom with scroll
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
    <div className="cec2-page">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Wrapper */}
      <div className="cec2-wrapper">
        <h2 className="cec2-title">Cost Estimate Challenge</h2>
        <p className="cec2-subtitle">
          Enter quantities and unit prices. AI will provide real-time suggestions and validation.
        </p>

        <h3 className="cec2-section-title">AI Generated Structural Cost Estimates</h3>

        <div className="cec2-content">
          {/* Left Panel */}
          <div className="cec2-left">
            <div className="cec2-card">
              <h4>Project Summary</h4>
              <ul>
                {rows.map((row, i) => (
                  <li key={i}>
                    {row.id} {row.description} — P{row.amount.toFixed(2)}
                  </li>
                ))}
              </ul>
              <p><strong>Total Material Cost (TC):</strong> P{subtotal.toFixed(2)}</p>
              <p><strong>Labor Cost (LC):</strong> —</p>
              <p><strong>Contingencies:</strong> P{contingency.toFixed(2)}</p>
              <p><strong>Grand Total Cost:</strong> P{grandTotal.toFixed(2)}</p>
            </div>

            <div className="cec2-card">
                <h4>Analysis Confidence</h4>
                <p className="cec2-subtitle">Overall Accuracy</p>

                {/* Progress bar */}
                <div className="cec2-progress-bar">
                    <div className="cec2-progress-fill"></div>
                </div>

                <p className="cec2-confidence">High confidence in structural cost estimation</p>
            </div>

            <div className="cec2-card">
              <h4>💡 AI Suggestions</h4>
              <p>Consider double-checking measurements against structural plan for accuracy.</p>
            </div>
          </div>

          {/* Middle Table */}
          <div className="cec2-middle">
            <table className="cec2-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Unit Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td>{row.id}</td>
                    <td>{row.description}</td>
                    <td>
                      <input
                        type="number"
                        value={row.quantity}
                        onChange={(e) => handleChange(index, "quantity", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.unit}
                        onChange={(e) => handleChange(index, "unit", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.price}
                        onChange={(e) => handleChange(index, "price", e.target.value)}
                      />
                    </td>
                    <td>P{row.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td colSpan="6" className="cec2-subtotal">Subtotal: P{subtotal.toFixed(2)}</td></tr>
                <tr><td colSpan="6" className="cec2-total">Total (incl. 10% Contingency): P{grandTotal.toFixed(2)}</td></tr>
              </tfoot>
            </table>
            <div className="cec2-actions">
              <button className="cec2-btn draft">Save as Draft</button>
              <button className="cec2-btn submit">Submit</button>
            </div>
          </div>

          {/* Right Floor Plan */}
          <div className="cec2-right">
            <div
              className="cec2-floorplan"
              onClick={() => {
                setIsModalOpen(true);
                setZoom(1);
                setPosition({ x: 0, y: 0 });
              }}
            >
              <p>Floor Plan Placeholder</p>
            </div>
            <p>FLOOR PLAN NAME HERE</p>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="cec2-modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div
              className="cec2-modal-viewer"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="cec2-modal-floorplan"
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

              <button className="cec2-close-btn" onClick={() => setIsModalOpen(false)}>✖</button>
              <div className="cec2-controls">
                <button onClick={() => { setZoom(1); setPosition({ x: 0, y: 0 }); }}>🔄 Reset</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CostEstimationChallenge;
