import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../database/prismaClient';
import { membershipTypeEnumMap, serviceTypeEnumMap } from '../../../types/enums';
import { Transaction } from '@prisma/client';



export async function GET(req: NextRequest, { params }: { params: { transactionId: string } }){

  const transactionId = params.transactionId

  const transaction: Transaction | null = await prisma.transaction.findUnique({
    where: {
      id: transactionId,
    },
    include: {
      customer: true,
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
      ...transaction
    }

  return NextResponse.json({ transaction: formattedTransaction })
}
