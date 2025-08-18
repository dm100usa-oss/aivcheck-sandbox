// app/api/session/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  // Sandbox stub
  return NextResponse.json({ ok: true, session: null });
}

export const dynamic = "force-dynamic";
