import { useNavigate } from "react-router-dom";
import { useAuth, useSignOut } from "../hooks/auth/useAuthentication";

export default function Dashboard() {
  const { mutate: signOut } = useSignOut();
  const { data } = useAuth();
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

  return (
    <>
      <p>Olá, {data.user.name}!</p>
      <form onSubmit={handleSubmit}>
        <button type="submit">sair</button>
      </form>
    </>
  );
}
