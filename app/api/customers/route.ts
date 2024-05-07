import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../database/prismaClient';
import { $Enums, Customer, Prisma } from '@prisma/client';
import { bronzeOrNonActiveBronze, membershipTypeEnumMap, silverOrGold } from '../../types/enums';
import { currentUser } from '@clerk/nextjs/server';
import { normalizePhoneNumber } from './utils/ normalizePhoneNumber';
import QueryMode = Prisma.QueryMode;
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';


export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get('search');
  const all = searchParams.get('all');
  let where: Prisma.CustomerWhereInput = all === 'true' ? {} : {
    parentId: null
  };

  const phoneSearchString = normalizePhoneNumber(search);

  if (search) {
    const phoneCondition = phoneSearchString ? [{
      phoneNumber: {
        contains: phoneSearchString,
        mode: 'insensitive' as QueryMode
      }
    }] : [];
    where = {
      ...where,
      OR: [
        {
          firstName: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          lastName: {
            contains: search,
            mode: 'insensitive'
          }
        },
        ...phoneCondition,
        {
          email: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          subAccount: {
            OR: [
              {
                firstName: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                lastName: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              ...phoneCondition,
              {
                email: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            ]
          }
        }

      ]
    };

  }
  const customers: Customer[] = await prisma.customer.findMany({
    where,
    include: {
      subAccount: true,
      parent: true
    },
    orderBy: {
      membershipPurchaseDate: 'desc'
    }
  });

  const formattedCustomer = customers
    .map((u: Customer) => {
      return {
        ...u,
        // @ts-ignore
        membershipLevel: membershipTypeEnumMap.get(u.membershipLevel),
        // phoneNumber: `${u.dialCode}-${u.phoneNumber}`,
        isSubAccount: u.parentId !== null
      };
    });

  return NextResponse.json({ customers: formattedCustomer });
}

export async function POST(req: NextRequest, res: NextResponse) {

  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'User Not Authorized' }), {
        headers: { 'content-type': 'application/json' },
        status: 401
      });
    }
    const createCustomerPayload = await req.json();

    const normalizedPhoneNumber = normalizePhoneNumber(createCustomerPayload.phoneNumber);

    const customer = await prisma.customer.findUnique({
      where: {
        phoneNumber: normalizedPhoneNumber
      }
    });

    if (customer) {
      return new NextResponse(JSON.stringify({ error: 'Failed To Create Customer. \n A Customer With That Phone Number or Email Already Exists' }), {
        headers: { 'content-type': 'application/json' },
        status: 400
      });
    }

    if (createCustomerPayload.membershipLevel === $Enums.Membership.Bronze && !createCustomerPayload.serviceCategorySelection) {
      return new NextResponse(JSON.stringify({ error: 'Failed To Create Customer. \n Bronze Members Must Select A Service Category' }), {
        headers: { 'content-type': 'application/json' },
        status: 400
      });
    }

    const canHaveSubAccount = createCustomerPayload.membershipLevel === $Enums.Membership.Silver || createCustomerPayload.membershipLevel === $Enums.Membership.Gold;
    if (!canHaveSubAccount && createCustomerPayload.subAccountInfo) {
      return new NextResponse(JSON.stringify({ error: 'Failed To Create Customer. \n Only Silver Or Gold Members Can Have Sub Accounts' }), {
        headers: { 'content-type': 'application/json' },
        status: 400
      });
    }


    const { franchise_code } = user.publicMetadata;

    const { subAccountInfo, ...mainUserInfo } = createCustomerPayload;
    const mainUser: Customer = mainUserInfo;

    let membershipDates = {};
    let canTransferValues = {};

    if (silverOrGold.includes(mainUser.membershipLevel)) {
      canTransferValues = {
        canTransferMembership: true
      };
    }
    if (mainUser.membershipLevel === $Enums.Membership.Gold) {
      canTransferValues = {
        canTransferMembership: true,
        canTransferCashbackBalance: true
      };
    }


    switch (mainUser.membershipLevel) {
      case $Enums.Membership.GoldNonActive:
        membershipDates = {
          membershipPurchaseDate: new Date()
        };
        break;
      case $Enums.Membership.SilverNonActive:
        membershipDates = {
          membershipPurchaseDate: new Date()
        };
        break;
      case $Enums.Membership.BronzeNonActive:
        membershipDates = {
          membershipPurchaseDate: new Date()
        };
        break;
      case $Enums.Membership.Gold:
        membershipDates = {
          membershipPurchaseDate: new Date(),
          membershipActivationDate: new Date()
        };
        break;
      case $Enums.Membership.Silver:
        membershipDates = {
          membershipPurchaseDate: new Date(),
          membershipActivationDate: new Date()
        };
        break;
      case $Enums.Membership.Bronze:
        membershipDates = {
          membershipPurchaseDate: new Date(),
          membershipActivationDate: new Date()
        };
        break;
      default:
        membershipDates = {};
    }
    const result = await prisma.$transaction(async (tx) => {

      const createdCustomer = await tx.customer.create({
        data: {
          ...mainUserInfo,
          serviceCategorySelection: mainUserInfo.serviceCategorySelection || null,
          createdAtFranchiseCode: franchise_code,
          ...membershipDates,
          ...canTransferValues,
          phoneNumber: normalizedPhoneNumber
        }
      });

      if (subAccountInfo) {
        await tx.customer.create({
          data: {
            ...subAccountInfo,
            membershipLevel: createdCustomer.membershipLevel,
            serviceCategorySelection: createdCustomer.serviceCategorySelection || null,
            parentId: createdCustomer.id,
            ...membershipDates,
            createdAtFranchiseCode: franchise_code,
            phoneNumber: normalizePhoneNumber(subAccountInfo.phoneNumber)
          }
        });
      }
    });


    // Send the created customer as a response
    return new NextResponse(JSON.stringify(result), {
      headers: { 'content-type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Failed to create customer:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed To Create Customer' }), {
      headers: { 'content-type': 'application/json' },
      status: 500
    });
  }

}


