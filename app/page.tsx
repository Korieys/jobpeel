"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Target,
  FileText,
  Zap,
  TrendingUp,
  Briefcase,
  School,
  Users,
  Menu,
  X,
  LayoutDashboard,
  ShieldCheck,
  LineChart,
} from 'lucide-react';
import { toast } from 'sonner';

// Brand Logos Component (kept clean)
const BrandLogos = {
  Google: (props: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
    </svg>
  ),
  Meta: (props: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.969 3.969 0 110-7.938 3.969 3.969 0 010 7.938z" />
    </svg>
  ),
  Snapchat: (props: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.005 0C6.39 0 4.043 4.145 4.043 6.095c0 0-1.124 1.701-1.503 3.407-.261 1.173.224 2.122.95 2.502.58.305.998.118 1.288-.065.578-.363 1.264.444 1.05 1.583-.24 1.274-1.268 2.659-1.268 2.659-.512.637-1.748.74-2.28 1.026-.406.216-.48.665-.213 1.157.307.568 1.94 1.144 3.96 1.41 1.298.17 2.378-.29 3.146-.662.635-.308 1.21-.355 1.83-.355.617 0 1.196.047 1.83.355.767.373 1.848.832 3.146.662 2.02-.266 3.653-.842 3.96-1.41.267-.492.193-.94-.213-1.157-.532-.286-1.768-.39-2.28-1.026 0 0-1.028-1.385-1.268-2.66-.214-1.138.472-1.945 1.05-1.582.29.183.708.37 1.288.065.726-.38 1.21-1.33.95-2.502-.38-1.706-1.503-3.407-1.503-3.407C19.967 4.145 17.62 0 12.005 0z" />
    </svg>
  ),
  Roku: (props: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M2.54 10.455h1.993c3.55 0 4.12 1.487 4.417 4.262h-2.1c-.26-1.982-.445-2.545-2.315-2.545H2.54v2.545H.417V5.592h4.529c2.618 0 3.733 1.238 3.733 3.255 0 1.19-.387 2.87-2.638 3.097 1.953.535 2.695 1.808 3.03 4.288 0 0 .167 1.357.65 1.357.408 0 .52-.464.52-1.375 0-2.358 1.67-4.135 4.305-4.135 2.62 0 4.215 1.702 4.215 4.135 0 .89.112 1.375.483 1.375.409 0 .614-1.357.614-1.357.296-2.48 1.058-3.753 2.99-4.288-2.247-.227-2.618-1.907-2.618-3.097 0-2.017 1.115-3.255 3.715-3.255h4.51v1.717h-2.12c-1.876 0-2.06.563-2.32 2.545h-2.1c.298-2.775.874-4.262 4.42-4.262h1.992V10.455h-1.99c-2.454 0-3.328 1.096-3.44 2.898-.557-1.84-1.802-2.898-3.808-2.898-1.988 0-3.27 1.096-3.826 2.898-.112-1.802-.985-2.898-3.42-2.898H2.54z" />
    </svg>
  ),
  IBM: (props: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M0 6.648h10.975v1.312H0zM0 8.788h10.975v1.312H0zM0 10.929h10.975v1.313H0zM0 13.069h10.975v1.312H0zM0 15.21h10.975v1.312H0zM0 17.348h10.975v1.313H0zM12.28 6.648h11.719v1.312H12.28zM12.28 8.788h11.719v1.312H12.28zM12.28 10.929h1.95v1.313h-1.95zM12.28 13.069h1.95v1.312h-1.95zM22.049 10.929h1.95v1.313h-1.95zM22.049 13.069h1.95v1.312h-1.95zM15.222 10.929h5.856v1.313h-5.856zM15.222 13.069h5.856v1.312h-5.856zM12.28 15.21h11.719v1.312H12.28zM12.28 17.348h11.719v1.313H12.28z" />
    </svg>
  ),
  Cloudflare: (props: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.44 3.75c-3.72 0-6.85 2.65-7.69 6.2-.38-.04-.76-.06-1.15-.06C1.61 9.89 0 11.5 0 13.49c0 1.99 1.61 3.6 3.6 3.6h9.91c2.48 0 4.5-2.02 4.5-4.5 0-2.28-1.69-4.17-3.88-4.45-.63-2.52-2.9-4.39-5.69-4.39zM19.98 9.53c-.34 0-.67.03-.99.09.43.83.67 1.77.67 2.77 0 .15 0 .29-.01.44.89.28 1.54 1.12 1.54 2.11 0 .09-.01.18-.03.26 1.68-.3 2.84-1.86 2.84-3.6 0-1.99-1.61-3.6-3.6-3.6-.14 0-.28.01-.42.03-.02-.17-.03-.33-.03-.5 0-2.39-1.87-4.33-4.22-4.48.51-.12 1.05-.18 1.6-.18 3.72 0 6.85 2.65 7.69 6.2-.28-.05-.56-.08-.85-.08-.6 0-1.19.11-1.74.31-.02-.05-.03-.11-.05-.16z" />
    </svg>
  )
};

