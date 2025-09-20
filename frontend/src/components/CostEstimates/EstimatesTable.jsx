import React from "react";
import "./EstimatesTable.css";

const EstimatesTable = () => {
  return (
    <div className="cost-estimate">
    <div className="estimate-header">
        <h2>Challenge ID: </h2>
    </div>

      {/* Left column */}
      <div className="project-summary">
        <h4>Project Summary</h4>
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
            <tr><td><strong>CONTINGENCIES C (5% of (TC + LC))</strong></td><td>-</td></tr>
            <tr><td><strong>GRAND TOTAL COST</strong></td><td>-</td></tr>
          </tbody>
        </table>

        {/* Confidence Block */}
        <div className="analysis-confidence">
          <h5>Analysis Confidence</h5>
          <p><strong>Overall Accuracy:</strong></p>
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p className="confidence-text">
            High confidence in structural cost estimation
          </p>
        </div>
      </div>

      {/* Right column */}
      <div className="right-column">
        <h4>Structural Cost Estimates</h4>
        <table className="cost-estimate-table">
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
            <tr>
              <td>1</td>
              <td>Earthwork</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Formwork &amp; Scaffolding</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Masonry Work</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td>4</td>
              <td>Concrete Work</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td>5</td>
              <td>Steelwork</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td>6</td>
              <td>Carpentry Work</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td>7</td>
              <td>Roofing Work</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr className="subtotal-row">
              <td colSpan={7}><strong>Subtotal</strong></td>
            </tr>
            <tr className="total-row">
              <td colSpan={7}><strong>Total (incl. 10% Contingency)</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EstimatesTable;
