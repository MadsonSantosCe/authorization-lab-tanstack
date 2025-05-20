import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { UseAuth } from "./context/authProvider";
import { useVerifyAcsessToken } from "./hooks/auth/useAuthentication";
import Register from "./pages/Register";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isLoading } = useVerifyAcsessToken();
  const { user } = UseAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
