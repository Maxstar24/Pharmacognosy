"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";

export function NewExperimentCard() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          number: number ? parseInt(number) : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create experiment");
        setLoading(false);
        return;
      }

      setName("");
      setDescription("");
      setNumber("");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col items-center justify-center rounded-xl border-3 border-dashed border-foreground/30 p-5 text-center transition-all hover:border-foreground hover:bg-secondary/50 min-h-[240px] cursor-pointer"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-foreground/30 bg-secondary">
          <Plus className="h-6 w-6 text-muted-foreground" strokeWidth={2.5} />
        </div>
        <span className="mt-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Add Experiment
        </span>
      </button>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border-3 border-foreground bg-card p-5">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        New Experiment
      </span>

      <div className="mt-3 space-y-3">
        {/* Number (optional) */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wide">
            Number <span className="font-normal text-muted-foreground">(auto if empty)</span>
          </label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 5"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="mt-1 w-full rounded-lg border-2 border-foreground bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-highlight"
          />
        </div>

        {/* Name */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wide">
            Name <span className="text-destructive">*</span>
          </label>
          <input
            placeholder="e.g. Microscopic Examination of Starch"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border-2 border-foreground bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-highlight"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wide">
            Description
          </label>
          <textarea
            placeholder="Brief description of the experiment..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border-2 border-foreground bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-highlight resize-none"
          />
        </div>

        {error && (
          <p className="text-xs font-bold text-destructive">{error}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-foreground bg-foreground text-xs font-bold uppercase tracking-wide text-background transition-all hover:bg-highlight hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Create"
            )}
          </button>
          <button
            onClick={() => {
              setOpen(false);
              setError("");
            }}
            className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border-2 border-foreground bg-background text-xs font-bold uppercase tracking-wide transition-all hover:bg-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
