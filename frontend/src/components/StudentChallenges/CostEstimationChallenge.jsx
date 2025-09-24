import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import Sidebar from "../Sidebar/Sidebar";
import "./CostEstimationChallenge.css";

const peso = (v) => {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return "–";
  return `₱${n.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const API_BASE = "http://127.0.0.1:8000";

const CAT_ORDER = [
  "EARTHWORK",
  "FORMWORK & SCAFFOLDING",
  "MASONRY WORK",
  "CONCRETE WORK",
  "STEELWORK",
  "CARPENTRY WORK",
  "ROOFING WORK",
];

function roman(n) {
  const map = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let res = "";
  for (const [v, s] of map) while (n >= v) { res += s; n -= v; }
  return res;
}

export default function CostEstimationChallenge() {
  const { challengeId } = useParams();

  const [challenge, setChallenge] = useState(null);
  const [loadingChallenge, setLoadingChallenge] = useState(true);

  const [submitted, setSubmitted] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });

  const [saving, setSaving] = useState(false);

  // ===== items state (frontend-only rows) =====
  const idRef = useRef(1);
  const makeId = () => idRef.current++;
  const [items, setItems] = useState(
    CAT_ORDER.map((cat) => ({
      rid: makeId(),
      cost_category: cat,
      description: "",
      quantity: "",
      unit: "",
      unit_price: "",
    }))
  );
  const updateItem = (rid, field, value) =>
    setItems((prev) => prev.map((it) => (it.rid === rid ? { ...it, [field]: value } : it)));
  const addRow = (cat) =>
    setItems((prev) => [
      ...prev,
      { rid: makeId(), cost_category: cat, description: "", quantity: "", unit: "", unit_price: "" },
    ]);

  // ===== derived subtotals (by category + grand) =====
  const grouped = CAT_ORDER.map((cat) => {
    const rows = items.filter((r) => r.cost_category === cat);
    const subtotal = rows.reduce(
      (s, r) => s + (parseFloat(r.quantity) || 0) * (parseFloat(r.unit_price) || 0),
      0
    );
    return { cat, rows, subtotal };
  });
  const grandSubtotal = grouped.reduce((s, g) => s + g.subtotal, 0);
  const contingencyPct = 10;
  const grandTotal = grandSubtotal * (1 + contingencyPct / 100);

  // ===== payload builder (uses grouped) =====
  const buildPayload = async (submit = false) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("No active user");

    const cleaned = items
      .filter(
        (r) =>
          (r.description && r.description.trim()) ||
          Number(r.quantity) ||
          Number(r.unit_price)
      )
      .map((r) => ({
        cost_category: r.cost_category,
        material_name: r.description?.trim() || "Item",
        quantity: parseFloat(r.quantity || 0),
        unit: r.unit || null,
        unit_price: parseFloat(r.unit_price || 0),
      }));

    if (cleaned.length === 0) throw new Error("No rows to save");

    const catSubs = grouped
      .map((g) => ({
        cost_category: g.cat,
        subtotal: Number(g.subtotal.toFixed(2)),
      }))
      .filter((s) => s.subtotal > 0);

    return {
      student_id: user.id,
      challenge_id: challengeId,
      items: cleaned,
      contingency_percentage: 0.10,
      submit,
      category_subtotals: catSubs,
    };
  };

  // ===== actions =====
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const body = await buildPayload(false);
      const res = await fetch(`${API_BASE}/cost-estimates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      await res.json();
      alert("Draft saved ✔");
    } catch (e) {
      alert("Save failed: " + (e.message || "error"));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const body = await buildPayload(true);
      const res = await fetch(`${API_BASE}/cost-estimates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      await res.json();
      setSubmitted(true);
      alert("You're done with this challenge.");
    } catch (e) {
      alert("Submit failed: " + (e.message || "error"));
    } finally {
      setSaving(false);
    }
  };

  // ===== floor plan: not fetched yet =====
  const floorplanImg = null;

  // Load challenge details (name/instructions/objectives)
  useEffect(() => {
    (async () => {
      setLoadingChallenge(true);
      const { data, error } = await supabase
        .from("student_challenges")
        .select("challenge_name, challenge_instructions, challenge_objectives")
        .eq("challenge_id", challengeId)
        .single();
      if (!error) setChallenge(data);
      setLoadingChallenge(false);
    })();
  }, [challengeId]);

  // Check if already submitted -> lock UI
  useEffect(() => {
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setLoadingExisting(false);
          return;
        }

        const { data: est } = await supabase
          .from("student_cost_estimates")
          .select("submitted_at")
          .eq("student_id", user.id)
          .eq("challenge_id", challengeId)
          .maybeSingle();

        setSubmitted(Boolean(est?.submitted_at));
      } finally {
        setLoadingExisting(false);
      }
    })();
  }, [challengeId]);

  // modal / zoom handlers
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setIsModalOpen(false);
      if (e.key.toLowerCase() === "r") {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      }
    };
    if (isModalOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartDrag({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - startDrag.x, y: e.clientY - startDrag.y });
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleWheel = (e) => {
    e.preventDefault();
    const step = 0.1;
    setZoom((z) => Math.max(0.5, Math.min(3, z + (e.deltaY < 0 ? step : -step))));
  };

  const planTitle = challenge?.challenge_name || "—";
  const instructions = challenge?.challenge_instructions || "—";
  const objectives = challenge?.challenge_objectives || "—";

  return (
    <div className="cec2-page">
      <Sidebar />

      <div className="cec2-wrapper">
        <h1 className="cec3-title">Cost Estimate Challenge</h1>
        <h2 className="cec3-subtitle">{planTitle}</h2>
        {loadingChallenge && (
          <p style={{ textAlign: "center", marginBottom: 12 }}>
            Loading challenge…
          </p>
        )}
        {loadingExisting && (
          <p style={{ textAlign: "center", marginBottom: 12 }}>
            Checking your submission status…
          </p>
        )}

        {/* TOP: details + floorplan */}
        <div className="cec3-grid-top">
          <div className="cec3-stack">
            <div className="cec3-card">
              <div className="cec3-card-header">
                <span className="cec3-icon">🔵</span>
                <span>Challenge Instructions</span>
              </div>
              <div className="cec3-card-body">
                <p>{instructions}</p>
              </div>
            </div>

            <div className="cec3-card">
              <div className="cec3-card-header">
                <span className="cec3-icon">📄</span>
                <span>Challenge Objectives</span>
              </div>
              <div className="cec3-card-body">
                <p>{objectives}</p>
              </div>
            </div>
          </div>

          {/* Floor plan card (no file yet) */}
          <div className="cec3-card">
            <div className="cec3-card-header">
              <span>{planTitle}</span>
            </div>
            <div className="cec3-card-body">
              <p className="cec3-muted">Reference for your structural cost estimates</p>

              <div
                className="cec3-floorplan-frame"
                onClick={() => {
                  if (!floorplanImg) return;
                  setIsModalOpen(true);
                  setZoom(1);
                  setPosition({ x: 0, y: 0 });
                }}
              >
                {floorplanImg ? (
                  <img src={floorplanImg} alt="Floor plan" />
                ) : (
                  <div
                    style={{
                      padding: 60,
                      textAlign: "center",
                      color: "#94a3b8",
                      fontWeight: 600,
                    }}
                  >
                    No floor plan yet
                  </div>
                )}
              </div>

              <div className="cec3-scale">
                <span>0</span><span>5</span><span>10</span><span>15</span><span>20</span>
              </div>
            </div>
          </div>
        </div>

        {/* LOWER: table + summary */}
        <div className="cec3-grid-lower">
          <div className="cec3-card">
            <div className="cec3-card-header"><span>Structural Cost Estimates</span></div>
            <div className="cec3-card-body">
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
                  {grouped.map((g, gi) => (
                    <React.Fragment key={g.cat}>
                      <tr className="cat-row">
                        <td colSpan={6}>
                          <strong>{roman(gi + 1)}. {g.cat}</strong>
                          <button
                            className="add-row-btn"
                            onClick={() => addRow(g.cat)}
                            type="button"
                            disabled={submitted}
                          >
                            + Add material
                          </button>
                        </td>
                      </tr>

                      {g.rows.map((r, i) => {
                        const qty = parseFloat(r.quantity) || 0;
                        const up = parseFloat(r.unit_price) || 0;
                        const amt = qty * up;
                        return (
                          <tr key={r.rid}>
                            <td>{i + 1}</td>
                            <td>
                              <input
                                type="text"
                                value={r.description}
                                placeholder="Material / Work description"
                                onChange={(e) => updateItem(r.rid, "description", e.target.value)}
                                disabled={submitted}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                value={r.quantity}
                                onChange={(e) => updateItem(r.rid, "quantity", e.target.value)}
                                disabled={submitted}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={r.unit}
                                onChange={(e) => updateItem(r.rid, "unit", e.target.value)}
                                disabled={submitted}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                value={r.unit_price}
                                onChange={(e) => updateItem(r.rid, "unit_price", e.target.value)}
                                disabled={submitted}
                              />
                            </td>
                            <td>{peso(amt)}</td>
                          </tr>
                        );
                      })}

                      <tr className="subtotal-row">
                        <td colSpan={5}><strong>Sub-Total</strong></td>
                        <td><strong>{peso(g.subtotal)}</strong></td>
                      </tr>
                    </React.Fragment>
                  ))}

                  <tr className="grand-footer">
                    <td colSpan={5}><strong>Total (incl. 10% Contingency)</strong></td>
                    <td><strong>{peso(grandTotal)}</strong></td>
                  </tr>
                </tbody>
              </table>

              {!submitted ? (
                <div className="cec2-actions">
                  <button
                    className="cec2-btn draft"
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save as Draft"}
                  </button>

                  <button
                    className="cec2-btn submit"
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {saving ? "Submitting…" : "Submit"}
                  </button>
                </div>
              ) : (
                <div className="cec2-actions">
                  <div style={{ fontWeight: 700, color: "#16a34a" }}>
                    You're done with this challenge.
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="cec3-stack">
            <div className="cec3-card">
              <div className="cec3-card-header"><span>Project Summary</span></div>
              <div className="cec3-card-body">
                <ul className="cec3-summary-list">
                  {grouped.map((g, i) => (
                    <li key={g.cat}>
                      {roman(i + 1)}. {g.cat} — {g.subtotal > 0 ? peso(g.subtotal) : "–"}
                    </li>
                  ))}
                </ul>
                <p><strong>Total Material Cost (TC):</strong> {peso(grandSubtotal)}</p>
                <p><strong>Contingencies (10%):</strong> {peso(grandTotal - grandSubtotal)}</p>
                <p><strong>Grand Total Cost:</strong> {peso(grandTotal)}</p>
              </div>
            </div>

            <div className="cec3-card">
              <div className="cec3-card-header"><span>💡 AI Suggestions</span></div>
              <div className="cec3-card-body">
                <p>Consider double-checking measurements against structural plan for accuracy.</p>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL (kept off until you add floorplan) */}
        {isModalOpen && floorplanImg && (
          <div className="cec2-modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="cec2-modal-viewer" onClick={(e) => e.stopPropagation()}>
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
                <img src={floorplanImg} alt="Floor plan enlarged" />
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
