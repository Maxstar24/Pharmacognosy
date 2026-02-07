import { getAllExperiments, getExperimentImages, getStats } from "@/lib/data";
import { ExperimentImage } from "@/lib/types";
import { FlaskConical, Upload, Eye, ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { NewExperimentCard } from "@/components/new-experiment-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [experiments, stats] = await Promise.all([
    getAllExperiments(),
    getStats(),
  ]);

  const experimentThumbnails: Record<number, ExperimentImage | null> = {};
  await Promise.all(
    experiments.map(async (exp) => {
      const images = await getExperimentImages(exp.number);
      experimentThumbnails[exp.number] = images[0] || null;
    })
  );

  const badgeColors = [
    "bg-highlight-green text-white",
    "bg-highlight-blue text-white",
    "bg-highlight-purple text-white",
    "bg-highlight-orange text-white",
    "bg-highlight text-foreground",
    "bg-highlight-pink text-white",
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b-3 border-foreground">
        <div className="absolute left-[5%] top-[15%] h-16 w-16 rotate-12 rounded-lg border-2 border-foreground bg-highlight/40 hidden lg:block" />
        <div className="absolute right-[8%] top-[20%] h-14 w-14 -rotate-12 rounded-lg border-2 border-foreground bg-highlight-pink/30 hidden lg:block" />
        <div className="absolute left-[15%] bottom-[15%] h-0 w-0 border-l-[25px] border-r-[25px] border-b-[40px] border-l-transparent border-r-transparent border-b-highlight-blue/30 rotate-6 hidden lg:block" />
        <div className="absolute right-[20%] bottom-[20%] h-12 w-12 rotate-45 rounded-sm border-2 border-foreground bg-highlight/20 hidden lg:block" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-background px-4 py-1.5 text-sm font-bold uppercase tracking-wide">
              <Sparkles className="h-4 w-4" />
              Updated{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </div>

            <h1 className="text-5xl font-black uppercase tracking-tight sm:text-7xl lg:text-8xl leading-[0.9]">
              Pharmacognosy
              <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 px-3">Lab</span>
                <span className="absolute inset-0 -skew-x-2 bg-highlight" />
              </span>
              <br />
              <span className="mt-2 inline-block">Repository</span>
            </h1>

            <p className="mt-6 text-base text-muted-foreground sm:text-lg max-w-xl mx-auto">
              Browse lab experiment images, organized by session. Scan QR codes
              to upload photos directly from your device.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="#experiments"
                className="inline-flex h-12 items-center gap-2 rounded-lg border-3 border-foreground bg-highlight px-6 text-sm font-bold uppercase tracking-wide transition-all hover:shadow-[4px_4px_0_0_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <FlaskConical className="h-4 w-4" />
                Browse Experiments
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/upload/1"
                className="inline-flex h-12 items-center gap-2 rounded-lg border-3 border-foreground bg-highlight-pink px-6 text-sm font-bold uppercase tracking-wide text-white transition-all hover:shadow-[4px_4px_0_0_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <Upload className="h-4 w-4" />
                Upload Images
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b-3 border-foreground">
        <div className="mx-auto max-w-6xl grid grid-cols-2 sm:grid-cols-4 divide-x-3 divide-foreground">
          <div className="px-4 py-6 text-center sm:px-6">
            <div className="text-3xl font-black sm:text-4xl">
              {stats.totalExperiments}
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Experiments
            </div>
          </div>
          <div className="px-4 py-6 text-center sm:px-6">
            <div className="text-3xl font-black sm:text-4xl">
              {stats.totalImages}
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Total Images
            </div>
          </div>
          <div className="px-4 py-6 text-center sm:px-6 border-t-3 sm:border-t-0 border-foreground">
            <div className="text-3xl font-black sm:text-4xl">
              {experiments.filter((e) => e.imageCount > 0).length}
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              With Photos
            </div>
          </div>
          <div className="px-4 py-6 text-center sm:px-6 border-t-3 sm:border-t-0 border-foreground">
            <div className="text-3xl font-black sm:text-4xl">QR</div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Scan to Upload
            </div>
          </div>
        </div>
      </section>

      {/* Experiments */}
      <section
        id="experiments"
        className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16"
      >
        <h2 className="text-center text-4xl font-black uppercase tracking-tight sm:text-5xl">
          Lab Experiments
        </h2>
        <p className="mt-3 text-center text-muted-foreground max-w-lg mx-auto">
          All experiments sorted by number. View images or upload new ones to
          contribute to the collection.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {experiments.map((exp, i) => {
            const thumb = experimentThumbnails[exp.number];
            const colorClass = badgeColors[i % badgeColors.length];
            return (
              <div
                key={exp.number}
                className="flex flex-col rounded-xl border-3 border-foreground bg-card p-5 transition-all hover:shadow-[6px_6px_0_0_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                {/* Top: label + thumbnail */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Experiment {exp.number}
                  </span>
                  {thumb ? (
                    <div className="relative h-8 w-8 overflow-hidden rounded-md border-2 border-foreground">
                      <Image
                        src={thumb.filename}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </div>
                  ) : (
                    <FlaskConical className="h-4 w-4 text-highlight" />
                  )}
                </div>

                {/* Title */}
                <h3 className="mt-1.5 text-lg font-extrabold leading-snug">
                  {exp.name}
                </h3>

                {/* Value badge */}
                <div className="mt-3">
                  <span
                    className={`inline-flex items-center rounded-md border-2 border-foreground px-3 py-1 text-sm font-bold ${colorClass}`}
                  >
                    {exp.imageCount}{" "}
                    {exp.imageCount === 1 ? "Image" : "Images"}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-3 flex-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {exp.description ||
                    (exp.imageCount > 0
                      ? `Updated ${new Date(exp.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.`
                      : "No photos uploaded yet.")}
                </p>

                {/* Category pill */}
                <div className="mt-3">
                  <span className="inline-flex items-center rounded-md border-2 border-foreground bg-highlight-green px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                    <FlaskConical className="mr-1 h-3 w-3" />
                    Lab Session
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href={`/experiment/${exp.number}`}
                    className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-foreground bg-background text-xs font-bold uppercase tracking-wide transition-all hover:bg-foreground hover:text-background"
                  >
                    Details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/upload/${exp.number}`}
                    className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-foreground bg-foreground text-xs font-bold uppercase tracking-wide text-background transition-all hover:bg-highlight hover:text-foreground"
                  >
                    Upload
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}

          {/* New Experiment Card */}
          <NewExperimentCard />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t-3 border-foreground">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 text-center">
          <h2 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
            Ready to Contribute?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            Scan the QR code for your experiment or visit the upload page to add
            your lab images to the collection.
          </p>
          <Link
            href="/upload/1"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-lg border-3 border-foreground bg-highlight px-6 text-sm font-bold uppercase tracking-wide transition-all hover:shadow-[4px_4px_0_0_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            <Upload className="h-4 w-4" />
            Upload Images
          </Link>
        </div>
      </section>

      {/* Quick Nav */}
      {experiments.length > 0 && (
        <section className="border-t-3 border-foreground">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <h2 className="mb-5 text-2xl font-black uppercase tracking-tight">
              By Experiment
            </h2>
            <div className="flex flex-wrap gap-2">
              {experiments.map((exp) => (
                <Link
                  key={exp.number}
                  href={`/experiment/${exp.number}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border-2 border-foreground px-3.5 py-2 text-sm font-bold transition-all hover:bg-foreground hover:text-background"
                >
                  <FlaskConical className="h-3.5 w-3.5" />
                  {exp.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
