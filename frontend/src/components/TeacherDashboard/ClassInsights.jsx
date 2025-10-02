import React, { useState, useEffect } from "react";
import "./ClassInsights.css";
import Sidebar from "../Sidebar/Sidebar";
import { supabase } from "../../supabaseClient";
import ComparisonTable from "./ComparisonTable";

export default function ClassInsights() {
  const [openClass, setOpenClass] = useState(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [aiData, setAiData] = useState(null);
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // 1. get logged-in teacher
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not logged in");
        const teacherId = user.id;

        // 2. call backend
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


    const handleOpenComparison = async (student, cls) => {
    setSelectedStudent({ 
        ...student, 
        challengeId: cls.challenge?.challenge_id,
        challengeName: cls.challenge?.challenge_name ?? "No Challenge" 
    });
    setComparisonOpen(true);

    if (cls.challenge?.challenge_id) {
        try {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/cost-estimates/ai/${cls.challenge.challenge_id}`
        );
        const result = await res.json();
        if (result.success) {
            setAiData(result);
        }
        } catch (err) {
        console.error("AI fetch error:", err);
        }
    }

    if (student.id && cls.challenge?.challenge_id) {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/cost-estimates/student/${student.id}/challenge/${cls.challenge.challenge_id}`
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
                onClick={() => setOpenClass(openClass === cls.id ? null : cls.id)}
              >
                <div>
                  <h2>{cls.class_name}</h2>
                  <p className="tcv-class-key">Key: {cls.class_key}</p>
                </div>
                <span>{openClass === cls.id ? "▲" : "▼"}</span>
              </div>

              {/* Expanded Class Body */}
              {openClass === cls.id && (   
                <div className="tcv-class-body">
                    {/* Challenge Box */}
                    {cls.challenge ? (
                    <div className="tcv-challenge-box">
                        <h3>{cls.challenge.challenge_name}</h3>
                        <p>
                        {cls.challenge.challenge_instructions.length > 100
                            ? cls.challenge.challenge_instructions.substring(0, 150) + "..."
                            : cls.challenge.challenge_instructions}
                        </p>

                        <p>
                        Due:{" "}
                        {cls.challenge.due_date
                            ? new Date(cls.challenge.due_date).toLocaleDateString()
                            : "No due date"}
                        </p>
                    </div>
                    ) : (
                    <p>No challenge created yet.</p>
                    )}

                    {/* Students */}
                    <h4>👩‍🎓 Enrolled Students</h4>
                    <ul className="tcv-student-list">
                    {cls.students.length === 0 ? (
                        <li>No accepted students yet.</li>
                    ) : (
                        cls.students.map((student) => (
                        <li key={student.id} className="tcv-student-row">
                            <div>
                            <p className="tcv-student-name">{student.name}</p>
                            <p className="tcv-student-email">{student.email}</p>
                            </div>
                            <div className="tcv-student-actions">
                            <button
                                className="tcv-view-btn"
                                onClick={() => handleOpenComparison(student, cls)}
                            >
                                👁 View Comparison
                            </button>
                            </div>
                        </li>
                        ))
                    )}
                    </ul>
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

 
              <div className="tcv-comparison-grid">
                <div className="tcv-comparison-col">
                    <ComparisonTable title="📘 Student Estimates" data={studentData} />
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
