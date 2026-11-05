import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FlowStatusBadge } from "@/features/FlowPayment/components/FlowStatusBadge";
import { FlowPaymentView } from "@/features/FlowPayment/implementation/FlowPayment.view";

import { CheckoutSecurityBadge } from "@/features/CheckoutSummary/components/CheckoutSecurityBadge";
import { CheckoutSummaryView } from "@/features/CheckoutSummary/implementation/CheckoutSummary.view";

import { CakePortionBadge } from "@/features/CustomCakeQuote/components/CakePortionBadge";
import { CustomCakeQuoteView } from "@/features/CustomCakeQuote/implementation/CustomCakeQuote.view";

import { CustomerTrackingView } from "@/features/CustomerTracking/implementation/CustomerTracking.view";
import { CatalogDiscoveryView } from "@/features/CatalogDiscovery/implementation/CatalogDiscovery.view";

describe("Domain Features — Módulos Críticos de Negocio", () => {
  describe("FlowPayment Feature", () => {
    it("FlowStatusBadge muestra el estado correcto según verificación", () => {
      const { rerender } = render(<FlowStatusBadge state="verifying" />);
      expect(screen.getByText(/Verificando firma Flow.cl/i)).toBeInTheDocument();

      rerender(<FlowStatusBadge state="verified" flowOrder="12345" />);
      expect(screen.getByText(/PAGADO EN FLOW.CL \(#12345\)/i)).toBeInTheDocument();

      rerender(<FlowStatusBadge state="simulated" flowOrder="SIM-99" />);
      expect(screen.getByText(/Webpay Plus • #SIM-99/i)).toBeInTheDocument();
    });

    it("FlowPaymentView renderiza el resumen de pago y monto formateado", () => {
      render(
        <FlowPaymentView
          orderId="105"
          amount={45000}
          initialFlowOrder="FLOW-105"
        />
      );
      expect(screen.getByText(/FLOW-105/i)).toBeInTheDocument();
      expect(screen.getByText(/\$45\.000/i)).toBeInTheDocument();
    });
  });

  describe("CheckoutSummary Feature", () => {
    it("CheckoutSecurityBadge muestra el protocolo de seguridad según la pasarela", () => {
      const { rerender } = render(<CheckoutSecurityBadge paymentMethod="flow" />);
      expect(screen.getByText(/Flow.cl HMAC-SHA256/i)).toBeInTheDocument();

      rerender(<CheckoutSecurityBadge paymentMethod="transferencia" />);
      expect(screen.getByText(/Banca Electrónica/i)).toBeInTheDocument();

      rerender(<CheckoutSecurityBadge paymentMethod="mercadolibre" />);
      expect(screen.getByText(/Mercado Pago TLS/i)).toBeInTheDocument();
    });

    it("CheckoutSummaryView muestra cantidad de ítems y total", () => {
      render(
        <CheckoutSummaryView
          totalAmount={32000}
          itemCount={3}
          deliveryMethod="despacho"
          paymentMethod="flow"
        />
      );
      expect(screen.getByText(/Respaldo de Orden \(3 ítems\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Despacho Refrigerado/i)).toBeInTheDocument();
      expect(screen.getByText(/\$32\.000/i)).toBeInTheDocument();
    });
  });

  describe("CustomCakeQuote Feature", () => {
    it("CakePortionBadge clasifica porciones en clásica o pisos", () => {
      const { rerender } = render(<CakePortionBadge portions={10} />);
      expect(screen.getByText(/1 Piso Clásico/i)).toBeInTheDocument();

      rerender(<CakePortionBadge portions={30} />);
      expect(screen.getByText(/2 Pisos Artesanales/i)).toBeInTheDocument();
    });

    it("CustomCakeQuoteView calcula el valor estimado por persona", () => {
      render(
        <CustomCakeQuoteView
          portions={20}
          selectedFlavorsCount={3}
          estimatedAmount={60000}
        />
      );
      expect(screen.getByText(/Ficha Técnica \(3 sabores\)/i)).toBeInTheDocument();
      // 60.000 / 20 = $3.000 / pers.
      expect(screen.getByText(/\$3\.000 \/ pers\./i)).toBeInTheDocument();
    });
  });

  describe("CustomerTracking Feature", () => {
    it("CustomerTrackingView muestra tracking code y banner SLA de frío", () => {
      render(
        <CustomerTrackingView
          trackingCode="#CC-2026-99"
          orderStatus="EN_PREPARACION"
          deliveryType="DELIVERY"
        />
      );
      expect(screen.getByText(/#CC-2026-99/i)).toBeInTheDocument();
      expect(screen.getByText(/Transporte con Cadena de Frío Activa/i)).toBeInTheDocument();
    });
  });

  describe("CatalogDiscovery Feature", () => {
    it("CatalogDiscoveryView muestra total de productos y activa píldora de filtro con callback de limpieza", async () => {
      const handleClear = vi.fn();
      const user = userEvent.setup();

      render(
        <CatalogDiscoveryView
          totalProducts={12}
          activeCategory="tortas"
          searchQuery="chocolate"
          onClearFilters={handleClear}
        />
      );

      expect(screen.getByText(/Mostrando/i)).toBeInTheDocument();
      expect(screen.getByText("12")).toBeInTheDocument();
      expect(screen.getByText(/Categoría: tortas • Búsqueda: "chocolate"/i)).toBeInTheDocument();

      const btnLimpiar = screen.getByRole("button", { name: /Limpiar filtros/i });
      await user.click(btnLimpiar);
      expect(handleClear).toHaveBeenCalledTimes(1);
    });
  });
});
