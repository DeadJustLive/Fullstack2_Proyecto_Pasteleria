import {
  Sparkles,
  formatPrecio,
  type CustomCakeQuoteContract,
  type ICustomCakeQuoteProps,
} from "../dependencies/dependencies";
import { CakePortionBadge } from "../components/CakePortionBadge";

export function CustomCakeQuoteView(props: CustomCakeQuoteContract) {
  const {
    portions,
    selectedFlavorsCount,
    estimatedAmount,
  }: ICustomCakeQuoteProps = props;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-secondary/20 bg-primary/15 p-3 text-xs text-ink/80">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-semibold text-tertiary">
          <Sparkles size={14} className="shrink-0 text-secondary" />
          Ficha Técnica ({selectedFlavorsCount} {selectedFlavorsCount === 1 ? "sabor" : "sabores"})
        </span>
        <CakePortionBadge portions={portions} />
      </div>
      <div className="flex items-center justify-between border-t border-tertiary/10 pt-1.5 text-[11px] text-ink/70">
        <span>Valor por porción ref.</span>
        <span className="font-bold text-secondary">
          {formatPrecio(Math.round(estimatedAmount / Math.max(1, portions)))} / pers.
        </span>
      </div>
    </div>
  );
}
