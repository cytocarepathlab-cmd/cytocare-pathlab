import { NextResponse } from "next/server";
import {
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 15 * 1024 * 1024;

function cleanFileName(value: string) {
  return value
    .replace(/[^a-zA-Z0-9._()-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 150);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const patientName = String(
      formData.get("patientName") || "patient"
    );

    const bookingIdsRaw = String(
      formData.get("bookingIds") || "[]"
    );

    let bookingIds: number[] = [];

    try {
      const parsed = JSON.parse(bookingIdsRaw);

      bookingIds = Array.isArray(parsed)
        ? parsed
            .map((value) => Number(value))
            .filter((value) => Number.isFinite(value))
        : [];
    } catch {
      bookingIds = [];
    }

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a PDF report.",
        },
        { status: 400 }
      );
    }

    if (!bookingIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "No patient bookings found.",
        },
        { status: 400 }
      );
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Only PDF reports are allowed.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "PDF must be less than 15 MB.",
        },
        { status: 400 }
      );
    }

    const r2AccountId = process.env.R2_ACCOUNT_ID;
    const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
    const r2SecretAccessKey =
      process.env.R2_SECRET_ACCESS_KEY;
    const r2Bucket = process.env.R2_BUCKET;
    const r2PublicBaseUrl =
      process.env.R2_PUBLIC_BASE_URL;

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      !r2AccountId ||
      !r2AccessKeyId ||
      !r2SecretAccessKey ||
      !r2Bucket ||
      !r2PublicBaseUrl ||
      !supabaseUrl ||
      !serviceRoleKey
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Server upload configuration is incomplete.",
        },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    // Verify logged-in Cytocare admin.
    const authorization =
      request.headers.get("authorization");

    const token =
      authorization?.startsWith("Bearer ")
        ? authorization.slice(7)
        : "";

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin login required.",
        },
        { status: 401 }
      );
    }

    const {
      data: userData,
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !userData.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid admin session.",
        },
        { status: 401 }
      );
    }

    const { data: adminData, error: adminError } =
      await supabaseAdmin
        .from("admin_users")
        .select("id")
        .eq("id", userData.user.id)
        .maybeSingle();

    if (adminError) {
      return NextResponse.json(
        {
          success: false,
          message: adminError.message,
        },
        { status: 500 }
      );
    }

    if (!adminData) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 }
      );
    }

    // Verify all booking IDs exist.
    const {
      data: bookingRows,
      error: bookingError,
    } = await supabaseAdmin
      .from("cytocare_bookings")
      .select("id")
      .in("id", bookingIds);

    if (bookingError) {
      return NextResponse.json(
        {
          success: false,
          message: bookingError.message,
        },
        { status: 500 }
      );
    }

    if (
      !bookingRows ||
      bookingRows.length !== bookingIds.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "One or more patient bookings could not be found.",
        },
        { status: 400 }
      );
    }

    const r2 = new S3Client({
      region: "auto",
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
      },
    });

    const safePatient =
      cleanFileName(patientName) || "patient";

    const safeFile =
      cleanFileName(file.name) || "report.pdf";

    const today = new Date()
      .toISOString()
      .slice(0, 10);

    const objectKey =
      `patient-reports/${today}/${safePatient}__${Date.now()}__${safeFile}`;

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    await r2.send(
      new PutObjectCommand({
        Bucket: r2Bucket,
        Key: objectKey,
        Body: buffer,
        ContentType: "application/pdf",
      })
    );

    const reportUrl =
      `${r2PublicBaseUrl.replace(/\/$/, "")}/${objectKey}`;

    // Save the same report URL against all tests in this patient checkout.
    const { error: updateError } =
      await supabaseAdmin
        .from("cytocare_bookings")
        .update({
          report_url: reportUrl,
          report_status: "Report Ready",
          updated_at: new Date().toISOString(),
        })
        .in("id", bookingIds);

    if (updateError) {
      return NextResponse.json(
        {
          success: false,
          message: updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reportUrl,
      updatedBookings: bookingIds.length,
      message:
        "Patient report uploaded successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Report upload failed.",
      },
      { status: 500 }
    );
  }
}