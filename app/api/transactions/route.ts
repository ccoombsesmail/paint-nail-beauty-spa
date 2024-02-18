import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import prisma from '../../database/prismaClient';
import { currentUser } from '@clerk/nextjs/server';


export async function POST(req: NextRequest) {

  try {
    const user = await currentUser()
    if (!user){
      return new NextResponse(JSON.stringify({ error: "User Not Authorized"}), {
        headers: { "content-type": "application/json" },
        status: 401,
      })
    }

    const { franchise_code } = user.publicMetadata
    console.log(user)

    const body = await req.json();

    const transaction = await prisma.transactions.create({
      data: {
        ...body,
        franchiseCode: franchise_code
      },
    });

    return new NextResponse(JSON.stringify(transaction), {
      headers: { "content-type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return new NextResponse(JSON.stringify({ error: "Failed To Create Transaction"}), {
      headers: { "content-type": "application/json" },
      status: 500,
    })
  }

}




