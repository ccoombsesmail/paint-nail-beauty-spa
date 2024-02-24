import axiosClient from '../axios';

export const getEnums = async () => {
  const { data } = await axiosClient.get('enums');
  return data.enums;
};


export const fetchCountryCodes = async () => {
  const { data } = await axiosClient.get('country-codes');
  return data.enums;
}
