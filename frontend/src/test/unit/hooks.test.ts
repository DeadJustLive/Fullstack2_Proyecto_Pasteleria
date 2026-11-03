import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useCarousel } from "@/hooks/useCarousel";

describe("hooks — Custom Hooks de Comportamiento e Interfaz", () => {
  describe("useMediaQuery", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("debe retornar true si el media query coincide", () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === "(min-width: 768px)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
      expect(result.current).toBe(true);

      const { result: mobileResult } = renderHook(() => useMediaQuery("(max-width: 640px)"));
      expect(mobileResult.current).toBe(false);
    });
  });

  describe("useCarousel", () => {
    it("debe inicializar en el índice 0 y proveer funciones de control", () => {
      const { result } = renderHook(() => useCarousel(5));

      expect(result.current.indice).toBe(0);
      expect(result.current.trackRef).toBeDefined();
      expect(typeof result.current.irA).toBe("function");
      expect(typeof result.current.desplazar).toBe("function");
    });
  });
});
