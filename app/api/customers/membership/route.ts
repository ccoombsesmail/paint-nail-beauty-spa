import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, $Enums, Prisma } from '@prisma/client';
import { canUpgradeToGold } from '../utils/canUpgradeToGold';
import { nonActiveMembershipLevels, silverOrGold } from '../../../types/enums';

const prisma = new PrismaClient()

export async function PATCH(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams

  const masterCode = searchParams.get('code')
  const unlock = masterCode === 'pnbs'
  try {
    const body: {newMembershipLevel: string, customerId: string } = await req.json();

    // Create a new user record in the database using the parsed data
    const customer = await prisma.customer.findUnique({
      where: { id: body.customerId },
      include: {
        subAccount: true
      }
    });

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
    const membershipChange = `${customer.membershipLevel}_${body.newMembershipLevel}`;

    switch (membershipChange) {
      case `${$Enums.Membership.NonMember}_${$Enums.Membership.Bronze}`:
        canUpdate = true;
        break;
      case `${$Enums.Membership.NonMember}_${$Enums.Membership.Silver}`:
        canUpdate = true;
        break;
      case `${$Enums.Membership.NonMember}_${$Enums.Membership.Gold}`:
        canUpdate = true;
        break;
      case `${$Enums.Membership.NonMember}_${$Enums.Membership.BronzeNonActive}`:
        canUpdate = true;
        break;
      case `${$Enums.Membership.NonMember}_${$Enums.Membership.SilverNonActive}`:
        canUpdate = true;
        break;
      case `${$Enums.Membership.NonMember}_${$Enums.Membership.GoldNonActive}`:
        canUpdate = true;
        break;
      case `${$Enums.Membership.Bronze}_${$Enums.Membership.Gold}`:
        canUpdate = canUpgradeToGold(customer);
        break;
      case `${$Enums.Membership.Silver}_${$Enums.Membership.Gold}`:
        canUpdate = canUpgradeToGold(customer);
        break;
      case `${$Enums.Membership.Bronze}_${$Enums.Membership.Silver}`:
        canUpdate = false;
        break;
      case `${$Enums.Membership.GoldNonActive}_${$Enums.Membership.Gold}`:
        canUpdate = true;
        break;
      case `${$Enums.Membership.SilverNonActive}_${$Enums.Membership.Silver}`:
        canUpdate = true;
        break;
      case `${$Enums.Membership.BronzeNonActive}_${$Enums.Membership.Bronze}`:
        canUpdate = true;
        break;
      case `${$Enums.Membership.BronzeNonActive}_${$Enums.Membership.GoldNonActive}`:
        canUpdate = false;
        break;
      case `${$Enums.Membership.SilverNonActive}_${$Enums.Membership.GoldNonActive}`:
        canUpdate = false;
        break;
      case `${$Enums.Membership.BronzeNonActive}_${$Enums.Membership.SilverNonActive}`:
        canUpdate = false;
        break;
      default:
        canUpdate = false;
    }

    if (unlock) canUpdate = true
    if (!canUpdate) {
      return new NextResponse(JSON.stringify({ error: `Cannot Update Membership From ${customer.membershipLevel} to ${body.newMembershipLevel}`}), {
        headers: { "content-type": "application/json" },
        status: 400,
      })
    }

    console.log("Updating customer:", customer)
    console.log(`Attempting to update membership for user ${customer.id} from ${customer.membershipLevel} to ${body.newMembershipLevel}. canUpdate: ${canUpdate}`)

    let dataToUpdate: Prisma.CustomerUpdateInput
    if (nonActiveMembershipLevels.includes(customer.membershipLevel)) {
      dataToUpdate = {
        membershipLevel: body.newMembershipLevel as $Enums.Membership,
        membershipActivationDate: new Date()
      }
    } else if (customer.membershipLevel === $Enums.Membership.NonMember && nonActiveMembershipLevels.includes(body.newMembershipLevel)) {
      dataToUpdate = {
        membershipLevel: body.newMembershipLevel as $Enums.Membership,
        membershipPurchaseDate: new Date()
      }
    } else if (body.newMembershipLevel === $Enums.Membership.Gold ) {
      dataToUpdate = {
        membershipLevel: body.newMembershipLevel as $Enums.Membership,
        membershipPurchaseDate: new Date(),
        membershipActivationDate: new Date(),
        canTransferCashbackBalance: true,
        canTransferMembership: true
      }
    } else if (silverOrGold.includes(body.newMembershipLevel)) {
      dataToUpdate = {
        membershipLevel: body.newMembershipLevel as $Enums.Membership,
        membershipPurchaseDate: new Date(),
        membershipActivationDate: new Date(),
        canTransferMembership: true
      }
    } else {
      dataToUpdate = {
        membershipLevel: body.newMembershipLevel as $Enums.Membership,
        membershipPurchaseDate: new Date(),
        membershipActivationDate: new Date(),
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.customer.update({
        where: { id: body.customerId },
        data: {
          ...dataToUpdate
        },
      });
      if (customer.subAccount) {
        await tx.customer.update({
          where: { id: customer.subAccount.id },
          data: {
            ...dataToUpdate
          },
        });
      }
      return updatedUser
    })

    // Send the updated user as a response
    return new NextResponse(JSON.stringify(result), {
      headers: { "content-type": "application/json" },
      status: 200,
    })

    } catch (error) {
      console.error("Failed to update user membership:", error);
      return new NextResponse(JSON.stringify({ error: "Failed to update user membership"}), {
        headers: { "content-type": "application/json" },
        status: 500,
      })
    }

  }
