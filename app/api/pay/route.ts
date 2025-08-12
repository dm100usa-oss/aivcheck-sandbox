import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const stripeSecret = process.env.STRIPE_SECRET_KEY!;
const priceQuick = process.env.STRIPE_PRICE_QUICK!; // 9.99
const priceFull = process.env.STRIPE_PRICE_FULL!;   // 19.99

const stripe = new Stripe(stripeSecret);

export async function POST(req: NextRequest) {
  try {
    const { mode, url, email } = (await req.json()) as {
      mode: "quick" | "pro";
      url: string;
      email?: string;
    };

    if (!url || !/^https?:\/\/[\w.-]+\.[a-z]{2,}.*$/i.test(url)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    if (mode === "pro" && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "https://aivcheck-sandbox.vercel.app";
    const successUrl = `${origin}/?paid=1`;
    const cancelUrl = `${origin}/?canceled=1`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: mode === "quick" ? priceQuick : priceFull, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { mode, url, email: email || "" },
      customer_email: mode === "pro" ? email : undefined
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe error:", err?.message || err);
    return NextResponse.json({ error: "Payment init failed" }, { status: 500 });
  }
}
