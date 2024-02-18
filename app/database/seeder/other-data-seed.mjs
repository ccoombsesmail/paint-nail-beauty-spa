




export async function seedCustomers(data , prismaClient) {

  const customerExists = await prismaClient.customer.findFirst();
  if (!customerExists) {
    await prismaClient.customer.createMany({ data });
    console.log('Seeded Customers data successfully!');
  } else {
    console.log('Customers have already been seeded!');
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

