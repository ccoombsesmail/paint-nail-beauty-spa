import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';


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
    const { is_admin }: { is_admin: boolean } = user.publicMetadata as { is_admin: boolean };

    const body = await req.json();
    const {
      shouldDisable
    } = body;

    if (!is_admin || !sessionClaims?.org_id) {
      return new NextResponse(JSON.stringify({ error: 'Not Authorized To Perform That Action' }), {
        headers: { 'content-type': 'application/json' },
        status: 401
      });
    }
    const res = await clerkClient.organizations.updateOrganization(sessionClaims?.org_id, {
      publicMetadata: {
        is_org_enabled: shouldDisable
      }
    })



    return new NextResponse(JSON.stringify({ isEnabled: res.publicMetadata?.is_org_enabled }), {
      headers: { 'content-type': 'application/json' },
      status: 200
    });


  } catch (e) {
    console.log('Failed To Update Organization', e);
    return new NextResponse(JSON.stringify({ error: 'Failed To Update Organization' }), {
      headers: { 'content-type': 'application/json' },
      status: 500
    });
  }

}
