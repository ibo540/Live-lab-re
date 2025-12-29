'use client';

import { useSession } from '@/components/session-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LiquidGradient } from '@/components/liquid-gradient';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { METHODS } from '@/data/methods';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/types';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ProjectorPage() {
    const { session } = useSession();
    const router = useRouter();
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
            <main className="min-h-screen flex flex-col p-8 relative overflow-hidden bg-slate-950 flex items-center justify-center">
                <LiquidGradient
                    colors={{
                        color1: '#FF6C50',
                        color2: '#40E0D0',
                        color3: '#FF6C50',
                        color4: '#40E0D0',
                        color5: '#FF6C50',
                        color6: '#40E0D0'
                    }}
                />
                <h1 className="text-4xl font-bold tracking-wider text-slate-500 relative z-10">WAITING FOR SESSION...</h1>
            </main>
        )
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    return (
        <main className="min-h-screen flex flex-col p-8 relative overflow-hidden bg-slate-950">
            <LiquidGradient
                colors={{
                    color1: '#FF6C50',
                    color2: '#40E0D0',
                    color3: '#FF6C50',
                    color4: '#40E0D0',
                    color5: '#FF6C50',
                    color6: '#40E0D0'
                }}
            />

            <div className="absolute top-6 left-6 z-20">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/presenter')}
                    className="text-white/70 hover:text-white hover:bg-white/10 gap-2 group border border-transparent hover:border-white/10"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Dashboard
                </Button>
            </div>

            <header className="flex justify-center items-center pt-8 pb-6 mb-8 relative z-10">
                <h1 className="text-4xl font-bold text-white bg-white/5 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-2xl shadow-2xl">
                    Comparative Methods Live Lab
                </h1>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] relative z-10 w-full px-8">
                <AnimatePresence mode="wait">

                    {/* PHASE 1: QR CODES */}
                    {(session.current_phase === 'intro' || session.current_phase === 'qr') && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="grid grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-[90vw]"
                        >
                            {groups.map((group) => (
                                <Card
                                    key={group.id}
                                    onClick={() => window.open(`${origin}/group/${group.id}`, '_blank')}
                                    className="bg-white/5 backdrop-blur-xl border-white/10 p-8 flex flex-col items-center text-center space-y-6 shadow-2xl cursor-pointer hover:bg-white/10 transition-colors"
                                    title="Click to open Student View (Test Mode)"
                                >
                                    <h2 className="text-3xl font-bold text-white mb-2">Group {group.group_number}</h2>
                                    <div className="bg-white p-4 rounded-xl shadow-lg">
                                        <QRCodeSVG
                                            value={`${origin}/group/${group.id}`}
                                            size={220}
                                            level={'H'}
                                            includeMargin={true}
                                        />
                                    </div>
                                    <p className="text-xl font-medium text-slate-200 opacity-90">
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

                    {/* PHASE 3: RESULTS - REVIEW GRID */}
                    {(session.current_phase === 'results' || session.current_phase === 'counterexample') && (
                        <motion.div key="results" className="w-full max-w-[95vw] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="col-span-1 md:col-span-2 lg:col-span-4 text-center mb-4">
                                <h2 className="text-4xl font-bold text-white mb-2">Comparative Analysis Review</h2>
                                <p className="text-slate-400">Compare the scenarios and outcomes for each method.</p>
                            </div>
                            {Object.values(METHODS).map((method) => {
                                const group = groups.find(g => g.method_type === method.id);
                                const groupSubs = group ? submissions.filter(s => s.group_id === group.id) : [];
                                const totalSubs = groupSubs.length;

                                return (
                                    <Card key={method.id} className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50 overflow-hidden flex flex-col shadow-2xl">
                                        <CardHeader className="bg-indigo-900/20 pb-4 border-b border-white/5">
                                            <CardTitle className="text-lg font-bold text-indigo-300 h-12 flex items-center justify-center text-center leading-tight">
                                                {method.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <div className="p-0 flex-1 overflow-auto bg-black/20">
                                            <table className="w-full text-xs text-left">
                                                <thead className="bg-indigo-500/10 text-indigo-200 uppercase tracking-wider font-bold font-outfit">
                                                    <tr>
                                                        <th className="p-3 pl-4">Case</th>
                                                        <th className="p-3">Key Conditions</th>
                                                        <th className="p-3 pr-4 text-right">Late?</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {method.cases.map(c => (
                                                        <tr key={c.id} className="hover:bg-white/5 transition-colors">
                                                            <td className="p-3 pl-4 font-medium text-slate-300">{c.label}</td>
                                                            <td className="p-3">
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {Object.entries(c.conditions).map(([k, v]) => (
                                                                        v && <span key={k} className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-[10px] whitespace-nowrap shadow-[0_0_8px_rgba(99,102,241,0.1)]">{k}</span>
                                                                    ))}
                                                                    {Object.values(c.conditions).every(v => !v) && <span className="text-slate-600 italic">None</span>}
                                                                </div>
                                                            </td>
                                                            <td className="p-3 pr-4 text-right">
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.outcome ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"}`}>
                                                                    {c.outcome ? "YES" : "NO"}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="p-4 bg-black/40 border-t border-white/5 space-y-4">
                                            <p className="text-[10px] text-slate-400 italic text-center leading-relaxed">{method.question}</p>

                                            <div className="space-y-3 pt-2 border-t border-white/5">
                                                <div className="flex justify-between items-center px-1">
                                                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Live Results</h4>
                                                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white">{totalSubs} Votes</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {method.options.map(opt => {
                                                        const count = groupSubs.filter(s => s.selected_factor === opt).length;
                                                        const percent = totalSubs > 0 ? (count / totalSubs) * 100 : 0;
                                                        const isWinner = count > 0 && count === Math.max(...method.options.map(o => groupSubs.filter(s => s.selected_factor === o).length));

                                                        return (
                                                            <div key={opt} className="space-y-1">
                                                                <div className="flex justify-between text-[10px] text-slate-300 px-1">
                                                                    <span>{opt}</span>
                                                                    <span className={isWinner ? "text-indigo-400 font-bold" : "text-slate-500"}>{count}</span>
                                                                </div>
                                                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-1000 ${isWinner ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-600'}`}
                                                                        style={{ width: `${percent}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </main >
    );
}
