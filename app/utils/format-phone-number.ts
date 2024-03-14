export function formatPhoneNumber(phoneNumberString: string) {
  if (phoneNumberString.length === 10) {
    // Break the string into parts and format
    const areaCode = phoneNumberString.slice(0, 3);
    const middleThree = phoneNumberString.slice(3, 6);
    const lastFour = phoneNumberString.slice(6);
    return `(${areaCode})-${middleThree}-${lastFour}`;
  } else {
    // Return the original string if it's not 10 digits
    // Or adjust according to your needs
    return phoneNumberString;
  }
}

export const phoneNumberTemplate = (rowData: any) => {
  return formatPhoneNumber(rowData.phoneNumber)
}
