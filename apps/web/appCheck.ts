import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAppCheck } from 'firebase-admin/app-check';

export default async function appCheck(req: NextRequest): Promise<{
  message?: string,
  status?: {
    status: number,
    statusText: string
  },
  success: boolean
}> {
  const token = req.headers.get('X-Firebase-AppCheck');

  // If there is no token, return a 401
  if (!token) {
    console.log('No Firebase AppCheck token found')
    return {
      message: 'No Firebase AppCheck token found',
      status: {
        status: 401,
        statusText: 'Unauthorized'
      },
      success: false
    }
  }

  // Check if the AppCheck token is valid
  try {
    const claims = await getAppCheck().verifyToken(token);
    console.info('AppCheck claims', claims);
    return { success: true };
  } catch (err) {
    console.error('AppCheck error', err);
    return {
      message: 'Invalid Firebase AppCheck token',
      status: {
        status: 401,
        statusText: 'Unauthorized'
      },
      success: false
    }
  }
}