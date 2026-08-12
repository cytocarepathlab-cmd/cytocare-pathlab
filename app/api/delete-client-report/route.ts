import { NextResponse } from "next/server";
import {
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const reportId = String(
      body?.reportId || ""
    ).trim();

    if (!reportId) {
      return NextResponse.json(
        {
          success: false,
          message: "Report ID is missing.",
        },
        { status: 400 }
      );
    }

    const r2AccountId =
      process.env.R2_ACCOUNT_ID;

    const r2AccessKeyId =
      process.env.R2_ACCESS_KEY_ID;

    const r2SecretAccessKey =
      process.env.R2_SECRET_ACCESS_KEY;

    const r2Bucket =
      process.env.R2_BUCKET;

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      !r2AccountId ||
      !r2AccessKeyId ||
      !r2SecretAccessKey ||
      !r2Bucket ||
      !supabaseUrl ||
      !serviceRoleKey
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Server delete configuration is incomplete.",
        },
        { status: 500 }
      );
    }

    const supabaseAdmin =
      createClient(
        supabaseUrl,
        serviceRoleKey
      );

    // -----------------------------
    // VERIFY ADMIN LOGIN
    // -----------------------------

    const authorization =
      request.headers.get(
        "authorization"
      );

    const token =
      authorization?.startsWith(
        "Bearer "
      )
        ? authorization.substring(7)
        : "";

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin authentication required.",
        },
        { status: 401 }
      );
    }

    const {
      data: userData,
      error: userError,
    } =
      await supabaseAdmin.auth.getUser(
        token
      );

    if (
      userError ||
      !userData.user
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid admin session.",
        },
        { status: 401 }
      );
    }

    const {
      data: admin,
      error: adminError,
    } =
      await supabaseAdmin
        .from("admin_users")
        .select("id")
        .eq(
          "id",
          userData.user.id
        )
        .maybeSingle();

    if (adminError) {
      return NextResponse.json(
        {
          success: false,
          message:
            adminError.message,
        },
        { status: 500 }
      );
    }

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin access required.",
        },
        { status: 403 }
      );
    }

    // -----------------------------
    // FIND REPORT
    // -----------------------------

    const {
      data: report,
      error: reportError,
    } =
      await supabaseAdmin
        .from(
          "cytocare_client_uploaded_reports"
        )
        .select(
          "id, client_id, file_name, object_key, report_url"
        )
        .eq("id", reportId)
        .maybeSingle();

    if (reportError) {
      return NextResponse.json(
        {
          success: false,
          message:
            reportError.message,
        },
        { status: 500 }
      );
    }

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Report not found.",
        },
        { status: 404 }
      );
    }

    if (!report.object_key) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cloudflare object key is missing for this report.",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // DELETE FROM CLOUDFLARE R2
    // -----------------------------

    const r2 = new S3Client({
      region: "auto",

      endpoint:
        `https://${r2AccountId}.r2.cloudflarestorage.com`,

      credentials: {
        accessKeyId:
          r2AccessKeyId,
        secretAccessKey:
          r2SecretAccessKey,
      },
    });

    await r2.send(
      new DeleteObjectCommand({
        Bucket: r2Bucket,
        Key: report.object_key,
      })
    );

    // -----------------------------
    // DELETE DATABASE RECORD
    // -----------------------------

    const {
      error: deleteError,
    } =
      await supabaseAdmin
        .from(
          "cytocare_client_uploaded_reports"
        )
        .delete()
        .eq("id", reportId);

    if (deleteError) {
      return NextResponse.json(
        {
          success: false,
          message:
            deleteError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reportId,
      fileName:
        report.file_name,
      message:
        "Report deleted successfully.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to delete report.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}