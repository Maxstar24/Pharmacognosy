import { NextRequest, NextResponse } from "next/server";
import { getExperimentImages, addImage, ensureExperiment } from "@/lib/data";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ num: string }> }
) {
  try {
    const { num } = await params;
    const expNum = parseInt(num);
    if (isNaN(expNum) || expNum < 1) {
      return NextResponse.json({ error: "Invalid experiment number" }, { status: 400 });
    }
    const images = await getExperimentImages(expNum);
    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ num: string }> }
) {
  try {
    const { num } = await params;
    const expNum = parseInt(num);
    if (isNaN(expNum) || expNum < 1) {
      return NextResponse.json({ error: "Invalid experiment number" }, { status: 400 });
    }

    // Auto-create experiment if needed
    await ensureExperiment(expNum);

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const description = (formData.get("description") as string) || "";
    const uploadedBy = (formData.get("uploadedBy") as string) || "Anonymous";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", String(expNum));
    await mkdir(uploadDir, { recursive: true });

    const uploadedImages = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;

      const ext = path.extname(file.name) || ".jpg";
      const filename = `${uuidv4()}${ext}`;
      const filepath = path.join(uploadDir, filename);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      const image = await addImage(
        expNum,
        `/uploads/${expNum}/${filename}`,
        file.name,
        description,
        uploadedBy,
        file.type,
        file.size
      );

      uploadedImages.push(image);
    }

    if (uploadedImages.length === 0) {
      return NextResponse.json({ error: "No valid image files provided" }, { status: 400 });
    }

    return NextResponse.json(uploadedImages, { status: 201 });
  } catch (error) {
    console.error("Error uploading images:", error);
    return NextResponse.json({ error: "Failed to upload images" }, { status: 500 });
  }
}
