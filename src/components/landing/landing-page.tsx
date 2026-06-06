'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Zap, Timer, Music, ListTodo, Shield, Sparkles, ArrowRight, Clock, Target, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LandingPageProps {
  onGetStarted: () => void
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  }),
}

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
}

const features = [
  {
    icon: <Timer className="w-6 h-6" />,
    title: 'Pomodoro Timer',
    description: 'Beautiful circular timer with customizable focus and break intervals. Track your sessions and build consistent deep work habits.',
    gradient: 'from-amber-500 to-orange-600',
    glow: 'oklch(0.78 0.16 65 / 15%)',
  },
  {
    icon: <Music className="w-6 h-6" />,
    title: 'Ambient Focus Sounds',
    description: 'Eight immersive soundscapes generated in real-time — from gentle rain to cozy cafe ambiance. Mix and match to create your perfect focus environment.',
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'oklch(0.72 0.16 160 / 15%)',
  },
  {
    icon: <ListTodo className="w-6 h-6" />,
    title: 'Smart Task Tracking',
    description: 'Organize your work with priorities, categories, and pomodoro estimates. Visualize progress and stay on top of everything.',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'oklch(0.68 0.20 300 / 15%)',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Focus Analytics',
    description: 'Track your daily pomodoros, focus minutes, and task completion. Weekly insights help you understand and optimize your productivity patterns.',
    gradient: 'from-rose-500 to-pink-600',
    glow: 'oklch(0.72 0.20 10 / 15%)',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Secure & Private',
    description: 'Your data stays yours. Authenticated with industry-standard security through Firebase. No tracking, no ads, no selling your information.',
    gradient: 'from-cyan-500 to-blue-600',
    glow: 'oklch(0.72 0.12 220 / 15%)',
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'Crafted with Care',
    description: 'Every pixel, animation, and interaction designed to help you focus better. A tool that disappears into your workflow so you can do your best work.',
    gradient: 'from-yellow-500 to-amber-600',
    glow: 'oklch(0.82 0.16 75 / 15%)',
  },
]

const stats = [
  { value: '25', unit: 'min', label: 'Focus Sessions' },
  { value: '8', unit: '', label: 'Ambient Sounds' },
  { value: '100%', unit: '', label: 'Free Forever' },
  { value: '0', unit: '', label: 'Ads or Tracking' },
]

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute -top-[30%] -left-[20%] w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, oklch(0.78 0.16 65 / 10%) 0%, transparent 70%)' }}
          animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-[30%] -right-[20%] w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, oklch(0.72 0.16 160 / 8%) 0%, transparent 70%)' }}
          animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-[40%] left-[60%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, oklch(0.68 0.20 300 / 5%) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 sm:px-10 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">FlowState</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="hidden sm:flex text-sm text-muted-foreground hover:text-foreground"
            onClick={onGetStarted}
          >
            Sign In
          </Button>
          <Button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 gap-2 text-sm"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 pt-16 sm:pt-24 pb-20">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Deep Focus Productivity
            </div>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
          >
            Enter Your{' '}
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              Flow State
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A beautifully crafted productivity tool that combines focused timing, ambient sounds, and smart task management. Designed to help you do the best work of your life.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl shadow-amber-500/25 gap-2 text-base px-8 h-12"
            >
              Start Focusing — It&apos;s Free
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="gap-2 text-base px-8 h-12 border-border/50">
              <Clock className="w-5 h-5" />
              See How It Works
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeUp}
            custom={4}
            className="flex items-center justify-center gap-8 sm:gap-12 mt-16 pt-8 border-t border-border/30"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold">
                  {stat.value}<span className="text-primary text-lg">{stat.unit}</span>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Hero Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
          className="mt-16 relative"
        >
          <div className={cn(
            'relative mx-auto max-w-4xl rounded-2xl border border-border/50 overflow-hidden',
            'bg-card/60 backdrop-blur-xl shadow-2xl shadow-primary/5',
            'before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:to-background/20 before:pointer-events-none'
          )}>
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-muted/20">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-xs text-muted-foreground/60">flowstate.app</span>
            </div>
            {/* Mockup content */}
            <div className="p-8 flex items-center justify-center min-h-[320px]">
              <div className="flex flex-col items-center gap-4">
                {/* Mock timer circle */}
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
                    <circle cx="100" cy="100" r="88" fill="none" stroke="url(#heroGrad)" strokeWidth="6" strokeLinecap="round" strokeDasharray={553} strokeDashoffset={180} />
                    <defs>
                      <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="oklch(0.78 0.16 65)" />
                        <stop offset="50%" stopColor="oklch(0.72 0.16 160)" />
                        <stop offset="100%" stopColor="oklch(0.68 0.20 300)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-light tabular-nums">25:00</span>
                    <span className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Focus</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={cn('w-2 h-2 rounded-full', i <= 1 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-muted-foreground/20')} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Glow behind mockup */}
          <div className="absolute inset-0 -z-10 blur-3xl opacity-30 bg-gradient-to-br from-amber-500/20 via-transparent to-violet-500/20" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 py-20">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Focus Deeply
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg">
            No distractions. No complexity. Just the tools that actually help you concentrate and get things done.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              custom={i}
              className="group relative"
            >
              <div className={cn(
                'relative h-full p-6 rounded-2xl transition-all duration-500',
                'bg-card/40 border border-border/30',
                'hover:bg-card/60 hover:border-border/60 hover:shadow-lg',
                'hover:shadow-primary/5'
              )}>
                {/* Icon */}
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                  'bg-gradient-to-br text-white shadow-lg',
                  feature.gradient
                )} style={{ boxShadow: `0 8px 24px ${feature.glow}` }}>
                  {feature.icon}
                </div>

                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${feature.glow}, transparent 70%)` }} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 py-20">
        <motion.div
          className={cn(
            'relative text-center p-12 rounded-3xl overflow-hidden',
            'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10',
            'border border-amber-500/20'
          )}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Ready to Enter Your Flow State?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Join thousands of people who have transformed their work habits. Start focusing better today — completely free.
            </p>
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl shadow-amber-500/25 gap-2 text-base px-10 h-12"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-8 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold">FlowState</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Designed for deep focus. Built with care.
          </p>
        </div>
      </footer>
    </div>
  )
}
