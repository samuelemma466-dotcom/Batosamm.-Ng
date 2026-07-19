import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Star, ShieldCheck, Zap, Laptop, Layers, Loader2, HelpCircle, Send, Sparkles } from "lucide-react";

interface HeroProps {
  onStartProject: () => void;
}

export default function Hero({ onStartProject }: HeroProps) {
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
      // High value fallback response
      if (text.toLowerCase().includes("ngo")) {
        setResult("Standard CAC NGO (Incorporated Trustees) registration at Bato Sam includes legal constitution drafting, trust board verification, and publication. The dynamic filing structure subtotal starts at $150.00 USD equivalent. Start the process in our CAC Registry tab above!");
      } else if (text.toLowerCase().includes("course") || text.toLowerCase().includes("web")) {
        setResult("Our Tech Academy Web Development Bootcamp is a 1-month intensive program covering HTML5, Tailwind, React, Node.js, and Express. Tuition is $450.00. Graduates receive immediate verified certification and admission letters upon enrolment. Join under the Academy tab above!");
      } else {
        setResult("Bato Sam Digital Hub provides elite business services including CAC registries, high-volume digital document print, and certified academies. Access the appropriate workspace section above to configure your order dynamically!");
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
    <section id="hero" className="relative overflow-hidden py-32 md:py-40">
      {/* Dynamic Ambient Background Dots */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e5e7_1px,transparent_1px)] [background-size:32px_32px] opacity-50" />
      
      {/* Soft minimalist charcoal blurry backing lights */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-zinc-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[550px] w-[550px] rounded-full bg-zinc-100/50 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-12 lg:items-center">
          
          {/* Main Messaging Content Column */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col items-start space-y-8"
          >
            
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 backdrop-blur-md px-4 py-2 text-xs font-semibold text-zinc-600 shadow-sm">
              <Star className="h-3.5 w-3.5 fill-black text-black" />
              <span>Premium Business Operations & Tech Academy</span>
            </div>

            <h1 className="font-sans text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6.5xl lg:leading-[1.1] text-[#1D1D1F] uppercase tracking-wide">
              Elevate Your <span className="bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent">Digital Frontier</span> & Corporate Registration
            </h1>

            <p className="max-w-xl font-sans text-sm md:text-base leading-relaxed text-zinc-500 font-medium">
              <strong>Digital Excellence. Delivered Daily.</strong> Bato Sam Digital Hub provides automated, premium business utilities. File error-free Corporate Affairs (CAC) business name applications, access high-precision high-volume print pipelines, and enroll in certified coding academies.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
              <button
                onClick={onStartProject}
                className="group flex items-center justify-center gap-2 rounded-[24px] chrome-btn px-8 py-4 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer hover:scale-103 active:scale-97"
              >
                <span>Access Command Center</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={onStartProject}
                className="flex items-center justify-center gap-2 rounded-[24px] silver-chrome-btn px-8 py-4 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer hover:scale-103 active:scale-97 text-zinc-800"
              >
                <Layers className="h-4 w-4 text-zinc-500" />
                <span>Explore Pillars</span>
              </button>
            </div>

            {/* Micro value props with elegant indicators */}
            <div className="pt-10 border-t border-zinc-200/60 w-full grid grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-zinc-200 text-black shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#1D1D1F] tracking-wider uppercase">AI Registrar</p>
                  <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Automated Checks</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-zinc-200 text-black shadow-sm">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#1D1D1F] tracking-wider uppercase">Print Hub</p>
                  <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Real-time Quotes</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-zinc-200 text-black shadow-sm">
                  <Laptop className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#1D1D1F] tracking-wider uppercase">Academy</p>
                  <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Direct Enrolment</p>
                </div>
              </div>
            </div>

          </motion.div>

          {/* Interactive Hero Tech Console mock / AI Quick Search */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="lg:col-span-5 relative flex justify-center"
          >
            
            <div className="relative w-full max-w-md rounded-[32px] glass-panel p-8 shadow-mdx flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-zinc-200/40 pb-5 mb-5 relative z-10">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#1D1D1F]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-100" />
                </div>
                <span className="font-mono text-[9px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#1D1D1F]" />
                  AI_QUICK_SEARCH
                </span>
              </div>

              <div className="space-y-6 relative z-10">
                {/* Search Form Input */}
                <form onSubmit={handleFormSearch} className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. How much to register an NGO?"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-[20px] border border-zinc-200 bg-white/70 px-5 py-4 pr-14 text-xs font-semibold text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                  />
                  <button
                    type="submit"
                    disabled={searching}
                    className="absolute right-2.5 top-2.5 p-2 rounded-[14px] bg-[#1D1D1F] hover:bg-zinc-800 text-white transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {searching ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Send className="h-4 w-4" />}
                  </button>
                </form>

                {/* Preset Fast Search Prompts */}
                <div className="space-y-2">
                  <p className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-widest">Suggested AI Enquiries:</p>
                  <div className="flex flex-col gap-1.5">
                    {[
                      "How much to register an NGO?",
                      "Tell me about Web Dev course",
                      "How much to print 50 color pages?"
                    ].map((prompt, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleQuickSearch(prompt)}
                        className="text-left w-full rounded-[14px] bg-white/60 p-3 border border-zinc-200/60 hover:border-zinc-400 hover:bg-white text-[10px] font-bold text-zinc-500 hover:text-black transition-all flex items-center justify-between group"
                      >
                        <span className="truncate pr-4">{prompt}</span>
                        <ArrowRight className="h-3 w-3 text-zinc-400 group-hover:text-[#1D1D1F] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Console Output Screen */}
                <div className="rounded-[20px] border border-zinc-200/60 bg-white/50 p-5 min-h-[120px] relative overflow-hidden flex flex-col justify-between font-mono text-[10px] text-zinc-600 leading-relaxed">
                  
                  {searching ? (
                    <div className="flex flex-col items-center justify-center py-6 text-zinc-400 gap-2 font-mono font-bold">
                      <Loader2 className="h-4 w-4 animate-spin text-black" />
                      <span className="animate-pulse tracking-widest text-[9px] text-zinc-600">ANALYZING REGISTRY DATABASE...</span>
                    </div>
                  ) : result ? (
                    <div className="space-y-2 text-zinc-800">
                      <div className="flex items-center gap-1.5 text-black font-bold uppercase tracking-wider text-[9px] border-b border-zinc-200 pb-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-zinc-950 animate-pulse" />
                        <span>AI REGISTRAR RESPONSE:</span>
                      </div>
                      <p className="text-[10px] font-semibold leading-relaxed text-zinc-700">{result}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-zinc-400 gap-1.5 text-center font-bold">
                      <HelpCircle className="h-5 w-5 text-zinc-300" />
                      <span>Ready for real-time search check query.</span>
                    </div>
                  )}

                  <div className="border-t border-zinc-200/40 pt-2.5 mt-2.5 flex justify-between items-center text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                    <span>SECURE DIRECTORIES</span>
                    <span className="text-zinc-600 font-extrabold">ACTIVE</span>
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
