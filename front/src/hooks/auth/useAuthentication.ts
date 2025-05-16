import { useMutation, useQuery } from "@tanstack/react-query";
import { signInRequest, signOutRequest, verifyAcsessTokenResquest } from "../../services/auth/authServices";
import { removeAccessToken, saveAccessToken } from "../../utils/authStorage";

export function useAuth() {
  return useQuery({
    queryKey: ["verify-access-token"],
    queryFn: verifyAcsessTokenResquest,
    staleTime: Infinity,
  });
}

export function useSignIn() {
  return useMutation({
    mutationKey: ["signIn"],
    mutationFn: signInRequest,
    onSuccess: (data) => {
      saveAccessToken(data.accessToken);
    },
  });
}

export function useSignOut() {
  return useMutation({
    mutationKey: ["signOut"],
    mutationFn: signOutRequest,
    onSuccess: removeAccessToken,
  });
}