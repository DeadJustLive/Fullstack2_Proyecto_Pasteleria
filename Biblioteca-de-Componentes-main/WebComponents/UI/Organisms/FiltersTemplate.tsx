import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { cn } from '../ui/utils';

export interface FilterState {
  bedrooms: string;
  bathrooms: string;
  type: string;
  status: 'Todos' | 'Venta' | 'Alquiler';
  sort: string;
}

interface PropertyFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const sortOptions = [
  { value: 'default', label: 'Por defecto' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'newest', label: 'Más recientes' },
  { value: 'oldest', label: 'Más antiguos' },
];

const bedroomOptions = [
  { value: 'any', label: 'Cualquiera' },
  { value: '1', label: '1 o más' },
  { value: '2', label: '2 o más' },
  { value: '3', label: '3 o más' },
  { value: '4', label: '4 o más' },
  { value: '5', label: '5 o más' },
];

const bathroomOptions = [
  { value: 'any', label: 'Cualquiera' },
  { value: '1', label: '1 o más' },
  { value: '2', label: '2 o más' },
  { value: '3', label: '3 o más' },
  { value: '4', label: '4 o más' },
];

const typeOptions = [
  { value: 'any', label: 'Cualquiera' },
  { value: 'Casa', label: 'Casa' },
  { value: 'Depto', label: 'Depto' },
  { value: 'Terreno', label: 'Terreno' },
];

const triggerClass =
  'w-full h-9 px-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl text-sm ' +
  'transition-all hover:border-brand-cyan/50 hover:shadow-sm hover:shadow-brand-cyan/5 ' +
  'focus:outline-none focus:border-brand-cyan focus:ring-4 focus:ring-brand-cyan/10 ' +
  'data-[placeholder]:text-slate-400 [&_svg]:text-slate-400';

const contentClass =
  'bg-white border border-slate-200 rounded-xl shadow-lg shadow-brand-cyan/5 p-1.5 z-50';

const itemClass =
  'relative flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-600 ' +
  'transition-all select-none outline-none ' +
  'data-[highlighted]:bg-brand-cyan/8 data-[highlighted]:text-brand-cyan data-[highlighted]:font-semibold ' +
  'data-[state=checked]:bg-brand-cyan/8 data-[state=checked]:text-brand-cyan data-[state=checked]:font-semibold ' +
  'cursor-pointer';

const labelClass = 'block text-[11px] font-semibold text-slate-500 mb-2';

