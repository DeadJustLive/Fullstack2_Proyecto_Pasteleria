import { useState, useEffect } from 'react';
import { instagramApi } from '../lib/api/instagram';
import { useAuth } from '../contexts/AuthContext';
import type { InstagramConnection } from '../features/instagram/types';
import { isCapacitor, isTauri, isNative } from '../lib/platform';

import { InstagramConnectionCard } from '../features/settings/components/InstagramConnectionCard';
import { PasswordManager } from '../features/settings/components/PasswordManager';
import { SessionManager } from '../features/settings/components/SessionManager';
import { AIAssistantSettings } from '../features/settings/components/AIAssistantSettings';
import { DeveloperPanel } from '../features/settings/components/DeveloperPanel';
import { useDeveloperStatus } from '../hooks/useDeveloperStatus';

export function ConfiguracionPage() {
  const { isLoading: authLoading, logout, user } = useAuth();
  const [connection, setConnection] = useState<InstagramConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [validationResult, setValidationResult] = useState<{ success: boolean; message: string; profile?: any } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isDeveloper } = useDeveloperStatus();
  const [activeTab, setActiveTab] = useState<'general' | 'advanced'>('general');
  const loadConnection = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const conn = await instagramApi.getLinkedAccount();
      setConnection(conn);
    } catch (err: any) {
      console.error('Error loading connection:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConnection();

    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const urlError = params.get('error');
    const provider = params.get('provider');

    if (provider === 'instagram') {
      if (success) {
        window.history.replaceState({}, document.title, window.location.pathname);
        loadConnection();
      } else if (urlError) {
        setError(decodeURIComponent(urlError));
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    if (!isNative()) return;

    let capacitorPromise: Promise<any> | null = null;
    let tauriPromise: Promise<any> | null = null;

    async function setupDeepLink() {
      if (isCapacitor()) {
        const { App } = await import('@capacitor/app');
        capacitorPromise = App.addListener('appUrlOpen', (data) => {
          const url = new URL(data.url);
          const success = url.searchParams.get('success');
          const urlError = url.searchParams.get('error');
          if (url.pathname.includes('configuracion') || url.host.includes('configuracion')) {
            if (success === 'true') {
              loadConnection();
              window.history.replaceState({}, document.title, window.location.pathname);
            } else if (urlError) {
              setError(decodeURIComponent(urlError));
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }
        });
      } else if (isTauri()) {
        const tauriPlugin = await import('@tauri-apps/plugin-deep-link');
        // @ts-ignore
        tauriPromise = tauriPlugin.onDeepLink((payload: string[] | string) => {
          const urlStr = Array.isArray(payload) ? payload[0] : payload;
          const url = new URL(urlStr);
          const success = url.searchParams.get('success');
          const urlError = url.searchParams.get('error');
          if (url.pathname.includes('configuracion') || url.host.includes('configuracion')) {
            if (success === 'true') {
              loadConnection();
            } else if (urlError) {
              setError(decodeURIComponent(urlError));
            }
          }
        });
      }
    }

    setupDeepLink().catch((err) => {
      console.error('Error setting up deep link:', err);
    });

    return () => {
      if (capacitorPromise) capacitorPromise.then(h => h && h.remove && h.remove());
      if (tauriPromise) tauriPromise.then(unlisten => unlisten && unlisten());
    };
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      await instagramApi.connect();
    } catch (err: any) {
      console.error('Instagram connect error:', err);
      setError(err.message || 'Error al iniciar conexión');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleValidate = async () => {
    setIsValidating(true);
    setValidationResult(null);
    try {
      const data = await instagramApi.validate();
      setValidationResult({
        success: data.success,
        message: data.message || data.error,
        profile: data.instagram_account,
      });
    } catch (err: any) {
      setValidationResult({ success: false, message: err.message || 'Error de validación' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRefreshToken = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const result = await instagramApi.refreshToken();
      if (result.success) {
        setValidationResult({
          success: true,
          message: result.message || 'Token renovado exitosamente',
        });
        // Reload connection to get updated expiry
        await loadConnection();
      } else {
        setError(result.error || 'Error al renovar token');
      }
    } catch (err: any) {
      setError(err.message || 'Error al renovar token');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connection) return;
    if (!confirm('¿Deseas desconectar tu cuenta de Instagram? Necesitarás reconectarla para publicar.')) return;

    try {
      await instagramApi.disconnect(connection.id);
      setConnection(null);
      setValidationResult(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="w-full">
        <div className="grid w-full grid-cols-2 mb-8 bg-muted p-1 rounded-xl">
          <button 
            className={`py-2 px-4 rounded-lg font-medium text-sm transition-all ${activeTab === 'general' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button 
            className={`py-2 px-4 rounded-lg font-medium text-sm transition-all ${activeTab === 'advanced' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('advanced')}
          >
            Avanzado
          </button>
        </div>

        {activeTab === 'general' && (
          <div className="space-y-6">
          <InstagramConnectionCard
            connection={connection}
            isLoading={isLoading}
            isConnecting={isConnecting}
            isValidating={isValidating}
            isRefreshing={isRefreshing}
            validationResult={validationResult}
            error={error}
            onConnect={handleConnect}
            onValidate={handleValidate}
            onRefreshToken={handleRefreshToken}
            onDisconnect={handleDisconnect}
          />

          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 space-y-6">
              <SessionManager user={user} onLogout={logout} />
              <div className="grid sm:grid-cols-2 gap-4">
                <div />
                <div className="sm:text-right">
                  <PasswordManager email={user?.email} onError={(msg) => setError(msg)} />
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <AIAssistantSettings />
            {isDeveloper && <DeveloperPanel />}
          </div>
        )}
      </div>
    </div>
  );
}
