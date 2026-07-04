import { motion } from 'framer-motion';
import { Building2, TrendingUp, Brain, Shield } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';

const features = [
  { icon: TrendingUp, title: 'Market Analytics', desc: 'Real-time property market trends and insights' },
  { icon: Brain, title: 'AI Predictions', desc: 'ML-powered price predictions and valuations' },
  { icon: Shield, title: 'Secure Platform', desc: 'Enterprise-grade security for your data' },
];

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-surface-950">
      <div className="relative hidden w-1/2 lg:flex lg:flex-col lg:justify-center lg:px-12 xl:px-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-surface-950 to-secondary-900/20" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-secondary-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500/5 blur-3xl" />
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/25">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">PropInsight AI</h2>
              <p className="text-xs text-surface-400">Real Estate Intelligence</p>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold leading-tight text-white xl:text-5xl"
          >
            Make Smarter{' '}
            <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              Real Estate
            </span>{' '}
            Decisions
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 max-w-lg text-lg text-surface-400"
          >
            Leverage AI-powered analytics, market predictions, and comprehensive property
            insights to maximize your real estate investments.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 space-y-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-4 rounded-2xl border border-surface-800/50 bg-surface-900/50 p-4 backdrop-blur-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/10">
                  <feature.icon className="h-5 w-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-surface-400">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="absolute inset-0 bg-surface-950 lg:hidden">
          <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-primary-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-secondary-500/10 blur-3xl" />
        </div>
        <div className="relative z-10 w-full">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
