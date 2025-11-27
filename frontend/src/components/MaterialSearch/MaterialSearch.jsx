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
  const [teacherId, setTeacherId] = useState(null);

  // 🚀 Load both userId + role in ONE unified effect (prevents race conditions)
  useEffect(() => {
    const loadUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No logged-in user");
        return;
      }

      // Set teacherId (same as auth user.id)
      setTeacherId(user.id);

      // Fetch role from users table
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("auth_id", user.id)
        .single();

      if (error) {
        console.error("Error loading role:", error);
        return;
      }

      const role = data.role?.toLowerCase() || "";
      setUserRole(role);

      console.log("Loaded user:", { teacherId: user.id, role });
    };

    loadUserData();
  }, []);

  // 🚀 Fetch teacher materials once teacherId & role are ready
  useEffect(() => {
    if (teacherId && userRole === "teacher") {
      fetchTeacherMaterials(teacherId);
    }
  }, [teacherId, userRole]);

  const fetchTeacherMaterials = async (teacherId) => {
    try {
      const apiBase =
        import.meta.env.VITE_API_URL || "http://localhost:8000/api";

      const res = await axios.get(`${apiBase}/materials/teacher/${teacherId}`);
      setTeacherMaterials(res.data);
    } catch (err) {
      console.error("Error fetching teacher materials:", err);
    }
  };

  // 🔍 AI material search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const base = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";

      const res = await axios.post(`${base}/search_price`, {
        material: query,
      });

      setAiResults(res.data);
    } catch (err) {
      console.error("Search error:", err);
      alert("AI search failed.");
    }
  };

  // ➕ Add new material (teachers only)
  const handleAddMaterial = async (e) => {
    e.preventDefault();

    if (!teacherId) {
      alert("User is not fully loaded yet. Please wait 1–2 seconds then retry.");
      return;
    }

    try {
      const payload = { ...newMaterial, teacher_id: teacherId };
      const apiBase =
        import.meta.env.VITE_API_URL || "http://localhost:8000/api";

      await axios.post(`${apiBase}/materials/add`, payload);

      alert("Material added!");
      setShowModal(false);

      // Reset form
      setNewMaterial({
        material: "",
        brand: "",
        price: "",
        vendor: "",
        location: "",
        unit: "",
      });

      // Reload materials
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

        {/* SEARCH BAR */}
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

        {/* AI RESULTS */}
        <div className="table-section">
          <h2>AI Search Results</h2>
          <MaterialTable materials={aiResults} tableType="ai" userRole={userRole} />
        </div>

        {/* TEACHER MATERIALS */}
        <div className="table-section">
          <div className="table-header">
            <h2>
              {userRole === "teacher" ? "My Materials" : "All Teacher Materials"}
            </h2>

            {/* Only teachers see button */}
            {userRole === "teacher" && (
              <button className="add-btn" onClick={() => setShowModal(true)}>
                + Add Material
              </button>
            )}
          </div>

          <MaterialTable
            materials={teacherMaterials}
            tableType="teacher"
            userRole={userRole}
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
