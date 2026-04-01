"use client";
import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, UserCog, Building2, ArrowRight, Users } from "lucide-react";
import Link from "next/link";

export default function SharedLoginPortal() {
  const portals = [
    {
      title: "Student Portal",
      description: "Access your courses, materials, and track your progress.",
      link: "/Auth/student",
      icon: <GraduationCap className="h-10 w-10 text-blue-600 dark:text-cyan-400 stroke-[1.5] drop-shadow-[0_2px_4px_rgba(59,130,246,0.2)]" />,
      iconBg: "bg-blue-50 dark:bg-white/5 ring-blue-100 dark:ring-white/10",
      topBorder: "border-t-blue-500 dark:border-t-blue-500/30",
      shadow: "shadow-blue-500/5 group-hover:shadow-[0_12px_40px_rgb(59,130,246,0.15)] dark:group-hover:shadow-[0_8px_30px_rgb(59,130,246,0.2)]",
      border: "group-hover:border-blue-500/50",
    },
    {
      title: "Trainer Portal",
      description: "Manage your batches, students, and conduct live sessions.",
      link: "/Auth/trainer",
      icon: <UserCog className="h-10 w-10 text-purple-600 dark:text-fuchsia-400 stroke-[1.5] drop-shadow-[0_2px_4px_rgba(168,85,247,0.2)]" />,
      iconBg: "bg-purple-50 dark:bg-white/5 ring-purple-100 dark:ring-white/10",
      topBorder: "border-t-purple-500 dark:border-t-purple-500/30",
      shadow: "shadow-purple-500/5 group-hover:shadow-[0_12px_40px_rgb(168,85,247,0.15)] dark:group-hover:shadow-[0_8px_30px_rgb(168,85,247,0.2)]",
      border: "group-hover:border-purple-500/50",
    },
    {
      title: "Institute Admin",
      description: "Manage LMS operations, financials, and staff controls.",
      link: "/Auth/admin/login",
      icon: <Building2 className="h-10 w-10 text-indigo-600 dark:text-violet-400 stroke-[1.5] drop-shadow-[0_2px_4px_rgba(99,102,241,0.2)]" />,
      iconBg: "bg-indigo-50 dark:bg-white/5 ring-indigo-100 dark:ring-white/10",
      topBorder: "border-t-indigo-500 dark:border-t-indigo-500/30",
      shadow: "shadow-indigo-500/5 group-hover:shadow-[0_12px_40px_rgb(99,102,241,0.15)] dark:group-hover:shadow-[0_8px_30px_rgb(99,102,241,0.2)]",
      border: "group-hover:border-indigo-500/50",
    },
    {
      title: "Staff / Employee",
      description: "Access your CRM, admissions, and administration tools.",
      link: "/Auth/employee",
      icon: <Users className="h-10 w-10 text-emerald-600 dark:text-teal-400 stroke-[1.5] drop-shadow-[0_2px_4px_rgba(16,185,129,0.2)]" />,
      iconBg: "bg-emerald-50 dark:bg-white/5 ring-emerald-100 dark:ring-white/10",
      topBorder: "border-t-emerald-500 dark:border-t-emerald-500/30",
      shadow: "shadow-emerald-500/5 group-hover:shadow-[0_12px_40px_rgb(16,185,129,0.15)] dark:group-hover:shadow-[0_8px_30px_rgb(16,185,129,0.2)]",
      border: "group-hover:border-emerald-500/50",
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-slate-50 dark:bg-black overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Premium Background Gradients */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className="inline-block py-1.5 px-4 rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm font-semibold tracking-wider uppercase mb-6 shadow-sm">
            Welcome Back
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:to-white/60 tracking-tight mb-6">
            Select Your Portal
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-lg max-w-xl mx-auto font-medium">
            Choose your role to securely access your personalized dashboard and tools.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-2 md:px-0">
          {portals.map((portal, index) => (
            <Link href={portal.link} key={portal.title} className="block w-full h-full outline-none focus:ring-4 focus:ring-indigo-500/50 rounded-3xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                className={`group relative h-full bg-white dark:bg-gradient-to-b dark:from-zinc-900/80 dark:to-black border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 md:p-10 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 shadow-xl dark:shadow-none hover:shadow-2xl ${portal.shadow} ${portal.border} border-t-4 dark:border-t-2 ${portal.topBorder}`}
              >
                {/* Internal Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-transparent dark:from-white/[0.02] dark:to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className={`relative z-10 mb-8 p-4 rounded-full ring-1 group-hover:scale-110 transition-transform duration-300 ${portal.iconBg}`}>
                  {portal.icon}
                </div>

                <div className="relative z-10 flex-grow flex flex-col items-center">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 tracking-wide group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {portal.title}
                  </h3>
                  <p className="text-slate-500 dark:text-gray-400 text-sm md:text-base font-medium leading-relaxed mb-8 flex-grow">
                    {portal.description}
                  </p>
                </div>

                <div className="relative z-10 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mt-auto">
                  <span>Enter Portal</span>
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
