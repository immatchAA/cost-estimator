import React from "react";
import "./EstimatesTable.css";

const peso = (v) => {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return "-";
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

export default function EstimatesTable({ data }) {
  const hasData = !!data;
  const challengeId = data?.challenge_id ?? "-";
  const analysisId = data?.analysis_id ?? "-";
  const overallConfidence = data?.overall_confidence ?? null;
  const catSubs = data?.category_subtotals ?? [];
  const summary = data?.summary ?? {};
  const estimates = data?.estimates ?? [];

  const grouped = CAT_ORDER.map((cat) => ({
    cat,
    rows: estimates.filter((r) => r.cost_category === cat),
    subtotal:
      estimates
        .filter((r) => r.cost_category === cat)
        .reduce((s, r) => s + (Number(r.amount) || 0), 0) || 0,
  })).filter((g) => g.rows.length > 0 || !hasData);

  const overallSubtotal = grouped.reduce((sum, g) => sum + g.subtotal, 0);
  const contingencyRate = 0.10;
  const totalWithContingency = overallSubtotal * (1 + contingencyRate);
  const contingencyAmount = overallSubtotal * contingencyRate;

  return (
    <div className="cost-estimate">
      <div className="estimate-header">
        <h2>Challenge ID: {challengeId}</h2>
        {hasData && (
          <p>
            <strong>Analysis ID:</strong> {analysisId}
          </p>
        )}
      </div>

      {/* LEFT: Project Summary */}
      <div className="project-summary">
        <h4>Project Summary</h4>
        <table className="summary-table">
          <tbody>
            {hasData ? (
              <>
                {catSubs.map((c, i) => (
                  <tr key={i}>
                    <td>{c.cost_category}</td>
                    <td>{peso(c.subtotal)}</td>
                  </tr>
                ))}
                  <tr>
                    <td>
                      <strong>Subtotal</strong>
                    </td>
                    <td>{peso(overallSubtotal)}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Contingency (10%)</strong>
                    </td>
                    <td>{peso(contingencyAmount)}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Total</strong>
                    </td>
                    <td>{peso(totalWithContingency)}</td>
                  </tr>

              </>
            ) : (
              <>
                <tr><td>I. EARTHWORK</td><td>–</td></tr>
                <tr><td>II. FORMWORK & SCAFFOLDING</td><td>–</td></tr>
                <tr><td>III. MASONRY WORK</td><td>–</td></tr>
                <tr><td>IV. CONCRETE WORK</td><td>–</td></tr>
                <tr><td>V. STEELWORK</td><td>–</td></tr>
                <tr><td>VI. CARPENTRY WORK</td><td>–</td></tr>
                <tr><td>VII. ROOFING WORK</td><td>–</td></tr>
                <tr><td><strong>TOTAL MATERIAL COST (TC)</strong></td><td>–</td></tr>
                <tr><td><strong>LABOR COST LC (40% of TC)</strong></td><td>–</td></tr>
                <tr><td><strong>CONTINGENCIES C (5% of (TC + LC))</strong></td><td>–</td></tr>
                <tr><td><strong>GRAND TOTAL COST</strong></td><td>–</td></tr>
              </>
            )}
          </tbody>
        </table>

      </div>{/* ← CLOSE project-summary BEFORE starting right-column */}

      <div className="right-column">
        <h4>Structural Cost Estimates</h4>
        <table className="cost-estimate-table">
          <thead>
            <tr>
              <th style={{ width: 50 }}>Item</th>
              <th>Description</th>
              <th style={{ width: 110 }}>Quantity</th>
              <th style={{ width: 90 }}>Unit</th>
              <th style={{ width: 130 }}>Unit Price</th>
              <th style={{ width: 140 }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {hasData ? (
              grouped.map((g, gi) => (
                <React.Fragment key={g.cat + gi}>
                  <tr className="cat-row">
                    <td colSpan={6}>
                      <strong>
                        {roman(gi + 1)}. {g.cat}
                      </strong>
                    </td>
                  </tr>
                  {g.rows.map((r, i) => (
                    <tr key={`${g.cat}-${i}`}>
                      <td>{i + 1}</td>
                      <td>{r.description}</td>
                      <td>{Number(r.quantity ?? 0) || "-"}</td>
                      <td>{r.unit || "-"}</td>
                      <td>{peso(r.unit_price)}</td>
                      <td>{peso(r.amount)}</td>
                    </tr>
                  ))}
                  <tr className="subtotal-row">
                    <td colSpan={5}>
                      <strong>Sub-Total</strong>
                    </td>
                    <td>
                      <strong>{peso(g.subtotal)}</strong>
                    </td>
                  </tr>
                </React.Fragment>
              ))
            ) : (
              CAT_ORDER.map((cat, i) => (
                <React.Fragment key={cat}>
                  <tr className="cat-row">
                    <td colSpan={6}>
                      <strong>
                        {roman(i + 1)}. {cat}
                      </strong>
                    </td>
                  </tr>
                  <tr>
                    <td>–</td><td>—</td><td>–</td><td>–</td><td>–</td><td>–</td>
                  </tr>
                  <tr className="subtotal-row">
                    <td colSpan={5}>
                      <strong>Sub-Total</strong>
                    </td>
                    <td>–</td>
                  </tr>
                </React.Fragment>
              ))
            )}
            {hasData && (
              <tr className="grand-footer">
                <td colSpan={5}>
                  <strong>Total (incl. 10% Contingency)</strong>
                </td>
                <td>
                   <strong>{peso(totalWithContingency)}</strong>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function roman(n) {
  const map = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let res = "";
  for (const [v, s] of map) {
    while (n >= v) {
      res += s;
      n -= v;
    }
  }
  return res;
}
