import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useEffect, useRef, useCallback } from "react";
import ErrorBanner from "../ErrorBanner";
import { fileSizeLimitMessage, formatBytes, MAX_IMAGE_FILE_SIZE_BYTES } from "../../helpers/utils";

interface ImageStats {
  name: string;
  originalSize: number;
  compressedSize: number;
  originalWidth: number;
  originalHeight: number;
  compressedWidth: number;
  compressedHeight: number;
}

export default function ImageCompressor() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const operationRevision = useRef(0);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number>(0.8);
  const [format, setFormat] = useState<string>("image/jpeg");
  const [scaleWidth, setScaleWidth] = useState<number>(100); // percentage (scale)
  
  const [compressedSrc, setCompressedSrc] = useState<string>("");
  const [stats, setStats] = useState<ImageStats | null>(null);
  const [compressing, setCompressing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const compressedSrcRef = useRef<string>("");

  // Perform compression client-side
  const compressImage = useCallback(() => {
    const revision = ++operationRevision.current;
    if (!originalImgRef.current || !imageFile) return;

    const img = originalImgRef.current;
    // Guard: image must have loaded dimensions
    if (!img.naturalWidth || !img.naturalHeight) return;

    setCompressing(true);
    setError("");

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not construct 2D canvas context.");
      }

      // Calculate new dimensions based on scale percentage
      const newWidth = Math.round(img.naturalWidth * (scaleWidth / 100));
      const newHeight = Math.round(img.naturalHeight * (scaleWidth / 100));

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convert canvas content to blob
      canvas.toBlob(
        (blob) => {
          if (revision !== operationRevision.current) return;
          if (!blob || !blob.size) {
            setError("Compression failed. Unable to extract image blob.");
            setCompressing(false);
            return;
          }

          // Revoke previous blob URL via ref (avoids stale closure on compressedSrc state)
          if (compressedSrcRef.current) {
            URL.revokeObjectURL(compressedSrcRef.current);
          }

          const blobUrl = URL.createObjectURL(blob);
          compressedSrcRef.current = blobUrl;
          setCompressedSrc(blobUrl);
          recordSuccess("convert");

          setStats({
            name: imageFile.name,
            originalSize: imageFile.size,
            compressedSize: blob.size,
            originalWidth: img.naturalWidth,
            originalHeight: img.naturalHeight,
            compressedWidth: newWidth,
            compressedHeight: newHeight,
          });

          setCompressing(false);
        },
        format,
        format === "image/png" ? undefined : quality // PNG does not support quality options in toBlob
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to compress image.");
      setCompressing(false);
    }
  }, [imageFile, quality, format, scaleWidth, recordSuccess]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
      if (compressedSrc) URL.revokeObjectURL(compressedSrc);
    };
  }, [imageSrc, compressedSrc]);

  // Trigger compression when settings change or image loads
  useEffect(() => {
    if (imageSrc && originalImgRef.current) {
      compressImage();
    }
  }, [imageSrc, quality, format, scaleWidth, compressImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    operationRevision.current++;
    clearInteraction();
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    const sizeError = fileSizeLimitMessage(file, MAX_IMAGE_FILE_SIZE_BYTES, "Image");
    if (sizeError) {
      setError(sizeError);
      return;
    }

    setError("");
    markInteraction();
    setImageFile(file);

    // Revoke previous URLs
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    if (compressedSrc) URL.revokeObjectURL(compressedSrc);
    
    setCompressedSrc("");
    setStats(null);

    const srcUrl = URL.createObjectURL(file);
    setImageSrc(srcUrl);
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const triggerDownload = () => {
    if (!compressedSrc || !stats) return;
    
    // Choose correct extension based on mime type
    const ext = format === "image/webp" ? "webp" : format === "image/png" ? "png" : "jpg";
    const nameWithoutExt = stats.name.substring(0, stats.name.lastIndexOf(".")) || stats.name;
    const downloadName = `${nameWithoutExt}-compressed.${ext}`;

    const link = document.createElement("a");
    link.href = compressedSrc;
    link.download = downloadName;
    link.click();
  };

  const handleReset = () => {
    operationRevision.current++;
    clearInteraction();
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    if (compressedSrc) URL.revokeObjectURL(compressedSrc);
    setImageSrc("");
    setImageFile(null);
    setCompressedSrc("");
    setStats(null);
    setError("");
  };

  const savingsPercentage = stats
    ? Math.max(0, Math.round(((stats.originalSize - stats.compressedSize) / stats.originalSize) * 100))
    : 0;

  useEffect(() => () => { operationRevision.current++; clearInteraction(); }, [clearInteraction]);

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!imageSrc && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="file-upload-zone border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[220px]"
          style={{
            borderColor: "var(--color-hairline)",
            backgroundColor: "var(--color-canvas-soft)",
          }}
        >
          <span className="text-4xl mb-4">🖼️</span>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>
            Drag & drop your image here, or click to browse
          </p>
          <p className="text-xs" style={{ color: "var(--color-mute)" }}>
            Supports PNG, JPEG, and WebP (runs locally inside your browser)
          </p>
          <input
            id="file-select"
            aria-label="Choose an image"
            type="file"
            accept="image/*"
            className="file-upload-input"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Editor/Settings & Stats */}
      {imageSrc && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings / Controls */}
          <div className="lg:col-span-1 space-y-5 p-5 border rounded-xl" style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}>
            <span className="block text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--color-mute)" }}>
              Compression Settings
            </span>

            {/* Output Format */}
            <div className="space-y-1.5">
              <label htmlFor="comp-format" className="block text-xs font-medium" style={{ color: "var(--color-ink)" }}>
                Output Format
              </label>
              <select
                id="comp-format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded border outline-none"
                style={{
                  backgroundColor: "var(--color-canvas)",
                  borderColor: "var(--color-hairline)",
                  color: "var(--color-ink)",
                }}
              >
                <option value="image/jpeg">JPEG (.jpg)</option>
                <option value="image/webp">WebP (.webp)</option>
                <option value="image/png">PNG (.png)</option>
              </select>
            </div>

            {/* Quality Slider (non-PNG) */}
            {format !== "image/png" && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-medium">
                  <label htmlFor="comp-quality" style={{ color: "var(--color-ink)" }}>Quality</label>
                  <span style={{ color: "var(--color-primary)" }}>{Math.round(quality * 100)}%</span>
                </div>
                <input
                  id="comp-quality"
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                  style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
                />
              </div>
            )}

            {/* Resize Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-medium">
                <label htmlFor="comp-scale" style={{ color: "var(--color-ink)" }}>Resize Scale</label>
                <span style={{ color: "var(--color-primary)" }}>{scaleWidth}%</span>
              </div>
              <input
                id="comp-scale"
                type="range"
                min="10"
                max="100"
                step="5"
                value={scaleWidth}
                onChange={(e) => setScaleWidth(parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                  style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
                />
            </div>

            {/* Hidden image to load dimensions */}
            <img
              ref={originalImgRef}
              src={imageSrc}
              alt="Original Hidden Reference"
              className="hidden"
              onLoad={compressImage}
            />

            <div className="pt-4 border-t flex flex-col gap-2" style={{ borderColor: "var(--color-hairline)" }}>
              <button
                type="button"
                onClick={triggerDownload}
                disabled={compressing || !compressedSrc}
                className="w-full btn-primary"
                style={{
                  opacity: compressing || !compressedSrc ? 0.6 : 1,
                }}
              >
                {compressing ? "Compressing..." : "Download Compressed Image"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-full px-3 py-2 text-xs font-medium rounded-md transition-colors duration-150 border text-center"
                style={{
                  borderColor: "var(--color-hairline)",
                  color: "var(--color-mute)",
                  backgroundColor: "var(--color-canvas)",
                }}
              >
                Upload Different Image
              </button>
            </div>
          </div>

          {/* Previews & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {stats && (
              <div className="grid grid-cols-3 gap-4 p-4 rounded-xl border text-center" style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas-soft-2)" }}>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--color-mute)" }}>Original Size</span>
                  <span className="text-base font-semibold" style={{ color: "var(--color-ink)" }}>{formatBytes(stats.originalSize)}</span>
                  <span className="block text-[10px] font-mono mt-0.5" style={{ color: "var(--color-mute)" }}>{stats.originalWidth}x{stats.originalHeight}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--color-mute)" }}>Compressed Size</span>
                  <span className="text-base font-semibold" style={{ color: "var(--color-ink)" }}>{formatBytes(stats.compressedSize)}</span>
                  <span className="block text-[10px] font-mono mt-0.5" style={{ color: "var(--color-mute)" }}>{stats.compressedWidth}x{stats.compressedHeight}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--color-mute)" }}>Total Savings</span>
                  <span className="text-base font-semibold" style={{ color: "var(--color-success)" }}>
                    {savingsPercentage > 0 ? `${savingsPercentage}%` : "0%"}
                  </span>
                  <span className="block text-[10px] mt-0.5" style={{ color: "var(--color-mute)" }}>Smaller</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Preview */}
              <div className="border rounded-xl p-3 flex flex-col items-center gap-2" style={{ borderColor: "var(--color-hairline)" }}>
                <span className="text-xs font-semibold" style={{ color: "var(--color-mute)" }}>Original</span>
                <div className="relative border rounded-lg overflow-hidden w-full flex items-center justify-center h-48" style={{ backgroundColor: "var(--color-canvas-soft)" }}>
                  <img src={imageSrc} alt="Original input preview" className="max-w-full max-h-full object-contain" />
                </div>
              </div>

              {/* Compressed Preview */}
              <div className="border rounded-xl p-3 flex flex-col items-center gap-2" style={{ borderColor: "var(--color-hairline)" }}>
                <span className="text-xs font-semibold" style={{ color: "var(--color-mute)" }}>Optimized Output</span>
                <div className="relative border rounded-lg overflow-hidden w-full flex items-center justify-center h-48" style={{ backgroundColor: "var(--color-canvas-soft)" }}>
                  {compressing ? (
                    <div className="flex flex-col items-center gap-2 text-sm" style={{ color: "var(--color-mute)" }}>
                      <svg className="animate-spin h-5 w-5" style={{ color: "var(--color-violet)" }} fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      <span>Processing...</span>
                    </div>
                  ) : compressedSrc ? (
                    <img src={compressedSrc} alt="Compressed output preview" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-xs italic" style={{ color: "var(--color-mute)" }}>Compressed preview not ready</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ErrorBanner message={error} />
    </div>
  );
}
