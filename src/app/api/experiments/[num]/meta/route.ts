import { NextRequest, NextResponse } from "next/server";
import { updateExperimentMeta, getExperiment } from "@/lib/data";

export async function PATCH(
  request: NextRequest,
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

    const body = await request.json();
    const { name, description } = body;

    const updated = await updateExperimentMeta(expNum, { name, description });
    if (!updated) {
      return NextResponse.json(
        { error: "Experiment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating experiment:", error);
    return NextResponse.json(
      { error: "Failed to update experiment" },
      { status: 500 }
    );
  }
}
