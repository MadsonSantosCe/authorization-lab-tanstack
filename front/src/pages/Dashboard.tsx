import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../auth/useAuth";

export default function Dashboard() {
  const { data, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/logout");
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    }
  };

  if (isLoading) return <p>Carregando...</p>;
  if (!data) return <p>Usuário não autenticado</p>;

  return (
    <>
    <p>Olá, {data.user.name}!</p>
    <form onSubmit={handleSubmit}>
      <button type="submit">sair</button>
    </form>
    </>
  );
}
