/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignIn } from "../hooks/auth/useAuthentication";
import { clearToken, getAccessToken } from "../utils/authStorage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutateAsync: signIn, isPending } = useSignIn();
  const navigate = useNavigate();
  const token = getAccessToken();

  useEffect(() => {
     if (token) {
    clearToken();
  }
  }, []);  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn({ email, password });
    navigate("/");
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
        />
        <button type="submit" disabled={isPending}>
          Entrar
        </button>
      </form>
    </>
  );
}
