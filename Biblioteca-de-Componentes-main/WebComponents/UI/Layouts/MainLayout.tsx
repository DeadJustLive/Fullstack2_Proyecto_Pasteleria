// @use(kind, limit, contract, scope, goodPractice)
// @kind(layout)
// @limit(lines: 150)
// @contract(in: React Router Outlet + NavLink -> out: Responsive layout UI)
// @scope(shared)
// @goodPractice("Floating navbar adapts to mobile (bottom) and desktop (top) for optimal UX.")
// @goodPractice("Uses env(safe-area-inset-bottom) for proper display on iOS notched devices.")
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, ImagePlus, Quote, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { useEffect } from 'react';
import { OfflineBanner } from '../components/ui/offline-banner';
import { PushNotificationBanner } from '../components/ui/push-notification-banner';
import { SplashScreen } from '../components/ui/splash-screen';
import { SubscriptionExpired } from '../features/settings/components/SubscriptionExpired';
import { useUserProfileStatus } from '../hooks/useUserProfileStatus';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/publicaciones', icon: ImagePlus, label: 'Publicaciones' },
  { to: '/conversaciones', icon: MessageSquare, label: 'Inbox' },
  { to: '/testimonios', icon: Quote, label: 'Testimonios' },
  { to: '/configuracion', icon: Settings, label: 'Ajustes' },
];

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/publicaciones': 'Publicaciones',
  '/conversaciones': 'Centro de Conversaciones',
  '/testimonios': 'Testimonios',
  '/configuracion': 'Configuración',
};

export function MainLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? 'Gestión Interna';
  const { isBlocked, loading: profileLoading } = useUserProfileStatus();
  const { user } = useAuth();

  if (profileLoading) {
    return <SplashScreen isLoading status="Verificando cuenta..." />;
  }

  if (isBlocked) {
    return <SubscriptionExpired />;
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <PushNotificationBanner />
      <OfflineBanner />
      {/* Floating Navbar (Bottom on Mobile, Top on Desktop) */}
      <div className="floating-navbar fixed bottom-4 sm:bottom-auto sm:top-3 left-1/2 -translate-x-1/2 z-[100] w-auto max-w-[95dvw] transition-all duration-300 pb-[env(safe-area-inset-bottom,0px)] sm:pb-0">
        <nav className="bg-card rounded-full sm:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border flex items-center justify-center gap-1 p-2 sm:p-1.5 sm:px-2 w-max max-w-[calc(100dvw-2rem)] overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 sm:gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={(navData) =>
                  cn(
                    'flex items-center gap-2.5 p-3 px-4 sm:px-3 sm:py-2 rounded-full sm:rounded-xl text-[15px] sm:text-sm font-medium transition-all duration-150 whitespace-nowrap',
                    navData.isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="size-5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="hidden sm:block">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="pt-6 sm:pt-20 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] sm:pb-8 min-h-[100dvh]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          </div>
          <Outlet />
        </div>
      </div>

      {/* Legal Footer */}
      <footer className="border-t py-4 px-4 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Inmobiliaria Tía Lesly SpA · RUT 76.543.210-5 · Todos los derechos reservados</p>
      </footer>
    </div>
  );
}
