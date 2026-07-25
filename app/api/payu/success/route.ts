import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const runtime = "nodejs";

function makeHash(value: string) {
  return crypto.createHash("sha512").update(value).digest("hex");
}

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) || "");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const status = getValue(formData, "status");
    const txnid = getValue(formData, "txnid");
    const amount = getValue(formData, "amount");
    const productinfo = getValue(formData, "productinfo");
    const firstname = getValue(formData, "firstname");
    const email = getValue(formData, "email");
    const receivedHash = getValue(formData, "hash");
    const mihpayid = getValue(formData, "mihpayid");
    const mode = getValue(formData, "mode");

    const payuKey = process.env.PAYU_KEY || "";
    const payuSalt = process.env.PAYU_SALT || "";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://cytocarepathlab.com";

    if (!payuKey || !payuSalt || !supabaseUrl || !serviceRoleKey) {
      return NextResponse.redirect(
        `${siteUrl}/patient-dashboard?payment=configuration-error`,
        303
      );
    }

    const reverseHashString = `${payuSalt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${payuKey}`;
    const calculatedHash = makeHash(reverseHashString);

    if (calculatedHash !== receivedHash) {
      return NextResponse.redirect(
        `${siteUrl}/patient-dashboard?payment=hash-mismatch`,
        303
      );
    }

    if (status !== "success") {
      return NextResponse.redirect(
        `${siteUrl}/patient-dashboard?payment=failed`,
        303
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    await supabaseAdmin
      .from("cytocare_bookings")
      .update({
        payment_status: "Paid",
        booking_status: "Booking Confirmed",
        amount_paid: Number(amount) || 0,
        checkout_amount_paid: Number(amount) || 0,
        payment_reference: mihpayid || txnid,
        payment_mode: mode || "PayU",
        updated_at: new Date().toISOString(),
      })
      .eq("checkout_group_key", txnid);

    return NextResponse.redirect(
      `${siteUrl}/patient-dashboard?payment=success`,
      303
    );
  } catch {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://cytocarepathlab.com";

    return NextResponse.redirect(
      `${siteUrl}/patient-dashboard?payment=error`,
      303
    );
  }
}