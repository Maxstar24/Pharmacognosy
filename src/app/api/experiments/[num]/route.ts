import { NextRequest, NextResponse } from "next/server";
import { deleteExperiment, getExperiment, getExperimentImages } from "@/lib/data";
import { unlink, rmdir } from "fs/promises";
import path from "path";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ num: string }> }
) {
  try {
    const { num } = await params;
    const expNum = parseInt(num);
    if (isNaN(expNum) || expNum < 1) {
      return NextResponse.json(
        { error: "Invalid experiment number" },
        { status: 400 }
      );
    }

    const experiment = await getExperiment(expNum);
    if (!experiment) {
      return NextResponse.json(
        { error: "Experiment not found" },
        { status: 404 }
      );
    }

    // Delete all image files from disk
    const images = await getExperimentImages(expNum);
    for (const image of images) {
      const filepath = path.join(process.cwd(), "public", image.filename);
      try {
        await unlink(filepath);
      } catch {
        // File might not exist
      }
    }

    // Try to remove the upload directory
    try {
      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        String(expNum)
      );
      await rmdir(uploadDir);
    } catch {
      // Directory might not exist or not be empty
    }

    // Delete from Redis
    const deleted = await deleteExperiment(expNum);
    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete experiment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting experiment:", error);
    return NextResponse.json(
      { error: "Failed to delete experiment" },
      { status: 500 }
    );
  }
}
