import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { MessageSquare, X, Send, Sparkles, Loader2, Volume2, VolumeX, Mic, MicOff } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
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
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [isError, setIsError] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [dragBounds, setDragBounds] = useState({ left: -800, right: 0, top: -600, bottom: 0 });
  const voiceGreetingPlayed = useRef(false);

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
      const utterance = new SpeechSynthesisUtterance(text);
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
        const model = genAI.getGenerativeModel({ model: selectedModel || "gemini-2.5-flash" });

        const systemInstruction = 
          "You are the Bato Sam Concierge, expert in CAC, Printing, and Tech Training (Jovibe Code AI Concierge, sponsored by BATOSAM NIG.). " +
          "Guide the user regarding CAC company registration, professional document printing specifications, and the Jovibe Code Academy. " +
          "Highlight that Tuition is 100% FREE for all 7 skills: AI Prompt Engineering, Vibe Coding, Graphic Design, CBT Practice, 3D Product Design, Coding/App Development, and Basic Computing. " +
          "Explain that there is a certificate fee of ₦5,500 (installment payments of ₦2,750 are allowed) and a maintenance fee of ₦200 per class. " +
          "Maintain a highly competent, professional corporate Nigerian tone. Keep responses helpful and readable.";

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

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "en-NG"; // Supports Nigerian accent inflections elegantly
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const speechToText = event.results[0][0].transcript;
        if (speechToText && speechToText.trim()) {
          setInputValue(speechToText);
          handleSendMessage(speechToText);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Failed to initialize speech recognition:", err);
      setIsListening(false);
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
              {/* TTS Mute/Unmute Toggle */}
              <button
                onClick={toggleMute}
                title={isMuted ? "Unmute Voice" : "Mute Voice"}
                className="rounded-md p-1.5 text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="h-4 w-4 text-zinc-400" /> : <Volume2 className="h-4 w-4 text-black" />}
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
                  <div className="flex items-center gap-2 rounded-md bg-white px-4 py-3 text-xs font-medium border border-zinc-200 shadow-2xs text-zinc-600">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-black" />
                    <span>AI Engine is thinking...</span>
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

      {/* Holographic Glowing AI Orb Launcher */}
      <div className="flex justify-end select-none">
        <div className="relative">
          {/* External Pulsating Ripple Ring */}
          <div
            className={`absolute -inset-4 rounded-full blur-lg animate-ping pointer-events-none transition-all duration-500 ${
              isError ? "bg-red-600/20" : isListening ? "bg-zinc-400/20" : loading ? "bg-zinc-300/15" : "bg-white/30"
            }`}
            style={{ animationDuration: isError ? "1s" : isListening ? "1.5s" : "4s" }}
          />
          {/* Ambient Inner Halo */}
          <div
            className={`absolute -inset-2 rounded-full blur-md animate-pulse pointer-events-none transition-all duration-500 ${
              isError ? "bg-red-500/25" : isListening ? "bg-zinc-500/15" : loading ? "bg-zinc-400/10" : "bg-zinc-300/10"
            }`}
          />

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-white via-zinc-100 to-zinc-350 text-zinc-900 border border-white/80 transition-all duration-500 focus:outline-none cursor-grab shadow-[0_20px_40px_rgba(0,0,0,0.08),inset_0_4px_10px_rgba(255,255,255,1),inset_0_-4px_10px_rgba(0,0,0,0.05)] hover:scale-105 active:scale-95 overflow-hidden"
          >
            {/* Liquid drop glare highlights */}
            <span className="absolute top-1.5 left-3 w-5 h-3 bg-white/80 rounded-full blur-[0.5px] rotate-[-15deg] pointer-events-none" />
            <span className="absolute bottom-2 right-3 w-2.5 h-2.5 bg-white/35 rounded-full blur-[1px] pointer-events-none" />
            <span className="absolute inset-2 rounded-full bg-gradient-to-tl from-zinc-300/30 via-white/40 to-transparent pointer-events-none" />

            {/* Center Core */}
            <span className="relative z-10 flex items-center justify-center text-zinc-800">
              {isOpen ? (
                <X className="h-5 w-5 transition-transform duration-300" />
              ) : (
                <Sparkles className="h-5 w-5 animate-pulse text-zinc-800" />
              )}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
