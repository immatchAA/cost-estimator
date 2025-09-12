import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";
import LoginPage from "./components/Login/LoginForm.jsx";
import RegisterPage from "./components/Register/RegisterForm.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import AccountE from "./components/UserProfile/accountE.jsx";

import MaterialSearch from "./components/MaterialSearch/MaterialSearch.jsx";
import MaterialTable from "./components/MaterialSearch/MaterialTable.jsx";

import ReadingMaterials from "./components/ReadingMaterials/ReadingMaterials.jsx"
import AddReadingMaterial from "./components/AddReadingMaterial/AddReadingMaterial.jsx"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />

        {/* User Management */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Account Settings */}
        <Route path="/AccountE" element={<AccountE />} />

        {/* Module 2 Real-Time Material Pricing Engine */}
        <Route path="/material-search" element={<MaterialSearch />} />
        <Route path="/material-table" element={<MaterialTable />} />

        <Route path="/reading-materials" element={<ReadingMaterials />} />
        <Route path="/add-reading-material" element={<AddReadingMaterial />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
