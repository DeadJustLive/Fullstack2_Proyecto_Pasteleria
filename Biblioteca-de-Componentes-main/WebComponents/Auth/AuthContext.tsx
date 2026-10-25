import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { useProfile } from '../hooks/useProfile';
import { useAddresses } from '../hooks/useAddresses';

export interface Address {
    id: string;
    title: string;
    region: string;
    commune: string;
    address: string;
}

export interface AppUser {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    addresses?: Address[];
    isGuest?: boolean;
    loyalty_points?: number;
}

interface AuthContextType {
    user: AppUser | null;
    session: Session | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name?: string, address?: Omit<Address, 'id'>) => Promise<{ needsConfirmation: boolean }>;
    loginAsGuest: () => void;
    logout: () => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
    resetPassword: (newPassword: string) => Promise<void>;
    addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
    updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
    deleteAddress: (id: string) => Promise<void>;
    updateProfile: (data: Partial<AppUser>) => Promise<void>;
    changePassword: (current: string, newPass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: load profile from user_profiles
async function loadProfile(supabaseUser: SupabaseUser): Promise<AppUser> {
    const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

    return {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: data?.name || supabaseUser.user_metadata?.name || '',
        phone: data?.phone || '',
        addresses: (data?.addresses as Address[]) || [],
        isGuest: false,
        loyalty_points: data?.loyalty_points || 0,
    };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Delegated hooks for profile & address management
    const { updateProfile, changePassword } = useProfile(user, setUser);
    const { addAddress, updateAddress, deleteAddress } = useAddresses(user, setUser);

    useEffect(() => {
        let cancelled = false;

        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: null } }>(resolve =>
            setTimeout(() => resolve({ data: { session: null } }), 3000)
        );

        Promise.race([sessionPromise, timeoutPromise])
            .then(async ({ data: { session } }) => {
                if (cancelled) return;
                setSession(session);
                if (session?.user) {
                    try {
                        const profile = await loadProfile(session.user);
                        if (!cancelled) setUser(profile);
                    } catch {
                        // profile load failed: still mark auth as done
                    }
                }
            })
            .catch(() => {
                // Supabase unreachable — just proceed as logged out
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        let subscription: { unsubscribe: () => void } | null = null;
        try {
            const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
                setSession(session);
                if (session?.user) {
                    try {
                        const profile = await loadProfile(session.user);
                        setUser(profile);
                    } catch {
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            });
            subscription = data.subscription;
        } catch {
            // Auth listener setup failed — not fatal
        }

        return () => {
            cancelled = true;
            subscription?.unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const register = async (email: string, password: string, name?: string, address?: Omit<Address, 'id'>) => {
        const addressesList = address ? [{ ...address, id: crypto.randomUUID() }] : [];
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name, addresses: addressesList },
                emailRedirectTo: `${window.location.origin}/`,
            }
        });
        if (error) throw error;
        return { needsConfirmation: !data.session };
    };

    const loginAsGuest = () => {
        setUser({ id: 'guest', email: 'guest@example.com', isGuest: true });
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    };

    const requestPasswordReset = async (email: string) => {
        const ghPages = window.location.hostname.includes('github.io') ? '/PaginaWeb-Marce' : '';
        const redirectTo = `${window.location.origin}${ghPages}/reset-password`;
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw error;
    };

    const resetPassword = async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            loginAsGuest,
            logout,
            requestPasswordReset,
            resetPassword,
            addAddress,
            updateAddress,
            deleteAddress,
            updateProfile,
            changePassword
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

