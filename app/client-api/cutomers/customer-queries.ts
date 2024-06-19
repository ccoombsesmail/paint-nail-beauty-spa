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
  const { masterCode, ...rest } = membershipPatchData
  const { data } = await axiosClient.patch(`customers/membership?code=${masterCode}`, rest);
  return data;
};

export const deleteMembership = async (customerId: string) => {
  const { data } = await axiosClient.delete(`customers?id=${customerId}`);
  return data;
};

export const transferMembership = async (membershipPatchData: {masterCode: string, fromCustomerId: string, toCustomerId: string}) => {
  const {masterCode, ...rest} = membershipPatchData
  const { data } = await axiosClient.patch(`customers/membership-transfer?code=${masterCode}`, rest);
  return data;
};

export const addSubAccount = async (membershipPatchData: any) => {
  const { masterCode, customerId, values: patchDataPayload } = membershipPatchData
  const { data } = await axiosClient.patch(`customers/${customerId}/add-sub-account?code=${masterCode}`, patchDataPayload);
  return data;
};

export const transferBalance = async (membershipPatchData: {masterCode: string, fromCustomerId: string, toCustomerId: string}) => {
  const {masterCode, ...rest} = membershipPatchData
  const { data } = await axiosClient.patch(`customers/balance-transfer?code=${masterCode}`, rest);
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