export async function PATCH(req: NextRequest, res: NextResponse) {

  try {
    const { masterCode, ...payload } = await req.json();
    const customer = await prisma.customer.update({
      where: { id: payload.id },
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        serviceCategorySelection: payload.serviceCategorySelection,
        notes: payload.notes,
      }
    });

    // Send the created customer as a response
    return new NextResponse(JSON.stringify(customer), {
      headers: { 'content-type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Failed to create customer:', error);
    // @ts-ignore
    return new NextResponse(JSON.stringify({ error: `Failed To Update Customer: ${error.message}` }), {
      headers: { 'content-type': 'application/json' },
      status: 500
    });
  }

}


export async function DELETE(req: NextRequest, res: NextResponse) {
  const params = req.nextUrl.searchParams;
  const id = params.get('id');
  try {
    if (id) {

       await prisma.customer.delete({
        where: { id }
      });

      // Send the created customer as a response
      return new NextResponse(JSON.stringify({ success: true }), {
        headers: { 'content-type': 'application/json' },
        status: 200
      });
    } else {
      throw Error('No Id Provided To Delete');
    }
  } catch (error: unknown) {
    console.error('Failed to delete customer:', error);
    const err = error as PrismaClientKnownRequestError
    if (err?.meta?.field_name === 'transactions_customer_id_fkey (index)') {
      return new NextResponse(JSON.stringify({ error: `Cannot Delete Customer With Saved Transactions. Please Delete The Transactions First` }), {
        headers: { 'content-type': 'application/json' },
        status: 500
      });
    }
    // @ts-ignore
    return new NextResponse(JSON.stringify({ error: `Failed To Update Customer: ${error.message}` }), {
      headers: { 'content-type': 'application/json' },
      status: 500
    });
  }

}
