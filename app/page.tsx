"use client";

import React, { useState, useEffect, useRef } from 'react';
import { WaitlistForm } from '@/components/WaitlistForm';
import { motion, useInView } from 'framer-motion';
import {
  Target,
  FileText,
  Users,
  CheckCircle2,
  Zap,
  TrendingUp,
  Briefcase,
  X,
  ArrowRight,
  Link2,
  Sparkles,
  Check,
  Menu,
  X as XIcon,
  ChevronRight,
  GraduationCap,
  Upload,
  MousePointerClick,
  Star,
  Github,
  Twitter,
  Linkedin,
  Mail,
} from 'lucide-react';

/* ─── Data ───────────────────────────────────────────── */

const NewBrandLogos = [
  { name: 'Google', src: '/logos/google.png', className: 'h-24 md:h-32' },
  { name: 'Amazon', src: '/logos/amazon.png', className: 'h-24 md:h-32' },
  { name: 'SpaceX', src: '/logos/spacex.png', className: 'h-20 md:h-24' },
  { name: 'Meta', src: '/logos/meta.png', className: 'h-24 md:h-32' },
];

const howItWorks = [
  {
    step: '01',
    icon: <Link2 className="w-6 h-6" />,
    title: 'Paste a Job Link',
    desc: 'Drop any job URL and we instantly parse the role requirements, keywords, and company context.',
  },
  {
    step: '02',
    icon: <Upload className="w-6 h-6" />,
    title: 'Upload Your Resume',
    desc: 'Our AI reads your background, skills, and experience to understand your unique value positioning.',
  },
  {
    step: '03',
    icon: <Sparkles className="w-6 h-6" />,
    title: 'Get Tailored Materials',
    desc: 'Receive a focused cover letter, resume suggestions, and a match score — all aligned with the posting.',
  },
];

const features = [
  {
    icon: <Target className="w-6 h-6" />,
    title: 'Applicant Clarity',
    desc: 'Deep profiling that helps students understand their unique value positioning in the market.',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'Application Excellence',
    desc: 'Smart cover letters and tailored resumes that are strategic representations of the candidate.',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Interview Prep',
    desc: 'Real practice with AI-generated questions specific to the role and their background.',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Placement Momentum',
    desc: 'Track applications and outcomes. Give your program visibility into student success.',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Talent Signals',
    desc: 'Creating verified indicators of skill and readiness that employers can trust.',
  },
  {
    icon: <Briefcase className="w-6 h-6" />,
    title: 'Career Companion',
    desc: 'A persistent system that grows with your alumni from their first job to executive roles.',
  },
];

const testimonials = [
  {
    name: 'Marcus J.',
    role: 'CS Senior, Howard University',
    quote: 'I went from zero callbacks to three interviews in two weeks. The cover letters actually sound like me.',
    rating: 5,
  },
  {
    name: 'Priya S.',
    role: 'MBA Candidate, UT Austin',
    quote: 'Our career center adopted JobPeel and placement rates jumped 18% in one semester.',
    rating: 5,
  },
  {
    name: 'David K.',
    role: 'Bootcamp Graduate',
    quote: 'The match scoring showed me which roles I was actually qualified for. Landed at a FAANG.',
    rating: 5,
  },
];

const stats = [
  { value: '10,000+', label: 'Students Served' },
  { value: '94%', label: 'Avg Match Score' },
  { value: '3x', label: 'More Interviews' },
  { value: '200+', label: 'Partner Programs' },
];

/* ─── Animation Variants ─────────────────────────────── */

const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const fadeIn: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

const scaleIn: any = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' },
  }),
};

/* ─── Section Wrapper ────────────────────────────────── */

const AnimatedSection = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── Page ───────────────────────────────────────────── */

