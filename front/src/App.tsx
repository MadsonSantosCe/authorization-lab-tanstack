import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { useAuth } from './auth/useAuth';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useAuth();

  if (isLoading) return <p>Verificando autenticação...</p>;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
