"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BRAND_NAME } from "@/app/Utils/Constants/Brandname";
import MainFooter from "../Shared/Footer/MainFooter";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Video,
  DollarSign,
  Globe,
  Lock,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full bg-slate-50 dark:bg-black overflow-hidden flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Background gradients */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 border-b border-slate-200/50 dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                  <span className="text-white font-extrabold text-2xl tracking-tighter">
                    {BRAND_NAME.charAt(0)}
                  </span>
                </div>
                <span className="text-2xl font-black text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-gray-400 tracking-tight">
                  {BRAND_NAME}
                </span>
              </Link>
            </div>

            {/* Navigation / CTAs */}
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Link
                href="/Auth/login"
                className="hidden sm:inline-block text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link href="/Auth/register">
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 dark:bg-white hover:bg-indigo-600 dark:hover:bg-indigo-400 text-white dark:text-slate-900 hover:text-white dark:hover:text-slate-900 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 group">
                  <span className="text-sm font-bold">Start Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start relative z-10 pt-32 sm:pt-40">
        {/* HERO SECTION */}
        <section className="w-full px-4 text-center max-w-5xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center w-full"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm font-bold tracking-wide mb-8 shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>Ditch the 10% revenue cuts. Take back control.</span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:to-white/60 tracking-tighter leading-[1.1] mb-8">
              Launch Your Academy <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                In Minutes
              </span>
            </h1>

            <p className="text-lg sm:text-2xl text-slate-600 dark:text-gray-400 font-medium max-w-3xl mx-auto leading-relaxed mb-12">
              The affordable, powerful alternative to expensive legacy
              platforms. All you need is your existing{" "}
              <strong className="text-indigo-600 dark:text-indigo-400">
                Google Workspace
              </strong>{" "}
              account and you&apos;re good to go.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full max-w-lg mx-auto">
              <Link href="/Auth/register" className="w-full sm:w-auto">
                <button className="w-full flex items-center justify-center gap-2 text-lg font-bold px-8 py-4 bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white rounded-2xl shadow-[0_8px_30px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_40px_rgba(79,70,229,0.5)] transition-all duration-300 hover:-translate-y-1">
                  Start Free Trial
                </button>
              </Link>
              <Link href="/Pricing" className="w-full sm:w-auto">
                <button className="w-full flex items-center justify-center gap-2 text-lg font-bold px-8 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl shadow-sm hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                  View Pricing
                </button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* BENTO GRID USPs */}
        <section className="w-full max-w-7xl mx-auto px-4 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Feature 1: Google Workspace */}
            <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-white dark:bg-neutral-900 border border-slate-300 dark:border-white/10 p-8 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Video className="w-32 h-32 text-indigo-500" />
              </div>
              <div className="relative z-10 max-w-md">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-6">
                  <Video className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  Google Workspace Native
                </h3>
                <p className="text-slate-600 dark:text-gray-400 text-lg leading-relaxed">
                  No new tools to learn. {BRAND_NAME} integrates seamlessly with
                  your existing Google ecosystem. Schedule meets, share drives,
                  and run your academy seamlessly.
                </p>
              </div>
            </div>

            {/* Feature 2: Affordability */}
            <div className="md:col-span-1 relative overflow-hidden rounded-3xl border border-slate-300 dark:border-white/10 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 sm:p-10 shadow-xl group">
              <div className="absolute -bottom-6 -right-6 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
                <DollarSign className="w-40 h-40 text-white" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Unbeatable Affordability
                </h3>
                <p className="text-indigo-100 text-lg">
                  Stop paying massive 10% cuts to legacy platforms. We offer
                  flat, predictable subscription rates that save you thousands.
                </p>
              </div>
            </div>
            {/* Feature 3: White label */}
            <div className="md:col-span-1 relative overflow-hidden rounded-3xl border border-slate-300 dark:border-white/10 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/10 p-8 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                100% White-Labeled
              </h3>
              <p className="text-slate-600 dark:text-gray-400">
                Your brand, your logo. Provide a standalone, premium portal
                experience to your students without our watermark.
              </p>
            </div>
            {/* Feature 4: Security */}
            <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/10 p-8 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-6">
                <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Your Brand, Our Security
              </h3>
              <p className="text-slate-600 dark:text-gray-400 text-lg max-w-2xl">
                Operate your institute with total peace of mind. You get to keep
                your unique branding and name, backed securely by our rock-solid
                enterprise architecture.
              </p>
            </div>
          </motion.div>
        </section>

        {/* COMPARISON SECTION */}
        <section className="w-full max-w-5xl mx-auto px-4 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-6">
              Why {BRAND_NAME}?
            </h2>
            <p className="text-xl text-slate-600 dark:text-gray-400">
              See how we stack up against expensive legacy platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Rest */}
            <div className="rounded-3xl p-8 bg-slate-100 dark:bg-neutral-900/50 border border-slate-300 dark:border-white/5 opacity-80">
              <h3 className="text-2xl font-bold text-slate-500 mb-8 border-b border-slate-300 dark:border-white/10 pb-4">
                Expensive Alternatives
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-3 text-slate-600 dark:text-gray-400">
                  <span className="mt-1 flex-shrink-0 text-red-400 border border-red-400 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    X
                  </span>
                  <span>
                    <strong>10% Revenue Splits:</strong> They literally punish
                    you for scaling.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-slate-600 dark:text-gray-400">
                  <span className="mt-1 flex-shrink-0 text-red-400 border border-red-400 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    X
                  </span>
                  <span>
                    <strong>Clunky Tech:</strong> Forced to use their unfamiliar
                    video platforms.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-slate-600 dark:text-gray-400">
                  <span className="mt-1 flex-shrink-0 text-red-400 border border-red-400 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    X
                  </span>
                  <span>
                    <strong>Hidden Costs:</strong> Storage fees and bandwidth
                    overages.
                  </span>
                </li>
              </ul>
            </div>

            {/* Modern Sensei */}
            <div className="rounded-3xl p-8 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-500 relative shadow-2xl shadow-indigo-500/20">
              <div className="absolute -top-4 right-8 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Our Approach
              </div>
              <h3 className="text-2xl font-bold text-indigo-900 dark:text-indigo-300 mb-8 border-b border-indigo-200 dark:border-indigo-500/30 pb-4">
                {BRAND_NAME}
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-3 text-indigo-900 dark:text-indigo-100">
                  <CheckCircle2 className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                  <span>
                    <strong>$0 Revenue Cuts:</strong> You keep exactly 100% of
                    what you earn.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-indigo-900 dark:text-indigo-100">
                  <CheckCircle2 className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                  <span>
                    <strong>Google Native:</strong> Use the Google Workspace
                    layout you already master.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-indigo-900 dark:text-indigo-100">
                  <CheckCircle2 className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                  <span>
                    <strong>Transparent Pricing:</strong> Simple monthly
                    subscription. Zero hidden fees.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <MainFooter />
    </div>
  );
}
