import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '../../database/prismaClient';
import { currentUser } from '@clerk/nextjs/server';
import { serviceTypeEnumMap } from '../../types/enums';


export async function POST(req: NextRequest) {

  try {
    const user = await currentUser()
    if (!user){
      return new NextResponse(JSON.stringify({ error: "User Not Authorized"}), {
        headers: { "content-type": "application/json" },
        status: 401,
      })
    }

    const { franchise_code } = user.publicMetadata



    const body = await req.json();
    const { actualPaymentCollected, customerId } = body



    // Calculate the new cashback balance by adding the additionalCashback to the current balance

    const result = await prisma.$transaction(async (tx) => {

      const customer = await tx.customer.findUnique({
        where: {
          id: customerId,
        },
        select: {
          cashbackBalance: true, // Only select cashbackBalance to minimize data transfer
        },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }
      const newCashbackBalance = Number(customer.cashbackBalance) + (.01 * actualPaymentCollected) ;

      const updatedCustomer = await tx.customer.update({
        where: {
          id: customerId,
        },
        data: {
          cashbackBalance: newCashbackBalance,
        },
      });

      const newTransaction = await tx.transaction.create({
        data: {
          ...body,
          franchiseCode: franchise_code
        },
      });

      return { updatedCustomer, newTransaction };
    });
    return new NextResponse(JSON.stringify(result.newTransaction), {
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

  const { franchise_code }: { franchise_code: string } = user.publicMetadata as { franchise_code: string };

  let where: Prisma.TransactionWhereInput = {};

  // If franchise_code is undefined, immediately return no results
  if (!franchise_code) {
    console.error("No Franchise Code Associated With This User")
    return NextResponse.json({ transactions: [] });
  }
  // where.franchiseCode = franchise_code;


  if (search) {
    // @ts-ignore
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
            {
              phoneNumber: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        },
      },
      {
        employee: {
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
            {
              phoneNumber: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        },
      }
    ];
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      customer: true, // Include customer info
      employee: true, // Include employee (technician) info
    },
  });

  const formattedTransactions = transactions.map(transaction => {
    return {
      ...transaction,
      serviceType: serviceTypeEnumMap.get(transaction.serviceType),
      customerName: transaction.customer ? `${transaction.customer.firstName} ${transaction.customer.lastName || ''}` : null,
      customerEmail: transaction.customer ? transaction.customer.email : null,
      customerPhoneNumber: transaction.customer ? transaction.customer.phoneNumber : null,
      technicianName: transaction.employee ? `${transaction.employee.firstName} ${transaction.employee.lastName || ''}` : null,
    };
  });

  return NextResponse.json({ transactions: formattedTransactions });
}
