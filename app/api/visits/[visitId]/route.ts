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


export async function DELETE(req: NextRequest, { params }: { params: { visitId: string } }) {
  const visitId = params.visitId
  console.log(visitId)
  try {
    if (visitId) {

      await prisma.$transaction(async (tx) => {

        const visit = await tx.visit.findUnique({
          where: {
            id: visitId
          },
          include: {
            transactions: true
          }
        })

        if (!visit) {
          throw new Error("Could Not Find Visit")
        }

        for (const transaction of visit.transactions) {
          await prisma.transaction.delete({
            where: {
              id: transaction.id
            }
          })
        }

        await prisma.visit.delete({
          where: {id: visitId }
        });
      })



      // Send the created customer as a response
      return new NextResponse(JSON.stringify({ success: true }), {
        headers: { 'content-type': 'application/json' },
        status: 200
      });
    } else {
      throw Error('No Id Provided To Delete');
    }
  } catch (error: unknown) {
    console.error('Failed to delete visit:', error);
    // @ts-ignore
    return new NextResponse(JSON.stringify({ error: `Failed To Delete Visit: ${error.message}` }), {
      headers: { 'content-type': 'application/json' },
      status: 500
    });
  }

}
