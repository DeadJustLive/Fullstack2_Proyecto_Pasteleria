// @pca:start
// @id(feature.adminimageoptimizer.view)
// @kind(view)
// @limit(lines: 300)
// @contract(AdminImageOptimizerView(props: AdminImageOptimizerContract))
// @relates(feature.adminimageoptimizer.interface)
// @relates(feature.adminimageoptimizer.dependencies)
// @relates(feature.adminimageoptimizer.metricsBadge)
// @relates(feature.adminimageoptimizer.previewCard)
// @desc(Implementacion visual principal del modulo AdminImageOptimizer con Canvas y compresion WebP)
// @pca:end

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ChangeEvent,
  type DragEvent,
  Upload,
  RefreshCw,
  AlertCircle,
  LinkIcon,
  Sliders,
  type ImageOptimizationResult,
  type AdminImageOptimizerContract,
} from "../dependencies/dependencies";
import { OptimizationMetricsBadge } from "../components/OptimizationMetricsBadge";
import { ImagePreviewCard } from "../components/ImagePreviewCard";

export function AdminImageOptimizerView(props: AdminImageOptimizerContract) {
  const {
    value,
    initialUrl = "",
    label = "Fotografía del Producto",
    maxWidth = 800,
    quality = 0.78,
    disabled = false,
    onImageReady,
    onChange,
    onReset,
  } = props;

  const [modo, setModo] = useState<"upload" | "url">("upload");
  const [currentUrl, setCurrentUrl] = useState<string>(value || initialUrl || "");
  const [currentQuality, setCurrentQuality] = useState<number>(quality);
  const [procesando, setProcesando] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ImageOptimizationResult | null>(null);
  const [mostrarAjustes, setMostrarAjustes] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastRawFileRef = useRef<File | null>(null);

  useEffect(() => {
    if (value !== undefined) setCurrentUrl(value);
  }, [value]);

  const optimizarArchivo = useCallback(
    (file: File, targetQuality: number) => {
      if (!file.type.startsWith("image/")) {
        setErrorMsg("El archivo seleccionado no es una imagen válida (JPG, PNG, WebP).");
        return;
      }
      setErrorMsg(null);
      setProcesando(true);
      lastRawFileRef.current = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        const rawSrc = e.target?.result as string;
        if (!rawSrc) {
          setProcesando(false);
          setErrorMsg("No fue posible leer la imagen seleccionada.");
          return;
        }

        const img = new Image();
        img.onload = () => {
          let targetW = img.naturalWidth || img.width;
          let targetH = img.naturalHeight || img.height;
          if (targetW > maxWidth) {
            targetH = Math.round((targetH * maxWidth) / targetW);
            targetW = maxWidth;
          }

          const canvas = document.createElement("canvas");
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            setProcesando(false);
            setErrorMsg("No se pudo inicializar el Canvas.");
            return;
          }

          ctx.drawImage(img, 0, 0, targetW, targetH);
          const webpDataUrl = canvas.toDataURL("image/webp", targetQuality);
          const base64Length = webpDataUrl.length - webpDataUrl.indexOf(",") - 1;
          const webpBytes = Math.round((base64Length * 3) / 4);

          const origKb = Math.max(1, Math.round(file.size / 1024));
          const optKb = Math.max(1, Math.round(webpBytes / 1024));
          const savings = origKb > 0 ? Math.round(((origKb - optKb) / origKb) * 100) : 0;

          const res: ImageOptimizationResult = {
            dataUrl: webpDataUrl,
            format: "image/webp",
            originalSizeKb: origKb,
            optimizedSizeKb: optKb,
            savingsPercent: savings,
            width: targetW,
            height: targetH,
          };

          setMetrics(res);
          setCurrentUrl(webpDataUrl);
          setProcesando(false);
          onImageReady?.(webpDataUrl, res);
          onChange?.(webpDataUrl);
        };
        img.onerror = () => {
          setProcesando(false);
          setErrorMsg("Imagen dañada o no soportada.");
        };
        img.src = rawSrc;
      };
      reader.onerror = () => {
        setProcesando(false);
        setErrorMsg("Error al leer el archivo local.");
      };
      reader.readAsDataURL(file);
    },
    [maxWidth, onImageReady, onChange]
  );

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) optimizarArchivo(file, currentQuality);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastrando(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) optimizarArchivo(file, currentQuality);
  };

  const handleCalidadChange = (nuevaCalidad: number) => {
    setCurrentQuality(nuevaCalidad);
    if (lastRawFileRef.current) optimizarArchivo(lastRawFileRef.current, nuevaCalidad);
  };

  const handleUrlInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setCurrentUrl(url);
    setMetrics(null);
    onChange?.(url);
  };

  const handleReset = () => {
    setCurrentUrl("");
    setMetrics(null);
    setErrorMsg(null);
    lastRawFileRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
    onReset?.();
    onChange?.("");
  };

  return (
    <div className="admin-image-optimizer">
      <div className="d-flex align-items-center justify-content-between mb-1.5">
        <label className="form-label small fw-bold mb-0 text-secondary">{label}</label>
        <div className="btn-group btn-group-sm" role="group">
          <button
            type="button"
            className={`btn btn-xs py-0.5 px-2 ${modo === "upload" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setModo("upload")}
            disabled={disabled}
            title="Subir archivo y comprimir a WebP"
          >
            <Upload size={12} className="me-1" />
            Subir WebP
          </button>
          <button
            type="button"
            className={`btn btn-xs py-0.5 px-2 ${modo === "url" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setModo("url")}
            disabled={disabled}
            title="Pegar URL externa directa"
          >
            <LinkIcon size={12} className="me-1" />
            URL
          </button>
        </div>
      </div>

      {modo === "url" ? (
        <div className="mb-2">
          <input
            type="url"
            className="form-control form-control-sm"
            placeholder="https://ejemplo.com/foto.jpg o /imagen/producto.webp"
            value={currentUrl}
            onChange={handleUrlInputChange}
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="upload-container mb-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            className="d-none"
            onChange={handleFileChange}
            disabled={disabled}
          />
          <div
            className={`p-3 text-center rounded border border-2 ${
              arrastrando ? "border-primary bg-primary-subtle" : "border-dashed bg-light"
            }`}
            style={{ cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.15s ease" }}
            onDragOver={(e) => { e.preventDefault(); if (!disabled) setArrastrando(true); }}
            onDragLeave={(e) => { e.preventDefault(); setArrastrando(false); }}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            {procesando ? (
              <div className="d-flex align-items-center justify-content-center gap-2 py-2 text-primary">
                <RefreshCw size={18} className="animate-spin" />
                <span className="small fw-semibold">Procesando compresión WebP en Canvas...</span>
              </div>
            ) : (
              <div className="py-1">
                <Upload size={22} className="text-secondary mb-1" />
                <div className="small fw-bold text-secondary">Haz clic o arrastra una imagen aquí</div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                  PNG o JPG se convierten automáticamente a WebP ligero (máx. {maxWidth}px)
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger py-1.5 px-2.5 small d-flex align-items-center gap-1.5 mb-2">
          <AlertCircle size={15} className="flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {metrics && <OptimizationMetricsBadge metrics={metrics} />}

      {currentUrl && (
        <ImagePreviewCard
          currentUrl={currentUrl}
          hasMetrics={!!metrics}
          optimizedSizeKb={metrics?.optimizedSizeKb}
          modo={modo}
          disabled={disabled}
          onToggleAjustes={() => setMostrarAjustes(!mostrarAjustes)}
          onReset={handleReset}
        />
      )}

      {mostrarAjustes && modo === "upload" && (
        <div className="p-2 border rounded bg-light mb-2">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="small text-muted fw-semibold">
              <Sliders size={12} className="me-1" /> Calidad WebP: {Math.round(currentQuality * 100)}%
            </span>
            <span className="badge bg-secondary font-monospace" style={{ fontSize: "0.7rem" }}>
              ancho máx: {maxWidth}px
            </span>
          </div>
          <input
            type="range"
            className="form-range"
            min="0.30"
            max="0.95"
            step="0.04"
            value={currentQuality}
            onChange={(e) => handleCalidadChange(parseFloat(e.target.value))}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
