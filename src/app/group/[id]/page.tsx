'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { METHODS, MethodScenario } from '@/data/methods';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

import { Database } from '@/lib/types';

export default function StudentGroupPage() {
    const params = useParams();
    const groupId = params.id as string;
    const [group, setGroup] = useState<Database['public']['Tables']['groups']['Row'] | null>(null);
    const [method, setMethod] = useState<MethodScenario | null>(null);
    const [selectedOption, setSelectedOption] = useState('');
    const [justification, setJustification] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroupData = async () => {
            const { data: groupData } = await supabase.from('groups').select('*').eq('id', groupId).single();
            if (groupData) {
                setGroup(groupData);
                // Fix: Force cast to any to bypass strict never check failure in Vercel build
                setMethod(METHODS[(groupData as any).method_type as string]);

                // Check if already submitted (simple local check for demo, real implementations should check DB)
                const isSubmitted = localStorage.getItem(`submitted_${groupId}`);
                if (isSubmitted) setSubmitted(true);
            }
            setLoading(false);
        };
        fetchGroupData();
    }, [groupId]);

    const handleSubmit = async () => {
        if (!selectedOption || !group) return;

        setLoading(true);
        // Simple device hash
        const deviceHash = Math.random().toString(36).substring(7);

        const { error } = await supabase.from('submissions').insert({
            session_id: group.session_id,
            group_id: groupId,
            selected_factor: selectedOption,
            justification,
            device_hash: deviceHash
        } as any);

        if (!error) {
            setSubmitted(true);
            localStorage.setItem(`submitted_${groupId}`, 'true');
        } else {
            alert('Error submitting. Try again.');
        }
        setLoading(false);
    };

    if (loading) return <div className="p-8 text-white text-center">Loading Scenario...</div>;
    if (!group || !method) return <div className="p-8 text-white text-center">Group not assigned.</div>;

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center space-y-4"
                >
                    <div className="flex justify-center">
                        <CheckCircle2 className="w-20 h-20 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold">Answer Submitted!</h2>
                    <p className="text-slate-400">Waiting for other groups...</p>

                    <Card className="bg-slate-900 border-slate-800 mt-8 text-left max-w-sm w-full mx-auto">
                        <CardHeader><CardTitle className="text-sm text-slate-400">Your Selection</CardTitle></CardHeader>
                        <CardContent>
                            <p className="font-semibold text-lg">{selectedOption}</p>
                            <p className="text-slate-500 text-sm mt-2 italic">"{justification}"</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 pb-20">
            <div className="max-w-xl mx-auto space-y-6">

                {/* Method Header */}
                <div className="space-y-2 text-center">
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider">
                        Group {group.group_number}
                    </span>
                    <h1 className="text-2xl font-bold">{method.title}</h1>
                    <p className="text-slate-400 text-sm">{method.description}</p>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5 text-left text-sm text-slate-200 leading-relaxed shadow-inner">
                        <span className="text-indigo-400 font-bold block mb-1">SCENARIO:</span>
                        {method.scenarioText}
                    </div>
                </div>

                {/* Scenario/Cases Display */}
                {method.id === 'nested' ? (
                    <div className="rounded-xl border border-white/10 overflow-hidden bg-slate-900/50 shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-xs font-semibold">
                                    <tr>
                                        <th className="p-4 border-b border-white/10">Larger Case<br /><span className="normal-case opacity-50">(Nested Context)</span></th>
                                        <th className="p-4 border-b border-white/10">Nested Case<br /><span className="normal-case opacity-50">(Faculty)</span></th>
                                        <th className="p-4 border-b border-white/10 w-1/3">Controlled Factors<br /><span className="normal-case opacity-50">(Already Nested)</span></th>
                                        <th className="p-4 border-b border-white/10">Class Size</th>
                                        <th className="p-4 border-b border-white/10">Student Organization Strength</th>
                                        <th className="p-4 border-b border-white/10">Student Protest</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {method.cases.map((c) => (
                                        <tr key={c.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 text-slate-300">Same University</td>
                                            <td className="p-4 font-medium text-white">{c.label}</td>
                                            <td className="p-4 text-slate-400 text-xs leading-relaxed">
                                                Attendance policy, tuition fees, exam rules, grading system, university leadership
                                            </td>
                                            <td className="p-4 text-slate-300">Large</td>
                                            <td className="p-4 text-slate-300">
                                                {c.conditions['Student Org Strength (Strong)'] ? 'Strong' : 'Weak'}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.outcome
                                                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                        : 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                    }`}>
                                                    {c.outcome ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {method.cases.map((c) => (
                            <Card key={c.id} className="bg-slate-900 border-slate-800 overflow-hidden">
                                <CardHeader className="bg-slate-800/50 pb-2">
                                    <CardTitle className="text-base flex justify-between items-center text-white">
                                        {c.label}
                                        {/* Outcome Badge */}
                                        <span className={c.outcome ? "text-red-400 text-sm" : "text-green-400 text-sm"}>
                                            {c.outcome ? "LATE (Yes)" : "ON TIME (No)"}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-2 text-sm">
                                    {Object.entries(c.conditions).map(([key, value]) => (
                                        <div key={key} className="flex justify-between border-b border-white/5 py-1 last:border-0">
                                            <span className="text-slate-400">{key}</span>
                                            <span className={value ? "text-white font-medium" : "text-slate-600"}>
                                                {value ? "Yes" : "No"}
                                            </span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Question Form */}
                <Card className="bg-indigo-900/10 border-indigo-500/30">
                    <CardHeader>
                        <CardTitle className="text-lg text-indigo-300">{method.question}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <RadioGroup onValueChange={setSelectedOption} className="space-y-3">
                            {method.options.map((opt) => (
                                <div key={opt} className="flex items-center space-x-2 bg-slate-900/50 p-3 rounded-lg border border-white/5 hover:border-indigo-500/50 transition">
                                    <RadioGroupItem value={opt} id={opt} className="text-indigo-400 border-slate-600" />
                                    <Label htmlFor={opt} className="flex-1 cursor-pointer text-slate-200">{opt}</Label>
                                </div>
                            ))}
                        </RadioGroup>

                        <div className="space-y-2">
                            <Label>One sentence justification</Label>
                            <Textarea
                                placeholder="I chose this because..."
                                className="bg-slate-950 border-slate-700 focus:border-indigo-500 text-white placeholder:text-slate-400"
                                value={justification}
                                onChange={(e) => setJustification(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-500 h-12 text-lg font-semibold shadow-lg shadow-indigo-900/20"
                            onClick={handleSubmit}
                            disabled={!selectedOption}
                        >
                            Submit Answer
                        </Button>
                    </CardFooter>
                </Card>

            </div>
        </div>
    );
}
