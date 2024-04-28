import axiosClient from '../axios';

export type EmployeePostData = {
  firstName: string;
  lastName: string,
  email: string,
  phoneNumber: string,
  dialCode: string,
  role: string,
  notes: string
}

export const fetchEmployees = async (search: string | null) => {
  if (!search) return []
  const { data } = await axiosClient.get(`/employees?search=${search}`);
  // Or use your custom Axios instance: const { data } = await api.get(`/customers?search=${search}`);
  return data.employees || [];
};


export const createEmployee = async (employeeData: EmployeePostData) => {
  const { data } = await axiosClient.post('employees', employeeData);
  return data;
};

export const createTransaction = async (transactionData: any) => {
  const { data } = await axiosClient.post('transactions', transactionData);
  return data;
};
