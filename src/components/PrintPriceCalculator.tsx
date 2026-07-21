import React, { useState, useEffect } from "react";
import { Calculator, Sparkles, HelpCircle, Coins, Layers, CheckCircle2 } from "lucide-react";
import { getPricingConfig } from "../utils/pricingConfig";

interface PrintPriceCalculatorProps {
  onApplySpecs?: (specs: {
    paperWeight: "80gsm" | "120gsm" | "250gsm" | "300gsm";
    finishing: "None" | "Stapling" | "Spiral Binding" | "Hardback Cover" | "Laminating";
    quantity: number;
    colorMode: "Mono" | "Color";
  }) => void;
  initialSpecs?: {
    paperWeight: "80gsm" | "120gsm" | "250gsm" | "300gsm";
    finishing: "None" | "Stapling" | "Spiral Binding" | "Hardback Cover" | "Laminating";
    quantity: number;
    colorMode: "Mono" | "Color";
  };
}

export default function PrintPriceCalculator({ onApplySpecs, initialSpecs }: PrintPriceCalculatorProps) {
  // Inputs
  const [paperWeight, setPaperWeight] = useState<"80gsm" | "120gsm" | "250gsm" | "300gsm">(
    initialSpecs?.paperWeight || "80gsm"
  );
  const [paperFinish, setPaperFinish] = useState<"Glossy" | "Matte" | "Satin" | "Uncoated">("Uncoated");
  const [finishing, setFinishing] = useState<"None" | "Stapling" | "Spiral Binding" | "Hardback Cover" | "Laminating">(
    initialSpecs?.finishing || "None"
  );
  const [colorMode, setColorMode] = useState<"Mono" | "Color">(initialSpecs?.colorMode || "Mono");
  const [pages, setPages] = useState<number>(10);
  const [quantity, setQuantity] = useState<number>(initialSpecs?.quantity || 1);

  // Status for apply action feedback
  const [applied, setApplied] = useState(false);

  const [pricing, setPricing] = useState(getPricingConfig());

  useEffect(() => {
    const handlePricesUpdated = () => {
      setPricing(getPricingConfig());
    };
    window.addEventListener("bato_prices_updated", handlePricesUpdated);
    return () => window.removeEventListener("bato_prices_updated", handlePricesUpdated);
  }, []);

  // Live Sync initialSpecs if they change
  useEffect(() => {
    if (initialSpecs) {
      if (initialSpecs.paperWeight) setPaperWeight(initialSpecs.paperWeight);
      if (initialSpecs.finishing) setFinishing(initialSpecs.finishing);
      if (initialSpecs.quantity) setQuantity(initialSpecs.quantity);
      if (initialSpecs.colorMode) setColorMode(initialSpecs.colorMode);
    }
  }, [initialSpecs]);

  // Pricing constants & logic (aligned with Bato Sam print system)
  const calculateCost = () => {
    let ratePerPage = colorMode === "Color" ? pricing.printColor : pricing.printMono;

    // Weight additions
    if (paperWeight === "120gsm") ratePerPage += 0.05;
    else if (paperWeight === "250gsm") ratePerPage += 0.15;
    else if (paperWeight === "300gsm") ratePerPage += 0.25;

    // Finish additions
    if (paperFinish === "Glossy") ratePerPage += 0.05;
    else if (paperFinish === "Matte") ratePerPage += 0.03;
    else if (paperFinish === "Satin") ratePerPage += 0.04;

    // Finishing rates
    let finishingCost = 0;
    if (finishing === "Stapling") finishingCost = pricing.finishStapling;
    else if (finishing === "Spiral Binding") finishingCost = pricing.finishSpiral;
    else if (finishing === "Hardback Cover") finishingCost = pricing.finishHardback;
    else if (finishing === "Laminating") finishingCost = pricing.finishLaminating;

    const baseFlatCost = 0;
    const subtotal = (pages * ratePerPage + finishingCost) * quantity + baseFlatCost;
    
    // Apply volume discount above 10 copies
    const finalUSD = quantity >= 10 ? subtotal * 0.90 : subtotal;
    const finalNGN = Math.max(500, finalUSD * pricing.nairaRate); // Dynamic conversion rate with a ₦500 floor

    return {
      ratePerPage,
      finishingCost,
      finalUSD,
      finalNGN,
      isDiscounted: quantity >= 10
    };
  };

  const { ratePerPage, finishingCost, finalUSD, finalNGN, isDiscounted } = calculateCost();

  const handleApply = () => {
    if (onApplySpecs) {
      onApplySpecs({
        paperWeight,
        finishing,
        quantity,
        colorMode
      });
      setApplied(true);
      setTimeout(() => setApplied(false), 2000);
    }
  };

  return (
    <div className="rounded-[32px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-mdx transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-sans text-sm font-extrabold text-zinc-900 dark:text-zinc-50">Instant Quote Calculator</h4>
          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Dynamic parameter simulation</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Color Mode Selection Toggle */}
        <div>
          <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Color Profile</span>
          <div className="grid grid-cols-2 gap-2">
            {(["Mono", "Color"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setColorMode(mode)}
                className={`rounded-xl py-2 text-xs font-bold border transition-all text-center cursor-pointer ${
                  colorMode === mode
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100 shadow-xs"
                    : "bg-white text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850"
                }`}
              >
                {mode === "Color" ? "Color Laser" : "Black & White"}
              </button>
            ))}
          </div>
        </div>

        {/* Paper Type (Weight) Dropdown */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
            Paper Weight (Type)
          </label>
          <select
            value={paperWeight}
            onChange={(e: any) => setPaperWeight(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="80gsm">Standard Bond (80 GSM)</option>
            <option value="120gsm">Fine Presentation (120 GSM)</option>
            <option value="250gsm">Smooth Cardstock (250 GSM)</option>
            <option value="300gsm">Premium Cover Board (300 GSM)</option>
          </select>
        </div>

        {/* Paper Finish Dropdown */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
            Paper Coating & Finish
          </label>
          <select
            value={paperFinish}
            onChange={(e: any) => setPaperFinish(e.target.value as any)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="Uncoated">Smooth Uncoated (Matte Bond)</option>
            <option value="Glossy">High-Gloss Photo finish (+ $0.05)</option>
            <option value="Matte">Premium Soft Matte (+ $0.03)</option>
            <option value="Satin">Satin Pearl Semi-Gloss (+ $0.04)</option>
          </select>
        </div>

        {/* Finishing Options */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
            Binding & Finishing Style
          </label>
          <select
            value={finishing}
            onChange={(e: any) => setFinishing(e.target.value as any)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="None">Loose Sheets (No Binding)</option>
            <option value="Stapling">Stapled Corner (+ $0.20)</option>
            <option value="Spiral Binding">Spiral Coil Binding (+ $1.20)</option>
            <option value="Laminating">Clear Seal Lamination (+ $0.80)</option>
            <option value="Hardback Cover">Premium Hardback Binding (+ $4.50)</option>
          </select>
        </div>

        {/* Quantity and Pages */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
              Pages Count
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setPages(Math.max(1, pages - 1))}
                className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-l-xl bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                min={1}
                value={pages}
                onChange={(e) => setPages(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-center border-y border-zinc-200 dark:border-zinc-800 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={() => setPages(pages + 1)}
                className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-r-xl bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
              Copies (Quantity)
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-l-xl bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-center border-y border-zinc-200 dark:border-zinc-800 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-r-xl bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Live Calculation Output Display Box */}
        <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white relative overflow-hidden shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Coins className="h-3 w-3 text-emerald-400" />
              SPOOL ESTIMATION
            </span>
            {isDiscounted && (
              <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded text-[7px] font-black tracking-widest px-1.5 py-0.5 uppercase animate-pulse">
                10% Off Applied
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between mt-3.5">
            <div>
              <span className="text-2xl font-black tracking-tight text-white">₦{finalNGN.toLocaleString()}</span>
              <span className="text-[9px] font-bold text-zinc-400 block font-mono">EST. NAIRA VALUE</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-slate-300">${finalUSD.toFixed(2)}</span>
              <span className="text-[9px] font-bold text-zinc-500 block font-mono">USD EQUIVALENT</span>
            </div>
          </div>

          <div className="border-t border-white/5 mt-3 pt-2 text-[9px] text-slate-500 flex justify-between">
            <span>Base rate: ${ratePerPage.toFixed(2)} / page</span>
            <span>Finishing: ${finishingCost.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Button: Load Specs to Configurator */}
        {onApplySpecs && (
          <button
            type="button"
            onClick={handleApply}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-950 py-3 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            {applied ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Specs Synced perfectly!</span>
              </>
            ) : (
              <>
                <Layers className="h-4 w-4" />
                <span>Apply Specs to Order Wizard</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
