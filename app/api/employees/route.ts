


import { NextRequest, NextResponse } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../../database/prismaClient';
import { $Enums } from '@prisma/client';
import { membershipTypeEnumMap } from '../../types/enums';
import { auth } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';

interface Employee {
    id: string;
    firstName: string;
    lastName?: string | null;
    phoneNumber: string,
    dialCode: string,
    cashbackBalance: Decimal,
    email: string;
    membershipLevel: $Enums.Membership
}


export async function GET(req: NextRequest){
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get('search')
    let where = {}
    const user = await currentUser()
    if (!user){
        return new NextResponse(JSON.stringify({ error: "User Not Authorized"}), {
            headers: { "content-type": "application/json" },
            status: 401,
        })
    }

    if (search) {
        where = {
            OR: [
                {
                    firstName: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    lastName: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    phoneNumber: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    email: {
                        contains: search,
                        mode: 'insensitive',
                    }
                }
            ]
        }

    }
    const employees = await prisma.employee.findMany({
        where
    });

    const formattedEmployees = employees.map(u => {
        return {
            ...u,
            // @ts-ignore
            membershipLevel: membershipTypeEnumMap.get(u.membershipLevel),
            phoneNumber: `${u.phoneNumber}`
        }
    })

    return NextResponse.json({ employees: formattedEmployees })
}
