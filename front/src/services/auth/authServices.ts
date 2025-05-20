import api from "../../api/axios";

export interface ISignInPayload {
  email: string;
  password: string;
}

export interface ISignUpPayload {
  name: string;
  email: string;
  password: string;
}

export const verifyAcsessTokenResquest = async () => {
  const response = await api.post("/verify-access-token");
  return response.data;
};

export const refreshTokenResquest = async () => {
  const response = await api.post("/refresh-token");
  return response.data;
};

export const signInRequest = async ({ email, password }: ISignInPayload) => {
  const response = await api.post("/login", { email, password });
  return response.data;
};

export const signOutRequest = async () => {
  const response = await api.post("/logout");
  return response.data;
};

export const signUpRequest = async ({ name, email, password }: ISignUpPayload) => {
  const response = await api.post("/register", { name, email, password });
  return response.data;
};

