"use client";

import { ImageUpload } from "@/components/image-upload";
import { useRouter } from "next/navigation";

interface UploadClientProps {
  experimentNumber: number;
}

export function UploadClient({ experimentNumber }: UploadClientProps) {
  const router = useRouter();

  return (
    <ImageUpload
      experimentNumber={experimentNumber}
      onUploadComplete={() => {
        router.refresh();
      }}
    />
  );
}
