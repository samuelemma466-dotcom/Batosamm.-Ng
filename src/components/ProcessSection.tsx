import { FileEdit, Sparkles, CheckSquare, Truck } from "lucide-react";

export default function ProcessSection() {
  const steps = [
    {
      num: "01",
      title: "Design & Configure",
      icon: <FileEdit className="h-5 w-5 text-blue-600" />,
      description: "Submit your preferences through our tailored forms. Choose your proposed business name, upload files for print, or configure your student parameters."
    },
    {
      num: "02",
      title: "Instant AI Review",
      icon: <Sparkles className="h-5 w-5 text-blue-600" />,
      description: "Our Gemini-backed legal evaluation and real-time print pricing matrices verify inputs, provide immediate estimates, and prepare standard templates."
    },
    {
      num: "03",
      title: "Secure Settlement",
      icon: <CheckSquare className="h-5 w-5 text-blue-600" />,
      description: "Verify your custom results or admission documentation, and authorize safe deposit processing or template approvals in one structured view."
    },
    {
      num: "04",
      title: "Rapid Dispatch & Fulfillment",
      icon: <Truck className="h-5 w-5 text-blue-600" />,
      description: "Receive your final certified CAC filing packages, high-end bound documents, or official career credentials directly at your home or office."
    }
  ];

  return (
    <section id="process" className="bg-slate-50 py-24 border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-blue-600">The Blueprint</p>
          <h2 className="mt-2 font-sans text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Our Interactive Project Pipeline
          </h2>
          <p className="mt-4 font-sans text-sm text-slate-600 leading-relaxed">
            How we handle your digital and educational workflows from initial configuration to corporate hand-off.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative">
          {/* Connecting line on desktop */}
          <div className="hidden lg:block absolute top-[44px] left-[15%] right-[15%] h-0.5 bg-slate-200/60 z-0" />

          {steps.map((s, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center p-6 bg-white rounded-xl border border-slate-200/60 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 border border-slate-100 text-blue-600 shadow-sm relative mb-5">
                {s.icon}
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white">
                  {s.num}
                </span>
              </div>
              
              <h3 className="font-sans text-sm font-bold text-slate-950 uppercase tracking-wide">
                {s.title}
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
