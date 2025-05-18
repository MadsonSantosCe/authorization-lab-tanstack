import {
  createContext,
  useCallback,
  useMemo,
  useContext,
  type ReactNode,
  useState,
} from "react";
import {
  refreshTokenResquest,
  signInRequest,
  signOutRequest,
  verifyAcsessTokenResquest,
} from "../services/auth/authServices";
import { removeAccessToken, saveAccessToken } from "../utils/authStorage";
import axios from "axios";

type authProviderPromps = {
  children: ReactNode;
};

interface IUser {
  id: string;
  name: string;
  email: string;
}

interface IAuthContext {
  user: IUser | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  verifyAcessToken: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

function AuthProvider({ children }: authProviderPromps) {
  const [user, setUser] = useState<IUser | null>(null);

  const signIn = useCallback(async () => {
    try {
      const response = await signInRequest();
      setUser(response.user);
      saveAccessToken(response.accessToken);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data);
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await signOutRequest();
      removeAccessToken();
      setUser(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data);
      }
    }
  }, []);

  const verifyAcessToken = useCallback(async () => {
    try {
      const response = await verifyAcsessTokenResquest();
      setUser(response.user);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        removeAccessToken();
        setUser(null);
      }
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await refreshTokenResquest();
      setUser(response.user);
      saveAccessToken(response.accessToken);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        removeAccessToken();
        setUser(null);
      }
    }
  }, []);

  const contextValues = useMemo(
    () => ({
      user,
      signIn,
      signOut,
      verifyAcessToken,
      refreshToken,
    }),
    [user, signIn, signOut, verifyAcessToken, refreshToken]
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
