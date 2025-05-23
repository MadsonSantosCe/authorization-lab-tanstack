import {
  createContext,
  useCallback,
  useMemo,
  useContext,
  type ReactNode,
  useState,
} from "react";
import { clearToken, setToken } from "../utils/authStorage";
import axios, { type AxiosResponse } from "axios";
import api from "../api/axios";

type authProviderPromps = {
  children: ReactNode;
};

interface IUser {
  id: string;
  name: string;
  email: string;
}

export interface ISignInPayload {
  email: string;
  password: string;
}

export interface ISignUpPayload {
  name: string;
  email: string;
  password: string;
}

interface IAuthContext {
  user: IUser | null;
  signIn: (payload: ISignInPayload) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (payload: ISignUpPayload) => Promise<void>;
  verifyAcessToken: () => Promise<AxiosResponse>;
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

function AuthProvider({ children }: authProviderPromps) {
  const [user, setUser] = useState<IUser | null>(null);

  const signIn = useCallback(async ({ email, password }: ISignInPayload) => {
    try {
      const response = await api.post("/login", { email, password });
      setUser(response.data.user);
      setToken(response.data.accessToken);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data);
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.post("/logout");
      clearToken();
      setUser(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data);
      }
    }
  }, []);

  const signUp = useCallback(async ({ name, email, password }: ISignUpPayload) => {
    try {
      const response = await api.post("/register", { name, email, password });
      setUser(response.data.user);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data);
      }
    }
  }, []);

  const verifyAcessToken = useCallback(async () => {
    try {
      const response = await api.post("/verify-access-token");
      setUser(response.data.user);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error(error.response?.data);
      }
      throw error;
    }
  }, []);

  const contextValues = useMemo(
    () => ({
      user,
      signIn,
      signOut,
      signUp,
      verifyAcessToken,
    }),
    [user, signIn, signOut, signUp, verifyAcessToken]
  );

  return (
    <AuthContext.Provider value={contextValues}>
      {children}
    </AuthContext.Provider>
  );
}

function UseAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthProvider, UseAuth };
