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
import api from "../api/axios";

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
      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.error(error);
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

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url.includes("/refresh-token")
      ) {
        originalRequest._retry = true;
        try {
          await refreshToken();
          return api(originalRequest);
        } catch (refreshError) {
          signOut();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  const contextValues = useMemo(
    () => ({
      user,
      signIn,
      signOut,
      verifyAcessToken,
    }),
    [user, signIn, signOut, verifyAcessToken]
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
