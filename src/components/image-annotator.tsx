"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Annotation } from "@/lib/types";
import {
  Plus,
  X,
  Save,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Pencil,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface ImageAnnotatorProps {
  annotations: Annotation[];
  experimentNumber: number;
  imageId: string;
  imageSrc: string;
  imageAlt: string;
  readOnly?: boolean;
  onUpdate?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Size helpers                                                       */
/* ------------------------------------------------------------------ */
const SIZE_CLASSES: Record<string, string> = {
  sm: "text-[9px] sm:text-[10px] px-1.5 py-[2px]",
  md: "text-[11px] sm:text-xs px-2 py-0.5",
  lg: "text-sm sm:text-base px-2.5 py-1",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function ImageAnnotator({
  annotations: initialAnnotations,
  experimentNumber,
  imageId,
  imageSrc,
  imageAlt,
  readOnly = false,
  onUpdate,
}: ImageAnnotatorProps) {
  // ---- State ----
  const [annotations, setAnnotations] = useState<Annotation[]>(
    initialAnnotations || []
  );
  const [zoom, setZoom] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [labelText, setLabelText] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [panning, setPanning] = useState(false);
  const [labelsHidden, setLabelsHidden] = useState(false);

  // ---- Refs ----
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const clickOriginRef = useRef<{ x: number; y: number } | null>(null);
  const panOriginRef = useRef<{
    x: number;
    y: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);
  const zoomRef = useRef(zoom);
  const pinchRef = useRef({ dist: 0, zoom: 1 });
  zoomRef.current = zoom;

  const hasChanges =
    JSON.stringify(annotations) !== JSON.stringify(initialAnnotations);

  /* ================================================================ */
  /*  PLACEMENT                                                        */
  /* ================================================================ */

  /** Track mousedown + start drag-to-pan when zoomed */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      clickOriginRef.current = { x: e.clientX, y: e.clientY };

      // Start drag-to-pan when zoomed and not placing / dragging a label
      if (zoom > 1 && !placing && !dragging) {
        const el = scrollRef.current;
        if (el) {
          panOriginRef.current = {
            x: e.clientX,
            y: e.clientY,
            scrollLeft: el.scrollLeft,
            scrollTop: el.scrollTop,
          };
          setPanning(true);
        }
      }
    },
    [zoom, placing, dragging]
  );

  /** Place a new label on click */
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!placing || readOnly || dragging) return;

      // Ignore if mouse moved (was a scroll / drag)
      if (clickOriginRef.current) {
        const dx = Math.abs(e.clientX - clickOriginRef.current.x);
        const dy = Math.abs(e.clientY - clickOriginRef.current.y);
        if (dx > 5 || dy > 5) return;
      }

      const inner = innerRef.current;
      if (!inner) return;
      const rect = inner.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      if (x < 0 || x > 100 || y < 0 || y > 100) return;

      const ann: Annotation = { id: uuidv4(), x, y, label: "", size: "md" };
      setAnnotations((prev) => [...prev, ann]);
      setEditingId(ann.id);
      setLabelText("");
      setPlacing(false);
    },
    [placing, readOnly, dragging]
  );

  const saveLabel = (id: string) => {
    if (!labelText.trim()) {
      removeAnnotation(id);
      return;
    }
    setAnnotations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, label: labelText } : a))
    );
    setEditingId(null);
    setLabelText("");
  };

  const removeAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setLabelText("");
    }
  };

  const cycleSize = (id: string) => {
    const sizes: ("sm" | "md" | "lg")[] = ["sm", "md", "lg"];
    setAnnotations((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const idx = sizes.indexOf((a.size as "sm" | "md" | "lg") || "md");
        return { ...a, size: sizes[(idx + 1) % 3] };
      })
    );
  };

  /* ================================================================ */
  /*  DRAG LABELS                                                      */
  /* ================================================================ */

  const startDrag = (
    e: React.MouseEvent | React.TouchEvent,
    id: string
  ) => {
    if (readOnly) return;
    e.stopPropagation();
    e.preventDefault();
    const pt = "touches" in e ? e.touches[0] : e;
    setDragging(id);
    setDragStart({ x: pt.clientX, y: pt.clientY });
  };

  useEffect(() => {
    if (!dragging || !dragStart) return;
    const inner = innerRef.current;
    if (!inner) return;

    const move = (cx: number, cy: number) => {
      const rect = inner.getBoundingClientRect();
      const dx = ((cx - dragStart.x) / rect.width) * 100;
      const dy = ((cy - dragStart.y) / rect.height) * 100;
      setAnnotations((prev) =>
        prev.map((a) =>
          a.id !== dragging
            ? a
            : {
                ...a,
                x: Math.max(1, Math.min(99, a.x + dx)),
                y: Math.max(1, Math.min(99, a.y + dy)),
              }
        )
      );
      setDragStart({ x: cx, y: cy });
    };

    const onMM = (e: MouseEvent) => move(e.clientX, e.clientY);
    const onTM = (e: TouchEvent) => {
      e.preventDefault();
      move(e.touches[0].clientX, e.touches[0].clientY);
    };
    const end = () => {
      setDragging(null);
      setDragStart(null);
    };

    window.addEventListener("mousemove", onMM);
    window.addEventListener("mouseup", end);
    window.addEventListener("touchmove", onTM, { passive: false });
    window.addEventListener("touchend", end);
    return () => {
      window.removeEventListener("mousemove", onMM);
      window.removeEventListener("mouseup", end);
      window.removeEventListener("touchmove", onTM);
      window.removeEventListener("touchend", end);
    };
  }, [dragging, dragStart]);

  /* ================================================================ */
  /*  DRAG-TO-PAN (desktop cursor / no scrollbars)                     */
  /* ================================================================ */

  useEffect(() => {
    if (!panning) return;

    const onMove = (e: MouseEvent) => {
      const el = scrollRef.current;
      const origin = panOriginRef.current;
      if (!el || !origin) return;
      el.scrollLeft = origin.scrollLeft - (e.clientX - origin.x);
      el.scrollTop = origin.scrollTop - (e.clientY - origin.y);
    };

    const onUp = () => {
      setPanning(false);
      panOriginRef.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [panning]);

  /* ================================================================ */
  /*  ZOOM — scroll-wheel + pinch                                      */
  /* ================================================================ */

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Ctrl/Cmd + wheel → zoom (desktop)
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom((z) => Math.max(1, Math.min(5, z - e.deltaY * 0.01)));
      }
    };

    // Pinch → zoom (mobile)
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const d = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        pinchRef.current = { dist: d, zoom: zoomRef.current };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current.dist > 0) {
        e.preventDefault();
        const d = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        setZoom(
          Math.max(
            1,
            Math.min(5, pinchRef.current.zoom * (d / pinchRef.current.dist))
          )
        );
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinchRef.current.dist = 0;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  /* ================================================================ */
  /*  SAVE                                                             */
  /* ================================================================ */

  const saveAnnotations = async () => {
    setSaving(true);
    try {
      const clean = annotations.map(({ id, x, y, label, size }) => ({
        id,
        x,
        y,
        label,
        size,
      }));
      const res = await fetch(
        `/api/experiments/${experimentNumber}/images/${imageId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ annotations: clean }),
        }
      );
      if (res.ok) onUpdate?.();
    } catch (err) {
      console.error("Failed to save annotations:", err);
    }
    setSaving(false);
  };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <div className="relative">
      {/* ===== Zoom controls — top-left ===== */}
      <div className="absolute left-2 top-2 z-30 flex items-center gap-1">
        <button
          onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
          disabled={zoom <= 1}
          className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-foreground bg-white/90 backdrop-blur transition hover:bg-secondary disabled:opacity-30"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <span className="min-w-[3rem] rounded-md border-2 border-foreground bg-white/90 px-1.5 py-1 text-center text-[10px] font-bold backdrop-blur">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(5, z + 0.5))}
          disabled={zoom >= 5}
          className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-foreground bg-white/90 backdrop-blur transition hover:bg-secondary disabled:opacity-30"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        {zoom > 1 && (
          <button
            onClick={() => setZoom(1)}
            className="flex h-7 items-center gap-1 rounded-lg border-2 border-foreground bg-white/90 px-2 text-[10px] font-bold backdrop-blur transition hover:bg-secondary"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        )}
        {annotations.length > 0 && (
          <button
            onClick={() => setLabelsHidden((h) => !h)}
            className={`flex h-7 items-center gap-1 rounded-lg border-2 border-foreground px-2 text-[10px] font-bold backdrop-blur transition hover:bg-secondary ${
              labelsHidden
                ? "bg-foreground text-white"
                : "bg-white/90"
            }`}
            title={labelsHidden ? "Show labels" : "Hide labels"}
          >
            {labelsHidden ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
          </button>
        )}
      </div>

      {/* ===== Annotation panel — floating popup top-right ===== */}
      {!readOnly && (
        <div className="absolute right-2 top-2 z-30">
          {panelOpen ? (
            <div className="w-52 overflow-hidden rounded-xl border-3 border-foreground bg-white shadow-[4px_4px_0_0_#0a0a0a] sm:w-56">
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-foreground bg-highlight px-3 py-2">
                <h4 className="text-[11px] font-black uppercase tracking-wide">
                  Labels
                </h4>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="rounded p-0.5 hover:bg-black/10"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-1.5 px-3 py-2.5">
                <button
                  onClick={() => setPlacing(!placing)}
                  className={`inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-foreground text-[11px] font-bold uppercase transition ${
                    placing ? "bg-highlight" : "bg-white hover:bg-secondary"
                  }`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {placing ? "Placing..." : "Add"}
                </button>
                {hasChanges && (
                  <button
                    onClick={saveAnnotations}
                    disabled={saving}
                    className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-foreground bg-foreground text-[11px] font-bold uppercase text-white transition hover:bg-highlight hover:text-foreground disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save
                  </button>
                )}
              </div>

              {/* Label list */}
              <div className="max-h-40 overflow-y-auto border-t border-foreground/10">
                {annotations.filter((a) => a.label).length === 0 ? (
                  <p className="px-3 py-3 text-center text-[10px] text-muted-foreground">
                    No labels yet
                  </p>
                ) : (
                  annotations
                    .filter((a) => a.label)
                    .map((ann) => (
                      <div
                        key={ann.id}
                        className="flex items-center gap-1.5 border-b border-foreground/5 px-3 py-1.5 last:border-0"
                      >
                        <span className="flex-1 truncate text-[11px] font-bold">
                          {ann.label}
                        </span>
                        <button
                          onClick={() => cycleSize(ann.id)}
                          className="flex h-5 min-w-[20px] items-center justify-center rounded border border-foreground text-[9px] font-black hover:bg-secondary"
                          title="Cycle size: S → M → L"
                        >
                          {(ann.size || "md").charAt(0).toUpperCase()}
                        </button>
                        <button
                          onClick={() => removeAnnotation(ann.id)}
                          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setPanelOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-foreground bg-white/90 shadow-[2px_2px_0_0_#0a0a0a] backdrop-blur transition hover:bg-highlight"
              title="Annotations"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Placement indicator */}
      {placing && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-30 -translate-x-1/2 rounded-lg border-2 border-foreground bg-highlight px-4 py-2 text-xs font-bold uppercase tracking-wide shadow-[2px_2px_0_0_#0a0a0a]">
          Tap image to place label
        </div>
      )}

      {/* ===== Scrollable zoom container (no visible scrollbars) ===== */}
      <div
        ref={scrollRef}
        className="hide-scrollbar overflow-auto bg-secondary"
        style={{ maxHeight: "65vh", touchAction: "pan-x pan-y" }}
      >
        <div
          ref={innerRef}
          className={`relative select-none ${
            placing
              ? "cursor-crosshair"
              : panning
                ? "cursor-grabbing"
                : zoom > 1
                  ? "cursor-grab"
                  : ""
          }`}
          style={{ width: `${zoom * 100}%` }}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
        >
          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={imageAlt}
            className="pointer-events-none block h-auto w-full select-none"
            draggable={false}
          />

          {/* ---- Annotation labels ---- */}
          {!labelsHidden && annotations.map((ann) => {
            const sizeClass = SIZE_CLASSES[ann.size || "md"];
            return (
              <div
                key={ann.id}
                className="absolute"
                style={{
                  left: `${ann.x}%`,
                  top: `${ann.y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: dragging === ann.id ? 50 : 10,
                }}
              >
                {/* Editing input */}
                {editingId === ann.id ? (
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <input
                      autoFocus
                      value={labelText}
                      onChange={(e) => setLabelText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && labelText.trim())
                          saveLabel(ann.id);
                        if (e.key === "Escape") removeAnnotation(ann.id);
                      }}
                      placeholder="e.g. Epidermis"
                      className="w-28 rounded-lg border-2 border-foreground bg-white px-2 py-1 text-xs font-bold shadow-[2px_2px_0_0_rgba(10,10,10,0.3)] outline-none focus:ring-2 focus:ring-highlight sm:w-36"
                    />
                    <button
                      onClick={() =>
                        labelText.trim()
                          ? saveLabel(ann.id)
                          : removeAnnotation(ann.id)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-foreground bg-highlight font-bold shadow-[2px_2px_0_0_rgba(10,10,10,0.3)]"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : ann.label ? (
                  /* Rendered draggable label */
                  <div
                    className={`whitespace-nowrap ${
                      readOnly ? "" : "cursor-grab active:cursor-grabbing"
                    } ${dragging === ann.id ? "scale-105 opacity-80" : ""}`}
                    onMouseDown={(e) => startDrag(e, ann.id)}
                    onTouchStart={(e) => startDrag(e, ann.id)}
                  >
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border-2 border-foreground bg-white font-bold shadow-[2px_2px_0_0_rgba(10,10,10,0.4)] ${sizeClass}`}
                    >
                      {ann.label}
                      {!readOnly && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAnnotation(ann.id);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="ml-0.5 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </span>
                  </div>
                ) : (
                  /* Unlabeled dot — tap to delete */
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAnnotation(ann.id);
                    }}
                    className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-foreground bg-destructive text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== Legend ===== */}
      {!labelsHidden && annotations.some((a) => a.label) && (
        <div className="border-t-2 border-foreground bg-secondary/30 px-3 py-2.5 sm:px-4">
          <div className="flex flex-wrap gap-1.5">
            {annotations
              .filter((a) => a.label)
              .map((ann) => (
                <span
                  key={ann.id}
                  className="inline-flex items-center rounded-md border border-foreground/30 bg-background px-1.5 py-0.5 text-[10px] font-bold"
                >
                  {ann.label}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
