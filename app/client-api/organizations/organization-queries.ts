import axiosClient from '../axios';

export type EmployeePostData = {
  firstName: string;
  lastName: string,
  email: string | null,
  phoneNumber: string | null,
  organizationRole: string,
  notes: string | null
  organizationId: string,
  userId?: string,
  address: string | null,
  employmentStatus: string
}

export const createOrgMember = async (employeeData: EmployeePostData) => {
  const { data } = await axiosClient.post('organizations/members', employeeData);
  return data;
};


export const updateOrgMember = async (employeeData: EmployeePostData) => {
  const { data } = await axiosClient.patch('organizations/members', employeeData);
  return data;
};

export const deleteOrgMember = async (employeeId: string) => {
  const { data } = await axiosClient.delete(`organizations/members?employeeId=${employeeId}`);
  return data;
};

export const fetchMembers = async (organizationId: string | null) => {
  const { data } = await axiosClient.get(`/organizations/members?organizationId=${organizationId}`);
  return data.members || [];
};
