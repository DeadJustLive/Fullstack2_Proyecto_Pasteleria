// @use(kind, props)
// @kind(component)
// @props({ activeView: ViewId, onNavigate: (view: ViewId) => void })
import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';

export type ViewId = 'home' | 'profile' | 'roadmap' | 'mission' | 'oracle' | 'subjects' | 'settings' | 'review';

export interface ActiveSubjectMenu {
  id: string;
  name: string;
  icon: string;
}

interface FloatingNavbarProps {
  activeView: ViewId;
  onNavigate: (view: ViewId, subjectId?: string) => void;
  onMenuToggle?: (isOpen: boolean) => void;
  activeSubjects?: ActiveSubjectMenu[];
}

interface NavItem {
  id: ViewId;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'home', icon: '🏠', label: 'Inicio' },
  { id: 'profile', icon: '👤', label: 'Perfil' },
  { id: 'mission', icon: '⚡', label: 'Misión' },
  { id: 'subjects', icon: '📚', label: 'Materias' },
  { id: 'settings', icon: '⚙️', label: 'Config' },
];

export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({ activeView, onNavigate, onMenuToggle, activeSubjects }) => {
  const { isLeftyMode } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (onMenuToggle) onMenuToggle(nextState);
  };

  const handleNavigate = (id: ViewId, subjectId?: string) => {
    onNavigate(id, subjectId);
    setIsOpen(false);
    if (onMenuToggle) onMenuToggle(false);
  };

  const horizontalPosClass = isLeftyMode ? 'left-6' : 'right-6';

  return (
    <div className={`fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] ${horizontalPosClass} z-50 flex flex-col ${isLeftyMode ? 'items-start' : 'items-end'} gap-4 pointer-events-none`}>
      {/* Menú Desplegable (Vertical) */}
      <div 
        className={`flex flex-col gap-2 transition-all duration-300 origin-bottom ${
          isOpen ? 'scale-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-brand-surface/90 backdrop-blur-xl border border-brand-border rounded-full p-2 flex flex-col gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto">
          {navItems.map((item) => {
            if (item.id === 'mission' && activeSubjects && activeSubjects.length > 0) {
              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => handleNavigate(item.id)}
                    className="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:bg-white/10"
                    title={item.label}
                  >
                    {activeView === item.id && (
                      <span className="absolute inset-0 rounded-full bg-primary-glow/20" aria-hidden />
                    )}
                    <span className={`text-xl relative z-10 ${activeView === item.id ? 'scale-110' : 'opacity-70 group-hover:opacity-100'}`}>
                      {item.icon}
                    </span>
                  </button>

                  {/* Submenú de Materias */}
                  <div className={`absolute top-0 ${isLeftyMode ? 'left-14' : 'right-14'} flex-col gap-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity hidden group-hover:flex z-50`}>
                    <div className="bg-brand-surface/95 backdrop-blur-xl border border-brand-border rounded-xl p-2 shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex flex-col gap-1 min-w-[160px]">
                      <div className="text-[10px] text-primary-dim uppercase tracking-widest font-bold px-2 py-1 mb-1 border-b border-white/5 flex items-center justify-between">
                        <span>Misiones</span>
                        <span>⚔️</span>
                      </div>
                      {activeSubjects.map(sub => (
                        <button
                          key={sub.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigate('mission', sub.id);
                          }}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-text-light hover:bg-white/10 hover:text-primary-glow rounded-lg transition-all w-full text-left"
                        >
                          <span className="text-lg">{sub.icon}</span>
                          <span className="truncate font-bold">{sub.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className="relative group flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:bg-white/10"
                title={item.label}
              >
                {activeView === item.id && (
                  <span className="absolute inset-0 rounded-full bg-primary-glow/20" aria-hidden />
                )}
                <span className={`text-xl relative z-10 ${activeView === item.id ? 'scale-110' : 'opacity-70 group-hover:opacity-100'}`}>
                  {item.icon}
                </span>
                
                {/* Tooltip Lateral */}
                <span className={`absolute ${isLeftyMode ? 'left-14' : 'right-14'} px-2 py-1 bg-brand-bg/90 border border-brand-border rounded text-xs text-text-light opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={toggleMenu}
        className={`w-14 h-14 rounded-full bg-gradient-to-br from-[#4a3219] to-[#8b5e34] border-2 border-[#e4d4ac] flex items-center justify-center text-[#f4e4bc] text-2xl shadow-[0_0_15px_rgba(139,94,52,0.5)] transition-transform duration-300 hover:scale-105 active:scale-95 pointer-events-auto ${isOpen ? 'rotate-90 scale-90' : 'rotate-0'} ${isLeftyMode ? 'ml-1' : 'mr-1'}`}
      >
        <span>{isOpen ? '✕' : '🧭'}</span>
      </button>
    </div>
  );
};
