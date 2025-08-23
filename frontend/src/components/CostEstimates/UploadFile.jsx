import React, { useState, useRef} from "react";
import Sidebar from "../Sidebar/Sidebar";
import '../CostEstimates/UploadFile.css';


const UploadFile = () => {
    const [fileName, setFileName] = useState(null);
    const fileInputRef = useRef();

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if(file) {
            setFileName(file.name);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if(file){
            setFileName(file.name);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <div className="dashboard-wrapper">
        <Sidebar/>
        <div className="page-main">
            <div className="page-content">
                <header className="page-header">
                    <h1>ARchiquest</h1>
                    <p>Automated Floor Plan Analysis and Cost Estimates by AI</p>
                </header>

                <div className="upload-container">
                    <h3 className="upload-title">Instructor Portal</h3>
                    <p className="upload-description">Upload architectural plans and details to create a new student challenge.</p>

               <div className="challenge-details">
                    <label htmlFor="planName">Challenge Name</label>
                    <input
                        type="text"
                        id="planName"
                        name="planName"
                        className="challenge-input"
                        placeholder="Residential Bungalow..."
                        onChange={(e) => setPlanName(e.target.value)}
                    />
                    </div>

                    <div className="challenge-details">
                    <label htmlFor="planDescription">Challenge Description</label>
                    <textarea
                        id="planDescription"
                        name="planDescription"
                        className="challenge-textarea"
                        placeholder="Based on the uploaded floor plan and elevation drawing, students are expected to analyze the drawings..."
                        rows="4"
                    ></textarea>
                    </div>

                    <div className="challenge-details">
                    <label htmlFor="planInstructions">Instructions</label>
                    <textarea
                        id="planInstructions"
                        name="planInstructions"
                        className="challenge-textarea"
                        placeholder="Put instructions here"
                        rows="6"
                    ></textarea>
                </div>


                <div className="upload-flex-wrapper">
                <div
                    className="drag-drop-box"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current.click()}
                >
    
                <div className="upload-icon">⬆️</div>
                    <p className="drag-text">
                        Drag & Drop Floor Plan <br/>
                        <span className="or-text">or Click to browse files</span>
                    </p>
                    
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{display: "none"}}
                        onChange={handleFileSelect}
                        accept=".pdf, .jpg, .jpeg, .png, .dwg"
                    />

                    {fileName && <p className="file-name">Selected: {fileName}</p>}
                     <button className="select-btn" onClick={() => fileInputRef.current.click()}>
                        Select Floor Plan
                    </button>
                    <p className="supported-formats"> 
                        Supported formats: PDF, JPG, PNG <br/>
                        Maximum file size: 10MB
                    </p>
                </div>

                <div className="right-container">
                    <h3>How it Works</h3>
                    <ol className="how-it-works-list">
                        <li>
                            <strong>Upload Floor Plan</strong>
                            <br/>
                            <span>Select and upload your architectural drawing</span>
                        </li>
                        <li>
                            <strong>AI Analysis</strong>
                            <br/>
                            <span>Our AI extracts structural elements automatically</span>
                        </li>
                        <li>
                            <strong>Generate Cost Estimates</strong>
                            <br/>
                            <span>Received detailed Cost Estimates</span>
                        </li>
                    </ol>
                </div>
                   </div>
                
    
            </div>
            </div>
        </div>
        </div>
    );
};

export default UploadFile;