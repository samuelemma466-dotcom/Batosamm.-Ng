import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, ShieldCheck, Zap, Laptop, Terminal, UserCheck } from "lucide-react";

interface HeroProps {
  onStartProject: () => void;
  onGetStarted: () => void;
  currentUser: any;
}

export default function Hero({ onStartProject, onGetStarted, currentUser }: HeroProps) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleQuickSearch = async (text: string) => {
    setQuery(text);
    setSearching(true);
    setResult(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ sender: "user", text }],
        }),
      });

      if (!response.ok) {
        throw new Error("AI Assistant timed out.");
      }

      const data = await response.json();
      setResult(data.text);
    } catch (err) {
      if (text.toLowerCase().includes("ngo")) {
        setResult("Standard CAC NGO (Incorporated Trustees) registration includes legal constitution drafting, trust board verification, and publication. Subtotal starts at $150.00 equivalent. Register under the CAC Registry tab!");
      } else if (text.toLowerCase().includes("course") || text.toLowerCase().includes("web")) {
        setResult("Our Tech Academy Web Development Bootcamp is a 1-month intensive program covering HTML5, Tailwind, React, Node.js, and Express. Graduates receive immediate verified certification. Join under the Academy tab!");
      } else {
        setResult("Bato Sam Digital Hub provides elite business services including CAC registries, high-volume digital document print, and certified academies. Access the appropriate workspace section dynamically!");
      }
    } finally {
      setSearching(false);
    }
  };

  const handleFormSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    handleQuickSearch(query);
  };

  return (
    <section id="hero" className="relative overflow-hidden py-24 sm:py-32 md:py-40 bg-[#FBFBFC] dark:bg-zinc-950 transition-colors duration-300 border-b border-zinc-200/40 dark:border-zinc-900">
      
      {/* Background Dynamic Elements */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] dark:bg-[radial-gradient(#1e1e24_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none" />
      
      {/* Premium Ambient Light Blurs - Minimalist Noir/Slate */}
      <div className="absolute top-1/10 left-1/3 h-[500px] w-[500px] rounded-full bg-zinc-200/30 dark:bg-zinc-800/10 blur-[120px] pointer-events-none animate-pulse duration-10000" />
      <div className="absolute bottom-1/10 right-1/4 h-[400px] w-[400px] rounded-full bg-zinc-100/40 dark:bg-zinc-900/15 blur-[100px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid gap-16 lg:grid-cols-12 lg:items-center">
          
          {/* Left Column: Core Display Typography & Narrative */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col items-start space-y-8"
          >
            {/* Minimalist badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/60 bg-white/70 dark:bg-zinc-900/60 dark:border-zinc-800 backdrop-blur-md px-4 py-1.5 text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-600 dark:text-zinc-400 shadow-sm">
              <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
              <span>Enterprise Operating System v1.0.0</span>
            </div>

            {/* Giant display typography */}
            <div className="space-y-3">
              <h1 className="font-sans text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-zinc-950 dark:text-white uppercase leading-none">
                BATO SAM<span className="text-zinc-400 font-normal">.</span>
              </h1>
              <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                DIGITAL HUB & ACADEMY
              </h2>
            </div>

            <p className="max-w-xl font-sans text-sm sm:text-base leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
              A high-end administrative network delivering iron-clad corporate affairs registry filings, state-of-the-art document processing pipelines, and elite career development courses. Authenticate your terminal to begin.
            </p>

            {/* Premium Animated Call-To-Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
              {currentUser ? (
                <button
                  onClick={onStartProject}
                  className="group relative flex items-center justify-center gap-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black px-8 py-4 text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-md border border-zinc-950 dark:border-white hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Launch Workspace</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={onGetStarted}
                  className="group relative flex items-center justify-center gap-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black px-8 py-4 text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-md border border-zinc-950 dark:border-white hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              <button
                onClick={() => {
                  const el = document.getElementById("what-we-do");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 px-8 py-4 text-xs font-black uppercase tracking-widest transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>What We Do</span>
              </button>
            </div>

            {/* Value props indicators */}
            <div className="pt-10 border-t border-zinc-200/60 dark:border-zinc-900 w-full grid grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-900 dark:text-white tracking-wider uppercase">SECURE FILINGS</p>
                  <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">CAC Registries</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white shadow-sm">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-900 dark:text-white tracking-wider uppercase">PRINT ENGINE</p>
                  <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Automated Quotes</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white shadow-sm">
                  <Laptop className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-900 dark:text-white tracking-wider uppercase">TECH TRAINING</p>
                  <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Direct Entry</p>
                </div>
              </div>
            </div>

          </motion.div>

          {/* Right Column: High-End Interactive Tech Console */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="lg:col-span-5 relative flex justify-center"
          >
            
            <div className="relative w-full max-w-md rounded-[24px] border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 backdrop-blur-xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 dark:via-zinc-800/5 dark:to-zinc-800/10 pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/80 pb-4 mb-5 relative z-10">
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-zinc-950 dark:bg-white" />
                  <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                  <div className="h-2 w-2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <span className="font-mono text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
                  <Terminal className="h-3 w-3" />
                  REGISTRAR_QUERY_SYS
                </span>
              </div>

              <div className="space-y-6 relative z-10">
                {/* Proposed Search Input */}
                <form onSubmit={handleFormSearch} className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ask about CAC pricing or courses..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3.5 pr-12 text-xs font-semibold text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={searching}
                    className="absolute right-2 top-2 p-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {searching ? (
                      <span className="h-4 w-4 block rounded-full border-2 border-zinc-500 border-t-white animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </button>
                </form>

                {/* Simulated fast query buttons */}
                <div className="space-y-2">
                  <p className="text-[8px] font-mono font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Fast Search Profiles:</p>
                  <div className="flex flex-col gap-2">
                    {[
                      "How much to register an NGO?",
                      "Tell me about Web Dev course",
                      "How much to print 50 color pages?"
                    ].map((prompt, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleQuickSearch(prompt)}
                        className="text-left w-full rounded-xl bg-white/40 dark:bg-zinc-950/40 p-3 border border-zinc-200/50 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-950 text-[10px] font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-all flex items-center justify-between group"
                      >
                        <span className="truncate pr-4">{prompt}</span>
                        <ArrowRight className="h-3 w-3 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-950 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive display terminal */}
                <div className="rounded-xl border border-zinc-200/50 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 p-4 min-h-[110px] relative overflow-hidden flex flex-col justify-between font-mono text-[10px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {searching ? (
                    <div className="flex flex-col items-center justify-center py-5 text-zinc-400 dark:text-zinc-500 gap-2 font-mono font-bold">
                      <span className="h-4 w-4 block rounded-full border-2 border-zinc-500 border-t-zinc-950 dark:border-t-white animate-spin" />
                      <span className="animate-pulse tracking-widest text-[8px] uppercase">FETCHING DATA STREAM...</span>
                    </div>
                  ) : result ? (
                    <div className="space-y-1.5 text-zinc-800 dark:text-zinc-200">
                      <div className="flex items-center gap-1.5 text-zinc-950 dark:text-white font-bold uppercase tracking-wider text-[8px] border-b border-zinc-200/50 dark:border-zinc-800/80 pb-1.5">
                        <Sparkles className="h-3 w-3 text-zinc-950 dark:text-white" />
                        <span>TERMINAL OUTPUT:</span>
                      </div>
                      <p className="text-[10px] font-medium leading-relaxed">{result}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-5 text-zinc-400 dark:text-zinc-500 gap-1 text-center font-bold">
                      <Terminal className="h-4 w-4 mb-1" />
                      <span>SECURE CONSOLE STANDBY</span>
                    </div>
                  )}

                  <div className="border-t border-zinc-200/40 dark:border-zinc-800/40 pt-2 mt-2 flex justify-between items-center text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    <span>SECURITY STATE:</span>
                    <span className="text-emerald-500 font-extrabold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                      ACTIVE
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
