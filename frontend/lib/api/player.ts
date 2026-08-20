import axios from "./axiosInstance";

export const sendPlayerRequest = async (gameId: string, token: string) => {
  const response = await axios.post(
    `/playerRequest/makeRequest/${gameId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getRequestsForGame = async (gameId: string, token: string) => {
  const response = await axios.post(`/playerRequest/game/${gameId}`,{
    
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const approvePlayerRequest = async (requestId: string, token: string) => {
  const response = await axios.patch(
    `/playerRequest/${requestId}/approve`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const rejectPlayerRequest = async (requestId: string, token: string) => {
  const response = await axios.patch(
    `/playerRequest/${requestId}/reject`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const cancelPlayerRequest = async (requestId: string, token: string) => {
  const response = await axios.post(`/playerRequest/delete/${requestId}`,{}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.status === 204;
};

export const getPlayedGames = async (token: string) => {
  const response = await axios.post("/players/played-games", {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data as {
    games: Array<{
      id: string;
      name: string;
      status: "WAITING" | "STARTED" | "COMPLETED";
      createdAt: string;
      creatorUsername: string;
      myScore: number;
      playerCount: number;
      questionCount: number;
      answeredCount: number;
    }>;
  };
};

export const getPlayedGameReview = async (token: string, gameId: string) => {
  const response = await axios.post(`/players/played-games/${gameId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data as {
    game: {
      id: string;
      name: string;
      status: "WAITING" | "STARTED" | "COMPLETED";
      createdAt: string;
      creatorUsername: string;
    };
    myScore: number;
    questionCount: number;
    answeredCount: number;
    leaderboard: Array<{
      rank: number;
      userId: string;
      username: string;
      score: number;
      isCurrentUser: boolean;
    }>;
    questions: Array<{
      id: string;
      question: string;
      explanation: string | null;
      selectedOptionId: string | null;
      isCorrect: boolean | null;
      options: Array<{
        id: string;
        option: string;
        isCorrect?: boolean;
      }>;
    }>;
  };
};

export const getMyPlayerRequests = async (token: string) => {
  const response = await axios.post(`/playerRequest/my`,{}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
