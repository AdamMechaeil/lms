"use client";
import React, { useEffect, useState } from "react";
import { getStudentFinancials } from "@/app/Services/Fee";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { Button } from "@/app/Components/ui/button";
import { Loader2, IndianRupee, CreditCard, Receipt, FileText } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { format } from "date-fns";

const InitializeFeeModal = dynamic(() => import("./InitializeFeeModal"), { ssr: false });
const RecordPaymentModal = dynamic(() => import("./RecordPaymentModal"), { ssr: false });

export default function StudentFinancials({ studentId }: { studentId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isInitModalOpen, setIsInitModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    fetchFinancials();
  }, [studentId]);

  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const response = await getStudentFinancials(studentId);
      setData(response);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setData(null); // No fee structure yet
      } else {
        toast.error("Failed to load financial data");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!data ? (
        <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
          <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 mb-2">No Fee Structure Configured</h3>
          <p className="text-sm text-neutral-500 mb-6 max-w-sm mx-auto">
            This student has just been assigned. Initialize their package cost to start tracking EMIs and payments.
          </p>
          <Button onClick={() => setIsInitModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            Initialize Fee Package
          </Button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500 text-white rounded-lg shadow-lg">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Net Amount Due</p>
                  <h3 className="text-2xl font-bold flex items-center text-neutral-900 dark:text-white">
                    <IndianRupee className="w-5 h-5 mr-1 text-neutral-400" />
                    {data.feeStructure.netAmountDue.toLocaleString()}
                  </h3>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500 text-white rounded-lg shadow-lg">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Total Paid</p>
                  <h3 className="text-2xl font-bold flex items-center text-green-600 dark:text-green-400">
                    <IndianRupee className="w-5 h-5 mr-1" />
                    {data.totalPaid.toLocaleString()}
                  </h3>
                </div>
              </div>
            </GlassCard>

            <GlassCard className={`p-6 ${data.remainingBalance === 0 ? "bg-gradient-to-br from-gray-500/10 to-gray-500/10 border-gray-500/20" : "bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20"}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg shadow-lg text-white ${data.remainingBalance === 0 ? 'bg-gray-500' : 'bg-red-500'}`}>
                  <IndianRupee className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Remaining Balance</p>
                  <h3 className={`text-2xl font-bold flex items-center ${data.remainingBalance === 0 ? 'text-gray-500' : 'text-red-500'}`}>
                    <IndianRupee className="w-5 h-5 mr-1" />
                    {data.remainingBalance.toLocaleString()}
                  </h3>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Payment History Table */}
          <GlassCard className="overflow-hidden p-0">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-white/50 dark:bg-neutral-900/50">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Transaction Ledger</h3>
                <p className="text-sm text-neutral-500">History of all recorded cash receipts and digital payments.</p>
              </div>
              <Button 
                onClick={() => setIsPaymentModalOpen(true)}
                disabled={data.remainingBalance === 0}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20"
              >
                Log Payment
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-neutral-500 dark:text-neutral-400">
                <thead className="text-xs text-neutral-700 uppercase bg-neutral-50 dark:bg-neutral-800/80 dark:text-neutral-300">
                  <tr>
                    <th className="px-6 py-4">Receipt No.</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Ref ID</th>
                    <th className="px-6 py-4 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center italic text-neutral-400">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    data.payments.map((payment: any) => (
                      <tr key={payment._id} className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                          {payment.receiptNumber}
                        </td>
                        <td className="px-6 py-4">
                          {format(new Date(payment.paymentDate), "MMM dd, yyyy")}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                            ${payment.paymentMethod === 'Cash' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                            {payment.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                          {payment.transactionId || "-"}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-neutral-900 dark:text-white flex items-center justify-end">
                          <IndianRupee className="w-3 h-3 mr-1" />
                          {payment.amountPaid.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      )}

      <InitializeFeeModal
        isOpen={isInitModalOpen}
        studentId={studentId}
        onClose={() => setIsInitModalOpen(false)}
        onSuccess={fetchFinancials}
      />

      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        studentId={studentId}
        feeStructureId={data?.feeStructure?._id}
        maxAmount={data?.remainingBalance}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={fetchFinancials}
      />
    </div>
  );
}
