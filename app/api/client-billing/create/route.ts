import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type IncomingPatient = {
  patientName?: string;
  sex?: string;
  age?: number | null;
doctorName?: string;
  mobile?: string;
  priceIds?: string[];
  discountAmount?: number;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const clientId = String(body?.clientId || "").trim();
    const loginPin = String(body?.loginPin || "").trim();
    const patients = Array.isArray(body?.patients)
      ? (body.patients as IncomingPatient[])
      : [];

    if (!clientId || !isUuid(clientId) || !loginPin) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid client session.",
        },
        { status: 400 }
      );
    }

    if (patients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please add at least one patient.",
        },
        { status: 400 }
      );
    }

    if (patients.length > 25) {
      return NextResponse.json(
        {
          success: false,
          message: "Maximum 25 patients are allowed in one billing cycle.",
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
          message: "Billing server configuration is incomplete.",
        },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    // ---------------------------------------------------------
    // 1. VERIFY CLIENT LOGIN AND BILLING PERMISSION
    // ---------------------------------------------------------

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

    if (String(client.status || "").toLowerCase() !== "active") {
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
          message: "Billing is disabled for this client.",
        },
        { status: 403 }
      );
    }

    // ---------------------------------------------------------
    // 2. VALIDATE PATIENT DATA
    // ---------------------------------------------------------

    const cleanPatients = patients.map((patient, index) => {
      const patientName = String(patient.patientName || "").trim();
      const sex = String(patient.sex || "").trim();
       const age =
    patient.age !== null &&
    patient.age !== undefined &&
    String(patient.age).trim() !== ""
      ? Number(patient.age)
      : null;
      const doctorName = String(
    patient.doctorName || ""
  ).trim();
      const mobile = String(patient.mobile || "")
        .replace(/\D/g, "")
        .slice(0, 10);

      const priceIds = Array.from(
        new Set(
          (Array.isArray(patient.priceIds)
            ? patient.priceIds
            : []
          )
            .map((value) => String(value || "").trim())
            .filter(Boolean)
        )
      );

      const discountAmount =
        Number(patient.discountAmount || 0);

      if (!patientName) {
        throw new Error(
          `Patient ${index + 1} name is required.`
        );
      }

      if (!["Male", "Female", "Other"].includes(sex)) {
        throw new Error(
          `Please select a valid sex for Patient ${index + 1}.`
        );
      }
if (
  age !== null &&
  (
    !Number.isFinite(age) ||
    age < 0 ||
    age > 120
  )
) {
  throw new Error(
    `Please enter a valid age for Patient ${index + 1}.`
  );
}

      if (mobile && mobile.length !== 10) {
        throw new Error(
          `Invalid mobile number for Patient ${index + 1}.`
        );
      }

      if (
        priceIds.length === 0 ||
        priceIds.some((id) => !isUuid(id))
      ) {
        throw new Error(
          `Invalid test selection for Patient ${index + 1}.`
        );
      }

      if (
        !Number.isFinite(discountAmount) ||
        discountAmount < 0
      ) {
        throw new Error(
          `Invalid discount for Patient ${index + 1}.`
        );
      }

      return {
        patientName,
        sex,
        age,
  doctorName,
        mobile,
        priceIds,
        discountAmount,
      };
    });

    const allPriceIds = Array.from(
      new Set(
        cleanPatients.flatMap(
          (patient) => patient.priceIds
        )
      )
    );

    // ---------------------------------------------------------
    // 3. LOAD MASTER PRICE ROWS
    // ---------------------------------------------------------

    const { data: masterRows, error: masterError } =
      await supabaseAdmin
        .from("cytocare_client_price_list")
        .select(
          "id, product, category, mrp, is_active"
        )
        .in("id", allPriceIds);

    if (masterError) {
      return NextResponse.json(
        {
          success: false,
          message: masterError.message,
        },
        { status: 500 }
      );
    }

    const activeMasterRows = (masterRows ?? []).filter(
      (row) => row.is_active !== false
    );

    if (activeMasterRows.length !== allPriceIds.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "One or more selected tests are unavailable. Please refresh the price list.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // 4. LOAD CLIENT-SPECIFIC MRP OVERRIDES
    // ---------------------------------------------------------

    const { data: overrideRows, error: overrideError } =
      await supabaseAdmin
        .from("cytocare_client_mrp_overrides")
        .select("price_id, custom_mrp")
        .eq("client_id", clientId)
        .in("price_id", allPriceIds);

    if (overrideError) {
      return NextResponse.json(
        {
          success: false,
          message: overrideError.message,
        },
        { status: 500 }
      );
    }

    const masterMap = new Map(
      activeMasterRows.map((row) => [
        String(row.id),
        row,
      ])
    );

    const overrideMap = new Map(
      (overrideRows ?? []).map((row) => [
        String(row.price_id),
        Number(row.custom_mrp),
      ])
    );

    const calculatedPatients = cleanPatients.map(
      (patient, index) => {
        const items = patient.priceIds.map(
          (priceId) => {
            const master = masterMap.get(priceId);

            if (!master) {
              throw new Error(
                `Price data missing for Patient ${index + 1}.`
              );
            }

            const masterMrp =
              Number(master.mrp || 0);

            const overrideMrp =
              overrideMap.get(priceId);

            const effectiveMrp =
              overrideMrp !== undefined &&
              Number.isFinite(overrideMrp)
                ? overrideMrp
                : masterMrp;

            if (
              !Number.isFinite(effectiveMrp) ||
              effectiveMrp < 0
            ) {
              throw new Error(
                `Invalid MRP for ${master.product}.`
              );
            }

            return {
              priceId,
              testName: String(master.product || ""),
              category:
                master.category
                  ? String(master.category)
                  : null,
              rate: effectiveMrp,
            };
          }
        );

        const grossAmount = items.reduce(
          (sum, item) => sum + item.rate,
          0
        );

        if (
          patient.discountAmount >
          grossAmount
        ) {
          throw new Error(
            `Discount cannot exceed gross amount for Patient ${
              index + 1
            }.`
          );
        }

        return {
          ...patient,
          items,
          grossAmount,
          finalAmount:
            grossAmount -
            patient.discountAmount,
        };
      }
    );

    const grossAmount =
      calculatedPatients.reduce(
        (sum, patient) =>
          sum + patient.grossAmount,
        0
      );

    const discountAmount =
      calculatedPatients.reduce(
        (sum, patient) =>
          sum + patient.discountAmount,
        0
      );

    const finalAmount =
      grossAmount - discountAmount;

    const now = new Date().toISOString();

    // ---------------------------------------------------------
    // 5. CREATE BILL HEADER
    // ---------------------------------------------------------

    const {
      data: bill,
      error: billError,
    } = await supabaseAdmin
      .from("cytocare_client_bills")
      .insert({
        client_id: client.id,
        client_name: client.client_name,
        client_code: client.client_code,
        total_patients:
          calculatedPatients.length,
        gross_amount: grossAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        status: "Confirmed",
        updated_at: now,
      })
      .select(
        "id, serial_no, client_id, client_name, client_code, total_patients, gross_amount, discount_amount, final_amount, created_at"
      )
      .single();

    if (billError || !bill) {
      return NextResponse.json(
        {
          success: false,
          message:
            billError?.message ||
            "Unable to create billing cycle.",
        },
        { status: 500 }
      );
    }

    const createdPatients: Array<{
      id: string;
      patient_order: number;
      patient_name: string;
      sex: string | null;
       age: number | null;
  doctor_name: string | null;
      mobile: string | null;
      gross_amount: number;
      discount_amount: number;
      final_amount: number;
      items: Array<{
        id?: string;
        price_id?: string | null;
        test_name: string;
        category?: string | null;
        rate: number;
      }>;
    }> = [];

    try {
      // -------------------------------------------------------
      // 6. CREATE PATIENTS + ITEMS
      // -------------------------------------------------------

      for (
        let index = 0;
        index < calculatedPatients.length;
        index += 1
      ) {
        const patient =
          calculatedPatients[index];

        const {
          data: savedPatient,
          error: patientError,
        } = await supabaseAdmin
          .from(
            "cytocare_client_bill_patients"
          )
          .insert({
  bill_id: bill.id,

  patient_order:
    index + 1,

  patient_name:
    patient.patientName,

  sex:
    patient.sex,

  age:
    patient.age,

  doctor_name:
    patient.doctorName || null,

  mobile:
    patient.mobile || null,

  gross_amount:
    patient.grossAmount,

  discount_amount:
    patient.discountAmount,

  final_amount:
    patient.finalAmount,

  updated_at:
    now,
})
          .select(
  "id, patient_order, patient_name, sex, age, doctor_name, mobile, gross_amount, discount_amount, final_amount"
)
          .single();

        if (
          patientError ||
          !savedPatient
        ) {
          throw new Error(
            patientError?.message ||
              `Unable to save Patient ${
                index + 1
              }.`
          );
        }

        const itemRows =
          patient.items.map((item) => ({
            bill_patient_id:
              savedPatient.id,
            price_id: item.priceId,
            test_name:
              item.testName,
            category:
              item.category,
            rate: item.rate,
          }));

        const {
          data: savedItems,
          error: itemsError,
        } = await supabaseAdmin
          .from(
            "cytocare_client_bill_items"
          )
          .insert(itemRows)
          .select(
            "id, price_id, test_name, category, rate"
          );

        if (itemsError) {
          throw new Error(
            itemsError.message
          );
        }

        createdPatients.push({
          ...savedPatient,
          gross_amount: Number(
            savedPatient.gross_amount
          ),
          discount_amount: Number(
            savedPatient.discount_amount
          ),
          final_amount: Number(
            savedPatient.final_amount
          ),
          items: (savedItems ?? []).map(
            (item) => ({
              ...item,
              rate: Number(item.rate),
            })
          ),
        });
      }
    } catch (error) {
      // Clean up the whole bill if any child insert fails.
      await supabaseAdmin
        .from("cytocare_client_bills")
        .delete()
        .eq("id", bill.id);

      throw error;
    }

    return NextResponse.json({
      success: true,
      bill: {
        ...bill,
        gross_amount: Number(
          bill.gross_amount
        ),
        discount_amount: Number(
          bill.discount_amount
        ),
        final_amount: Number(
          bill.final_amount
        ),
        patients: createdPatients,
      },
    });
  } catch (error) {
    console.error(
      "Client billing create error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to create client bill.",
      },
      { status: 500 }
    );
  }
}