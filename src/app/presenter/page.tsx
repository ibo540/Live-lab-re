'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/components/session-provider';
import { Button } from '@/components/ui/button';
import { LiquidGradient } from '@/components/liquid-gradient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createGroupsForSession } from '@/lib/actions';
import { Loader2, Play, LayoutDashboard, BarChart3, CheckCircle2, Minus, Plus, Settings2, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/types';
import { METHODS } from '@/data/methods';

type Submission = Database['public']['Tables']['submissions']['Row'];
type Group = Database['public']['Tables']['groups']['Row'];

const GRADIENT_COLORS = {
    color1: '#FF6C50',
    color2: '#40E0D0',
    color3: '#FF6C50',
    color4: '#40E0D0',
    color5: '#FF6C50',
    color6: '#40E0D0'
};

export default function PresenterPage() {
    const { session, createSession, endSession } = useSession();
    const [duration, setDuration] = useState(5);
    const [isCreating, setIsCreating] = useState(false);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [timeLeft, setTimeLeft] = useState<string>('--:--');
    const [optimisticPhase, setOptimisticPhase] = useState<string | null>(null);

    // Derived phase for UI rendering
    const displayPhase = optimisticPhase || session?.current_phase;

    // Fetch initial data, subscribe, and poll
    useEffect(() => {
        if (!session?.id) return;

        const fetchSubmissions = async () => {
            const { data: subsData } = await supabase.from('submissions').select('*').eq('session_id', session.id);
            if (subsData) {
                // De-duplicate just in case
                setSubmissions(subsData);
            }
        };

        const fetchData = async () => {
            const { data: groupsData } = await supabase.from('groups').select('*').eq('session_id', session.id);
            if (groupsData) setGroups(groupsData);
            await fetchSubmissions();
        };
        fetchData();

        const channel = supabase
            .channel('presenter-subs')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions', filter: `session_id=eq.${session.id}` }, (payload) => {
                setSubmissions(prev => {
                    if (prev.some(s => s.id === (payload.new as Submission).id)) return prev;
                    return [...prev, payload.new as Submission];
                });
            })
            .subscribe();

        // Poll every 3 seconds to ensure data consistency
        const interval = setInterval(fetchSubmissions, 3000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, [session?.id]);

    useEffect(() => {
        if (!session || session.status !== 'active') {
            if (session?.status === 'waiting') setTimeLeft('Ready');
            else if (session?.status === 'finished') setTimeLeft('Finished');
            return;
        }

        const calculateTime = () => {
            const startTime = new Date(session.created_at).getTime();
            const durationMs = session.duration_seconds * 1000;
            const endTime = startTime + durationMs;
            const now = new Date().getTime();
            const diff = endTime - now;

            if (diff <= 0) {
                setTimeLeft('00:00');
                if (session.status === 'active') {
                    endSession();
                }
            } else {
                const minutes = Math.floor(diff / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);

        return () => clearInterval(interval);
    }, [session]);

    const handleCreate = async () => {
        setIsCreating(true);
        const sessionId = await createSession(duration);
        if (sessionId) {
            await createGroupsForSession(sessionId);
        }
        setIsCreating(false);
    };

    const updatePhase = async (phase: string) => {
        if (!session) return;
        try {
            console.log("Setting phase to:", phase);
            setOptimisticPhase(phase);

            // Cast to any to bypass strict enum checks if 'results' is missing in types but present in DB
            const { error } = await (supabase.from('sessions') as any).update({ current_phase: phase }).eq('id', session.id);
            if (error) {
                setOptimisticPhase(null);
                throw error;
            }
        } catch (e: any) {
            console.error('Error updating phase:', e);
            alert('Failed to update phase: ' + e.message);
        }
    };

    const handleStartSession = async () => {
        handleCreate();
    };

    const handleEndSession = async () => {
        await endSession();
    };

    const openProjectorView = () => {
        window.open('/projector', '_blank');
    };

    if (!session) {
        return (
            <main className="min-h-screen p-4 md:p-8 flex flex-col relative overflow-hidden bg-slate-950 text-white items-center justify-center">
                <LiquidGradient colors={GRADIENT_COLORS} />
                <Card className="animated-border w-full max-w-xl bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl relative z-10 text-white">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="flex items-center gap-3 text-2xl text-white">
                            <div className="p-3 bg-white/10 rounded-xl">
                                <Settings2 className="w-8 h-8 text-white" />
                            </div>
                            Presenter Control
                        </CardTitle>
                        <CardDescription className="text-slate-300 text-lg">Start a new interactive class session</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 p-8 pt-4">
                        <div className="space-y-4">
                            <Label className="text-white text-lg">Session Duration (Minutes)</Label>
                            <div className="flex items-center justify-between bg-slate-950/50 p-2 rounded-xl border border-white/10">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDuration(Math.max(1, duration - 1))}
                                    className="text-white hover:bg-white/10 hover:text-white"
                                    disabled={isCreating}
                                >
                                    <Minus className="w-5 h-5" />
                                </Button>
                                <span className="text-xl font-bold text-white select-none">{duration}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDuration(duration + 1)}
                                    className="text-white hover:bg-white/10 hover:text-white"
                                    disabled={isCreating}
                                >
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                        <Button
                            className="w-full bg-white hover:bg-slate-200 text-slate-900 font-bold shadow-lg shadow-white/10 border-0"
                            onClick={handleCreate}
                            disabled={isCreating}
                        >
                            {isCreating ? 'Starting...' : 'Start Session'} <Play className="ml-2 w-4 h-4 fill-current" />
                        </Button>
                    </CardContent>
                </Card>
            </main>
        )
    }

    return (
        <main className="min-h-screen p-4 md:p-8 flex flex-col relative overflow-hidden bg-slate-950">
            <LiquidGradient
                colors={GRADIENT_COLORS}
            />

            {/* Header Section */}
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl flex-1 w-full md:w-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                                Presenter Dashboard
                                <span className={`text-sm px-3 py-1 rounded-full border ${session.status === 'active' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-slate-500/20 text-slate-300 border-slate-500/30'}`}>
                                    {session.status.toUpperCase()}
                                </span>
                            </h1>
                            <p className="text-slate-200 font-mono text-sm opacity-80 flex items-center gap-2">
                                <span className="uppercase text-xs tracking-wider opacity-60">Session ID</span>
                                {session.id}
                            </p>
                        </div>

                        {/* Timer Display */}
                        <div className="flex items-center gap-3 bg-slate-950/50 px-5 py-3 rounded-xl border border-white/5">
                            <Clock className={`w-6 h-6 ${session.status === 'active' ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Time Remaining</span>
                                <span className="text-2xl font-mono font-bold text-white tabular-nums tracking-wider text-shadow-sm">
                                    {timeLeft}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl">
                    {displayPhase === 'results' ? (
                        <Button onClick={() => updatePhase('work')} className="bg-slate-700 hover:bg-slate-600 text-white shadow-lg border border-white/10">
                            Hide Results
                        </Button>
                    ) : (
                        <Button onClick={() => updatePhase('results')} className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 border-0">
                            Show Results
                        </Button>
                    )}
                    <Button variant="destructive" onClick={handleEndSession} className="shadow-lg shadow-red-900/20 border border-red-800/50">
                        End Session
                    </Button>
                    <Button variant="outline" onClick={openProjectorView} className="bg-white/10 border-white/10 text-white hover:bg-white/20 hover:text-white">
                        Open Projector View
                    </Button>
                </div>
            </div>
            <div className="max-w-7xl mx-auto space-y-6 relative z-10 w-full">
                {/* Content Switcher based on Phase */}
                {displayPhase === 'results' ? (
                    // === REVIEW MODE (LARGE PRESENTATION LAYOUT) ===
                    <div className="w-full animate-in fade-in zoom-in-95 duration-500 space-y-12 pb-20">
                        <div className="text-center py-4">
                            <h2 className="text-4xl font-bold text-white mb-4 flex justify-center items-center gap-4">
                                <BarChart3 className="w-10 h-10 text-emerald-400" /> Class Analysis & Review
                            </h2>
                            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                                Review each group's scenario, the logic behind the method, and the class voting results.
                            </p>
                        </div>

                        <div className="space-y-16">
                            {Object.values(METHODS).map((method, idx) => {
                                const group = groups.find(g => g.method_type === method.id);
                                const groupSubs = group ? submissions.filter(s => s.group_id === group.id) : [];
                                const totalSubs = groupSubs.length;

                                return (
                                    <Card key={method.id} className="bg-slate-900/80 backdrop-blur-3xl border-slate-700/50 shadow-2xl overflow-hidden ring-1 ring-white/10">
                                        <div className="grid xl:grid-cols-5 gap-0">
                                            {/* Left: Scenario & Logic (Span 3) */}
                                            <div className="xl:col-span-3 border-r border-white/5 bg-black/20 p-8">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-2xl border border-indigo-500/30">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-3xl font-bold text-white tracking-tight">{method.title}</h3>
                                                        <p className="text-indigo-300 text-lg opacity-80">{method.description}</p>
                                                    </div>
                                                </div>

                                                <div className="bg-slate-800/30 p-6 rounded-2xl border border-white/5 mb-8">
                                                    <p className="text-slate-200 text-xl leading-relaxed italic border-l-4 border-indigo-500 pl-6 whitespace-pre-wrap">
                                                        "{method.scenarioText || method.question}"
                                                    </p>
                                                </div>

                                                {/* Large Table */}
                                                {method.id === 'nested' ? (
                                                    <div className="rounded-xl border border-white/5 overflow-hidden shadow-2xl bg-black/20">
                                                        <table className="w-full text-sm text-left">
                                                            <thead className="bg-indigo-500/10 text-indigo-200 font-bold uppercase tracking-wider text-xs font-outfit">
                                                                <tr>
                                                                    <th className="p-4 pl-6 border-b border-white/5">Larger Case<br /><span className="normal-case opacity-50 text-[10px]">(Nested Context)</span></th>
                                                                    <th className="p-4 border-b border-white/5">Nested Case<br /><span className="normal-case opacity-50 text-[10px]">(Faculty)</span></th>
                                                                    <th className="p-4 border-b border-white/5 w-1/4">Controlled Factors<br /><span className="normal-case opacity-50 text-[10px]">(Already Nested)</span></th>
                                                                    <th className="p-4 border-b border-white/5">Class Size</th>
                                                                    <th className="p-4 border-b border-white/5">Student Organization Strength</th>
                                                                    <th className="p-4 pr-6 border-b border-white/5 text-right">Student Protest</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-white/5 bg-transparent text-slate-200">
                                                                {method.cases.map(c => (
                                                                    <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                                                                        <td className="p-4 pl-6 text-slate-400">Same University</td>
                                                                        <td className="p-4 font-medium text-white group-hover:text-indigo-200 transition-colors">{c.label}</td>
                                                                        <td className="p-4 text-xs text-slate-500 leading-relaxed max-w-[200px]">
                                                                            Attendance policy, tuition fees, exam rules, grading system, university leadership
                                                                        </td>
                                                                        <td className="p-4 text-slate-400">Large</td>
                                                                        <td className="p-4 text-slate-400">
                                                                            {c.conditions['Student Org Strength (Strong)'] ? 'Strong' : 'Weak'}
                                                                        </td>
                                                                        <td className="p-4 pr-6 text-right">
                                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${c.outcome ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"}`}>
                                                                                {c.outcome ? "YES" : "NO"}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : method.id === 'qca' ? (
                                                    <div className="rounded-xl border border-white/5 overflow-hidden shadow-2xl bg-black/20">
                                                        <table className="w-full text-sm text-left">
                                                            <thead className="bg-indigo-500/10 text-indigo-200 font-bold uppercase tracking-wider text-xs font-outfit">
                                                                <tr>
                                                                    <th className="p-4 pl-6 border-b border-white/5">Combination #</th>
                                                                    <th className="p-4 border-b border-white/5">A (Tuition Increase)</th>
                                                                    <th className="p-4 border-b border-white/5">B (Student Mobilization)</th>
                                                                    <th className="p-4 border-b border-white/5">C (Trust in Administration)</th>
                                                                    <th className="p-4 border-b border-white/5 text-right">NO PROTEST (cases)</th>
                                                                    <th className="p-4 pr-6 border-b border-white/5 text-right">PROTEST (cases)</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-white/5 bg-transparent text-slate-200">
                                                                {method.cases.map(c => (
                                                                    <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                                                                        <td className="p-4 pl-6 font-medium text-white group-hover:text-indigo-200 transition-colors">{c.label}</td>
                                                                        <td className="p-4 text-slate-400">{c.conditions['A (Tuition Increase)'] ? 'Yes' : 'No'}</td>
                                                                        <td className="p-4 text-slate-400">{c.conditions['B (Student Mobilization)'] ? 'Yes' : 'No'}</td>
                                                                        <td className="p-4 text-slate-400">{c.conditions['C (Trust in Administration)'] ? 'Yes' : 'No'}</td>
                                                                        <td className="p-4 text-right font-mono text-slate-500">{c.stats?.noProtest ?? 0}</td>
                                                                        <td className="p-4 pr-6 text-right font-mono text-white font-bold">{c.stats?.protest ?? 0}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="rounded-xl border border-white/5 overflow-hidden shadow-2xl bg-black/20">
                                                        <table className="w-full text-sm text-left">
                                                            <thead className="bg-indigo-500/10 text-indigo-200 font-bold uppercase tracking-wider text-xs font-outfit">
                                                                <tr>
                                                                    <th className="p-4 pl-6">Case</th>
                                                                    <th className="p-4">Key Conditions</th>
                                                                    <th className="p-4 pr-6 text-right">Late?</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-white/5 bg-transparent text-slate-200">
                                                                {method.cases.map(c => (
                                                                    <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                                                                        <td className="p-4 pl-6 font-medium text-white group-hover:text-indigo-200 transition-colors">{c.label}</td>
                                                                        <td className="p-4">
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {Object.entries(c.conditions).map(([k, v]) => (
                                                                                    v && <span key={k} className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-200 text-xs border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]">{k}</span>
                                                                                ))}
                                                                                {Object.values(c.conditions).every(v => !v) && <span className="text-slate-500 italic text-xs">None</span>}
                                                                            </div>
                                                                        </td>
                                                                        <td className="p-4 pr-6 text-right">
                                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${c.outcome ? "bg-red-500/20 text-red-300 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]"}`}>
                                                                                {c.outcome ? "YES" : "NO"}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right: Results & Analysis (Span 2) */}
                                            <div className="xl:col-span-2 p-8 bg-slate-900/60 flex flex-col">
                                                <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-6">
                                                    <h4 className="text-2xl font-bold text-white flex items-center gap-2">
                                                        <BarChart3 className="w-6 h-6 text-amber-400" /> Student Results
                                                    </h4>
                                                    <span className="text-sm bg-white/10 text-white px-4 py-1.5 rounded-full font-mono font-bold border border-white/10">
                                                        {totalSubs} Votes
                                                    </span>
                                                </div>

                                                <div className="space-y-4 flex-1">
                                                    {method.options.map(opt => {
                                                        const count = groupSubs.filter(s => s.selected_factor === opt).length;
                                                        const percent = totalSubs > 0 ? (count / totalSubs) * 100 : 0;
                                                        const isCorrect = opt === method.correctAnswer;
                                                        const isWinner = count > 0 && count === Math.max(...method.options.map(o => groupSubs.filter(s => s.selected_factor === o).length));

                                                        return (
                                                            <div key={opt} className={`relative overflow-hidden p-4 rounded-xl border transition-all duration-500 ${isCorrect ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/5'}`}>
                                                                {/* Progress Bar Background */}
                                                                <div
                                                                    className={`absolute top-0 bottom-0 left-0 opacity-10 transition-all duration-1000 ${isCorrect ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                                    style={{ width: `${percent}%` }}
                                                                />

                                                                <div className="relative z-10 flex justify-between items-center">
                                                                    <div className="flex items-start gap-3">
                                                                        <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isCorrect ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-slate-600 text-slate-600'}`}>
                                                                            {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-bold"></span>}
                                                                        </div>
                                                                        <div>
                                                                            <span className={`text-base font-medium block ${isCorrect ? "text-emerald-300" : "text-slate-300"}`}>
                                                                                {opt}
                                                                            </span>
                                                                            {isCorrect && <span className="text-xs text-emerald-500 uppercase tracking-wider font-bold">Correct Answer</span>}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="text-2xl font-bold text-white block">{count}</span>
                                                                        <span className="text-xs text-slate-500">{percent.toFixed(0)}%</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>

                                                {/* Legend/Helper */}
                                                <div className="mt-8 pt-6 border-t border-white/10 flex justify-center gap-6 text-sm text-slate-400">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                        <span>Correct Answer</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <BarChart3 className="w-4 h-4 text-indigo-400" />
                                                        <span>Vote Volume</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    // === STANDARD DASHBOARD MODE ===
                    <>
                        <div className="grid md:grid-cols-3 gap-6">
                            <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl">
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-300">Status</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold capitalize text-teal-300 drop-shadow-sm">{session.status}</div></CardContent>
                            </Card>
                            <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl">
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-300">Total Submissions</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold text-white drop-shadow-sm">{submissions.length}</div></CardContent>
                            </Card>
                            <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl">
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-300">Active Phase</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold capitalize text-amber-300 drop-shadow-sm">{session.current_phase}</div></CardContent>
                            </Card>
                        </div>

                        {/* Live Feed / Results */}
                        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl min-h-[500px]">
                            <CardHeader><CardTitle className="flex items-center gap-2 text-white"><BarChart3 className="text-amber-400" /> Live Results</CardTitle></CardHeader>
                            <CardContent>
                                {submissions.length === 0 ? (
                                    <div className="text-center text-slate-400 py-20 flex flex-col items-center gap-3">
                                        <div className="p-4 bg-white/5 rounded-full"><Loader2 className="w-8 h-8 animate-spin text-slate-500" /></div>
                                        <p>Waiting for submissions...</p>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {groups.map(group => {
                                            const groupSubs = submissions.filter(s => s.group_id === group.id);
                                            if (groupSubs.length === 0) return null;

                                            return (
                                                <div key={group.id} className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
                                                    <h3 className="font-semibold text-indigo-200 flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-indigo-400" />
                                                        Group {group.group_number} ({group.method_type})
                                                    </h3>
                                                    <div className="grid gap-2">
                                                        {groupSubs.map(sub => (
                                                            <div key={sub.id} className="bg-slate-950/50 p-3 rounded-lg border border-white/10 flex justify-between items-start hover:border-white/20 transition">
                                                                <div>
                                                                    <div className="font-medium text-white">{sub.selected_factor}</div>
                                                                    <div className="text-sm text-slate-400 italic">"{sub.justification}"</div>
                                                                </div>
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
                {/* ... rest of the dashboard ... */}
            </div>
        </main>
    );
}
