import { useQuery } from "@tanstack/react-query";
import { UseAuth } from "../../context/authProvider";
import { getAccessToken } from "../../utils/authStorage";

export function useVerifyAcsessToken() {
  const { verifyAcessToken } = UseAuth();
  const token = getAccessToken();
  
  return useQuery({
    queryKey: ["verify-access-token"],
    queryFn: verifyAcessToken,
    staleTime: Infinity,    
    enabled: !!token,
  });
}