import axios from './axiosInstance';

const authHeader = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const createGame = async (token: string, gameData: any) => {
  const res = await axios.post('/games/create', gameData, authHeader(token));
  return res.data;
};

export const joinGame = async (token: string, gameId: string, userId: string) => {
  const res = await axios.post('/games/join', { gameId, userId }, authHeader(token));
  return res.data;
};

export const leaveGame = async (token: string, gameId: string, userId: string) => {
  const res = await axios.post('/games/leave', { gameId, userId }, authHeader(token));
  return res.data;
};

export const acceptPlayer = async (token: string, gameId: string, playerId: string) => {
  const res = await axios.post('/games/accept', { gameId, playerId }, authHeader(token));
  return res.data;
};

export const updateGame = async (token: string, gameId: string, updateData: any) => {
  const res = await axios.put(`/games/${gameId}`, updateData, authHeader(token));
  return res.data;
};

export const startGame = async (token: string, gameId: string) => {
  const res = await axios.post('/games/start', { gameId }, authHeader(token));
  return res.data;
};

export const getAllGames = async (token: string, userId: string) => {
  const res = await axios.get('/games', {
    ...authHeader(token),
    params: { userId },
  });
  return res.data;
};

export const getGameById = async (token: string, gameId: string, userId: string) => {
  const res = await axios.get(`/games/${gameId}`, {
    ...authHeader(token),
    params: { userId },
  });
  return res.data;
};