const JobPeelLanding = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDemoToast = () => {
    toast.info("Welcome to JobPeel", {
      description: "This is a custom notification, bypassing native browser alerts.",
      duration: 4000
    });
  };

  const NavLink = ({ href, children }: any) => (
    <a
      href={href}
      className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
    >
      {children}
    </a>
  );

  return (
    <div className="min-h-screen font-sans selection:bg-orange-500 selection:text-white bg-zinc-950 text-zinc-100">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled
          ? 'bg-zinc-950/90 backdrop-blur-md border-zinc-800 py-4'
          : 'bg-transparent border-transparent py-6'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-400 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
              <img
                src="/logos/jobpeel-logo-square.png"
                alt="JobPeel"
                className="relative w-10 h-10 rounded-xl shadow-lg border border-white/10"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              JobPeel
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#features">Platform</NavLink>
            <NavLink href="#institutions">For Schools</NavLink>
            <NavLink href="#vision">Vision</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-orange-600/20 hover:scale-105 active:scale-95"
            >
              Get Started
            </Link>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 border-b border-zinc-800 bg-zinc-950 p-6 flex flex-col gap-4 shadow-xl md:hidden animate-in slide-in-from-top-4">
            <a href="#features" className="text-lg font-medium text-zinc-100">Platform</a>
            <a href="#institutions" className="text-lg font-medium text-zinc-100">For Schools</a>
            <a href="#vision" className="text-lg font-medium text-zinc-100">Vision</a>
            <hr className="border-zinc-800" />
            <Link href="/login" className="text-lg font-medium text-zinc-100">Log in</Link>
            <Link
              href="/signup"
              className="bg-orange-600 text-white w-full py-3 rounded-xl font-medium text-center"
            >
              Get Started
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full -skew-x-12 translate-x-32 -z-10 bg-orange-900/10 blur-[120px]" />
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-[128px] -z-10 bg-zinc-900/80" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-400/5 via-zinc-950/0 to-zinc-950/0 pointer-events-none" />


        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Hero Content */}
            <div className="max-w-2xl">
              <div onClick={handleDemoToast} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium mb-8 bg-zinc-900 border-zinc-800 text-orange-400 hover:bg-zinc-800 hover:border-orange-500/30 transition-all cursor-pointer group">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                New: AI Interview Intelligence
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 text-white">
                Your <span className="text-white relative whitespace-nowrap">
                  unfair advantage
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-orange-600/80 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5 L 100 10 L 0 10 Z" fill="currentColor" />
                  </svg>
                </span> in the job market.
              </h1>

              <p className="text-xl mb-8 leading-relaxed text-zinc-400">
                JobPeel turns the chaotic job search into a clear, guided system. Craft powerful applications, sharpen your positioning, and move from guesswork to strategy.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-2 text-zinc-900 bg-white hover:bg-zinc-200 px-8 py-4 rounded-xl text-base font-bold transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)]"
                >
                  Start Your System
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleDemoToast}
                  className="flex items-center justify-center gap-2 border px-8 py-4 rounded-xl text-base font-semibold transition-all border-zinc-800 text-white hover:bg-zinc-900 hover:border-zinc-700"
                >
                  View Demo
                </button>
              </div>

              <div className="mt-10 flex items-center gap-4 text-sm text-zinc-500">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-800" />
                  ))}
                </div>
                <p className="text-zinc-400">Trusted by 10,000+ candidates</p>
              </div>
            </div>

            {/* Hero Visual - Premium Glass UI */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/30 to-purple-500/30 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-1000"></div>
              <div className="relative bg-zinc-900/90 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-white/10 ring-1 ring-white/5 rotate-1 hover:rotate-0 transition-transform duration-700 ease-out">
                <div className="bg-zinc-950 rounded-xl overflow-hidden border border-white/5">
                  {/* Fake Browser Bar */}
                  <div className="bg-zinc-900/50 px-4 py-3 flex items-center justify-between border-b border-white/5">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
                      <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
                    </div>
                    <div className="text-xs text-zinc-600 font-mono">jobpeel.app</div>
                    <div className="w-4" />
                  </div>

                  {/* Dashboard Content Mockup */}
                  <div className="p-6 md:p-8">
                    {/* Header Area */}
                    <div className="flex justify-between items-start mb-8">
                      <div className="space-y-2">
                        <div className="h-2 w-20 bg-zinc-800/50 rounded-full" />
                        <div className="h-8 w-48 bg-zinc-800 rounded-lg animate-pulse" />
                      </div>
                      <div className="bg-orange-500/10 border border-orange-500/20 h-10 w-10 rounded-xl flex items-center justify-center">
                        <Zap className="text-orange-500 w-5 h-5" />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 hover:border-orange-500/20 transition-colors group/card">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                          <div className="text-xs text-zinc-500 group-hover/card:text-zinc-400 transition-colors">Match Score</div>
                        </div>
                        <div className="text-2xl font-bold text-white">94%</div>
                      </div>
                      <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 hover:border-orange-500/20 transition-colors group/card">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                          <div className="text-xs text-zinc-500 group-hover/card:text-zinc-400 transition-colors">Applications</div>
                        </div>
                        <div className="text-2xl font-bold text-white">12</div>
                      </div>
                    </div>

                    {/* List Items */}
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-zinc-900/30 rounded-lg border border-white/5 hover:bg-zinc-900/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/5" />
                            <div className="space-y-1">
                              <div className="w-24 h-2 bg-zinc-800 rounded-full" />
                              <div className="w-16 h-2 bg-zinc-800/50 rounded-full" />
                            </div>
                          </div>
                          <div className="w-20 h-6 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold tracking-wide flex items-center justify-center border border-green-500/20">
                            VERIFIED
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 p-4 rounded-2xl shadow-xl border border-white/10 bg-zinc-900/80 backdrop-blur-md flex items-center gap-4 animate-bounce duration-[3000ms]">
                <div className="p-2.5 rounded-full bg-green-500/20 border border-green-500/30">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Interview Secured</p>
                  <p className="text-xs text-zinc-500">2 minutes ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="border-y border-white/5 py-12 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-bold text-zinc-600 mb-8 uppercase tracking-[0.2em]">
            Candidates landing roles at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
            {Object.keys(BrandLogos).map((name) => {
              const Logo = BrandLogos[name as keyof typeof BrandLogos];
              return (
                <div key={name} className="relative group transition-all duration-300">
                  <Logo className="h-8 md:h-10 w-auto object-contain text-zinc-700 transition-all duration-500 group-hover:text-white group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Problem / Solution Split */}
      <section className="py-32 bg-zinc-950" id="mission">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              The hiring process is <span className="line-through decoration-orange-600 decoration-4 text-zinc-500">broken</span>.
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Candidates are expected to tailor resumes, navigate opaque systems, and wait for feedback that never comes. The result is wasted effort and emotional burnout.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            <div className="p-10 rounded-3xl border border-white/5 bg-zinc-900/20 backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                <span className="w-1.5 h-8 bg-zinc-700 rounded-full" />
                The Old Way
              </h3>
              <ul className="space-y-6">
                {[
                  "Guessing what employers want",
                  "Blindly submitting applications",
                  "Generic templates and documents",
                  "Ghosted by recruiters",
                  "Feeling disposable"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-zinc-500 group">
                    <div className="p-1 rounded-full bg-zinc-800/50 group-hover:bg-red-900/20 transition-colors">
                      <X className="w-5 h-5 shrink-0 text-zinc-600 group-hover:text-red-500 transition-colors" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-10 rounded-3xl bg-zinc-900 text-white shadow-2xl relative overflow-hidden group border border-white/10 hover:border-orange-500/30 transition-colors duration-500">
              <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/20 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" />
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-orange-500 rounded-full shadow-[0_0_12px_rgba(249,115,22,0.8)]" />
                The JobPeel Way
              </h3>
              <ul className="space-y-6">
                {[
                  "Clear understanding of your positioning",
                  "Strategic, targeted applications",
                  "AI that learns your voice and goals",
                  "Actionable feedback loops",
                  "Prepared, articulate, and competitive"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-zinc-200">
                    <div className="p-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-orange-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Product Pillars Grid */}
      <section className="py-24 bg-zinc-900/30 border-t border-white/5" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20">
            <h2 className="text-4xl font-bold mb-6 text-white">
              A complete career operating system.
            </h2>
            <p className="text-xl text-zinc-400">
              Not just a document tool. A system for clarity, leverage, and momentum.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Target className="w-6 h-6 text-orange-500" />,
                title: "Applicant Clarity",
                desc: "Understand how hiring systems see you. Deep profiling and value positioning.",
                link: null
              },
              {
                icon: <FileText className="w-6 h-6 text-orange-500" />,
                title: "Application Excellence",
                desc: "Smart cover letters and tailored resumes that are strategic representations of you.",
                link: "/resume-optimizer"
              },
              {
                icon: <Users className="w-6 h-6 text-orange-500" />,
                title: "Performance Prep",
                desc: "Real interview practice, scenario play, and feedback loops to help you speak with confidence.",
                link: "/interview-prep"
              },
              {
                icon: <TrendingUp className="w-6 h-6 text-orange-500" />,
                title: "Momentum Tracking",
                desc: "Track applications, responses, and patterns. An OS that shows you where you stand.",
                link: null
              },
              {
                icon: <Zap className="w-6 h-6 text-orange-500" />,
                title: "Talent Signals",
                desc: "Creating verified indicators of skill and readiness that employers can trust.",
                link: null
              },
              {
                icon: <Briefcase className="w-6 h-6 text-orange-500" />,
                title: "Career Companion",
                desc: "A persistent system that grows with you from your first job to your executive role.",
                link: "/resume-builder" // Linking closest match
              }
            ].map((card, i) => (
              <a
                key={i}
                href={card.link || '#'}
                className={`p-8 rounded-2xl border border-white/5 bg-zinc-900/50 transition-all duration-300 group hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-900/10 ${card.link ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-zinc-800 border border-white/5 group-hover:scale-110 transition-transform duration-500 group-hover:bg-zinc-800/80">
                  {card.icon}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-bold text-white">{card.title}</h3>
                  {card.link && <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-orange-500 transition-colors -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0" />}
                </div>

                <p className="leading-relaxed text-zinc-400 group-hover:text-zinc-300 transition-colors">{card.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - High Impact Redesign */}
      <section className="py-32 relative overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 bg-orange-600/5 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="rounded-[2.5rem] p-12 md:p-16 text-center border border-white/10 backdrop-blur-sm bg-zinc-900/40 shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight leading-[1.1] text-white">
                Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">stop guessing?</span>
              </h2>

              <p className="text-xl mb-12 max-w-2xl mx-auto leading-relaxed text-zinc-300">
                Join the career operating system that gives you the leverage you deserve. Stop sending blind applications today.
              </p>

              <div className="flex flex-col items-center gap-8">
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                  <Link
                    href="/signup"
                    className="group relative bg-white text-zinc-950 px-10 py-4 rounded-xl text-lg font-bold transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.6)] hover:scale-105 active:scale-95"
                  >
                    Start Peeling For Free
                  </Link>
                  <button className="px-10 py-4 rounded-xl text-lg font-bold transition-all border border-white/10 text-white hover:bg-white/5">
                    Book a Demo
                  </button>
                </div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
                  No credit card required · Free 3-day trial
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-16 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <img src="/logos/jobpeel-logo-square.png" alt="JobPeel" className="w-8 h-8 rounded-lg grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
            <span className="font-bold text-zinc-300">JobPeel</span>
          </div>

          <div className="flex gap-8 text-sm text-zinc-600">
            <a href="#" className="hover:text-orange-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Terms</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Twitter</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Contact</a>
          </div>

          <p className="text-zinc-700 text-sm">© 2026 JobPeel Inc.</p>
        </div>
      </footer>
    </div>
  );
};

export default JobPeelLanding;
