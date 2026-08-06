import axiosInstance from './api';

const parseError = (error: any) => {
  throw new Error(error?.response?.data?.message || 'Request failed');
};

export const getGlobalMessages = async () => {
  try { return (await axiosInstance.get('/chat/global')).data; } catch (e) { return parseError(e); }
};
export const getAsteroidMessages = async (nasaId: string) => {
  try { return (await axiosInstance.get(`/chat/asteroid/${nasaId}`)).data; } catch (e) { return parseError(e); }
};
export const sendMessage = async (room: string, content: string) => {
  try { return (await axiosInstance.post('/chat/message', { room, content })).data; } catch (e) { return parseError(e); }
};
