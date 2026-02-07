import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ num: string }> }
) {
  try {
    const { num } = await params;
    const expNum = parseInt(num);
    if (isNaN(expNum) || expNum < 1) {
      return NextResponse.json({ error: "Invalid experiment number" }, { status: 400 });
    }

    let baseUrl = process.env.SITE_URL;
    if (!baseUrl) {
      const host = request.headers.get("host") || "localhost:3000";
      const protocol = request.headers.get("x-forwarded-proto") || "http";
      baseUrl = `${protocol}://${host}`;
    }
    const uploadUrl = `${baseUrl.replace(/\/$/, "")}/upload/${expNum}`;

    const qrDataUrl = await QRCode.toDataURL(uploadUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#166534",
        light: "#ffffff",
      },
    });

    return NextResponse.json({ qrCode: qrDataUrl, uploadUrl });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