export function PropertyFilters({ filters, onChange }: PropertyFiltersProps) {
  const propertyTypes = ['Cualquiera', 'Casa', 'Depto', 'Terreno'];
  const operationOptions = ['Todos', 'Comprar', 'Arrendar'] as const;

  const handleTypeToggle = (selectedType: string) => {
    if (selectedType === 'Cualquiera') {
      onChange({ ...filters, type: 'any' });
    } else {
      const newType = filters.type === selectedType ? 'any' : selectedType;
      onChange({ ...filters, type: newType });
    }
  };

  const handleStatusToggle = (option: typeof operationOptions[number]) => {
    const statusMap: Record<typeof operationOptions[number], FilterState['status']> = {
      'Todos': 'Todos',
      'Comprar': 'Venta',
      'Arrendar': 'Alquiler',
    };
    onChange({ ...filters, status: statusMap[option] });
  };

  const getActiveStatusLabel = (): typeof operationOptions[number] => {
    if (filters.status === 'Todos') return 'Todos';
    if (filters.status === 'Venta') return 'Comprar';
    return 'Arrendar';
  };

  return (
    <div className="sticky top-20 z-30 bg-white/70 backdrop-blur-2xl border-b border-slate-200/80 py-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 items-end">

          {/* Status Toggle */}
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="filter-status" className={labelClass}>Operación</label>

            {/* Desktop: animated toggle (same style as Type) */}
            <div className="hidden lg:flex relative bg-slate-100/50 p-1 rounded-xl border border-slate-200/60 overflow-hidden">
              {(() => {
                const activeIdx = operationOptions.indexOf(getActiveStatusLabel());
                const count = operationOptions.length;
                return (
                  <div className="absolute inset-1 pointer-events-none">
                    <div
                      className="absolute inset-y-0 bg-brand-cyan rounded-lg shadow-md shadow-brand-cyan/20 transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                      style={{
                        width: `${100 / count}%`,
                        left: `${(activeIdx * 100) / count}%`,
                      }}
                    />
                  </div>
                );
              })()}
              {operationOptions.map(option => {
                const isActive = getActiveStatusLabel() === option;
                return (
                  <button
                    key={option}
                    onClick={() => handleStatusToggle(option)}
                    className={cn(
                      'relative z-10 flex-1 px-1 py-2 rounded-lg text-xs font-semibold transition-colors duration-300 text-center truncate',
                      isActive ? 'text-white' : 'text-slate-500 hover:text-slate-800'
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Mobile/tablet: dropdown */}
            <div className="lg:hidden">
              <Select
                value={filters.status}
                onValueChange={(val) => onChange({ ...filters, status: val as FilterState['status'] })}
              >
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent className={contentClass} position="popper" align="start">
                  <SelectItem value="Todos" className={itemClass}>Todos</SelectItem>
                  <SelectItem value="Venta" className={itemClass}>Comprar</SelectItem>
                  <SelectItem value="Alquiler" className={itemClass}>Arrendar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Property Type */}
          <div className="lg:col-span-2">
            <label htmlFor="filter-type" className={labelClass}>Tipo</label>

            {/* Desktop: animated toggle */}
            <div className="hidden lg:flex relative bg-slate-100/50 p-1 rounded-xl border border-slate-200/60 overflow-hidden">
              {(() => {
                const activeIdx = propertyTypes.findIndex(t => t === 'Cualquiera' ? filters.type === 'any' : filters.type === t);
                const count = propertyTypes.length;
                return (
                  <div className="absolute inset-1 pointer-events-none">
                    <div
                      className="absolute inset-y-0 bg-brand-cyan rounded-lg shadow-md shadow-brand-cyan/20 transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                      style={{
                        width: `${100 / count}%`,
                        left: `${(activeIdx * 100) / count}%`,
                      }}
                    />
                  </div>
                );
              })()}
              {propertyTypes.map(type => {
                const isActive = type === 'Cualquiera' ? filters.type === 'any' : filters.type === type;
                return (
                  <button
                    key={type}
                    onClick={() => handleTypeToggle(type)}
                    className={cn(
                      'relative z-10 flex-1 px-1 py-2 rounded-lg text-xs font-semibold transition-colors duration-300 text-center truncate',
                      isActive ? 'text-white' : 'text-slate-500 hover:text-slate-800'
                    )}
                  >
                    {type}
                  </button>
                );
              })}
            </div>

            {/* Mobile/tablet: dropdown */}
            <div className="lg:hidden">
              <Select
                value={filters.type}
                onValueChange={(val) => onChange({ ...filters, type: val })}
              >
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder="Cualquiera" />
                </SelectTrigger>
                <SelectContent className={contentClass} position="popper" align="start">
                  {typeOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className={itemClass}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dormitorios */}
          <div>
            <label htmlFor="filter-bedrooms" className={labelClass}>Dormitorios</label>
            <Select
              value={filters.bedrooms}
              onValueChange={(val) => onChange({ ...filters, bedrooms: val })}
            >
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder="Cualquiera" />
              </SelectTrigger>
              <SelectContent className={contentClass} position="popper" align="start">
                {bedroomOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className={itemClass}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Baños */}
          <div>
            <label htmlFor="filter-bathrooms" className={labelClass}>Baños</label>
            <Select
              value={filters.bathrooms}
              onValueChange={(val) => onChange({ ...filters, bathrooms: val })}
            >
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder="Cualquiera" />
              </SelectTrigger>
              <SelectContent className={contentClass} position="popper" align="start">
                {bathroomOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className={itemClass}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="filter-sort" className={labelClass}>Ordenar</label>
            <Select
              value={filters.sort}
              onValueChange={(val) => onChange({ ...filters, sort: val })}
            >
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder="Por defecto" />
              </SelectTrigger>
              <SelectContent className={contentClass} position="popper" align="start">
                {sortOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className={itemClass}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </div>
      </div>
    </div>
  );
}
