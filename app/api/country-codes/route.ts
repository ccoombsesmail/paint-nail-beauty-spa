


import { NextRequest, NextResponse } from 'next/server';
import { CountryCode, PrismaClient } from '@prisma/client';


const prisma = new PrismaClient()

export async function GET(req: NextRequest){

  const countryCodes: CountryCode[] = await prisma.countryCode.findMany();



  return NextResponse.json({ countryCodes })
}


