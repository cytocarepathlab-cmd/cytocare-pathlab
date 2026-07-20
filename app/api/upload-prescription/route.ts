import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

function cleanFileName(value: string) {
  return value
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

function getFileExtension(fileName: string, fileType: string) {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith(".pdf")) return "pdf";
  if (lowerName.endsWith(".jpg")) return "jpg";
  if (lowerName.endsWith(".jpeg")) return "jpeg";
  if (lowerName.endsWith(".png")) return "png";

  if (fileType === "application/pdf") return "pdf";
  if (fileType === "image/png") return "png";

  return "jpg";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const userId = String(formData.get("userId") || "");
    const patientName = String(formData.get("patientName") || "");
    const patientEmail = String(formData.get("patientEmail") || "");
    const patientPhone = String(formData.get("patientPhone") || "");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Please select a prescription file." },
        { status: 400 }
      );
    }

    if (!patientEmail || !patientName) {
      return NextResponse.json(
        { success: false, message: "Patient details are missing." },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only PDF, JPG, JPEG and PNG files are allowed.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          message: "Prescription file must be less than 2 MB.",
        },
        { status: 400 }
      );
    }

    const r2AccountId = process.env.R2_ACCOUNT_ID;
    const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
    const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const r2Bucket = process.env.R2_BUCKET;
    const r2PublicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
          message: "Server upload settings are missing.",
        },
        { status: 500 }
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

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const today = new Date().toISOString().slice(0, 10);
    const extension = getFileExtension(file.name, file.type);
    const patientPart = cleanFileName(patientName || "patient");
    const originalFilePart = cleanFileName(file.name || "prescription");
    const timePart = Date.now();

    const objectKey = `prescriptions/${today}/${patientPart}__${timePart}__${originalFilePart}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await r2.send(
      new PutObjectCommand({
        Bucket: r2Bucket,
        Key: objectKey,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const prescriptionUrl = `${r2PublicBaseUrl.replace(/\/$/, "")}/${objectKey}`;

    const { error } = await supabaseAdmin.from("cytocare_prescriptions").insert({
      user_id: userId || null,
      patient_name: patientName,
      patient_email: patientEmail,
      patient_phone: patientPhone || null,
      prescription_url: prescriptionUrl,
      file_name: file.name,
      file_type: file.type,
      prescription_status: "New",
      expires_at: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Prescription uploaded successfully. Our team will review it and guide you for the required tests.",
      prescriptionUrl,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}