




export async function seedUsers(data , prismaClient) {

  const userExists = await prismaClient.user.findFirst();
  if (!userExists) {
    await prismaClient.user.createMany({ data });
    console.log('Seeded Users data successfully!');
  } else {
    console.log('Users have already been seeded!');
  }
}

export async function seedCountryCodes(data , prismaClient) {

  const countryCodeExists = await prismaClient.countryCode.findFirst();
  if (!countryCodeExists) {
    await prismaClient.countryCode.createMany({ data });
    console.log('Seeded Country Code data successfully!');
  } else {
    console.log('Country Codes have already been seeded!');
  }
}

