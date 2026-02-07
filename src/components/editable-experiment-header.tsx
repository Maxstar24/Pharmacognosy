"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X, Loader2 } from "lucide-react";

interface EditableExperimentHeaderProps {
  experimentNumber: number;
  initialName: string;
  initialDescription: string;
}

export function EditableExperimentHeader({
  experimentNumber,
  initialName,
  initialDescription,
}: EditableExperimentHeaderProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/experiments/${experimentNumber}/meta`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });
      if (res.ok) {
        setEditing(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to update:", err);
    }
    setSaving(false);
  };

  if (!editing) {
    return (
      <div className="group">
        <div className="flex items-start gap-2">
          <h1 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
            {initialName}
          </h1>
          <button
            onClick={() => setEditing(true)}
            className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border-2 border-foreground/20 opacity-0 transition-all group-hover:opacity-100 hover:border-foreground hover:bg-secondary"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
        {initialDescription && (
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            {initialDescription}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-bold uppercase tracking-wide">
          Experiment Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border-2 border-foreground bg-background px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-highlight"
          autoFocus
        />
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-wide">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description for this experiment..."
          rows={2}
          className="mt-1 w-full rounded-lg border-2 border-foreground bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-highlight resize-none"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
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
            setName(initialName);
            setDescription(initialDescription);
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
