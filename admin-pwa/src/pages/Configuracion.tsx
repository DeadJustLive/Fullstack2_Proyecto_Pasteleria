import { useState, type FormEvent } from "react";
import { CheckCircle, CircleHelp, ShieldCheck } from "lucide-react";

interface InfoGeneral {
  nombreTienda: string;
  emailContacto: string;
  mensajeBanner: string;
}

type ErroresInfo = Partial<Record<keyof InfoGeneral, string>>;

const INFO_INICIAL: InfoGeneral = {
  nombreTienda: "Crème & Co",
  emailContacto: "hola@cremeco.cl",
  mensajeBanner: "Descubre nuestras mejores tortas hechas en casa.",
};

const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarInfo(info: InfoGeneral): ErroresInfo {
  const errores: ErroresInfo = {};
  if (!info.nombreTienda.trim()) errores.nombreTienda = "Escribe el nombre de la tienda.";
  if (!PATRON_EMAIL.test(info.emailContacto.trim())) {
    errores.emailContacto = "Ingresa un correo válido, por ejemplo hola@cremeco.cl.";
  }
  if (info.mensajeBanner.length > 140) {
    errores.mensajeBanner = "El mensaje admite hasta 140 caracteres.";
  }
  return errores;
}

export function Configuracion() {
  const [info, setInfo] = useState<InfoGeneral>(INFO_INICIAL);
  const [errores, setErrores] = useState<ErroresInfo>({});
  const [flowHabilitado, setFlowHabilitado] = useState(true);
  const [aviso, setAviso] = useState<string | null>(null);

  function actualizarCampo(campo: keyof InfoGeneral, valor: string) {
    setInfo((previa) => ({ ...previa, [campo]: valor }));
    setErrores((previos) => ({ ...previos, [campo]: undefined }));
    setAviso(null);
  }

  function guardarInfo(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const erroresNuevos = validarInfo(info);
    setErrores(erroresNuevos);
    if (Object.keys(erroresNuevos).length > 0) return;

    // Pendiente de backend: la configuración es clave-valor y requiere el permiso settings.manage.
    setAviso("Información general guardada.");
  }

  function guardarPagos(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setAviso(flowHabilitado ? "Flow habilitado y guardado." : "Flow deshabilitado y guardado.");
  }

  return (
    <div className="container-fluid px-0">
      <div className="mb-4">
        <h2 className="brand-font fs-3 text-secondary mb-1">Configuración de la tienda</h2>
        <p className="text-muted small mb-0">
          Personaliza la identidad y los medios de pago de la pastelería.
        </p>
      </div>

      {aviso && (
        <div
          className="alert alert-success d-flex align-items-center gap-2 py-2"
          role="status"
        >
          <CheckCircle size={18} />
          <span>{aviso}</span>
        </div>
      )}

      <div className="row g-4">
        <div className="col-12 col-lg-8 d-flex flex-column gap-4">
          <form className="card admin-card" onSubmit={guardarInfo} noValidate>
            <div className="admin-card-header">Información general</div>
            <div className="card-body p-4">
              <div className="mb-3">
                <label htmlFor="nombreTienda" className="form-label fw-semibold">
                  Nombre de la tienda
                </label>
                <input
                  id="nombreTienda"
                  type="text"
                  className={`form-control ${errores.nombreTienda ? "is-invalid" : ""}`}
                  value={info.nombreTienda}
                  onChange={(e) => actualizarCampo("nombreTienda", e.target.value)}
                />
                {errores.nombreTienda && (
                  <div className="invalid-feedback">{errores.nombreTienda}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="emailContacto" className="form-label fw-semibold">
                  Correo de contacto público
                </label>
                <input
                  id="emailContacto"
                  type="email"
                  className={`form-control ${errores.emailContacto ? "is-invalid" : ""}`}
                  value={info.emailContacto}
                  onChange={(e) => actualizarCampo("emailContacto", e.target.value)}
                />
                {errores.emailContacto ? (
                  <div className="invalid-feedback">{errores.emailContacto}</div>
                ) : (
                  <div className="form-text">Los clientes verán este correo en la tienda.</div>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="mensajeBanner" className="form-label fw-semibold">
                  Mensaje del banner de inicio
                </label>
                <textarea
                  id="mensajeBanner"
                  rows={3}
                  className={`form-control ${errores.mensajeBanner ? "is-invalid" : ""}`}
                  value={info.mensajeBanner}
                  onChange={(e) => actualizarCampo("mensajeBanner", e.target.value)}
                />
                {errores.mensajeBanner ? (
                  <div className="invalid-feedback">{errores.mensajeBanner}</div>
                ) : (
                  <div className="form-text">{info.mensajeBanner.length}/140 caracteres</div>
                )}
              </div>

              <button type="submit" className="btn btn-primary">
                Guardar cambios
              </button>
            </div>
          </form>

          <form className="card admin-card" onSubmit={guardarPagos}>
            <div className="admin-card-header">Pagos con Flow</div>
            <div className="card-body p-4">
              <div className="form-check form-switch mb-3">
                <input
                  id="flowHabilitado"
                  type="checkbox"
                  role="switch"
                  className="form-check-input"
                  checked={flowHabilitado}
                  onChange={(e) => {
                    setFlowHabilitado(e.target.checked);
                    setAviso(null);
                  }}
                />
                <label htmlFor="flowHabilitado" className="form-check-label fw-semibold">
                  Habilitar pagos con Flow
                </label>
              </div>

              <div className="d-flex align-items-start gap-2 bg-light border rounded-3 p-3 mb-4 small text-secondary">
                <ShieldCheck size={18} className="flex-shrink-0 mt-1" />
                <span>
                  Las credenciales de Flow se configuran en el servidor mediante variables de
                  entorno y no se editan desde este panel. Si no están definidas, la tienda
                  usa el proveedor de pago simulado.
                </span>
              </div>

              <button type="submit" className="btn btn-primary">
                Guardar configuración de pagos
              </button>
            </div>
          </form>
        </div>

        <aside className="col-12 col-lg-4">
          <div className="card admin-card">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-2 text-secondary">
                <CircleHelp size={20} />
                <h3 className="fs-6 fw-bold mb-0">¿Necesitas ayuda?</h3>
              </div>
              <p className="small text-muted mb-0">
                Si tienes problemas para configurar Flow u otro servicio, pide apoyo al
                equipo técnico para revisar las variables de entorno del servidor.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}