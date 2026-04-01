"use client";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { Employeelogin } from "@/app/Services/Auth";
import { useAuth } from "@/app/Context/Authcontext";
import { useRouter } from "next/navigation";
import { Users, ShieldCheck } from "lucide-react";

export default function EmployeeLogin() {
  const { login } = useAuth();
  const router = useRouter();

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-black p-4">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md p-8 sm:p-10 space-y-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl relative z-10 transition-all hover:shadow-indigo-500/5">
        
        <div className="flex justify-center -mt-16 mb-2">
            <div className="p-4 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-lg ring-4 ring-slate-50 dark:ring-black">
                <Users className="w-10 h-10" />
            </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Employee Portal
          </h1>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Sign in with your institute authorized Google account to access your CRM.
          </p>
        </div>

        <div className="bg-neutral-50 dark:bg-black/50 p-4 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 text-sm text-neutral-600 dark:text-neutral-400 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
          <p>
            You must be pre-invited by your Institute Administrator to access this portal. Ensure your Google Email matches your invitation strictly.
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                if (credentialResponse.credential) {
                  const data = await Employeelogin(credentialResponse.credential);
                  login(data);
                  toast.success("Login Successful!");
                  
                  // Redirect to Admin dashboard because Employee roles share the same global Admin Dashboard layout based on permissions.
                  // For example, an Employee with manage_leads accesses Dashboard/admin/leads.
                  router.push("/Dashboard/admin");
                }
              } catch (error: any) {
                toast.error(error);
              }
            }}
            onError={() => {
              toast.error("Google Login Failed");
            }}
            useOneTap
            shape="pill"
            theme="filled_black"
            size="large"
            text="continue_with"
          />
        </div>

        <div className="text-center">
            <button onClick={() => router.push('/Auth/login')} className="text-sm font-semibold text-neutral-500 hover:text-indigo-600 transition-colors">
                &larr; Back to Role Selection
            </button>
        </div>
      </div>
    </div>
  );
}
