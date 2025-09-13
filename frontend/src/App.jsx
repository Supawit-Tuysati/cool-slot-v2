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
import BookingFormEdit from './pages/BookingFormEdit';
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
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <BookingsDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-booking"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <BookingForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-booking/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <BookingFormEdit />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/fridge-management"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <FridgeManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-fridge"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <FridgeForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-fridge/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <FridgeFormEdit />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/departments"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Departments />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <UserManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-user"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <UserForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-user/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <UserFromEdit />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-management"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <BookingManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notification-management"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <NotificationManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          {/* <Route path="/simple" element={
            <ProtectedRoute>
              <MainLayout><SimplePages /></MainLayout>
            </ProtectedRoute>
          } /> */}
          {/* Catch All */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
