import axiosInstance from './api';

const parseError = (error: any) => {
  throw new Error(error?.response?.data?.message || 'Request failed');
};

export const getWatchlist = async () => {
  try { return (await axiosInstance.get('/watchlist')).data; } catch (e) { return parseError(e); }
};
export const addToWatchlist = async (payload: { nasaId: string }) => {
  try { return (await axiosInstance.post('/watchlist', payload)).data; } catch (e) { return parseError(e); }
};
export const removeFromWatchlist = async (nasaId: string) => {
  try { return (await axiosInstance.delete(`/watchlist/${nasaId}`)).data; } catch (e) { return parseError(e); }
};
export const updateThreshold = async (nasaId: string, thresholdKm: number) => {
  try { return (await axiosInstance.patch(`/watchlist/${nasaId}`, { thresholdKm })).data; } catch (e) { return parseError(e); }
};
