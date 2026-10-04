import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useRef, useCallback, useEffect } from "react";

type FilterPreset = "original" | "grayscale" | "sepia" | "invert" | "blur";

interface FilterValues {
  brightness: number;
  contrast: number;
  saturation: number;
}

const FILTER_PRESETS: { key: FilterPreset; label: string }[] = [
  { key: "original", label: "Original" },
  { key: "grayscale", label: "Grayscale" },
  { key: "sepia", label: "Sepia" },
  { key: "invert", label: "Invert" },
  { key: "blur", label: "Blur" },
];

export default function ImageFilter() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const operationRevision = useRef(0);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterPreset>("original");
  const [values, setValues] = useState<FilterValues>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
  });
  const [filteredSrc, setFilteredSrc] = useState<string>("");
  const [error, setError] = useState<string>("");

  const imgRef = useRef<HTMLImageElement | null>(null);
  const filteredSrcRef = useRef<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const processFile = (file: File) => {
    operationRevision.current++;
    clearInteraction();
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    setError("");
    markInteraction();
    setImageFile(file);
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    if (filteredSrcRef.current) {
      URL.revokeObjectURL(filteredSrcRef.current);
      filteredSrcRef.current = "";
    }
    setFilteredSrc("");
    setActiveFilter("original");
    setValues({ brightness: 0, contrast: 0, saturation: 0 });
    setImageSrc(URL.createObjectURL(file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // Build CSS filter string
  const buildFilterString = useCallback(
    (preset: FilterPreset, sliders: FilterValues): string => {
      const filters: string[] = [];

      // Slider values always apply
      if (sliders.brightness !== 0) filters.push(`brightness(${1 + sliders.brightness / 100})`);
      if (sliders.contrast !== 0) filters.push(`contrast(${1 + sliders.contrast / 100})`);
      if (sliders.saturation !== 0) filters.push(`saturate(${1 + sliders.saturation / 100})`);

      // Preset filters stack on top
      switch (preset) {
        case "grayscale":
          filters.push("grayscale(1)");
          break;
        case "sepia":
          filters.push("sepia(1)");
          break;
        case "invert":
          filters.push("invert(1)");
          break;
        case "blur":
          filters.push("blur(4px)");
          break;
        case "original":
        default:
          break;
      }

      return filters.join(" ") || "none";
    },
    []
  );

  // Apply filter via canvas
  const applyFilter = useCallback(() => {
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

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const filterStr = buildFilterString(activeFilter, values);
      ctx.filter = filterStr;
      ctx.drawImage(img, 0, 0);
      // Reset filter so it doesn't affect toBlob internally
      ctx.filter = "none";

      canvas.toBlob(
        (blob) => {
          if (revision !== operationRevision.current) return;
          if (!blob || !blob.size) {
            setError("Failed to apply filter.");
            return;
          }
          if (filteredSrcRef.current) {
            URL.revokeObjectURL(filteredSrcRef.current);
          }
          const blobUrl = URL.createObjectURL(blob);
          filteredSrcRef.current = blobUrl;
          setFilteredSrc(blobUrl);
          recordSuccess("convert");
        },
        "image/png"
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Filter application failed.");
    }
  }, [imageFile, activeFilter, values, buildFilterString, recordSuccess]);

  // Re-apply whenever filter or values change
  useEffect(() => {
    if (imageSrc && imgRef.current) {
      applyFilter();
    }
  }, [imageSrc, activeFilter, values, applyFilter]);

  const handleSliderChange = (key: keyof FilterValues, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    operationRevision.current++;
    clearInteraction();
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    if (filteredSrcRef.current) {
      URL.revokeObjectURL(filteredSrcRef.current);
      filteredSrcRef.current = "";
    }
    setImageSrc("");
    setImageFile(null);
    setFilteredSrc("");
    setActiveFilter("original");
    setValues({ brightness: 0, contrast: 0, saturation: 0 });
    setError("");
  };

  const handleDownload = () => {
    if (!filteredSrc || !imageFile) return;
    const nameWithoutExt =
      imageFile.name.substring(0, imageFile.name.lastIndexOf(".")) || imageFile.name;
    const link = document.createElement("a");
    link.href = filteredSrc;
    link.download = `${nameWithoutExt}-filtered.png`;
    link.click();
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
          <span className="text-4xl mb-4">🎨</span>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>
            Click to upload an image
          </p>
          <p className="text-xs" style={{ color: "var(--color-mute)" }}>
            Apply filters like grayscale, sepia, invert, blur
          </p>
          <input
            id="filter-file-input"
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
              Filter Controls
            </span>

            {/* Preset filter buttons */}
            <div className="flex flex-wrap gap-1.5">
              {FILTER_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => setActiveFilter(preset.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors duration-150 ${
                    activeFilter === preset.key ? "btn-primary btn-sm" : ""
                  }`}
                  style={
                    activeFilter === preset.key
                      ? { backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", borderColor: "transparent" }
                      : { backgroundColor: "var(--color-canvas)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }
                  }
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Brightness */}
            <div>
              <div className="flex justify-between items-center text-xs font-medium mb-1.5">
                <label htmlFor="filter-brightness" style={{ color: "var(--color-ink)" }}>Brightness</label>
                <span style={{ color: "var(--color-primary)" }}>{values.brightness > 0 ? `+${values.brightness}` : values.brightness}</span>
              </div>
              <input
                id="filter-brightness"
                type="range"
                min="-100"
                max="100"
                step="1"
                value={values.brightness}
                onChange={(e) => handleSliderChange("brightness", parseInt(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex justify-between items-center text-xs font-medium mb-1.5">
                <label htmlFor="filter-contrast" style={{ color: "var(--color-ink)" }}>Contrast</label>
                <span style={{ color: "var(--color-primary)" }}>{values.contrast > 0 ? `+${values.contrast}` : values.contrast}</span>
              </div>
              <input
                id="filter-contrast"
                type="range"
                min="-100"
                max="100"
                step="1"
                value={values.contrast}
                onChange={(e) => handleSliderChange("contrast", parseInt(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
              />
            </div>

            {/* Saturation */}
            <div>
              <div className="flex justify-between items-center text-xs font-medium mb-1.5">
                <label htmlFor="filter-saturation" style={{ color: "var(--color-ink)" }}>Saturation</label>
                <span style={{ color: "var(--color-primary)" }}>{values.saturation > 0 ? `+${values.saturation}` : values.saturation}</span>
              </div>
              <input
                id="filter-saturation"
                type="range"
                min="-100"
                max="100"
                step="1"
                value={values.saturation}
                onChange={(e) => handleSliderChange("saturation", parseInt(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
              />
            </div>

            {/* Hidden reference image */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="reference"
              className="hidden"
              onLoad={applyFilter}
            />

            <div className="pt-4 border-t flex flex-col gap-2" style={{ borderColor: "var(--color-hairline)" }}>
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
                Reset & Upload New
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original */}
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

              {/* Filtered */}
              <div
                className="border rounded-xl p-3 flex flex-col items-center gap-2"
                style={{ borderColor: "var(--color-hairline)" }}
              >
                <span className="text-xs font-semibold" style={{ color: "var(--color-mute)" }}>
                  Filtered
                </span>
                <div
                  className="rounded-lg overflow-hidden w-full flex items-center justify-center h-48"
                  style={{ backgroundColor: "var(--color-canvas-soft)" }}
                >
                  {filteredSrc ? (
                    <img
                      src={filteredSrc}
                      alt="Filtered"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs italic" style={{ color: "var(--color-mute)" }}>
                      Applying...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {filteredSrc && (
              <button
                type="button"
                onClick={handleDownload}
                className="btn-primary btn-sm"
                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
              >
                Download Filtered PNG
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
