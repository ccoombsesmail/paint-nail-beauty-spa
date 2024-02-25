import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, $Enums } from '@prisma/client';
import { silverOrGold } from '../../../types/enums';

const prisma = new PrismaClient()

export async function PATCH(req: NextRequest) {

  try {
    const body: {fromCustomerId: string, toCustomerId: string } = await req.json();
    const { fromCustomerId, toCustomerId } = body

    // Create a new user record in the database using the parsed data
    const fromCustomer = await prisma.customer.findUnique({
      where: { id: body.fromCustomerId },
      include: {
        subAccount: true
      }
    });

    const toCustomer = await prisma.customer.findUnique({
      where: { id: body.toCustomerId },
      include: {
        subAccount: true
      }
    });
    if (!fromCustomer) {
      console.error("Could not locate the original customer");
      return new NextResponse(JSON.stringify({ error: "Could not locate the customer the membership is being transferred from"}), {
        headers: { "content-type": "application/json" },
        status: 400,
      })
    }
    if (!toCustomer) {
      console.error("Could not locate the customer the membership is being transferred to");
      return new NextResponse(JSON.stringify({ error: "Could not locate the customer the membership is being transferred to"}), {
        headers: { "content-type": "application/json" },
        status: 400,
      })
    }
    if (fromCustomer.membershipLevel === $Enums.Membership.NonMember) {
      return new NextResponse(JSON.stringify({ error: "Cannot transfer membership from a Non Member"}), {
        headers: { "content-type": "application/json" },
        status: 400,
      })
    }

    if (!silverOrGold.includes(fromCustomer.membershipLevel)) {
      return new NextResponse(JSON.stringify({ error: "Only Gold and Silver members can transfer their membership"}), {
        headers: { "content-type": "application/json" },
        status: 400,
      })
    }
    if (toCustomer.membershipLevel !== $Enums.Membership.NonMember) {
      return new NextResponse(JSON.stringify({ error: "This customer already has a membership"}), {
        headers: { "content-type": "application/json" },
        status: 400,
      })
    }

    if (fromCustomerId === toCustomerId) {
      return new NextResponse(JSON.stringify({ error: "Customer cannot transfer membership to themselves"}), {
        headers: { "content-type": "application/json" },
        status: 400,
      })
    }

    if (fromCustomer.subAccount && fromCustomer.subAccount.id === toCustomerId) {
      return new NextResponse(JSON.stringify({ error: "Customer cannot transfer membership to their own sub account"}), {
        headers: { "content-type": "application/json" },
        status: 400,
      })
    }
    if (toCustomer.parentId !== null) {
      return new NextResponse(JSON.stringify({ error: "Cannot transfer membership to a sub account"}), {
        headers: { "content-type": "application/json" },
        status: 400,
      })
    }
    if (fromCustomer.parentId !== null) {
      return new NextResponse(JSON.stringify({ error: "Sub accounts cannot transfer membership"}), {
        headers: { "content-type": "application/json" },
        status: 400,
      })
    }


    console.log(`Attempting to transfer membership from ${fromCustomerId} to ${toCustomerId}`)


    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.customer.update({
        where: { id: body.fromCustomerId },
        data: {
          membershipTransferInitiatedOn: new Date(),
          canTransferMembership: false,
          membershipLevel: $Enums.Membership.NonMember,
          membershipPurchaseDate: null,
          membershipActivationDate: null
        },
      });
      if (fromCustomer.subAccount) {
        await tx.customer.update({
          where: { id: fromCustomer.subAccount.id },
          data: {
            parentId: null,
            canTransferMembership: false,
            membershipTransferInitiatedOn: new Date()
          },
        });
      }
      await tx.customer.update({
        where: { id: body.toCustomerId },
        data: {
          membershipTransferReceivedOn: new Date(),
          canTransferMembership: false,
          membershipLevel: fromCustomer.membershipLevel,
          membershipActivationDate: fromCustomer.membershipActivationDate,
          membershipPurchaseDate: fromCustomer.membershipPurchaseDate
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
      console.error("Failed to transfer user membership:", error);
      return new NextResponse(JSON.stringify({ error: "Failed to transfer user membership"}), {
        headers: { "content-type": "application/json" },
        status: 500,
      })
    }

  }
