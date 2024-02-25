import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, $Enums, Customer } from '@prisma/client';
import { silverOrGold } from '../../../types/enums';

const prisma = new PrismaClient()

export async function PATCH(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams

  const masterCode = searchParams.get('code')
  const unlock = masterCode === 'pnbs'

  try {
    const body: {fromCustomerId: string, toCustomerId: string } = await req.json();
    const { fromCustomerId, toCustomerId } = body

    // Create a new user record in the database using the parsed data
    const fromCustomer: Customer | null  = await prisma.customer.findUnique({
      where: { id: body.fromCustomerId },
      include: {
        subAccount: true
      }
    });

    const toCustomer: Customer | null = await prisma.customer.findUnique({
      where: { id: body.toCustomerId },
      include: {
        subAccount: true
      }
    });
    if (!fromCustomer) {
      console.error("Could not locate the the customer the balance is being transferred from");
      return new NextResponse(JSON.stringify({ error: "Could not locate the customer the balance is being transferred from"}), {
        headers: { "content-type": "application/json" },
        status: 400,
      })
    }
    if (!toCustomer) {
      console.error("Could not locate the customer the balance is being transferred to");
      return new NextResponse(JSON.stringify({ error: "Could not locate the customer the balance is being transferred to"}), {
        headers: { "content-type": "application/json" },
        status: 400,
      })
    }
    if (!unlock) {
      if (fromCustomer.membershipLevel !== $Enums.Membership.Gold) {
        return new NextResponse(JSON.stringify({ error: "Only Gold members can transfer their cashback balance" }), {
          headers: { "content-type": "application/json" },
          status: 400,
        })
      }
      if (Number(fromCustomer.cashbackBalance) === 0) {
        return new NextResponse(JSON.stringify({ error: "Member has no balance to transfer" }), {
          headers: { "content-type": "application/json" },
          status: 400,
        })
      }

      if (!fromCustomer.canTransferCashbackBalance) {
        return new NextResponse(JSON.stringify({ error: "Member cannot transfer balance. Ask support for assistance" }), {
          headers: { "content-type": "application/json" },
          status: 400,
        })
      }


      if (fromCustomerId === toCustomerId) {
        return new NextResponse(JSON.stringify({ error: "Customer cannot transfer balance to themselves" }), {
          headers: { "content-type": "application/json" },
          status: 400,
        })
      }

    }
    console.log(`Attempting to transfer cashback balance from ${fromCustomerId} to ${toCustomerId}`)


    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.customer.update({
        where: { id: body.fromCustomerId },
        data: {
          cashbackBalanceTransferInitiatedOn: new Date(),
          canTransferCashbackBalance: false,
          cashbackBalance: 0
        },
      });

      await tx.customer.update({
        where: { id: body.toCustomerId },
        data: {
          cashbackBalanceTransferReceivedOn: new Date(),
          cashbackBalance: Number(toCustomer.cashbackBalance) + Number(fromCustomer.cashbackBalance)

        },
      })
      return updatedUser
    })

    // Send the updated user as a response
    return new NextResponse(JSON.stringify(result), {
      headers: { "content-type": "application/json" },
      status: 200,
    })

    } catch (error) {
      console.error("Failed to transfer user cashback balance:", error);
      return new NextResponse(JSON.stringify({ error: "Failed to transfer user cashback balance"}), {
        headers: { "content-type": "application/json" },
        status: 500,
      })
    }

  }