const JobPeelLanding = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen font-sans selection:bg-orange-500 selection:text-white bg-zinc-950 text-zinc-100 flex flex-col overflow-x-hidden">

      {/* ─── Navigation ─────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${scrolled
          ? 'bg-zinc-950/80 backdrop-blur-xl border-white/5 py-4'
          : 'bg-transparent border-transparent py-6'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-400 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
              <img
                src="/logos/jobpeel-logo-square.png"
                alt="JobPeel"
                className="relative w-10 h-10 rounded-xl shadow-lg border border-white/10"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">JobPeel</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {['Platform', 'For Schools', 'Vision'].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s/g, '-')}`}
                className="text-sm font-medium text-zinc-400 hover:text-orange-400 transition-colors duration-300"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a href="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Log in
            </a>
            <a
              href="/signup"
              className="relative group bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-orange-600/20 hover:shadow-orange-500/30"
            >
              Get Started
              <div className="absolute inset-0 rounded-xl bg-orange-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <XIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 bg-zinc-950/95 backdrop-blur-xl border-b border-white/5 p-6 flex flex-col gap-4 md:hidden"
          >
            {['Platform', 'For Schools', 'Vision'].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s/g, '-')}`}
                className="text-lg font-medium text-zinc-100 hover:text-orange-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link}
              </a>
            ))}
            <hr className="border-zinc-800" />
            <a href="/login" className="text-lg font-medium text-zinc-100">Log in</a>
            <a href="/signup" className="bg-orange-600 text-white w-full py-3 rounded-xl font-semibold text-center">
              Get Started
            </a>
          </motion.div>
        )}
      </nav>

      <main className="flex-grow flex flex-col relative">

        {/* ─── Hero Section ──────────────────────────── */}
        <section className="pt-36 pb-20 lg:pt-52 lg:pb-36 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-1/2 h-full -z-10">
            <div className="absolute top-20 right-20 w-[500px] h-[500px] rounded-full bg-orange-600/8 blur-[150px] animate-glow-pulse" />
            <div className="absolute bottom-20 right-40 w-[300px] h-[300px] rounded-full bg-orange-500/5 blur-[100px] animate-glow-pulse" style={{ animationDelay: '2s' }} />
          </div>
          <div className="absolute top-40 left-0 w-[400px] h-[400px] rounded-full bg-zinc-900/60 blur-[120px] -z-10" />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] -z-10" />

          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: Copy */}
              <motion.div
                initial="hidden"
                animate="visible"
                className="max-w-xl"
              >
                <motion.div
                  variants={fadeUp}
                  custom={0}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-sm font-medium text-orange-400 mb-8"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                  </span>
                  Now Onboarding Career Programs
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  custom={1}
                  className="text-5xl lg:text-[3.75rem] xl:text-7xl font-bold tracking-tight leading-[1.08] mb-6 text-white"
                >
                  Help more students land interviews with{' '}
                  <span className="gradient-text-orange">
                    tailored applications on autopilot
                  </span>
                  .
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  custom={2}
                  className="text-lg lg:text-xl text-zinc-400 mb-10 leading-relaxed"
                >
                  JobPeel turns a student's resume and a job link into a focused cover letter that matches the role, plus suggestions to tighten their resume. Career staff stop rewriting documents from scratch and instead guide students using drafts already aligned with each posting.
                </motion.p>

                <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="#waitlist"
                    className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300 shadow-xl shadow-orange-600/20 hover:shadow-orange-500/30 group"
                  >
                    Apply for the Pilot
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="#platform"
                    className="flex items-center justify-center gap-2 border border-zinc-800 hover:border-zinc-700 text-white px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300 hover:bg-zinc-900/50"
                  >
                    See How It Works
                  </a>
                </motion.div>

                {/* Social Proof */}
                <motion.div variants={fadeUp} custom={4} className="mt-10 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[
                      'bg-gradient-to-br from-orange-400 to-orange-600',
                      'bg-gradient-to-br from-blue-400 to-blue-600',
                      'bg-gradient-to-br from-green-400 to-green-600',
                      'bg-gradient-to-br from-purple-400 to-purple-600',
                    ].map((bg, i) => (
                      <div
                        key={i}
                        className={`w-9 h-9 rounded-full border-2 border-zinc-950 ${bg} flex items-center justify-center text-[10px] font-bold text-white`}
                      >
                        {['MJ', 'PS', 'DK', 'AL'][i]}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-zinc-500">
                    Trusted by <span className="text-zinc-300 font-medium">10,000+</span> students
                  </p>
                </motion.div>
              </motion.div>

              {/* Right: Product Mockup */}
              <motion.div
                initial={{ opacity: 0, x: 40, rotate: 2 }}
                animate={{ opacity: 1, x: 0, rotate: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                className="relative hidden lg:block"
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/10 to-orange-600/5 rounded-3xl blur-3xl animate-glow-pulse" />
                <div className="relative glass-card rounded-2xl p-2 shadow-2xl glow-orange hover:rotate-0 transition-transform duration-700 ease-out">
                  <div className="bg-zinc-950 rounded-xl overflow-hidden border border-white/5 aspect-[4/3] flex flex-col relative">
                    {/* Browser Bar */}
                    <div className="bg-zinc-900/60 px-4 py-3 flex items-center gap-2 border-b border-white/5">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/40" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500/40" />
                        <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/40" />
                      </div>
                      <div className="ml-4 bg-zinc-800/60 px-3 py-1 rounded-md flex items-center gap-2 border border-white/5">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-zinc-400">jobpeel.app/workspace</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-grow flex flex-col gap-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-white text-lg">Product Designer</h3>
                          <p className="text-zinc-500 text-xs">Stripe • Remote</p>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                          94% Match
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-900 p-3 rounded-lg border border-white/5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Link2 className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-xs text-zinc-400 font-medium truncate">stripe.com/jobs...</div>
                            <div className="text-[10px] text-zinc-600">Job Source</div>
                          </div>
                        </div>
                        <div className="bg-zinc-900 p-3 rounded-lg border border-white/5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                            <FileText className="w-4 h-4 text-orange-400" />
                          </div>
                          <div>
                            <div className="text-xs text-zinc-400 font-medium">Resume_v2.pdf</div>
                            <div className="text-[10px] text-zinc-600">Context</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-zinc-900/50 rounded-lg p-4 border border-white/5 flex-grow flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <Check className="w-3 h-3 text-green-500" />
                          <span>Analyzed role requirements</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <Check className="w-3 h-3 text-green-500" />
                          <span>Extracted keywords: "Systems", "React"</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-orange-400 bg-orange-500/10 p-2 rounded border border-orange-500/20">
                          <Sparkles className="w-3 h-3 animate-pulse" />
                          <span>Drafting cover letter...</span>
                        </div>
                        <div className="mt-1 text-[10px] text-zinc-500 font-mono bg-black/30 p-2 rounded leading-relaxed opacity-70">
                          "I'm excited to apply for the Product Designer role. My experience building{' '}
                          <span className="text-orange-400 bg-orange-500/10">design systems</span>..."
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-4 -left-6 glass-card p-4 rounded-xl shadow-xl flex items-center gap-3"
                >
                  <div className="p-2 rounded-full bg-green-500/10 border border-green-500/20">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Interview Secured</p>
                    <p className="text-xs text-zinc-500">2 minutes ago</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── Stats Bar ─────────────────────────────── */}
        <AnimatedSection>
          <section className="border-y border-white/5 py-10 bg-zinc-900/20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    variants={fadeUp}
                    custom={i}
                    className="text-center"
                  >
                    <div className="text-3xl md:text-4xl font-bold gradient-text-orange mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-zinc-500">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* ─── Trusted By / Logo Marquee ──────────────── */}
        <section className="py-14 bg-zinc-950/50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-xs font-bold text-zinc-600 mb-10 uppercase tracking-[0.2em]">
              Helping students land roles at
            </p>
          </div>
          <div className="relative">
            {/* Gradient Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-zinc-950 to-transparent z-10" />
            {/* Marquee */}
            <div className="flex animate-marquee whitespace-nowrap">
              {[...NewBrandLogos, ...NewBrandLogos, ...NewBrandLogos, ...NewBrandLogos].map((logo, i) => (
                <div key={`${logo.name}-${i}`} className="mx-12 md:mx-20 flex-shrink-0 flex items-center">
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className={`${logo.className} w-auto object-contain brightness-0 invert opacity-40 hover:opacity-80 transition-opacity duration-500`}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How It Works ──────────────────────────── */}
        <AnimatedSection>
          <section className="py-28 bg-zinc-950 relative" id="platform">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-950/20 via-transparent to-transparent -z-10" />
            <div className="max-w-7xl mx-auto px-6">
              <motion.div variants={fadeUp} custom={0} className="text-center max-w-3xl mx-auto mb-20">
                <span className="inline-block text-xs font-bold text-orange-500 uppercase tracking-[0.2em] mb-4">How It Works</span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Three steps to a <span className="gradient-text-orange">stronger application</span>.
                </h2>
                <p className="text-lg text-zinc-400 leading-relaxed">
                  No more blank-page anxiety. Just paste, upload, and let JobPeel handle the heavy lifting.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8 relative">
                {/* Connecting Line (desktop) */}
                <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-orange-500/30 via-orange-500/10 to-orange-500/30" />

                {howItWorks.map((item, i) => (
                  <motion.div
                    key={item.step}
                    variants={scaleIn}
                    custom={i}
                    className="relative text-center group"
                  >
                    <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 mb-6 group-hover:border-orange-500/30 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-orange-500/10">
                      <div className="text-orange-500 group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-zinc-400 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* ─── Problem / Solution ────────────────────── */}
        <AnimatedSection>
          <section className="py-28 bg-zinc-950 relative">
            <div className="max-w-7xl mx-auto px-6">
              <motion.div variants={fadeUp} custom={0} className="text-center max-w-3xl mx-auto mb-20">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                  The hiring process is{' '}
                  <span className="line-through decoration-orange-600 decoration-4 text-zinc-500">broken</span>.
                </h2>
                <p className="text-lg text-zinc-400 leading-relaxed">
                  Students send generic applications into the void. Career centers are overwhelmed reviewing endless drafts. The result is wasted effort and missed opportunities.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <motion.div
                  variants={fadeUp}
                  custom={1}
                  className="p-10 rounded-3xl border border-white/5 bg-zinc-900/30 backdrop-blur-sm"
                >
                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                    <span className="w-1.5 h-8 bg-zinc-700 rounded-full" />
                    The Old Way
                  </h3>
                  <ul className="space-y-5">
                    {[
                      'Guessing what ATS systems want',
                      'Blindly submitting generic resumes',
                      'Career staff rewriting from scratch',
                      'Students ghosted by recruiters',
                      'Low interview conversion rates',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-4 text-zinc-500 group">
                        <div className="p-1 rounded-full bg-zinc-800/50 group-hover:bg-red-900/20 transition-colors">
                          <X className="w-5 h-5 shrink-0 text-zinc-600 group-hover:text-red-500 transition-colors" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  custom={2}
                  className="p-10 rounded-3xl bg-zinc-900 text-white shadow-2xl relative overflow-hidden group border border-white/10 hover:border-orange-500/30 transition-colors duration-500"
                >
                  <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/15 rounded-full blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity" />
                  <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-orange-500 rounded-full shadow-[0_0_12px_rgba(246,152,90,0.8)]" />
                    The JobPeel Way
                  </h3>
                  <ul className="space-y-5">
                    {[
                      'Clear understanding of candidate positioning',
                      'Tailored applications for every role',
                      'AI that learns the student\'s voice',
                      'Staff act as strategic guides, not editors',
                      'Prepared, articulate, and competitive candidates',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-4 text-zinc-200">
                        <div className="p-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                          <CheckCircle2 className="w-5 h-5 shrink-0 text-orange-500" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* ─── Features Grid ─────────────────────────── */}
        <AnimatedSection>
          <section className="py-28 bg-zinc-900/20 border-t border-white/5" id="features">
            <div className="max-w-7xl mx-auto px-6">
              <motion.div variants={fadeUp} custom={0} className="mb-20">
                <span className="inline-block text-xs font-bold text-orange-500 uppercase tracking-[0.2em] mb-4">Platform</span>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  A complete career operating system.
                </h2>
                <p className="text-xl text-zinc-400 max-w-2xl">
                  Not just a document tool. A system for clarity, leverage, and momentum for your program.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((card, i) => (
                  <motion.div
                    key={card.title}
                    variants={scaleIn}
                    custom={i}
                    className="glass-card glass-card-hover p-8 rounded-2xl transition-all duration-500 group cursor-default hover:-translate-y-1"
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-zinc-800/80 border border-white/5 group-hover:border-orange-500/20 group-hover:bg-zinc-800 transition-all duration-500">
                      <div className="text-orange-500 group-hover:scale-110 transition-transform duration-300">
                        {card.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                    <p className="leading-relaxed text-zinc-400 group-hover:text-zinc-300 transition-colors">{card.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* ─── For Institutions ──────────────────────── */}
        <AnimatedSection>
          <section className="py-28 bg-zinc-950 relative overflow-hidden border-t border-white/5" id="for-schools">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <motion.div variants={fadeUp} custom={0}>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/5 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-6">
                    <GraduationCap className="w-4 h-4" />
                    For Schools & Bootcamps
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                    The Career Center <span className="gradient-text-orange">in a Box</span>.
                  </h2>
                  <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                    Scale personalized guidance to thousands of students at once. JobPeel assists advisors with automation, dashboards, and placement insights without sacrificing quality.
                  </p>

                  <ul className="space-y-4 mb-10">
                    {[
                      'Admin dashboards & student monitoring',
                      'Automated placement tracking',
                      'Reduce advisor manual workload',
                      'Improve placement outcomes',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="p-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                          <Check className="w-3.5 h-3.5 text-orange-500" />
                        </div>
                        <span className="text-zinc-200 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#waitlist"
                    className="inline-flex items-center gap-2 bg-white text-zinc-900 hover:bg-zinc-100 px-8 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg group"
                  >
                    Partner With Us
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </motion.div>

                <motion.div variants={fadeUp} custom={2} className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-orange-500/10 to-transparent rounded-3xl blur-2xl" />
                  <div className="relative glass-card rounded-2xl p-6 glow-orange">
                    <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-zinc-700" />
                        <div className="w-3 h-3 rounded-full bg-zinc-700" />
                        <div className="w-3 h-3 rounded-full bg-zinc-700" />
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Admin Dashboard</div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm text-zinc-400 font-medium">Placement Rate</h4>
                          <span className="text-green-400 text-sm font-bold">+18% vs LY</span>
                        </div>
                        <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full w-[82%] bg-gradient-to-r from-orange-600 to-orange-400 rounded-full" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-800/50 p-4 rounded-xl border border-white/5">
                          <div className="text-3xl font-bold mb-1 text-white">842</div>
                          <div className="text-xs text-zinc-500">Active Students</div>
                        </div>
                        <div className="bg-zinc-800/50 p-4 rounded-xl border border-white/5">
                          <div className="text-3xl font-bold mb-1 text-white">156</div>
                          <div className="text-xs text-zinc-500">Interviews This Week</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {['Sarah M. — Google (Offer)', 'James W. — Meta (Final Round)', 'Alex T. — Amazon (Phone Screen)'].map((entry, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg border border-white/5">
                            <span className="text-xs text-zinc-300">{entry}</span>
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* ─── Testimonials ──────────────────────────── */}
        <AnimatedSection>
          <section className="py-28 bg-zinc-950 border-t border-white/5" id="vision">
            <div className="max-w-7xl mx-auto px-6">
              <motion.div variants={fadeUp} custom={0} className="text-center max-w-3xl mx-auto mb-16">
                <span className="inline-block text-xs font-bold text-orange-500 uppercase tracking-[0.2em] mb-4">What People Say</span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Students and programs <span className="gradient-text-orange">love JobPeel</span>.
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {testimonials.map((t, i) => (
                  <motion.div
                    key={t.name}
                    variants={scaleIn}
                    custom={i}
                    className="glass-card glass-card-hover p-8 rounded-2xl transition-all duration-500 hover:-translate-y-1"
                  >
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 text-orange-500 fill-orange-500" />
                      ))}
                    </div>
                    <p className="text-zinc-300 leading-relaxed mb-6 text-sm italic">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div>
                      <p className="text-white font-semibold text-sm">{t.name}</p>
                      <p className="text-zinc-500 text-xs">{t.role}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* ─── CTA / Waitlist ────────────────────────── */}
        <AnimatedSection>
          <section className="py-28 bg-zinc-900/30 relative overflow-hidden border-t border-white/5" id="waitlist">
            {/* Glow orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-orange-600/8 blur-[180px] -z-10 animate-glow-pulse" />
            <div className="absolute top-20 right-20 w-[200px] h-[200px] rounded-full bg-orange-500/5 blur-[100px] -z-10" />

            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
              <motion.div variants={fadeUp} custom={0}>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Ready to transform your career program?
                </h2>
                <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                  Join the career operating system that gives your students the leverage they deserve. Apply for the pilot today.
                </p>
              </motion.div>

              <motion.div
                variants={fadeUp}
                custom={1}
                className="max-w-md mx-auto"
              >
                <div className="glass-card p-6 rounded-2xl glow-orange">
                  <WaitlistForm />
                </div>
              </motion.div>
            </div>
          </section>
        </AnimatedSection>

      </main>

      {/* ─── Footer ──────────────────────────────────── */}
      <footer className="border-t border-white/5 py-16 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logos/jobpeel-logo-square.png" alt="JobPeel" className="w-8 h-8 rounded-lg" />
                <span className="text-lg font-bold text-white">JobPeel</span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
                The AI-powered career operating system. Helping students present themselves clearly, confidently, and strategically at every stage of the hiring process.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-bold text-zinc-300 mb-4 uppercase tracking-wider">Product</h4>
              <ul className="space-y-3">
                {['Platform', 'For Schools', 'Pricing', 'Roadmap'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-zinc-500 hover:text-orange-400 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-zinc-300 mb-4 uppercase tracking-wider">Company</h4>
              <ul className="space-y-3">
                {['About', 'Contact', 'Privacy', 'Terms'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-zinc-500 hover:text-orange-400 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-zinc-600 text-sm">© 2026 JobPeel Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {[Twitter, Linkedin, Mail].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-orange-400 transition-all duration-300 border border-white/5">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JobPeelLanding;
