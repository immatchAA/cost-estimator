import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";
import LoginPage from "./components/Login/LoginForm.jsx";
import RegisterPage from "./components/Register/RegisterForm.jsx";

import AccountE from "./components/UserProfile/accountE.jsx";

import MaterialSearch from "./components/MaterialSearch/MaterialSearch.jsx";
import MaterialTable from "./components/MaterialSearch/MaterialTable.jsx";

import ReadingMaterials from "./components/ReadingMaterials/ReadingMaterials.jsx"
import AddReadingMaterial from "./components/AddReadingMaterial/AddReadingMaterial.jsx"
import UploadFile from "./components/CostEstimates/UploadChallenge.jsx";
import Dashboard from "./components/TeacherDashboard/Dashboard.jsx";
import EstimatesTable from "./components/CostEstimates/EstimatesTable.jsx";
import StudentDashboard from "./components/StudentDashboard/StudentDashboard.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />

        {/* User Management */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard */}
        <Route path="/teacher-dashboard" element={<Dashboard />} />

        {/* Account Settings - Both Users */}
        <Route path="/AccountE" element={<AccountE />} />

        {/* Module 2 Real-Time Material Pricing Engine */}
        <Route path="/material-search" element={<MaterialSearch />} />
        <Route path="/material-table" element={<MaterialTable />} />

        <Route path="/reading-materials" element={<ReadingMaterials />} />
        <Route path="/add-reading-material" element={<AddReadingMaterial />} />

        {/* Module 1 - For Teachers Only */}
        <Route path="/uploadChallenge" element= {<UploadFile />}/>
        <Route path="/table" element= {<EstimatesTable />}/>

        {/* Module 1 - For Students Only */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
