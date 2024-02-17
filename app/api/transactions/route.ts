import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {

  try {
    // Accumulate the request body content from the ReadableStream
    const body = await req.json();

    console.log(body)
    // Create a new user record in the database using the parsed data
    const user = await prisma.transactions.create({
      data: body,
    });

    // Send the created user as a response
    return new NextResponse(JSON.stringify(user), {
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
