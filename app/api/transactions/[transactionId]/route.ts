import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../database/prismaClient';



export async function GET(req: NextRequest, { params }: { params: { transactionId: string } }){

  const transactionId = params.transactionId

  const transaction = await prisma.transaction.findUnique({
    where: {
      id: transactionId,
    },
    include: {
      Visit: {
        include: {
          customer: true
        }
      },
      employee: true
    }
  });

  if (!transaction) {

    console.error("Could not locate transaction");
    return new NextResponse(JSON.stringify({ error: "Could not locate customer"}), {
      headers: { "content-type": "application/json" },
      status: 404,
    })
  }

  const formattedTransaction = {
      ...transaction,
      customer: transaction?.Visit?.customer
    }

  return NextResponse.json({ transaction: formattedTransaction })
}
