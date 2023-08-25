import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAppCheck } from "firebase-admin/app-check";

export async function middleware(req: NextRequest) {
  const token = req.headers.get('X-Firebase-AppCheck');

  // If there is no token, return a 401
  if (!token) {
    console.log('No Firebase AppCheck token found')
    return NextResponse.json({
      message: 'No Firebase AppCheck token found'
    }, {
      status: 401,
      statusText: 'Unauthorized'
    })
  }

  // Check if the AppCheck token is valid
  try {
    const claims = await getAppCheck().verifyToken(token);
    console.info('AppCheck claims', claims);
    return NextResponse.next();
  } catch (err) {
    console.error('AppCheck error', err);
    return NextResponse.json({
      message: 'Invalid Firebase AppCheck token'
    }, {
      status: 401,
      statusText: 'Unauthorized'
    })
  }
}

export const config = {
  matcher: '/api/receipt/:path*'
}