"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X, Loader2, FileText } from "lucide-react";

interface ImageNotesProps {
  experimentNumber: number;
  imageId: string;
  initialNotes: string;
}

export function ImageNotes({
  experimentNumber,
  imageId,
  initialNotes,
}: ImageNotesProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/experiments/${experimentNumber}/images/${imageId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes }),
        }
      );
      if (res.ok) {
        setEditing(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to save notes:", err);
    }
    setSaving(false);
  };

  if (!editing) {
    return (
      <div className="group">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Detailed Explanation
          </h4>
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
        </div>
        {initialNotes ? (
          <div className="rounded-lg border-2 border-foreground bg-secondary/30 p-4 text-sm leading-relaxed whitespace-pre-wrap">
            {initialNotes}
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="w-full rounded-lg border-2 border-dashed border-foreground/20 py-6 text-center text-xs font-bold text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-all"
          >
            + Add a detailed explanation for this image
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5 mb-2">
        <FileText className="h-3.5 w-3.5" />
        Detailed Explanation
      </h4>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Write a detailed explanation of this image...&#10;&#10;For example:&#10;- What parts of the specimen are visible&#10;- Key identifying features&#10;- Observations from the microscope&#10;- Staining techniques used"
        rows={6}
        autoFocus
        className="w-full rounded-lg border-2 border-foreground bg-background px-4 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-highlight resize-y"
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border-2 border-foreground bg-foreground px-3 text-xs font-bold uppercase text-background transition-all hover:bg-highlight hover:text-foreground disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          Save
        </button>
        <button
          onClick={() => {
            setNotes(initialNotes || "");
            setEditing(false);
          }}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border-2 border-foreground px-3 text-xs font-bold uppercase transition-all hover:bg-secondary"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
      </div>
    </div>
  );
}
