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
            <label className="flex cursor-pointer items-center gap-3 font-body text-sm text-ink">
              <input
                type="checkbox"
                className="h-4 w-4 accent-secondary"
                checked={seleccionadas.includes(opcion.value)}
                onChange={() => onToggle(opcion.value)}
              />
              {opcion.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
