"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { QrCode, Copy, Check, Download } from "lucide-react";

interface QRCodeSectionProps {
  experimentNumber: number;
}

export function QRCodeSection({ experimentNumber }: QRCodeSectionProps) {
  const [qrData, setQrData] = useState<{
    qrCode: string;
    uploadUrl: string;
  } | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (showQR && !qrData) {
      fetch(`/api/experiments/${experimentNumber}/qrcode`)
        .then((res) => res.json())
        .then((data) => setQrData(data))
        .catch(console.error);
    }
  }, [showQR, experimentNumber, qrData]);

  const copyUrl = async () => {
    if (qrData?.uploadUrl) {
      await navigator.clipboard.writeText(qrData.uploadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQR = () => {
    if (qrData?.qrCode) {
      const link = document.createElement("a");
      link.download = `qr-experiment-${experimentNumber}.png`;
      link.href = qrData.qrCode;
      link.click();
    }
  };

  if (!showQR) {
    return (
      <button
        onClick={() => setShowQR(true)}
        className="inline-flex items-center gap-2 rounded-lg border-2 border-foreground px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all hover:bg-foreground hover:text-background"
      >
        <QrCode className="h-4 w-4" />
        Show QR Code
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
      {qrData ? (
        <>
          <div className="relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-xl border-3 border-foreground bg-white p-2">
            <Image
              src={qrData.qrCode}
              alt="QR Code"
              fill
              className="object-contain p-1"
              unoptimized
            />
          </div>
          <div className="flex flex-col gap-3 text-center sm:text-left">
            <p className="text-sm font-bold">
              Scan to upload to Experiment {experimentNumber}
            </p>
            <div className="flex items-center gap-2 rounded-lg border-2 border-foreground bg-secondary px-3 py-2">
              <code className="flex-1 truncate text-xs font-mono">
                {qrData.uploadUrl}
              </code>
              <button
                onClick={copyUrl}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded border-2 border-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadQR}
                className="inline-flex items-center gap-1.5 rounded-lg border-2 border-foreground px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all hover:bg-foreground hover:text-background"
              >
                <Download className="h-3.5 w-3.5" />
                Download QR
              </button>
              <button
                onClick={() => setShowQR(false)}
                className="inline-flex items-center px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
              >
                Hide
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3 text-sm font-bold">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          Generating QR code...
        </div>
      )}
    </div>
  );
}
