'use client';

import { useSession } from '@/components/session-provider';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { METHODS } from '@/data/methods';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/types';
import { CheckCircle } from 'lucide-react';

export default function ProjectorPage() {
    const { session } = useSession();
    const [groups, setGroups] = useState<Database['public']['Tables']['groups']['Row'][]>([]);
    const [submissions, setSubmissions] = useState<Database['public']['Tables']['submissions']['Row'][]>([]);

    // Fetch groups
    useEffect(() => {
        if (!session?.id) return;
        const fetchGroups = async () => {
            const { data } = await supabase.from('groups').select('*').eq('session_id', session.id);
            if (data) setGroups(data);
        };
        fetchGroups();

        // Listen for submissions for the live counter
        const channel = supabase
            .channel('projector-subs')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions', filter: `session_id=eq.${session.id}` }, (payload) => {
                setSubmissions(prev => [...prev, payload.new as any]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [session?.id]);

    if (!session) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <h1 className="text-4xl font-bold tracking-wider text-slate-500">WAITING FOR SESSION...</h1>
            </div>
        )
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    return (
        <div className="min-h-screen bg-black text-white p-8 overflow-hidden font-outfit">

            <header className="flex justify-between items-center mb-12 border-b border-white/20 pb-4">
                <h1 className="text-3xl font-bold text-indigo-400">Comparative Methods Live Lab</h1>
                <div className="flex items-center gap-6">
                    <div className="text-xl text-slate-400">
                        Submissions: <span className="text-white font-mono">{submissions.length}</span>
                    </div>
                    <div className="text-2xl font-mono text-slate-400 border px-3 py-1 rounded border-white/20">
                        {session.current_phase.toUpperCase()}
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
                <AnimatePresence mode="wait">

                    {/* PHASE 1: QR CODES */}
                    {(session.current_phase === 'intro' || session.current_phase === 'qr') && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="grid grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl"
                        >
                            {groups.map((group) => (
                                <Card key={group.id} className="bg-slate-900 border-white/10 p-6 flex flex-col items-center text-center space-y-4">
                                    <h2 className="text-2xl font-bold text-white mb-2">Group {group.group_number}</h2>
                                    <div className="bg-white p-4 rounded-xl">
                                        <QRCodeSVG
                                            value={`${origin}/group/${group.id}`}
                                            size={200}
                                            level={'H'}
                                            includeMargin={true}
                                        />
                                    </div>
                                    <p className="text-xl font-semibold text-indigo-300">
                                        {METHODS[group.method_type]?.title}
                                    </p>
                                </Card>
                            ))}
                            {groups.length === 0 && <p className="text-center w-full col-span-4 text-2xl animate-pulse">Generating Group Access...</p>}
                        </motion.div>
                    )}

                    {/* PHASE 2: WORK */}
                    {session.current_phase === 'work' && (
                        <motion.div key="work" className="text-center space-y-8">
                            <h2 className="text-6xl font-bold">Activity in Progress</h2>
                            <div className="text-9xl font-mono text-indigo-500 font-bold animate-pulse">
                                05:00
                            </div>
                            <p className="text-2xl text-slate-400">Discuss with your group and submit one answer.</p>
                        </motion.div>
                    )}

                    {/* PHASE 3: RESULTS */}
                    {(session.current_phase === 'results' || session.current_phase === 'counterexample') && (
                        <motion.div key="results" className="w-full max-w-7xl grid grid-cols-2 gap-8">
                            <div className="col-span-2 text-center mb-8">
                                <h2 className="text-5xl font-bold mb-4">Results Analysis</h2>
                            </div>
                            {/* Simplified placeholders for the 4 methods results */}
                            {groups.map((g) => (
                                <Card key={g.id} className="bg-slate-900 border-slate-700 p-6">
                                    <h3 className="text-2xl font-bold text-indigo-300 mb-2">{METHODS[g.method_type]?.title}</h3>
                                    <div className="bg-black/50 p-4 rounded h-32 flex items-center justify-center text-slate-500">
                                        {/* In real usage we would aggregate counts here */}
                                        {submissions.filter(s => s.group_id === g.id).length} Answers Received
                                    </div>
                                </Card>
                            ))}
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>

        </div>
    );
}
