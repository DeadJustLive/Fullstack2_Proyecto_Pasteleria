// @pca:start
// @id(frontend.pages.cliente.pago.flowGateway)
// @kind(page)
// @limit(lines: 390)
// @contract(FlowGatewayView())
// @relates(frontend.pages.cliente.checkout)
// @relates(frontend.pages.cliente.pago.exito)
// @relates(frontend.pages.cliente.pago.error)
// @desc(Pasarela interactiva de pruebas Flow Sandbox con escenarios de exito y rechazo DSY1104)
// @pca:end
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CreditCard,
  Building2,
  Smartphone,
  Store,
  ShieldCheck,
  Lock,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatPrecio } from "@/lib/utils";

type MetodoFlow = "webpay" | "bancos" | "billeteras" | "efectivo";

export function FlowGateway() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || `flow_tok_${Date.now().toString(36)}`;
  const orderId = searchParams.get("orderId") || `CC-${Math.floor(1000 + Math.random() * 9000)}`;
  const amount = Number(searchParams.get("amount")) || 53400;
  const email = searchParams.get("email") || "cliente@example.cl";

  const [metodoSeleccionado, setMetodoSeleccionado] = useState<MetodoFlow>("webpay");
  const [procesando, setProcesando] = useState(false);

  // Datos simulados de tarjeta de pruebas oficial de Flow Chile
  const [tarjeta, setTarjeta] = useState({
    numero: "4051 8856 0044 6623",
    titular: "JUAN PÉREZ GONZÁLEZ",
    rut: "11.111.111-1",
    expiracion: "12/28",
    cvv: "123",
  });

  const irAExito = () => {
    setProcesando(true);
    setTimeout(() => {
      setProcesando(false);
      navigate(
        `/pago/exito?orderId=${encodeURIComponent(orderId)}&token=${encodeURIComponent(token)}&total=${amount}`
      );
    }, 900);
  };

  const irAErrorFondos = () => {
    setProcesando(true);
    setTimeout(() => {
      setProcesando(false);
      navigate(
        `/pago/error?reason=insufficient_funds&orderId=${encodeURIComponent(orderId)}&total=${amount}`
      );
    }, 900);
  };

  const irAErrorBancario = () => {
    setProcesando(true);
    setTimeout(() => {
      setProcesando(false);
      navigate(
        `/pago/error?reason=bank_rejected&orderId=${encodeURIComponent(orderId)}&total=${amount}`
      );
    }, 900);
  };

  const handleCancelar = () => {
    navigate("/checkout");
  };

  const handleRellenarTestFlow = () => {
    setTarjeta({
      numero: "4051 8856 0044 6623",
      titular: "CAMILA SILVA TAPIA",
      rut: "18.432.198-7",
      expiracion: "12/28",
      cvv: "123",
    });
  };

  return (
    <div className="mx-auto max-w-3xl py-8">
      {/* Header oficial Pasarela Flow */}
      <div className="mb-6 rounded-2xl bg-[#0088cc] p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-black tracking-tight text-white">flow</span>
                <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Sandbox Chile DSY1104
                </span>
              </div>
              <p className="text-xs text-white/90">Pasarela de Pago Segura • Webpay Plus Transbank</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/90">
            <Lock size={14} />
            <span>Encriptación SSL 256-bit</span>
          </div>
        </div>

        {/* Resumen del cobro del comercio */}
        <div className="mt-5 grid gap-3 rounded-xl bg-white/10 p-4 text-xs backdrop-blur-sm sm:grid-cols-3">
          <div>
            <span className="block text-white/70">Comercio</span>
            <strong className="text-sm font-semibold text-white">Crème & Co Pastelería</strong>
          </div>
          <div>
            <span className="block text-white/70">Nº de Orden</span>
            <strong className="font-mono text-xs text-white">{orderId}</strong>
          </div>
          <div className="sm:text-right">
            <span className="block text-white/70">Monto Total a Pagar</span>
            <strong className="text-base font-bold text-white">{formatPrecio(amount)}</strong>
          </div>
        </div>
      </div>

      {/* Selector de Escenarios de Prueba DSY1104 */}
      <div className="mb-6 rounded-xl border border-dashed border-[#0088cc] bg-[#0088cc]/5 p-4">
        <div className="flex items-center justify-between gap-2 border-b border-[#0088cc]/15 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0088cc]">
            ⚡ Botones de simulación interactiva Flow Sandbox (DSY1104):
          </span>
          <span className="text-[11px] text-ink/60">Demostración en vivo</span>
        </div>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
          <button
            type="button"
            disabled={procesando}
            onClick={irAExito}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle2 size={16} />
            🟢 Aprobada (Webpay)
          </button>
          <button
            type="button"
            disabled={procesando}
            onClick={irAErrorFondos}
            className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-red-700 disabled:opacity-50"
          >
            <XCircle size={16} />
            🔴 Saldo Insuficiente
          </button>
          <button
            type="button"
            disabled={procesando}
            onClick={irAErrorBancario}
            className="flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-amber-700 disabled:opacity-50"
          >
            <AlertTriangle size={16} />
            🟡 Error Bancario
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        {/* Contenido Principal de Pago */}
        <div className="space-y-6">
          {/* Pestañas de Métodos de Pago Flow */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => setMetodoSeleccionado("webpay")}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                metodoSeleccionado === "webpay"
                  ? "border-[#0088cc] bg-[#0088cc]/10 font-bold text-[#0088cc] ring-2 ring-[#0088cc]"
                  : "border-tertiary/20 bg-white text-ink/70 hover:bg-neutral/40"
              }`}
            >
              <CreditCard size={20} />
              <span className="text-xs">Webpay Plus</span>
            </button>

            <button
              type="button"
              onClick={() => setMetodoSeleccionado("bancos")}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                metodoSeleccionado === "bancos"
                  ? "border-[#0088cc] bg-[#0088cc]/10 font-bold text-[#0088cc] ring-2 ring-[#0088cc]"
                  : "border-tertiary/20 bg-white text-ink/70 hover:bg-neutral/40"
              }`}
            >
              <Building2 size={20} />
              <span className="text-xs">Bancos</span>
            </button>

            <button
              type="button"
              onClick={() => setMetodoSeleccionado("billeteras")}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                metodoSeleccionado === "billeteras"
                  ? "border-[#0088cc] bg-[#0088cc]/10 font-bold text-[#0088cc] ring-2 ring-[#0088cc]"
                  : "border-tertiary/20 bg-white text-ink/70 hover:bg-neutral/40"
              }`}
            >
              <Smartphone size={20} />
              <span className="text-xs">Billeteras</span>
            </button>

            <button
              type="button"
              onClick={() => setMetodoSeleccionado("efectivo")}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                metodoSeleccionado === "efectivo"
                  ? "border-[#0088cc] bg-[#0088cc]/10 font-bold text-[#0088cc] ring-2 ring-[#0088cc]"
                  : "border-tertiary/20 bg-white text-ink/70 hover:bg-neutral/40"
              }`}
            >
              <Store size={20} />
              <span className="text-xs">Servipag</span>
            </button>
          </div>

          {/* Formulario según método */}
          {metodoSeleccionado === "webpay" && (
            <Card className="space-y-4 p-5">
              <div className="flex items-center justify-between border-b border-tertiary/10 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-[#0088cc]" size={20} />
                  <h3 className="font-display text-base font-bold text-tertiary">
                    Webpay Plus (Débito / Crédito)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleRellenarTestFlow}
                  className="inline-flex items-center gap-1 rounded-full bg-[#0088cc]/10 px-2.5 py-1 text-[11px] font-bold text-[#0088cc] hover:bg-[#0088cc]/20"
                >
                  <Sparkles size={12} />
                  Rellenar tarjeta
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ink">Número de Tarjeta</label>
                  <input
                    type="text"
                    value={tarjeta.numero}
                    onChange={(e) => setTarjeta({ ...tarjeta, numero: e.target.value })}
                    className="w-full rounded-lg border border-tertiary/20 bg-neutral/20 p-2.5 font-mono text-sm tracking-widest text-ink focus:border-[#0088cc] focus:outline-none"
                    placeholder="4051 8856 0044 6623"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-ink">Titular</label>
                    <input
                      type="text"
                      value={tarjeta.titular}
                      onChange={(e) => setTarjeta({ ...tarjeta, titular: e.target.value })}
                      className="w-full rounded-lg border border-tertiary/20 bg-neutral/20 p-2.5 text-sm text-ink focus:border-[#0088cc] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-ink">RUT Titular</label>
                    <input
                      type="text"
                      value={tarjeta.rut}
                      onChange={(e) => setTarjeta({ ...tarjeta, rut: e.target.value })}
                      className="w-full rounded-lg border border-tertiary/20 bg-neutral/20 p-2.5 font-mono text-sm text-ink focus:border-[#0088cc] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-ink">Vencimiento (MM/AA)</label>
                    <input
                      type="text"
                      value={tarjeta.expiracion}
                      onChange={(e) => setTarjeta({ ...tarjeta, expiracion: e.target.value })}
                      className="w-full rounded-lg border border-tertiary/20 bg-neutral/20 p-2.5 font-mono text-sm text-ink focus:border-[#0088cc] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-ink">CVV / CVC</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={tarjeta.cvv}
                      onChange={(e) => setTarjeta({ ...tarjeta, cvv: e.target.value })}
                      className="w-full rounded-lg border border-tertiary/20 bg-neutral/20 p-2.5 font-mono text-sm text-ink focus:border-[#0088cc] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {metodoSeleccionado === "bancos" && (
            <Card className="space-y-4 p-5">
              <h3 className="font-display text-base font-bold text-tertiary">Transferencia Bancaria</h3>
              <p className="text-xs text-ink/70">Selecciona tu banco para conectarte:</p>
              <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                {["Banco de Chile", "Banco Santander", "BancoEstado", "BCI", "Scotiabank", "Itaú"].map((banco) => (
                  <button
                    key={banco}
                    type="button"
                    onClick={irAExito}
                    className="rounded-lg border border-tertiary/20 p-3 text-center font-medium hover:border-[#0088cc] hover:bg-[#0088cc]/5"
                  >
                    {banco}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {metodoSeleccionado === "billeteras" && (
            <Card className="space-y-4 p-5">
              <h3 className="font-display text-base font-bold text-tertiary">Billeteras Digitales</h3>
              <p className="text-xs text-ink/70">Paga escaneando con tu aplicación preferida:</p>
              <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                {["Mach", "OnePay (Transbank)", "Check", "Mercado Pago", "Tenpo"].map((app) => (
                  <button
                    key={app}
                    type="button"
                    onClick={irAExito}
                    className="rounded-lg border border-tertiary/20 p-3 text-center font-medium hover:border-[#0088cc] hover:bg-[#0088cc]/5"
                  >
                    {app}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {metodoSeleccionado === "efectivo" && (
            <Card className="space-y-4 p-5">
              <h3 className="font-display text-base font-bold text-tertiary">Pago Presencial</h3>
              <p className="text-xs text-ink/70">Genera cupón de pago para sucursales:</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {["Servipag", "Caja Vecina", "Sencillito"].map((caja) => (
                  <button
                    key={caja}
                    type="button"
                    onClick={irAExito}
                    className="rounded-lg border border-tertiary/20 p-3 text-center font-medium hover:border-[#0088cc] hover:bg-[#0088cc]/5"
                  >
                    {caja}
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Resumen lateral de Transacción */}
        <div className="space-y-4">
          <Card className="space-y-4 p-5">
            <h4 className="border-b border-tertiary/10 pb-2 font-display text-sm font-bold text-tertiary">
              Detalle del Pago
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-ink/70">Subtotal:</span>
                <span className="font-medium text-ink">{formatPrecio(amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/70">Comisión Pasarela:</span>
                <span className="font-medium text-green-600">$0 (Gratis)</span>
              </div>
              <div className="flex justify-between border-t border-tertiary/10 pt-2 text-sm font-bold">
                <span className="text-tertiary">Total CLP:</span>
                <span className="text-secondary">{formatPrecio(amount)}</span>
              </div>
            </div>

            <div className="rounded-lg bg-neutral/40 p-3 text-[11px] text-ink/80">
              <span className="block font-semibold">Correo de confirmación:</span>
              <span className="truncate">{email}</span>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                type="button"
                onClick={irAExito}
                disabled={procesando}
                className="w-full bg-[#0088cc] text-white hover:bg-[#0077b5]"
              >
                {procesando ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Procesando en Flow...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} />
                    Pagar {formatPrecio(amount)} (Aprobada)
                  </span>
                )}
              </Button>

              <button
                type="button"
                onClick={handleCancelar}
                disabled={procesando}
                className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold text-ink/60 hover:text-ink"
              >
                <ArrowLeft size={14} />
                Cancelar y regresar
              </button>
            </div>
          </Card>

          <div className="rounded-xl border border-tertiary/15 bg-neutral/20 p-3 text-center text-[11px] text-ink/70">
            🔒 Transacción protegida por el protocolo de seguridad de Flow.cl y Webpay Transbank.
          </div>
        </div>
      </div>
    </div>
  );
}
