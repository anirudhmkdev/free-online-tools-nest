import { useState, useRef, useCallback, useEffect } from "react";
import { formatBytes } from "../../helpers/utils";

type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: "image/png", label: "PNG" },
  { value: "image/jpeg", label: "JPEG" },
  { value: "image/webp", label: "WebP" },
];

export default function ImageResizer() {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [maintainRatio, setMaintainRatio] = useState<boolean>(true);
  const [format, setFormat] = useState<OutputFormat>("image/png");
  const [quality, setQuality] = useState<number>(0.85);
  const [resizedSrc, setResizedSrc] = useState<string>("");
  const [resizedSize, setResizedSize] = useState<number>(0);
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const imgRef = useRef<HTMLImageElement | null>(null);
  const resizedSrcRef = useRef<string>("");

  // Update height when width changes and ratio is locked
  const handleWidthChange = useCallback(
    (val: number) => {
      setWidth(val);
      if (maintainRatio && originalWidth > 0 && val > 0) {
        setHeight(Math.round(val * (originalHeight / originalWidth)));
      }
    },
    [maintainRatio, originalWidth, originalHeight]
  );

  // Update width when height changes and ratio is locked
  const handleHeightChange = useCallback(
    (val: number) => {
      setHeight(val);
      if (maintainRatio && originalHeight > 0 && val > 0) {
        setWidth(Math.round(val * (originalWidth / originalHeight)));
      }
    },
    [maintainRatio, originalWidth, originalHeight]
  );

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    setError("");
    setImageFile(file);
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    if (resizedSrcRef.current) {
      URL.revokeObjectURL(resizedSrcRef.current);
      resizedSrcRef.current = "";
    }
    setResizedSrc("");
    setResizedSize(0);

    const url = URL.createObjectURL(file);
    setImageSrc(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const onImgLoad = useCallback(() => {
    if (!imgRef.current) return;
    const w = imgRef.current.naturalWidth;
    const h = imgRef.current.naturalHeight;
    setOriginalWidth(w);
    setOriginalHeight(h);
    setWidth(w);
    setHeight(h);
  }, []);

  const handleResize = useCallback(() => {
    if (!imgRef.current || !imageFile) {
      setError("No image loaded.");
      return;
    }
    const img = imgRef.current;
    if (!img.naturalWidth || !img.naturalHeight) return;

    if (width < 1 || height < 1) {
      setError("Width and height must be at least 1 pixel.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get 2D canvas context.");

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Resize failed.");
            setProcessing(false);
            return;
          }
          if (resizedSrcRef.current) {
            URL.revokeObjectURL(resizedSrcRef.current);
          }
          const blobUrl = URL.createObjectURL(blob);
          resizedSrcRef.current = blobUrl;
          setResizedSrc(blobUrl);
          setResizedSize(blob.size);
          setProcessing(false);
        },
        format,
        format === "image/png" ? undefined : quality
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Resize failed.");
      setProcessing(false);
    }
  }, [imageFile, width, height, format, quality]);

  const handleDownload = () => {
    if (!resizedSrc || !imageFile) return;
    const ext = format === "image/webp" ? "webp" : format === "image/jpeg" ? "jpg" : "png";
    const nameWithoutExt =
      imageFile.name.substring(0, imageFile.name.lastIndexOf(".")) || imageFile.name;
    const link = document.createElement("a");
    link.href = resizedSrc;
    link.download = `${nameWithoutExt}-resized.${ext}`;
    link.click();
  };

  const handleReset = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    if (resizedSrcRef.current) {
      URL.revokeObjectURL(resizedSrcRef.current);
      resizedSrcRef.current = "";
    }
    setImageSrc("");
    setImageFile(null);
    setOriginalWidth(0);
    setOriginalHeight(0);
    setWidth(0);
    setHeight(0);
    setResizedSrc("");
    setResizedSize(0);
    setError("");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
      if (resizedSrcRef.current) URL.revokeObjectURL(resizedSrcRef.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      {!imageSrc && (
        <div
          className="file-upload-zone border-2 border-dashed rounded-xl p-10 text-center cursor-pointer flex flex-col items-center justify-center min-h-[200px] transition-all duration-200"
          style={{
            borderColor: "var(--color-hairline)",
            backgroundColor: "var(--color-canvas-soft)",
          }}
        >
          <span className="text-4xl mb-4">📐</span>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>
            Click to upload an image
          </p>
          <p className="text-xs" style={{ color: "var(--color-mute)" }}>
            Supports PNG, JPEG, WebP
          </p>
          <input
            id="resize-file-input"
            aria-label="Choose an image"
            type="file"
            accept="image/*"
            className="file-upload-input"
            onChange={handleFileChange}
          />
        </div>
      )}

      {imageSrc && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div
            className="lg:col-span-1 space-y-5 p-5 border rounded-xl"
            style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}
          >
            <span className="block text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--color-mute)" }}>
              Resize Settings
            </span>

            {/* Original size info */}
            {originalWidth > 0 && (
              <div className="text-xs" style={{ color: "var(--color-body)" }}>
                Original: {originalWidth} × {originalHeight}px
                {imageFile && <span className="ml-2">({formatBytes(imageFile.size)})</span>}
              </div>
            )}

            {/* Width */}
            <div>
              <label htmlFor="resize-width" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-ink)" }}>
                Width (px)
              </label>
              <input
                id="resize-width"
                type="number"
                min="1"
                value={width || ""}
                onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                className="w-full h-10 px-3 border rounded-lg text-sm outline-none"
                style={{
                  backgroundColor: "var(--color-canvas-soft)",
                  borderColor: "var(--color-hairline)",
                  color: "var(--color-ink)",
                }}
              />
            </div>

            {/* Height */}
            <div>
              <label htmlFor="resize-height" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-ink)" }}>
                Height (px)
              </label>
              <input
                id="resize-height"
                type="number"
                min="1"
                value={height || ""}
                onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                className="w-full h-10 px-3 border rounded-lg text-sm outline-none"
                style={{
                  backgroundColor: "var(--color-canvas-soft)",
                  borderColor: "var(--color-hairline)",
                  color: "var(--color-ink)",
                }}
              />
            </div>

            {/* Aspect ratio toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={maintainRatio}
                onChange={(e) => setMaintainRatio(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: "var(--color-primary)" }}
              />
              <span className="text-xs font-medium" style={{ color: "var(--color-ink)" }}>
                Maintain aspect ratio
              </span>
            </label>

            {/* Format */}
            <div>
              <label htmlFor="resize-format" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-ink)" }}>
                Output Format
              </label>
              <select
                id="resize-format"
                value={format}
                onChange={(e) => setFormat(e.target.value as OutputFormat)}
                className="w-full h-10 px-3 border rounded-lg text-sm outline-none"
                style={{
                  backgroundColor: "var(--color-canvas)",
                  borderColor: "var(--color-hairline)",
                  color: "var(--color-ink)",
                }}
              >
                {FORMAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quality (non-PNG) */}
            {format !== "image/png" && (
              <div>
                <div className="flex justify-between items-center text-xs font-medium mb-1.5">
                  <label htmlFor="resize-quality" style={{ color: "var(--color-ink)" }}>
                    Quality
                  </label>
                  <span style={{ color: "var(--color-primary)" }}>{Math.round(quality * 100)}%</span>
                </div>
                <input
                  id="resize-quality"
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

            {/* Hidden image for dimensions */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="reference"
              className="hidden"
              onLoad={onImgLoad}
            />

            <div className="pt-4 border-t flex flex-col gap-2" style={{ borderColor: "var(--color-hairline)" }}>
              <button
                type="button"
                onClick={handleResize}
                disabled={processing}
                className="w-full btn-primary btn-sm"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-on-primary)",
                  opacity: processing ? 0.6 : 1,
                }}
              >
                {processing ? "Resizing..." : "Resize Image"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-full px-3 py-2 text-xs font-medium rounded-lg border transition-colors duration-150"
                style={{
                  borderColor: "var(--color-hairline)",
                  color: "var(--color-mute)",
                  backgroundColor: "var(--color-canvas)",
                }}
              >
                Upload New Image
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2 space-y-4">
            {resizedSrc && (
              <div
                className="grid grid-cols-3 gap-4 p-4 rounded-xl border text-center"
                style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas-soft-2)" }}
              >
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--color-mute)" }}>Width</span>
                  <span className="text-base font-semibold" style={{ color: "var(--color-ink)" }}>{width}px</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--color-mute)" }}>Height</span>
                  <span className="text-base font-semibold" style={{ color: "var(--color-ink)" }}>{height}px</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--color-mute)" }}>File Size</span>
                  <span className="text-base font-semibold" style={{ color: "var(--color-ink)" }}>{formatBytes(resizedSize)}</span>
                </div>
              </div>
            )}

            {resizedSrc && (
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
              >
                <div
                  className="text-xs uppercase tracking-wider mb-3 font-mono"
                  style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}
                >
                  Preview
                </div>
                <div
                  className="rounded-lg overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: "var(--color-canvas)" }}
                >
                  <img
                    src={resizedSrc}
                    alt="Resized preview"
                    className="max-w-full h-auto"
                    style={{ maxHeight: "350px", objectFit: "contain" }}
                  />
                </div>
              </div>
            )}

            {resizedSrc && (
              <button
                type="button"
                onClick={handleDownload}
                className="btn-primary btn-sm"
                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
              >
                Download Resized Image
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm" style={{ color: "var(--color-error)" }}>
          {error}
        </div>
      )}
    </div>
  );
}
