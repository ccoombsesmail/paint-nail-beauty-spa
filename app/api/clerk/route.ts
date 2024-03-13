import { NextRequest, NextResponse } from 'next/server';
import { WebhookEvent } from '@clerk/backend';
import { Webhook } from 'svix';
import prisma from '../../database/prismaClient';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const headers = req.headers;
    const svixHeaders = {
      'svix-id': headers.get('svix-id')!,
      'svix-timestamp': headers.get('svix-timestamp')!,
      'svix-signature': headers.get('svix-signature')!
    };
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET as string);
    const payload = wh.verify(JSON.stringify(body), svixHeaders) as WebhookEvent;
    switch (payload.type) {
      case 'user.created':
        await createEmployee(payload.data);
        break;
      case 'user.deleted':
        await deleteEmployee(payload.data.id || '');
        break;
      case 'user.updated':
        await updateEmployee(payload.data)
        break;
      default:
        console.log(`Unhandled event type: ${payload.type}`);
    }

    return new Response(null, {
      status: 200
    });
  } catch (err) {
    console.error(err);
    return new Response('Webhook Error', {
      status: 400
    });
  }

}


async function createEmployee(userData: any) {
  const { id, email_addresses, first_name, last_name, image_url, last_sign_in_at } = userData;
  const email = email_addresses.length > 0 ? email_addresses[0].email_address : null;

  await prisma.employee.create({
    data: {
      userId: id,
      email: email,
      firstName: first_name,
      lastName: last_name,
      profileImage: image_url,
      franchiseCode: '',
      lastSignIn: last_sign_in_at ? new Date(last_sign_in_at) : null
    }
  });
}

async function updateEmployee(userData: any) {
  const { id, email_addresses, first_name, last_name, image_url, last_sign_in_at, public_metadata } = userData;
  const { phone_number, franchise_code } = public_metadata;
  const email = email_addresses.length > 0 ? email_addresses[0].email_address : null;

  await prisma.employee.update({
    where: {
      userId: id
    },
    data: {
      userId: id,
      email: email,
      firstName: first_name,
      lastName: last_name,
      profileImage: image_url,
      phoneNumber: phone_number ? phone_number.toString() : null,
      franchiseCode: franchise_code,
      lastSignIn: last_sign_in_at ? new Date(last_sign_in_at) : null
    }
  });

}


async function deleteEmployee(userId: string) {
  await prisma.employee.delete({
    where: {
      userId: userId
    }
  });
}

