import axiosInstance from './api';

const parseError = (error: any) => {
  throw new Error(error?.response?.data?.message || 'Request failed');
};

export const getAlerts = async () => {
  try { return (await axiosInstance.get('/alerts')).data; } catch (e) { return parseError(e); }
};
export const getAlertCount = async () => {
  try { return (await axiosInstance.get('/alerts/count')).data; } catch (e) { return parseError(e); }
};
export const markRead = async (id: string) => {
  try { return (await axiosInstance.patch(`/alerts/${id}/read`)).data; } catch (e) { return parseError(e); }
};
export const markAllRead = async () => {
  try { return (await axiosInstance.patch('/alerts/read-all')).data; } catch (e) { return parseError(e); }
};
export const deleteAlert = async (id: string) => {
  try { return (await axiosInstance.delete(`/alerts/${id}`)).data; } catch (e) { return parseError(e); }
};
