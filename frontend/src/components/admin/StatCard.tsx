// Tarjeta de metrica (KPI) del Dashboard: icono con color de acento + valor.
import type { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { Card } from "@/components/ui/Card";

const iconoVariants = cva(
  "flex h-12 w-12 items-center justify-center rounded-full text-tertiary ring-8",
  {
    variants: {
      tono: {
        rosa: "bg-[#f7b2c0] ring-[#fff0f2]",
        naranja: "bg-[#fc9b65] ring-[#ffecd9]",
        cafe: "bg-[#dcbca3] ring-[#f6efe9]",
      },
    },
    defaultVariants: {
      tono: "rosa",
    },
  }
);

interface StatCardProps extends VariantProps<typeof iconoVariants> {
  titulo: string;
  valor: string;
  nota?: string;
  icono: LucideIcon;
}

export function StatCard({ titulo, valor, nota, icono: Icono, tono }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="p-2">
        <div className={iconoVariants({ tono })}>
          <Icono size={22} aria-hidden="true" />
        </div>
      </div>
      <h3 className="font-body text-sm font-semibold uppercase tracking-wide text-tertiary/80">
        {titulo}
      </h3>
      <p className="font-display text-3xl font-bold text-tertiary">{valor}</p>
      {nota && <p className="font-body text-sm font-semibold text-secondary">{nota}</p>}
    </Card>
  );
}
