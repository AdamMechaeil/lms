"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { WavyBackground } from "../ui/wavy-background";
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
    <WavyBackground className="max-w-7xl mx-auto pb-40" backgroundFill="black">
      <div className="text-center mb-16 px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold text-white mb-4"
        >
          Choose Your Perfect Plan
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-gray-400 text-lg max-w-2xl mx-auto"
        >
          Scale your institute effortlessly. Select the limits that fit your
          current needs and upgrade anytime.
        </motion.p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`relative bg-white/5 dark:bg-black/60 backdrop-blur-xl border ${
                plan.price > 0 ? "border-primary" : "border-white/10"
              } rounded-3xl p-8 flex flex-col`}
            >
              {plan.price > 0 && (
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-4">
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-5xl font-extrabold text-white">
                  {plan.price === 0 ? "Free" : `₹${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-gray-400 font-medium">
                    /{plan.billingCycle}
                  </span>
                )}
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center text-gray-300">
                  <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <span>Up to {plan.features.maxStudents} Students</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <span>{plan.features.maxStorageGB}GB Storage</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <span>
                    {plan.features.customDomain
                      ? "Custom Domain Included"
                      : "Standard Subdomain"}
                  </span>
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <span>Full Dashboard Access</span>
                </li>
              </ul>

              <Button
                size="lg"
                disabled={activatingPlanId !== null}
                onClick={() => handleSelectPlan(plan._id)}
                className={`w-full py-6 text-lg rounded-xl font-semibold transition-all ${
                  plan.price > 0
                    ? "bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:shadow-[0_0_20px_rgba(124,58,237,0.6)]"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                {activatingPlanId === plan._id ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : plan.price === 0 ? (
                  "Start Free"
                ) : (
                  "Choose Plan"
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </WavyBackground>
  );
}
