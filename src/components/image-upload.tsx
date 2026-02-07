"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  experimentNumber: number;
  onUploadComplete?: () => void;
}

interface PreviewFile {
  file: File;
  preview: string;
}

export function ImageUpload({
  experimentNumber,
  onUploadComplete,
}: ImageUploadProps) {
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [description, setDescription] = useState("");
  const [uploadedBy, setUploadedBy] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    setSuccess(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp", ".heic", ".heif"],
    },
    maxSize: 50 * 1024 * 1024,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setSuccess(false);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f.file));
      formData.append("description", description);
      formData.append("uploadedBy", uploadedBy || "Anonymous");

      const response = await fetch(
        `/api/experiments/${experimentNumber}/images`,
        { method: "POST", body: formData }
      );

      if (!response.ok) throw new Error("Upload failed");

      files.forEach((f) => URL.revokeObjectURL(f.preview));
      setFiles([]);
      setDescription("");
      setSuccess(true);
      onUploadComplete?.();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`relative cursor-pointer rounded-xl border-3 border-dashed p-8 text-center transition-all duration-200 ${
          isDragActive
            ? "border-foreground bg-highlight/10 scale-[1.01]"
            : "border-foreground/30 hover:border-foreground hover:bg-secondary/50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-foreground bg-highlight">
            <Upload className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide">
              {isDragActive ? "Drop images here" : "Drag & drop images here"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              or tap to browse — JPEG, PNG, WebP, GIF up to 50MB
            </p>
          </div>
        </div>
      </div>

      {/* Previews */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wide">
              {files.length} {files.length === 1 ? "file" : "files"} selected
            </span>
            <button
              onClick={() => {
                files.forEach((f) => URL.revokeObjectURL(f.preview));
                setFiles([]);
              }}
              className="text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {files.map((f, index) => (
              <div
                key={index}
                className="group relative aspect-square overflow-hidden rounded-lg border-2 border-foreground bg-secondary"
              >
                <Image
                  src={f.preview}
                  alt={f.file.name}
                  fill
                  className="object-cover"
                  sizes="150px"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md border border-foreground bg-background text-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-foreground hover:text-background"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fields + Submit */}
      {files.length > 0 && (
        <div className="space-y-4 rounded-xl border-2 border-foreground bg-secondary/30 p-5">
          <div className="space-y-1.5">
            <label
              htmlFor="uploadedBy"
              className="text-xs font-bold uppercase tracking-wide"
            >
              Your Name
            </label>
            <input
              id="uploadedBy"
              placeholder="Optional"
              value={uploadedBy}
              onChange={(e) => setUploadedBy(e.target.value)}
              className="w-full rounded-lg border-2 border-foreground bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-highlight"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="description"
              className="text-xs font-bold uppercase tracking-wide"
            >
              Description
            </label>
            <textarea
              id="description"
              placeholder="What do these images show?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border-2 border-foreground bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-highlight resize-none"
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="w-full rounded-lg border-3 border-foreground bg-foreground py-3 text-sm font-bold uppercase tracking-wide text-background transition-all hover:bg-highlight hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Upload {files.length}{" "}
                {files.length === 1 ? "Image" : "Images"}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="rounded-xl border-3 border-highlight-green bg-highlight-green/10 p-4 text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-highlight-green">
            Images uploaded successfully!
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Thank you for contributing to the lab collection.
          </p>
        </div>
      )}
    </div>
  );
}
