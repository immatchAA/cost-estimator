import React from "react";
import "./MaterialTable.css";

function MaterialTable({ materials }) {
  const hasResults = materials && materials.length > 0;

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
          </tr>
        </thead>
        <tbody>
          {hasResults ? (
            materials.map((item, index) => (
              <tr key={index}>
                <td>{item.material}</td>
                <td>{item.brand}</td>
                <td>{item.unit}</td>
                <td>{item.price}</td>
                <td>{item.location}</td>
                <td>{item.vendor}</td>
                <td>
                  {item.gmaps_link ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location || item.gmaps_link)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      📍
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="placeholder">
                🔍 Start by searching for a material to see results here.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default MaterialTable;
