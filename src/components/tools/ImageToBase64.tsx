import { useState, useCallback } from "react";
import { fileSizeLimitMessage, MAX_IMAGE_FILE_SIZE_BYTES } from "../../helpers/utils";

export default function ImageToBase64() {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [base64Str, setBase64Str] = useState<string>("");
  const [includePrefix, setIncludePrefix] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file.");
        return;
      }
      const sizeError = fileSizeLimitMessage(file, MAX_IMAGE_FILE_SIZE_BYTES, "Images");
      if (sizeError) {
        setError(sizeError);
        return;
      }
      setError("");
      setCopied(false);

      // Show preview
      if (imageSrc) URL.revokeObjectURL(imageSrc);
      setImageSrc(URL.createObjectURL(file));

      // Read as base64
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setBase64Str(result);
      };
      reader.onerror = () => {
        setError("Failed to read file.");
      };
      reader.readAsDataURL(file);
    },
    [imageSrc]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const getDisplayBase64 = useCallback((): string => {
    if (includePrefix) return base64Str;
    // Strip the data:image/...;base64, prefix
    const commaIndex = base64Str.indexOf(",");
    return commaIndex >= 0 ? base64Str.slice(commaIndex + 1) : base64Str;
  }, [base64Str, includePrefix]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError("");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copy failed. Select the output text and copy it manually.");
    }
  };

  const handleCopyRaw = () => {
    copyToClipboard(getDisplayBase64());
  };

  const handleCopyCss = () => {
    copyToClipboard(`url("${base64Str}")`);
  };

  const handleCopyHtml = () => {
    copyToClipboard(`src="${base64Str}"`);
  };

  const handleReset = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc("");
    setBase64Str("");
    setCopied(false);
    setError("");
  };

  const charCount = getDisplayBase64().length;

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
          <span className="text-4xl mb-4">🔤</span>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>
            Click to upload an image
          </p>
          <p className="text-xs" style={{ color: "var(--color-mute)" }}>
            Convert any image to a Base64 data URI
          </p>
          <input
            id="b64-file-input"
            aria-label="Choose an image"
            type="file"
            accept="image/*"
            className="file-upload-input"
            onChange={handleFileChange}
          />
        </div>
      )}

      {imageSrc && (
        <div className="space-y-6">
          {/* Preview */}
          <div
            className="rounded-xl p-4 flex items-center justify-center"
            style={{ backgroundColor: "var(--color-canvas-soft)" }}
          >
            <img
              src={imageSrc}
              alt="Uploaded"
              className="max-w-full h-auto rounded-lg"
              style={{ maxHeight: "250px", objectFit: "contain" }}
            />
          </div>

          {/* Toggle prefix */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includePrefix}
              onChange={(e) => setIncludePrefix(e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: "var(--color-primary)" }}
            />
            <span className="text-xs font-medium" style={{ color: "var(--color-ink)" }}>
              Include <code className="text-xs font-mono" style={{ color: "var(--color-mute)" }}>data:image/...;base64,</code> prefix
            </span>
          </label>

          {/* Base64 textarea */}
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="text-xs uppercase tracking-wider font-mono"
                style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}
              >
                Base64 Output
              </div>
              <span className="text-[10px] font-mono" style={{ color: "var(--color-mute)" }}>
                {charCount.toLocaleString()} characters
              </span>
            </div>
            <textarea
              readOnly
              value={getDisplayBase64()}
              rows={8}
              className="w-full px-4 py-3 border rounded-lg text-xs outline-none resize-y font-mono"
              style={{
                backgroundColor: "var(--color-canvas)",
                borderColor: "var(--color-hairline)",
                color: "var(--color-ink)",
                fontFamily: "var(--font-mono)",
                lineHeight: "1.5",
                wordBreak: "break-all",
              }}
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCopyRaw}
              className="btn-primary btn-sm"
              style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
            >
              {copied ? "Copied!" : "Copy Base64"}
            </button>
            <button
              type="button"
              onClick={handleCopyCss}
              className="px-4 py-2 text-xs font-medium rounded-lg border transition-colors duration-150"
              style={{
                borderColor: "var(--color-hairline)",
                color: "var(--color-ink)",
                backgroundColor: "var(--color-canvas)",
              }}
            >
              Copy as CSS background
            </button>
            <button
              type="button"
              onClick={handleCopyHtml}
              className="px-4 py-2 text-xs font-medium rounded-lg border transition-colors duration-150"
              style={{
                borderColor: "var(--color-hairline)",
                color: "var(--color-ink)",
                backgroundColor: "var(--color-canvas)",
              }}
            >
              Copy as HTML img src
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

      {error && (
        <div className="text-sm" style={{ color: "var(--color-error)" }}>
          {error}
        </div>
      )}
    </div>
  );
}
