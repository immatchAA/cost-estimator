import React from "react";
import '../MaterialSearch/MaterialTable.css';
import Sidebar from '../Sidebar/Sidebar';

function MaterialTable ({materials}) {
    return (
        <div className="table-wrapper">
            <div className="table-controls">
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
                            <td>{item.brand}</td>
                            <td>{item.unit}</td>
                            <td>{item.price}</td>
                            <td>{item.location}</td>
                            <td>{item.vendor}</td>
                            <td>
                                {item.gmaps_link ? (
                                    <a href={item.gmaps_link} target="_blank" rel="noreferrer">
                                        📍
                                    </a>
                                    ) : 'N/A'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default MaterialTable;