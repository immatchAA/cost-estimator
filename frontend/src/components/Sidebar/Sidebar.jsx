import React from "react";

function Sidebar () {
    return (
        <div className="custom-sidebar">
            <div className="custom-profile">
                <div className="custom-profile-pic"></div>
                <div className="custom-profile-info">
                    <h3>Richelle</h3>
                    <p>Student</p>
                </div>
            </div>

            <hr className="custom-divider"/>

            <div className="custom-search-box">
                <input type ="text" placeholder="Search..."/>
            </div>

            <nav className="custom-nav-links">
                <Link to="/dashboard" className="custom-nav-item">
                    <FaHome className="custom-icon" /> Dashboard
                </Link>

                <Link className="custom-nav-item">
                    <FaChartLine className="custom-icon" /> Student Progress
                </Link>

                <Link className="custom-nav-item">
                    <FaPencilRuler className="custom-icon" /> Create Design
                </Link>

            </nav>
        </div>
    )

}

export default Sidebar;