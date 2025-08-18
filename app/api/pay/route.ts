// app/api/pay/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Sandbox: pretend payment success and go to /success
  const url = new URL("/success", req.url);
  return NextResponse.redirect(url, { status: 302 });
}

export const dynamic = "force-dynamic";
