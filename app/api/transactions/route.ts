import { NextRequest, NextResponse } from 'next/server';
import { $Enums, Prisma, Transaction, Visit } from '@prisma/client';
import prisma from '../../database/prismaClient';
import { auth, currentUser } from '@clerk/nextjs/server';
import { serviceTypeEnumMap } from '../../types/enums';
import { normalizePhoneNumber } from '../customers/utils/ normalizePhoneNumber';
import QueryMode = Prisma.QueryMode;
import { DateTime } from '@auth/core/providers/kakao';

interface TransactionPostData {
  visitDate: DateTime;
  cashbackBalanceToUse: number;
  customerId: string;
  transactions: Transaction[]
}


export async function POST(req: NextRequest) {

  try {
    const user = await currentUser()
    if (!user){
      return new NextResponse(JSON.stringify({ error: "User Not Authorized"}), {
        headers: { "content-type": "application/json" },
        status: 401,
      })
    }

    const { sessionClaims } = auth()

    if (!sessionClaims?.org_id){
      return new NextResponse(JSON.stringify({ error: "No Associated Organization"}), {
        headers: { "content-type": "application/json" },
        status: 401,
      })
    }

    const body = await req.json();
    const {
      transactions,
      visitDate,
      customerId,
      cashbackBalanceToUse: balanceUsed
    } = body as TransactionPostData


    const actualPaymentCollected = transactions.reduce((acc, tx) => {
        acc += Number(tx.actualPaymentCollected)
        return acc
    }, 0)


    // Calculate the new cashback balance by adding the additionalCashback to the current balance

    const result = await prisma.$transaction(async (tx) => {

      const visit = await tx.visit.create({
        data: {
          createdAtOrganizationId: sessionClaims?.org_id!,
          customerId,
          visitDate
        }
      })

      const customer = await tx.customer.findUnique({
        where: {
          id: customerId,
        },
        select: {
          cashbackBalance: true,
          membershipLevel: true
        },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }
      const newCashbackBalance = Number(customer.cashbackBalance) + (.01 * actualPaymentCollected) - (Number(balanceUsed) || 0);

      let updatedCustomer

      if (customer.membershipLevel === $Enums.Membership.Gold) {
        console.log("Previous balance: ", customer.cashbackBalance )
        console.log("Added Balance: ", (.01 * actualPaymentCollected) )
        console.log("Used Balance: ", balanceUsed)
        console.log("New Balance: ", newCashbackBalance)

        updatedCustomer = await tx.customer.update({
          where: {
            id: customerId,
          },
          data: {
            cashbackBalance: newCashbackBalance,
          },
        });
      }
      const newTransactions = await tx.transaction.createMany({
        data: transactions.map((tx) => ({
          ...tx,
          organizationId: sessionClaims.org_id!,
          organizationDisplayName: sessionClaims.org_slug!,
          visitId: visit.id
        }))
      });

      return { updatedCustomer, newTransactions };
    });
    return new NextResponse(JSON.stringify(result.newTransactions), {
      headers: { "content-type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return new NextResponse(JSON.stringify({ error: "Failed To Create Transaction"}), {
      headers: { "content-type": "application/json" },
      status: 500,
    })
  }

}




export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get('search');

  const user = await currentUser();
  if (!user) {
    return new NextResponse(JSON.stringify({ error: "User Not Authorized" }), {
      headers: { "content-type": "application/json" },
      status: 401,
    });
  }
  const { sessionClaims } = auth()
  const { is_admin }: { is_admin: boolean } = user.publicMetadata as { is_admin: boolean };

  let where: Prisma.VisitWhereInput = {};

  // If franchise_code is undefined, immediately return no results
  if (!sessionClaims?.org_id && !is_admin) {
    console.error("No Franchise Code Associated With This User")
    return NextResponse.json({ transactions: [] });
  }

  if (!is_admin) {
    // where.franchiseCode = franchise_code;
    where.createdAtOrganizationId = sessionClaims?.org_id
  }

  const phoneSearchString = normalizePhoneNumber(search)
  let visits  = []
  if (search) {
    const phoneCondition = phoneSearchString ? [{
      phoneNumber: {
        contains: phoneSearchString,
        mode: 'insensitive' as QueryMode,
      },
    }] : [];
    where.OR = [
      {
        customer: {
          OR: [
            {
              firstName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            ...phoneCondition,
            {
              email: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        },
      },
    ];


    visits = await prisma.visit.findMany({
      // where,
      where: {
        OR: [
          {
            customer: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                ...phoneCondition,
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
          {
            transactions: {
              some: {
                employee: {
                  OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    ...phoneCondition,
                    { email: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
            },
          },
        ],
      },
      include: {
        customer: true,
        transactions: {
          include: {
            employee: true,
          },
        },
      },
    });
  } else  {
    visits = await prisma.visit.findMany({
      where: {
        createdAtOrganizationId: sessionClaims?.org_id
      },
      include: {
        customer: true,
        transactions: {
          include: {
            employee: true
          }
        }
      }
    })
  }

  const formattedVisits = visits.map(visit => {

    // @ts-ignore
    visit.transactions = visit.transactions.map((tx) => {
      return {
        ...tx,
        serviceType: serviceTypeEnumMap.get(tx.serviceType || ''),
        customerDialCode: visit.customer ? visit.customer.dialCode : null,
        technicianName: tx.employee ? `${tx.employee.firstName} ${tx.employee.lastName || ''}` : null,
      };
    })
    return {
      ...visit,
      customerName: visit.customer ? `${visit.customer.firstName} ${visit.customer.lastName || ''}` : null,
      customerEmail: visit.customer ? visit.customer.email : null,
      customerPhoneNumber: visit.customer ? visit.customer.phoneNumber : null,
    }
  });

  return NextResponse.json({ visits: formattedVisits });
}


export async function PATCH(req: NextRequest, res: NextResponse) {

  try {

    const body = await req.json();
    const {
      customerId,
      serviceType,
      serviceDuration,
      totalServicePrice,
      discountedServicePrice,
      actualPaymentCollected,
      tip,
      paymentMethod,
      technicianEmployeeId,
      notes
    } = body

    const originalTransaction = await prisma.transaction.findUnique({
      where: { id: body.id },
    });

    if (!originalTransaction) {
      return new NextResponse(JSON.stringify({ error: "Failed To Update Transaction"}), {
        headers: { "content-type": "application/json" },
        status: 500,
      })
    }

    const originalAmount = Number(originalTransaction.actualPaymentCollected);
    const difference = Number(actualPaymentCollected) - originalAmount;

    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
        select: { cashbackBalance: true },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }
      let newCashbackBalance = Number(customer.cashbackBalance) + (.01 * difference);
      await tx.customer.update({
        where: { id: customerId },
        data: { cashbackBalance: newCashbackBalance },
      });
      return tx.transaction.update({
        where: { id: body.id },
        data: {
          serviceType,
          serviceDuration,
          totalServicePrice,
          discountedServicePrice,
          actualPaymentCollected,
          tip,
          paymentMethod,
          technicianEmployeeId,
          notes
        }
      });
    })

    // Send the created customer as a response
    return new NextResponse(JSON.stringify(result), {
      headers: { "content-type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error("Failed to Update Transaction:", error);
    return new NextResponse(JSON.stringify({ error: "Failed To Update Transaction"}), {
      headers: { "content-type": "application/json" },
      status: 500,
    })
  }

}


export async function DELETE(req: NextRequest, res: NextResponse) {
  const params = req.nextUrl.searchParams;
  const id = params.get('transactionId');
  try {
    if (id) {

      await prisma.transaction.delete({
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
    console.error('Failed to delete transaction:', error);
    // @ts-ignore
    return new NextResponse(JSON.stringify({ error: `Failed To Update Customer: ${error.message}` }), {
      headers: { 'content-type': 'application/json' },
      status: 500
    });
  }

}
