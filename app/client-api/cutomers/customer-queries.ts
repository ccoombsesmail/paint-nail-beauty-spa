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

export const editCustomer = async (customerData: any) => {
  const { data } = await axiosClient.patch('customers', customerData);
  return data;
};

export const editMembership = async (membershipPatchData: any) => {
  const { data } = await axiosClient.patch('customers/membership', membershipPatchData);
  return data;
};


export const fetchCustomers = async (search: string | null, all: boolean = false) => {
  const { data } = await axiosClient.get(`/customers?search=${search}&all=${all}`);
  // Or use your custom Axios instance: const { data } = await api.get(`/customers?search=${search}`);
  return data.customers || [];
};


export const fetchCustomer = async (customerId: string | null) => {
  // if (!search) return []
  const { data } = await axiosClient.get(`/customers/${customerId}`);
  // Or use your custom Axios instance: const { data } = await api.get(`/customers?search=${search}`);
  return data.customer || null;
};
