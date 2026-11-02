// @pca:start
// @id(feature.adminimageoptimizer.metricsBadge)
// @kind(component)
// @limit(lines: 120)
// @contract(OptimizationMetricsBadge(props))
// @relates(feature.adminimageoptimizer.dependencies)
// @desc(Subcomponente privado para visualizacion de metricas de compresion WebP y ahorro de tamano)
// @pca:end

import {
  Check,
  FileCheck,
  type ImageOptimizationResult,
} from "../dependencies/dependencies";

interface OptimizationMetricsBadgeProps {
  metrics: ImageOptimizationResult;
}

export function OptimizationMetricsBadge({ metrics }: OptimizationMetricsBadgeProps) {
  const isSavingsPositive = metrics.savingsPercent > 0;

  return (
    <div className="card bg-light border-success-subtle p-2 mb-2">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <FileCheck size={16} className="text-success" />
          <span className="small fw-bold text-secondary">
            WebP Optimizado: {metrics.width}×{metrics.height} px
          </span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-secondary-subtle text-secondary font-monospace small">
            Antes: {metrics.originalSizeKb} KB
          </span>
          <span className="badge bg-success font-monospace small d-inline-flex align-items-center gap-1">
            <Check size={12} />
            Ahora: {metrics.optimizedSizeKb} KB
          </span>
          {isSavingsPositive && (
            <span className="badge bg-success-subtle text-success border border-success-subtle fw-bold small">
              -{metrics.savingsPercent}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
