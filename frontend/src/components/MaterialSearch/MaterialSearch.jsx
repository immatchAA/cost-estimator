import React, { useState } from "react";
import axios from "axios";
import MaterialTable from "./MaterialTable";
import "./MaterialSearch.css";
import Sidebar from "../Sidebar/Sidebar";

function MaterialSearch() {
  const [material, setMaterial] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = material.trim();
    if(!q) return;
    try {
      const res = await axios.post("http://127.0.0.1:8000/search_price", {
        material: material,
      });
      setResults(res.data);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  return (
    <div className="material-search-page">
      <Sidebar />

      <div className="search-content">
        <div className="search-bar">
          <header className="virtualstore-header">
            <h1>Virtual Store</h1>
            <p>Explore real time price searches Powered by AI</p>
          </header>
          <form className="virtualstore-row" onSubmit={handleSearch}>
            <div className="left-controls">
              <div className="search-input-wrap">
                <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search Material Here.."
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                  />
              </div>
                <select><option>Category</option></select>
                <select><option>All</option></select> 
            </div>

            <button type="submit" className="primary-btn">Search</button>
          </form>

        </div>

        <MaterialTable materials={results} />
      </div>
    </div>
  );
}

export default MaterialSearch;
