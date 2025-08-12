import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    const meta = session.metadata || {};
    return NextResponse.json(
      {
        status: session.status,
        payment_status: session.payment_status,
        url: meta.url || null,
        mode: (meta.mode as "quick" | "pro") || null,
        reportEmail: meta.reportEmail || session.customer_details?.email || null,
        customer_email: session.customer_details?.email || null,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Fetch session error:", err);
    return NextResponse.json({ error: "Failed to fetch session." }, { status: 500 });
  }
}
