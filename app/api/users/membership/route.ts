import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, $Enums } from '@prisma/client';
import { canUpgradeToGold } from '../utils/canUpgradeToGold';
import { MembershipLevel } from '../../../types/enums';
import { log } from 'util';

const prisma = new PrismaClient()
export async function PATCH(req: NextRequest, res: NextResponse) {

  try {
    // Accumulate the request body content from the ReadableStream
    const body: {newMembershipLevel: MembershipLevel, userId:string} = await req.json();

    console.log(body)
    // Create a new user record in the database using the parsed data
    const user = await prisma.user.findUnique({ where: { id: body.userId } });

    if (!user) {
      console.error("Could not locate user");
      return new NextResponse(JSON.stringify({ error: "Could not locate user"}), {
        headers: { "content-type": "application/json" },
        status: 400,
      })
    }
    if (user.membershipLevel === body.newMembershipLevel) {
      return new NextResponse(JSON.stringify({ error: "New Membership Status Is the Same As The Current. No Update Made"}), {
        headers: { "content-type": "application/json" },
        status: 400,
      })
    }

    let canUpdate = false

    switch ([user.membershipLevel as MembershipLevel, body.newMembershipLevel]) {
      case [MembershipLevel.NonMember, MembershipLevel.Bronze]:
        canUpdate = true
        break
      case [MembershipLevel.NonMember, MembershipLevel.Silver]:
        canUpdate = true
        break
      case [MembershipLevel.NonMember, MembershipLevel.Gold]:
        canUpdate = true
        break
      case [MembershipLevel.Bronze, MembershipLevel.Gold]:
        canUpdate = canUpgradeToGold(user)
        break
      case [MembershipLevel.Silver, MembershipLevel.Gold]:
        canUpdate = canUpgradeToGold(user)
        break
      case [MembershipLevel.Bronze, MembershipLevel.Silver]:
        canUpdate = false
        break
      default:
        canUpdate = false
    }

    console.log("Updating user:", user)
    console.log(`Attempting to update membership for user ${user.id} from ${user.membershipLevel} to ${body.newMembershipLevel}. canUpdate: ${canUpdate}`)
    const updatedUser = await prisma.user.update({
      where: { id: body.userId },
      data: {
        membershipLevel: body.newMembershipLevel,
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
