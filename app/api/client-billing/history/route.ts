import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const clientId = String(
      body?.clientId || ""
    ).trim();

    const loginPin = String(
      body?.loginPin || ""
    ).trim();

    if (!clientId || !loginPin) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid client session.",
        },
        { status: 400 }
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "";

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Billing server configuration is incomplete.",
        },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    const { data: client, error: clientError } =
      await supabaseAdmin
        .from("cytocare_clients")
        .select(
          "id, client_name, client_code, login_pin, status, billing_enabled"
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
      String(client.status || "").toLowerCase() !==
      "active"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "This client account is not active.",
        },
        { status: 403 }
      );
    }

    if (client.billing_enabled !== true) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Billing is disabled for this client.",
        },
        { status: 403 }
      );
    }

    const { data: bills, error: billsError } =
      await supabaseAdmin
        .from("cytocare_client_bills")
        .select(
          `
          id,
          serial_no,
          client_id,
          client_name,
          client_code,
          total_patients,
          gross_amount,
          discount_amount,
          final_amount,
          paid_amount,
          due_amount,
          status,
          created_at,
          patients:cytocare_client_bill_patients (
            id,
            patient_order,
            patient_name,
            sex,
            mobile,
            gross_amount,
            discount_amount,
            final_amount,
            paid_amount,
            due_amount,
            payment_status,
            payment_updated_at,
            items:cytocare_client_bill_items (
              id,
              price_id,
              test_name,
              category,
              rate
            )
          )
          `
        )
        .eq("client_id", clientId)
        .gte(
          "created_at",
          new Date(
            Date.now() - 48 * 60 * 60 * 1000
          ).toISOString()
        )
        .order("created_at", {
          ascending: false,
        });

    if (billsError) {
      return NextResponse.json(
        {
          success: false,
          message: billsError.message,
        },
        { status: 500 }
      );
    }

    const normalizedBills = (bills ?? []).map(
      (bill) => ({
        ...bill,
        total_patients: Number(
          bill.total_patients || 0
        ),
        gross_amount: Number(
          bill.gross_amount || 0
        ),
        discount_amount: Number(
          bill.discount_amount || 0
        ),
        final_amount: Number(
          bill.final_amount || 0
        ),
        paid_amount: Number(
          bill.paid_amount || 0
        ),
        due_amount: Number(
          bill.due_amount || 0
        ),
        patients: (bill.patients ?? []).map(
          (patient) => ({
            ...patient,
            gross_amount: Number(
              patient.gross_amount || 0
            ),
            discount_amount: Number(
              patient.discount_amount || 0
            ),
            final_amount: Number(
              patient.final_amount || 0
            ),
            paid_amount: Number(
              patient.paid_amount || 0
            ),
            due_amount: Number(
              patient.due_amount || 0
            ),
            payment_status:
              patient.payment_status || "Due",
            items: (patient.items ?? []).map(
              (item) => ({
                ...item,
                rate: Number(
                  item.rate || 0
                ),
              })
            ),
          })
        ),
      })
    );

    return NextResponse.json({
      success: true,
      bills: normalizedBills,
    });
  } catch (error) {
    console.error(
      "Client billing history error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load previous bills.",
      },
      { status: 500 }
    );
  }
}