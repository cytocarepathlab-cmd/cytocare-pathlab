import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Server configuration is incomplete.",
        },
        { status: 500 }
      );
    }

    const authorization =
      request.headers.get("authorization") || "";

    const accessToken = authorization.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : "";

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin login required.",
        },
        { status: 401 }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid admin session.",
        },
        { status: 401 }
      );
    }

    const { data: adminUser } =
      await supabaseAdmin
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

    if (!adminUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const itemId = String(body?.itemId || "").trim();

    if (!itemId) {
      return NextResponse.json(
        {
          success: false,
          message: "Billed test ID is missing.",
        },
        { status: 400 }
      );
    }

    const { data: item, error: itemError } =
      await supabaseAdmin
        .from("cytocare_client_bill_items")
        .select(
          `
          id,
          bill_patient_id,
          rate,
          patient:cytocare_client_bill_patients (
            id,
            bill_id,
            discount_amount
          )
          `
        )
        .eq("id", itemId)
        .maybeSingle();

    if (itemError || !item) {
      return NextResponse.json(
        {
          success: false,
          message:
            itemError?.message ||
            "Billed test could not be found.",
        },
        { status: 404 }
      );
    }

    const patientRelation = Array.isArray(item.patient)
      ? item.patient[0]
      : item.patient;

    const patientId =
      item.bill_patient_id ||
      patientRelation?.id;

    const billId =
      patientRelation?.bill_id;

    if (!patientId || !billId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Billing relationship is incomplete.",
        },
        { status: 500 }
      );
    }

    const { error: deleteError } =
      await supabaseAdmin
        .from("cytocare_client_bill_items")
        .delete()
        .eq("id", itemId);

    if (deleteError) {
      return NextResponse.json(
        {
          success: false,
          message: deleteError.message,
        },
        { status: 500 }
      );
    }

    // Recalculate the affected patient after deleting the test.
    const { data: remainingItems, error: remainingError } =
      await supabaseAdmin
        .from("cytocare_client_bill_items")
        .select("rate")
        .eq("bill_patient_id", patientId);

    if (remainingError) {
      return NextResponse.json(
        {
          success: false,
          message: remainingError.message,
        },
        { status: 500 }
      );
    }

    const patientGross = (remainingItems ?? []).reduce(
      (sum, row) => sum + Number(row.rate || 0),
      0
    );

    const oldDiscount =
      Number(patientRelation?.discount_amount || 0);

    const patientDiscount = Math.min(
      oldDiscount,
      patientGross
    );

    const patientFinal =
      patientGross - patientDiscount;

    const { error: patientUpdateError } =
      await supabaseAdmin
        .from("cytocare_client_bill_patients")
        .update({
          gross_amount: patientGross,
          discount_amount: patientDiscount,
          final_amount: patientFinal,
          updated_at: new Date().toISOString(),
        })
        .eq("id", patientId);

    if (patientUpdateError) {
      return NextResponse.json(
        {
          success: false,
          message: patientUpdateError.message,
        },
        { status: 500 }
      );
    }

    // Recalculate the whole billing cycle.
    const { data: billPatients, error: billPatientsError } =
      await supabaseAdmin
        .from("cytocare_client_bill_patients")
        .select(
          "gross_amount, discount_amount, final_amount"
        )
        .eq("bill_id", billId);

    if (billPatientsError) {
      return NextResponse.json(
        {
          success: false,
          message: billPatientsError.message,
        },
        { status: 500 }
      );
    }

    const billGross = (billPatients ?? []).reduce(
      (sum, row) =>
        sum + Number(row.gross_amount || 0),
      0
    );

    const billDiscount = (billPatients ?? []).reduce(
      (sum, row) =>
        sum + Number(row.discount_amount || 0),
      0
    );

    const billFinal = (billPatients ?? []).reduce(
      (sum, row) =>
        sum + Number(row.final_amount || 0),
      0
    );

    const { error: billUpdateError } =
      await supabaseAdmin
        .from("cytocare_client_bills")
        .update({
          gross_amount: billGross,
          discount_amount: billDiscount,
          final_amount: billFinal,
          updated_at: new Date().toISOString(),
        })
        .eq("id", billId);

    if (billUpdateError) {
      return NextResponse.json(
        {
          success: false,
          message: billUpdateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Billed test deleted and totals recalculated.",
    });
  } catch (error) {
    console.error(
      "Delete client billing item error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to delete billed test.",
      },
      { status: 500 }
    );
  }
}