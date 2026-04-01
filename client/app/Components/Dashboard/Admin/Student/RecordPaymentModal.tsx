"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/Components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Components/ui/select";
import { Button } from "@/app/Components/ui/button";
import { Input } from "@/app/Components/ui/input";
import { toast } from "sonner";
import { recordPayment } from "@/app/Services/Fee";
import { Loader2, IndianRupee } from "lucide-react";

interface RecordPaymentModalProps {
  isOpen: boolean;
  studentId: string;
  feeStructureId: string;
  maxAmount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RecordPaymentModal({
  isOpen,
  studentId,
  feeStructureId,
  maxAmount,
  onClose,
  onSuccess,
}: RecordPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amountPaid: "",
    paymentMethod: "Cash",
    transactionId: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payAmt = Number(formData.amountPaid);
    if (!payAmt || payAmt <= 0) return toast.error("Amount must be greater than zero.");
    if (payAmt > maxAmount) return toast.error(`You cannot log a payment greater than the remaining balance (₹${maxAmount}).`);

    setLoading(true);

    try {
      await recordPayment({
        student: studentId,
        feeStructureId: feeStructureId,
        amountPaid: payAmt,
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId,
        notes: formData.notes,
      });

      toast.success("Receipt securely generated!");
      setFormData({ amountPaid: "", paymentMethod: "Cash", transactionId: "", notes: "" });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to record payment:", error);
      toast.error(error.response?.data?.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg">
              <IndianRupee className="w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-white">
              Log Financial Receipt
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                Received Amount (₹) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                max={maxAmount}
                required
                placeholder={`Max: ${maxAmount}`}
                value={formData.amountPaid}
                onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                className="font-mono text-lg"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                Mode of Payment <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(val) => setFormData({ ...formData, paymentMethod: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Physical Cash</SelectItem>
                  <SelectItem value="UPI">UPI Transfer</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer (NEFT/RTGS)</SelectItem>
                  <SelectItem value="Cheque">Physical Cheque</SelectItem>
                  <SelectItem value="Razorpay" disabled>Razorpay Gateway (Auto-Logged)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.paymentMethod !== "Cash" && formData.paymentMethod !== "Razorpay" && (
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                  Reference / UTR ID <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. 1234567890"
                  value={formData.transactionId}
                  onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                Administrative Notes
              </label>
              <Input
                placeholder="Optional comments regarding this transaction..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-800 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="bg-white hover:bg-neutral-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.amountPaid}
              className="bg-green-600 hover:bg-green-700 text-white min-w-[140px] shadow-lg shadow-green-500/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate Receipt"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
