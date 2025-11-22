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
  const [modal, setModal] = useState({ open: false, title: "", message: "", confirm: false, onConfirm: null });


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
        const apiBaseNoPrefix = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace('/api', '') || "http://localhost:8000";
        const response = await fetch(`${apiBaseNoPrefix}/reading-materials`);
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

  const handleDelete = (materialId) => {
    setModal({
      open: true,
      message: "Are you sure you want to delete this shi?",
      confirm: true,
      onConfirm: async () => {
        try {
          const apiBaseNoPrefix = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace('/api', '') || "http://localhost:8000";
          const response = await fetch(`${apiBaseNoPrefix}/reading-materials/${materialId}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Delete failed");
          }

          setMaterials((prev) => prev.filter((m) => m.id !== materialId));

          setModal({
            open: true,
            title: "Deleted",
            message: "Reading material deleted successfully.",
            confirm: false,
          });
        } catch (error) {
          console.error("Error deleting material:", error);
          setModal({
            open: true,
            title: "Error",
            message: `Failed to delete: ${error.message}`,
            confirm: false,
          });
        }
      }
    });
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

        {modal.open && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>{modal.title}</h3>
              <p>{modal.message}</p>
              <div className="modal-actions">
                {modal.confirm ? (
                  <>
                    <button
                      onClick={() => {
                        modal.onConfirm();
                        setModal({ open: false });
                      }}
                      className="modal-btn confirm"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setModal({ open: false })}
                      className="modal-btn cancel"
                    >
                      No
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setModal({ open: false })}
                    className="modal-btn"
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ReadingMaterials;
