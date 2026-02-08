export interface Experiment {
  /** The experiment number (1, 2, 3...) — also used as the ID */
  number: number;
  name: string;
  description: string;
  imageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Annotation {
  id: string;
  /** X position as percentage (0-100) */
  x: number;
  /** Y position as percentage (0-100) */
  y: number;
  label: string;
  /** Label display size */
  size?: "sm" | "md" | "lg";
  /** @deprecated kept for backward compat */
  labelX?: number;
  /** @deprecated kept for backward compat */
  labelY?: number;
}

export interface ExperimentImage {
  id: string;
  experimentNumber: number;
  filename: string;
  /** Optimized WebP version for the detail/lightbox view */
  optimized?: string;
  /** Small thumbnail for gallery grid */
  thumbnail?: string;
  originalName: string;
  description: string;
  /** Detailed explanation / notes that anyone can edit */
  notes: string;
  /** Annotation markers placed on the image */
  annotations: Annotation[];
  order: number;
  uploadedBy: string;
  mimeType: string;
  size: number;
  createdAt: string;
}
