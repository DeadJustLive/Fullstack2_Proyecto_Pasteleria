import { Card } from "@/components/ui/Card";

interface PlaceholderProps {
  title: string;
  description?: string;
  owner?: string;
}

export function Placeholder({ title, description = "Página en construcción.", owner }: PlaceholderProps) {
  return (
    <Card padding="lg" className="text-center">
      <h1>{title}</h1>
      <p className="mt-2 font-body text-ink/70">{description}</p>
      {owner && (
        <p className="mt-4 font-body text-sm font-semibold text-secondary">Responsable: {owner}</p>
      )}
    </Card>
  );
}
