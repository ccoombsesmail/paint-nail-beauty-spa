import axiosClient from '../axios';


interface CustomerPostData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dialCode: string;
  membershipLevel: string;
}

export const createCustomer = async (customerData: CustomerPostData) => {
  const { data } = await axiosClient.post('customers', customerData);
  return data;
};


export const fetchCustomers = async (search: string | null) => {
  if (!search) return []
  const { data } = await axiosClient.get(`/customers?search=${search}`);
  // Or use your custom Axios instance: const { data } = await api.get(`/customers?search=${search}`);
  return data.customers || [];
};
