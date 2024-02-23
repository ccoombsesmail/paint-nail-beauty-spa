


import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../database/prismaClient';
import { membershipTypeEnumMap } from '../../../types/enums';
import { Customer } from '@prisma/client';



export async function GET(req: NextRequest, { params }: { params: { customerId: string } }){

  const customerId = params.customerId

  const customer: Customer | null = await prisma.customer.findUnique({
    where: {
      id: customerId,
    },
  });

  if (!customer) {

    console.error("Could not locate customer");
    return new NextResponse(JSON.stringify({ error: "Could not locate customer"}), {
      headers: { "content-type": "application/json" },
      status: 404,
    })
  }

  const formattedCustomer = {
      ...customer,
      // @ts-ignore
      membershipLevel: membershipTypeEnumMap.get(customer.membershipLevel),
    }

  return NextResponse.json({ customer: formattedCustomer })
}

export async function POST(req: NextRequest, res: NextResponse) {


}
