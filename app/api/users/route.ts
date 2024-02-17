


import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library';
import { MembershipLevel } from '../../types/enums';

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
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get('search')
    let where = {}


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
    const users: User[] = await prisma.user.findMany({
        where
    });

    const formattedUser = users.map(u => {
        return {
            ...u,
            // @ts-ignore
            membershipLevel: MembershipLevel[u.membershipLevel],
            phoneNumber: `${u.dialCode}-${u.phoneNumber}`
        }
    })

    return NextResponse.json({ users: formattedUser })
}

export async function POST(req: NextRequest, res: NextResponse) {

    try {
        // Accumulate the request body content from the ReadableStream
        const body = await req.json();

        console.log(body)
        // Create a new user record in the database using the parsed data
        const user = await prisma.user.create({
            data: body,
        });

        // Send the created user as a response
        return new NextResponse(JSON.stringify(user), {
            headers: { "content-type": "application/json" },
            status: 200,
        })
    } catch (error) {
        console.error("Failed to create user:", error);
        return new NextResponse(JSON.stringify({ error: "Failed To Create User"}), {
            headers: { "content-type": "application/json" },
            status: 500,
        })
    }

}



export async function PATCH(req: NextRequest, res: NextResponse) {

    try {
        // Accumulate the request body content from the ReadableStream
        const body = await req.json();

        console.log(body)
        // Create a new user record in the database using the parsed data
        const user = await prisma.user.update({
            where: { id: body.id },
            data: {
                ...body
            },
        });

        // Send the created user as a response
        return new NextResponse(JSON.stringify(user), {
            headers: { "content-type": "application/json" },
            status: 200,
        })
    } catch (error) {
        console.error("Failed to create user:", error);
        return new NextResponse(JSON.stringify({ error: "Failed To Create User"}), {
            headers: { "content-type": "application/json" },
            status: 500,
        })
    }

}
