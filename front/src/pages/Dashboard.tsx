import { useNavigate } from "react-router-dom";
import { UseAuth } from "../context/authProvider";
import { useState } from "react";

export default function Dashboard() {
  const navigate = useNavigate();  
    const [loading, setLoading] = useState(false);
  const { signOut, user } = UseAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p>Olá, {user?.name}!</p>
      <form onSubmit={handleSubmit}>
        <button type="submit" disabled={loading}>sair</button>
      </form>
    </>
  );
}
