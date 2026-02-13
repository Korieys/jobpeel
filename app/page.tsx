"use client";

import React from 'react';
import { WaitlistForm } from '@/components/WaitlistForm';
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
  Check
} from 'lucide-react';

const NewBrandLogos = [
  { name: 'Google', src: '/logos/google.png', className: 'h-24 md:h-32' },
  { name: 'Amazon', src: '/logos/amazon.png', className: 'h-24 md:h-32' },
  { name: 'SpaceX', src: '/logos/spacex.png', className: 'h-20 md:h-24' }, // SpaceX often looks wide/small
  { name: 'Meta', src: '/logos/meta.png', className: 'h-24 md:h-32' },
];

const JobPeelLanding = () => {
  return (
    <div className="min-h-screen font-sans selection:bg-orange-500 selection:text-white bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Navigation - Simplified */}
      <nav className="absolute top-0 left-0 right-0 z-50 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col relative overflow-hidden">

        {/* Hero Section */}
        <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 relative">
          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-1/3 h-full -skew-x-12 translate-x-32 -z-10 bg-orange-900/10 blur-[120px]" />
          <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-[128px] -z-10 bg-zinc-900/80" />

          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">

              {/* Left Column: Copy & Form */}
              <div className="max-w-xl">
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 text-white">
                  Help more students land interviews with <span className="text-orange-500">tailored applications on autopilot</span>.
                </h1>

                <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                  JobPeel turns a student's resume and a job link into a focused cover letter that matches the role, plus suggestions to tighten their resume. Career staff stop rewriting documents from scratch and instead guide students using drafts that are already aligned with each posting.
                </p>

                <div className="bg-zinc-900/30 p-1 rounded-2xl border border-white/5 backdrop-blur-sm">
                  <WaitlistForm />
                </div>
              </div>

              {/* Right Column: Visual support */}
              <div className="relative hidden lg:block">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-2xl blur-2xl opacity-50"></div>
                <div className="relative bg-zinc-900/90 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-white/10 ring-1 ring-white/5 rotate-1 hover:rotate-0 transition-transform duration-700 ease-out">
                  <div className="bg-zinc-950 rounded-xl overflow-hidden border border-white/5 aspect-[4/3] flex flex-col relative">
                    {/* Browser Bar */}
                    <div className="bg-zinc-900/50 px-4 py-3 flex items-center gap-2 border-b border-white/5">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
                      </div>
                      <div className="ml-4 bg-zinc-800/50 px-3 py-1 rounded-md flex items-center gap-2 border border-white/5">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                        <span className="text-[10px] font-mono text-zinc-400">jobpeel.app/workspace/active</span>
                      </div>
                    </div>

                    {/* Workspace Content */}
                    <div className="p-6 flex-grow flex flex-col gap-6">

                      {/* Header: Role & Inputs */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-white text-lg">Product Designer</h3>
                          <p className="text-zinc-500 text-xs">Stripe • Remote</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px]">MJ</div>
                          </div>
                        </div>
                      </div>

                      {/* Input Area (Source) */}
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

                      {/* Analysis & Output Area */}
                      <div className="bg-zinc-900/50 rounded-lg p-4 border border-white/5 flex-grow flex gap-4">
                        {/* Match Score */}
                        <div className="w-1/3 flex flex-col items-center justify-center pt-2">
                          <div className="relative w-20 h-20 rounded-full border-4 border-zinc-800 flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full -rotate-90 text-green-500 overflow-visible">
                              <circle cx="50%" cy="50%" r="36" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="226" strokeDashoffset="20" strokeLinecap="round" />
                            </svg>
                            <div className="text-center">
                              <span className="text-2xl font-bold text-white">94</span>
                              <span className="text-[10px] block text-zinc-500">% Match</span>
                            </div>
                          </div>
                        </div>

                        {/* Tasks List */}
                        <div className="w-2/3 space-y-2">
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

                          {/* Typewriter Preview */}
                          <div className="mt-2 text-[10px] text-zinc-500 font-mono bg-black/20 p-2 rounded leading-relaxed opacity-70">
                            "I’m excited to apply for the Product Designer role. My experience building <span className="text-orange-400 bg-orange-500/10">design systems</span>..."
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="border-y border-white/5 py-12 bg-zinc-950/50">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-xs font-bold text-zinc-600 mb-8 uppercase tracking-[0.2em]">
              Helping students land roles at
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 hover:opacity-100 transition-opacity">
              {NewBrandLogos.map((logo: any) => (
                <div key={logo.name} className="relative group transition-all duration-300">
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className={`${logo.className} w-auto object-contain ${logo.disableFilter ? '' : 'brightness-0 invert'} opacity-70 group-hover:opacity-100 transition-all duration-500`}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Problem / Solution Split */}
        <section className="py-32 bg-zinc-950 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-zinc-950 to-zinc-950 -z-10" />
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-24">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                The hiring process is <span className="line-through decoration-orange-600 decoration-4 text-zinc-500">broken</span>.
              </h2>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Students send generic applications into the void. Career centers are overwhelmed reviewing endless drafts. The result is wasted effort and missed opportunities.
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
                    "Guessing what ATS systems want",
                    "Blindly submitting generic resumes",
                    "Career staff rewriting from scratch",
                    "Students ghosted by recruiters",
                    "Low interview conversion rates"
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
                    "Clear understanding of candidate positioning",
                    "Tailored applications for every role",
                    "AI that learns the student's voice",
                    "Staff act as strategic guides, not editors",
                    "Prepared, articulate, and competitive candidates"
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
                Not just a document tool. A system for clarity, leverage, and momentum for your program.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <Target className="w-6 h-6 text-orange-500" />,
                  title: "Applicant Clarity",
                  desc: "Deep profiling that helps students understand their unique value positioning in the market."
                },
                {
                  icon: <FileText className="w-6 h-6 text-orange-500" />,
                  title: "Application Excellence",
                  desc: "Smart cover letters and tailored resumes that are strategic representations of the candidate."
                },
                {
                  icon: <Users className="w-6 h-6 text-orange-500" />,
                  title: "Interview Prep",
                  desc: "Real practice with AI-generated questions specific to the role and their background."
                },
                {
                  icon: <TrendingUp className="w-6 h-6 text-orange-500" />,
                  title: "Placement Momentum",
                  desc: "Track applications and outcomes. Give your program visibility into student success."
                },
                {
                  icon: <Zap className="w-6 h-6 text-orange-500" />,
                  title: "Talent Signals",
                  desc: "Creating verified indicators of skill and readiness that employers can trust."
                },
                {
                  icon: <Briefcase className="w-6 h-6 text-orange-500" />,
                  title: "Career Companion",
                  desc: "A persistent system that grows with your alumni from their first job to executive roles."
                }
              ].map((card, i) => (
                <div
                  key={i}
                  className="p-8 rounded-2xl border border-white/5 bg-zinc-900/50 transition-all duration-300 group hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-900/10 cursor-default"
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-zinc-800 border border-white/5 group-hover:scale-110 transition-transform duration-500 group-hover:bg-zinc-800/80">
                    {card.icon}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xl font-bold text-white">{card.title}</h3>
                  </div>

                  <p className="leading-relaxed text-zinc-400 group-hover:text-zinc-300 transition-colors">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/logos/jobpeel-logo-square.png" alt="JobPeel" className="w-6 h-6 rounded-md grayscale opacity-50" />
            <span className="font-bold text-zinc-500 text-sm">JobPeel Inc.</span>
          </div>
          <p className="text-zinc-700 text-xs">© 2026 All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default JobPeelLanding;
