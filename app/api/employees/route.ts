


import { NextRequest, NextResponse } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../../database/prismaClient';
import { $Enums, Prisma } from '@prisma/client';
import { membershipTypeEnumMap } from '../../types/enums';
import { auth } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';



export async function GET(req: NextRequest){
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get('search')

    const user = await currentUser()
    if (!user){
        return new NextResponse(JSON.stringify({ error: "User Not Authorized"}), {
            headers: { "content-type": "application/json" },
            status: 401,
        })
    }

    const { franchise_code } = user.publicMetadata

    let where: Prisma.EmployeeWhereInput = {
        franchiseCode: franchise_code || undefined
    }

    if (search) {
        where = {
            ...where,
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
        where,
    });

    const formattedEmployees = employees.map(u => {
        return {
            ...u,
            // @ts-ignore
            membershipLevel: membershipTypeEnumMap.get(u.membershipLevel),
            phoneNumber: `${u.phoneNumber}`,
        }
    })

    return NextResponse.json({ employees: formattedEmployees })
}
