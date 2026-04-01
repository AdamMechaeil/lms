"use client";
import React, { useEffect, useState } from "react";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { Button } from "@/app/Components/ui/button";
import { Input } from "@/app/Components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/Components/ui/dialog";
import { toast } from "sonner";
import { Loader2, IndianRupee, CreditCard, Receipt, FileText } from "lucide-react";
import { format } from "date-fns";
import { getMyFinancials, createStudentRazorpayOrder, verifyStudentPayment } from "@/app/Services/Fee";
import { useAuth } from "@/app/Context/Authcontext";

export default function StudentFeesPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const response = await getMyFinancials();
      setData(response);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setData(null);
      } else {
        toast.error("Failed to load your financial history");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(payAmount);
    if (!amountNum || amountNum <= 0) return toast.error("Please enter a valid amount.");
    if (amountNum > data?.remainingBalance) return toast.error(`Cannot pay more than outstanding balance (₹${data?.remainingBalance})`);
    
    setIsProcessing(true);

    try {
      // 1. Generate Razorpay Order
      const res = await createStudentRazorpayOrder(amountNum);
      const { order, feeStructureId } = res;

      // 2. Initialize Gateway Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: order.amount,
        currency: order.currency,
        name: user?.name,
        description: `Installment Payment against Fee Structure`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verificationPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              feeStructureId,
              amountPaid: amountNum,
            };
            
            await verifyStudentPayment(verificationPayload);
            toast.success("Payment successful! Receipt generated.");
            setIsPayModalOpen(false);
            setPayAmount("");
            fetchFinancials();
          } catch (verifyError: any) {
            toast.error(verifyError.response?.data?.message || "Payment Verification Failed!");
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: function() {
            toast.error("Checkout was cancelled.");
            setIsProcessing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to initialize secure checkout");
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 max-w-5xl mx-auto mt-10 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <FileText className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">No Financial Records Found</h2>
        <p className="text-neutral-500 mt-2">Your institute administration has not initialized a fee package for you yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Your Financial Ledger</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1 font-medium">Clear your dues securely and track your payment receipts in real-time.</p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 hover:shadow-lg transition-shadow border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Total Package Due</p>
              <h3 className="text-2xl font-black text-neutral-900 dark:text-white mt-1 flex items-center">
                <IndianRupee className="w-5 h-5 mr-1" />
                {data?.feeStructure?.netAmountDue.toLocaleString()}
              </h3>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-lg transition-shadow border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Total Paid</p>
              <h3 className="text-2xl font-black text-green-600 dark:text-green-400 mt-1 flex items-center">
                <IndianRupee className="w-5 h-5 mr-1" />
                {data?.totalPaid.toLocaleString()}
              </h3>
            </div>
          </div>
        </GlassCard>

        <GlassCard className={`p-8 relative overflow-hidden flex flex-col justify-center border-0 ${
          data.remainingBalance === 0 
            ? "bg-gradient-to-br from-emerald-500 to-green-600" 
            : "bg-gradient-to-br from-indigo-600 to-purple-700 hover:scale-[1.02] cursor-pointer transition-transform"
        }`}
        onClick={() => {
          if (data.remainingBalance > 0) setIsPayModalOpen(true);
        }}>
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
          
          <div className="relative z-10 font-bold text-indigo-100 flex items-center justify-between mb-2">
            <span className="uppercase tracking-widest text-sm text-white/80">Outstanding Balance</span>
            {data.remainingBalance > 0 && <span className="px-2 py-0.5 rounded-full text-[10px] bg-white text-indigo-600 shadow-xl">Pay Now &rarr;</span>}
          </div>
          
          <div className="relative z-10 text-white text-4xl font-black flex items-center tracking-tight">
            <IndianRupee className="w-7 h-7 mr-1 opacity-80" />
            {data.remainingBalance.toLocaleString()}
          </div>
        </GlassCard>
      </div>

      {/* Payment Ledger Table */}
      <GlassCard className="p-0 overflow-hidden border border-neutral-200 dark:border-neutral-800">
        <div className="px-6 py-5 bg-neutral-50/50 dark:bg-neutral-900 flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Chronological Receipt History</h3>
          <span className="text-xs font-semibold text-neutral-500 bg-neutral-200 dark:bg-neutral-800 px-3 py-1 rounded-full">
            {data.payments.length} Transactions
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white dark:bg-black/50 text-neutral-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">Receipt Number</th>
                <th className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">Date Paid</th>
                <th className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">Gateway / Mode</th>
                <th className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">Reference ID</th>
                <th className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 text-right">Amount Settled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 bg-white dark:bg-neutral-900/40">
              {data.payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-neutral-500 italic">No payments have been recorded yet.</td>
                </tr>
              ) : (
                data.payments.map((payment: any) => (
                  <tr key={payment._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors group">
                    <td className="px-6 py-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                      {payment.receiptNumber}
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-700 dark:text-neutral-300">
                      {format(new Date(payment.paymentDate), "dd MMM, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        payment.paymentMethod === 'Razorpay' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                      {payment.transactionId || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-neutral-900 dark:text-white flex justify-end items-center">
                      <IndianRupee className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                      {payment.amountPaid.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Razorpay Checkout Modal */}
      <Dialog open={isPayModalOpen} onOpenChange={() => {
        if (!isProcessing) setIsPayModalOpen(false);
      }}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              Secure Installment Payment
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleRazorpayCheckout} className="space-y-6 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex justify-between">
                <span>Payment Amount (₹)</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">Max: {data?.remainingBalance}</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee className="h-5 w-5 text-neutral-400" />
                </div>
                <Input
                  type="number"
                  min="1"
                  max={data?.remainingBalance}
                  required
                  autoFocus
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="pl-10 text-xl font-bold h-14 bg-neutral-50 dark:bg-black border-neutral-200 dark:border-neutral-800"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                This transaction will be completely secured and automatically logged to your student ledger upon success.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isProcessing || !payAmount || Number(payAmount) > data?.remainingBalance}
              className="w-full h-14 text-lg font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20"
            >
              {isProcessing ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : `Proceed to Pay ₹${payAmount || "0"}`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
