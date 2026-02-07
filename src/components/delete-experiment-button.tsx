"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteExperimentButtonProps {
  experimentNumber: number;
  experimentName: string;
  imageCount: number;
}

export function DeleteExperimentButton({
  experimentNumber,
  experimentName,
  imageCount,
}: DeleteExperimentButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/experiments/${experimentNumber}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to delete experiment:", err);
    }
    setDeleting(false);
  };

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border-2 border-destructive px-4 text-sm font-bold uppercase tracking-wide text-destructive transition-all hover:bg-destructive hover:text-white"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
    );
  }

  return (
    <div className="rounded-xl border-3 border-destructive bg-destructive/5 p-4">
      <p className="text-sm font-bold">
        Delete &ldquo;{experimentName}&rdquo;?
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        This will permanently delete the experiment and all {imageCount}{" "}
        {imageCount === 1 ? "image" : "images"}. Cannot be undone.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border-2 border-destructive bg-destructive px-3 text-xs font-bold uppercase text-white transition-all hover:bg-destructive/90 disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
          Yes, Delete
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="inline-flex h-8 items-center rounded-lg border-2 border-foreground px-3 text-xs font-bold uppercase transition-all hover:bg-secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
