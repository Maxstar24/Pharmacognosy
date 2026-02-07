import { NextRequest, NextResponse } from "next/server";
import {
  deleteImage,
  getImage,
  updateImageDescription,
  updateImageNotes,
  updateImageAnnotations,
} from "@/lib/data";
import { unlink } from "fs/promises";
import path from "path";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ num: string; imageId: string }> }
) {
  try {
    const { num, imageId } = await params;
    const expNum = parseInt(num);
    const body = await request.json();

    // Update description
    if (body.description !== undefined) {
      const updated = await updateImageDescription(
        expNum,
        imageId,
        body.description
      );
      if (!updated) {
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
      }
      return NextResponse.json(updated);
    }

    // Update notes
    if (body.notes !== undefined) {
      const updated = await updateImageNotes(expNum, imageId, body.notes);
      if (!updated) {
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
      }
      return NextResponse.json(updated);
    }

    // Update annotations
    if (body.annotations !== undefined) {
      const updated = await updateImageAnnotations(
        expNum,
        imageId,
        body.annotations
      );
      if (!updated) {
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
      }
      return NextResponse.json(updated);
    }

    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating image:", error);
    return NextResponse.json(
      { error: "Failed to update image" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ num: string; imageId: string }> }
) {
  try {
    const { num, imageId } = await params;
    const expNum = parseInt(num);

    const image = await getImage(expNum, imageId);
    if (image) {
      const filepath = path.join(process.cwd(), "public", image.filename);
      try {
        await unlink(filepath);
      } catch {
        // File might not exist
      }
    }

    const deleted = await deleteImage(expNum, imageId);
    if (!deleted) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
