import axiosClient from '../axios';

export const fetchVisits = async (visitId: string | null) => {
  // if (!search) return []
  const { data } = await axiosClient.get(`/visits/${visitId}`);
  // Or use your custom Axios instance: const { data } = await api.get(`/customers?search=${search}`);
  return data.visit || null;
};


export const patchVisit = async (visitData: any) => {
  const { data } = await axiosClient.patch('/visits', visitData);
  return data;
};
