import { useNavigate } from "react-router-dom";
import { useSignOut } from "../hooks/auth/useAuthentication";
import { UseAuth } from "../context/authProvider";

export default function Dashboard() {
  const { user } = UseAuth();
  const { mutateAsync: signOut, isPending } = useSignOut();  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signOut();
    navigate("/");
  };

  return (
    <>
      <p>Olá, {user?.name}!</p>
      <form onSubmit={handleSubmit}>
        <button type="submit" disabled={isPending}>
          sair
        </button>
      </form>
    </>
  );
}
