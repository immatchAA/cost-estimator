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

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

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
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let res = "";
  for (const [v, s] of map)
    while (n >= v) {
      res += s;
      n -= v;
    }
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

  const [suggestion, setSuggestion] = useState ("AI is ready to assist.")

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
    setItems((prev) =>
      prev.map((it) => (it.rid === rid ? { ...it, [field]: value } : it))
    );
  const addRow = (cat) =>
    setItems((prev) => [
      ...prev,
      {
        rid: makeId(),
        cost_category: cat,
        description: "",
        quantity: "",
        unit: "",
        unit_price: "",
      },
    ]);

  // ===== derived subtotals (by category + grand) =====
  const grouped = CAT_ORDER.map((cat) => {
    const rows = items.filter((r) => r.cost_category === cat);
    const subtotal = rows.reduce(
      (s, r) =>
        s + (parseFloat(r.quantity) || 0) * (parseFloat(r.unit_price) || 0),
      0
    );
    return { cat, rows, subtotal };
  });
  const grandSubtotal = grouped.reduce((s, g) => s + g.subtotal, 0);
  const contingencyPct = 10;
  const grandTotal = grandSubtotal * (1 + contingencyPct / 100);


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
        challenge_id: challengeId, 
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
      contingency_percentage: 0.1,
      submit,
      category_subtotals: catSubs,
      status: submit ? "submitted" : "draft" 
    };
  };


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

  // ===== floor plan: fetched from challenge =====
  const [floorplanImg, setFloorplanImg] = useState(null);

  // Load challenge details (name/instructions/objectives/file_url)
  useEffect(() => {
    (async () => {
      setLoadingChallenge(true);
      const { data, error } = await supabase
        .from("student_challenges")
        .select("*")
        .eq("challenge_id", challengeId)
        .single();
      if (!error) {
        setChallenge(data);
        // Set the floor plan image URL if available
        if (data.file_url) {
          setFloorplanImg(data.file_url);
        }
      }
      setLoadingChallenge(false);
    })();
  }, [challengeId]);

  
  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoadingExisting(false);
          return;
        }

        const res = await fetch(`${API_BASE}/cost-estimates/student/${user.id}/challenge/${challengeId}`);
        if (res.ok) {
          const est = await res.json();

          if (est.items && est.items.length > 0) {
            setItems(est.items.map((it) => ({
            rid: makeId(),
            cost_category: it.cost_category,
            description: it.material_name,   
            quantity: it.quantity,
            unit: it.unit,
            unit_price: it.unit_price,
          })));
          }

          setSubmitted(est.status === "submitted");
        }
      } catch (err) {
        console.error("Failed to fetch existing estimate", err);
      } finally {
        setLoadingExisting(false);
      }
    })();
  }, [challengeId]);

  useEffect(() => {
  const handler = setTimeout(async () => {
    try {
      const body = {
        challenge_id: challenge?.challenge_id,
        challenge_name: challenge?.challenge_name,
        challenge_instructions: challenge?.challenge_instructions,
        challenge_objectives: challenge?.challenge_objectives,
        file_url: challenge?.file_url,
        items: items.map((r) => ({
          cost_category: r.cost_category,
          description: r.description || "",
          quantity: parseFloat(r.quantity || 0),
          unit: r.unit || null,
          unit_price: parseFloat(r.unit_price || 0),
        })),
      };

      const res = await fetch(`${API_BASE}/ai-suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setSuggestion(data.suggestion || "No suggestions right now.");
    } catch (err) {
      setSuggestion("⚠️ AI suggestions unavailable.");
    }
  }, 1500);

  return () => clearTimeout(handler);
}, [items, challenge]);


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
    setZoom((z) =>
      Math.max(0.5, Math.min(3, z + (e.deltaY < 0 ? step : -step)))
    );
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

      
    
          
            <div className="cec3-card-body">
            

              {/* ✅ New Download/View Button */}
              {floorplanImg && (
                <div style={{ marginTop: "12px", textAlign: "center" }}>
                  <a
                    href={floorplanImg}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      padding: "8px 14px",
                      background: "#176bb7",
                      color: "#fff",
                      borderRadius: "6px",
                      fontWeight: "600",
                      textDecoration: "none",
                    }}
                  >
                    ⬇ Click Here to view uploaded plans for reference.
                  </a>
                </div>
              )}
          </div>
        </div>

        {/* LOWER: table + summary */}
        <div className="cec3-grid-lower">
          <div className="cec3-card">
            <div className="cec3-card-header">
              <span>Structural Cost Estimates</span>
            </div>
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
                          <strong>
                            {roman(gi + 1)}. {g.cat}
                          </strong>
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
                                onChange={(e) =>
                                  updateItem(
                                    r.rid,
                                    "description",
                                    e.target.value
                                  )
                                }
                                disabled={submitted}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                value={r.quantity}
                                onChange={(e) =>
                                  updateItem(r.rid, "quantity", e.target.value)
                                }
                                disabled={submitted}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={r.unit}
                                onChange={(e) =>
                                  updateItem(r.rid, "unit", e.target.value)
                                }
                                disabled={submitted}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                value={r.unit_price}
                                onChange={(e) =>
                                  updateItem(
                                    r.rid,
                                    "unit_price",
                                    e.target.value
                                  )
                                }
                                disabled={submitted}
                              />
                            </td>
                            <td>{peso(amt)}</td>
                          </tr>
                        );
                      })}

                      <tr className="subtotal-row">
                        <td colSpan={5}>
                          <strong>Sub-Total</strong>
                        </td>
                        <td>
                          <strong>{peso(g.subtotal)}</strong>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}

                  <tr className="grand-footer">
                    <td colSpan={5}>
                      <strong>Total (incl. 10% Contingency)</strong>
                    </td>
                    <td>
                      <strong>{peso(grandTotal)}</strong>
                    </td>
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
              <div className="cec3-card-header">
                <span>Project Summary</span>
              </div>
              <div className="cec3-card-body">
                <ul className="cec3-summary-list">
                  {grouped.map((g, i) => (
                    <li key={g.cat}>
                      {roman(i + 1)}. {g.cat} —{" "}
                      {g.subtotal > 0 ? peso(g.subtotal) : "–"}
                    </li>
                  ))}
                </ul>
                <p>
                  <strong>Total Material Cost (TC):</strong>{" "}
                  {peso(grandSubtotal)}
                </p>
                <p>
                  <strong>Contingencies (10%):</strong>{" "}
                  {peso(grandTotal - grandSubtotal)}
                </p>
                <p>
                  <strong>Grand Total Cost:</strong> {peso(grandTotal)}
                </p>
              </div>
            </div>

            <div className="cec3-card">
              <div className="cec3-card-header">
                <span>💡 AI Suggestions</span>
              </div>
              <div className="cec3-card-body">
                {suggestion
                .split(/\d+\./) 
                .filter((s) => s.trim() !== "")
                .map((s, i) => (
                  <div key={i} style={{ marginBottom: "12px" }}>
                    <strong>{i + 1}.</strong> {s.trim()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isModalOpen && floorplanImg && (
          <div
            className="cec2-modal-overlay"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="cec2-modal-viewer"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const fileExtension = floorplanImg
                  .split(".")
                  .pop()
                  ?.toLowerCase();
                if (fileExtension === "pdf") {
                  return (
                    <div className="cec2-modal-pdf-container">
                      <iframe
                        src={floorplanImg}
                        width="100%"
                        height="100%"
                        style={{ border: "none" }}
                        title="Floor plan PDF"
                      />
                    </div>
                  );
                } else {
                  return (
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
                  );
                }
              })()}
              <button
                className="cec2-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✖
              </button>
              <div className="cec2-controls">
                <button
                  onClick={() => {
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                  }}
                >
                  🔄 Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
