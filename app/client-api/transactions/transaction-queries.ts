import axiosClient from '../axios';

export const fetchTransactions = async (search: string | null) => {
  // if (!search) return []
  const { data } = await axiosClient.get(`/transactions?search=${search}`);
  // Or use your custom Axios instance: const { data } = await api.get(`/customers?search=${search}`);
  return data.transactions || [];
};
