import React, { useState } from "react";
import { ShieldCheck, Mail, MapPin, Globe, Award, Key, CheckCircle, AlertTriangle } from "lucide-react";
import BatoLogo from "./BatoLogo";

interface FooterProps {
  onChangeTab: (tab: "home" | "printing" | "cac" | "academy" | "dashboard" | "track" | "profile") => void;
  isAdmin: boolean;
  onLoginSuccess: () => void;
}

export default function Footer({ onChangeTab, isAdmin, onLoginSuccess }: FooterProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState("");

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCode === "9999") {
      onLoginSuccess();
      setAdminCode("");
      setShowLogin(false);
      setError("");
      onChangeTab("dashboard");
    } else {
      setError("Invalid secret credentials. Access denied.");
    }
  };

  return (
    <footer className="bg-[#1A1A1A] text-zinc-400 py-16 font-sans border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 pb-12 border-b border-zinc-800">
          
          {/* Logo Brand / Desk */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <BatoLogo size={36} animate={false} monochrome={true} />
              <div>
                <span className="font-sans text-lg font-black tracking-wider text-white block">
                  BATO SAM<span className="text-zinc-300">. NG</span>
                </span>
                <span className="block font-mono text-[9px] font-bold text-zinc-500 tracking-wider uppercase -mt-1">
                  DIGITAL HUB
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500 font-bold">
              Digital Excellence. Delivered Daily.
            </p>
            <p className="text-xs leading-relaxed text-zinc-500">
              Your comprehensive full-suite digital solutions partner. Operating under strict professional guidelines to deliver first-class, verified business utilities.
            </p>
          </div>

          {/* Links: Resources */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Services</h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <button onClick={() => onChangeTab("cac")} className="hover:text-white transition-colors cursor-pointer text-left">
                  CAC Business Registration
                </button>
              </li>
              <li>
                <button onClick={() => onChangeTab("printing")} className="hover:text-white transition-colors cursor-pointer text-left">
                  Digital Print Calculator
                </button>
              </li>
              <li>
                <button onClick={() => onChangeTab("academy")} className="hover:text-white transition-colors cursor-pointer text-left">
                  Tech Academy Certifications
                </button>
              </li>
            </ul>
          </div>

          {/* Links: Platform */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Academic Academy</h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <button onClick={() => onChangeTab("academy")} className="hover:text-white transition-colors cursor-pointer text-left">
                  Student Enrollment Portal
                </button>
              </li>
              <li>
                <button onClick={() => onChangeTab("track")} className="hover:text-white transition-colors cursor-pointer text-left text-zinc-200 underline">
                  Live Job Tracker
                </button>
              </li>
              <li>
                <button onClick={() => onChangeTab("home")} className="hover:text-white transition-colors cursor-pointer text-left">
                  Back to Home
                </button>
              </li>
            </ul>
          </div>

          {/* Contacts info */}
          <div className="space-y-3.5 text-xs font-medium">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Contact HQ Desk</h4>
            <div className="flex items-start gap-2.5 text-zinc-500">
              <MapPin className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">Shop 20, Pabe Plaza, Pure Water Bus-Stop, Badagry Expressway, Lagos, Nigeria.</span>
            </div>
            <div className="flex items-center gap-2.5 text-zinc-500">
              <Mail className="h-4 w-4 text-zinc-400" />
              <span>admissions@batosam.ng</span>
            </div>
            <div className="flex items-center gap-2.5 text-zinc-500">
              <Globe className="h-4 w-4 text-zinc-400" />
              <span>www.batosam.ng</span>
            </div>
          </div>

        </div>

        {/* Footer legal disclaimer / bottom block */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-zinc-500 font-semibold gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p>© {new Date().getFullYear()} Bato Sam Digital Hub. All rights reserved.</p>
            <span className="hidden sm:inline text-zinc-850">|</span>
            <button 
              onClick={() => onChangeTab("profile")} 
              className="hover:text-zinc-300 underline transition-all cursor-pointer bg-transparent border-0 py-0"
            >
              Terms & Conditions
            </button>
            <span className="hidden sm:inline text-zinc-850">|</span>
            <button 
              onClick={() => onChangeTab("profile")} 
              className="hover:text-zinc-300 underline transition-all cursor-pointer bg-transparent border-0 py-0"
            >
              Privacy Policy
            </button>
            <span className="hidden sm:inline text-zinc-850">|</span>
            
            {isAdmin && (
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Admin Terminal Authenticated
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 rounded-md bg-zinc-800 border border-zinc-700 px-3.5 py-1 text-[10px]">
            <Award className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-zinc-400">Certified Legal & Technical Instructors Network</span>
          </div>
        </div>

        {/* Floating/Inline Secret Credential Field */}
        {showLogin && (
          <div className="mt-6 border-t border-zinc-800 pt-6 max-w-sm">
            <form onSubmit={handleAdminSubmit} className="space-y-3">
              <div className="flex flex-col">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Enter 4-Digit Staff Credential Key:
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="e.g. ****"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-mono font-bold text-white tracking-widest text-center focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-white hover:bg-zinc-200 px-4 py-2 text-xs font-bold text-black transition-colors cursor-pointer"
                  >
                    Unlock Terminal
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {error}
                </p>
              )}

              <p className="text-[9px] text-zinc-600 font-semibold uppercase tracking-wider">
                * Note: Authorized company admins only.
              </p>
            </form>
          </div>
        )}

      </div>
    </footer>
  );
}
