import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { MessageSquare, X, Send, Sparkles, Loader2, Volume2, VolumeX, Mic, MicOff } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCurrentUser } from "../utils/userSession";

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([
    {
      sender: "bot",
      text: "Hello! I am your Bato Sam AI Concierge. I am available 24/7 to guide you with CAC company formation, digital document prints, or Tech Academy course enrollments. How can I assist you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [savedKey, setSavedKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash");
  const [isError, setIsError] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [dragBounds, setDragBounds] = useState({ left: -800, right: 0, top: -600, bottom: 0 });
  const voiceGreetingPlayed = useRef(false);
  const recognitionRef = useRef<any>(null);

  // Stop any active recognition and speech when component unmounts
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const quickPrompts = [
    "Tell me about Tech Academy courses",
    "How does CAC AI registry work?",
    "Calculate my printing job cost",
  ];

  // Dynamically update dragging bounds based on current window size
  useEffect(() => {
    const updateBounds = () => {
      setDragBounds({
        left: -window.innerWidth + 100,
        right: 16,
        top: -window.innerHeight + 100,
        bottom: 16
      });
    };
    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, []);

  // Sync user state and personalize greeting
  useEffect(() => {
    const updateUser = () => {
      const u = getCurrentUser();
      setCurrentUser(u);
      if (u) {
        // Calculate dynamic profile completion percentage
        let score = 0;
        if (u.fullName?.trim()) score += 25;
        if (u.phone && u.phone.trim() !== "" && u.phone !== "Google Auth") score += 25;
        if (u.address?.trim()) score += 30;
        if (u.bio?.trim()) score += 20;

        let greetingText = "";
        if (score < 100) {
          greetingText = `Hey ${u.fullName.split(" ")[0]}, your profile is only ${score}% complete. Add your address for faster checkout.`;
        } else {
          greetingText = `Welcome back, ${u.fullName}. Your profile is 100% complete! Your secure administrative functions are fully active and synced.`;
        }

        setMessages([
          {
            sender: "bot",
            text: greetingText,
          },
        ]);
      } else {
        setMessages([
          {
            sender: "bot",
            text: "Hello! I am your Bato Sam AI Concierge. I am available 24/7 to guide you with CAC company formation, digital document prints, or Tech Academy course enrollments. How can I assist you today?",
          },
        ]);
      }
    };
    updateUser();
    window.addEventListener("bato_user_session_changed", updateUser);
    return () => window.removeEventListener("bato_user_session_changed", updateUser);
  }, []);

  // Load API Key and preferences on mount and when opened
  useEffect(() => {
    const key = localStorage.getItem("bato_gemini_api_key") || "";
    const model = localStorage.getItem("bato_gemini_model") || "gemini-2.5-flash";
    const mutedPref = localStorage.getItem("bato_ai_muted") === "true";
    setSavedKey(key);
    setSelectedModel(model);
    setIsMuted(mutedPref);

    if (isOpen) {
      if (!key) {
        setIsError(true);
        const missingMsg = "System not configured. Please enter keys in the Admin Panel.";
        
        // Add message if not already present
        setMessages((prev) => {
          if (prev.length > 0 && prev[prev.length - 1].text === missingMsg) {
            return prev;
          }
          return [...prev, { sender: "bot", text: missingMsg }];
        });
        speakText(missingMsg);
      } else {
        setIsError(false);
      }
    }
  }, [isOpen]);

  // First Interaction Voice Greeting
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (voiceGreetingPlayed.current) return;
      voiceGreetingPlayed.current = true;

      // Small delay so it feels organic after a click
      setTimeout(() => {
        const text = "Welcome to Bato Sam. How can I assist you today?";
        speakText(text);
      }, 500);

      // Clean up listeners
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };

    if (!voiceGreetingPlayed.current) {
      document.addEventListener("click", handleFirstInteraction);
      document.addEventListener("touchstart", handleFirstInteraction);
    }

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [isMuted]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Voice synthesis utility
  const speakText = (text: string) => {
    if (isMuted || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel(); // Stop current speech
      
      // Clean markdown symbols for cleaner TTS and limit duration
      const cleanText = text
        .replace(/[*#_`~]/g, "") // Remove bold, italic, list markers, and other markdown symbols
        .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Simplify link labels
        .substring(0, 300); // Concisely read out first 300 characters
        
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.lang.includes("en") &&
          (v.name.toLowerCase().includes("google") ||
            v.name.toLowerCase().includes("natural") ||
            v.name.toLowerCase().includes("female"))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS Error:", e);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg = { sender: "user", text: textToSend };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue("");
    setLoading(true);
    setIsError(false);

    // If API key exists, call Gemini directly
    if (savedKey) {
      try {
        const genAI = new GoogleGenerativeAI(savedKey);
        const model = genAI.getGenerativeModel({ model: selectedModel || "gemini-1.5-flash" });

        const systemInstruction = 
          "You are the 'Bato Sam Concierge', the official AI assistant for BATO SAM. NG.\n" +
          "Your Tone must be Professional, polite, and authoritative.\n\n" +
          "Core Knowledge:\n" +
          "- Location: Shop 20, Pabe Plaza, Pure Water Bus-Stop, Badagry Expressway, Lagos.\n" +
          "- Jovibe Code: We teach 7 skills (AI, Vibe Coding, Graphics, CBT, 3D, App Dev, Basic Computing). Tuition is FREE. Certificate is ₦5,500. Installment (₦2,750) is allowed. There is also a maintenance fee of ₦200 per class.\n" +
          "- CAC Services: Business Name (₦25,000), LTD (₦55,000), NGO (₦75,000). Need NIN, 3 Names, and ID.\n" +
          "- Printing: We handle project typesetting, bulk printing, and hardcover binding.\n\n" +
          "Limitations:\n" +
          "If a user asks a question NOT related to Bato Sam (e.g., 'how to cook rice', 'who is Lionel Messi', general coding or trivia outside Bato Sam digital services), you MUST politely decline and say exactly: " +
          "'I am specialized in Bato Sam digital services. How can I help you with your business or training today?'";

        // Convert messages history (excluding the first bot intro message)
        const historyParts = messages.slice(1).map((m) => ({
          role: m.sender === "user" ? "user" : "model",
          parts: [{ text: m.text }],
        }));

        const chat = model.startChat({
          history: historyParts,
          systemInstruction: systemInstruction,
        });

        const result = await chat.sendMessage(textToSend);
        const reply = result.response.text();

        if (!reply) {
          throw new Error("No response text returned from Gemini API.");
        }

        setMessages([...newMessages, { sender: "bot", text: reply }]);
        speakText(reply);
      } catch (err: any) {
        console.error("[Gemini API Error details]:", err);
        setIsError(true);
        const errMsg = err.message || "Unknown Gemini API error";
        setMessages([
          ...newMessages,
          {
            sender: "bot",
            text: `Gemini API Error: ${errMsg}. Please verify your Gemini API Key or connection.`,
          },
        ]);
        speakText("An API error occurred. System configuration check required.");
      } finally {
        setLoading(false);
      }
    } else {
      // Keys are missing! System not configured warning.
      setIsError(true);
      const errMsg = "System not configured. Please enter keys in the Admin Panel.";
      setMessages([...newMessages, { sender: "bot", text: errMsg }]);
      speakText(errMsg);
      setLoading(false);
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem("bato_ai_muted", String(nextMuted));
    if (nextMuted) {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      speakText("Voice enabled.");
    }
  };

  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Google Chrome, Safari, or Microsoft Edge.");
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn("Error stopping voice recognition:", err);
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.lang = "en-NG"; // Supports Nigerian accent inflections elegantly
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const speechToText = event.results[0][0]?.transcript;
        if (speechToText && speechToText.trim()) {
          setInputValue(speechToText);
          handleSendMessage(speechToText);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          // Provide friendly user feedback inside the chat context or alert
          const warningMessage = "Microphone access is blocked. Please allow microphone permissions in your browser address bar or click the 'Open in New Tab' icon to run with full microphone permissions.";
          setMessages(prev => [
            ...prev,
            {
              sender: "bot",
              text: `⚠️ **Microphone Blocked**: ${warningMessage}`
            }
          ]);
          speakText("Microphone access is blocked. Please enable it in your browser settings.");
        } else {
          setMessages(prev => [
            ...prev,
            {
              sender: "bot",
              text: `⚠️ **Voice Error**: Failed to capture speech (${event.error}). Please try again.`
            }
          ]);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.start();
    } catch (err) {
      console.error("Failed to initialize speech recognition:", err);
      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.15}
      dragConstraints={dragBounds}
      whileDrag={{ scale: 1.02 }}
      className="fixed bottom-6 right-6 z-50 font-sans pointer-events-auto"
    >
      {/* Expanded chat window */}
      {isOpen && (
        <div 
          onPointerDown={(e) => e.stopPropagation()} // Stop drag triggering when interacting inside chat window
          className="flex flex-col h-[520px] w-[360px] rounded-md border border-zinc-200 bg-white/95 backdrop-blur-md text-zinc-900 shadow-2xl overflow-hidden mb-4 transition-all"
        >
          {/* Header */}
          <div className="bg-zinc-50 p-4 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-md bg-black text-white shadow-xs">
                <Sparkles className="h-4 w-4 animate-pulse text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Bato Sam AI</h4>
                <p className="text-[9px] text-zinc-400 font-medium">Draggable AI Concierge • 24/7</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* TTS Mute/Unmute Toggle with High Contrast Badge */}
              <button
                onClick={toggleMute}
                title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                  isMuted 
                    ? "bg-zinc-100 text-zinc-400 border-zinc-200 hover:bg-zinc-200" 
                    : "bg-zinc-950 text-white border-zinc-950 hover:bg-zinc-800 shadow-xs"
                }`}
              >
                {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3 animate-pulse text-emerald-400" />}
                <span>{isMuted ? "MUTED" : "VOICE ON"}</span>
              </button>

              {/* Close Panel */}
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1.5 text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <>
            {/* Messages stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9F9F9] scrollbar-none">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-md px-4 py-3 text-xs leading-relaxed font-medium shadow-2xs ${
                      m.sender === "user"
                        ? "bg-black text-white rounded-tr-none"
                        : "bg-white text-zinc-900 border border-zinc-200 rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex flex-col gap-1.5 rounded-md bg-white px-4 py-3 text-xs font-medium border border-zinc-200 shadow-2xs text-zinc-600 rounded-tl-none max-w-[80%]">
                    <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[9px] uppercase tracking-wider">
                      <Sparkles className="h-3 w-3 animate-pulse text-zinc-800" />
                      <span>Bato Sam AI is thinking</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-900 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-900 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-900 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompts Suggestions */}
            <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-200 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp)}
                  className="inline-block rounded-md bg-white hover:bg-zinc-100 border border-zinc-200 px-3 py-1.5 text-[10px] font-semibold text-zinc-600 hover:text-black transition-all cursor-pointer shrink-0"
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-3 border-t border-zinc-200 bg-zinc-50 flex gap-2 items-center"
            >
              <button
                type="button"
                onClick={toggleListening}
                className={`rounded-md p-2.5 transition-all cursor-pointer ${
                  isListening
                    ? "bg-zinc-800 text-white border border-zinc-900 animate-pulse"
                    : "bg-white text-zinc-500 hover:text-black border border-zinc-200 hover:bg-zinc-100"
                }`}
                title={isListening ? "Listening... click to stop" : "Use Voice-to-Text"}
              >
                <Mic className="h-4 w-4" />
              </button>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isListening ? "Listening... Speak now" : "Ask me anything..."}
                className={`flex-1 rounded-md border bg-white border-zinc-200 px-3.5 py-2.5 text-xs font-medium text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-black focus:ring-1 focus:ring-black`}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || loading}
                className="rounded-md bg-black hover:bg-zinc-900 disabled:opacity-40 p-2.5 text-white transition-colors cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        </div>
      )}

      {/* Holographic Glowing AI Orb Launcher - Minimalist Noir Design with Red Listening pulse */}
      <div className="flex justify-end select-none">
        <div className="relative">
          {/* External Pulsating Ripple Ring */}
          <div
            className={`absolute -inset-4 rounded-full blur-lg animate-ping pointer-events-none transition-all duration-500 ${
              isError ? "bg-red-600/30" : isListening ? "bg-red-500/50" : loading ? "bg-zinc-800/15" : "bg-zinc-950/20"
            }`}
            style={{ animationDuration: isError ? "1s" : isListening ? "1s" : "4s" }}
          />
          {/* Ambient Inner Halo */}
          <div
            className={`absolute -inset-2 rounded-full blur-md animate-pulse pointer-events-none transition-all duration-500 ${
              isError ? "bg-red-500/35" : isListening ? "bg-red-500/40" : loading ? "bg-zinc-800/10" : "bg-zinc-950/10"
            }`}
          />

          <div className="relative flex items-center justify-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`relative flex h-16 w-16 items-center justify-center rounded-full text-zinc-100 border transition-all duration-500 focus:outline-none cursor-pointer shadow-2xl overflow-hidden ${
                isListening 
                  ? "bg-zinc-900 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5),inset_0_1px_2px_rgba(255,255,255,0.1)] scale-105" 
                  : "bg-zinc-950 border-zinc-800 hover:border-zinc-700 shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95"
              }`}
            >
              {/* Liquid drop dark glare highlights */}
              <span className="absolute top-1.5 left-3 w-4 h-2 bg-white/10 rounded-full blur-[0.5px] rotate-[-15deg] pointer-events-none" />
              <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-zinc-900/40 via-transparent to-transparent pointer-events-none" />

              {/* Center Core */}
              <span className="relative z-10 flex items-center justify-center">
                {isOpen ? (
                  <X className="h-5 w-5 transition-transform duration-300 text-zinc-200" />
                ) : (
                  <Sparkles className={`h-5 w-5 transition-colors ${isListening ? "text-red-400 animate-pulse" : "text-zinc-300 animate-pulse"}`} />
                )}
              </span>
            </button>

            {/* Nested Clickable 'Mic' Icon inside the Orb area (only displayed when chat is closed) */}
            {!isOpen && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // Avoid triggering open/close click on the main Orb
                  toggleListening();
                }}
                className={`absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border shadow-md transition-all duration-300 hover:scale-115 active:scale-90 cursor-pointer ${
                  isListening
                    ? "bg-red-600 text-white border-red-500 animate-pulse"
                    : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white"
                }`}
                title={isListening ? "Listening... click to stop" : "Voice Command (Speak to AI)"}
              >
                <Mic className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
