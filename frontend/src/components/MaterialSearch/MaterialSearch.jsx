import React, { useState, useEffect } from "react";
import axios from "axios";
import MaterialTable from "./MaterialTable";
import "./MaterialSearch.css";
import Sidebar from "../Sidebar/Sidebar";

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

  const userRole = (localStorage.getItem("role") || "").toLowerCase();
  const teacherId = localStorage.getItem("user_id");

  // 🧩 Fetch teacher materials on load
  useEffect(() => {
    if (teacherId && userRole === "teacher") fetchTeacherMaterials(teacherId);
  }, [teacherId, userRole]);

  const fetchTeacherMaterials = async (teacherId) => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/materials/teacher/${teacherId}`
      );
      setTeacherMaterials(res.data);
    } catch (err) {
      console.error("Error fetching teacher materials:", err);
    }
  };

  // 🔍 AI Search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      const res = await axios.post("http://127.0.0.1:8000/search_price", {
        material: query,
      });
      setAiResults(res.data);
    } catch (err) {
      console.error("Search error:", err);
      alert("AI search failed.");
    }
  };

  // ➕ Add new material (for teachers)
  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newMaterial, teacher_id: teacherId };
      await axios.post("http://127.0.0.1:8000/api/materials/add", payload);
      alert("✅ Material added successfully!");
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
        <header className="virtualstore-header">
          <h1>Virtual Store</h1>
          <p>Explore real-time price searches powered by AI</p>
        </header>

        {/* 🔎 Search form */}
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
          <button type="submit" className="primary-btn">
            Search
          </button>
        </form>

        {/* 🧠 AI Results Table */}
        <div className="table-section">
          <h2>AI Search Results</h2>
          <MaterialTable materials={aiResults} tableType="ai" />
        </div>

        {/* 👩‍🏫 Teacher Materials Table */}
        <div className="table-section">
          <div className="table-header">
            <h2>
              {userRole === "teacher" ? "My Materials" : "All Teacher Materials"}
            </h2>

            {userRole === "teacher" && (
              <button
                type="button"
                className="add-btn"
                onClick={() => setShowModal(true)}
              >
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

        {/* ➕ Modal for Adding Material */}
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
