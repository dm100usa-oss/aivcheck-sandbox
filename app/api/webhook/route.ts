// app/api/webhook/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  // Sandbox stub
  return NextResponse.json({ received: true });
}

export const dynamic = "force-dynamic";
