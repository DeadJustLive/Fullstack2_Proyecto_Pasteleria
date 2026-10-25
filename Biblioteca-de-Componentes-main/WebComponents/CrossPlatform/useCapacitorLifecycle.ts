// @use(kind, contract, limit, deps, platform)
// @kind(hook)
// @limit(lines: 160, params: 1)
// @contract(in: UseCapacitorLifecycleOptions -> out: void)
// @deps(@external: [@capacitor/app, @capacitor/network], @internal: [../lib/supabaseLogger])
// @platform(mobile)
import { useEffect, useRef, useCallback } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { supabaseLogger } from '../lib/supabaseLogger';

interface UseCapacitorLifecycleOptions {
    session: any;
    dbStatus: string;
    setDbStatus: (v: 'checking' | 'online' | 'offline') => void;
    selectedOrder: any;
    settingsInSubPage: boolean;
    showQueueModal: boolean;
    showCalendarModal: boolean;
    showOfflineRestriction: boolean;
    showOfferExecutionModal: boolean;
    showPinModal: boolean;
    setShowQueueModal: (v: boolean) => void;
    setShowCalendarModal: (v: boolean) => void;
    setShowOfflineRestriction: (v: boolean) => void;
    setShowOfferExecutionModal: (v: boolean) => void;
    setShowPinModal: (v: boolean) => void;
    setSelectedOrder: (v: any) => void;
    setSettingsInSubPage: (v: boolean) => void;
    fetchData: (silent?: boolean, force?: boolean, throwOnError?: boolean) => Promise<void>;
}

export function useCapacitorLifecycle(opts: UseCapacitorLifecycleOptions) {
    const appStateRef = useRef<'active' | 'inactive' | 'background'>('active');

    const {
        session, setDbStatus,
        selectedOrder, settingsInSubPage,
        showQueueModal, showCalendarModal, showOfflineRestriction,
        showOfferExecutionModal, showPinModal,
        setShowQueueModal, setShowCalendarModal, setShowOfflineRestriction,
        setShowOfferExecutionModal, setShowPinModal,
        setSelectedOrder, setSettingsInSubPage,
        fetchData,
    } = opts;

    // ── Debug logger ──
    useEffect(() => {
        const debugMode = localStorage.getItem('debug_mode') === 'true';
        const url = import.meta.env.VITE_SUPABASE_URL;
        if (debugMode && url) supabaseLogger.install(url);
        return () => supabaseLogger.uninstall();
    }, []);

    // ── Network status (Capacitor) ──
    useEffect(() => {
        let networkListener: any;

        const setupNetworkListener = async () => {
            networkListener = await Network.addListener('networkStatusChange', status => {
                console.log('[network] Capacitor reported status:', status.connected);
                if (!status.connected) {
                    setDbStatus('offline');
                }
            });
        };

        setupNetworkListener();

        return () => {
            if (networkListener) {
                networkListener.remove().catch(() => { });
            }
        };
    }, [setDbStatus]);

    // ── App resume / background (Capacitor) ──
    const handleAppWakeUp = useCallback((source: string) => {
        console.log(`[resume] App woke up via ${source}`);
        if (session) {
            appStateRef.current = 'active';
            fetchData(true, false, false);
        }
    }, [session, fetchData]);

    useEffect(() => {
        let appListener: any;

        const initApp = async () => {
            try {
                appListener = await CapacitorApp.addListener('appStateChange', (state: any) => {
                    console.log('[lifecycle] Capacitor stateChange:', state.isActive ? 'active' : 'background');
                    appStateRef.current = state.isActive ? 'active' : 'background';
                    if (state.isActive) {
                        handleAppWakeUp('Capacitor');
                    }
                });
            } catch (err) {
                console.warn('Capacitor App plugin not available', err);
            }
        };

        initApp();

        return () => {
            if (appListener) appListener.remove().catch(() => { });
        };
    }, [session, handleAppWakeUp]);

    // ── Android hardware back button ──
    useEffect(() => {
        let backListener: any;

        const setupBackButton = async () => {
            try {
                backListener = await CapacitorApp.addListener('backButton', () => {
                    if (showQueueModal || showCalendarModal || showOfflineRestriction || showOfferExecutionModal || showPinModal) {
                        setShowQueueModal(false);
                        setShowCalendarModal(false);
                        setShowOfflineRestriction(false);
                        setShowOfferExecutionModal(false);
                        setShowPinModal(false);
                    }
                    else if (settingsInSubPage) {
                        setSettingsInSubPage(false);
                    }
                    else if (selectedOrder) {
                        setSelectedOrder(null);
                    }
                    else {
                        CapacitorApp.minimizeApp();
                    }
                });
            } catch (err) {
                console.warn('Capacitor App plugin no disponible (web environment)', err);
            }
        };

        setupBackButton();

        return () => {
            if (backListener) {
                backListener.remove().catch(() => { });
            }
        };
    }, [
        selectedOrder, settingsInSubPage,
        showQueueModal, showCalendarModal, showOfflineRestriction,
        showOfferExecutionModal, showPinModal,
        setShowQueueModal, setShowCalendarModal, setShowOfflineRestriction,
        setShowOfferExecutionModal, setShowPinModal,
        setSelectedOrder, setSettingsInSubPage,
    ]);
}
