import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import Sidebar from "../Sidebar/Sidebar";
import { supabase } from "../../supabaseClient";
import './ReadingMaterials.css';

function ReadingMaterials() {
  const [materials, setMaterials] = useState([]);
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

  // Get reading materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch("http://localhost:8000/reading-materials");
        const data = await response.json();

        if (!response.ok) throw new Error(data.detail || "Failed to fetch materials");

        const sorted = (data || []).sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at);
          const dateB = new Date(b.updated_at || b.created_at);
          return dateB - dateA;
        });

        setMaterials(sorted);
      } catch (error) {
        console.error("Error fetching materials:", error);
      }
    };

    fetchMaterials();
  }, []);

  const handleAddClick = () => {
    navigate('/add-reading-material');
  };

  const handleEdit = (material) => {
    navigate('/add-reading-material', { state: { material } });
  };

  const handleDelete = async (materialId) => {
    const confirm = window.confirm('Are you sure you want to delete this material?');
    if (!confirm) return;

    try {
      const response = await fetch(`http://localhost:8000/reading-materials/${materialId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Delete failed");
      }

      setMaterials((prev) => prev.filter((m) => m.id !== materialId));
      alert("Deleted successfully.");
    } catch (error) {
      console.error("Error deleting material:", error);
      alert(`Failed to delete: ${error.message}`);
    }
  };

  return (
    <div className="readingmaterial-wrapper">
      <Sidebar />
      <div className="readingmaterial-container">
        <div className="readingmaterial-header">
          <div>
            <h1>READING MATERIALS</h1>
            <p>Browse all available reading materials.</p>
          </div>

          {userRole === "teacher" && (
            <button className="add-section-btn" onClick={handleAddClick}>
              + Add Reading Material
            </button>
          )}
        </div>

        {materials.length === 0 ? (
          <p style={{ color: "#888", marginTop: "20px" }}>No reading materials available yet.</p>
        ) : (
          materials.map((material) => (
            <div key={material.id} className="readingmaterial-section-card">
              <div className="readingmaterial-card-header">
                <h2
                  style={{ cursor: "pointer", color: "#007bff" }}
                  onClick={() => navigate(`/reading-materials/${material.id}`)}
                >
                  {material.title}
                </h2>

                {userRole === "teacher" && (
                  <div>
                    <button className="edit-btn" onClick={() => handleEdit(material)}>
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(material.id)}
                      style={{ marginLeft: "10px" }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {userRole === "teacher" && (
                <p style={{ fontSize: "0.85rem", color: "#888" }}>
                  {material.updated_at
                    ? `Updated on: ${new Date(material.updated_at).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })} (${formatDistanceToNow(new Date(material.updated_at), { addSuffix: true })})`
                    : `Created on: ${new Date(material.created_at).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })} (${formatDistanceToNow(new Date(material.created_at), { addSuffix: true })})`}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ReadingMaterials;
