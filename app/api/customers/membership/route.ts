import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, $Enums } from '@prisma/client';
import { canUpgradeToGold } from '../utils/canUpgradeToGold';

const prisma = new PrismaClient()
export async function PATCH(req: NextRequest) {

  try {
    const body: {newMembershipLevel: string, customerId: string } = await req.json();

    // Create a new user record in the database using the parsed data
    const customer = await prisma.customer.findUnique({ where: { id: body.customerId } });

    if (!customer) {
      console.error("Could not locate customer");
      return new NextResponse(JSON.stringify({ error: "Could not locate customer"}), {
        headers: { "content-type": "application/json" },
        status: 400,
      })
    }
    if (customer.membershipLevel === body.newMembershipLevel) {
      return new NextResponse(JSON.stringify({ error: "New Membership Status Is the Same As The Current. No Update Made"}), {
        headers: { "content-type": "application/json" },
        status: 400,
      })
    }

    let canUpdate = false

    switch ([customer.membershipLevel, body.newMembershipLevel]) {
      case [$Enums.Membership.NonMember, $Enums.Membership.Bronze]:
        canUpdate = true
        break
      case [$Enums.Membership.NonMember, $Enums.Membership.Silver]:
        canUpdate = true
        break
      case [$Enums.Membership.NonMember, $Enums.Membership.Gold]:
        canUpdate = true
        break
      case [$Enums.Membership.Bronze, $Enums.Membership.Gold]:
        canUpdate = canUpgradeToGold(customer)
        break
      case [$Enums.Membership.Silver, $Enums.Membership.Gold]:
        canUpdate = canUpgradeToGold(customer)
        break
      case [$Enums.Membership.Bronze, $Enums.Membership.Silver]:
        canUpdate = false
        break
      default:
        canUpdate = false
    }

    console.log("Updating customer:", customer)
    console.log(`Attempting to update membership for user ${customer.id} from ${customer.membershipLevel} to ${body.newMembershipLevel}. canUpdate: ${canUpdate}`)
    const updatedUser = await prisma.customer.update({
      where: { id: body.customerId },
      data: {
        membershipLevel: body.newMembershipLevel as $Enums.Membership,
        membershipStartDate: new Date(),
      },
    });
    // Send the updated user as a response
    return new NextResponse(JSON.stringify(updatedUser), {
      headers: { "content-type": "application/json" },
      status: 200,
    })

    } catch (error) {
      console.error("Failed to update user membership:", error);
      return new NextResponse(JSON.stringify({ error: "Failed to update user membership"}), {
        headers: { "content-type": "application/json" },
        status: 400,
      })
    }

  }
