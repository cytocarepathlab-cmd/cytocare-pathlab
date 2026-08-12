import { NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 50;

function cleanFileName(value: string) {
  return value
    .replace(/[^a-zA-Z0-9._()-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 150);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const clientId = String(
      formData.get("clientId") || ""
    ).trim();

    const files = formData
      .getAll("files")
      .filter((item): item is File => item instanceof File);

    if (!clientId) {
      return NextResponse.json(
        {
          success: false,
          message: "Client ID is missing.",
        },
        { status: 400 }
      );
    }

    if (!files.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select at least one PDF.",
        },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        {
          success: false,
          message: `Maximum ${MAX_FILES} reports can be uploaded at once.`,
        },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (file.type !== "application/pdf") {
        return NextResponse.json(
          {
            success: false,
            message: `${file.name} is not a PDF file.`,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            message: `${file.name} is larger than 10 MB.`,
          },
          { status: 400 }
        );
      }
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

    // --------------------------------
    // VERIFY ADMIN LOGIN
    // --------------------------------

    const authorization =
      request.headers.get("authorization");

    const token =
      authorization?.startsWith("Bearer ")
        ? authorization.substring(7)
        : "";

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin authentication required.",
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

    const { data: admin } = await supabaseAdmin
      .from("admin_users")
      .select("id")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 }
      );
    }

    // --------------------------------
    // VERIFY CLIENT
    // --------------------------------

    const { data: client } = await supabaseAdmin
      .from("cytocare_clients")
      .select("id, client_code, client_name")
      .eq("id", clientId)
      .maybeSingle();

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          message: "Client not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------
    // CLOUDFLARE R2
    // --------------------------------

    const r2 = new S3Client({
      region: "auto",

      endpoint:
        `https://${r2AccountId}.r2.cloudflarestorage.com`,

      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
      },
    });

    const uploadedReports = [];

    const today =
      new Date().toISOString().slice(0, 10);

    for (const file of files) {
      const safeName =
        cleanFileName(file.name);

      const uniquePart =
        `${Date.now()}-${crypto.randomUUID()}`;

      const objectKey =
        `client-reports/${client.client_code}/${today}/${uniquePart}__${safeName}`;

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

      const {
        data: inserted,
        error: insertError,
      } = await supabaseAdmin
        .from("cytocare_client_uploaded_reports")
        .insert({
          client_id: client.id,
          file_name: file.name,
          report_url: reportUrl,
          object_key: objectKey,
          file_size: file.size,
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      uploadedReports.push(inserted);
    }

    return NextResponse.json({
      success: true,
      uploaded: uploadedReports.length,
      reports: uploadedReports,
      message:
        `${uploadedReports.length} report(s) uploaded successfully.`,
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
