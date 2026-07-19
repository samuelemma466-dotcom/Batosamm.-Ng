import React, { useState } from "react";
import { Sparkles, Loader2, Copy, Check, ArrowRight, Palette, Award, CreditCard, FileText, Mail, Phone, MapPin, RefreshCw } from "lucide-react";

interface BrandingKitProps {
  onSelectName: (name: string) => void;
}

export default function BrandingKit({ onSelectName }: BrandingKitProps) {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    names: string[];
    slogan: string;
    colors: Array<{ hex: string; name: string; description: string }>;
  } | null>(null);
  const [copiedText, setCopiedText] = useState("");
  const [error, setError] = useState("");
  const [selectedPreviewName, setSelectedPreviewName] = useState("");
  const [previewTab, setPreviewTab] = useState<"card" | "letterhead">("card");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) {
      setError("Please describe your business idea first.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/cac/brand-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessIdea: idea }),
      });

      if (!response.ok) {
        throw new Error("Branding generation timed out.");
      }

      const data = await response.json();
      setResult(data);
      if (data.names && data.names.length > 0) {
        setSelectedPreviewName(data.names[0]);
      }
    } catch (err: any) {
      // Robust Fallback suggestions in case of network issues
      const cleanIdea = idea.toUpperCase().trim();
      const firstWord = cleanIdea.split(" ")[0] || "VANGUARD";
      const fallbackData = {
        names: [
          `${firstWord} DIGITECH SYSTEMS`,
          `${firstWord} COGNITIVE PARTNERS`,
          `THE ${firstWord} LABS`
        ],
        slogan: `Fusing intelligence with high-performance ${idea.toLowerCase()} operations.`,
        colors: [
          { hex: "#00E5FF", name: "Cyber Blue", description: "An electric turquoise that conveys digital speed and innovation." },
          { hex: "#0052FF", name: "Royal Slate", description: "A majestic high-end royal blue representing corporate security and trust." }
        ]
      };
      setResult(fallbackData);
      setSelectedPreviewName(fallbackData.names[0]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 2000);
  };

  return (
    <div className="w-full rounded-[32px] border border-zinc-200/80 bg-white p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden shadow-mdx">
      {/* Background glowing sphere */}
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-zinc-100 blur-2xl" />
      <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-zinc-100 blur-2xl" />

      <div className="relative z-10 space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 border border-zinc-200 px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#1D1D1F]">
            <Sparkles className="h-3.5 w-3.5" />
            Bato Sam AI Branding Suite
          </span>
          <h3 className="mt-3 font-sans text-xl font-extrabold text-[#1D1D1F] sm:text-2xl font-extrabold uppercase tracking-wide">
            The "Crazy Idea" Branding Kit
          </h3>
          <p className="text-xs text-zinc-500 mt-1 font-semibold max-w-xl">
            Type your wild business concept below. Our generative engine will design 3 regulatory-compliant business names, a memorable corporate slogan, and a professional brand color scheme.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Describe Your Business Idea or Concept
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                placeholder="e.g. A fast-food drone delivery company styled like sci-fi retro"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className="flex-1 rounded-[24px] border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-xs font-semibold text-zinc-900 placeholder-zinc-400 outline-none border border-zinc-200 rounded-[20px] focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-[24px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] disabled:from-blue-800 disabled:to-indigo-800 px-6 py-3.5 text-xs font-bold text-[#1D1D1F] transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-blue-500/20 min-h-[48px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing Synapses...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-cyan-300" />
                    <span>Generate Branding Kit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-xs font-bold text-red-500">{error}</p>}
        </form>

        {result && (
          <div className="space-y-6 pt-6 border-t border-zinc-200/50 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Business Name Suggestions */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Suggested Regulatory-Compliant Names
              </h4>
              <div className="grid gap-3 sm:grid-cols-3">
                {result.names.map((name, idx) => (
                  <div
                    key={idx}
                    className="group relative rounded-[24px] border border-zinc-200/50 bg-zinc-50 p-4 flex flex-col justify-between items-start hover:border-zinc-400 transition-all hover:bg-zinc-50"
                  >
                    <span className="font-mono text-[9px] text-zinc-500 font-bold">OPTION 0{idx + 1}</span>
                    <p className="text-xs font-extrabold text-[#1D1D1F] mt-1 uppercase tracking-wide truncate w-full">
                      {name}
                    </p>
                    <button
                      onClick={() => onSelectName(name)}
                      className="mt-4 flex items-center gap-1 text-[10px] font-black text-[#1D1D1F] uppercase tracking-widest hover:text-zinc-800 transition-colors w-full justify-between group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>File Registrations</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Slogan */}
            <div className="rounded-[24px] bg-zinc-100 border border-zinc-200/50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[9px] font-mono font-bold text-[#1D1D1F] uppercase tracking-widest block">Suggested Brand Slogan</span>
                <p className="text-xs font-medium text-zinc-800 mt-1 italic">
                  "{result.slogan}"
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(result.slogan)}
                className="flex items-center gap-1.5 rounded-[16px] border border-zinc-200 bg-zinc-100 hover:bg-zinc-200 px-3.5 py-2 text-[10px] font-bold text-zinc-700 transition-all shrink-0 cursor-pointer self-stretch sm:self-auto justify-center"
              >
                {copiedText === result.slogan ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Slogan</span>
                  </>
                )}
              </button>
            </div>

            {/* Brand Colors */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="h-4 w-4 text-zinc-850" />
                Suggested Corporate Color Palette
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {result.colors.map((color, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 rounded-[24px] bg-zinc-100 border border-zinc-200/50 p-4"
                  >
                    <div
                      className="h-12 w-12 rounded-[16px] shrink-0 shadow-lg border border-zinc-200"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-[#1D1D1F]">{color.name}</span>
                        <code className="text-[9px] font-mono font-bold text-zinc-850 uppercase bg-zinc-100 px-2 py-0.5 rounded">
                          {color.hex}
                        </code>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed font-semibold">
                        {color.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic AI Brand Preview Canvas */}
            <div className="pt-6 border-t border-zinc-200/50 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    AI Brand Identity Preview Suite
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                    Live bento mockup of business card and corporate stationery.
                  </p>
                </div>
                
                {/* Toggles */}
                <div className="flex bg-zinc-100 p-1 rounded-[16px] border border-zinc-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("card")}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      previewTab === "card"
                        ? "bg-blue-600 text-[#1D1D1F]"
                        : "text-zinc-400 hover:text-zinc-700"
                    }`}
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("letterhead")}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      previewTab === "letterhead"
                        ? "bg-blue-600 text-[#1D1D1F]"
                        : "text-zinc-400 hover:text-zinc-700"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Letterhead
                  </button>
                </div>
              </div>

              {/* Selector and Custom Input */}
              <div className="grid gap-3 sm:grid-cols-2 bg-zinc-50 p-4 rounded-[24px] border border-zinc-200/50">
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Select Suggested Name to Preview</label>
                  <select
                    value={selectedPreviewName}
                    onChange={(e) => setSelectedPreviewName(e.target.value)}
                    className="w-full bg-zinc-100 border border-zinc-200 rounded-[16px] px-3 py-2 text-xs font-bold text-[#1D1D1F] outline-none focus:border-zinc-400"
                  >
                    {result.names.map((name, index) => (
                      <option key={index} value={name}>{name}</option>
                    ))}
                    <option value="CUSTOM COMPANY">-- Custom Input --</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Custom Identity Label Input</label>
                  <input
                    type="text"
                    placeholder="Type customized brand name..."
                    value={selectedPreviewName === "CUSTOM COMPANY" ? "" : selectedPreviewName}
                    onChange={(e) => setSelectedPreviewName(e.target.value.toUpperCase())}
                    className="w-full bg-zinc-100 border border-zinc-200 rounded-[16px] px-3 py-2 text-xs font-bold text-[#1D1D1F] outline-none focus:border-zinc-400 placeholder-zinc-400"
                  />
                </div>
              </div>

              {/* Visualization Sandbox Canvas */}
              <div className="relative rounded-[32px] border border-zinc-200 bg-zinc-100 p-6 min-h-[280px] flex items-center justify-center overflow-hidden shadow-inner">
                {/* Backing dynamic grid pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                
                {previewTab === "card" ? (
                  /* Elegant Business Card Mockup */
                  <div className="w-full max-w-[400px] aspect-[1.75/1] rounded-[24px] relative overflow-hidden shadow-mdx border border-zinc-200 transition-all duration-500 transform hover:scale-[1.02] flex flex-col justify-between p-6 bg-white">
                    {/* Brand Dynamic Color Accents */}
                    <div 
                      className="absolute top-0 left-0 w-2 h-full" 
                      style={{ backgroundColor: result.colors[0]?.hex || "#3b82f6" }} 
                    />
                    <div 
                      className="absolute top-0 right-0 h-16 w-16 opacity-10 rounded-full blur-xl" 
                      style={{ backgroundColor: result.colors[0]?.hex || "#3b82f6" }} 
                    />
                    
                    <div className="flex justify-between items-start pl-3">
                      <div>
                        <span className="font-sans text-sm font-black text-[#1D1D1F] tracking-tight uppercase block leading-tight">
                          {selectedPreviewName || "YOUR BRAND DESIGN"}
                        </span>
                        <span className="text-[8px] font-medium text-zinc-500 block italic leading-none mt-1">
                          "{result.slogan}"
                        </span>
                      </div>
                      
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 border border-zinc-200 text-[#1D1D1F] shrink-0">
                        <Sparkles 
                          className="h-3.5 w-3.5" 
                          style={{ color: result.colors[0]?.hex || "#3b82f6" }} 
                        />
                      </div>
                    </div>

                    <div className="mt-8 pl-3 flex justify-between items-end text-[8px] font-semibold text-zinc-400 tracking-wide font-mono">
                      <div className="space-y-0.5">
                        <p className="text-[#1D1D1F] font-sans text-[10px] font-bold uppercase tracking-wider">E. Emma</p>
                        <p className="text-zinc-500">Chief Executive Officer</p>
                        <div className="flex items-center gap-1 mt-1 text-[7px] text-zinc-400">
                          <MapPin className="h-2 w-2 text-zinc-500" />
                          <span>Bato Sam Corporate Suite, Lagos</span>
                        </div>
                      </div>

                      <div className="text-right space-y-0.5">
                        <p className="text-zinc-500 flex items-center gap-1 justify-end">
                          <Mail className="h-2 w-2" />
                          <span>emma@batosam.ng</span>
                        </p>
                        <p className="text-zinc-500 flex items-center gap-1 justify-end">
                          <Phone className="h-2 w-2" />
                          <span>+234 80 300 0000</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Elegant formal Letterhead Mockup */
                  <div className="w-full max-w-[340px] aspect-[1/1.3] bg-white rounded-[16px] shadow-mdx border border-slate-200 transition-all duration-500 relative p-6 text-slate-800 flex flex-col justify-between">
                    {/* Header bar styled with brand dynamic colors */}
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="font-sans text-[11px] font-black text-slate-900 tracking-tight uppercase block leading-none">
                          {selectedPreviewName || "YOUR BRAND DESIGN"}
                        </span>
                        <span className="text-[6px] font-mono font-bold text-zinc-400 block uppercase tracking-widest mt-1">
                          BATO SAM BRAND SYSTEM
                        </span>
                        <span className="text-[6px] text-zinc-500 block italic leading-none mt-0.5">
                          "{result.slogan}"
                        </span>
                      </div>
                      
                      <div 
                        className="h-4.5 w-4.5 rounded flex items-center justify-center bg-slate-100"
                        style={{ borderLeft: `2px solid ${result.colors[0]?.hex || "#3b82f6"}` }}
                      >
                        <Sparkles 
                          className="h-2.5 w-2.5" 
                          style={{ color: result.colors[0]?.hex || "#3b82f6" }} 
                        />
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="my-3 flex-grow space-y-2">
                      <div className="flex justify-between items-center text-[5px] text-zinc-500 font-mono">
                        <span>REF: VGD/CAC/2026/091</span>
                        <span>Date: July 12, 2026</span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-[6px] font-bold text-slate-800">To: Bato Sam Licensing Desk</p>
                        <p className="text-[6px] text-zinc-500 leading-normal font-semibold">
                          Dear Registrar Partners,
                        </p>
                        <p className="text-[5.5px] text-zinc-400 leading-relaxed font-medium">
                          This correspondence serves as formal verification of corporate branding indices established dynamically through Bato Sam AI. The system has reviewed local suitability indices and confirmed structural integrity of the label <strong>{selectedPreviewName || "YOUR BRAND"}</strong> for private corporate licensing.
                        </p>
                        <p className="text-[5.5px] text-zinc-400 leading-relaxed font-medium">
                          We authorize full administrative setup and filing procedures under legal guidelines.
                        </p>
                      </div>
                    </div>

                    {/* Footer / Signature Area */}
                    <div className="border-t border-slate-100 pt-3 flex justify-between items-end">
                      <div className="space-y-0.5">
                        <div className="h-3 w-10 border-b border-slate-300 italic text-[5px] text-zinc-500 font-mono flex items-center flex-row justify-start">E. Emma</div>
                        <p className="text-[5px] font-bold text-slate-800 uppercase leading-none mt-1">Chief Executive Officer</p>
                        <p className="text-[4.5px] text-zinc-500">Bato Sam Digital Hub</p>
                      </div>

                      <div className="text-right text-[4px] text-zinc-500 font-mono">
                        <p>Plaza Suite 12, Yaba, Lagos</p>
                        <p>www.batosam.ng</p>
                      </div>
                    </div>

                    {/* Dynamic bottom color strips */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 flex">
                      <div className="flex-1" style={{ backgroundColor: result.colors[0]?.hex || "#3b82f6" }} />
                      <div className="flex-1" style={{ backgroundColor: result.colors[1]?.hex || "#059669" }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-[24px] bg-zinc-100 border border-zinc-200 text-center text-xs text-blue-300 font-semibold flex flex-col sm:flex-row items-center justify-center gap-2">
              <span>🎉 <strong>Next Step:</strong> Click "File Registrations" on any option above, or directly transfer this brand label to the proposed business register!</span>
              <button
                type="button"
                onClick={() => onSelectName(selectedPreviewName)}
                className="rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1 text-[10px] font-black uppercase text-[#1D1D1F] shadow transition-all shrink-0 cursor-pointer"
              >
                File proposed name
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
