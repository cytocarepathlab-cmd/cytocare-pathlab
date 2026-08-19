import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const clientId =
      String(body?.clientId || "").trim();

    const loginPin =
      String(body?.loginPin || "").trim();

    const patientId =
      String(body?.patientId || "").trim();

    const additionalPayment =
      Number(body?.additionalPayment || 0);

    if (
      !clientId ||
      !loginPin ||
      !patientId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid billing payment request.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(additionalPayment) ||
      additionalPayment <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid additional payment amount.",
        },
        { status: 400 }
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "";

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (
      !supabaseUrl ||
      !serviceRoleKey
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Billing server configuration is incomplete.",
        },
        { status: 500 }
      );
    }

    const supabaseAdmin =
      createClient(
        supabaseUrl,
        serviceRoleKey
      );

    // ---------------------------------------------------------
    // 1. VERIFY CLIENT LOGIN
    // ---------------------------------------------------------

    const {
      data: client,
      error: clientError,
    } = await supabaseAdmin
      .from("cytocare_clients")
      .select(
        "id, login_pin, status, billing_enabled"
      )
      .eq("id", clientId)
      .eq("login_pin", loginPin)
      .maybeSingle();

    if (clientError) {
      return NextResponse.json(
        {
          success: false,
          message: clientError.message,
        },
        { status: 500 }
      );
    }

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          message: "Client login is no longer valid.",
        },
        { status: 401 }
      );
    }

    if (
      String(client.status || "")
        .toLowerCase() !== "active"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "This client account is not active.",
        },
        { status: 403 }
      );
    }

    if (
      client.billing_enabled !== true
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Billing is disabled for this client.",
        },
        { status: 403 }
      );
    }

    // ---------------------------------------------------------
    // 2. LOAD PATIENT BILL
    // ---------------------------------------------------------

    const {
      data: patient,
      error: patientError,
    } = await supabaseAdmin
      .from(
        "cytocare_client_bill_patients"
      )
      .select(
        `
        id,
        bill_id,
        final_amount,
        paid_amount,
        due_amount,
        bill:cytocare_client_bills!inner (
          id,
          client_id
        )
        `
      )
      .eq("id", patientId)
      .maybeSingle();

    if (
      patientError ||
      !patient
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            patientError?.message ||
            "Patient bill not found.",
        },
        { status: 404 }
      );
    }

    const billRelation =
      Array.isArray(patient.bill)
        ? patient.bill[0]
        : patient.bill;

    if (
      !billRelation ||
      String(billRelation.client_id) !==
        clientId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "This bill does not belong to this client.",
        },
        { status: 403 }
      );
    }

    const finalAmount =
      Number(patient.final_amount || 0);

    const currentPaid =
      Number(patient.paid_amount || 0);

    const currentDue =
      Number(patient.due_amount || 0);

    if (
      additionalPayment >
      currentDue
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Additional payment cannot exceed the current due amount.",
        },
        { status: 400 }
      );
    }

    const newPaid =
      Math.min(
        currentPaid +
          additionalPayment,
        finalAmount
      );

    const newDue =
      Math.max(
        finalAmount -
          newPaid,
        0
      );

    const paymentStatus =
      newDue <= 0
        ? "Paid"
        : newPaid > 0
          ? "Partially Paid"
          : "Due";

    const now =
      new Date().toISOString();

    // ---------------------------------------------------------
    // 3. UPDATE PATIENT PAYMENT
    // ---------------------------------------------------------

    const {
      data: updatedPatient,
      error: updateError,
    } = await supabaseAdmin
      .from(
        "cytocare_client_bill_patients"
      )
      .update({
        paid_amount:
          newPaid,
        due_amount:
          newDue,
        payment_status:
          paymentStatus,
        payment_updated_at:
          now,
        updated_at:
          now,
      })
      .eq("id", patientId)
      .select(
        "id, final_amount, paid_amount, due_amount, payment_status, payment_updated_at"
      )
      .single();

    if (
      updateError ||
      !updatedPatient
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            updateError?.message ||
            "Unable to update patient payment.",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------------------
    // 4. RECALCULATE BILL HEADER
    // ---------------------------------------------------------

    const {
      data: billPatients,
      error: billPatientsError,
    } = await supabaseAdmin
      .from(
        "cytocare_client_bill_patients"
      )
      .select(
        "paid_amount, due_amount"
      )
      .eq(
        "bill_id",
        patient.bill_id
      );

    if (billPatientsError) {
      return NextResponse.json(
        {
          success: false,
          message:
            billPatientsError.message,
        },
        { status: 500 }
      );
    }

    const billPaidAmount =
      (billPatients ?? []).reduce(
        (sum, row) =>
          sum +
          Number(
            row.paid_amount || 0
          ),
        0
      );

    const billDueAmount =
      (billPatients ?? []).reduce(
        (sum, row) =>
          sum +
          Number(
            row.due_amount || 0
          ),
        0
      );

    const {
      error: billUpdateError,
    } = await supabaseAdmin
      .from("cytocare_client_bills")
      .update({
        paid_amount:
          billPaidAmount,
        due_amount:
          billDueAmount,
        updated_at:
          now,
      })
      .eq(
        "id",
        patient.bill_id
      );

    if (billUpdateError) {
      return NextResponse.json(
        {
          success: false,
          message:
            billUpdateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      patient: {
        ...updatedPatient,
        final_amount:
          Number(
            updatedPatient.final_amount
          ),
        paid_amount:
          Number(
            updatedPatient.paid_amount
          ),
        due_amount:
          Number(
            updatedPatient.due_amount
          ),
      },
      bill: {
        paid_amount:
          billPaidAmount,
        due_amount:
          billDueAmount,
      },
    });
  } catch (error) {
    console.error(
      "Client billing update payment error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to update payment.",
      },
      { status: 500 }
    );
  }
}