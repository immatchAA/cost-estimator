import React from "react";

function MaterialTable ({materials}) {
    return (
        <div className="table-wrapper">
            <div className="table-controls">
                <input type ="text" placeholder="Search for Materials" className="search-input"/>
                <button className="add-btn">Add Material</button>
            </div>
            
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
                    {materials.map((item,index) => (
                        <tr key={index}>
                            <td>{item.material}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}