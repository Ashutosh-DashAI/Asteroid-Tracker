import axiosInstance from './api';

const parseError = (error: any) => {
  throw new Error(error?.response?.data?.message || 'Request failed');
};

export const getFeed = async (params?: Record<string, unknown>) => {
  try { return (await axiosInstance.get('/neo/feed', { params })).data; } catch (e) { return parseError(e); }
};
export const getBrowse = async (params?: Record<string, unknown>) => {
  try { return (await axiosInstance.get('/neo/browse', { params })).data; } catch (e) { return parseError(e); }
};
export const getById = async (nasaId: string) => {
  try { return (await axiosInstance.get(`/neo/${nasaId}`)).data; } catch (e) { return parseError(e); }
};
export const getStats = async () => {
  try { return (await axiosInstance.get('/neo/stats/summary')).data; } catch (e) { return parseError(e); }
};
