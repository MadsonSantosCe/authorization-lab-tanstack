import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/auth/useAuth";
import { useSignOut } from "../hooks/auth/useSignOut";

export default function Dashboard() {
  const { mutate: signOut } = useSignOut();
  const { data, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      signOut();
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
