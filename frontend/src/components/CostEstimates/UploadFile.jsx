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
                    <h1>AI Structural Cost Estimation</h1>
                    <p>Automated Floor Plan Analysis and Cost Estimates by AI</p>
                </header>

                <div className="upload-container">
                    <h3 className="upload-title">Upload Floor Plan</h3>
                    <p className="upload-description">Upload your architectural plans to generate an automated Structural Cost Estimates</p>

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
                
                <div className="results-container">
                    <div className="summary-cards">
                        <div className="card project-summary">
  <h5>Project Summary</h5>
  <table className="summary-table">
                                <tbody>
                                <tr>
                                    <td>I. EARTHWORK</td>
                                    <td>P6000</td>
                                </tr>
                                <tr>
                                    <td>II. FORMWORK & SCAFFOLDING</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <td>III. MASONRY WORK</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <td>IV. CONCRETE WORK</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <td>V. STEELWORK</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <td>VI. CARPENTRY WORK</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <td>VII. ROOFING WORK</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <td><strong>TOTAL MATERIAL COST (TC)</strong></td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <td><strong>LABOR COST LC (40% of TC)</strong></td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <td><strong>Contingencies C (5% of (TC+LC))</strong></td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <td><strong>GRAND TOTAL COST</strong></td>
                                    <td>-</td>
                                </tr>
                                </tbody>
                            </table>
                            </div>

                        <div className="analysis-confidence">
                            <h6>Analysis Confidence</h6>
                            <p><strong>Overall Accuracy:</strong> </p>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: '92%'}}></div>
                            </div>
                            <p className="confidence-text">High confidence in structural cost estimation</p>
                        </div>
                    </div>
            

                    <div className="cost-estimate">
                        <h4>Structural Cost Estimates</h4>
                        <table className="cost-estimate-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Description</th>
                                    <th>Quantity</th>
                                    <th>Unit</th>
                                    <th>Unit Price</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>I.</td>
                                    <td>Earthwork</td>
                                </tr>
                                <tr>
                                    <td>II.</td>
                                    <td>Formwork & Scaffolding</td>
                                </tr>
                                <tr>
                                    <td>III.</td>
                                    <td>Masonry Work</td>
                                </tr>
                                <tr>
                                    <td>IV.</td>
                                    <td>Concrete Work</td>
                                </tr>
                                 <tr>
                                    <td>V.</td>
                                    <td>Steelwork</td>
                                </tr>
                                 <tr>
                                    <td>VI.</td>
                                    <td>Carpentry Work</td>
                                </tr>
                                <tr>
                                    <td>VII.</td>
                                    <td>Roofing Work</td>
                                </tr>

                                <tr className="subtotal-row">
                                    <td colSpan={2}><strong>Subtotal</strong></td>
                                </tr>

                                <tr className="total-row">
                                    <td colSpan={2}><strong>Total (incl. 10% contingency)</strong></td>
                                </tr>
                            </tbody>
                        </table>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
};

export default UploadFile;