


import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library';
import { MembershipLevel } from '../../../types/enums';

interface User {
  id: string;
  firstName: string;
  lastName?: string | null;
  phoneNumber: string,
  dialCode: string,
  cashbackBalance: Decimal,
  email: string;
  membershipLevel: string
}

const prisma = new PrismaClient()

export async function GET(req: NextRequest){
  const { pathname } = new URL(req.url)
  const segments =  pathname.split("/")
  const userId = segments[segments.length-1]

  const user: User | null = await prisma.user.findUnique({
    where: {
      id: userId as string,
    },
  });

  if (!user) {

    console.error("Could not locate user");
    return new NextResponse(JSON.stringify({ error: "Could not locate user"}), {
      headers: { "content-type": "application/json" },
      status: 404,
    })
  }

  const formattedUser = {
      ...user,
      // @ts-ignore
      membershipLevel: MembershipLevel[user.membershipLevel],
      phoneNumber: `${user.dialCode}-${user.phoneNumber}`
    }

  return NextResponse.json({ user: formattedUser })
}

export async function POST(req: NextRequest, res: NextResponse) {


}
