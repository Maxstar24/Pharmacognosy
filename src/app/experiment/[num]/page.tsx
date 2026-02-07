import { getExperiment, getExperimentImages } from "@/lib/data";
import { ImageGallery } from "@/components/image-gallery";
import { EditableExperimentHeader } from "@/components/editable-experiment-header";
import { DeleteExperimentButton } from "@/components/delete-experiment-button";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImageIcon, Upload, FlaskConical } from "lucide-react";
import { QRCodeSection } from "./qr-section";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ num: string }>;
}

export default async function ExperimentPage({ params }: PageProps) {
  const { num } = await params;
  const expNum = parseInt(num);

  if (isNaN(expNum) || expNum < 1) notFound();

  const [experiment, images] = await Promise.all([
    getExperiment(expNum),
    getExperimentImages(expNum),
  ]);

  if (!experiment) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Back */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to all experiments
      </Link>

      {/* Header Card */}
      <div className="mb-8 rounded-xl border-3 border-foreground bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border-2 border-foreground bg-highlight text-2xl font-black">
              {experiment.number}
            </div>
            <div className="flex-1">
              <EditableExperimentHeader
                experimentNumber={experiment.number}
                initialName={experiment.name}
                initialDescription={experiment.description}
              />
              <div className="mt-2 flex items-center gap-3">
                <span className="inline-flex items-center rounded-md border-2 border-foreground bg-highlight-green px-2.5 py-0.5 text-xs font-bold uppercase text-white">
                  <ImageIcon className="mr-1 h-3 w-3" />
                  {images.length}{" "}
                  {images.length === 1 ? "image" : "images"}
                </span>
                <span className="inline-flex items-center rounded-md border-2 border-foreground bg-highlight-blue px-2.5 py-0.5 text-xs font-bold uppercase text-white">
                  <FlaskConical className="mr-1 h-3 w-3" />
                  Lab Session
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href={`/upload/${expNum}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border-2 border-foreground bg-foreground px-5 text-sm font-bold uppercase tracking-wide text-background transition-all hover:bg-highlight hover:text-foreground"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Link>
            <DeleteExperimentButton
              experimentNumber={experiment.number}
              experimentName={experiment.name}
              imageCount={images.length}
            />
          </div>
        </div>

        {/* QR Code */}
        <div className="mt-6 border-t-2 border-foreground pt-6">
          <QRCodeSection experimentNumber={expNum} />
        </div>
      </div>

      {/* Gallery */}
      <h2 className="mb-6 text-2xl font-black uppercase tracking-tight">
        Submitted Images
      </h2>
      <ImageGallery images={images} experimentNumber={expNum} />
    </div>
  );
}
