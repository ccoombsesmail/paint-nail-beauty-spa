import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '../../../../database/prismaClient';
import { currentUser } from '@clerk/nextjs/server';
import { serviceTypeEnumMap } from '../../../../types/enums';





export async function GET(req: NextRequest, { params }: { params: { customerId: string } }) {
  // const searchParams = req.nextUrl.searchParams;
  // const customerId = searchParams.get("customerId")
  const user = await currentUser();
  if (!user) {
    return new NextResponse(JSON.stringify({ error: "User Not Authorized" }), {
      headers: { "content-type": "application/json" },
      status: 401,
    });
  }

  if (!params.customerId) {
    return new NextResponse(JSON.stringify({ error: "Need to specify customer" }), {
      headers: { "content-type": "application/json" },
      status: 400,
    });
  }


  let where: Prisma.TransactionWhereInput = {
    customerId: params.customerId
  };



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
