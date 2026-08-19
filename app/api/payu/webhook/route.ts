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

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "";

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!payuKey || !payuSalt || !supabaseUrl || !serviceRoleKey) {
      console.error("PayU webhook configuration missing.");

      return NextResponse.json(
        {
          success: false,
          message: "Server configuration missing.",
        },
        { status: 500 }
      );
    }

    if (!txnid || !receivedHash) {
      console.error("PayU webhook missing transaction information.");

      return NextResponse.json(
        {
          success: false,
          message: "Transaction information missing.",
        },
        { status: 400 }
      );
    }

    const reverseHashString = additionalCharges
      ? `${additionalCharges}|${payuSalt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${payuKey}`
      : `${payuSalt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${payuKey}`;

    const calculatedHash = makeHash(reverseHashString);

    if (calculatedHash !== receivedHash) {
      console.error("PayU webhook hash mismatch:", {
        txnid,
        mihpayid,
      });

      return NextResponse.json(
        {
          success: false,
          message: "Hash verification failed.",
        },
        { status: 400 }
      );
    }

    // Only successful payments should activate bookings/membership.
    if (status !== "success") {
      console.log("PayU webhook received non-success payment:", {
        txnid,
        status,
      });

      return NextResponse.json({
        success: true,
        ignored: true,
        status,
      });
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    const now = new Date();

    // ---------------------------------------------------------
    // 1. Confirm the booking/payment
    // ---------------------------------------------------------

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
      console.error(
        "PayU webhook booking update failed:",
        paidUpdateError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Booking payment update failed.",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------------------
    // 2. Check whether this checkout contains Elite membership
    // ---------------------------------------------------------

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
        "PayU webhook membership search failed:",
        membershipOrderError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Membership search failed.",
        },
        { status: 500 }
      );
    }

    // Normal test payment — nothing else required.
    if (!membershipOrder) {
      return NextResponse.json({
        success: true,
        paymentUpdated: true,
        membership: false,
      });
    }

    // ---------------------------------------------------------
    // 3. Find the correct patient profile
    // ---------------------------------------------------------

    const profileEmail =
      membershipOrder.email || email;

    let profile:
      | {
          id: string;
          email: string | null;
          membership_status?: string | null;
          membership_expires_at?: string | null;
        }
      | null = null;

    // New payments:
    // udf1 contains the Supabase authenticated user id.
    if (udf1) {
      const {
        data: profileById,
        error: profileByIdError,
      } = await supabaseAdmin
        .from("patient_profiles")
        .select(
          "id, email, membership_status, membership_expires_at"
        )
        .eq("id", udf1)
        .maybeSingle();

      if (!profileByIdError && profileById) {
        profile = profileById;
      }
    }

    // Fallback for older payments created before udf1 was added.
    if (!profile && profileEmail) {
      const {
        data: profileByEmail,
        error: profileByEmailError,
      } = await supabaseAdmin
        .from("patient_profiles")
        .select(
          "id, email, membership_status, membership_expires_at"
        )
        .ilike("email", profileEmail.trim())
        .maybeSingle();

      if (!profileByEmailError && profileByEmail) {
        profile = profileByEmail;
      }
    }

    if (!profile?.id) {
      console.error(
        "PayU webhook could not find patient profile:",
        {
          txnid,
          mihpayid,
          udf1,
          profileEmail,
        }
      );

      return NextResponse.json(
        {
          success: false,
          message: "Patient profile not found.",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------------------
    // 4. Activate Elite membership
    // ---------------------------------------------------------

    /*
      IMPORTANT:

      PayU can retry webhooks.

      Therefore, if this membership is already ACTIVE and has a
      valid expiry date, we should NOT keep adding another 365 days
      every time PayU retries the webhook.
    */

    const existingExpiry = profile.membership_expires_at
      ? new Date(profile.membership_expires_at)
      : null;

    const membershipAlreadyActive =
      String(profile.membership_status || "").toLowerCase() ===
        "active" &&
      existingExpiry &&
      existingExpiry.getTime() > now.getTime();

    let membershipStartedAt = now;
    let membershipExpiresAt = new Date(now);

    membershipExpiresAt.setDate(
      membershipExpiresAt.getDate() + 365
    );

    if (membershipAlreadyActive && existingExpiry) {
      membershipExpiresAt = existingExpiry;
    }

    const { error: membershipUpdateError } =
      await supabaseAdmin
        .from("patient_profiles")
        .update({
          membership_plan:
            "Cytocare Elite Membership - ₹89/year",

          membership_status: "active",

          ...(membershipAlreadyActive
            ? {}
            : {
                membership_started_at:
                  membershipStartedAt.toISOString(),
              }),

          membership_expires_at:
            membershipExpiresAt.toISOString(),

          updated_at: now.toISOString(),
        })
        .eq("id", profile.id);

    if (membershipUpdateError) {
      console.error(
        "PayU webhook membership activation failed:",
        membershipUpdateError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Membership activation failed.",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------------------
    // 5. Add first Elite family member
    // ---------------------------------------------------------

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
      membershipOrder.membership_member_relation ||
      "Self";

    const { data: existingMember } = await supabaseAdmin
      .from("elite_family_members")
      .select("id")
      .eq("user_id", profile.id)
      .ilike("full_name", memberName.trim())
      .maybeSingle();

    if (existingMember?.id) {
      const { error: familyUpdateError } =
        await supabaseAdmin
          .from("elite_family_members")
          .update({
            phone: memberPhone || null,
            relation: memberRelation,
            is_active: true,
            updated_at: now.toISOString(),
          })
          .eq("id", existingMember.id);

      if (familyUpdateError) {
        console.error(
          "Elite family member update error:",
          familyUpdateError
        );
      }
    } else {
      const { error: familyInsertError } =
        await supabaseAdmin
          .from("elite_family_members")
          .insert({
            user_id: profile.id,
            full_name: memberName,
            phone: memberPhone || null,
            relation: memberRelation,
            age: null,
            gender: null,
            is_active: true,
            updated_at: now.toISOString(),
          });

      if (familyInsertError) {
        console.error(
          "Elite family member insert error:",
          familyInsertError
        );
      }
    }

    console.log(
      "PayU Elite membership successfully activated:",
      {
        txnid,
        mihpayid,
        userId: profile.id,
      }
    );

    return NextResponse.json({
      success: true,
      paymentUpdated: true,
      membership: true,
      membershipActivated: true,
    });
  } catch (error) {
    console.error("PayU webhook unexpected error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Webhook processing failed.",
      },
      { status: 500 }
    );
  }
}