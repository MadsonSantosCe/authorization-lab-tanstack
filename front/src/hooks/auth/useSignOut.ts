import { useMutation } from "@tanstack/react-query";
import { signOutRequest } from "../../services/auth/authServices";
import { removeAccessToken } from "../../utils/authStorage";

export function useSignOut() {
    return useMutation({
        mutationKey: ['signOut'],
        mutationFn: signOutRequest,
        onSuccess: removeAccessToken
    })
}