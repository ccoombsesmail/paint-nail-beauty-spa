import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../database/prismaClient';
import { DateTime } from '@auth/core/providers/kakao';
import { Transaction } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';


interface VisitPatchData {
  visitId: string,
  visitDate: DateTime;
  customerId: string;
  transactions: Transaction[]

}

function findDiffIds(original: any[], modified: any[]) {
  const originalIds = new Set(original.map(item => item.id));
  const modifiedIds = new Set(modified.map(item => item.id));

  const addedIds = [...modifiedIds].filter(id => !originalIds.has(id));
  const removedIds = [...originalIds].filter(id => !modifiedIds.has(id));

  return { addedIds, removedIds };
}

export async function PATCH(req: NextRequest, res: NextResponse) {

  try {


    const { sessionClaims } = auth();
    if (!sessionClaims?.org_id) {
      return new NextResponse(JSON.stringify({ error: 'Associated Org Id Not Found' }), {
        headers: { 'content-type': 'application/json' },
        status: 401
      });
    }
    const body = await req.json();

    const {
      visitId,
      transactions,
      visitDate,
      customerId,
    } = body as VisitPatchData



    const originalVisit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        transactions: true
      }
    });

    if (!originalVisit) {
      console.error(`Could Not Find Existing Visit To Update: ${visitId}`)
      return new NextResponse(JSON.stringify({ error: "Could Not Find Existing Visit To Update"}), {
        headers: { "content-type": "application/json" },
        status: 500,
      })
    }


    const {  addedIds, removedIds } = findDiffIds(originalVisit.transactions, transactions)

    const originalActualAmountCollected = originalVisit.transactions.reduce((acc, tx) => {
      acc += Number(tx.actualPaymentCollected)
      return acc
    }, 0)

    const newActualPaymentCollected = transactions.reduce((acc, tx) => {
      acc += Number(tx.actualPaymentCollected)
      return acc
    }, 0)

    const difference = newActualPaymentCollected - originalActualAmountCollected;

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
      for (const transaction of transactions) {
        const {...rest} = transaction
        await tx.transaction.upsert({
          where: { id: rest.id || '' },
          create: {
            serviceType: rest.serviceType,
            serviceDuration: rest.serviceDuration,
            totalServicePrice: rest.totalServicePrice,
            discountedServicePrice: rest.discountedServicePrice,
            actualPaymentCollected: rest.actualPaymentCollected,
            tip: rest.tip,
            paymentMethod: rest.paymentMethod,
            technicianEmployeeId: rest.technicianEmployeeId,
            organizationId: sessionClaims.org_id!,
            organizationDisplayName: sessionClaims.org_slug!,
            notes: rest.notes,
            visitId: visitId,
          },
          update: {
            serviceType: rest.serviceType,
            serviceDuration: rest.serviceDuration,
            totalServicePrice: rest.totalServicePrice,
            discountedServicePrice: rest.discountedServicePrice,
            actualPaymentCollected: rest.actualPaymentCollected,
            tip: rest.tip,
            paymentMethod: rest.paymentMethod,
            technicianEmployeeId: rest.technicianEmployeeId,
            organizationId: rest.organizationId,
            organizationDisplayName: rest.organizationDisplayName,
            notes: rest.notes,
            visitId: visitId
          }
        });
      }
      for ( const removedId of removedIds) {
        await tx.transaction.delete({
          where: {
            id: removedId
          }
        })
      }
      return tx.visit.update({
        where: { id: visitId },
        data: {
          customerId,
          visitDate
        }
      })

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
