"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BRAND_NAME } from "@/app/Utils/Constants/Brandname";
import { ArrowRight, Sparkles, Building2, Users, LayoutDashboard } from "lucide-react";

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
                  <span className="text-white font-extrabold text-2xl tracking-tighter">L</span>
                </div>
                <span className="text-2xl font-black text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-gray-400 tracking-tight">
                  {BRAND_NAME}
                </span>
              </Link>
            </div>

            {/* Navigation / CTAs */}
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Link href="/Auth/login" className="hidden sm:inline-block text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/Auth/register">
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 dark:bg-white hover:bg-indigo-600 dark:hover:bg-indigo-400 text-white dark:text-slate-900 hover:text-white dark:hover:text-slate-900 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 group">
                  <span className="text-sm font-bold">
                    Get Started
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center relative z-10 px-4 pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="max-w-5xl mx-auto w-full flex flex-col items-center text-center">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center w-full"
          >
            {/* New Announcement Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm font-semibold tracking-wide mb-8 shadow-sm cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-500/20 transition-colors">
              <Sparkles className="w-4 h-4" />
              <span>Introducing the Ultimate Multi-Tenant Core</span>
            </div>

            {/* Hero Headline */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:to-white/60 tracking-tighter leading-[1.1] mb-8">
              Scale Your Institute <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                Without Limits
              </span>
            </h1>

            {/* Hero Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-gray-400 font-medium max-w-3xl mx-auto leading-relaxed mb-12">
              The all-in-one powerful learning management system designed for modern educators. 
              Manage multiple branches, trainers, and thousands of students natively from a single, seamless dashboard.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full max-w-lg mx-auto">
              <Link href="/Auth/register" className="w-full sm:w-auto">
                <button className="w-full flex items-center justify-center gap-2 text-lg font-bold px-8 py-4 bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white rounded-2xl shadow-[0_8px_30px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_40px_rgba(79,70,229,0.5)] transition-all duration-300 hover:-translate-y-1">
                  Start Free Trial
                </button>
              </Link>
              <Link href="/Auth/login" className="w-full sm:w-auto">
                <button className="w-full flex items-center justify-center gap-2 text-lg font-bold px-8 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl shadow-sm hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                  Sign In to Dashboard
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Social Proof / Feature Micro-Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-12 max-w-4xl mx-auto w-full px-4 border-t border-slate-200 dark:border-white/10 pt-16"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-200 dark:ring-white/10 mb-2">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-lg">Multi-Tenant Core</h3>
              <p className="text-slate-500 dark:text-gray-400 text-sm">Every institute operates securely in perfect database isolation.</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center ring-1 ring-purple-200 dark:ring-white/10 mb-2">
                <LayoutDashboard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-lg">Automated Scoping</h3>
              <p className="text-slate-500 dark:text-gray-400 text-sm">Zero chance of cross-institute data leaks with context layers.</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center ring-1 ring-indigo-200 dark:ring-white/10 mb-2">
                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-lg">Limitless Scale</h3>
              <p className="text-slate-500 dark:text-gray-400 text-sm">Seamlessly handle massive concurrency and heavy API loads.</p>
            </div>
          </motion.div>
          
        </div>
      </main>
    </div>
  );
}
