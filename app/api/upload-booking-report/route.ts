import { NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

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

    const bookingId = String(
      formData.get("bookingId") || ""
    ).trim();

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a PDF report.",
        },
        { status: 400 }
      );
    }

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is missing.",
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

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          message: "Report PDF must be less than 10 MB.",
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

    const supabaseServiceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      !r2AccountId ||
      !r2AccessKeyId ||
      !r2SecretAccessKey ||
      !r2Bucket ||
      !r2PublicBaseUrl ||
      !supabaseUrl ||
      !supabaseServiceRoleKey
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
      supabaseServiceRoleKey
    );

    // ==============================
    // VERIFY ADMIN SESSION
    // ==============================

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

    if (
      userError ||
      !userData.user
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid admin session.",
        },
        { status: 401 }
      );
    }

    const { data: adminData } =
      await supabaseAdmin
        .from("admin_users")
        .select("id")
        .eq("id", userData.user.id)
        .maybeSingle();

    if (!adminData) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 }
      );
    }

    // ==============================
    // GET BOOKING
    // ==============================

    const {
      data: booking,
      error: bookingError,
    } = await supabaseAdmin
      .from("cytocare_bookings")
      .select(
        "id, name, phone, test_name, test_for_name"
      )
      .eq("id", bookingId)
      .maybeSingle();

    if (
      bookingError ||
      !booking
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found.",
        },
        { status: 404 }
      );
    }

    // ==============================
    // R2 CLIENT
    // ==============================

    const r2 = new S3Client({
      region: "auto",

      endpoint:
        `https://${r2AccountId}.r2.cloudflarestorage.com`,

      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
      },
    });

    const today =
      new Date().toISOString().slice(0, 10);

    const safeOriginalName =
      cleanFileName(file.name);

    const patientName =
      cleanFileName(
        booking.test_for_name ||
          booking.name ||
          "patient"
      );

    const objectKey =
      `patient-reports/${today}/booking-${booking.id}__${patientName}__${Date.now()}__${safeOriginalName}`;

    const arrayBuffer =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(arrayBuffer);

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

    // ==============================
    // SAVE URL IN BOOKING
    // ==============================

    const {
      error: updateError,
    } = await supabaseAdmin
      .from("cytocare_bookings")
      .update({
        report_url: reportUrl,
        report_status: "Report Ready",
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id);

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
      message: "Report uploaded successfully.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Report upload failed.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}