import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import NewEvaluation from "./pages/NewEvaluation";
import EvaluationDetails from "./pages/EvaluationDetails";
import ScoreEvaluation from "./pages/ScoreEvaluation";
import Login from "./pages/Login";
import Register from "./pages/Register";

import { useAuth } from "./context/AuthContext";

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        }
      />

      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Register />
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/new-evaluation"
        element={
          isAuthenticated ? (
            <NewEvaluation />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/evaluation/:id"
        element={
          isAuthenticated ? (
            <EvaluationDetails />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/evaluation/:id/score"
        element={
          isAuthenticated ? (
            <ScoreEvaluation />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Unknown Routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;