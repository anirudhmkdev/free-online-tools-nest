import { useState, useRef, useCallback, useEffect } from "react";
import { formatBytes } from "../../helpers/utils";

type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

const FORMAT_OPTIONS: { value: OutputFormat; label: string; ext: string; mime: string }[] = [
  { value: "image/png", label: "PNG", ext: "png", mime: "image/png" },
  { value: "image/jpeg", label: "JPEG", ext: "jpg", mime: "image/jpeg" },
  { value: "image/webp", label: "WebP", ext: "webp", mime: "image/webp" },
];

export default function ImageFormatConverter() {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalFormat, setOriginalFormat] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/webp");
  const [quality, setQuality] = useState<number>(0.85);
  const [maxWidth, setMaxWidth] = useState<number>(0);
  const [convertedSrc, setConvertedSrc] = useState<string>("");
  const [convertedSize, setConvertedSize] = useState<number>(0);
  const [converting, setConverting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const imgRef = useRef<HTMLImageElement | null>(null);
  const convertedSrcRef = useRef<string>("");

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    setError("");
    setImageFile(file);
    setOriginalFormat(file.type || "unknown");
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    if (convertedSrcRef.current) {
      URL.revokeObjectURL(convertedSrcRef.current);
      convertedSrcRef.current = "";
    }
    setConvertedSrc("");
    setConvertedSize(0);
    setImageSrc(URL.createObjectURL(file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleConvert = useCallback(() => {
    if (!imgRef.current || !imageFile) {
      setError("No image loaded.");
      return;
    }
    const img = imgRef.current;
    if (!img.naturalWidth || !img.naturalHeight) return;

    setConverting(true);
    setError("");

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get 2D canvas context.");

      let w = img.naturalWidth;
      let h = img.naturalHeight;

      // Optional max width resize
      if (maxWidth > 0 && w > maxWidth) {
        const ratio = maxWidth / w;
        w = maxWidth;
        h = Math.round(h * ratio);
      }

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Conversion failed.");
            setConverting(false);
            return;
          }
          if (convertedSrcRef.current) {
            URL.revokeObjectURL(convertedSrcRef.current);
          }
          const blobUrl = URL.createObjectURL(blob);
          convertedSrcRef.current = blobUrl;
          setConvertedSrc(blobUrl);
          setConvertedSize(blob.size);
          setConverting(false);
        },
        outputFormat,
        outputFormat === "image/png" ? undefined : quality
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Conversion failed.");
      setConverting(false);
    }
  }, [imageFile, outputFormat, quality, maxWidth]);

  const handleDownload = () => {
    if (!convertedSrc || !imageFile) return;
    const opt = FORMAT_OPTIONS.find((f) => f.value === outputFormat);
    const nameWithoutExt =
      imageFile.name.substring(0, imageFile.name.lastIndexOf(".")) || imageFile.name;
    const link = document.createElement("a");
    link.href = convertedSrc;
    link.download = `${nameWithoutExt}.${opt?.ext || "png"}`;
    link.click();
  };

  const handleReset = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    if (convertedSrcRef.current) {
      URL.revokeObjectURL(convertedSrcRef.current);
      convertedSrcRef.current = "";
    }
    setImageSrc("");
    setImageFile(null);
    setOriginalFormat("");
    setConvertedSrc("");
    setConvertedSize(0);
    setError("");
  };

  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
      if (convertedSrcRef.current) URL.revokeObjectURL(convertedSrcRef.current);
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
          <span className="text-4xl mb-4">🔄</span>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>
            Click to upload an image
          </p>
          <p className="text-xs" style={{ color: "var(--color-mute)" }}>
            Convert between PNG, JPEG, and WebP
          </p>
          <input
            id="convert-file-input"
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
              Convert Settings
            </span>

            {/* Original info */}
            {imageFile && (
              <div className="space-y-1 text-xs" style={{ color: "var(--color-body)" }}>
                <div>
                  <span className="font-medium" style={{ color: "var(--color-ink)" }}>Original format: </span>
                  {originalFormat || "unknown"}
                </div>
                <div>
                  <span className="font-medium" style={{ color: "var(--color-ink)" }}>Size: </span>
                  {formatBytes(imageFile.size)}
                </div>
              </div>
            )}

            {/* Output Format */}
            <div>
              <label htmlFor="convert-format" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-ink)" }}>
                Output Format
              </label>
              <select
                id="convert-format"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
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
            {outputFormat !== "image/png" && (
              <div>
                <div className="flex justify-between items-center text-xs font-medium mb-1.5">
                  <label htmlFor="convert-quality" style={{ color: "var(--color-ink)" }}>
                    Quality
                  </label>
                  <span style={{ color: "var(--color-primary)" }}>{Math.round(quality * 100)}%</span>
                </div>
                <input
                  id="convert-quality"
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

            {/* Max width */}
            <div>
              <label htmlFor="convert-maxwidth" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-ink)" }}>
                Max Width (px, optional)
              </label>
              <input
                id="convert-maxwidth"
                type="number"
                min="0"
                value={maxWidth || ""}
                onChange={(e) => setMaxWidth(parseInt(e.target.value) || 0)}
                placeholder="Keep original"
                className="w-full h-10 px-3 border rounded-lg text-sm outline-none"
                style={{
                  backgroundColor: "var(--color-canvas-soft)",
                  borderColor: "var(--color-hairline)",
                  color: "var(--color-ink)",
                }}
              />
            </div>

            {/* Hidden reference image */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="reference"
              className="hidden"
            />

            <div className="pt-4 border-t flex flex-col gap-2" style={{ borderColor: "var(--color-hairline)" }}>
              <button
                type="button"
                onClick={handleConvert}
                disabled={converting}
                className="w-full btn-primary btn-sm"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-on-primary)",
                  opacity: converting ? 0.6 : 1,
                }}
              >
                {converting ? "Converting..." : "Convert Image"}
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

          {/* Preview & Comparison */}
          <div className="lg:col-span-2 space-y-4">
            {/* Size comparison */}
            {convertedSrc && imageFile && (
              <div
                className="grid grid-cols-3 gap-4 p-4 rounded-xl border text-center"
                style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas-soft-2)" }}
              >
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--color-mute)" }}>Original</span>
                  <span className="text-base font-semibold" style={{ color: "var(--color-ink)" }}>{formatBytes(imageFile.size)}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--color-mute)" }}>Converted</span>
                  <span className="text-base font-semibold" style={{ color: "var(--color-ink)" }}>{formatBytes(convertedSize)}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--color-mute)" }}>Change</span>
                  <span
                    className="text-base font-semibold"
                    style={{
                      color:
                        convertedSize < imageFile.size
                          ? "var(--color-success)"
                          : "var(--color-error)",
                    }}
                  >
                    {imageFile.size > 0
                      ? `${((convertedSize / imageFile.size - 1) * 100).toFixed(1)}%`
                      : "—"}
                  </span>
                </div>
              </div>
            )}

            {/* Before / After */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="border rounded-xl p-3 flex flex-col items-center gap-2"
                style={{ borderColor: "var(--color-hairline)" }}
              >
                <span className="text-xs font-semibold" style={{ color: "var(--color-mute)" }}>
                  Original
                </span>
                <div
                  className="rounded-lg overflow-hidden w-full flex items-center justify-center h-48"
                  style={{ backgroundColor: "var(--color-canvas-soft)" }}
                >
                  <img
                    src={imageSrc}
                    alt="Original"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
              <div
                className="border rounded-xl p-3 flex flex-col items-center gap-2"
                style={{ borderColor: "var(--color-hairline)" }}
              >
                <span className="text-xs font-semibold" style={{ color: "var(--color-mute)" }}>
                  Converted
                </span>
                <div
                  className="rounded-lg overflow-hidden w-full flex items-center justify-center h-48"
                  style={{ backgroundColor: "var(--color-canvas-soft)" }}
                >
                  {converting ? (
                    <span className="text-xs" style={{ color: "var(--color-mute)" }}>
                      Converting...
                    </span>
                  ) : convertedSrc ? (
                    <img
                      src={convertedSrc}
                      alt="Converted"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs italic" style={{ color: "var(--color-mute)" }}>
                      Not converted yet
                    </span>
                  )}
                </div>
              </div>
            </div>

            {convertedSrc && (
              <button
                type="button"
                onClick={handleDownload}
                className="btn-primary btn-sm"
                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
              >
                Download Converted Image
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
