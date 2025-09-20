import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FridgeManagement from "./pages/FridgeManagement";
import FridgeAll from "./pages/BookingFridge";
import FridgeForm from "./pages/FridgeForm";
import FridgeFormEdit from "./pages/FridgeFormEdit";
import BookingsDashboard from "./pages/BookingsDashboard";
import BookingForm from "./pages/BookingForm";
import BookingManagement from "./pages/BookingManagement";
import UserManagement from "./pages/UserManagement";
import UserForm from "./pages/UserForm";
import UserFromEdit from "./pages/UserFromEdit";
import NotificationManagement from "./pages/NotificationManagement";
import Departments from "./pages/Departments";
import BookingFormEdit from "./pages/BookingFormEdit";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin", "user","cleaner"]}>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
               <ProtectedRoute allowedRoles={["admin", "user","cleaner"]}>
                <MainLayout>
                  <BookingsDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-booking/:fridge_id"
            element={
                 <ProtectedRoute allowedRoles={["admin", "user","cleaner"]}>
                <MainLayout>
                  <BookingForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-booking/:fridge_id"
            element={
                 <ProtectedRoute allowedRoles={["admin", "user","cleaner"]}>
                <MainLayout>
                  <BookingFormEdit />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-fridge"
            element={
              <ProtectedRoute allowedRoles={["admin", "user","cleaner"]}>
                <MainLayout>
                  <FridgeAll />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fridge-management"
            element={
               <ProtectedRoute allowedRoles={["admin"]}>
                <MainLayout>
                  <FridgeManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-fridge"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <MainLayout>
                  <FridgeForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-fridge/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <MainLayout>
                  <FridgeFormEdit />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-management"
            element={
                 <ProtectedRoute allowedRoles={["admin","cleaner"]}>
                <MainLayout>
                  <BookingManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/departments"
            element={
                 <ProtectedRoute allowedRoles={["admin"]}>
                <MainLayout>
                  <Departments />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <MainLayout>
                  <UserManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-user"
            element={
               <ProtectedRoute allowedRoles={["admin"]}>
                <MainLayout>
                  <UserForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-user/:id"
            element={
                 <ProtectedRoute allowedRoles={["admin"]}>
                <MainLayout>
                  <UserFromEdit />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notification-management"
            element={
                 <ProtectedRoute allowedRoles={["admin", "cleaner"]}>
                <MainLayout>
                  <NotificationManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          {/* Catch All */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
