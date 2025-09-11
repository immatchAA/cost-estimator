import React, { useState } from "react";
import axios from "axios";
import MaterialTable from "./MaterialTable";
import "./MaterialSearch.css";
import Sidebar from "../Sidebar/Sidebar";

function MaterialSearch() {
  const [material, setMaterial] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const res = await axios.post("http://localhost:5000/search_price", {
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

      <div className="searc-content">
        <div className="search-bar">
          <header className="virtualstore-header">
            <h1>Virtual Store</h1>
            <p>Explore real time price searches Powered by AI</p>
          </header>
          <div className="virtualstore-controls">
            <input
              type="text"
              placeholder="Enter material name"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
          </div>
        </div>

        <MaterialTable materials={results} />
      </div>
    </div>
  );
}

export default MaterialSearch;
