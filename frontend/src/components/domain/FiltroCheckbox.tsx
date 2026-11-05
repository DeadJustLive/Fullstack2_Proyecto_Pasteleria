// Grupo de checkboxes para los filtros del catalogo.
interface Opcion {
  value: string;
  label: string;
}

interface FiltroCheckboxProps {
  titulo: string;
  opciones: Opcion[];
  seleccionadas: string[];
  onToggle: (value: string) => void;
}

export function FiltroCheckbox({
  titulo,
  opciones,
  seleccionadas,
  onToggle,
}: FiltroCheckboxProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-display text-base font-semibold text-tertiary">{titulo}</h3>
      <ul className="flex flex-col gap-3">
        {opciones.map((opcion) => (
          <li key={opcion.value}>
            <label className="group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 font-body text-sm text-ink transition-colors hover:bg-primary/40">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-tertiary/30 accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40"
                checked={seleccionadas.includes(opcion.value)}
                onChange={() => onToggle(opcion.value)}
              />
              <span className="transition-colors group-hover:text-tertiary">{opcion.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
