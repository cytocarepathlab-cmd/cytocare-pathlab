import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

function makeHash(value: string) {
  return crypto.createHash("sha512").update(value).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const amount = Number(body.amount);
    const checkoutGroupKey = String(body.checkoutGroupKey || "");
    const patientName = String(body.patientName || "Patient").trim();
    const patientEmail = String(body.patientEmail || "").trim();
    const patientPhone = String(body.patientPhone || "").trim();

    const payuKey = process.env.PAYU_KEY;
    const payuSalt = process.env.PAYU_SALT;
    const payuMode = process.env.PAYU_MODE || "live";
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://cytocarepathlab.com";

    if (!payuKey || !payuSalt) {
      return NextResponse.json(
        { success: false, message: "PayU key or salt is missing." },
        { status: 500 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid payment amount." },
        { status: 400 }
      );
    }

    if (!checkoutGroupKey) {
      return NextResponse.json(
        { success: false, message: "Checkout reference is missing." },
        { status: 400 }
      );
    }

    if (!patientEmail || !patientPhone) {
      return NextResponse.json(
        { success: false, message: "Patient email or phone is missing." },
        { status: 400 }
      );
    }

    const txnid = checkoutGroupKey;
    const formattedAmount = amount.toFixed(2);
    const productinfo = "Cytocare Path Lab Booking";
    const firstname = patientName || "Patient";
    const email = patientEmail;

    const surl = `${siteUrl}/api/payu/success`;
    const furl = `${siteUrl}/api/payu/failure`;

    const hashString = `${payuKey}|${txnid}|${formattedAmount}|${productinfo}|${firstname}|${email}|||||||||||${payuSalt}`;
    const hash = makeHash(hashString);

    const payuBaseUrl =
      payuMode === "test" ? "https://test.payu.in" : "https://secure.payu.in";

    return NextResponse.json({
      success: true,
      action: `${payuBaseUrl}/_payment`,
      params: {
        key: payuKey,
        txnid,
        amount: formattedAmount,
        productinfo,
        firstname,
        email,
        phone: patientPhone,
        surl,
        furl,
        hash,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create PayU payment.";

    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}