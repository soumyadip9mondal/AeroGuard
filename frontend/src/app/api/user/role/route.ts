import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { role } = await req.json();

    if (!role) {
      return new NextResponse('Role is required', { status: 400 });
    }

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role,
      }
    });

    // Sync user to the local Postgres database via node-api
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress;
    
    if (email) {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/v1/auth/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName: user.firstName,
          lastName: user.lastName,
          role,
        })
      }).catch(err => console.error('Failed to sync user to DB:', err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating role:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
