// @use(kind, props, limit, learn-error)
// @kind(feature)
// @learn-error id=MODAL-001 input='modal sin role dialog ni aria-modal' expected=1 actual=0 fix='Agregar role dialog aria-modal focus trap y scroll lock a ActionModalBase'
// @learn-error id=MODAL-002 input='scroll lock manual duplicado' expected=1 actual=2 fix='Centralizar en ActionModalBase y eliminar useEffects duplicados en ServicesSection y PropertyView'
// @props({ isOpen: boolean, onClose: () => void, title?: string, subtitle?: ReactNode, children: ReactNode, footer?: ReactNode, maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '7xl', showCloseButton?: boolean })
// @limit(lines: 160, functions: 1)
import { m } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from './utils';
import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ActionModalBaseProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '7xl';
    showCloseButton?: boolean;
}

const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '7xl': 'max-w-7xl',
};

export function ActionModalBase({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
    maxWidth = 'md',
    showCloseButton = true,
}: ActionModalBaseProps) {
    const [mounted, setMounted] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement as HTMLElement;
            document.body.style.overflow = 'hidden';
            modalRef.current?.focus();
        } else {
            document.body.style.overflow = '';
            if (previousFocusRef.current) {
                previousFocusRef.current.focus();
                previousFocusRef.current = null;
            }
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    if (!isOpen) return null;

    const content = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6" role="presentation">
            {/* Backdrop */}
            <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                aria-hidden="true"
            />

            {/* Modal Content */}
            <m.div
                ref={modalRef}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={cn(
                    "relative w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col z-10 border border-slate-100 max-h-[90vh]",
                    maxWidthClasses[maxWidth]
                )}
                role="dialog"
                aria-modal="true"
                aria-label={title || 'Modal'}
                tabIndex={-1}
                onKeyDown={handleKeyDown}
            >
                {/* Header (if title or explicit close button exist) */}
                {(title || showCloseButton) && (
                    <div className={cn("flex items-center justify-between shrink-0", title ? "bg-slate-900 px-6 lg:px-10 py-6" : "absolute right-2 top-2 z-20")}>
                        {title && (
                            <div id="action-modal-title">
                                <h2 className="text-2xl lg:text-3xl font-extrabold text-white">
                                    {title}
                                </h2>
                                {subtitle && (
                                    <div className="font-medium text-sm mt-1 uppercase tracking-wider text-brand-cyan">
                                        {subtitle}
                                    </div>
                                )}
                            </div>
                        )}

                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                aria-label="Cerrar modal"
                                className={cn(
                                    "p-3 rounded-full transition-all duration-300",
                                    title
                                        ? "bg-white/10 text-white hover:bg-brand-cyan hover:rotate-90"
                                        : "bg-black/5 text-slate-500 hover:bg-black/10 hover:text-slate-800"
                                )}
                            >
                                <X className="size-6" />
                            </button>
                        )}
                    </div>
                )}

                {/* Body Content */}
                <div className="overflow-y-auto flex-1 min-h-0 p-6 lg:p-10 bg-slate-50">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="bg-white px-6 lg:px-10 py-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4 shrink-0">
                        {footer}
                    </div>
                )}
            </m.div>
        </div>
    );

    return mounted ? createPortal(content, document.body) : null;
}