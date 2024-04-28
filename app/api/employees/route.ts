


import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../database/prismaClient';
import { Prisma } from '@prisma/client';
import { membershipTypeEnumMap } from '../../types/enums';
import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';



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

    const { sessionClaims } = auth();
    
    const { franchise_code } = user.publicMetadata

    let where: Prisma.EmployeeWhereInput = franchise_code === 'admin' ? {} : {
        organizationId: sessionClaims?.org_id
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
                // As of now, employee phone number and email are not entered
                // {
                //     phoneNumber: {
                //         contains: search,
                //         mode: 'insensitive',
                //     },
                // },
                // {
                //     email: {
                //         contains: search,
                //         mode: 'insensitive',
                //     }
                // }
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
            phoneNumber: u.phoneNumber ? `${u.phoneNumber}` : null,
        }
    })

    return NextResponse.json({ employees: formattedEmployees })
}
