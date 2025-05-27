import axios from './axiosInstance';

export const requestOtp = async (username: string, email: string, password: string) => {
  const res = await axios.post('/users/request-otp', { username, email, password });
  return res.data;
};

export const verifyOtp = async (token: string, otp: string) => {
  const res = await axios.post('/users/verify-otp', { token, otp });
  return res.data;
};

export const signin = async (username: string, password: string) => {
  const res = await axios.post('/users/signin', { username, password });
  return res.data;
};
