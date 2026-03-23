"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { WavyBackground } from "../ui/wavy-background";
import { BRAND_NAME } from "@/app/Utils/Constants/Brandname";
import { Button } from "../ui/button";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden selection:bg-primary selection:text-white">
      {/* Header Pipeline */}
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Placeholder */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">L</span>
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  {BRAND_NAME}
                </span>
              </Link>
            </div>

            {/* Navigation / CTAs */}
            <div className="flex items-center space-x-4">
              <Link href="/Auth/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/Auth/register">
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <WavyBackground className="max-w-4xl mx-auto pb-40" backgroundFill="black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center px-4"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            The Ultimate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              LMS Platform
            </span>
          </h1>
          <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Scale your institute with our powerful, multi-tenant learning management system. 
            Manage students, trainers, and batches all in one seamless dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/Auth/register">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full bg-white text-black hover:bg-gray-200 transition-all">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/Auth/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full border-white/20 text-white hover:bg-white/10 transition-all">
                Sign In
              </Button>
            </Link>
          </div>
        </motion.div>
      </WavyBackground>
    </div>
  );
}
