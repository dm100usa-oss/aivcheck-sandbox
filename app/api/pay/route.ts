import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

export async function POST(req: Request) {
  try {
    const { mode, url } = await req.json();
    const kind = mode === "pro" ? "pro" : "quick";

    const price =
      kind === "pro"
        ? process.env.STRIPE_PRICE_FULL
        : process.env.STRIPE_PRICE_QUICK;

    if (!price) {
      return NextResponse.json(
        { error: "Price not configured" },
        { status: 500 }
      );
    }

    const base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price, quantity: 1 }],
      success_url: `${base}/success?mode=${kind}`,
      cancel_url: `${base}/`,
      locale: "en", // force English UI
      billing_address_collection: "auto",
      metadata: { url, mode: kind },
      allow_promotion_codes: false,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Create session failed" },
      { status: 500 }
    );
  }
}
