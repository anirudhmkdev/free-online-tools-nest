import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useRef, useCallback, useEffect } from "react";

type AspectRatio = "free" | "1:1" | "16:9" | "4:3" | "3:2";

interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ASPECT_RATIO_LABELS: Record<AspectRatio, string> = {
  free: "Free",
  "1:1": "Square 1:1",
  "16:9": "16:9",
  "4:3": "4:3",
  "3:2": "3:2",
};

export default function ImageCropper() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const operationRevision = useRef(0);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("free");
  const [customWidth, setCustomWidth] = useState<number>(0);
  const [customHeight, setCustomHeight] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [croppedSrc, setCroppedSrc] = useState<string>("");

  const imgRef = useRef<HTMLImageElement | null>(null);
  const croppedSrcRef = useRef<string>("");

  const getAspectRatioValue = useCallback(
    (ar: AspectRatio): number | null => {
      switch (ar) {
        case "1:1": return 1;
        case "16:9": return 16 / 9;
        case "4:3": return 4 / 3;
        case "3:2": return 3 / 2;
        case "free": return null;
      }
    },
    []
  );

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
    setError("");
    setImageFile(file);
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    if (croppedSrcRef.current) {
      URL.revokeObjectURL(croppedSrcRef.current);
      croppedSrcRef.current = "";
    }
    setCroppedSrc("");
    setCustomWidth(0);
    setCustomHeight(0);
    setImageSrc(URL.createObjectURL(file));
  };

  const handleCrop = useCallback(() => {
    markInteraction();
    const revision = ++operationRevision.current;
    if (!imgRef.current || !imageFile) {
      setError("No image loaded.");
      return;
    }

    const img = imgRef.current;
    if (!img.naturalWidth || !img.naturalHeight) return;

    setError("");

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get 2D canvas context.");

      const natW = img.naturalWidth;
      const natH = img.naturalHeight;

      let cw = customWidth > 0 ? customWidth : natW;
      let ch = customHeight > 0 ? customHeight : natH;

      const ratio = getAspectRatioValue(aspectRatio);

      if (ratio !== null) {
        // Constrain to aspect ratio from the larger dimension
        if (customWidth > 0 && customHeight <= 0) {
          ch = Math.round(cw / ratio);
        } else if (customHeight > 0 && customWidth <= 0) {
          cw = Math.round(ch * ratio);
        } else if (customWidth > 0 && customHeight > 0) {
          // Both provided: use the one that fits within image bounds
          const fromW = cw;
          const fromH = Math.round(cw / ratio);
          if (fromH <= natH) {
            ch = fromH;
          } else {
            ch = customHeight;
            cw = Math.round(ch * ratio);
          }
        } else {
          // Neither provided: use natural size constrained by ratio
          if (natW / natH > ratio) {
            ch = natH;
            cw = Math.round(ch * ratio);
          } else {
            cw = natW;
            ch = Math.round(cw / ratio);
          }
        }
      }

      // Clamp to natural dimensions
      cw = Math.min(cw, natW);
      ch = Math.min(ch, natH);

      // Center the crop region
      const cropRegion: CropRegion = {
        x: Math.round((natW - cw) / 2),
        y: Math.round((natH - ch) / 2),
        width: cw,
        height: ch,
      };

      canvas.width = cw;
      canvas.height = ch;

      ctx.drawImage(
        img,
        cropRegion.x,
        cropRegion.y,
        cropRegion.width,
        cropRegion.height,
        0,
        0,
        cw,
        ch
      );

      canvas.toBlob(
        (blob) => {
          if (revision !== operationRevision.current) return;
          if (!blob || !blob.size) {
            setError("Failed to create cropped image.");
            return;
          }
          if (croppedSrcRef.current) {
            URL.revokeObjectURL(croppedSrcRef.current);
          }
          const blobUrl = URL.createObjectURL(blob);
          croppedSrcRef.current = blobUrl;
          setCroppedSrc(blobUrl);
          recordSuccess("convert");
        },
        "image/png"
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Crop failed.");
    }
  }, [imageFile, aspectRatio, customWidth, customHeight, getAspectRatioValue, markInteraction, recordSuccess]);

  const handleDownload = () => {
    if (!croppedSrc || !imageFile) return;
    const nameWithoutExt =
      imageFile.name.substring(0, imageFile.name.lastIndexOf(".")) ||
      imageFile.name;
    const link = document.createElement("a");
    link.href = croppedSrc;
    link.download = `${nameWithoutExt}-cropped.png`;
    link.click();
  };

  const handleReset = () => {
    operationRevision.current++;
    clearInteraction();
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    if (croppedSrcRef.current) {
      URL.revokeObjectURL(croppedSrcRef.current);
      croppedSrcRef.current = "";
    }
    setImageSrc("");
    setImageFile(null);
    setCroppedSrc("");
    setCustomWidth(0);
    setCustomHeight(0);
    setError("");
  };

  useEffect(() => () => { operationRevision.current++; clearInteraction(); }, [clearInteraction]);

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
          <span className="text-4xl mb-4">✂️</span>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>
            Click to upload an image
          </p>
          <p className="text-xs" style={{ color: "var(--color-mute)" }}>
            Supports PNG, JPEG, WebP
          </p>
          <input
            id="crop-file-input"
            aria-label="Choose an image"
            type="file"
            accept="image/*"
            className="file-upload-input"
            onChange={handleFileChange}
          />
        </div>
      )}

      {imageSrc && (
        <>
          {/* Image preview + crop area */}
          <div
            className="rounded-xl p-4 flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: "var(--color-canvas-soft)" }}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Source to crop"
              className="max-w-full h-auto rounded-lg"
              style={{ maxHeight: "400px", objectFit: "contain" }}
            />
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Aspect Ratio */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--color-ink)" }}>
                Aspect Ratio
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(ASPECT_RATIO_LABELS) as AspectRatio[]).map((ar) => (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => setAspectRatio(ar)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors duration-150 ${
                      aspectRatio === ar ? "btn-primary btn-sm" : ""
                    }`}
                    style={
                      aspectRatio === ar
                        ? { backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", borderColor: "transparent" }
                        : { backgroundColor: "var(--color-canvas)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }
                    }
                  >
                    {ASPECT_RATIO_LABELS[ar]}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Width */}
            <div>
              <label htmlFor="crop-width" className="block text-xs font-medium mb-2" style={{ color: "var(--color-ink)" }}>
                Width (px)
              </label>
              <input
                id="crop-width"
                type="number"
                min="1"
                value={customWidth || ""}
                onChange={(e) => setCustomWidth(parseInt(e.target.value) || 0)}
                placeholder="Auto"
                className="w-full h-10 px-3 border rounded-lg text-sm outline-none"
                style={{
                  backgroundColor: "var(--color-canvas-soft)",
                  borderColor: "var(--color-hairline)",
                  color: "var(--color-ink)",
                }}
              />
            </div>

            {/* Custom Height */}
            <div>
              <label htmlFor="crop-height" className="block text-xs font-medium mb-2" style={{ color: "var(--color-ink)" }}>
                Height (px)
              </label>
              <input
                id="crop-height"
                type="number"
                min="1"
                value={customHeight || ""}
                onChange={(e) => setCustomHeight(parseInt(e.target.value) || 0)}
                placeholder="Auto"
                className="w-full h-10 px-3 border rounded-lg text-sm outline-none"
                style={{
                  backgroundColor: "var(--color-canvas-soft)",
                  borderColor: "var(--color-hairline)",
                  color: "var(--color-ink)",
                }}
              />
            </div>

            {/* Crop Button */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleCrop}
                className="w-full btn-primary btn-sm"
                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
              >
                Crop Image
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm" style={{ color: "var(--color-error)" }}>
              {error}
            </div>
          )}

          {/* Cropped Result */}
          {croppedSrc && (
            <div className="space-y-4">
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
              >
                <div
                  className="text-xs uppercase tracking-wider mb-3 font-mono"
                  style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}
                >
                  Cropped Preview
                </div>
                <div
                  className="rounded-lg overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: "var(--color-canvas)" }}
                >
                  <img
                    src={croppedSrc}
                    alt="Cropped result"
                    className="max-w-full h-auto"
                    style={{ maxHeight: "300px", objectFit: "contain" }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="btn-primary btn-sm"
                  style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
                >
                  Download PNG
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-medium rounded-lg border transition-colors duration-150"
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
          )}
        </>
      )}
    </div>
  );
}
