'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';

export default function Home() {
  // 🛠️ FIX: Added 'as const' at the end to lock exact string definitions for TypeScript!
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' as const }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white">
      <Navbar />

      {/* 🚀 HERO SECTION */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-white border-b border-slate-100">
        {/* Subtle Background Decorative Graphic Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div {...fadeInUp}>
              <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 mb-6">
                ✨ Next-Gen Fuel Management Platform
              </span>
            </motion.div>

            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Skip the Lines. <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Refuel Smarter with FuelEase
              </span>
            </motion.h1>

            <motion.p 
              className="text-lg text-slate-600 mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Real-time automated scheduling for smart city fuel hubs. Secure your queue position, manage corporate fuel distribution timelines, and tracking allocations instantly.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Link href="/stations" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 active:scale-98 transition transform duration-200 text-center">
                Find Nearest Station
              </Link>
              <Link href="#features" className="w-full sm:w-auto px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition active:scale-98 text-center">
                Explore Analytics
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 📊 PLATFORM REAL-TIME DATA STATS BANNER */}
      <section className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-blue-400">99.9%</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 uppercase tracking-wider font-semibold">Pump Uptime</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-blue-400">12 mins</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 uppercase tracking-wider font-semibold">Avg. Saved Time</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-blue-400">5,000+</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 uppercase tracking-wider font-semibold">Active Drivers</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-blue-400">0 ms</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 uppercase tracking-wider font-semibold">Sync Latency</p>
            </div>
          </div>
        </div>
      </section>

      {/* ⚡ FEATURES GRID SECTION */}
      <section id="features" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-4">
            Engineered for Efficient Logistics
          </h2>
          <p className="text-slate-600">
            A full-stack architecture built to optimize smart-city distribution bottlenecks using precision scheduling variables.
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Card 1 */}
          <motion.div variants={fadeInUp} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              ⛽
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Pump Allocations</h3>
            <p className="text-slate-600 leading-relaxed">
              Live monitoring maps matching available dispensers directly with vehicle reservation structures to completely eliminate physical queue friction.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={fadeInUp} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
              ⏰
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Time-Window Locking</h3>
            <p className="text-slate-600 leading-relaxed">
              Robust relational transactions executing programmatic slot collisions management checks, making double-booking programmatically impossible.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={fadeInUp} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
              🔔
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Notification Logs</h3>
            <p className="text-slate-600 leading-relaxed">
              Automated dispatch reminders mapping background processes with email confirmation APIs directly when a slot is secured.
            </p>
          </motion.div>
        </motion.div>
      </section> 
    </div>
  );
}