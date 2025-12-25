'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Users, Presentation, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background Animated Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl opacity-50"
        />
        <motion.div
          animate={{ x: [0, -70, 0], y: [0, 100, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 right-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl opacity-50"
        />
      </div>

      <Card className="w-full max-w-4xl bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl z-10 text-white">
        <CardHeader className="text-center space-y-4 pb-2">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-indigo-500/20 rounded-2xl ring-1 ring-indigo-400/50">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
            </div>
            <CardTitle className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Comparative Methods Live Lab
            </CardTitle>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Interactive case study analysis: Difference, Agreement, Nested, and QCA.
            </p>
          </motion.div>
        </CardHeader>
        <CardContent className="p-8 md:p-12 grid md:grid-cols-2 gap-8">

          {/* Student Entry */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
            <div className="relative h-full bg-slate-900/50 border border-white/10 rounded-xl p-6 flex flex-col items-center text-center space-y-4 hover:border-blue-500/50 transition duration-300">
              <div className="p-4 bg-blue-500/10 rounded-full text-blue-400">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">Join As Student</h3>
              <p className="text-slate-400 text-sm">
                Scan a QR code or enter a session ID to join your group and submit answers.
              </p>
              <div className="pt-4 w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20" size="lg">
                  Scan QR Code
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Presenter Entry */}
          <Link href="/presenter" className="block focus:outline-none">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="group relative cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="relative h-full bg-slate-900/50 border border-white/10 rounded-xl p-6 flex flex-col items-center text-center space-y-4 hover:border-amber-500/50 transition duration-300">
                <div className="p-4 bg-amber-500/10 rounded-full text-amber-400">
                  <Presentation className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold">Presenter Panel</h3>
                <p className="text-slate-400 text-sm">
                  Manage session, reveal results, and control the projector view.
                </p>
                <div className="pt-4 w-full">
                  <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-white hover:text-amber-400 group-hover:border-amber-500/50" size="lg">
                    Open Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </Link>

        </CardContent>
      </Card>

      <div className="absolute bottom-4 text-slate-600 text-sm">
        Built for Comparative Politics • Next.js 14
      </div>
    </main>
  );
}
