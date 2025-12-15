import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import Sidebar from "../Sidebar/Sidebar";
import "./TeacherChallengeView.css";

export default function TeacherChallengeView() {
  const { challengeId } = useParams();

  const [challenge, setChallenge] = useState(null);
  const [aiEstimates, setAiEstimates] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingDueDate, setEditingDueDate] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  const handleItemChange = (index, field, value) => {
    setIsDirty(true);

    setAiEstimates((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;

        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unit_price") {
          updated.amount = (updated.quantity || 0) * (updated.unit_price || 0);
        }

        return updated;
      })
    );
  };

  const calculateSummary = () => {
    const grouped = aiEstimates.reduce((acc, row, idx) => {
      const subtotal = (row.quantity || 0) * (row.unit_price || 0);
      if (!acc[row.cost_category])
        acc[row.cost_category] = { rows: [], subtotal: 0 };

      acc[row.cost_category].rows.push({ ...row, _originalIndex: idx });
      acc[row.cost_category].subtotal += subtotal;
      return acc;
    }, {});

    const totalMaterial = Object.values(grouped).reduce(
      (sum, g) => sum + g.subtotal,
      0
    );

    const laborCost = totalMaterial * 0.4;
    const contingencies = (totalMaterial + laborCost) * 0.05;
    const grandTotal = totalMaterial + laborCost + contingencies;

    return { grouped, totalMaterial, laborCost, contingencies, grandTotal };
  };

  useEffect(() => {
    (async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: challengeData } = await supabase
        .from("student_challenges")
        .select("*")
        .eq("challenge_id", challengeId)
        .eq("teacher_id", user.id)
        .single();
      setChallenge(challengeData);

      const { data: aiData } = await supabase
        .from("ai_cost_estimates")
        .select("*")
        .eq("challenge_id", challengeId);
      setAiEstimates(aiData || []);

      const { data: summaryData } = await supabase
        .from("cost_estimates_summary")
        .select("*")
        .eq("challenge_id", challengeId)
        .maybeSingle();
      setSummary(summaryData);

      setLoading(false);
    })();
  }, [challengeId]);

  if (loading) {
    return (
      <div className="cec2-page">
        <Sidebar />
        <div className="cec2-wrapper">
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            Loading challenge…
          </p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="cec2-page">
        <Sidebar />
        <div className="cec2-wrapper">
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            No challenge found or you don’t have access.
          </p>
        </div>
      </div>
    );
  }

  const liveSummary = calculateSummary();

  const summaryToDisplay = isDirty
    ? liveSummary
    : summary
    ? {
        grouped: {
          EARTHWORK: { subtotal: summary.earthwork_amount, rows: [] },
          "FORMWORK & SCAFFOLDING": {
            subtotal: summary.formwork_amount,
            rows: [],
          },
          "MASONRY WORK": { subtotal: summary.masonry_amount, rows: [] },
          "CONCRETE WORK": { subtotal: summary.concrete_amount, rows: [] },
          STEELWORK: { subtotal: summary.steelwork_amount, rows: [] },
          "CARPENTRY WORK": { subtotal: summary.carpentry_amount, rows: [] },
          "ROOFING WORK": { subtotal: summary.roofing_amount, rows: [] },
        },
        totalMaterial: summary.total_material_cost,
        laborCost: summary.labor_cost,
        contingencies: summary.contingencies_amount,
        grandTotal: summary.grand_total_cost,
      }
    : liveSummary;

  return (
    <div className="cec2-page">
      <Sidebar />
      <div className="cec2-wrapper">
        <h1 className="cec3-title">Challenge Details</h1>
        <p className="cec3-psub">Challenge ID: {challenge.challenge_id}</p>
          <div className="cec3-stack">
            <div className="cec3-card">
              <div className="cec3-card-header">📘 Challenge Name</div>
              <div className="cec3-card-body">
                <textarea
                  value={challenge.challenge_name || ""}
                  onChange={(e) =>
                    setChallenge((prev) => ({
                      ...prev,
                      challenge_name: e.target.value,
                    }))
                  }
                  rows="4"
                  style={{
                    width: "100%",
                    height: "45px",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                  }}
                />
              </div>
            </div>

            <div className="cec3-card">
              <div className="cec3-card-header">📘 Instructions</div>
              <div className="cec3-card-body">
                <textarea
                  value={challenge.challenge_instructions || ""}
                  onChange={(e) =>
                    setChallenge((prev) => ({
                      ...prev,
                      challenge_instructions: e.target.value,
                    }))
                  }
                  rows="4"
                  style={{
                    width: "100%",
                    height: "250px",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                  }}
                />
              </div>
            </div>

            <div className="cec3-card">
              <div className="cec3-card-header">🎯 Objectives</div>
              <div className="cec3-card-body">
                <textarea
                  value={challenge.challenge_objectives || ""}
                  onChange={(e) =>
                    setChallenge((prev) => ({
                      ...prev,
                      challenge_objectives: e.target.value,
                    }))
                  }
                  rows="4"
                  style={{
                    width: "100%",
                    height: "200px",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                  }}
                />
              </div>

              <div style={{ textAlign: "center", marginBottom: "18px" }}>
                <label style={{ color: "#64748b", fontWeight: 600 }}>
                  Due Date:{" "}
                </label>
                <input
                  type="datetime-local"
                  value={
                    editingDueDate ||
                    (challenge.due_date
                      ? new Date(challenge.due_date)
                          .toISOString()
                          .slice(0, 16)
                      : "")
                  }
                  onChange={(e) => setEditingDueDate(e.target.value)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    marginLeft: "8px",
                  }}
                />
              </div>

              <button
                onClick={async () => {
                  if (!window.confirm("⚠️ Update challenge details?")) return;

                  try {
                    const { error } = await supabase
                      .from("student_challenges")
                      .update({
                        challenge_name: challenge.challenge_name,
                        challenge_instructions:
                          challenge.challenge_instructions,
                        challenge_objectives: challenge.challenge_objectives,
                        due_date: editingDueDate || challenge.due_date,
                      })
                      .eq("challenge_id", challenge.challenge_id);

                    if (error) {
                      alert("❌ Failed to update challenge: " + error.message);
                    } else {
                      alert("✅ Challenge details updated!");
                      setChallenge((prev) => ({
                        ...prev,
                        due_date: editingDueDate || prev.due_date,
                      }));
                    }
                  } catch (err) {
                    console.error(err);
                    alert("❌ Unexpected error: " + err.message);
                  }
                }}
                style={{
                  marginLeft: "10px",
                  padding: "6px 12px",
                  background: "#176bb7",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Update Challenge Details
              </button>
            </div>
          </div>

        {challenge.file_url && (
            <div className="cec3-file-box">
              <div className="cec3-file-title">View Uploaded Floor Plan Model</div>
              <a
                href={challenge.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="cec3-file-btn"
              >
                ⬇ View Uploaded Plans
              </a>
            </div>
          )}

        {/* AI Cost Estimates Table */}
        <div style={{ marginTop: "30px"}}>
          <div className="cec3-card">
            <div className="cec3-card-header">AI Cost Estimates</div>
            <div className="cec3-card-body">
              <table className="cost-estimate-table">
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>#</th>
                    <th>Description</th>
                    <th style={{ width: 110 }}>Quantity</th>
                    <th style={{ width: 90 }}>Unit</th>
                    <th style={{ width: 130 }}>Unit Price</th>
                    <th style={{ width: 140 }}>Amount</th>
                    <th style={{ width: 140 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(liveSummary.grouped).map(([cat, data], i) => (
                    <React.Fragment key={cat}>
                      <tr className="cat-row">
                        <td colSpan={6}>
                          <strong>{cat}</strong>
                        </td>
                      </tr>

                      {data.rows.map((r, idx) => (
                        <tr key={r.id || r._originalIndex}>
                          <td>{idx + 1}</td>
                          <td>
                            <input
                              type="text"
                              value={r.description || ""}
                              onChange={(e) =>
                                handleItemChange(
                                  r._originalIndex,
                                  "description",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={r.quantity || ""}
                              onChange={(e) =>
                                handleItemChange(
                                  r._originalIndex,
                                  "quantity",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={r.unit || ""}
                              onChange={(e) =>
                                handleItemChange(
                                  r._originalIndex,
                                  "unit",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={r.unit_price || ""}
                              onChange={(e) =>
                                handleItemChange(
                                  r._originalIndex,
                                  "unit_price",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                            />
                          </td>
                          <td>
                            ₱
                            {(
                              (r.quantity || 0) * (r.unit_price || 0)
                            ).toLocaleString()}
                          </td>

                          <td>
                            <button
                              style={{
                                color: "red",
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Are you sure you want to delete this row?"
                                  )
                                ) {
                                  setIsDirty(true);
                                  setAiEstimates((prev) =>
                                    prev.filter(
                                      (_, idx) => idx !== r._originalIndex
                                    )
                                  );
                                }
                              }}
                            >
                              ❌ Remove
                            </button>
                          </td>
                        </tr>
                      ))}

                      <tr>
                        <td colSpan={7}>
                          <button
                            className="add-row-btn"
                            onClick={() => {
                              setIsDirty(true);
                              const newRow = {
                                id: Date.now(),
                                challenge_id: challengeId,
                                cost_category: cat,
                                description: "",
                                quantity: 0,
                                unit: "",
                                unit_price: 0,
                              };
                              setAiEstimates((prev) => [...prev, newRow]);
                            }}
                          >
                            + Add Material
                          </button>
                        </td>
                      </tr>

                      <tr className="subtotal-row">
                        <td colSpan={5}>
                          <strong>Sub-Total</strong>
                        </td>
                        <td>
                          <strong>₱{data.subtotal.toLocaleString()}</strong>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Project Summary */}
            {summaryToDisplay && (
              <div className="cec3-card" style={{ marginTop: "30px" }}>
                <div className="cec3-card-header">📊 Project Summary</div>
                <div className="cec3-card-body">
                  <table className="cec3-summary-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Amount (₱)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(summaryToDisplay.grouped).map(([cat, data]) => (
                        <tr key={cat}>
                          <td>{cat}</td>
                          <td>{(data.subtotal || 0).toLocaleString()}</td>
                        </tr>
                      ))}

                      <tr className="cec3-summary-divider">
                        <td colSpan="2"></td>
                      </tr>

                      <tr>
                        <td><strong>Total Material Cost (TC)</strong></td>
                        <td><strong>{summaryToDisplay.totalMaterial.toLocaleString()}</strong></td>
                      </tr>
                      <tr>
                        <td><strong>Contingencies (5% of TC+LC)</strong></td>
                        <td><strong>{summaryToDisplay.contingencies.toLocaleString()}</strong></td>
                      </tr>
                      <tr className="cec3-summary-grand">
                        <td><strong>Grand Total</strong></td>
                         <strong>
                          ₱{(summaryToDisplay.totalMaterial + summaryToDisplay.contingencies).toLocaleString()}
                        </strong>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>

            <div style={{ marginTop: "20px", textAlign: "right" }}>
                  <button
                    onClick={async () => {
                      if (!window.confirm("⚠️ All changes will be updated, are you sure?")) return;

                      try {
                        // 1️⃣ Always update challenge details
                        const { error: challengeError } = await supabase
                          .from("student_challenges")
                          .update({
                            challenge_name: challenge.challenge_name,
                            challenge_instructions: challenge.challenge_instructions,
                            challenge_objectives: challenge.challenge_objectives,
                            due_date: editingDueDate || challenge.due_date,
                          })
                          .eq("challenge_id", challengeId);

                        if (challengeError) {
                          alert("❌ Failed to update challenge details: " + challengeError.message);
                          return;
                        }

                        // 2️⃣ Only save AI estimates IF they were modified
                        if (isDirty) {
                          const summaryCalc = calculateSummary();

                          const response = await fetch(
                            `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/cost-estimates/save`,
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                challenge_id: challengeId,
                                analysis_id: summary?.analysis_id || null,
                                items: aiEstimates.map((row, idx) => ({
                                  estimate_id: row.estimate_id || null,
                                  description: row.description,
                                  quantity: row.quantity || 0,
                                  unit: row.unit || "",
                                  unit_price: row.unit_price || 0,
                                  amount: (row.quantity || 0) * (row.unit_price || 0),
                                  cost_category: row.cost_category,
                                  item_number: idx + 1,
                                  challenge_id: challengeId,
                                })),
                                summary: {
                                  earthwork_amount:
                                    summaryCalc.grouped["EARTHWORK"]?.subtotal || 0,
                                  formwork_amount:
                                    summaryCalc.grouped["FORMWORK & SCAFFOLDING"]?.subtotal || 0,
                                  masonry_amount:
                                    summaryCalc.grouped["MASONRY WORK"]?.subtotal || 0,
                                  concrete_amount:
                                    summaryCalc.grouped["CONCRETE WORK"]?.subtotal || 0,
                                  steelwork_amount:
                                    summaryCalc.grouped["STEELWORK"]?.subtotal || 0,
                                  carpentry_amount:
                                    summaryCalc.grouped["CARPENTRY WORK"]?.subtotal || 0,
                                  roofing_amount:
                                    summaryCalc.grouped["ROOFING WORK"]?.subtotal || 0,
                                  total_material_cost: summaryCalc.totalMaterial || 0,
                                  labor_cost: summaryCalc.laborCost || 0,
                                  contingencies_amount: summaryCalc.contingencies || 0,
                                  grand_total_cost: summaryCalc.grandTotal || 0,
                                },
                              }),
                            }
                          );

                          if (!response.ok) {
                            alert("❌ Failed to save AI cost estimates");
                            return;
                          }
                        }

                        // 3️⃣ Final success
                        alert("✅ Changes saved successfully!");
                        setIsDirty(false);

                      } catch (err) {
                        console.error(err);
                        alert("❌ Failed to save changes: " + err.message);
                      }
                    }}
                    style={{
                      padding: "10px 18px",
                      background: "#176bb7",
                      color: "#fff",
                      borderRadius: "8px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    💾 Save Changes
                  </button>
                </div>

      </div>
    </div>
  );
}
