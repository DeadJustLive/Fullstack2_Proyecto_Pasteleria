import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  Lock,
  Plus,
  Printer,
  Sparkles,
} from "lucide-react";

export function ComponentesShowcase() {
  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalDestructivo, setModalDestructivo] = useState(false);
  const [modalAlertaStock, setModalAlertaStock] = useState(false);
  const [modalExitoPos, setModalExitoPos] = useState(false);
  const [cargando, setCargando] = useState(false);

  function simularCarga() {
    setCargando(true);
    setTimeout(() => setCargando(false), 2000);
  }

  return (
    <div className="container-fluid px-0">
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2">
          <Sparkles className="text-primary" size={24} />
          <h2 className="brand-font fs-3 text-secondary mb-0">
            UI Kit: Botones, Modales &amp; Componentes (React + Bootstrap 5)
          </h2>
        </div>
        <p className="text-muted small mt-1 mb-0">
          Catálogo interactivo con las clases y componentes canónicos de Bootstrap 5 adaptados al branding de Crème &amp; Co sin Tailwind.
        </p>
      </div>

      {/* SECCIÓN 1: VARIANTES DE BOTONES BOOTSTRAP */}
      <div className="card admin-card p-4 mb-4">
        <div className="mb-3">
          <h4 className="brand-font fs-5 text-secondary mb-1">1. Opciones de Botones Bootstrap</h4>
          <span className="text-muted small">
            Estilos y variantes de <code>.btn</code> definidos para la PWA de administración
          </span>
        </div>

        <div className="mb-4">
          <span className="form-label small fw-bold text-uppercase text-secondary d-block mb-2">
            Variantes Principales
          </span>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <button type="button" className="btn btn-primary">btn-primary</button>
            <button type="button" className="btn btn-secondary">btn-secondary</button>
            <button type="button" className="btn btn-outline-primary">btn-outline-primary</button>
            <button type="button" className="btn btn-danger">btn-danger</button>
            <button type="button" className="btn btn-warning">btn-warning</button>
            <button type="button" className="btn btn-success">btn-success</button>
          </div>
        </div>

        <div className="mb-4">
          <span className="form-label small fw-bold text-uppercase text-secondary d-block mb-2">
            Escala de Tamaños y Formas
          </span>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <button type="button" className="btn btn-sm btn-primary">Pequeño (btn-sm)</button>
            <button type="button" className="btn btn-primary">Estándar</button>
            <button type="button" className="btn btn-lg btn-primary">Grande (btn-lg)</button>
            <button type="button" className="btn btn-primary rounded-pill">Píldora (rounded-pill)</button>
            <button type="button" className="btn btn-primary p-2" title="Acción rápida"><Plus size={18} /></button>
          </div>
        </div>

        <div>
          <span className="form-label small fw-bold text-uppercase text-secondary d-block mb-2">
            Estados Especiales y Restricciones
          </span>
          <div className="d-flex flex-wrap align-items-center gap-3">
            <button
              type="button"
              onClick={simularCarga}
              disabled={cargando}
              className="btn btn-primary d-inline-flex align-items-center gap-2"
            >
              {cargando ? (
                <span className="spinner-border spinner-border-sm" role="status" />
              ) : (
                <Download size={16} />
              )}
              <span>{cargando ? "Sincronizando..." : "Probar Loading (2s)"}</span>
            </button>

            <div className="position-relative d-inline-block">
              <button
                type="button"
                disabled
                className="btn btn-light border text-muted opacity-50 d-inline-flex align-items-center gap-2"
                style={{ cursor: "not-allowed" }}
                title="No puedes eliminar productos con ventas registradas (integridad de pedidos y boletas). Desactiva la disponibilidad."
              >
                <Lock size={15} />
                <span>Eliminar (Bloqueado)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: OPCIONES DE MODALES BOOTSTRAP */}
      <div className="card admin-card p-4 mb-4">
        <div className="mb-3">
          <h4 className="brand-font fs-5 text-secondary mb-1">2. Opciones de Modales Bootstrap</h4>
          <span className="text-muted small">
            Estructurados con <code>.modal-dialog</code>, <code>.modal-content</code>, <code>.modal-header</code> y <code>.modal-body</code>.
          </span>
        </div>

        <div className="row g-3">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card admin-card h-100 p-3 bg-light">
              <span className="small text-uppercase fw-bold text-primary">Modal 1 · Form</span>
              <h5 className="fs-6 fw-bold text-secondary mt-1">Formulario Estándar</h5>
              <p className="small text-muted mb-3">Captura y validación de insumos.</p>
              <button
                type="button"
                onClick={() => setModalFormulario(true)}
                className="btn btn-sm btn-outline-primary mt-auto"
              >
                Abrir Formulario
              </button>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card admin-card h-100 p-3 border-danger-subtle bg-danger-subtle">
              <span className="small text-uppercase fw-bold text-danger">Modal 2 · Peligro</span>
              <h5 className="fs-6 fw-bold text-danger mt-1">Acción Destructiva</h5>
              <p className="small text-danger opacity-75 mb-3">Confirmación de borrado irreversible.</p>
              <button
                type="button"
                onClick={() => setModalDestructivo(true)}
                className="btn btn-sm btn-danger mt-auto"
              >
                Abrir Destructivo
              </button>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card admin-card h-100 p-3 border-warning-subtle bg-warning-subtle">
              <span className="small text-uppercase fw-bold text-warning-emphasis">Modal 3 · Alerta</span>
              <h5 className="fs-6 fw-bold text-warning-emphasis mt-1">Stock Crítico</h5>
              <p className="small text-warning-emphasis opacity-75 mb-3">Notificación de insumo agotado.</p>
              <button
                type="button"
                onClick={() => setModalAlertaStock(true)}
                className="btn btn-sm btn-warning mt-auto"
              >
                Abrir Alerta Stock
              </button>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card admin-card h-100 p-3 border-success-subtle bg-success-subtle">
              <span className="small text-uppercase fw-bold text-success">Modal 4 · POS</span>
              <h5 className="fs-6 fw-bold text-success mt-1">Cobro Exitoso</h5>
              <p className="small text-success opacity-75 mb-3">Ticket emitido y vuelto.</p>
              <button
                type="button"
                onClick={() => setModalExitoPos(true)}
                className="btn btn-sm btn-success mt-auto"
              >
                Abrir Éxito POS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: BADGES */}
      <div className="card admin-card p-4">
        <div className="mb-3">
          <h4 className="brand-font fs-5 text-secondary mb-1">3. Badges &amp; Chips de Estado</h4>
          <span className="text-muted small">Uso de <code>.badge</code> y <code>.rounded-pill</code></span>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <span className="badge bg-primary">bg-primary</span>
          <span className="badge bg-secondary">bg-secondary</span>
          <span className="badge bg-success rounded-pill">Entregado (.bg-success)</span>
          <span className="badge bg-warning text-dark rounded-pill">En Preparación (.bg-warning)</span>
          <span className="badge bg-danger rounded-pill">Stock Crítico (.bg-danger)</span>
          <span className="badge bg-info text-dark rounded-pill">Recibido (.bg-info)</span>
          <span className="badge bg-light text-secondary border">Pausado en Web</span>
        </div>
      </div>

      {/* Modales Interactivos en React */}
      {modalFormulario && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setModalFormulario(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content admin-modal-content">
              <div className="modal-header admin-modal-header">
                <h5 className="modal-title brand-font fs-5 text-secondary">Modal: Formulario de Insumo</h5>
                <button type="button" className="btn-close" onClick={() => setModalFormulario(false)} />
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-uppercase text-secondary">Nombre de Insumo</label>
                  <input type="text" defaultValue="Extracto de Vainilla Bourbon" className="form-control" />
                </div>
                <div>
                  <label className="form-label small fw-bold text-uppercase text-secondary">Existencias Actuales</label>
                  <input type="number" defaultValue={10} className="form-control" />
                </div>
              </div>
              <div className="modal-footer border-top bg-light">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setModalFormulario(false)}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={() => setModalFormulario(false)}>Guardar Cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalDestructivo && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setModalDestructivo(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content admin-modal-content">
              <div className="modal-header admin-modal-header bg-danger-subtle text-danger">
                <h5 className="modal-title fs-5 fw-bold d-flex align-items-center gap-2">
                  <AlertTriangle size={20} />
                  Confirmar Eliminación
                </h5>
                <button type="button" className="btn-close" onClick={() => setModalDestructivo(false)} />
              </div>
              <div className="modal-body p-4">
                <p className="text-secondary mb-2">¿Confirmas la eliminación permanente del registro de prueba?</p>
                <div className="alert alert-danger small mb-0">Esta acción no se puede deshacer.</div>
              </div>
              <div className="modal-footer border-top bg-light">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setModalDestructivo(false)}>Cancelar</button>
                <button type="button" className="btn btn-danger" onClick={() => setModalDestructivo(false)}>Sí, Eliminar Registro</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalAlertaStock && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setModalAlertaStock(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content admin-modal-content">
              <div className="modal-header admin-modal-header bg-warning-subtle text-warning-emphasis">
                <h5 className="modal-title fs-5 fw-bold d-flex align-items-center gap-2">
                  <AlertCircle size={20} />
                  Alerta Operativa de Pastelería
                </h5>
                <button type="button" className="btn-close" onClick={() => setModalAlertaStock(false)} />
              </div>
              <div className="modal-body p-4">
                <h6 className="fw-bold text-secondary mb-2">Stock Crítico: Crema Chantilly 35% MG</h6>
                <p className="small text-muted mb-0">Quedan solamente 3.5 Litros en bodega (mínimo de seguridad: 10 Litros). Se sugiere emitir orden de compra inmediata.</p>
              </div>
              <div className="modal-footer border-top bg-light">
                <button type="button" className="btn btn-primary" onClick={() => setModalAlertaStock(false)}>Entendido</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalExitoPos && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setModalExitoPos(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content admin-modal-content text-center">
              <div className="modal-body p-4">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success-subtle text-success mb-3" style={{ width: "64px", height: "64px" }}>
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="brand-font fs-4 text-secondary mb-1">¡Venta Completada!</h4>
                <p className="text-muted small mb-3">Ticket #CC-POS-8491 emitido con éxito</p>

                <div className="card admin-card p-3 text-start small mb-3 bg-light">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Total Venta:</span>
                    <span className="fw-bold text-secondary">$34.000</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Método de Pago:</span>
                    <span className="fw-bold text-primary">Efectivo ($40.000)</span>
                  </div>
                  <div className="d-flex justify-content-between pt-1 border-top fw-bold text-success fs-6">
                    <span>Vuelto a Entregar:</span>
                    <span>$6.000</span>
                  </div>
                </div>

                <div className="d-flex justify-content-center gap-2">
                  <button type="button" className="btn btn-outline-secondary d-inline-flex align-items-center gap-1.5" onClick={() => setModalExitoPos(false)}>
                    <Printer size={16} />
                    <span>Reimprimir Boleta</span>
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => setModalExitoPos(false)}>Nueva Venta</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
