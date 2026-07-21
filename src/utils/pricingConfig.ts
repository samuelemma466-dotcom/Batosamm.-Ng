// BATO SAM. NG - Centralized Pricing Engine Configuration
// Dynamically editable by administrators from the Command Center settings tab.

export interface BatoPricingConfig {
  // CAC Registration Services (NGN)
  cacBusinessName: number;
  cacLtd: number;
  cacNgo: number;

  // Laser Printing Base Page Rates (USD)
  printMono: number;
  printColor: number;

  // Bindery & Finishing Surcharges (USD)
  finishSpiral: number;
  finishHardback: number;
  finishLaminating: number;
  finishStapling: number;

  // Currency Exchange Rate (NGN per USD)
  nairaRate: number;
}

export const DEFAULT_PRICING: BatoPricingConfig = {
  cacBusinessName: 35000,
  cacLtd: 60000,
  cacNgo: 120000,
  printMono: 0.08,
  printColor: 0.35,
  finishSpiral: 3.50,
  finishHardback: 15.00,
  finishLaminating: 1.00,
  finishStapling: 0.20,
  nairaRate: 1500,
};

export function getPricingConfig(): BatoPricingConfig {
  if (typeof window === "undefined") return DEFAULT_PRICING;
  const stored = localStorage.getItem("bato_system_pricing");
  if (!stored) {
    localStorage.setItem("bato_system_pricing", JSON.stringify(DEFAULT_PRICING));
    return DEFAULT_PRICING;
  }
  try {
    const parsed = JSON.parse(stored);
    return {
      cacBusinessName: Number(parsed.cacBusinessName ?? DEFAULT_PRICING.cacBusinessName),
      cacLtd: Number(parsed.cacLtd ?? DEFAULT_PRICING.cacLtd),
      cacNgo: Number(parsed.cacNgo ?? DEFAULT_PRICING.cacNgo),
      printMono: Number(parsed.printMono ?? DEFAULT_PRICING.printMono),
      printColor: Number(parsed.printColor ?? DEFAULT_PRICING.printColor),
      finishSpiral: Number(parsed.finishSpiral ?? DEFAULT_PRICING.finishSpiral),
      finishHardback: Number(parsed.finishHardback ?? DEFAULT_PRICING.finishHardback),
      finishLaminating: Number(parsed.finishLaminating ?? DEFAULT_PRICING.finishLaminating),
      finishStapling: Number(parsed.finishStapling ?? DEFAULT_PRICING.finishStapling),
      nairaRate: Number(parsed.nairaRate ?? DEFAULT_PRICING.nairaRate),
    };
  } catch (e) {
    console.warn("Error reading pricing config, using default constants", e);
    return DEFAULT_PRICING;
  }
}

export function savePricingConfig(config: BatoPricingConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem("bato_system_pricing", JSON.stringify(config));
  
  // Distribute system-wide broadcast events to force reactive rendering
  window.dispatchEvent(new Event("bato_prices_updated"));
}
