import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const fileUrl = searchParams.get("url");
    const fileName =
      searchParams.get("name") || "cytocare-report.pdf";

    if (!fileUrl) {
      return new Response("Report URL missing.", {
        status: 400,
      });
    }

    const response = await fetch(fileUrl);

    if (!response.ok) {
      return new Response("Unable to download report.", {
        status: 500,
      });
    }

    const arrayBuffer = await response.arrayBuffer();

    const safeFileName = fileName
      .replace(/["\r\n]/g, "")
      .trim();

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFileName}"`,
        "Content-Length": String(arrayBuffer.byteLength),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return new Response(
      error instanceof Error
        ? error.message
        : "Download failed.",
      {
        status: 500,
      }
    );
  }
}