export const normalizePhoneNumber = (phoneNumber: string | null) => phoneNumber?.replace(/\D/g, '');
