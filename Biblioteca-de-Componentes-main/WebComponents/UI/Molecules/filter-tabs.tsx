import * as React from "react"
import { cn } from "../../lib/utils"

export interface FilterTabsProps {
    options: ({ value: string; label?: React.ReactNode; count?: number } | string)[]
    value: string
    onChange: (value: string) => void
    className?: string
}

export function FilterTabs({ options, value, onChange, className }: FilterTabsProps) {
    return (
        <div className={cn("w-full sm:w-auto overflow-x-auto no-scrollbar", className)}>
            <div className="flex w-max gap-1 bg-muted rounded-lg p-1">
                {options.map((opt, i) => {
                    const isObj = typeof opt === 'object';
                    const optValue = isObj ? opt.value : opt;
                    const optLabel = isObj ? (opt.label || optValue) : optValue;
                    const count = isObj ? opt.count : undefined;

                    return (
                        <button type="button"
                            key={optValue}
                            onClick={() => onChange(optValue)}
                            className={cn(
                                "shrink-0 px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all",
                                value === optValue
                                    ? "bg-card shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {optLabel === 'todos' ? 'Todos' : optLabel}
                            {(count !== undefined && count > 0) && (
                                <span className="ml-1.5 bg-amber-500 text-white rounded-full px-1 py-0.5 text-[10px] leading-none">
                                    {count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
