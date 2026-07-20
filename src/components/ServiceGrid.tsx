import React from "react";
import { ShieldAlert, Printer, GraduationCap, ChevronRight } from "lucide-react";

interface ServiceGridProps {
  onSelectService: (serviceId: string) => void;
}

export default function ServiceGrid({ onSelectService }: ServiceGridProps) {
  const pillars = [
    {
      id: "cac-intake",
      title: "Corporate Affairs (CAC)",
      badge: "Smart Intake",
      icon: <ShieldAlert className="h-5 w-5 text-[#1D1D1F]" />,
      description: "Fast-track legal establishment. Enter your preferred business structure to run simulated legal checks, review compliance scores, and download draft guidelines.",
      details: ["Suitability Rating Scan", "Prohibited Words Filter", "Instant PDF Template Brief"]
    },
    {
      id: "command-center",
      title: "Print & Job Command",
      badge: "Dynamic Quotes",
      icon: <Printer className="h-5 w-5 text-[#1D1D1F]" />,
      description: "Configure corporate paper orders, high-volume documentation, binding settings, or design/typing contracts. Get a real-time price quotation dynamically.",
      details: ["Print, Scan, Design & Typography", "Volume-discount scaling matrix", "Spiral & Hardback finishing choices"]
    },
    {
      id: "academy",
      title: "Tech Academy",
      badge: "Enrollments",
      icon: <GraduationCap className="h-5 w-5 text-[#1D1D1F]" />,
      description: "Acquire market-ready professional skills. Register for Coding or Advanced corporate administration programs, with live batch registration countdowns.",
      details: ["Coding Program (1 Month Intensive)", "Microsoft Office Efficiency Mastery", "On-screen Printable Admission Letters"]
    }
  ];

  return (
    <section id="what-we-do" className="py-32 relative overflow-hidden">
      {/* Subtle backing circles */}
      <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-200/40 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e5e7_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-24 space-y-4">
          <p className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-[#8E8E93]">Services Ecosystem</p>
          <h2 className="font-sans text-3xl md:text-4xl font-extrabold tracking-tight text-[#1D1D1F]">
            Bato Sam Interactive Pillars
          </h2>
          <p className="font-sans text-xs md:text-sm text-zinc-500 font-medium leading-relaxed max-w-md mx-auto">
            Configure, calculate, and submit enterprise jobs directly to our operations desk via fully integrated, real-time client side workflows.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid gap-10 md:grid-cols-3">
          {pillars.map((p) => (
            <div
              key={p.id}
              className="group relative flex flex-col justify-between rounded-[32px] glass-panel p-8 shadow-mdx hover:scale-[1.02] active:scale-[0.99] transition-all duration-500 relative overflow-hidden"
            >
              {/* Card glossy lighting overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-black border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                    {p.icon}
                  </div>
                  <span className="rounded-full bg-white/40 border border-white/50 px-3 py-1 font-mono text-[8px] font-extrabold text-[#1D1D1F] uppercase tracking-wider">
                    {p.badge}
                  </span>
                </div>

                <h3 className="mt-8 font-sans text-base font-extrabold text-[#1D1D1F] uppercase tracking-wider">
                  {p.title}
                </h3>
                <p className="mt-3 font-sans text-[11px] text-zinc-500 leading-relaxed font-medium">
                  {p.description}
                </p>

                {/* Bullets lists */}
                <ul className="mt-8 space-y-2.5 border-t border-zinc-200/40 pt-6">
                  {p.details.map((detail, index) => (
                    <li key={index} className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium tracking-wide">
                      <div className="h-1 w-1 rounded-full bg-[#1D1D1F]" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action */}
              <div className="mt-10 pt-4">
                <button
                  onClick={() => onSelectService(p.id)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-[24px] silver-chrome-btn py-3 text-[10px] font-black uppercase tracking-wider cursor-pointer border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 text-zinc-800 active:scale-95 transition-all"
                >
                  <span>Access Tool</span>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
