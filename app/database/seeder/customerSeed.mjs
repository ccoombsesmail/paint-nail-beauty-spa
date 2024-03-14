import path from 'path';
import { promises as fs } from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function insertCustomers(customersJson) {
  const phoneToCustomerIdMap = new Map();

  // Helper function to map service categories
  const mapServiceCategory = (category) => {
    const categoryMap = {
      "All": "ALL",
      "Nail": "Nail",
      "Body": "BodySpa",
      "Hair Removal": "HairRemoval",
      "Eye-lashes": "Eyelash",
      "Facial": "Facial",
    };
    return categoryMap[category] || null;
  };

  // Helper function to map purchase locations
  const mapPurchaseLocation = (location) => {
    const locationMap = {
      "Cupertino": "cupertino",
      "Fremont": "fremont",
      "West SJ": "west_san_jose",
      "Los Altos": "los_altos",
      "South SJ": "south_san_jose",
    };
    return locationMap[location] || null;
  };

    for (const customer of customersJson) {
      try {
        const [firstName, lastName] = customer.NAME.includes(" ") ? customer.NAME.split(" ") : [customer.NAME, ''];
        const isActive = customer["Active"] !== "FALSE";
        const memberType = (customer["member type"] === 'basic' || customer["member type"] === "Basic") ? "Bronze" : customer["member type"];
        const membershipLevel = isActive ? memberType : `${memberType}NonActive`;

        const newCustomer = await prisma.customer.create({
          data: {
            firstName: firstName || '',
            lastName: lastName || '',
            email: customer.email,
            phoneNumber: customer["phone number"].toString(),
            dialCode: '+1',
            membershipLevel: membershipLevel,
            membershipPurchaseDate: new Date(customer["purchase date(day1)"]),
            membershipActivationDate: isActive ? new Date(customer["purchase date(day1)"]) : null,
            createdAtFranchiseCode: mapPurchaseLocation(customer["purchase location"]),
            serviceCategorySelection: customer["service category"] === 'All' ? null : mapServiceCategory(customer["service category"]),
            canTransferMembership: isActive && (memberType === "Gold" || memberType === "Silver"),
            notes: customer.Notes + ` employee: ${customer['employee name']}`,
            // Default values and fields not specified by the input
            cashbackBalance: 0,
          }
        });

        // For master accounts, store the ID mapped to their phone number
        if (customer["account type"] === "master account") {
          phoneToCustomerIdMap.set(customer["phone number"].toString(), newCustomer.id);
        }

      } catch (e) {
          console.log(customer)
          throw new Error(e)
        }
    }


  // Second Pass: Update sub-accounts with the correct parentId
  for (const customer of customersJson) {
    if (customer["account type"] === "sub account") {
      const masterAccountId = phoneToCustomerIdMap.get(customer["master account phone"].toString());
      if (masterAccountId) {
        await prisma.customer.update({
          where: {
            phoneNumber: customer["phone number"].toString(),
          },
          data: {
            parentId: masterAccountId,
          },
        });
      }
    }
  }
}


const pathFile = path.join(process.cwd(), 'seed-data/customer-seed.json');
const data = await fs.readFile(pathFile, 'utf-8');
const {
  customers,
} = JSON.parse(data);


insertCustomers(customers).catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
