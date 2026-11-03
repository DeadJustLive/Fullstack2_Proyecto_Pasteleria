// @pca:start
// @id(frontend.test.setup)
// @kind(test)
// @limit(lines: 50)
// @desc(Setup global para suite de pruebas Vitest y Testing Library)
// @pca:end
import "@testing-library/jest-dom";

// Polyfill global para matchMedia en jsdom
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
