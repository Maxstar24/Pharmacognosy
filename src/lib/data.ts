import { getRedis } from "./redis";
import { Annotation, Experiment, ExperimentImage } from "./types";
import { v4 as uuidv4 } from "uuid";

const EXPERIMENTS_KEY = "pharmacognosy:experiments";
const IMAGES_PREFIX = "pharmacognosy:images:";

// ============ Experiments ============

export async function getAllExperiments(): Promise<Experiment[]> {
  const redis = getRedis();
  const data = await redis.hgetall(EXPERIMENTS_KEY);
  const experiments: Experiment[] = Object.values(data).map((v) =>
    JSON.parse(v)
  );
  return experiments.sort((a, b) => a.number - b.number);
}

export async function getExperiment(num: number): Promise<Experiment | null> {
  const redis = getRedis();
  const data = await redis.hget(EXPERIMENTS_KEY, String(num));
  if (!data) return null;
  return JSON.parse(data);
}

/** Create a new experiment with a name and optional description. */
export async function createExperiment(
  num: number,
  name: string,
  description: string = ""
): Promise<Experiment> {
  const redis = getRedis();
  const now = new Date().toISOString();
  const experiment: Experiment = {
    number: num,
    name,
    description,
    imageCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  await redis.hset(EXPERIMENTS_KEY, String(num), JSON.stringify(experiment));
  return experiment;
}

/** Get or auto-create an experiment by number. */
export async function ensureExperiment(num: number): Promise<Experiment> {
  const existing = await getExperiment(num);
  if (existing) return existing;
  return createExperiment(num, `Experiment ${num}`);
}

/** Update experiment name/description. */
export async function updateExperimentMeta(
  num: number,
  updates: { name?: string; description?: string }
): Promise<Experiment | null> {
  const redis = getRedis();
  const existing = await getExperiment(num);
  if (!existing) return null;
  const updated: Experiment = {
    ...existing,
    ...(updates.name !== undefined && { name: updates.name }),
    ...(updates.description !== undefined && {
      description: updates.description,
    }),
    updatedAt: new Date().toISOString(),
  };
  await redis.hset(EXPERIMENTS_KEY, String(num), JSON.stringify(updated));
  return updated;
}

/** Get the next available experiment number. */
export async function getNextExperimentNumber(): Promise<number> {
  const experiments = await getAllExperiments();
  if (experiments.length === 0) return 1;
  return experiments[experiments.length - 1].number + 1;
}

// ============ Images ============

export async function getExperimentImages(
  num: number
): Promise<ExperimentImage[]> {
  const redis = getRedis();
  const data = await redis.hgetall(`${IMAGES_PREFIX}${num}`);
  const images: ExperimentImage[] = Object.values(data).map((v) =>
    JSON.parse(v)
  );
  return images.sort((a, b) => a.order - b.order);
}

export async function getImage(
  num: number,
  imageId: string
): Promise<ExperimentImage | null> {
  const redis = getRedis();
  const data = await redis.hget(`${IMAGES_PREFIX}${num}`, imageId);
  if (!data) return null;
  return JSON.parse(data);
}

export async function addImage(
  num: number,
  filename: string,
  originalName: string,
  description: string,
  uploadedBy: string,
  mimeType: string,
  size: number
): Promise<ExperimentImage> {
  const redis = getRedis();

  // Auto-create the experiment if it doesn't exist
  await ensureExperiment(num);

  const id = uuidv4();
  const existingImages = await getExperimentImages(num);
  const order = existingImages.length + 1;

  const image: ExperimentImage = {
    id,
    experimentNumber: num,
    filename,
    originalName,
    description,
    notes: "",
    annotations: [],
    order,
    uploadedBy,
    mimeType,
    size,
    createdAt: new Date().toISOString(),
  };

  await redis.hset(`${IMAGES_PREFIX}${num}`, id, JSON.stringify(image));

  // Update experiment image count
  const experiment = await getExperiment(num);
  if (experiment) {
    experiment.imageCount = existingImages.length + 1;
    experiment.updatedAt = new Date().toISOString();
    await redis.hset(EXPERIMENTS_KEY, String(num), JSON.stringify(experiment));
  }

  return image;
}

export async function updateImageDescription(
  num: number,
  imageId: string,
  description: string
): Promise<ExperimentImage | null> {
  const redis = getRedis();
  const image = await getImage(num, imageId);
  if (!image) return null;
  image.description = description;
  await redis.hset(
    `${IMAGES_PREFIX}${num}`,
    imageId,
    JSON.stringify(image)
  );
  return image;
}

export async function updateImageNotes(
  num: number,
  imageId: string,
  notes: string
): Promise<ExperimentImage | null> {
  const redis = getRedis();
  const image = await getImage(num, imageId);
  if (!image) return null;
  image.notes = notes;
  await redis.hset(`${IMAGES_PREFIX}${num}`, imageId, JSON.stringify(image));
  return image;
}

export async function updateImageAnnotations(
  num: number,
  imageId: string,
  annotations: Annotation[]
): Promise<ExperimentImage | null> {
  const redis = getRedis();
  const image = await getImage(num, imageId);
  if (!image) return null;
  image.annotations = annotations;
  await redis.hset(`${IMAGES_PREFIX}${num}`, imageId, JSON.stringify(image));
  return image;
}

export async function deleteImage(
  num: number,
  imageId: string
): Promise<boolean> {
  const redis = getRedis();
  const deleted = await redis.hdel(`${IMAGES_PREFIX}${num}`, imageId);

  if (deleted > 0) {
    const images = await getExperimentImages(num);
    const experiment = await getExperiment(num);
    if (experiment) {
      experiment.imageCount = images.length;
      experiment.updatedAt = new Date().toISOString();
      await redis.hset(
        EXPERIMENTS_KEY,
        String(num),
        JSON.stringify(experiment)
      );
    }
  }

  return deleted > 0;
}

// ============ Delete Experiment ============

export async function deleteExperiment(num: number): Promise<boolean> {
  const redis = getRedis();
  const deleted = await redis.hdel(EXPERIMENTS_KEY, String(num));
  // Also delete all image metadata
  await redis.del(`${IMAGES_PREFIX}${num}`);
  return deleted > 0;
}

// ============ Stats ============

export async function getStats() {
  const experiments = await getAllExperiments();
  const totalImages = experiments.reduce((sum, e) => sum + e.imageCount, 0);
  return {
    totalExperiments: experiments.length,
    totalImages,
  };
}
