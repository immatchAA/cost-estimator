import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MaterialTable.css";

function MaterialTable({ materials, tableType, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [classMaterials, setClassMaterials] = useState([]);
  const userRole = (localStorage.getItem("role") || "").toLowerCase();

  // 🔹 Students: Fetch all materials from all teachers
  useEffect(() => {
    const loadMaterials = async () => {
      if (userRole === "student") {
        try {
          console.log("📦 Fetching all teacher materials for student...");
          const res = await axios.get("http://127.0.0.1:8000/api/materials/all");
          setClassMaterials(res.data);
        } catch (err) {
          console.error("❌ Error fetching all materials:", err);
        }
      }
    };

    loadMaterials();
  }, [userRole]);

  const handleEdit = (material) => {
    setEditingId(material.material_id);
    setEditData({ ...material });
  };

  const handleChange = (e, field) => {
    setEditData({ ...editData, [field]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const payload = {
        material: editData.material,
        brand: editData.brand,
        price: editData.price,
        vendor: editData.vendor,
        location: editData.location,
        unit: editData.unit,
      };

      await axios.put(
        `http://127.0.0.1:8000/api/materials/update/${editingId}`,
        payload
      );

      alert("✅ Material updated successfully!");
      setEditingId(null);
      if (onUpdate) {
        const userId = localStorage.getItem("user_id");
        onUpdate(userId);
      }
    } catch (err) {
      console.error("Error updating material:", err);
      alert("Failed to update material.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/materials/delete/${id}`);
      alert("🗑️ Material deleted successfully!");
      if (onUpdate) {
        const userId = localStorage.getItem("user_id");
        onUpdate(userId);
      }
    } catch (err) {
      console.error("Error deleting material:", err);
      alert("Failed to delete material.");
    }
  };

  // 🧩 Display logic:
  // - Teachers: show own materials (from props)
  // - Students: show all materials from all teachers
  const displayMaterials =
    userRole === "student" && tableType === "teacher"
      ? classMaterials
      : materials;

  const hasResults = displayMaterials && displayMaterials.length > 0;

  return (
    <div className="table-wrapper">
      <table className="material-table">
        <thead>
          <tr>
            <th>Material</th>
            <th>Brand</th>
            <th>Unit</th>
            <th>Price</th>
            <th>Location</th>
            <th>Vendor</th>
            <th>Map</th>
            {tableType === "teacher" && userRole === "teacher" && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {hasResults ? (
            displayMaterials.map((item) => (
              <tr key={item.material_id}>
                <td>
                  {editingId === item.material_id ? (
                    <input
                      value={editData.material}
                      onChange={(e) => handleChange(e, "material")}
                    />
                  ) : (
                    item.material
                  )}
                </td>

                <td>
                  {editingId === item.material_id ? (
                    <input
                      value={editData.brand}
                      onChange={(e) => handleChange(e, "brand")}
                    />
                  ) : (
                    item.brand
                  )}
                </td>

                <td>
                  {editingId === item.material_id ? (
                    <input
                      value={editData.unit}
                      onChange={(e) => handleChange(e, "unit")}
                    />
                  ) : (
                    item.unit || "—"
                  )}
                </td>

                <td>
                  {editingId === item.material_id ? (
                    <input
                      value={editData.price}
                      onChange={(e) => handleChange(e, "price")}
                    />
                  ) : (
                    item.price
                  )}
                </td>

                <td>
                  {editingId === item.material_id ? (
                    <input
                      value={editData.location}
                      onChange={(e) => handleChange(e, "location")}
                    />
                  ) : (
                    item.location
                  )}
                </td>

                <td>
                  {editingId === item.material_id ? (
                    <input
                      value={editData.vendor}
                      onChange={(e) => handleChange(e, "vendor")}
                    />
                  ) : (
                    item.vendor
                  )}
                </td>

                <td>
                  {item.gmaps_link ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        item.location || item.gmaps_link
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      📍
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>

                {tableType === "teacher" && userRole === "teacher" && (
                  <td>
                    {editingId === item.material_id ? (
                      <>
                        <button className="save-btn" onClick={handleSave}>
                          Save
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(item.material_id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={tableType === "teacher" && userRole === "teacher" ? 8 : 7}
                className="placeholder"
              >
                {userRole === "student" && tableType === "teacher"
                  ? "No materials available yet."
                  : tableType === "ai"
                  ? "🔍 Search to see AI-generated materials here."
                  : userRole === "teacher"
                  ? "You haven’t added any materials yet."
                  : "No materials found."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default MaterialTable;
