import React, { useState, useEffect } from "react";
import "./ClassInsights.css";
import Sidebar from "../Sidebar/Sidebar";
import { supabase } from "../../supabaseClient";
import ComparisonTable from "./ComparisonTable";

const peso = (v) => {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return "–";
  return `₱${n.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function ClassInsights() {
  const [openClass, setOpenClass] = useState(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiAccuracy, setAiAccuracy] = useState(null);


  const [aiData, setAiData] = useState(null);
  const [studentData, setStudentData] = useState(null);

   useEffect(() => {
    const calculateAccuracy = async () => {
      if (!studentData || !aiData || !selectedStudent) return;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/cost-estimates/ai/calculate-accuracy`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_items: studentData.estimates ?? studentData.items,
            ai_items: aiData.estimates,
            student_id: selectedStudent.id,
            challenge_id: selectedStudent.challengeId,
          }),
        }
      );

      const result = await res.json();
      setAiAccuracy(result.accuracy);
    };

    calculateAccuracy();
  }, [studentData, aiData, selectedStudent]);


  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not logged in");
        const teacherId = user.id;

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/classes/teacher/${teacherId}/with-students`
        );
        const result = await res.json();

        if (result.success) {
          setClasses(result.classes);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  if (loading) return <p>Loading...</p>;

  const handleOpenComparison = async (student, challenge) => {
    setAiData(null);
    setStudentData(null);

    setSelectedStudent({
      ...student,
      challengeId: challenge.challenge_id,
      challengeName: challenge.challenge_name ?? "No Challenge",
    });
    setComparisonOpen(true);



    if (challenge.challenge_id) {
      try {
        console.log("🔍 Fetching AI estimates for challenge:", challenge.challenge_id);

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/cost-estimates/ai/${challenge.challenge_id}`
        );

        console.log("🟦 AI Response status:", res.status);

        const result = await res.json();
        console.log("🟧 Raw AI result from server:", result);
        console.log("🟪 Type of AI result:", Array.isArray(result) ? "ARRAY" : typeof result);

        // Normalize shape
        if (Array.isArray(result)) {
          console.log("🟨 Wrapping AI array into { estimates: [...] }");
          setAiData({ estimates: result });
          console.log("🟩 Final stored aiData:", { estimates: result });
        } else {
          console.log("🟥 AI result is NOT array — storing as is");
          setAiData(result);
          console.log("🟩 Final stored aiData (raw):", result);
        }
      } catch (err) {
        console.error("🔥 AI fetch error:", err);
      }
    }



    // Fetch student estimate
    if (student.id && challenge.challenge_id) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/cost-estimates/student/${student.id}/challenge/${challenge.challenge_id}`
        );
        if (res.ok) {
          const result = await res.json();
          setStudentData(result);
        }
      } catch (err) {
        console.error("Student fetch error:", err);
      }
    }
  };


  return (
    <div className="class-insights-page">
      <Sidebar />

      <div className="class-insights-wrapper">
        <h1 className="tcv-title">📘 Class Overview</h1>
        <p className="tcv-subtitle">Manage your classes and enrolled students</p>

        <div className="tcv-class-list">
          {classes.map((cls) => (
            <div key={cls.id} className="tcv-class-card">
              {/* Class Header */}
              <div
                className="tcv-class-header"
                onClick={() =>
                  setOpenClass(openClass === cls.id ? null : cls.id)
                }
              >
                <div>
                  <h2>{cls.class_name}</h2>
                  <p className="tcv-class-key">Key: {cls.class_key}</p>
                </div>
                <span>{openClass === cls.id ? "▲" : "▼"}</span>
              </div>

              {/* Expanded Class Content */}
              {openClass === cls.id && (
                <div className="tcv-class-body">
                  {/* Challenges */}
                  {cls.challenges && cls.challenges.length > 0 ? (
                    [...cls.challenges]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .map((ch, index) => (
                      <div
                        key={ch.challenge_id}
                        className={`challenge-card ${
                          index % 2 === 0 ? "blue-border" : "orange-border"
                        }`}
                      >
                        <div className="challenge-header">
                          <h3>📘 {ch.challenge_name}</h3>
                          <p className="challenge-instructions">
                            {ch.challenge_instructions?.length > 180
                              ? ch.challenge_instructions.substring(0, 180) +
                                "..."
                              : ch.challenge_instructions ||
                                "No instructions provided."}
                          </p>
                          <p className="challenge-due">
                            Due:{" "}
                            {ch.due_date
                              ? new Date(ch.due_date).toLocaleDateString()
                              : "No due date"}
                          </p>
                        </div>

                        {/* Student Submissions */}
                        <details className="submissions-section">
                          <summary>
                            <span>
                              📄 Student Submissions (
                              {ch.submissions?.length || 0})
                            </span>
                          </summary>

                          <div className="submissions-list">
                            {ch.submissions && ch.submissions.length > 0 ? (
                              ch.submissions.map((s) => (
                                <div key={s.id} className="submission-card">
                                  <div className="submission-left">
                                    <div className="avatar-circle">
                                      {s.name?.charAt(0)?.toUpperCase() || "?"}
                                    </div>
                                    <div>
                                      <p className="student-name">{s.name}</p>
                                      <p className="student-email">{s.email}</p>
                                    </div>
                                  </div>

                                  <div className="submission-right">
                                    {s.submitted_at ? (
                                      <>
                                        <p className="submitted-date">
                                          Submitted:{" "}
                                          {new Date(
                                            s.submitted_at
                                          ).toLocaleDateString()}
                                        </p>
                                        <button
                                          className="view-comparison-btn"
                                          onClick={() =>
                                            handleOpenComparison(s, ch)
                                          }
                                        >
                                          👁 View Comparison
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <p className="submitted-date">
                                          Not submitted
                                        </p>
                                        <span className="status-badge pending">
                                          Pending
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="no-submissions">
                                No student submissions yet.
                              </p>
                            )}
                          </div>
                        </details>
                      </div>
                    ))
                  ) : (
                    <p>No challenges created yet.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Comparison Modal */}
        {comparisonOpen && selectedStudent && (
          <div className="tcv-modal-overlay">
            <div className="tcv-modal">
              <div className="tcv-modal-header">
                <h2>Cost Estimate Comparison</h2>
                <button onClick={() => setComparisonOpen(false)}>✖</button>
              </div>

              <p>
                {selectedStudent.name} • {selectedStudent.challengeName}
              </p>

              {aiAccuracy && (
                  <div className="tcv-accuracy-section">
                    <h3>🤖 AI Accuracy (Gemini)</h3>

                    <div className="tcv-accuracy-content">
                      <div
                        className="tcv-accuracy-percentage"
                        style={{ color: "#3b82f6" }}
                      >
                        <span className="tcv-accuracy-value">
                          {aiAccuracy.final_accuracy.toFixed(2)}%
                        </span>
                      </div>

                      <p className="tcv-accuracy-conclusion">
                        Gemini evaluated the similarity between the student's estimate and the AI estimate.
                      </p>

                      <div className="tcv-accuracy-details">
                        <span>
                          Description Match:{" "}
                          <strong>{aiAccuracy.description_accuracy}%</strong>
                        </span>
                        <span>
                          Quantity Match:{" "}
                          <strong>{aiAccuracy.quantity_accuracy}%</strong>
                        </span>
                        <span>
                          Unit Match:{" "}
                          <strong>{aiAccuracy.unit_accuracy}%</strong>
                        </span>
                        <span>
                          Unit Price Match:{" "}
                          <strong>{aiAccuracy.unit_price_accuracy}%</strong>
                        </span>
                        <span>
                          Total Cost Accuracy:{" "}
                          <strong>{aiAccuracy.total_cost_accuracy}%</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                )}


              <div className="tcv-comparison-grid">
                <div className="tcv-comparison-col">
                  <ComparisonTable
                    title="📘 Student Estimates"
                    data={studentData}
                  />
                </div>
                <div className="tcv-comparison-col">
                  <ComparisonTable title="🤖 AI Estimates" data={aiData} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
