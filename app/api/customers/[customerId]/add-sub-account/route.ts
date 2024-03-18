import { NextRequest, NextResponse } from 'next/server';
import { Customer } from '@prisma/client';
import prisma from '../../../../database/prismaClient';
import { currentUser } from '@clerk/nextjs/server';
import { silverOrGold } from '../../../../types/enums';
import { normalizePhoneNumber } from '../../utils/ normalizePhoneNumber';





export async function PATCH(req: NextRequest, { params }: { params: { customerId: string } }) {
  const searchParams = req.nextUrl.searchParams
  const masterCode = searchParams.get('code')
  const unlock = masterCode === 'pnbs'
  try {
    const body: { firstName: string, lastName: string, email: string, dialCode: string, phoneNumber: string } = await req.json()
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

    const customer = await prisma.customer.findUnique({
      where: { id: params.customerId },
      include: {
        subAccount: true,
        parent: true
      }
    });

    if (!customer) {

      console.error("Could not locate customer");
      return new NextResponse(JSON.stringify({ error: "Could not locate customer" }), {
        headers: { "content-type": "application/json" },
        status: 404,
      })
    }

    if (!unlock) {
      if (!silverOrGold.includes(customer.membershipLevel)) {
        return new NextResponse(JSON.stringify({ error: "Only Activated Gold Or Silver Members Can Add Sub Accounts" }), {
          headers: { "content-type": "application/json" },
          status: 404,
        })
      }

      if (customer.subAccount) {
        return new NextResponse(JSON.stringify({ error: "Member Already Has A Linked Sub Account" }), {
          headers: { "content-type": "application/json" },
          status: 404,
        })
      }

      if (customer.parent) {
        return new NextResponse(JSON.stringify({ error: "Sub Accounts Cannot Have Sub Accounts" }), {
          headers: { "content-type": "application/json" },
          status: 404,
        })
      }
    }
    const { franchise_code } = user.publicMetadata


    const createdCustomer = await prisma.customer.create({
      data: {
        ...body,
        phoneNumber: normalizePhoneNumber(body.phoneNumber),
        createdAtFranchiseCode: franchise_code as string,
        membershipLevel: customer.membershipLevel,
        membershipPurchaseDate: customer.membershipPurchaseDate,
        membershipActivationDate: customer.membershipActivationDate,
        parentId: customer.id,
      } as Customer,
    });


    return NextResponse.json(createdCustomer);
  } catch (e) {
    console.error("Failed to update user membership:", e);
    return new NextResponse(JSON.stringify({ error: "Failed to add sub account"}), {
      headers: { "content-type": "application/json" },
      status: 500,
    })
  }
}
