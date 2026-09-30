import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import ExpenseDetails from "./pages/ExpenseDetails";
import Payments from "./pages/Payments";
import "./styles.css";
function Private({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route
            path="/"
            element={
              <Private>
                <Dashboard />
              </Private>
            }
          />
          <Route
            path="/daily"
            element={
              <Private>
                <Expenses type="daily" />
              </Private>
            }
          />
          <Route
            path="/monthly"
            element={
              <Private>
                <Expenses type="monthly" />
              </Private>
            }
          />
          <Route
            path="/expense/:id"
            element={
              <Private>
                <ExpenseDetails />
              </Private>
            }
          />
          <Route
            path="/payments"
            element={
              <Private>
                <Payments />
              </Private>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
