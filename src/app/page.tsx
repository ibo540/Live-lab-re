'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LiquidGradient } from '@/components/liquid-gradient';
import { Sparkles, Users, MonitorPlay, ArrowRight, LayoutGrid, X } from 'lucide-react';

export default function LandingPage() {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">

      {/* Background Animated Blobs */}
      {/* Liquid Gradient Background */}
      <LiquidGradient />

      {/* Dashboard Toggle Button */}
      <button
        onClick={() => setShowDashboard(true)}
        className="absolute top-6 left-6 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white/50 hover:text-white transition duration-300 backdrop-blur-md border border-white/5 shadow-lg group"
      >
        <LayoutGrid className="w-6 h-6 group-hover:scale-110 transition duration-300" />
      </button>

      {/* Dashboard Overlay */}
      <AnimatePresence>
        {showDashboard && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-40 bg-slate-950/80 flex items-center justify-center p-8 overflow-y-auto"
            onClick={() => setShowDashboard(false)}
          >
            <div className="relative w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
              {/* Close Button */}
              <button
                onClick={() => setShowDashboard(false)}
                className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition"
              >
                <X className="w-8 h-8" />
              </button>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* Projector Card */}
                <Link href="/projector" className="group">
                  <Card className="h-full bg-white/5 border-white/10 hover:border-teal-400/50 hover:bg-white/10 transition duration-300">
                    <CardHeader>
                      <Users className="w-8 h-8 text-teal-400 mb-2" />
                      <CardTitle className="text-xl text-white">Projector View</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-400 text-sm">Open the public display for students to scan QR codes and see results.</p>
                    </CardContent>
                  </Card>
                </Link>

                {/* Method 1: Difference */}
                <Card className="bg-white/5 border-white/10 hover:border-indigo-400/50 transition duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg text-indigo-300">Method of Difference</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-sm">Compare two similar cases with different outcomes to find the cause.</p>
                  </CardContent>
                </Card>

                {/* Method 2: Agreement */}
                <Card className="bg-white/5 border-white/10 hover:border-purple-400/50 transition duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg text-purple-300">Method of Agreement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-sm">Find the common factor across different cases with the same outcome.</p>
                  </CardContent>
                </Card>

                {/* Method 3: Nested */}
                <Card className="bg-white/5 border-white/10 hover:border-pink-400/50 transition duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg text-pink-300">Nested Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-sm">Combine Large-N statistical data with Small-N in-depth case studies.</p>
                  </CardContent>
                </Card>

                {/* Method 4: QCA */}
                <Card className="md:col-span-2 bg-white/5 border-white/10 hover:border-amber-400/50 transition duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg text-amber-300">Qualitative Comparative Analysis (QCA)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-sm">Analyze complex causal combinations using boolean logic and truth tables.</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="w-full max-w-4xl bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl z-10 text-white">
        <CardHeader className="space-y-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <CardTitle className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-2">
              Comparative Methods Live Lab
            </CardTitle>


          </motion.div>
        </CardHeader>
        <CardContent className="p-8 md:p-12 flex justify-center">

          {/* Presenter Entry - Centered */}
          <Link href="/presenter" className="block focus:outline-none w-full max-w-md">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="group relative cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="animated-border relative h-full bg-slate-900/50 border border-white/10 rounded-xl p-8 flex flex-col items-center text-center space-y-6 hover:border-amber-500/50 transition duration-300">
                <div className="p-4 bg-white/5 rounded-2xl ring-1 ring-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  <MonitorPlay className="w-10 h-10 text-white drop-shadow-md" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-wide">Presenter Panel</h3>

                {/* Moved Subtitle */}
                <motion.div
                  className="flex flex-wrap justify-center gap-x-1 max-w-sm mx-auto"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
                    hidden: {}
                  }}
                >
                  {"Interactive case study analysis: Difference, Agreement, Nested, and QCA.".split(" ").map((word, i) => (
                    <motion.span
                      key={i}
                      variants={{
                        hidden: { y: 10, opacity: 0 },
                        visible: { y: 0, opacity: 1 }
                      }}
                      className="text-sm font-medium text-slate-300"
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.div>

                <div className="pt-2 w-full">
                  <Button variant="outline" className="w-full border-white/10 bg-white/90 text-slate-900 hover:bg-white hover:text-black font-semibold shadow-lg group-hover:border-amber-500/50" size="lg">
                    Open Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </Link>

        </CardContent>
      </Card>

      <div className="absolute bottom-6 flex flex-col items-center gap-1 z-20">
        <div className="text-slate-500 text-sm font-medium tracking-wide">
          Designed & Built by <span className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors cursor-default">Ibrahim Al-ksibati</span>
        </div>
      </div>
    </main>
  );
}
