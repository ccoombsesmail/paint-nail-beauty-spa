import axiosClient from '../axios';

export const getEnums = async () => {
  const { data } = await axiosClient.get('enums');
  return data.enums;
};
