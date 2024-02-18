


import { NextRequest, NextResponse } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../../database/prismaClient';
import { $Enums } from '@prisma/client';
import { membershipTypeEnumMap } from '../../types/enums';
import { auth } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';

interface Customer {
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
    const customers: Customer[] = await prisma.customer.findMany({
        where
    });

    const formattedCustomer = customers.map(u => {
        return {
            ...u,
            // @ts-ignore
            membershipLevel: membershipTypeEnumMap.get(u.membershipLevel),
            phoneNumber: `${u.dialCode}-${u.phoneNumber}`
        }
    })

    return NextResponse.json({ customers: formattedCustomer })
}

async function wait() {
    const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('Hello, world!');
        }, 4000);
    });

    const result = await promise;
    console.log(result);
}

export async function POST(req: NextRequest, res: NextResponse) {

    try {
        const user = await currentUser()
        if (!user){
            return new NextResponse(JSON.stringify({ error: "User Not Authorized"}), {
                headers: { "content-type": "application/json" },
                status: 401,
            })
        }
        // Accumulate the request body content from the ReadableStream
        const body = await req.json();

        const customer = await prisma.customer.findUnique({
            where: {
                phoneNumber: body.phoneNumber
            },
        });

        if (customer) {
            return new NextResponse(JSON.stringify({ error: "Failed To Create Customer. \n A Customer With That Phone Number or Email Already Exists"}), {
                headers: { "content-type": "application/json" },
                status: 400,
            })
        }

        const { franchise_code } = user.publicMetadata
        // Create a new customer record in the database using the parsed data
        const createdCustomer = await prisma.customer.create({
            data: {
                ...body,
                createdAtFranchiseCode: franchise_code
            },
        });

        // Send the created customer as a response
        return new NextResponse(JSON.stringify(createdCustomer), {
            headers: { "content-type": "application/json" },
            status: 200,
        })
    } catch (error) {
        console.error("Failed to create customer:", error);
        return new NextResponse(JSON.stringify({ error: "Failed To Create Customer"}), {
            headers: { "content-type": "application/json" },
            status: 500,
        })
    }

}



export async function PATCH(req: NextRequest, res: NextResponse) {

    try {
        // Accumulate the request body content from the ReadableStream
        const body = await req.json();

        // Create a new customer record in the database using the parsed data
        const customer = await prisma.customer.update({
            where: { id: body.id },
            data: {
                ...body
            },
        });

        // Send the created customer as a response
        return new NextResponse(JSON.stringify(customer), {
            headers: { "content-type": "application/json" },
            status: 200,
        })
    } catch (error) {
        console.error("Failed to create customer:", error);
        return new NextResponse(JSON.stringify({ error: "Failed To Create Customer"}), {
            headers: { "content-type": "application/json" },
            status: 500,
        })
    }

}
