import api from "../../api/axios";

export const verifyAcsessTokenResquest = async () => {
    const response = await api.post("/verify-access-token");
    return response.data;
};

export const refreshTokenResquest = async () => {
    const response = await api.post("/refresh-token");
    return response.data;
};

export const signInRequest = async () => {
  const response = await api.post("/login");
  return response.data;
};

export const signOutRequest = async () => {
  const response = await api.post("/logout");
  return response.data;
};
