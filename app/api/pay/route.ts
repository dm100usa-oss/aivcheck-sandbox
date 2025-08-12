import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

function getBaseUrl() {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  return url || "http://localhost:3000";
}

function isValidUrl(u: string) {
  return /^https?:\/\/[\w.-]+\.[a-z]{2,}.*$/i.test(u.trim());
}

function isValidEmail(e?: string) {
  if (!e) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
}

export async function POST(req: NextRequest) {
  try {
    const { url, mode, email } = await req.json();

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: "Please enter a valid URL (including http/https)." },
        { status: 400 }
      );
    }

    if (mode !== "quick" && mode !== "pro") {
      return NextResponse.json({ error: "Invalid mode." }, { status: 400 });
    }

    // For full audit we expect email (for report delivery)
    if (mode === "pro" && !isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    const priceId =
      mode === "pro"
        ? process.env.STRIPE_PRICE_FULL
        : process.env.STRIPE_PRICE_QUICK;

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe price ID is not configured." },
        { status: 500 }
      );
    }

    const baseUrl = getBaseUrl();

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cancel`,
        customer_email: mode === "pro" ? email : undefined, // Stripe will send receipt to this email
        metadata: {
          url,
          mode,
          reportEmail: mode === "pro" ? email : "",
        },
        payment_intent_data: {
          metadata: {
            url,
            mode,
            reportEmail: mode === "pro" ? email : "",
          },
        },
        // Keep MVP simple; taxes/invoicing can be added later
        automatic_tax: { enabled: false },
      },
      {
        idempotencyKey: `pay_${mode}_${url}_${email || ""}`,
      }
    );

    return NextResponse.json({ sessionUrl: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Stripe session error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
