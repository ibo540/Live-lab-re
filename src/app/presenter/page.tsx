'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/components/session-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createGroupsForSession } from '@/lib/actions';
import { Loader2, Play, LayoutDashboard, BarChart3, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/types';

type Submission = Database['public']['Tables']['submissions']['Row'];
type Group = Database['public']['Tables']['groups']['Row'];

export default function PresenterPage() {
    const { session, createSession, endSession } = useSession();
    const [duration, setDuration] = useState(5);
    const [isCreating, setIsCreating] = useState(false);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);

    // Fetch initial data and subscribe
    useEffect(() => {
        if (!session?.id) return;

        const fetchData = async () => {
            const { data: groupsData } = await supabase.from('groups').select('*').eq('session_id', session.id);
            if (groupsData) setGroups(groupsData);

            const { data: subsData } = await supabase.from('submissions').select('*').eq('session_id', session.id);
            if (subsData) setSubmissions(subsData);
        };
        fetchData();

        const channel = supabase
            .channel('presenter-subs')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions', filter: `session_id=eq.${session.id}` }, (payload) => {
                setSubmissions(prev => [...prev, payload.new as Submission]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [session?.id]);

    const handleCreate = async () => {
        setIsCreating(true);
        const sessionId = await createSession(duration);
        if (sessionId) {
            await createGroupsForSession(sessionId);
        }
        setIsCreating(false);
    };

    const updatePhase = async (phase: Database['public']['Tables']['sessions']['Row']['current_phase']) => {
        if (!session) return;
        await supabase.from('sessions').update({ current_phase: phase }).eq('id', session.id);
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-slate-950 text-white p-8 flex items-center justify-center">
                <Card className="w-full max-w-md bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><LayoutDashboard /> Presenter Control</CardTitle>
                        <CardDescription>Start a new interactive class session</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Session Duration (Minutes)</Label>
                            <Input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="bg-slate-950 border-slate-700"
                            />
                        </div>
                        <Button
                            onClick={handleCreate}
                            disabled={isCreating}
                            className="w-full bg-indigo-600 hover:bg-indigo-500"
                        >
                            {isCreating ? <Loader2 className="animate-spin mr-2" /> : <Play className="mr-2 w-4 h-4" />}
                            Start Session
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <header className="flex justify-between items-center border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Presenter Dashboard</h1>
                        <p className="text-slate-400 text-sm">Session ID: <span className="font-mono text-indigo-400">{session.id}</span></p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="destructive" onClick={() => endSession()}>End Session</Button>
                        <Button variant="secondary" onClick={() => window.open('/projector', '_blank')}>Open Projector View</Button>
                    </div>
                </header>

                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-400">Status</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold capitalize text-green-400">{session.status}</div></CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-400">Total Submissions</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{submissions.length}</div></CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-400">Active Phase</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold capitalize text-blue-400">{session.current_phase}</div></CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Controls */}
                    <div className="space-y-6 md:col-span-1">
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader><CardTitle>Phase Controls</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                <Button onClick={() => updatePhase('qr')} variant={session.current_phase === 'qr' ? 'default' : 'outline'} className="w-full justify-start border-slate-700">1. Show QR Codes</Button>
                                <Button onClick={() => updatePhase('work')} variant={session.current_phase === 'work' ? 'default' : 'outline'} className="w-full justify-start border-slate-700">2. Start Timer (Work)</Button>
                                <Button onClick={() => updatePhase('results')} variant={session.current_phase === 'results' ? 'default' : 'outline'} className="w-full justify-start border-slate-700">3. Reveal Results</Button>
                                <Button onClick={() => updatePhase('counterexample')} variant={session.current_phase === 'counterexample' ? 'default' : 'outline'} className="w-full justify-start border-slate-700 text-amber-400 border-amber-900/50 hover:bg-amber-900/20">4. Reveal Counterexample</Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Live Feed / Results */}
                    <Card className="bg-slate-900 border-slate-800 md:col-span-2 min-h-[500px]">
                        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 /> Live Results</CardTitle></CardHeader>
                        <CardContent>
                            {submissions.length === 0 ? (
                                <div className="text-center text-slate-500 py-20">Waiting for submissions...</div>
                            ) : (
                                <div className="grid gap-6">
                                    {groups.map(group => {
                                        const groupSubs = submissions.filter(s => s.group_id === group.id);
                                        if (groupSubs.length === 0) return null;

                                        return (
                                            <div key={group.id} className="space-y-2">
                                                <h3 className="font-semibold text-indigo-300">Group {group.group_number} ({group.method_type})</h3>
                                                <div className="grid gap-2">
                                                    {groupSubs.map(sub => (
                                                        <div key={sub.id} className="bg-slate-800 p-3 rounded-md border border-white/5 flex justify-between items-start">
                                                            <div>
                                                                <div className="font-medium text-white">{sub.selected_factor}</div>
                                                                <div className="text-sm text-slate-400 italic">"{sub.justification}"</div>
                                                            </div>
                                                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-1" />
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
                </div>
            </div>
        </div>
    );
}
