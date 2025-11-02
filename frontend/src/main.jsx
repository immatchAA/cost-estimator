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

import ReadingMaterials from "./components/ReadingMaterials/ReadingMaterials.jsx";
import ReadingMaterialView from "./components/ReadingMaterials/ReadingMaterialView.jsx";
import AddReadingMaterial from "./components/AddReadingMaterial/AddReadingMaterial.jsx";
import UploadFile from "./components/CostEstimates/UploadChallenge.jsx";

import StudentDashboard from "./components/StudentDashboard/StudentDashboard.jsx";
import Class from "./components/Class/Class.jsx";
import ClassView from "./components/Class/ClassView.jsx";
import ClassManagement from "./components/ClassManagement/ClassManagement.jsx";
import AllChallenges from "./components/StudentChallenges/AllChallenges.jsx";

import TeacherDashboard from "./components/TeacherDashboard/TeacherDashboard.jsx";
import ProtectedRouteTeacher from "./components/ProtectedRoute/ProtectedRouteTeacher";
import ProtectedRouteStudent from "./components/ProtectedRoute/ProtectedRouteStudent";
import CostEstimationChallenge from "./components/StudentChallenges/CostEstimationChallenge.jsx";
import TeacherChallengeView from "./components/CostEstimates/TeacherChallengeView.jsx";
import ClassInsights from "./components/TeacherDashboard/ClassInsights.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />

        {/* User Management */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard */}
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRouteTeacher>
              {" "}
              <TeacherDashboard />{" "}
            </ProtectedRouteTeacher>
          }
        />

        {/* Account Settings - Both Users */}
        <Route path="/AccountE" element={<AccountE />} />

        {/* Module 2 Real-Time Material Pricing Engine */}
        <Route path="/material-search" element={<MaterialSearch />} />
        <Route path="/material-table" element={<MaterialTable />} />

        <Route path="/reading-materials" element={<ReadingMaterials />} />
        <Route
          path="/reading-materials/:id"
          element={<ReadingMaterialView />}
        />
        <Route path="/add-reading-material" element={<AddReadingMaterial />} />

        {/* Module 1 - For Teachers Only */}

        <Route
          path="/uploadChallenge"
          element={
            <ProtectedRouteTeacher>
              {" "}
              <UploadFile />{" "}
            </ProtectedRouteTeacher>
          }
        />
        <Route
          path="/teacher-challenges/:challengeId"
          element={<TeacherChallengeView />}
        />
        <Route
          path="/class-insights"
          element={
            <ProtectedRouteTeacher>
              {" "}
              <ClassInsights />{" "}
            </ProtectedRouteTeacher>
          }
        />

        {/* Module 1 - For Students Only */}
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRouteStudent>
              {" "}
              <StudentDashboard />{" "}
            </ProtectedRouteStudent>
          }
        />
        <Route
          path="/student-challenges"
          element={
            <ProtectedRouteStudent>
              {" "}
              <CostEstimationChallenge />{" "}
            </ProtectedRouteStudent>
          }
        />
        <Route
          path="/student-challenges/:challengeId"
          element={<CostEstimationChallenge />}
        />
        <Route
          path="/student-challenges-details"
          element={
            <ProtectedRouteStudent>
              <AllChallenges />
            </ProtectedRouteStudent>
          }
        />

        {/* Class Management Routes */}
        <Route path="/class-management" element={<ClassManagement />} />
        <Route path="/my-classes" element={<Class />} />
        <Route
          path="/class/:classId"
          element={
            <ProtectedRouteStudent>
              <ClassView />
            </ProtectedRouteStudent>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
