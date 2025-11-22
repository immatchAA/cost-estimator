import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import "./ReadingMaterialView.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import { supabase } from "../../supabaseClient";

function ReadingMaterialView() {
  const { id } = useParams();
  const [material, setMaterial] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  // Get user role
  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile) setUserRole(profile.role);
    };

    fetchUserRole();
  }, []);

  // Get reading material
  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const apiBaseNoPrefix = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace('/api', '') || "http://localhost:8000";
        const response = await fetch(`${apiBaseNoPrefix}/reading-materials/${id}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.detail || "Failed to fetch material");

        setMaterial(data);
        setSections(data.sections || []);
      } catch (error) {
        console.error("Error fetching material:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [id]);

  if (loading) return <p>Loading material...</p>;
  if (!material) return <p>Material not found.</p>;

  return (
    <div className="readingmaterialview-wrapper">
      <Sidebar />
      <div className="readingmaterialview-container">
        <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
        <h1 className="readingmaterialview-title">{material.title}</h1>

        {userRole === "teacher" && (
          <p className="readingmaterialview-meta">
            {material.updated_at
              ? `Updated on ${new Date(material.updated_at).toLocaleString()}`
              : `Created on ${new Date(material.created_at).toLocaleString()}`}
          </p>
        )}

        {sections.length === 0 ? (
          <p>No content available.</p>
        ) : (
          sections.map((section, idx) => (
            <div key={idx} className="readingmaterialview-section">
              {section.section_slug && (
                <h2 className="readingmaterialview-section-title">{section.section_slug}</h2>
              )}
              <div className="readingmaterial-section-card">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {section.content}
                </ReactMarkdown>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ReadingMaterialView;
