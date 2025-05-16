import { useQuery } from "@tanstack/react-query";
import { verifyAcsessTokenResquest } from "../../services/auth/authServices";

export function useAuth() {
  return useQuery({
    queryKey: ["verify-access-token"],
    queryFn: verifyAcsessTokenResquest,
    staleTime: Infinity,
    retry: false,
  });
}
