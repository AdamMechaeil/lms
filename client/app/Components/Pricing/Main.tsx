"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { GetPlans, ActivateSubscription } from "@/app/Services/Auth";
import { toast } from "sonner";
import { useAuth } from "@/app/Context/Authcontext";
import { useRouter } from "next/navigation";

interface Plan {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: string;
  features: {
    maxStudents: number;
    maxStorageGB: number;
    customDomain: boolean;
  };
}

export default function PricingMain() {
  const { user } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingPlanId, setActivatingPlanId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await GetPlans();
        setPlans(data);
      } catch (error: any) {
        toast.error(error || "Failed to load plans");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      toast.error("Please log in to select a plan");
      return;
    }

    try {
      setActivatingPlanId(planId);
      await ActivateSubscription(planId);
      toast.success("Subscription Activated Successfully!");
      setTimeout(() => {
        router.push("/Dashboard/admin");
      }, 1000);
    } catch (error: any) {
      toast.error(error || "Failed to activate subscription");
      setActivatingPlanId(null);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-50 dark:bg-black overflow-hidden flex flex-col items-center py-24 selection:bg-indigo-500/30">
      {/* Background gradients */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="text-center mb-20 px-4 relative z-10 w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm font-semibold tracking-wider uppercase mb-6 shadow-sm">
            Pricing Plans
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:to-white/60 tracking-tight mb-8">
            Choose Your Perfect Plan
          </h1>
          <p className="text-slate-600 dark:text-gray-400/90 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Scale your institute seamlessly. Select the limits that fit your
            current operations and securely upgrade anytime as you grow.
          </p>
        </motion.div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh] relative z-10">
          <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr gap-8 px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-screen-2xl mx-auto">
          {plans.map((plan, index) => {
            const isPremium = plan.price > 0;
            return (
              <motion.div
                key={plan._id || index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                className={`group relative rounded-[2rem] p-8 flex flex-col transition-all duration-300 ${
                  isPremium
                    ? "bg-white dark:bg-gradient-to-b dark:from-gray-900/90 dark:to-black border-2 border-indigo-500/20 dark:border-indigo-500/40 shadow-xl shadow-indigo-500/5 dark:shadow-[0_8px_30px_rgb(99,102,241,0.15)] hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/40 dark:hover:shadow-[0_8px_40px_rgb(99,102,241,0.3)] hover:-translate-y-2"
                    : "bg-white dark:bg-gradient-to-b dark:from-zinc-900/80 dark:to-black border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-lg dark:shadow-none hover:-translate-y-2"
                }`}
              >
                {/* Premium Glow Effect inside card */}
                {isPremium && (
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-500/10 dark:to-transparent rounded-[2rem] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                )}

                {isPremium && (
                  <div className="absolute -top-4 inset-x-0 mx-auto w-max px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 ring-4 ring-white dark:ring-gray-900 shadow-sm z-20">
                    <span className="text-white text-xs font-bold tracking-widest uppercase">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-8 relative z-10">
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-wide">
                    {plan.name}
                  </h3>
                  <p className="text-slate-500 dark:text-gray-400 text-sm md:text-base font-medium leading-relaxed min-h-[3rem]">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-10 flex items-baseline gap-2 relative z-10">
                  <span className={`text-5xl md:text-6xl font-extrabold ${isPremium ? 'text-indigo-600 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-gray-300' : 'text-slate-900 dark:text-white'}`}>
                    {plan.price === 0 ? "Free" : `₹${plan.price}`}
                  </span>
                  {isPremium && (
                    <span className="text-slate-400 dark:text-gray-500 font-semibold text-lg uppercase tracking-wide">
                      /{plan.billingCycle}
                    </span>
                  )}
                </div>

                <ul className="space-y-5 mb-10 flex-1 relative z-10">
                  <li className="flex items-start text-slate-600 dark:text-gray-300 group/feature">
                    <div className={`mt-1 mr-4 rounded-full p-1 ${isPremium ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 group-hover/feature:bg-indigo-200 dark:group-hover/feature:bg-indigo-500/40 group-hover/feature:text-indigo-700 dark:group-hover/feature:text-indigo-300' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-gray-400 group-hover/feature:bg-slate-200 dark:group-hover/feature:bg-white/20 group-hover/feature:text-slate-700 dark:group-hover/feature:text-white'} transition-colors`}>
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </div>
                    <span className="font-medium text-[15px]">Up to <strong className="text-slate-900 dark:text-white">{plan.features.maxStudents}</strong> Students</span>
                  </li>
                  <li className="flex items-start text-slate-600 dark:text-gray-300 group/feature">
                    <div className={`mt-1 mr-4 rounded-full p-1 ${isPremium ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 group-hover/feature:bg-indigo-200 dark:group-hover/feature:bg-indigo-500/40 group-hover/feature:text-indigo-700 dark:group-hover/feature:text-indigo-300' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-gray-400 group-hover/feature:bg-slate-200 dark:group-hover/feature:bg-white/20 group-hover/feature:text-slate-700 dark:group-hover/feature:text-white'} transition-colors`}>
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </div>
                    <span className="font-medium text-[15px]"><strong className="text-slate-900 dark:text-white">{plan.features.maxStorageGB}GB</strong> Storage</span>
                  </li>
                  <li className="flex items-start text-slate-600 dark:text-gray-300 group/feature">
                    <div className={`mt-1 mr-4 rounded-full p-1 ${isPremium ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 group-hover/feature:bg-indigo-200 dark:group-hover/feature:bg-indigo-500/40 group-hover/feature:text-indigo-700 dark:group-hover/feature:text-indigo-300' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-gray-400 group-hover/feature:bg-slate-200 dark:group-hover/feature:bg-white/20 group-hover/feature:text-slate-700 dark:group-hover/feature:text-white'} transition-colors`}>
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </div>
                    <span className="font-medium text-[15px]">
                      {plan.features.customDomain
                        ? <strong className="text-slate-900 dark:text-white">Custom Domain Included</strong>
                        : "Standard Subdomain"}
                    </span>
                  </li>
                  <li className="flex items-start text-slate-600 dark:text-gray-300 group/feature">
                    <div className={`mt-1 mr-4 rounded-full p-1 ${isPremium ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 group-hover/feature:bg-indigo-200 dark:group-hover/feature:bg-indigo-500/40 group-hover/feature:text-indigo-700 dark:group-hover/feature:text-indigo-300' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-gray-400 group-hover/feature:bg-slate-200 dark:group-hover/feature:bg-white/20 group-hover/feature:text-slate-700 dark:group-hover/feature:text-white'} transition-colors`}>
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </div>
                    <span className="font-medium text-[15px]">Full Dashboard Access</span>
                  </li>
                </ul>

                <Button
                  size="lg"
                  disabled={activatingPlanId !== null}
                  onClick={() => handleSelectPlan(plan._id)}
                  className={`relative z-10 w-full py-7 text-lg rounded-2xl font-bold tracking-wide transition-all duration-300 overflow-hidden ${
                    isPremium
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md dark:shadow-[0_0_20px_rgba(79,70,229,0.4)] dark:hover:shadow-[0_0_30px_rgba(79,70,229,0.7)] hover:scale-[1.02]"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 dark:border-none dark:bg-white/10 dark:hover:bg-white/20 dark:text-white hover:scale-[1.02]"
                  }`}
                >
                  {activatingPlanId === plan._id ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {user ? "Activating..." : "Redirecting..."}
                    </span>
                  ) : (
                    <span>{plan.price === 0 ? "Get Started for Free" : "Upgrade to " + plan.name}</span>
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
