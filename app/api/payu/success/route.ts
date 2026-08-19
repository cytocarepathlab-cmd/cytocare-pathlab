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
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://cytocarepathlab.com";

  try {
    const formData = await request.formData();

    const status = getValue(formData, "status");
    const txnid = getValue(formData, "txnid");
    const amount = getValue(formData, "amount");
    const productinfo = getValue(formData, "productinfo");
    const firstname = getValue(formData, "firstname");
    const email = getValue(formData, "email");
    const udf1 = getValue(formData, "udf1");
const udf2 = getValue(formData, "udf2");
const udf3 = getValue(formData, "udf3");
const udf4 = getValue(formData, "udf4");
const udf5 = getValue(formData, "udf5");
    const receivedHash = getValue(formData, "hash");
    const mihpayid = getValue(formData, "mihpayid");
    const mode = getValue(formData, "mode");

    const additionalCharges =
      getValue(formData, "additionalCharges") ||
      getValue(formData, "additional_charges");

    const payuKey = process.env.PAYU_KEY || "";
    const payuSalt = process.env.PAYU_SALT || "";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!payuKey || !payuSalt || !supabaseUrl || !serviceRoleKey) {
      return NextResponse.redirect(
        `${siteUrl}/patient-dashboard?payment=configuration-error`,
        303
      );
    }

    const reverseHashString =
  additionalCharges
    ? `${additionalCharges}|${payuSalt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${payuKey}`
    : `${payuSalt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${payuKey}`;

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
    const now = new Date();

    const { error: paidUpdateError } = await supabaseAdmin
      .from("cytocare_bookings")
      .update({
        payment_status: "Paid",
        booking_status: "Booking Confirmed",
        amount_paid: Number(amount) || 0,
        checkout_amount_paid: Number(amount) || 0,
        payment_reference: mihpayid || txnid,
        payment_mode: mode || "PayU",
        updated_at: now.toISOString(),
      })
      .eq("checkout_group_key", txnid);

    if (paidUpdateError) {
      return NextResponse.redirect(
        `${siteUrl}/patient-dashboard?payment=booking-update-error`,
        303
      );
    }

    
const {
  data: membershipOrder,
  error: membershipOrderError,
} = await supabaseAdmin
  .from("cytocare_bookings")
  .select("*")
  .eq("checkout_group_key", txnid)
  .eq("order_type", "elite_membership")
  .maybeSingle();

if (membershipOrderError) {
  console.error(
    "Elite membership booking search failed:",
    membershipOrderError
  );

  return NextResponse.redirect(
    `${siteUrl}/patient-dashboard?payment=membership-search-error`,
    303
  );
}

    if (membershipOrder) {
      const membershipExpiresAt = new Date();
      membershipExpiresAt.setDate(membershipExpiresAt.getDate() + 365);

      const memberName =
        membershipOrder.membership_member_name ||
        membershipOrder.name ||
        firstname ||
        "Elite Member";

      const memberPhone =
        membershipOrder.membership_member_phone ||
        membershipOrder.phone ||
        "";

      const memberRelation =
        membershipOrder.membership_member_relation || "Self";

      const profileEmail = membershipOrder.email || email;

     let profile:
  | {
      id: string;
      email: string | null;
    }
  | null = null;


// FIRST CHOICE:
// Exact logged-in Supabase user ID carried in udf1.

if (udf1) {
  const {
    data: profileById,
    error: profileByIdError,
  } = await supabaseAdmin
    .from("patient_profiles")
    .select("id, email")
    .eq("id", udf1)
    .maybeSingle();

  if (!profileByIdError && profileById) {
    profile = profileById;
  }
}


// FALLBACK:
// Existing bookings/payments created before udf1 was added.

if (!profile) {
  const {
    data: profileByEmail,
    error: profileByEmailError,
  } = await supabaseAdmin
    .from("patient_profiles")
    .select("id, email")
    .ilike("email", profileEmail)
    .maybeSingle();

  if (
    !profileByEmailError &&
    profileByEmail
  ) {
    profile = profileByEmail;
  }
}


if (!profile?.id) {
  console.error(
    "Elite membership profile not found",
    {
      txnid,
      udf1,
      profileEmail,
      mihpayid,
    }
  );

  return NextResponse.redirect(
    `${siteUrl}/patient-dashboard?payment=profile-not-found`,
    303
  );
}

      if (!profile?.id) {
        return NextResponse.redirect(
          `${siteUrl}/patient-dashboard?payment=profile-not-found`,
          303
        );
      }

      const { error: membershipUpdateError } = await supabaseAdmin
        .from("patient_profiles")
        .update({
          membership_plan: "Cytocare Elite Membership - ₹89/year",
          membership_status: "active",
          membership_started_at: now.toISOString(),
          membership_expires_at: membershipExpiresAt.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", profile.id);

      if (membershipUpdateError) {
        return NextResponse.redirect(
          `${siteUrl}/patient-dashboard?payment=membership-activation-error`,
          303
        );
      }

      await supabaseAdmin
        .from("cytocare_bookings")
        .update({
          order_type: "elite_membership",
          updated_at: now.toISOString(),
        })
        .eq("id", membershipOrder.id);

      const { data: existingMember } = await supabaseAdmin
        .from("elite_family_members")
        .select("id")
        .eq("user_id", profile.id)
        .eq("full_name", memberName)
        .maybeSingle();

      if (existingMember?.id) {
        await supabaseAdmin
          .from("elite_family_members")
          .update({
            phone: memberPhone || null,
            relation: memberRelation,
            is_active: true,
            updated_at: now.toISOString(),
          })
          .eq("id", existingMember.id);
      } else {
        await supabaseAdmin.from("elite_family_members").insert({
          user_id: profile.id,
          full_name: memberName,
          phone: memberPhone || null,
          relation: memberRelation,
          age: null,
          gender: null,
          is_active: true,
          updated_at: now.toISOString(),
        });
      }

      return NextResponse.redirect(
        `${siteUrl}/patient-dashboard?payment=success&membership=active`,
        303
      );
    }

    return NextResponse.redirect(
      `${siteUrl}/patient-dashboard?payment=success`,
      303
    );
  } catch (error) {
    console.error("PayU success error:", error);

    return NextResponse.redirect(
      `${siteUrl}/patient-dashboard?payment=error`,
      303
    );
  }
}