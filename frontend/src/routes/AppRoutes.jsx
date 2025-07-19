import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Expenses from "../pages/Expenses";
import AdminExpenses from "../pages/AdminExpenses";
import AdminDashboard from "../pages/AdminDashboard";

export default function AppRoutes() {
  const { token, user } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/expenses" /> : <Login />}
        />
        <Route
          path="/signup"
          element={token ? <Navigate to="/expenses" /> : <Signup />}
        />
        <Route
          path="/expenses"
          element={token ? <Expenses /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/expenses"
          element={
            user && user.role === "admin" ? (
              <AdminExpenses />
            ) : (
              <Navigate to="/expenses" />
            )
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            user && user.role === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/expenses" />
            )
          }
        />
        <Route
          path="*"
          element={<Navigate to={token ? "/expenses" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
