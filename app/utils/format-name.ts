export function formatName(user: {firstName: string | null, lastName: string | null}) {
  if (!user || typeof user !== 'object') {
    return "Invalid user object";
  }

  const { firstName, lastName } = user;

  if (!firstName && !lastName) {
    return "Unknown";
  } else if (!firstName && lastName) {
    return capitalizeFirstLetter(lastName);
  } else if (!lastName) {
    return firstName;
  } else {
    return firstName + " " + capitalizeFirstLetter(lastName.charAt(0)) + ".";
  }
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
