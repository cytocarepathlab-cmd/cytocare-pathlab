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

    const accessToken =
      authorization.startsWith("Bearer ")
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
    const patientId = String(
      body?.patientId || ""
    ).trim();

    if (!patientId) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient billing ID is missing.",
        },
        { status: 400 }
      );
    }

    const { data: patient, error: patientError } =
      await supabaseAdmin
        .from("cytocare_client_bill_patients")
        .select(
          "id, bill_id, patient_name"
        )
        .eq("id", patientId)
        .maybeSingle();

    if (patientError || !patient) {
      return NextResponse.json(
        {
          success: false,
          message:
            patientError?.message ||
            "Billed patient could not be found.",
        },
        { status: 404 }
      );
    }

    const billId = patient.bill_id;

    /*
      Deleting this patient automatically deletes all
      cytocare_client_bill_items because the item table
      uses ON DELETE CASCADE.
    */
    const { error: deleteError } =
      await supabaseAdmin
        .from("cytocare_client_bill_patients")
        .delete()
        .eq("id", patientId);

    if (deleteError) {
      return NextResponse.json(
        {
          success: false,
          message: deleteError.message,
        },
        { status: 500 }
      );
    }

    const {
      data: remainingPatients,
      error: remainingError,
    } = await supabaseAdmin
      .from("cytocare_client_bill_patients")
      .select(
        "id, gross_amount, discount_amount, final_amount"
      )
      .eq("bill_id", billId);

    if (remainingError) {
      return NextResponse.json(
        {
          success: false,
          message: remainingError.message,
        },
        { status: 500 }
      );
    }

    /*
      If this was the final patient in the billing cycle,
      remove the entire bill header too.
    */
    if (!remainingPatients || remainingPatients.length === 0) {
      const { error: billDeleteError } =
        await supabaseAdmin
          .from("cytocare_client_bills")
          .delete()
          .eq("id", billId);

      if (billDeleteError) {
        return NextResponse.json(
          {
            success: false,
            message: billDeleteError.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        billDeleted: true,
        message:
          "Patient deleted. The billing cycle was also removed because no patients remained.",
      });
    }

    const grossAmount =
      remainingPatients.reduce(
        (sum, row) =>
          sum + Number(row.gross_amount || 0),
        0
      );

    const discountAmount =
      remainingPatients.reduce(
        (sum, row) =>
          sum + Number(row.discount_amount || 0),
        0
      );

    const finalAmount =
      remainingPatients.reduce(
        (sum, row) =>
          sum + Number(row.final_amount || 0),
        0
      );

    const { error: billUpdateError } =
      await supabaseAdmin
        .from("cytocare_client_bills")
        .update({
          total_patients:
            remainingPatients.length,
          gross_amount: grossAmount,
          discount_amount: discountAmount,
          final_amount: finalAmount,
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
      billDeleted: false,
      message:
        "Patient and all booked tests deleted. Billing totals were recalculated.",
    });
  } catch (error) {
    console.error(
      "Delete client billing patient error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to delete billed patient.",
      },
      { status: 500 }
    );
  }
}