import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.json({
    message: "The Coffee Lounge API is running!",
  }, {
    status: 200,
  })

  return res;
}