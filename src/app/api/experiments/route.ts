import { NextRequest, NextResponse } from "next/server";
import {
  getAllExperiments,
  getStats,
  createExperiment,
  getExperiment,
  getNextExperimentNumber,
} from "@/lib/data";

export async function GET() {
  try {
    const [experiments, stats] = await Promise.all([
      getAllExperiments(),
      getStats(),
    ]);
    return NextResponse.json({ experiments, stats });
  } catch (error) {
    console.error("Error fetching experiments:", error);
    return NextResponse.json(
      { error: "Failed to fetch experiments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;
    let { number } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Experiment name is required" },
        { status: 400 }
      );
    }

    // Auto-assign next number if not provided
    if (!number) {
      number = await getNextExperimentNumber();
    }

    number = parseInt(number);
    if (isNaN(number) || number < 1) {
      return NextResponse.json(
        { error: "Invalid experiment number" },
        { status: 400 }
      );
    }

    // Check if experiment number already exists
    const existing = await getExperiment(number);
    if (existing) {
      return NextResponse.json(
        { error: `Experiment ${number} already exists` },
        { status: 409 }
      );
    }

    const experiment = await createExperiment(
      number,
      name.trim(),
      (description || "").trim()
    );
    return NextResponse.json(experiment, { status: 201 });
  } catch (error) {
    console.error("Error creating experiment:", error);
    return NextResponse.json(
      { error: "Failed to create experiment" },
      { status: 500 }
    );
  }
}
