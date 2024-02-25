


import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../database/prismaClient';
import { $Enums, Customer, Prisma } from '@prisma/client';
import { bronzeOrNonActiveBronze, membershipTypeEnumMap } from '../../types/enums';
import { currentUser } from '@clerk/nextjs/server';



export async function GET(req: NextRequest){
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get('search')
    const all = searchParams.get('all')
    let where: Prisma.CustomerWhereInput = all === 'true' ? {} : {
        parentId:  null
    }
    const user = await currentUser()
    if (!user){
        return new NextResponse(JSON.stringify({ error: "User Not Authorized"}), {
            headers: { "content-type": "application/json" },
            status: 401,
        })
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
                },
                {
                    subAccount: {
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
                                },
                            },
                        ]
                    }
                }

            ]
        }

    }
    const customers: Customer[] = await prisma.customer.findMany({
        where,
        include: {
            subAccount: true,
            parent: true
        }
    });

    const formattedCustomer = customers
      .map((u: Customer) => {
        return {
            ...u,
            // @ts-ignore
            membershipLevel: membershipTypeEnumMap.get(u.membershipLevel),
            // phoneNumber: `${u.dialCode}-${u.phoneNumber}`,
            isSubAccount: u.parentId !== null
        }
    })

    return NextResponse.json({ customers: formattedCustomer })
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
        const createCustomerPayload = await req.json();

        const customer = await prisma.customer.findUnique({
            where: {
                phoneNumber: createCustomerPayload.phoneNumber
            },
        });

        if (customer) {
            return new NextResponse(JSON.stringify({ error: "Failed To Create Customer. \n A Customer With That Phone Number or Email Already Exists"}), {
                headers: { "content-type": "application/json" },
                status: 400,
            })
        }

        if (bronzeOrNonActiveBronze.includes(createCustomerPayload.membershipLevel) && !createCustomerPayload.serviceCategorySelection) {
            return new NextResponse(JSON.stringify({ error: "Failed To Create Customer. \n Bronze Members Must Select A Service Category"}), {
                headers: { "content-type": "application/json" },
                status: 400,
            })
        }

        const canHaveSubAccount = createCustomerPayload.membershipLevel === $Enums.Membership.Silver || createCustomerPayload.membershipLevel === $Enums.Membership.Gold
        if (!canHaveSubAccount && createCustomerPayload.subAccountInfo) {
            return new NextResponse(JSON.stringify({ error: "Failed To Create Customer. \n Only Silver Or Gold Members Can Have Sub Accounts"}), {
                headers: { "content-type": "application/json" },
                status: 400,
            })
        }




        const { franchise_code } = user.publicMetadata

        const { subAccountInfo, ...mainUserInfo } = createCustomerPayload
        const mainUser: Customer = mainUserInfo

        let membershipDates = {}

        switch (mainUser.membershipLevel) {
            case $Enums.Membership.GoldNonActive:
                membershipDates = {
                    membershipPurchaseDate: new Date(),
                }
                break
            case $Enums.Membership.SilverNonActive:
                membershipDates = {
                    membershipPurchaseDate: new Date(),
                }
                break
            case $Enums.Membership.BronzeNonActive:
                membershipDates = {
                    membershipPurchaseDate: new Date(),
                }
                break
            case $Enums.Membership.Gold:
                membershipDates = {
                    membershipPurchaseDate: new Date(),
                    membershipActivationDate: new Date()
                }
                break
            case $Enums.Membership.Silver:
                membershipDates = {
                    membershipPurchaseDate: new Date(),
                    membershipActivationDate: new Date()
                }
                break
            case $Enums.Membership.Bronze:
                membershipDates = {
                    membershipPurchaseDate: new Date(),
                    membershipActivationDate: new Date()
                }
                break
            default:
                membershipDates = {}
        }
        const result = await prisma.$transaction(async (tx) => {

            const createdCustomer = await prisma.customer.create({
                data: {
                    ...mainUserInfo,
                    serviceCategorySelection: mainUserInfo.serviceCategorySelection || null,
                    createdAtFranchiseCode: franchise_code,
                    ...membershipDates
                },
            });

            if (subAccountInfo) {
                await prisma.customer.create({
                    data: {
                        ...subAccountInfo,
                        membershipLevel: createdCustomer.membershipLevel,
                        serviceCategorySelection: createdCustomer.serviceCategorySelection || null,
                        parentId: createdCustomer.id,
                        ...membershipDates,
                        createdAtFranchiseCode: franchise_code
                    },
                });
            }
        })



        // Send the created customer as a response
        return new NextResponse(JSON.stringify(result), {
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
        // @ts-ignore
        return new NextResponse(JSON.stringify({ error: `Failed To Update Customer: ${error.message}`}), {
            headers: { "content-type": "application/json" },
            status: 500,
        })
    }

}
