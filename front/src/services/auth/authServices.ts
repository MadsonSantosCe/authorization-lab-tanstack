import axios from "axios";
import api from "../../api/axios";
import { removeAccessToken, saveAccessToken } from "../../utils/authStorage";

export const verifyAcsessTokenResquest = async () => {
  try {
    const response = await api.post("/verify-access-token");
    saveAccessToken(response.data.accessToken);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      removeAccessToken();
    }
    throw error;
  }
};

export const refreshTokenResquest = async () => {
  try {
    const response = await api.post("/refresh-token");
    saveAccessToken(response.data.accessToken);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      removeAccessToken();
    }
    throw error;
  }
};

export const signInRequest = async () => {
  const response = await api.post("/login");
  return response.data;
};

export const signOutRequest = async () => {
  const response = await api.post("/logout");
  return response.data;
};
