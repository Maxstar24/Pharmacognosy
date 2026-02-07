import { ensureExperiment } from "@/lib/data";
import { Leaf, FlaskConical } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UploadClient } from "./upload-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ num: string }>;
}

export default async function UploadPage({ params }: PageProps) {
  const { num } = await params;
  const expNum = parseInt(num);

  if (isNaN(expNum) || expNum < 1) notFound();

  const experiment = await ensureExperiment(expNum);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-14">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl border-3 border-foreground bg-highlight">
          <Leaf className="h-7 w-7" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
          Upload Images
        </h1>
        <div className="mt-3 inline-flex items-center rounded-md border-2 border-foreground bg-highlight-green px-3 py-1 text-sm font-bold uppercase text-white">
          <FlaskConical className="mr-1.5 h-3.5 w-3.5" />
          Experiment {expNum}
        </div>
        <p className="mt-2 text-base font-bold">{experiment.name}</p>
        {experiment.description && (
          <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
            {experiment.description}
          </p>
        )}
      </div>

      {/* Upload Form */}
      <div className="rounded-xl border-3 border-foreground bg-card p-6 sm:p-8">
        <UploadClient experimentNumber={expNum} />
      </div>

      {/* Links */}
      <div className="mt-6 flex items-center justify-center gap-4 text-sm font-bold">
        <Link
          href={`/experiment/${expNum}`}
          className="underline underline-offset-4 hover:text-muted-foreground transition-colors"
        >
          View {experiment.name}
        </Link>
        <span className="text-muted-foreground">|</span>
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          All experiments
        </Link>
      </div>
    </div>
  );
}
