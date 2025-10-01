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

  const handleItemChange = (index, field, value) => {
    setAiEstimates((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateSummary = () => {
  // Group by category
  const grouped = aiEstimates.reduce((acc, row) => {
    const subtotal = (row.quantity || 0) * (row.unit_price || 0);
    if (!acc[row.cost_category]) acc[row.cost_category] = { rows: [], subtotal: 0 };
    acc[row.cost_category].rows.push(row);
    acc[row.cost_category].subtotal += subtotal;
    return acc;
  }, {});

  // Total material cost
  const totalMaterial = Object.values(grouped).reduce(
    (sum, g) => sum + g.subtotal,
    0
  );

  // Labor & contingencies
  const laborCost = totalMaterial * 0.4;
  const contingencies = (totalMaterial + laborCost) * 0.05;
  const grandTotal = totalMaterial + laborCost + contingencies;

  return { grouped, totalMaterial, laborCost, contingencies, grandTotal };
};



  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
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

      // ✅ Fetch AI-generated estimates
      const { data: aiData } = await supabase
        .from("ai_cost_estimates")
        .select("*")
        .eq("challenge_id", challengeId);
      setAiEstimates(aiData || []);

      // ✅ Fetch AI summary
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

  // Group AI estimates by category
  const grouped = aiEstimates.reduce((acc, row) => {
    if (!acc[row.cost_category]) acc[row.cost_category] = [];
    acc[row.cost_category].push(row);
    return acc;
  }, {});

  return (
    <div className="cec2-page">
      <Sidebar />
      <div className="cec2-wrapper">
        <h1 className="cec3-title">Challenge Details</h1>
        <h2 className="cec3-subtitle">{challenge.challenge_name}</h2>

        <div className="cec3-grid-top">
          <div className="cec3-stack">
            <div className="cec3-card">
              <div className="cec3-card-header">📘 Instructions</div>
              <div className="cec3-card-body">
                <p>{challenge.challenge_instructions}</p>
              </div>
            </div>

            <div className="cec3-card">
              <div className="cec3-card-header">🎯 Objectives</div>
              <div className="cec3-card-body">
                <p>{challenge.challenge_objectives}</p>
              </div>

              <div style={{ textAlign: "center", marginBottom: "18px" }}>
                <label style={{ color: "#64748b", fontWeight: 600 }}>Due Date: </label>
                <input
                  type="datetime-local"
                  value={
                    editingDueDate ||
                    (challenge.due_date
                      ? new Date(challenge.due_date).toISOString().slice(0, 16)
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
                <button
                  onClick={async () => {
                    if (!editingDueDate) return;
                    const { error } = await supabase
                      .from("student_challenges")
                      .update({ due_date: editingDueDate })
                      .eq("challenge_id", challenge.challenge_id);

                    if (error) {
                      alert("❌ Failed to update due date: " + error.message);
                    } else {
                      alert("✅ Due date updated!");
                      setChallenge({ ...challenge, due_date: editingDueDate });
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
                  Save
                </button>
              </div>


            </div>
          </div>
        </div>

      

        {challenge.file_url && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <a
              href={challenge.file_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                padding: "10px 16px",
                background: "#176bb7",
                color: "#fff",
                borderRadius: "8px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              ⬇ View Uploaded Plans
            </a>
          </div>
        )}

        {/* ✅ AI Cost Estimates Table */}
          <div className="cec3-grid-lower" style={{ marginTop: "30px" }}>
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
                    </tr>
                  </thead>
                  <tbody>
                        {Object.entries(calculateSummary().grouped).map(([cat, data], i) => (
                          <React.Fragment key={cat}>
                            <tr className="cat-row">
                              <td colSpan={6}>
                                <strong>{cat}</strong>
                              </td>
                            </tr>

                            {data.rows.map((r, idx) => {
                              const globalIndex = aiEstimates.indexOf(r); // 🔑 correct row index
                              return (
                                <tr key={r.id || globalIndex}>
                                  <td>{idx + 1}</td>
                                  <td>
                                    <input
                                      type="text"
                                      value={r.description || ""}
                                      onChange={(e) =>
                                        handleItemChange(globalIndex, "description", e.target.value)
                                      }
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      value={r.quantity || ""}
                                      onChange={(e) =>
                                        handleItemChange(globalIndex, "quantity", parseFloat(e.target.value) || 0)
                                      }
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      value={r.unit || ""}
                                      onChange={(e) =>
                                        handleItemChange(globalIndex, "unit", e.target.value)
                                      }
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      value={r.unit_price || ""}
                                      onChange={(e) =>
                                        handleItemChange(globalIndex, "unit_price", parseFloat(e.target.value) || 0)
                                      }
                                    />
                                  </td>
                                  <td>
                                    ₱{((r.quantity || 0) * (r.unit_price || 0)).toLocaleString()}
                                  </td>
                                </tr>
                              );
                            })}

                            {/* Subtotal per category */}
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
          
              {/* ✅ Project Summary Box */}
             {summary && (
             <div className="cec3-card">
                <div className="cec3-card-header">📊 Project Summary</div>
                <div className="cec3-card-body">
                  <ul className="cec3-summary-list">
                    {Object.entries(calculateSummary().grouped).map(([cat, data]) => (
                      <li key={cat}>
                        {cat}: ₱{data.subtotal.toLocaleString()}
                      </li>
                    ))}
                  </ul>
                  <hr style={{ margin: "12px 0" }} />
                  <p><strong>Total Material Cost (TC):</strong> ₱{calculateSummary().totalMaterial.toLocaleString()}</p>
                  <p><strong>Labor Cost (LC 40%):</strong> ₱{calculateSummary().laborCost.toLocaleString()}</p>
                  <p><strong>Contingencies (5% of TC+LC):</strong> ₱{calculateSummary().contingencies.toLocaleString()}</p>
                  <p style={{ fontSize: "1.1rem", fontWeight: "700", marginTop: "10px" }}>
                    Grand Total: ₱{calculateSummary().grandTotal.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
