import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // optional for dropdowns, modals
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { SemesterProvider, useSemester } from "./MyComponents/semesterContext";

import Footer from './MyComponents/Footer';
import Header from './MyComponents/Header';
import Login from './MyComponents/Login';
import PendingApprovals from './MyComponents/PendingApproval';
import Profile from './MyComponents/Profile';
import ProtectedRoute from './MyComponents/ProtectedRoute';
import SemesterPage from './MyComponents/Semester';
import Signup from './MyComponents/Signup';
import SignupGuard from './MyComponents/SignupGaurd';
import SubjectPage from './MyComponents/SubjectPage';

function AppContent() {
  const location = useLocation();
  const { dept, sem, loading } = useSemester();
  const hideHeader = ['/login', '/signup'].includes(location.pathname);

  // Wait for context to load
  if (loading) return null;

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      {!hideHeader && <Header />}

      <Routes>
        <Route
          path="/"
          element={dept && sem ? <Navigate to={`/dept/${dept}/sem/${sem}`} /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<SignupGuard><Login /></SignupGuard>} />
        <Route path="/signup" element={<SignupGuard><Signup /></SignupGuard>} />

        <Route path="/dept/:dept/sem/:sem" element={<ProtectedRoute><SemesterPage /></ProtectedRoute>} />
        <Route path="/dept/:dept/sem/:sem/profile" element={<Profile />} />
        <Route path="/admin/pending-approvals" element={<PendingApprovals />} />
        <Route path="/admin/:dept/sem/:sem/subject/:subjectName" element={<SubjectPage />} />
      </Routes>

      <Footer />
    </>
  );
}

export default function App() {
  return (
    <SemesterProvider>
      <AppContent />
    </SemesterProvider>
  );
}
