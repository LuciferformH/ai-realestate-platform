import { motion } from 'framer-motion';
import { Building2, KeyRound } from 'lucide-react';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-950 px-6 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-secondary-500/10 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-60 w-60 rounded-full bg-accent-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col items-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/25">
            <Building2 className="h-9 w-9 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary-400" />
            <span className="text-sm font-medium text-primary-400">Password Recovery</span>
          </div>
        </motion.div>

        <div className="rounded-3xl border border-surface-800/50 bg-surface-900/60 p-8 shadow-glass backdrop-blur-xl">
          <ForgotPasswordForm />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-xs text-surface-600"
        >
          &copy; {new Date().getFullYear()} PropInsight AI. All rights reserved.
        </motion.p>
      </div>
    </div>
  );
}
