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

  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // ✅ Fetch challenge details
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
                  {Object.entries(grouped).map(([cat, rows], i) => (
                    <React.Fragment key={cat}>
                      <tr className="cat-row">
                        <td colSpan={6}>
                          <strong>{cat}</strong>
                        </td>
                      </tr>
                      {rows.map((r, idx) => (
                        <tr key={r.id || idx}>
                          <td>{idx + 1}</td>
                          <td>{r.description}</td>
                          <td>{r.quantity}</td>
                          <td>{r.unit}</td>
                          <td>{r.unit_price ? `₱${r.unit_price}` : "–"}</td>
                          <td>
                            {r.unit_price && r.quantity
                              ? `₱${(r.unit_price * r.quantity).toLocaleString()}`
                              : "–"}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  {summary && (
                    <>
                      <tr className="subtotal-row">
                        <td colSpan={5}>
                          <strong>Sub-total</strong>
                        </td>
                        <td>
                          <strong>₱{summary.subtotal}</strong>
                        </td>
                      </tr>
                      <tr className="grand-footer">
                        <td colSpan={5}>
                          <strong>Grand Total</strong>
                        </td>
                        <td>
                          <strong>₱{summary.total}</strong>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
