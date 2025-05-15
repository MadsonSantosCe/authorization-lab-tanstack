import { useState } from 'react';
import api from '../api/axios';
import { saveAccessToken } from '../auth/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/login'); 
      const accessToken = res.data.accessToken; 
      if (accessToken) {
        saveAccessToken(accessToken); 
        navigate('/'); 
      } else {
        console.error('Token não encontrado na resposta da API.');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" />
      <button type="submit">Entrar</button>
    </form>
  );
}
