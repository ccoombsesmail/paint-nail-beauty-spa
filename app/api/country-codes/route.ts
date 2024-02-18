


import { NextRequest, NextResponse } from 'next/server';
import { CountryCode } from '@prisma/client';
import prisma from '../../database/prismaClient';



export async function GET(req: NextRequest){

  const countryCodes: CountryCode[] = await prisma.countryCode.findMany();



  return NextResponse.json({ countryCodes })
}


