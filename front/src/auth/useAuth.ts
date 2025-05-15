import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { saveAccessToken } from './auth';

export function useAuth() {
  return useQuery({
    queryKey: ['verify-access-token'],
    queryFn: async () => {
      const res = await api.post('/verify-access-token');
      const accessToken = res.data.accessToken; 
      saveAccessToken(accessToken);
      return res.data;
    },
    staleTime: Infinity,
    retry: false,
  });
}
