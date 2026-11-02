// @pca:start
// @id(feature.adminimageoptimizer.previewCard)
// @kind(component)
// @limit(lines: 100)
// @contract(ImagePreviewCard(props))
// @relates(feature.adminimageoptimizer.dependencies)
// @desc(Subcomponente privado de tarjeta de vista previa e informacion de Data URL)
// @pca:end

import {
  ImageIcon,
  RefreshCw,
  Sliders,
} from "../dependencies/dependencies";

interface ImagePreviewCardProps {
  currentUrl: string;
  hasMetrics: boolean;
  optimizedSizeKb?: number;
  modo: "upload" | "url";
  disabled?: boolean;
  onToggleAjustes?: () => void;
  onReset: () => void;
}

export function ImagePreviewCard({
  currentUrl,
  hasMetrics,
  optimizedSizeKb,
  modo,
  disabled = false,
  onToggleAjustes,
  onReset,
}: ImagePreviewCardProps) {
  const isDataUrl = currentUrl.startsWith("data:");
  const sizeKb = optimizedSizeKb || Math.round(currentUrl.length / 1024);

  return (
    <div className="d-flex align-items-center gap-3 p-2 border rounded bg-white mb-2">
      <div
        className="rounded border overflow-hidden flex-shrink-0 bg-light d-flex align-items-center justify-content-center"
        style={{ width: 56, height: 56 }}
      >
        <img
          src={currentUrl}
          alt="Vista previa"
          className="w-100 h-100 object-fit-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <ImageIcon size={22} className="text-muted d-none" />
      </div>
      <div className="flex-grow-1 overflow-hidden">
        <span className="small fw-bold d-block text-truncate text-secondary">
          {hasMetrics ? "Imagen WebP generada en memoria" : "Imagen vinculada"}
        </span>
        <span className="text-muted small font-monospace d-block text-truncate" style={{ fontSize: "0.72rem" }}>
          {isDataUrl ? `Data URL (${sizeKb} KB)` : currentUrl}
        </span>
      </div>
      <div className="d-flex align-items-center gap-1">
        {modo === "upload" && onToggleAjustes && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary py-0.5 px-1.5"
            title="Ajustes de compresión"
            onClick={onToggleAjustes}
          >
            <Sliders size={13} />
          </button>
        )}
        <button
          type="button"
          className="btn btn-sm btn-outline-danger py-0.5 px-1.5"
          title="Restablecer imagen"
          onClick={onReset}
          disabled={disabled}
        >
          <RefreshCw size={13} />
        </button>
      </div>
    </div>
  );
}
