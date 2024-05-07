import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../database/prismaClient';
import { serviceTypeEnumMap } from '../../../types/enums';



export async function GET(req: NextRequest, { params }: { params: { visitId: string } }){

  const visitId = params.visitId
  const visit = await prisma.visit.findUnique({
    where: {
      id: visitId,
    },
    include: {
      transactions: {
        include: {
          employee: true
        }
      },
      customer: true
    }
  });

  if (!visit) {

    console.error("Could Not Locate Visit");
    return new NextResponse(JSON.stringify({ error: "Could Not Locate Visit"}), {
      headers: { "content-type": "application/json" },
      status: 404,
    })
  }

  // @ts-ignore
  visit.transactions = visit.transactions.map((tx) => {
    return {
      ...tx,
      serviceType: tx.serviceType,
      customerDialCode: visit.customer ? visit.customer.dialCode : null,
      technicianName: tx.employee ? `${tx.employee.firstName} ${tx.employee.lastName || ''}` : null,
    };
  })

  const formattedVisit = {
      ...visit,
      customer: visit.customer
  };

  return NextResponse.json({ visit: formattedVisit })
}
