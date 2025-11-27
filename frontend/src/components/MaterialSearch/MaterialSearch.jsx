import React, { useState, useEffect } from "react";
import axios from "axios";
import MaterialTable from "./MaterialTable";
import "./MaterialSearch.css";
import Sidebar from "../Sidebar/Sidebar";
import { supabase } from "../../supabaseClient";

function MaterialSearch() {
  const [query, setQuery] = useState("");
  const [aiResults, setAiResults] = useState([]);
  const [teacherMaterials, setTeacherMaterials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    material: "",
    brand: "",
    price: "",
    vendor: "",
    location: "",
    unit: "",
  });

  const [userRole, setUserRole] = useState("");
  const teacherId = localStorage.getItem("user_id");


  useEffect(() => {
    const loadRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log("No Supabase user logged in");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("auth_id", user.id)
        .single();

      if (error) {
        console.error("Error loading role:", error);
        return;
      }

      setUserRole(data.role?.toLowerCase() || "");
      console.log("Loaded role from users table:", data.role);
    };

    loadRole();
  }, []);


  useEffect(() => {
    if (teacherId && userRole === "teacher") {
      fetchTeacherMaterials(teacherId);
    }
  }, [teacherId, userRole]);

  const fetchTeacherMaterials = async (teacherId) => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      const res = await axios.get(`${apiBase}/materials/teacher/${teacherId}`);
      setTeacherMaterials(res.data);
    } catch (err) {
      console.error("Error fetching teacher materials:", err);
    }
  };

  // AI search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const apiBaseNoPrefix = (import.meta.env.VITE_API_URL || "http://localhost:8000/api")
        .replace("/api", "");
      const res = await axios.post(`${apiBaseNoPrefix}/search_price`, {
        material: query,
      });
      setAiResults(res.data);
    } catch (err) {
      console.error("Search error:", err);
      alert("AI search failed.");
    }
  };

  // Add teacher material
  const handleAddMaterial = async (e) => {
    e.preventDefault();

    try {
      const payload = { ...newMaterial, teacher_id: teacherId };
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

      await axios.post(`${apiBase}/materials/add`, payload);

      alert("Material added!");
      setShowModal(false);

      setNewMaterial({
        material: "",
        brand: "",
        price: "",
        vendor: "",
        location: "",
        unit: "",
      });

      fetchTeacherMaterials(teacherId);
    } catch (err) {
      console.error("Add material error:", err);
      alert("Failed to add material.");
    }
  };

  return (
    <div className="material-search-page">
      <Sidebar />
      <div className="search-content">

        {/* HEADER */}
        <header className="virtualstore-header">
          <h1>Virtual Store</h1>
          <p>Explore real-time price searches powered by AI</p>
        </header>

        {/* SEARCH FORM */}
        <form className="virtualstore-row" onSubmit={handleSearch}>
          <div className="left-controls">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search Material Here..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select>
              <option>Category</option>
            </select>
          </div>
          <button type="submit" className="primary-btn">Search</button>
        </form>

        {/* AI RESULTS */}
        <div className="table-section">
          <h2>AI Search Results</h2>
          <MaterialTable materials={aiResults} tableType="ai" />
        </div>

        {/* TEACHER MATERIALS */}
        <div className="table-section">
          <div className="table-header">
            <h2>{userRole === "teacher" ? "My Materials" : "All Teacher Materials"}</h2>

            {userRole === "teacher" && (
              <button className="add-btn" onClick={() => setShowModal(true)}>
                + Add Material
              </button>
            )}
          </div>
          <MaterialTable
            materials={teacherMaterials}
            tableType="teacher"
            onUpdate={fetchTeacherMaterials}
          />
        </div>

        {/* MODAL */}
         {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Add New Material</h2>
              <form onSubmit={handleAddMaterial}>
                <input
                  type="text"
                  placeholder="Material"
                  value={newMaterial.material}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, material: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Brand"
                  value={newMaterial.brand}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, brand: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={newMaterial.unit}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, unit: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Price"
                  value={newMaterial.price}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, price: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Vendor"
                  value={newMaterial.vendor}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, vendor: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={newMaterial.location}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, location: e.target.value })
                  }
                  required
                />

                <div className="modal-buttons">
                  <button type="submit" className="primary-btn">
                    Save
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MaterialSearch;
