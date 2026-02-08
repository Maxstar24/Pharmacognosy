"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExperimentImage } from "@/lib/types";
import { ImageAnnotator } from "./image-annotator";
import { ImageNotes } from "./image-notes";
import {
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Download,
  Pencil,
  Check,
  Loader2,
  Trash2,
  Tag,
  FileText,
} from "lucide-react";

interface ImageGalleryProps {
  images: ExperimentImage[];
  compact?: boolean;
  experimentNumber?: number;
}

export function ImageGallery({
  images,
  compact,
  experimentNumber,
}: ImageGalleryProps) {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const saveDescription = async (imageId: string) => {
    if (!experimentNumber) return;
    setSaving(true);
    try {
      await fetch(
        `/api/experiments/${experimentNumber}/images/${imageId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: editDesc }),
        }
      );
      setEditingId(null);
      router.refresh();
    } catch (err) {
      console.error("Failed to update description:", err);
    }
    setSaving(false);
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!experimentNumber) return;
    if (!confirm("Delete this image? This cannot be undone.")) return;
    setDeletingId(imageId);
    try {
      const res = await fetch(
        `/api/experiments/${experimentNumber}/images/${imageId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setSelectedIndex(null);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to delete image:", err);
    }
    setDeletingId(null);
  };

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-3 border-dashed border-foreground/20 py-14 text-center">
        <svg
          className="h-9 w-9 text-muted-foreground/30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="mt-3 text-sm font-bold text-muted-foreground">
          No images yet
        </p>
      </div>
    );
  }

  const selectedImage =
    selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <>
      {/* Grid */}
      <div
        className={
          compact
            ? "grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6"
            : "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
        }
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className="group relative overflow-hidden rounded-xl border-3 border-foreground bg-card transition-all hover:shadow-[4px_4px_0_0_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            {/* Delete */}
            {experimentNumber && !compact && (
              <button
                onClick={() => handleDeleteImage(image.id)}
                disabled={deletingId === image.id}
                className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md border-2 border-foreground bg-background text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive hover:text-white hover:border-destructive"
              >
                {deletingId === image.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            )}

            <div
              className={`relative overflow-hidden cursor-pointer ${
                compact ? "aspect-square" : "aspect-[4/3]"
              }`}
              onClick={() => setSelectedIndex(index)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.filename}
                alt={image.description || image.originalName}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {!compact && (
                <span className="absolute left-2 top-2 inline-flex items-center rounded-md border-2 border-foreground bg-highlight px-1.5 py-0.5 text-[10px] sm:text-xs font-black">
                  #{image.order}
                </span>
              )}
              {!compact && (
                <div className="absolute right-2 bottom-2 flex gap-1">
                  {image.annotations && image.annotations.length > 0 && (
                    <span className="inline-flex h-5 items-center gap-0.5 rounded-md border border-foreground bg-highlight px-1.5 text-[10px] font-black">
                      <Tag className="h-2.5 w-2.5" />
                      {image.annotations.length}
                    </span>
                  )}
                  {image.notes && (
                    <span className="inline-flex h-5 items-center rounded-md border border-foreground bg-highlight-blue px-1.5 text-[10px] font-black text-white">
                      <FileText className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>
              )}
            </div>
            {!compact && (
              <div className="border-t-2 border-foreground p-3">
                {editingId === image.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Add a description..."
                      rows={2}
                      className="w-full rounded-lg border-2 border-foreground bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-highlight resize-none"
                      autoFocus
                    />
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => saveDescription(image.id)}
                        disabled={saving}
                        className="inline-flex h-7 items-center gap-1 rounded-md border-2 border-foreground bg-foreground px-2 text-xs font-bold text-background"
                      >
                        {saving ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="inline-flex h-7 items-center rounded-md border-2 border-foreground px-2 text-xs font-bold"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="group/desc">
                    {image.description ? (
                      <div className="flex items-start gap-1.5">
                        <p className="flex-1 text-sm font-bold leading-snug line-clamp-2">
                          {image.description}
                        </p>
                        {experimentNumber && (
                          <button
                            onClick={() => {
                              setEditDesc(image.description);
                              setEditingId(image.id);
                            }}
                            className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover/desc:opacity-100 hover:bg-secondary"
                          >
                            <Pencil className="h-3 w-3 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    ) : experimentNumber ? (
                      <button
                        onClick={() => {
                          setEditDesc("");
                          setEditingId(image.id);
                        }}
                        className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        + Add description
                      </button>
                    ) : null}
                  </div>
                )}
                <div className="mt-1.5 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {image.uploadedBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(image.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ===== LIGHTBOX / DETAIL VIEW ===== */}
      {selectedImage && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="mx-auto my-2 sm:my-4 max-w-5xl rounded-none sm:rounded-2xl border-0 sm:border-3 border-foreground bg-card sm:shadow-[8px_8px_0_0_#0a0a0a] min-h-screen sm:min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* === Top navigation bar === */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b-2 border-foreground bg-card px-3 sm:px-5 py-2.5 sm:rounded-t-2xl">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="inline-flex items-center rounded-md border-2 border-foreground bg-highlight px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-black">
                  #{selectedImage.order}
                </span>
                <span className="text-xs sm:text-sm font-bold">
                  {selectedIndex + 1} / {images.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={selectedIndex <= 0}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-30 disabled:pointer-events-none"
                  onClick={() => setSelectedIndex(selectedIndex - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={selectedIndex >= images.length - 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-30 disabled:pointer-events-none"
                  onClick={() => setSelectedIndex(selectedIndex + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-foreground transition-colors hover:bg-foreground hover:text-background"
                  onClick={() => setSelectedIndex(null)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* === Image with annotations + zoom === */}
            <ImageAnnotator
              key={`annotator-${selectedImage.id}`}
              annotations={selectedImage.annotations || []}
              experimentNumber={
                experimentNumber || selectedImage.experimentNumber
              }
              imageId={selectedImage.id}
              imageSrc={selectedImage.filename}
              imageAlt={
                selectedImage.description || selectedImage.originalName
              }
              readOnly={!experimentNumber}
              onUpdate={() => router.refresh()}
            />

            {/* === Info bar === */}
            <div className="border-t-2 border-foreground px-3 sm:px-5 py-4 space-y-3">
              {/* Description */}
              {selectedImage.description && (
                <p className="text-base sm:text-lg font-bold leading-snug">
                  {selectedImage.description}
                </p>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <User className="h-3.5 w-3.5" />
                  {selectedImage.uploadedBy}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(selectedImage.createdAt).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" }
                  )}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={selectedImage.filename}
                  download={selectedImage.originalName}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border-2 border-foreground bg-foreground px-4 text-xs font-bold uppercase text-background transition-all hover:bg-highlight hover:text-foreground"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
                {experimentNumber && (
                  <button
                    onClick={() => handleDeleteImage(selectedImage.id)}
                    disabled={deletingId === selectedImage.id}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border-2 border-destructive px-4 text-xs font-bold uppercase text-destructive transition-all hover:bg-destructive hover:text-white"
                  >
                    {deletingId === selectedImage.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* === Notes / Explanation === */}
            {experimentNumber && (
              <div className="border-t-2 border-foreground px-3 sm:px-5 py-4 sm:py-5">
                <ImageNotes
                  key={`notes-${selectedImage.id}`}
                  experimentNumber={experimentNumber}
                  imageId={selectedImage.id}
                  initialNotes={selectedImage.notes || ""}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
