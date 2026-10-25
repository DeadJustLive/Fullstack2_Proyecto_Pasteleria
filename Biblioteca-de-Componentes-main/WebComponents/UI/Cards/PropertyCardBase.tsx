// @use(kind, props, limit)
// @kind(component)
// @props({ children: ReactNode, isGhost?: boolean, isSelected?: boolean })
// @limit(lines: 50, functions: 1)
import { ReactNode } from 'react';
import { cn } from './utils';

interface PropertyCardBaseProps {
    children: ReactNode;
    isGhost?: boolean;
    isSelected?: boolean;
    className?: string;
}

export function PropertyCardBase({ children, isGhost, isSelected, className }: PropertyCardBaseProps) {
    return (
        <div
            className={cn(
                "group bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden transition-all duration-300 relative border flex flex-col h-full",
                isGhost
                    ? "border-slate-200 opacity-75 cursor-pointer hover:opacity-90"
                    : isSelected
                        ? "border-brand-cyan ring-4 ring-brand-cyan/20"
                        : "border-slate-100 hover:shadow-[0_20px_40px_rgba(14,162,204,0.15)] hover:-translate-y-2 cursor-pointer",
                className
            )}
        >
            {/* Ghost overlay layer managed purely by structural overlay, no hard absolute px values per layout rules */}
            {isGhost && (
                <div className="absolute inset-0 z-10 bg-slate-900/10 rounded-[2rem] pointer-events-none" />
            )}

            {children}
        </div>
    );
}
