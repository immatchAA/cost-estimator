import React from "react";
import "./ComparisonTable.css";


const peso = (v) => {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return "–";
  return `₱${n.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const CAT_ORDER = [
  "EARTHWORK",
  "FORMWORK & SCAFFOLDING",
  "MASONRY WORK",
  "CONCRETE WORK",
  "STEELWORK",
  "CARPENTRY WORK",
  "ROOFING WORK",
];

// 🔹 Compute summary
function computeSummary(items = []) {
  const catSubs = CAT_ORDER.map((cat) => {
    const subtotal = items
      .filter((i) => i.cost_category === cat)
      .reduce((s, i) => s + (Number(i.amount) || 0), 0);
    return { cost_category: cat, subtotal };
  });

  const totalMaterial = catSubs.reduce((s, c) => s + c.subtotal, 0);
  const labor = totalMaterial * 0.4;
  const contingencies = (totalMaterial + labor) * 0.05;
  const grandTotal = totalMaterial + labor + contingencies;

  return {
    category_subtotals: catSubs,
    total_material_cost: totalMaterial,
    labor_cost: labor,
    contingencies_amount: contingencies,
    grand_total_cost: grandTotal,
  };
}

function calculateAccuracy(studentData, aiData) {
  if (!studentData || !aiData) return null;

  const sum = (items = []) =>
    items.reduce((s, i) => s + (Number(i.amount) || 0), 0);

  const sTotal = sum(studentData.estimates || studentData.items || []);
  const aiTotal = sum(aiData.estimates || []);

  if (!sTotal || !aiTotal) return null;

  const diff = Math.abs(sTotal - aiTotal);
  const accuracy = Math.max(0, 100 - (diff / aiTotal) * 100);

  let conclusion = "";
  if (accuracy >= 85) conclusion = "Very close to AI estimate — excellent accuracy!";
  else if (accuracy >= 70) conclusion = "Fairly accurate compared to AI’s estimation.";
  else if (accuracy >= 50) conclusion = "Somewhat aligned but significant differences exist.";
  else conclusion = "Low alignment with AI — major differences in estimation.";

  return { accuracy: accuracy.toFixed(2), conclusion };
}


export default function ComparisonTable({ title, data, studentData, aiData }) {
  const estimates = data?.estimates || data?.items || [];

  // 🔹 Always compute summary from items
  const summary = computeSummary(estimates);

  // 🔹 Accuracy
  const accuracyResult = calculateAccuracy(studentData, aiData);

  // 🔹 Group estimates by category
  const grouped = CAT_ORDER.map((cat) => ({
    cat,
    rows: estimates.filter((r) => r.cost_category === cat),
    subtotal: estimates
      .filter((r) => r.cost_category === cat)
      .reduce((s, r) => s + (Number(r.amount) || 0), 0),
  })).filter((g) => g.rows.length > 0);

  return (
    <div className="comparison-table">
      <h3>{title}</h3>

      {/* Project Summary */}
      <div className="project-summary">
        <h4>Project Summary</h4>
        <table>
          <tbody>
            {summary?.category_subtotals?.map((c, i) => (
              <tr key={i}>
                <td>{c.cost_category}</td>
                <td>{peso(c.subtotal)}</td>
              </tr>
            ))}
            <tr>
              <td><strong>Total Materials</strong></td>
              <td>{peso(summary.total_material_cost)}</td>
            </tr>
            <tr>
              <td><strong>Labor</strong></td>
              <td>{peso(summary.labor_cost)}</td>
            </tr>
            <tr>
              <td><strong>Contingencies</strong></td>
              <td>{peso(summary.contingencies_amount)}</td>
            </tr>
            <tr>
              <td><strong>Grand Total</strong></td>
              <td>{peso(summary.grand_total_cost)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Structural Cost Estimates */}
      <div className="right-column">
        <h4>Structural Cost Estimates</h4>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Unit Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map((g, gi) => (
              <React.Fragment key={g.cat + gi}>
                <tr className="cat-row">
                  <td colSpan={6}><strong>{g.cat}</strong></td>
                </tr>
                {g.rows.map((r, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{r.description || r.material_name}</td>
                    <td>{r.quantity}</td>
                    <td>{r.unit}</td>
                    <td>{peso(r.unit_price)}</td>
                    <td>{peso(r.amount)}</td>
                  </tr>
                ))}
                <tr className="subtotal-row">
                  <td colSpan={5}><strong>Subtotal</strong></td>
                  <td>{peso(g.subtotal)}</td>
                </tr>
              </React.Fragment>
            ))}
            <tr className="grand-footer">
              <td colSpan={5}><strong>Total</strong></td>
              <td>{peso(summary.grand_total_cost)}</td>
            </tr>
          </tbody>
        </table>
      </div>


    </div>
  );
}
