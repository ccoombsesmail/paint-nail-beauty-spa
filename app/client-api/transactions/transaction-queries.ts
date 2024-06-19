import axiosClient from '../axios';

export const fetchTransactions = async (search: string | null) => {
  // if (!search) return []
  const { data } = await axiosClient.get(`/transactions?search=${search}`);
  // Or use your custom Axios instance: const { data } = await api.get(`/customers?search=${search}`);
  return data.visits || [];
};

export const fetchTransaction = async (transactionId: string | null) => {
  // if (!search) return []
  const { data } = await axiosClient.get(`/transactions/${transactionId}`);
  // Or use your custom Axios instance: const { data } = await api.get(`/customers?search=${search}`);
  return data.transaction || null;
};



export const fetchUserTransactions = async (customerId: string | null) => {
  // if (!search) return []
  const { data } = await axiosClient.get(`/customers/${customerId}/transactions`);
  // Or use your custom Axios instance: const { data } = await api.get(`/customers?search=${search}`);
  return data.transactions || [];
};




export const editTransaction = async (transactionData: any) => {
  const { data } = await axiosClient.patch('/transactions', transactionData);
  return data;
};

export const deleteTransaction = async (transactionId: any) => {
  const { data } = await axiosClient.delete(`/transactions?transactionId=${transactionId}`);
  return data;
};
