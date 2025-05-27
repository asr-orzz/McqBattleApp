import axios from './axiosInstance';

const authHeader = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const createOption = async (
  token: string,
  data: {
    option: string;
    isCorrect: boolean;
    questionId: string;
    gameId: string;
  }
) => {
  const res = await axios.post('/options/create', data, authHeader(token));
  return res.data;
};

export const updateOption = async (
  token: string,
  id: string,
  data: {
    option: string;
    isCorrect: boolean;
  }
) => {
  const res = await axios.put(`/options/${id}`, data, authHeader(token));
  return res.data;
};

export const deleteOption = async (
  token: string,
  id: string,
  userId: string
) => {
  const res = await axios.delete(`/options/${id}`, {
    ...authHeader(token),
    data: { userId },
  });
  return res.data;
};
