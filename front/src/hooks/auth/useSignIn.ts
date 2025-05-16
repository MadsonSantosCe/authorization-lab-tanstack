import { useMutation } from "@tanstack/react-query";
import { signInRequest } from "../../services/auth/authServices";
import { saveAccessToken } from "../../utils/authStorage";

export function useSignIn() {
    return useMutation({
        mutationKey: ['signIn'],
        mutationFn: signInRequest,
        onSuccess: (data) => {
            saveAccessToken(data.accessToken);
        }
    }
)
}