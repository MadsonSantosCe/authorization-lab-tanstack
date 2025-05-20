import { useMutation, useQuery } from "@tanstack/react-query";
import { UseAuth, type ISignInPayload } from "../../context/authProvider";
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

export function useSignIn() {
  const { signIn } = UseAuth();
  return useMutation({
    mutationKey: ["signIn"],
    mutationFn: ({ email, password }: ISignInPayload) =>
      signIn({ email, password }),
  });
}

export function useSignOut() {
  const { signOut } = UseAuth();
  return useMutation({
    mutationKey: ["signOut"],
    mutationFn: signOut,
  });
}