'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/types';

type Session = Database['public']['Tables']['sessions']['Row'];

interface SessionContextType {
    session: Session | null;
    loading: boolean;
    createSession: (duration: number) => Promise<string | null>;
    endSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
    session: null,
    loading: true,
    createSession: async () => null,
    endSession: async () => { },
});

export const useSession = () => useContext(SessionContext);

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // Initial fetch (simplified - assumes one active session for demo)
    useEffect(() => {
        const fetchSession = async () => {
            // Find the most recent active or waiting session
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .in('status', ['waiting', 'active', 'paused'])
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (data) {
                setSession(data);
            }
            setLoading(false);
        };

        fetchSession();

        // Realtime subscription
        const channel = supabase
            .channel('public:sessions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, (payload) => {
                // Very simple logic: if it matches our current ID or we have none, update.
                if (!session || (payload.new as Session).id === session.id) {
                    setSession(payload.new as Session);
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); }
    }, [session?.id]); // Re-subscribe if ID changes (optimization needed later)

    const createSession = async (durationMinutes: number) => {
        const { data, error } = await supabase
            .from('sessions')
            .insert({
                status: 'waiting',
                duration_seconds: durationMinutes * 60,
                current_phase: 'intro'
            })
            .select()
            .single();

        if (data) {
            setSession(data);
            return data.id;
        }
        if (error) console.error(error);
        return null;
    };

    const endSession = async () => {
        if (!session) return;
        await supabase.from('sessions').update({ status: 'finished' }).eq('id', session.id);
        setSession(null);
    }

    return (
        <SessionContext.Provider value={{ session, loading, createSession, endSession }}>
            {children}
        </SessionContext.Provider>
    );
}
