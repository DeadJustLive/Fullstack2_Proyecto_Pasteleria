// @use(kind, props, limit, deps)
// @kind(component)
// @props(currentView: View, onViewChange: (view: View) => void, role?: string, notificationCount?: number)
// @limit(lines: 60, functions: 1, params: 1)
// @deps(@external: [lucide-react])
import { Home, BarChart3, Bell, Package, Settings } from 'lucide-react';

type View = 'orders' | 'reports' | 'notifications' | 'catalog' | 'settings';

interface BottomNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
  role?: string | null;
  notificationCount?: number;
}

export function BottomNav({ currentView, onViewChange, role, notificationCount = 0 }: BottomNavProps) {
  const navItems = [
    { id: 'orders' as View, icon: Home, label: 'Pedidos' },
    { id: 'catalog' as View, icon: Package, label: 'Catálogo' },
    { id: 'reports' as View, icon: BarChart3, label: 'Reportes' },
    { id: 'notifications' as View, icon: Bell, label: 'Avisos' },
    { id: 'settings' as View, icon: Settings, label: 'Ajustes' },
  ];

  const visibleItems = navItems.filter(item => {
    if (role === 'admin') return true;
    return item.id === 'orders' || item.id === 'notifications' || item.id === 'settings';
  });

  return (
    <div className="bottom-nav-container" style={{ paddingBottom: 'max(var(--sab, 0px), 0.5rem)' }}>
      <div className="bottom-nav-inner">
        <div 
          className="bottom-nav-grid" 
          style={{ gridTemplateColumns: `repeat(${visibleItems.length}, minmax(0, 1fr))` }}
        >
          {visibleItems.map(({ id, icon: Icon, label }) => {
            const isActive = currentView === id;
            return (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={`nav-item ${isActive ? 'nav-item--active' : 'nav-item--inactive'}`}
              >
                <div className="nav-item-icon-wrapper">
                  <Icon className={`nav-item-icon ${isActive ? 'nav-item-icon--active' : ''}`} />
                  {id === 'notifications' && notificationCount > 0 && (
                    <span className="nav-badge">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  )}
                </div>
                <span className="nav-item-label">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}