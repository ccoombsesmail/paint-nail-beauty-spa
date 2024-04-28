import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '../../../database/prismaClient';
import { clerkClient } from '@clerk/nextjs/server';
import { User } from '@clerk/backend';
import { EmployeePostData } from '../../../client-api/organizations/organization-queries';
import { $Enums, OrganizationRole, Prisma } from '@prisma/client';
import {
  clerkToPostgresRoleTypeEnumMap,
  membershipTypeEnumMap,
  organizationRoleTypeEnumMap
} from '../../../types/enums';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const organizationId = searchParams.get('organizationId');

  const user = await currentUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'User Not Authorized' }), {
      headers: { 'content-type': 'application/json' },
      status: 401
    });
  }

  const { sessionClaims } = auth();

  if (organizationId && sessionClaims?.org_id === organizationId) {
    const members = await prisma.employee.findMany({
      where: {
        organizationId: organizationId
      }
    });

    const formattedEmployees = members.map(u => {
      return {
        ...u,
        // @ts-ignore
        membershipLevel: membershipTypeEnumMap.get(u.membershipLevel),
        phoneNumber: u.phoneNumber ? `${u.phoneNumber}` : null,
        organizationRole: u.organizationRole
      };
    });

    return NextResponse.json({ members: formattedEmployees });
  }
}


export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'User Not Authorized' }), {
        headers: { 'content-type': 'application/json' },
        status: 401
      });
    }

    const body = await req.json();
    const {
      organizationId,
      organizationRole,
      firstName,
      lastName,
      phoneNumber,
      notes,
      email,
      address,
      employmentStatus
    }: EmployeePostData = body;

    let newUserResponse: User | undefined;
    let orgResponse: any;
    let newOrgMember: any;

    const transaction = await prisma.$transaction(async (prisma) => {
      try {
        newUserResponse = await clerkClient.users.createUser({
          firstName,
          lastName,
          emailAddress: [email || `${firstName}.${lastName}@${lastName}.pnbs`],
          password: 'pnbs-12345678'
        });

        orgResponse = await clerkClient.organizations.createOrganizationMembership({
          organizationId,
          userId: newUserResponse.id,
          role: organizationRole
        });

        newOrgMember = await prisma.employee.create({
          data: {
            userId: newUserResponse.id,
            firstName,
            lastName,
            email: newUserResponse.emailAddresses[0].emailAddress,
            phoneNumber,
            organizationId,
            organizationRole: clerkToPostgresRoleTypeEnumMap.get(organizationRole) as OrganizationRole,
            notes,
            address,
            employmentStatus: employmentStatus as $Enums.EmploymentStatus
          }
        });

        return newOrgMember;
      } catch (error: Error | any) {
        console.error('Error in creating Clerk user or org membership', error);
        try {
          if (newUserResponse) {
            await clerkClient.users.deleteUser(newUserResponse.id);
          }
          if (newUserResponse && orgResponse) {
            await clerkClient.organizations.deleteOrganizationMembership({ userId: newUserResponse.id, organizationId });
          }
        } catch (cleanupError: Error | any) {
          console.error('Cleanup failed', cleanupError);
          throw new Error('Cleanup failed: ' + cleanupError?.message);
        }
        throw error;
      }
    });

    return new NextResponse(JSON.stringify(transaction), {
      headers: { 'content-type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Failed To Create New Member:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed To Create New Member' }), {
      headers: { 'content-type': 'application/json' },
      status: 500
    });
  }
}


export async function PATCH(req: NextRequest) {

  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'User Not Authorized' }), {
        headers: { 'content-type': 'application/json' },
        status: 401
      });
    }
    const { sessionClaims } = auth();


    const body = await req.json();
    const {
      organizationRole,
      firstName,
      lastName,
      phoneNumber,
      notes,
      address,
      employmentStatus,
      userId
    }: EmployeePostData = body;

    if (!userId) {
      return new NextResponse(JSON.stringify({ error: 'Employee ID Not Provided' }), {
        headers: { 'content-type': 'application/json' },
        status: 401
      });
    }

    let updatedUserResponse: User;
    try {
      updatedUserResponse = await clerkClient.users.updateUser(userId, {
        firstName,
        lastName
      });
    } catch (e) {
      console.log('Failed To Update Clerk User', e);
      return new NextResponse(JSON.stringify({ error: 'Failed To Update Clerk User' }), {
        headers: { 'content-type': 'application/json' },
        status: 500
      });
    }


    if (!sessionClaims?.org_id) {
      return new NextResponse(JSON.stringify({ error: 'No Organization ID Provided' }), {
        headers: { 'content-type': 'application/json' },
        status: 401
      });
    }

    try {
      const role = organizationRoleTypeEnumMap.get(organizationRole)
      if (role) {
        await clerkClient.organizations.updateOrganizationMembership(
          {
            organizationId: sessionClaims?.org_id,
            userId,
            role
          })
      } else {
        throw Error("Role Does Not exist")
      }
    } catch (e) {
      console.log('Failed To Update Org Member', e);
      return new NextResponse(JSON.stringify({ error: 'Failed To Add Employee to Organization' }), {
        headers: { 'content-type': 'application/json' },
        status: 500
      });
    }

    const newOrgMember = await prisma.employee.update({
      where: {
        userId: updatedUserResponse.id
      },
      data: {
        firstName,
        lastName,
        phoneNumber,
        organizationRole: organizationRole as $Enums.OrganizationRole,
        address,
        notes,
        employmentStatus: employmentStatus as $Enums.EmploymentStatus
      }
    });

    return new NextResponse(JSON.stringify(newOrgMember), {
      headers: { 'content-type': 'application/json' },
      status: 200
    });


  } catch (error) {
    console.error('Failed to create transaction:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed To Create Transaction' }), {
      headers: { 'content-type': 'application/json' },
      status: 500
    });
  }

}


export async function DELETE(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const idToDelete = searchParams.get('employeeId')
  const { sessionClaims } = auth();

  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'User Not Authorized' }), {
        headers: { 'content-type': 'application/json' },
        status: 401
      });
    }
    if (!idToDelete) {
      return new NextResponse(JSON.stringify({ error: 'No ID Provided To Delete' }), {
        headers: { 'content-type': 'application/json' },
        status: 401
      });
    }
    if (!sessionClaims?.org_id) {
      return new NextResponse(JSON.stringify({ error: 'Associated Org Id Not Found' }), {
        headers: { 'content-type': 'application/json' },
        status: 401
      });
    }


    const transaction = await prisma.$transaction(async (prisma) => {
      try {
        await clerkClient.users.deleteUser(idToDelete);

        await prisma.employee.delete({
          where: {
            userId: idToDelete
          }
        });

        return { success: true };
      } catch (error: Error | any) {
        console.error('Error in Deleting Clerk user or Org Membership', error);
        throw error;
      }
    });

    return new NextResponse(JSON.stringify(transaction), {
      headers: { 'content-type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Failed To Deleting Member:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed To Delete Member' }), {
      headers: { 'content-type': 'application/json' },
      status: 500
    });
  }
}
