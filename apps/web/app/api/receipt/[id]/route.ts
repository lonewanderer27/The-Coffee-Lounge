import { NextRequest, NextResponse } from "next/server";

import appCheck from "../../../../appCheck";
import { getFirestore } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  const res = await appCheck(req);

  if (!res.success) {
    return NextResponse.json({
      message: res.message,
      success: false
    }, {
      status: res.status.status,
      statusText: res.status.statusText
    })
  }



  return NextResponse.json({
    message: "If you're seeing this, that means App Check verification passed on the token you provided!",
    success: true
  })
}