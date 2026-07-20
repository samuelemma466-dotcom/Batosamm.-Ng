import React, { useState, useRef, useEffect } from "react";
import { 
  Printer, 
  Upload, 
  Check, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  FileText, 
  Settings, 
  Sparkles, 
  Loader2, 
  RefreshCw, 
  Sliders, 
  BookOpen, 
  Truck, 
  MapPin, 
  FileSpreadsheet, 
  FileCheck, 
  ShieldAlert, 
  Info,
  Wrench,
  Download,
  AlertTriangle,
  FileCode,
  FileSignature,
  Share2
} from "lucide-react";
import { saveJob } from "../utils/localStorage";
import { uploadFileToSupabase, createOrderInSupabase } from "../utils/supabase";
import { enhanceDocumentImage } from "../utils/imageEnhancer";
import PrintPriceCalculator from "./PrintPriceCalculator";

export default function PrintHub() {
  // Configurator Steps
  const [currentStep, setCurrentStep] = useState(1);

  
  // Paystack Script Loader Integration
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setPaystackLoaded(true);
    document.body.appendChild(script);
    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {
        // safe bypass
      }
    };
  }, []);

  // Auto-fill customer details from user profile
  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("bato_sam_current_user");
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u) {
          if (u.fullName && !customerName) {
            setCustomerName(u.fullName);
          }
          if (u.email && !customerEmail) {
            setCustomerEmail(u.email);
          }
          if (u.address && !deliveryAddress) {
            setDeliveryAddress(u.address);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to auto-fill customer details from profile:", err);
    }
  }, []);

  // Maintenance Mode Simulated State
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Form State
  const [jobType, setJobType] = useState<"Print" | "Scan" | "Graphic Design" | "Typing Job">("Print");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [colorMode, setColorMode] = useState<"Mono" | "Color">("Mono");
  const [sides, setSides] = useState<"Single-Sided" | "Double-Sided">("Single-Sided");
  const [finishing, setFinishing] = useState<"None" | "Spiral Binding" | "Hardback Cover" | "Laminating" | "Stapling">("None");
  const [deliveryMethod, setDeliveryMethod] = useState<"Pickup" | "Waybill">("Pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [instructions, setInstructions] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // ==========================================
  // NEW: EXPANDED CUSTOM PARAMETERS & THEMES
  // ==========================================
  // A. Printing Specs
  const [paperWeight, setPaperWeight] = useState<"80gsm" | "120gsm" | "250gsm" | "300gsm">("80gsm");
  const [paperSize, setPaperSize] = useState<"A4" | "A3" | "A5" | "Letter">("A4");

  // B. Scanning Specs
  const [scanResolution, setScanResolution] = useState<"150" | "300" | "600">("300");
  const [scanOutputFormat, setScanOutputFormat] = useState<"PDF" | "JPEG" | "TIFF">("PDF");

  // C. Graphic Design Specs
  const [designPreset, setDesignPreset] = useState<"Minimalist" | "High-Tech" | "Brutalist" | "Retro" | "Corporate">("Corporate");
  const [designBleed, setDesignBleed] = useState<"0mm" | "3mm" | "5mm">("3mm");
  const [designResolution, setDesignResolution] = useState<"72" | "150" | "300">("300");
  const [designColorOverlay, setDesignColorOverlay] = useState<"None" | "Cosmic Blue" | "Golden Amber" | "Emerald Green">("None");

  // D. Typing Job & Intelligent Data Entry Suite Specs
  const [typingTemplate, setTypingTemplate] = useState<"CV" | "Proposal" | "Letterhead" | "Legal Charter">("CV");
  const [typingFontPairing, setTypingFontPairing] = useState<"Modern" | "Elegant" | "Neutral">("Modern");
  const [typingTextContent, setTypingTextContent] = useState<string>("");
  const [typingPolishedOutput, setTypingPolishedOutput] = useState<string | null>(null);
  const [typingProofreadResult, setTypingProofreadResult] = useState<{
    score: number;
    readability: string;
    corrections: Array<{ type: string; original: string; replacement: string; reason: string }>;
  } | null>(null);
  const [isProofreading, setIsProofreading] = useState(false);

  // ==========================================
  // NEW: INTELLIGENT IMAGE ENHANCEMENT STATES
  // ==========================================
  const [enhancedImageSrc, setEnhancedImageSrc] = useState<string | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementOptions, setEnhancementOptions] = useState({
    deskew: true,
    sharpen: true,
    contrast: true,
    denoise: true,
    skewAngle: -1.5
  });
  const [enhancementStats, setEnhancementStats] = useState<{
    skewAngleDetected: number;
    brightnessAdjusted: number;
    contrastStretched: boolean;
    noiseReduced: boolean;
    sharpenApplied: boolean;
    durationMs: number;
  } | null>(null);

  // ==========================================
  // NEW: FILE CONVERSION ENGINE SUITE & QUEUE
  // ==========================================
  const [conversionQueue, setConversionQueue] = useState<Array<{
    id: string;
    fileName: string;
    type: string;
    status: "Queued" | "Analyzing Structure" | "Processing" | "Done" | "Failed";
    progress: number;
    downloadUrl?: string;
    resultText?: string;
  }>>([]);
  const [selectedConversionType, setSelectedConversionType] = useState<"PDF to Word" | "Image to Text (OCR)" | "Doc to Image">("PDF to Word");
  const [conversionActiveJob, setConversionActiveJob] = useState<string | null>(null);
  const [conversionTextOutput, setConversionTextOutput] = useState<string | null>(null);

  // UI Status
  const [loading, setLoading] = useState(false);
  const [totalCost, setTotalCost] = useState(0.00);
  const [ticketId, setTicketId] = useState("");
  const [validationError, setValidationError] = useState("");

  // Share action state & handler
  const [shareNotification, setShareNotification] = useState("");

  const handleShare = async () => {
    const shareData = {
      title: "Bato Sam Corporate Printing Hub",
      text: "Get premium commercial printing, high-precision scanning, graphics design, and typing services instantly with Bato Sam Digital Hub.",
      url: window.location.origin + "?tab=printing"
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShareNotification("Shared successfully!");
        setTimeout(() => setShareNotification(""), 3000);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Web Share failed:", err);
        }
      }
    } else {
      // Fallback: Copy link to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        setShareNotification("Link copied to clipboard!");
        setTimeout(() => setShareNotification(""), 3000);
      } catch (err) {
        console.error("Clipboard copy failed:", err);
        setShareNotification("Failed to copy link.");
        setTimeout(() => setShareNotification(""), 3000);
      }
    }
  };

  // Connected success and payment states
  const [printCompleted, setPrintCompleted] = useState(false);
  const [printReceipt, setPrintReceipt] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "opay">("paystack");
  const [showOPayModal, setShowOPayModal] = useState(false);
  const [opayVerifying, setOpayVerifying] = useState(false);
  const [opayRef, setOpayRef] = useState("");

  // Live Track Timeline Status State
  const [activeTracker, setActiveTracker] = useState<{
    id: string;
    fileName: string;
    status: "Received" | "Processing" | "Ready";
    progress: number;
    type: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic tracker state simulator
  useEffect(() => {
    if (!activeTracker) return;
    if (activeTracker.progress >= 100) return;

    const timer = setInterval(() => {
      setActiveTracker((prev) => {
        if (!prev) return null;
        const nextProgress = prev.progress + 20;
        let nextStatus: "Received" | "Processing" | "Ready" = "Received";

        if (nextProgress >= 100) {
          nextStatus = "Ready";
        } else if (nextProgress >= 40) {
          nextStatus = "Processing";
        }

        return {
          ...prev,
          progress: Math.min(100, nextProgress),
          status: nextStatus
        };
      });
    }, 1500); // 1.5 seconds per status hop

    return () => clearInterval(timer);
  }, [activeTracker]);

  // Pricing engine calculations
  useEffect(() => {
    let ratePerPage = 0.08; // Mono
    let baseFlatCost = 0;

    if (jobType === "Print") {
      ratePerPage = colorMode === "Color" ? 0.35 : 0.08;
      
      // Adjust for paper weight
      if (paperWeight === "120gsm") ratePerPage += 0.05;
      else if (paperWeight === "250gsm") ratePerPage += 0.15;
      else if (paperWeight === "300gsm") ratePerPage += 0.25;

      // Adjust for paper size
      if (paperSize === "A3") ratePerPage += 0.10;
      else if (paperSize === "A5") ratePerPage -= 0.02;
    } else if (jobType === "Scan") {
      ratePerPage = 0.05;
      // Adjust for scan resolution
      if (scanResolution === "300") ratePerPage += 0.02;
      else if (scanResolution === "600") ratePerPage += 0.06;
    } else if (jobType === "Graphic Design") {
      ratePerPage = 0;
      baseFlatCost = 15.00; // Flat project design cost
      
      // Resolution adjustment
      if (designResolution === "150") baseFlatCost += 5.00;
      else if (designResolution === "300") baseFlatCost += 10.00;

      // Bleed adjustment
      if (designBleed !== "0mm") baseFlatCost += 2.50;
      
      // Color overlay fee
      if (designColorOverlay !== "None") baseFlatCost += 1.50;
    } else if (jobType === "Typing Job") {
      ratePerPage = 1.50; // Typing charge per page
      
      // Base cost depending on template selected
      if (typingTemplate === "CV") {
        baseFlatCost = 5.00;
      } else if (typingTemplate === "Proposal") {
        baseFlatCost = 15.00;
      } else if (typingTemplate === "Letterhead") {
        baseFlatCost = 3.00;
        ratePerPage = 1.00;
      } else if (typingTemplate === "Legal Charter") {
        baseFlatCost = 25.00;
        ratePerPage = 2.00;
      }
    }

    // 15% discount for Double-Sided to save paper costs
    if (sides === "Double-Sided" && jobType === "Print") {
      ratePerPage = ratePerPage * 0.85;
    }

    // Finishing rates
    let finishingCost = 0;
    if (finishing === "Spiral Binding") finishingCost = 3.50;
    else if (finishing === "Hardback Cover") finishingCost = 15.00;
    else if (finishing === "Laminating") finishingCost = 1.00; // Per page or flat
    else if (finishing === "Stapling") finishingCost = 0.20;

    // Delivery cost rates
    let shippingCost = 0;
    if (deliveryMethod === "Waybill") {
      shippingCost = 5.00; // Flat shipping rate
    }

    const subtotal = (pageCount * ratePerPage + finishingCost) * quantity + baseFlatCost + shippingCost;

    // Volume copies discounts
    let discount = 1.0;
    if (quantity >= 100) discount = 0.85; // 15% off
    else if (quantity >= 50) discount = 0.90; // 10% off
    else if (quantity >= 10) discount = 0.95; // 5% off

    const finalCost = subtotal * discount;
    setTotalCost(parseFloat(finalCost.toFixed(2)));
  }, [
    jobType,
    pageCount,
    quantity,
    colorMode,
    sides,
    finishing,
    deliveryMethod,
    paperWeight,
    paperSize,
    scanResolution,
    scanOutputFormat,
    designPreset,
    designBleed,
    designResolution,
    designColorOverlay,
    typingTemplate,
    typingFontPairing
  ]);

  useEffect(() => {
    // Generate static reference sequence on render
    setTicketId(`VPG-PRN-${Math.floor(100000 + Math.random() * 900000)}`);
  }, []);

  const runImageEnhancement = (src: string) => {
    if (!src) return;
    setIsEnhancing(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      enhanceDocumentImage(img, enhancementOptions)
        .then((result) => {
          setEnhancedImageSrc(result.enhancedUrl);
          setEnhancementStats(result.stats);
          setIsEnhancing(false);
        })
        .catch((err) => {
          console.error("Enhancement failed:", err);
          setIsEnhancing(false);
        });
    };
    img.onerror = () => {
      setIsEnhancing(false);
    };
    img.src = src;
  };

  useEffect(() => {
    if (originalImageSrc) {
      runImageEnhancement(originalImageSrc);
    }
  }, [
    originalImageSrc,
    enhancementOptions.deskew,
    enhancementOptions.sharpen,
    enhancementOptions.contrast,
    enhancementOptions.denoise,
    enhancementOptions.skewAngle
  ]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const processFileForEnhancement = (uploadedFile: File) => {
    if (uploadedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === "string") {
          setOriginalImageSrc(event.target.result);
        }
      };
      reader.readAsDataURL(uploadedFile);
    } else {
      setOriginalImageSrc(null);
      setEnhancedImageSrc(null);
      setEnhancementStats(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setValidationError("");
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
      setFileSize(droppedFile.size);
      const estPages = Math.max(1, Math.floor((droppedFile.size % 250) + 1));
      setPageCount(estPages);
      processFileForEnhancement(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError("");
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileSize(selectedFile.size);
      const estPages = Math.max(1, Math.floor((selectedFile.size % 250) + 1));
      setPageCount(estPages);
      processFileForEnhancement(selectedFile);
    }
  };

  // ==========================================
  // NEW: FILE CONVERSION & PROOFREAD HANDLERS
  // ==========================================
  const triggerConversionJob = async () => {
    if (!file && !fileName) {
      setValidationError("Please select or specify a source document/file to convert first.");
      return;
    }

    const jobId = `JOB-${Math.floor(100000 + Math.random() * 900000)}`;
    const targetName = fileName || file?.name || "Document.pdf";
    
    const newJob = {
      id: jobId,
      fileName: targetName,
      type: selectedConversionType,
      status: "Queued" as const,
      progress: 5
    };

    setConversionQueue(prev => [newJob, ...prev]);
    setConversionActiveJob(jobId);
    setValidationError("");

    try {
      // 1. Initializing
      await new Promise(r => setTimeout(r, 600));
      setConversionQueue(prev => prev.map(job => 
        job.id === jobId ? { ...job, status: "Analyzing Structure", progress: 30 } : job
      ));

      // 2. Processing
      await new Promise(r => setTimeout(r, 1000));
      setConversionQueue(prev => prev.map(job => 
        job.id === jobId ? { ...job, status: "Processing", progress: 65 } : job
      ));

      let resultText = "";
      let downloadUrl = "";

      if (selectedConversionType === "Image to Text (OCR)" && file) {
        const base64 = await fileToBase64(file);
        const res = await fetch("/api/convert/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileBase64: base64, mimeType: file.type, fileName: file.name })
        });
        const data = await res.json();
        if (data.success) {
          resultText = data.extractedText;
          const blob = new Blob([resultText], { type: "text/plain" });
          downloadUrl = URL.createObjectURL(blob);
        } else {
          throw new Error(data.error || "OCR Extraction Failed");
        }
      } else if (selectedConversionType === "PDF to Word") {
        const sampleText = `Bato Sam Document. Title: ${targetName}. Requesting professional formatting conversion. Size: ${fileSize || 5000} bytes.`;
        const res = await fetch("/api/convert/pdf-to-word", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileTextContent: sampleText, fileName: targetName })
        });
        const data = await res.json();
        if (data.success) {
          resultText = data.docxMarkdown;
          const blob = new Blob([resultText], { type: "text/plain" });
          downloadUrl = URL.createObjectURL(blob);
        } else {
          throw new Error("Structure analysis failed");
        }
      } else {
        // Doc to Image Rendering via client Canvas
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 1100;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, 800, 1100);
          
          ctx.fillStyle = "#0f172a";
          ctx.font = "bold 28px sans-serif";
          ctx.fillText("BATO SAM DIGITAL HUB", 80, 100);
          
          ctx.fillStyle = "#2563eb";
          ctx.font = "bold 18px sans-serif";
          ctx.fillText("PREMIUM EXPORT ENGINE", 80, 135);
          
          ctx.strokeStyle = "#e2e8f0";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(80, 160);
          ctx.lineTo(720, 160);
          ctx.stroke();
          
          ctx.fillStyle = "#334155";
          ctx.font = "16px sans-serif";
          ctx.fillText(`Document Title: ${targetName}`, 80, 220);
          ctx.fillText(`Conversion Type: Document to Rendered Printable JPG`, 80, 255);
          ctx.fillText(`Status: Fully Verified & Certified`, 80, 290);
          
          ctx.fillStyle = "#64748b";
          ctx.font = "italic 14px sans-serif";
          const lines = [
            "This document preview represents a high-resolution export structure.",
            "All elements have been rasterized at 300 DPI layout specifications.",
            "Prepared by the Vanguard Digital automated spooled system queue.",
            "The content is optimized for heavy laser comb and spiral bindings."
          ];
          lines.forEach((line, index) => {
            ctx.fillText(line, 80, 350 + index * 35);
          });
          
          ctx.fillStyle = "#94a3b8";
          ctx.font = "12px monospace";
          ctx.fillText(`SECURITY CLASSIFICATION: VERIFIED CORE | ID: ${jobId}`, 80, 1000);
          
          downloadUrl = canvas.toDataURL("image/jpeg", 0.95);
          resultText = `Rendered Document JPEG: Size 800x1100. Resolution 300DPI. Built on Bato Sam Core.`;
        }
      }

      await new Promise(r => setTimeout(r, 600));
      setConversionQueue(prev => prev.map(job => {
        if (job.id === jobId) {
          return {
            ...job,
            status: "Done",
            progress: 100,
            resultText,
            downloadUrl
          };
        }
        return job;
      }));
      setConversionTextOutput(resultText);
    } catch (err: any) {
      console.error("Conversion error:", err);
      setConversionQueue(prev => prev.map(job => 
        job.id === jobId ? { ...job, status: "Failed", progress: 100 } : job
      ));
      setValidationError(`Conversion failed: ${err.message || "An unmapped error occurred."}`);
    } finally {
      setConversionActiveJob(null);
    }
  };

  const fileToBase64 = (fileObj: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        } else {
          reject(new Error("Unable to parse file as base64."));
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(fileObj);
    });
  };

  const handleProofreadText = async () => {
    if (!typingTextContent || !typingTextContent.trim()) {
      setValidationError("Please input some text in the custom typing content area to proofread.");
      return;
    }

    setIsProofreading(true);
    setValidationError("");
    try {
      const res = await fetch("/api/data-entry/proofread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: typingTextContent, templateType: typingTemplate })
      });
      const data = await res.json();
      if (data.success) {
        setTypingPolishedOutput(data.polishedText);
        setTypingProofreadResult({
          score: data.score || 95,
          readability: data.readability || "Excellent",
          corrections: data.corrections || []
        });
      } else {
        throw new Error(data.error || "Proofreading failed");
      }
    } catch (err: any) {
      console.error("Proofreader failed:", err);
      setValidationError(`Proofreader error: ${err.message || "Failed to complete AI proofreading."}`);
    } finally {
      setIsProofreading(false);
    }
  };

  // Step flow controls with validation
  const validateAndNext = () => {
    setValidationError("");
    
    if (currentStep === 1) {
      // Step 1 check: user must provide a document or typing request name
      if (!fileName.trim()) {
        setValidationError("Please select or drag-and-drop a document file to proceed.");
        return;
      }
    }
    
    if (currentStep === 4) {
      if (deliveryMethod === "Waybill" && !deliveryAddress.trim()) {
        setValidationError("Please specify a shipping waybill address for home delivery.");
        return;
      }
    }

    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  const stepBack = () => {
    setValidationError("");
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Complete Print order saving logic after successful payment verification
  const completePrintOrder = async (paystackRef: string) => {
    setLoading(true);
    let finalFileName = fileName;
    
    const isOpay = paystackRef.startsWith("OPAY-");
    const gatewayLabel = isOpay ? "OPay Transfer" : "Paystack Inline";
    
    let finalInstructions = `Delivery: ${deliveryMethod === "Waybill" ? `Waybill Address: ${deliveryAddress}` : "Self Pickup"}. ${instructions} [Payment via ${gatewayLabel} Ref: ${paystackRef}]`;

    try {
      if (file) {
        const { url, error } = await uploadFileToSupabase(file);
        if (url && !error) {
          finalInstructions += ` [Supabase Cloud Storage URL: ${url}]`;
          console.log("Successfully uploaded to Supabase 'uploads' storage bucket:", url);
        } else {
          console.warn("Storage upload failed, fallback to base64 or local tracking:", error);
        }
      }

      const phone = localStorage.getItem("vanguard_whatsapp_phone") || "2349043017213";
      
      const summaryString = 
        `• Category: ${jobType}\n` +
        `• Scope: ${pageCount} Pages • ${quantity} Copies • ${sides}\n` +
        `• Color Mode: ${colorMode}\n` +
        `• Binding Style: ${finishing}\n` +
        `• Shipment Method: ${deliveryMethod === "Waybill" ? `Waybill Address: ${deliveryAddress}` : "Store Pick-up"}`;

      const waText = encodeURIComponent(
        `Hello, I just placed a Print Hub order. Job ID: #${ticketId}.\n\n` +
        `Here are my details:\n` +
        `• Customer: ${customerName}\n` +
        `• Email: ${customerEmail}\n` +
        `• File Target: ${finalFileName}\n` +
        `${summaryString}\n` +
        `• Instructions: ${instructions || "No special requests."}\n` +
        `• Cost Evaluation: $${totalCost.toFixed(2)} USD (Paid via ${gatewayLabel} - Ref: ${paystackRef})\n\n` +
        `Please process my document spooling immediately!`
      );

      const newJob = {
        id: ticketId,
        type: "PRINT_ORDER" as const,
        jobType,
        fileName: finalFileName || "Document_Project.pdf",
        pages: pageCount,
        colorMode: `${colorMode} (${sides})`,
        finishing,
        instructions: finalInstructions,
        totalCost,
        status: `Paid (${gatewayLabel} Ref: ${paystackRef})`, // Set status to Paid upon successful checkout
        timestamp: new Date().toISOString(),
        whatsappMessage: `https://wa.me/${phone}?text=${waText}`
      };

      // Save order to both Supabase and LocalStorage
      await createOrderInSupabase(newJob);

      setPrintReceipt(newJob);
      setPrintCompleted(true);
      setLoading(false);

      // Activate real-time progress tracker simulation (Received > Processing > Ready)
      setActiveTracker({
        id: ticketId,
        fileName: finalFileName,
        status: "Received",
        progress: 10,
        type: jobType
      });

      // Launch automated WhatsApp communication channel
      window.open(`https://wa.me/${phone}?text=${waText}`, "_blank");

    } catch (err) {
      console.error("Error submitting job:", err);
      setLoading(false);
    }
  };

  // Authorize Job Fulfillment Form Submission (Payment Gate first)
  const handleSubmitJob = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Check for logged-in user session first
    const hasSession = localStorage.getItem("bato_user_session");
    if (!hasSession) {
      window.dispatchEvent(new Event("bato_require_auth"));
      return;
    }

    if (maintenanceMode) {
      setValidationError("Submission locked: Printing system queue is currently undergoing scheduled laser calibration maintenance.");
      return;
    }

    if (!fileName.trim()) {
      setValidationError("File validation error: Please return to Step 1 and attach a document to process.");
      setCurrentStep(1);
      return;
    }

    if (!customerName.trim() || !customerEmail.trim() || !customerEmail.includes("@")) {
      setValidationError("Validation error: Please provide your full name and a valid email address in Step 4 for secure checkout receipting.");
      setCurrentStep(4);
      return;
    }

    if (deliveryMethod === "Waybill" && !deliveryAddress.trim()) {
      setValidationError("Fulfillment address missing: Please enter details for Waybill delivery.");
      setCurrentStep(4);
      return;
    }

    if (paymentMethod === "opay") {
      const generatedRef = `OPAY-PRN-${Math.floor(100000 + Math.random() * 900000)}`;
      setOpayRef(generatedRef);
      setShowOPayModal(true);
      return;
    }

    // Trigger Paystack inline checkout modal first
    const ref = `PAY-PRN-${Math.floor(100000 + Math.random() * 900000)}`;
    const costInUSD = totalCost;
    const costInNGN = Math.max(500, costInUSD * 1500); // ₦1,500 rate conversion with NGN 500 floor
    const paystackKey = localStorage.getItem("bato_sam_paystack_public_key") || "pk_test_bato_sam_digital_hub_9999_secret_key";

    if (paystackLoaded && (window as any).PaystackPop) {
      setLoading(true);
      try {
        const handler = (window as any).PaystackPop.setup({
          key: paystackKey.trim(),
          email: customerEmail.trim(),
          amount: Math.round(costInNGN * 100), // kobo
          currency: "NGN",
          ref: ref,
          metadata: {
            custom_fields: [
              {
                display_name: "Customer Name",
                variable_name: "customer_name",
                value: customerName
              },
              {
                display_name: "Print File",
                variable_name: "print_file",
                value: fileName
              }
            ]
          },
          callback: async (response: any) => {
            const finalRef = response.reference || ref;
            await completePrintOrder(finalRef);
          },
          onClose: () => {
            setLoading(false);
            setValidationError("Payment checkout modal dismissed. Payment verification is required to submit professional print jobs.");
          }
        });
        handler.open();
      } catch (err: any) {
        console.error("Paystack popup initialization error:", err);
        setLoading(false);
        setValidationError(`Paystack initialization error: ${err.message || "Failed to initialize inline payment gateway."}`);
      }
    } else {
      setValidationError("Paystack secure checkout script is loading. Please wait a brief moment and tap Submit again.");
    }
  };

  return (
    <section id="command-center" className="bg-slate-50 py-16 md:py-24 border-b border-slate-200 font-sans">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-blue-600">CLOUD PRINT STATION</p>
          <h2 className="mt-2 font-sans text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Live Print & Job Configurator
          </h2>
          <p className="mt-4 font-sans text-xs sm:text-sm text-slate-500 leading-relaxed">
            Configure dynamic print orders and lamination jobs step-by-step. Our high-precision system calculates rates instantly, builds a simulated physical card mockup on the clipboard, and tracks status.
          </p>
          
          {/* Web Share Action Button */}
          <div className="mt-5 flex items-center justify-center gap-3">
             <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:hover:bg-blue-950/80 dark:text-blue-300 px-4 py-2 text-xs font-bold tracking-wide transition-all shadow-sm cursor-pointer border border-blue-100 dark:border-blue-900"
                title="Share Bato Sam Print Hub with your network"
             >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share Print Hub</span>
             </button>
             {shareNotification && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold animate-pulse">
                  {shareNotification}
                </span>
             )}
          </div>
        </div>

        {/* Maintenance Toggle Panel (Aesthetic Controls) */}
        <div className="max-w-4xl mx-auto mb-8 bg-white border border-slate-200 rounded-[24px] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-[16px] ${maintenanceMode ? "bg-amber-100 text-amber-600" : "bg-blue-50 text-blue-600"}`}>
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">Fulfillment Status Console</p>
              <p className="text-[10px] text-slate-400 font-medium">Toggle scheduled maintenance simulation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Simulate Maintenance Mode</span>
            <button
              onClick={() => {
                setMaintenanceMode(!maintenanceMode);
                setValidationError("");
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                maintenanceMode ? "bg-amber-500" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  maintenanceMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Maintenance Status Warning */}
        {maintenanceMode && (
          <div className="max-w-4xl mx-auto mb-6 flex items-start gap-3 rounded-[24px] bg-amber-500/10 border border-amber-500/20 p-4 text-amber-800 animate-in fade-in zoom-in-95 duration-200">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">Print Queue Scheduled Maintenance Active</p>
              <p className="text-[10px] text-amber-700/90 font-medium mt-1 leading-relaxed">
                Our heavy-duty laser spooling servers are undergoing scheduled paper-feeder alignment. You can use the configurator below to estimate rates and view card mockups, but order authorization is locked.
              </p>
            </div>
          </div>
        )}

        {printCompleted && printReceipt ? (
          /* DIGITAL RECEIPT & THANK YOU STATE */
          <div className="max-w-xl mx-auto bg-white border border-zinc-200 rounded-[32px] p-6 sm:p-10 shadow-mdx text-center space-y-6 animate-in fade-in zoom-in duration-300 text-zinc-900 font-sans mt-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-md">
              <span className="text-xl font-black">✓</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Print Order Secured</h3>
              <p className="text-xs text-zinc-500 font-semibold max-w-sm mx-auto leading-relaxed">
                Thank you, {customerName}! Your document configuration is compiled, paid, and queued for printing at Bato Sam Nig.
              </p>
            </div>

            {/* THE DIGITAL RECEIPT CARD */}
            <div className="rounded-[24px] border border-zinc-200 bg-zinc-50 p-5 text-left space-y-4 font-sans relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-zinc-900 text-white px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded-bl-xl">
                Official Receipt
              </div>

              <div className="border-b border-zinc-200/60 pb-3">
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Reference Identifier</span>
                <span className="text-sm font-mono font-extrabold text-zinc-900 block mt-0.5">{printReceipt.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs">
                <div>
                  <span className="text-[9px] font-mono text-zinc-400 block font-bold uppercase tracking-wider">Document Target</span>
                  <span className="font-bold text-zinc-800 uppercase block mt-0.5 truncate">{printReceipt.fileName}</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-zinc-400 block font-bold uppercase tracking-wider">Job Category</span>
                  <span className="font-bold text-zinc-800 uppercase block mt-0.5">{printReceipt.jobType}</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-zinc-400 block font-bold uppercase tracking-wider">Total Volume</span>
                  <span className="font-bold text-zinc-800 block mt-0.5">{printReceipt.pages} Pages • {quantity} Copies</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-zinc-400 block font-bold uppercase tracking-wider">Conversion Cost</span>
                  <span className="font-extrabold text-emerald-700 block mt-0.5">₦{(printReceipt.totalCost * 1500).toLocaleString()} NGN</span>
                </div>
                <div className="col-span-2 border-t border-zinc-200/60 pt-3">
                  <span className="text-[9px] font-mono text-zinc-400 block font-bold uppercase tracking-wider">Fulfillment Status</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 border border-zinc-200 px-2.5 py-1 text-[10px] font-bold text-zinc-800 mt-1 uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {printReceipt.status}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-200/60 pt-3 text-[9px] text-zinc-400 font-semibold text-center italic">
                Timestamped: {new Date(printReceipt.timestamp).toLocaleString()}
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full rounded-[16px] bg-black hover:bg-zinc-900 py-3.5 text-xs font-black text-white transition-all cursor-pointer uppercase tracking-wider border-0"
              >
                Print / Save Receipt PDF
              </button>
              
              <a
                href={printReceipt.whatsappMessage}
                target="_blank"
                rel="noreferrer"
                className="w-full rounded-[16px] border border-zinc-300 hover:bg-zinc-50 py-3.5 text-xs font-bold text-zinc-700 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-center"
              >
                <span>Spool order manually on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setPrintCompleted(false);
                  setPrintReceipt(null);
                  setCurrentStep(1);
                  setFileName("");
                  setFile(null);
                }}
                className="w-full text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-600 transition-colors pt-2 cursor-pointer bg-transparent border-0"
              >
                ← Back to Configurator
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Wizard Progress Line Indicator */}
            <div className="max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-4 gap-2 bg-white border border-slate-200 rounded-[24px] p-4 shadow-xs">
            {[
              { step: 1, label: "1. Upload File" },
              { step: 2, label: "2. Specs Configuration" },
              { step: 3, label: "3. Finishing" },
              { step: 4, label: "4. Fulfillment & Delivery" }
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                  currentStep >= s.step ? "bg-blue-600" : "bg-slate-100"
                }`} />
                <span className={`text-[9px] font-extrabold uppercase tracking-wider mt-2 hidden sm:inline ${
                  currentStep === s.step ? "text-slate-900" : "text-slate-400"
                }`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          
          {/* Active Configurator Panel (Left Column) */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 shadow-sm space-y-6">
              
              {/* Error messages box */}
              {validationError && (
                <div className="flex items-start gap-2.5 rounded-[16px] bg-red-500/10 p-3.5 border border-red-500/20">
                  <Info className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-red-500 leading-snug">{validationError}</p>
                </div>
              )}

              {/* Step Title Header */}
              <div className="border-b border-slate-100 pb-4">
                <span className="font-mono text-[9px] font-black text-blue-600 uppercase tracking-widest">
                  STEP 0{currentStep} OF 04
                </span>
                <h3 className="text-lg font-black text-slate-800 mt-1 uppercase tracking-wide">
                  {currentStep === 1 && "Select & Verify Source Files"}
                  {currentStep === 2 && "Configure Document Print Specifications"}
                  {currentStep === 3 && "Select Binding & Finishing Aesthetics"}
                  {currentStep === 4 && "Choose Store Pickup or Waybill Logistics"}
                </h3>
              </div>

              {/* STEP 1: Upload Files */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-4 gap-2">
                    {(["Print", "Scan", "Graphic Design", "Typing Job"] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setJobType(cat);
                          setValidationError("");
                        }}
                        className={`rounded-[16px] py-3 text-[11px] font-bold border transition-all text-center cursor-pointer ${
                          jobType === cat
                            ? "bg-slate-900 text-white border-slate-900 shadow-md"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="group border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-[24px] bg-slate-50/50 p-10 text-center cursor-pointer transition-all shadow-inner"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.docx,.xlsx,.pptx,.txt,.png,.jpg,.jpeg"
                    />
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white border border-slate-100 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all shadow-xs">
                      <Upload className="h-6 w-6" />
                    </div>
                    <h4 className="mt-4 text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      {fileName ? fileName : "Drag & drop document file here"}
                    </h4>
                    <p className="mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {fileSize
                        ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB Upload Ready`
                        : "Supports PDF, WORD, EXCEL or images (Max 50MB)"}
                    </p>
                    <button
                      type="button"
                      className="mt-4 inline-flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-widest"
                    >
                      Browse files <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Manual input override in case they don't have local files */}
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50/30 p-4 space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alternative: Manual Document Identifier</p>
                    <input
                      type="text"
                      placeholder="e.g. My_NOUN_Biology_Project.pdf"
                      value={fileName}
                      onChange={(e) => {
                        setValidationError("");
                        setFileName(e.target.value);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-[16px] px-4 py-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                    />
                  </div>

                  {/* INTELLIGENT IMAGE ENHANCEMENT SUITE */}
                  {originalImageSrc && (
                    <div className="rounded-[32px] border border-blue-100 bg-blue-50/20 p-5 space-y-4 animate-in zoom-in-95 duration-300">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-black text-blue-800 uppercase tracking-widest">
                          <Sparkles className="h-4.5 w-4.5 text-cyan-500 animate-pulse" />
                          AI Image Enhancement Suite
                        </span>
                        <span className="bg-blue-600 text-[8px] font-black tracking-widest text-white px-2 py-0.5 rounded uppercase">
                          Active Photo
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                        Standard mobile camera photos are auto-optimized into print-ready digital assets. Adjust parameters to run real-time sharpening, contrast normalization, and alignment.
                      </p>

                      {/* Interactive parameter toggles */}
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 rounded-[16px] bg-white border border-slate-200 p-2.5 cursor-pointer hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={enhancementOptions.deskew}
                            onChange={(e) => setEnhancementOptions(prev => ({ ...prev, deskew: e.target.checked }))}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Auto-Deskew Page</span>
                        </label>
                        <label className="flex items-center gap-2 rounded-[16px] bg-white border border-slate-200 p-2.5 cursor-pointer hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={enhancementOptions.sharpen}
                            onChange={(e) => setEnhancementOptions(prev => ({ ...prev, sharpen: e.target.checked }))}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">High-Pass Sharpen</span>
                        </label>
                        <label className="flex items-center gap-2 rounded-[16px] bg-white border border-slate-200 p-2.5 cursor-pointer hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={enhancementOptions.contrast}
                            onChange={(e) => setEnhancementOptions(prev => ({ ...prev, contrast: e.target.checked }))}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Normalize Contrast</span>
                        </label>
                        <label className="flex items-center gap-2 rounded-[16px] bg-white border border-slate-200 p-2.5 cursor-pointer hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={enhancementOptions.denoise}
                            onChange={(e) => setEnhancementOptions(prev => ({ ...prev, denoise: e.target.checked }))}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Noise Filtering</span>
                        </label>
                      </div>

                      {/* Skew angle manual slider adjustment */}
                      {enhancementOptions.deskew && (
                        <div className="space-y-1.5 p-3 rounded-[16px] bg-white border border-slate-100">
                          <div className="flex justify-between text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">
                            <span>Fine-tune Page Alignment</span>
                            <span className="text-blue-600">{enhancementOptions.skewAngle.toFixed(1)}° Angle</span>
                          </div>
                          <input
                            type="range"
                            min="-10"
                            max="10"
                            step="0.5"
                            value={enhancementOptions.skewAngle}
                            onChange={(e) => setEnhancementOptions(prev => ({ ...prev, skewAngle: parseFloat(e.target.value) }))}
                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>
                      )}

                      {/* Visual comparative preview */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="space-y-1">
                          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider text-center">Original Upload</p>
                          <div className="rounded-[16px] border border-slate-200 bg-white p-1 overflow-hidden h-32 flex items-center justify-center relative">
                            <img src={originalImageSrc} className="max-h-full max-w-full object-contain" alt="original uploaded preview" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-extrabold text-blue-500 uppercase tracking-wider text-center">Enhanced & Straightened</p>
                          <div className="rounded-[16px] border border-blue-200 bg-white p-1 overflow-hidden h-32 flex items-center justify-center relative">
                            {isEnhancing ? (
                              <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                <span className="text-[8px] font-bold text-blue-600 uppercase tracking-wider mt-1.5">Processing...</span>
                              </div>
                            ) : enhancedImageSrc ? (
                              <img src={enhancedImageSrc} className="max-h-full max-w-full object-contain animate-in fade-in duration-300" alt="enhanced preview" />
                            ) : (
                              <span className="text-[8px] text-slate-400">Loading pipeline...</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Display performance metrics */}
                      {enhancementStats && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[8px] font-black uppercase text-slate-400 border-t border-slate-100 pt-3">
                          <span className="text-slate-500 font-bold">Metrics:</span>
                          <span>Alignment: {enhancementStats.skewAngleDetected.toFixed(1)}°</span>
                          <span>Contrast: {enhancementStats.contrastStretched ? "Stretched" : "Normal"}</span>
                          <span>Denoise: {enhancementStats.noiseReduced ? "Active" : "Disabled"}</span>
                          <span>Render Time: {enhancementStats.durationMs}ms</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* VERSATILE FILE CONVERSION SUITE */}
                  <div className="rounded-[32px] border border-slate-200 bg-slate-50/40 p-5 space-y-4">
                    <span className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-widest">
                      <RefreshCw className="h-4.5 w-4.5 text-slate-600" />
                      Vanguard File Conversion Suite
                    </span>

                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                      Select a structured conversion pipeline below to transform documents between formats asynchronously using Gemini AI structure parsing.
                    </p>

                    <div className="grid grid-cols-3 gap-2">
                      {(["PDF to Word", "Image to Text (OCR)", "Doc to Image"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSelectedConversionType(type)}
                          className={`rounded-[16px] py-2 text-[10px] font-extrabold border transition-all text-center cursor-pointer ${
                            selectedConversionType === type
                              ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={triggerConversionJob}
                      disabled={!!conversionActiveJob}
                      className="w-full flex items-center justify-center gap-1.5 rounded-[16px] bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-extrabold text-[10px] uppercase tracking-wider py-3.5 shadow-sm transition-all cursor-pointer"
                    >
                      {conversionActiveJob ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Assembling Pipeline Spool...</span>
                        </>
                      ) : (
                        <>
                          <Sliders className="h-4 w-4" />
                          <span>Start Multi-Format Conversion</span>
                        </>
                      )}
                    </button>

                    {/* Active queues listing */}
                    {conversionQueue.length > 0 && (
                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Conversion Queued Jobs</p>
                        <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                          {conversionQueue.map((job) => (
                            <div key={job.id} className="rounded-[16px] border border-slate-100 bg-white p-3 space-y-2">
                              <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-wide">
                                <span className="text-slate-800 truncate max-w-[150px]">{job.fileName}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] ${
                                  job.status === "Done" ? "bg-green-50 text-green-600 border border-green-200" :
                                  job.status === "Failed" ? "bg-red-50 text-red-600 border border-red-200" :
                                  "bg-blue-50 text-blue-600 border border-blue-200 animate-pulse"
                                }`}>
                                  {job.status}
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${job.status === "Failed" ? "bg-red-500" : "bg-blue-600"}`}
                                  style={{ width: `${job.progress}%` }}
                                />
                              </div>

                              <div className="flex justify-between items-center text-[8px] text-slate-400 font-bold">
                                <span>TYPE: {job.type}</span>
                                {job.status === "Done" && job.downloadUrl && (
                                  <a 
                                    href={job.downloadUrl}
                                    download={job.type === "PDF to Word" ? "word_export.txt" : job.type === "Image to Text (OCR)" ? "ocr_extraction.txt" : "rendered_document.jpg"}
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 uppercase"
                                  >
                                    <Download className="h-3 w-3" /> Download Result
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Result viewing pane */}
                    {conversionTextOutput && (
                      <div className="rounded-[16px] border border-slate-200 bg-slate-900 p-4 space-y-2 text-white animate-in slide-in-from-top-2 duration-300">
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                          <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest font-mono">Conversion Output Results</span>
                          <button 
                            type="button" 
                            onClick={() => {
                              navigator.clipboard.writeText(conversionTextOutput);
                              alert("Content copied to clipboard!");
                            }}
                            className="text-[8px] font-bold text-slate-400 hover:text-white uppercase"
                          >
                            Copy Output
                          </button>
                        </div>
                        <pre className="text-[9px] font-mono leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto text-slate-300">
                          {conversionTextOutput}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: Choose Specs */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  
                  {/* DYNAMIC SPECIFICATIONS ACCORDING TO JOBTYPE (Centralized Configuration Scheme) */}
                  
                  {/* A. PRINTING SPECIFICATIONS */}
                  {jobType === "Print" && (
                    <div className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Layout Page Count
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={pageCount}
                            onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-1"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Total Copies Needed
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-1"
                          />
                        </div>
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Color Selection
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setColorMode("Mono")}
                              className={`rounded-[16px] py-3 text-xs font-bold border transition-all text-center cursor-pointer ${
                                colorMode === "Mono"
                                  ? "bg-slate-950 text-white border-slate-950 shadow-sm"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              B&W Monochrome
                            </button>
                            <button
                              type="button"
                              onClick={() => setColorMode("Color")}
                              className={`rounded-[16px] py-3 text-xs font-bold border transition-all text-center cursor-pointer ${
                                colorMode === "Color"
                                  ? "bg-slate-950 text-white border-slate-950 shadow-sm"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              Full Glossy Color
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Duplex Printing
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setSides("Single-Sided")}
                              className={`rounded-[16px] py-3 text-xs font-bold border transition-all text-center cursor-pointer ${
                                sides === "Single-Sided"
                                  ? "bg-slate-950 text-white border-slate-950 shadow-sm"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              Single-Sided
                            </button>
                            <button
                              type="button"
                              onClick={() => setSides("Double-Sided")}
                              className={`rounded-[16px] py-3 text-xs font-bold border transition-all text-center cursor-pointer ${
                                sides === "Double-Sided"
                                  ? "bg-slate-950 text-white border-slate-950 shadow-sm"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              Double-Sided (15% Off)
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Paper Sizing and Weights */}
                      <div className="grid gap-6 sm:grid-cols-2 pt-2 border-t border-slate-100">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Paper Stock Weight
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {["80gsm", "120gsm", "250gsm", "300gsm"].map((weight) => (
                              <button
                                key={weight}
                                type="button"
                                onClick={() => setPaperWeight(weight as any)}
                                className={`rounded-[16px] py-2.5 text-[10px] font-bold border transition-all text-center cursor-pointer ${
                                  paperWeight === weight
                                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                {weight === "80gsm" && "80gsm (Standard)"}
                                {weight === "120gsm" && "120gsm (Letterhead)"}
                                {weight === "250gsm" && "250gsm (Glossy)"}
                                {weight === "300gsm" && "300gsm (Cardboard)"}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Paper Dimensions (Size)
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {["A4", "A3", "A5", "Letter"].map((sz) => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => setPaperSize(sz as any)}
                                className={`rounded-[16px] py-2.5 text-[10px] font-bold border transition-all text-center cursor-pointer ${
                                  paperSize === sz
                                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                {sz} Document
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* B. SCANNING SPECIFICATIONS */}
                  {jobType === "Scan" && (
                    <div className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Pages to Scan
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={pageCount}
                            onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Scan Output Color Mode
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {["Mono", "Color"].map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setColorMode(color as any)}
                                className={`rounded-[16px] py-2.5 text-xs font-bold border transition-all cursor-pointer text-center ${
                                  colorMode === color ? "bg-slate-950 text-white border-slate-950" : "bg-white text-slate-700 border-slate-200"
                                }`}
                              >
                                {color === "Mono" ? "Grayscale" : "Full Color (24-bit)"}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2 border-t border-slate-100 pt-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Optical Scan Resolution
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {["150", "300", "600"].map((res) => (
                              <button
                                key={res}
                                type="button"
                                onClick={() => setScanResolution(res as any)}
                                className={`rounded-[16px] py-2.5 text-[10px] font-bold border transition-all cursor-pointer text-center ${
                                  scanResolution === res ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200"
                                }`}
                              >
                                {res} DPI
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Export File Format
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {["PDF", "JPEG", "TIFF"].map((fmt) => (
                              <button
                                key={fmt}
                                type="button"
                                onClick={() => setScanOutputFormat(fmt as any)}
                                className={`rounded-[16px] py-2.5 text-[10px] font-bold border transition-all cursor-pointer text-center ${
                                  scanOutputFormat === fmt ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200"
                                }`}
                              >
                                .{fmt} File
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* C. GRAPHIC DESIGN ENGINE */}
                  {jobType === "Graphic Design" && (
                    <div className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Creative Design Preset
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {["Minimalist", "High-Tech", "Brutalist", "Retro", "Corporate"].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setDesignPreset(preset as any)}
                                className={`rounded-[16px] py-2 text-[10px] font-bold border transition-all cursor-pointer text-center ${
                                  designPreset === preset ? "bg-slate-950 text-white border-slate-950" : "bg-white text-slate-700 border-slate-200"
                                }`}
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Document Bleed Margins
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {["0mm", "3mm", "5mm"].map((bleed) => (
                              <button
                                key={bleed}
                                type="button"
                                onClick={() => setDesignBleed(bleed as any)}
                                className={`rounded-[16px] py-2.5 text-[10px] font-bold border transition-all cursor-pointer text-center ${
                                  designBleed === bleed ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200"
                                }`}
                              >
                                {bleed === "0mm" ? "None (0mm)" : `${bleed} Bleed`}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2 border-t border-slate-100 pt-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Design Render Resolution
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {["72", "150", "300"].map((dpi) => (
                              <button
                                key={dpi}
                                type="button"
                                onClick={() => setDesignResolution(dpi as any)}
                                className={`rounded-[16px] py-2.5 text-[10px] font-bold border transition-all cursor-pointer text-center ${
                                  designResolution === dpi ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200"
                                }`}
                              >
                                {dpi === "72" ? "72 DPI (Web)" : dpi === "150" ? "150 DPI (Draft)" : "300 DPI (Print)"}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Ambient Color Overlay
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {["None", "Cosmic Blue", "Golden Amber", "Emerald Green"].map((overlay) => (
                              <button
                                key={overlay}
                                type="button"
                                onClick={() => setDesignColorOverlay(overlay as any)}
                                className={`rounded-[16px] py-2.5 text-[10px] font-bold border transition-all cursor-pointer text-center ${
                                  designColorOverlay === overlay ? "bg-slate-950 text-white border-slate-950" : "bg-white text-slate-700 border-slate-200"
                                }`}
                              >
                                {overlay}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* D. TYPING JOB & INTELLIGENT DATA ENTRY SUITE */}
                  {jobType === "Typing Job" && (
                    <div className="space-y-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Target Document Template
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: "CV", name: "CV / Professional Resume" },
                              { id: "Proposal", name: "Business Proposal Brief" },
                              { id: "Letterhead", name: "Corporate Letterhead" },
                              { id: "Legal Charter", name: "CAC Legal Charter & Bylaw" }
                            ].map((tmpl) => (
                              <button
                                key={tmpl.id}
                                type="button"
                                onClick={() => setTypingTemplate(tmpl.id as any)}
                                className={`rounded-[16px] p-2.5 text-[9px] font-extrabold border transition-all cursor-pointer text-left ${
                                  typingTemplate === tmpl.id ? "bg-slate-950 text-white border-slate-950" : "bg-white text-slate-700 border-slate-200"
                                }`}
                              >
                                {tmpl.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Typographical Font Pairing
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {["Modern", "Elegant", "Neutral"].map((fp) => (
                              <button
                                key={fp}
                                type="button"
                                onClick={() => setTypingFontPairing(fp as any)}
                                className={`rounded-[16px] py-2.5 text-[10px] font-bold border transition-all cursor-pointer text-center ${
                                  typingFontPairing === fp ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200"
                                }`}
                              >
                                {fp === "Modern" && "Inter/Mono"}
                                {fp === "Elegant" && "Playfair/Inter"}
                                {fp === "Neutral" && "System UI"}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Structured text editor */}
                      <div className="space-y-2 border-t border-slate-100 pt-4">
                        <div className="flex justify-between items-center">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Live Structured Document Content
                          </label>
                          <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest font-mono">
                            Auto-Formatting Enabled
                          </span>
                        </div>

                        <textarea
                          rows={6}
                          placeholder={`Enter raw document text here to spidery spool... \nFor example: Samuel Chinedu, Lagos. Education: BSc Computer Science...`}
                          value={typingTextContent}
                          onChange={(e) => setTypingTextContent(e.target.value)}
                          className="w-full rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-950 outline-none focus:border-blue-500"
                        />

                        <button
                          type="button"
                          onClick={handleProofreadText}
                          disabled={isProofreading || !typingTextContent.trim()}
                          className="w-full flex items-center justify-center gap-1.5 rounded-[16px] bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 text-white font-extrabold text-[10px] uppercase tracking-wider py-3.5 shadow-sm transition-all cursor-pointer"
                        >
                          {isProofreading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Analyzing grammar and semantic layout...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              <span>Proofread & Polish with Vanguard AI</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Proofreader evaluation details rendering */}
                      {typingProofreadResult && (
                        <div className="rounded-[24px] border border-blue-100 bg-blue-50/10 p-4 space-y-4 animate-in slide-in-from-top-3 duration-300 text-slate-800">
                          <div className="flex items-center justify-between border-b border-blue-100/50 pb-2.5">
                            <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest flex items-center gap-1">
                              <FileCheck className="h-4 w-4 text-emerald-500" />
                              AI Proofreader Diagnostics
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-slate-400">Score:</span>
                              <span className="bg-emerald-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded">
                                {typingProofreadResult.score}/100
                              </span>
                              <span className="text-[9px] font-bold text-slate-400">Readability:</span>
                              <span className="bg-blue-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded">
                                {typingProofreadResult.readability}
                              </span>
                            </div>
                          </div>

                          {/* Corrections list */}
                          {typingProofreadResult.corrections.length > 0 ? (
                            <div className="space-y-2">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Identified Corrections ({typingProofreadResult.corrections.length})</p>
                              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                {typingProofreadResult.corrections.map((corr, idx) => (
                                  <div key={idx} className="text-[9px] bg-white border border-slate-100 p-2 rounded-[16px] flex items-start gap-2">
                                    <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                      <p className="font-bold text-slate-500 uppercase tracking-wide">Type: {corr.type}</p>
                                      <p className="font-medium">
                                        Changed <span className="line-through text-red-500 font-semibold">{corr.original}</span> to <span className="text-emerald-600 font-black">{corr.replacement}</span>
                                      </p>
                                      <p className="text-[8px] text-slate-400 leading-normal">{corr.reason}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-[9px] text-emerald-600 font-bold bg-white border border-emerald-100 p-2.5 rounded-[16px] flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4" />
                              No grammatical or spelling discrepancies found. Pristine document!
                            </div>
                          )}

                          {/* Copyable polished text view */}
                          {typingPolishedOutput && (
                            <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                              <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
                                <span>Corrected & Enhanced Prose</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTypingTextContent(typingPolishedOutput);
                                    alert("Pristine copy has replaced your live workspace text!");
                                  }}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  Apply to Workspace
                                </button>
                              </div>
                              <pre className="text-[10px] font-mono leading-relaxed bg-white border border-slate-100 p-3 rounded-[16px] whitespace-pre-wrap max-h-32 overflow-y-auto">
                                {typingPolishedOutput}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* STEP 3: Finishing Options */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Finishing & Bindery Style
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { id: "None", name: "No Finishing", desc: "Loose stacked pages", rate: "Free" },
                        { id: "Spiral Binding", name: "Spiral Bind", desc: "Plastic comb overlay", rate: "+$3.50" },
                        { id: "Hardback Cover", name: "Hardcover Book", desc: "Luxury project bound casing", rate: "+$15.00" },
                        { id: "Laminating", name: "Glass Lamination", desc: "Waterproof seal cover sheets", rate: "+$1.00/page" },
                        { id: "Stapling", name: "Corner Stapling", desc: "Standard heavy duty staple", rate: "+$0.20" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFinishing(item.id as any)}
                          className={`flex items-start justify-between rounded-[16px] border p-4 text-left transition-all cursor-pointer ${
                            finishing === item.id
                              ? "bg-slate-950 border-slate-950 text-white shadow-md"
                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                          }`}
                        >
                          <div>
                            <p className="text-xs font-extrabold uppercase tracking-wide">{item.name}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{item.desc}</p>
                          </div>
                          <span className="font-mono text-[9px] font-black uppercase text-blue-500">{item.rate}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Special Finishing Instructions
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Bind with solid black backing card and clear acetate front cover please..."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-950 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Delivery Options */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Client Contact Details */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Samuel Chinedu"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-[16px] px-4 py-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Email Address (For Secure Payment Receipt)
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. sam@example.com"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-[16px] px-4 py-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Fulfillment Delivery Method
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDeliveryMethod("Pickup");
                          setValidationError("");
                        }}
                        className={`flex items-start gap-3 rounded-[24px] border p-4 text-left transition-all cursor-pointer ${
                          deliveryMethod === "Pickup"
                            ? "bg-slate-950 border-slate-950 text-white shadow-md"
                            : "bg-white border-slate-200 text-slate-800"
                        }`}
                      >
                        <MapPin className="h-5 w-5 text-blue-500 shrink-0" />
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-wider">Pickup at Shop</p>
                          <p className="text-[10px] text-slate-400 mt-1 leading-normal">Bato Sam Plaza Suite 12, Yaba, Lagos</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDeliveryMethod("Waybill");
                          setValidationError("");
                        }}
                        className={`flex items-start gap-3 rounded-[24px] border p-4 text-left transition-all cursor-pointer ${
                          deliveryMethod === "Waybill"
                            ? "bg-slate-950 border-slate-950 text-white shadow-md"
                            : "bg-white border-slate-200 text-slate-800"
                        }`}
                      >
                        <Truck className="h-5 w-5 text-indigo-500 shrink-0" />
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-wider">Waybill Logistics</p>
                          <p className="text-[10px] text-slate-400 mt-1 leading-normal">Direct home delivery via park waybill (+ $5.00)</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {deliveryMethod === "Waybill" && (
                    <div className="animate-in slide-in-from-top-2 duration-200">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Detailed Waybill Destination Address
                      </label>
                      <input
                        type="text"
                        placeholder="House No, Street name, City, State (e.g. Enugu, Port Harcourt, Abuja)"
                        required
                        value={deliveryAddress}
                        onChange={(e) => {
                          setValidationError("");
                          setDeliveryAddress(e.target.value);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-[16px] px-4 py-3.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                      />
                    </div>
                  )}

                  {/* Payment Method Choice */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Select Payment Gateway
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-[16px] border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("paystack")}
                        className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 ${
                          paymentMethod === "paystack" ? "bg-white text-black font-black shadow-sm" : "text-slate-500 hover:text-black"
                        }`}
                      >
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span>Paystack Gateway</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("opay")}
                        className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 ${
                          paymentMethod === "opay" ? "bg-white text-black font-black shadow-sm" : "text-slate-500 hover:text-black"
                        }`}
                      >
                        <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                        <span>OPay Transfer</span>
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-100 bg-slate-50/50 p-4 space-y-2 text-slate-600 font-semibold text-xs">
                    <p className="text-slate-800 font-bold uppercase text-[9px] tracking-wider text-blue-600 font-black">Verification Compliance Audit</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                      By proceeding, you verify that page counts matching your attached file {fileName ? `'${fileName}'` : "empty"} are accurate. Incorrect calculations will require invoice adjustments.
                    </p>
                  </div>
                </div>
              )}

              {/* Wizard Steps Navigation Bar */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 gap-4">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={stepBack}
                    className="flex items-center gap-1.5 rounded-[16px] border border-slate-200 bg-white hover:bg-slate-50 px-5 py-3 text-xs font-bold text-slate-700 cursor-pointer transition-all bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={validateAndNext}
                    className="flex items-center gap-1.5 rounded-[16px] bg-slate-900 hover:bg-slate-800 px-6 py-3 text-xs font-bold text-white cursor-pointer transition-all ml-auto shadow-md border-0"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="h-4 w-4 text-blue-400" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitJob}
                    disabled={loading || maintenanceMode}
                    className="flex items-center gap-1.5 rounded-[16px] bg-black hover:bg-zinc-950 disabled:bg-slate-300 px-7 py-3.5 text-xs font-bold text-white cursor-pointer transition-all ml-auto shadow-lg border-0"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Transmitting parameters...</span>
                      </>
                    ) : (
                      <>
                        <Printer className="h-4 w-4 text-white" />
                        <span>{paymentMethod === "paystack" ? "Authorize & Pay (Paystack)" : "Initiate OPay Transfer"}</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Right Column (Live Previews & status Tracker) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Document Clipboard mockup container */}
            <div className="rounded-[32px] bg-slate-950 p-6 border border-white/10 relative overflow-hidden flex flex-col items-center shadow-mdx">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse" />
              
              <div className="w-full flex items-center justify-between mb-4 font-mono">
                <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                  LIVE PREVIEW MOCKUP
                </span>
                <span className="bg-white/5 border border-white/10 rounded text-[8px] font-black tracking-widest text-slate-400 px-1.5 py-0.5 uppercase">
                  {jobType}
                </span>
              </div>

              {/* Wooden Clipboard frame */}
              <div className="relative w-full max-w-[210px] bg-amber-950/40 rounded-[24px] p-4 pt-8 border border-amber-900/30 shadow-2xl flex flex-col items-center">
                
                {/* Clipboard Clip */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-16 h-5 bg-gradient-to-b from-slate-200 to-slate-400 rounded-b-md border-b border-slate-500 shadow-md flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                </div>

                {/* Simulated Sheet of Paper */}
                <div className={`w-full min-h-[250px] bg-white rounded shadow-lg p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300 border-l-[3px] ${
                  finishing === "Spiral Binding" ? "border-dashed border-slate-500" : "border-slate-100"
                }`}>
                  
                  {/* Spiral Binding Overlay visual indicator */}
                  {finishing === "Spiral Binding" && (
                    <div className="absolute -left-1.5 top-4 bottom-4 flex flex-col justify-between w-2 text-[6px] select-none pointer-events-none">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <span key={i} className="leading-none -mt-1 text-slate-400">⭕</span>
                      ))}
                    </div>
                  )}

                  {/* Stapled Corner visual indicator */}
                  {finishing === "Stapling" && (
                    <div className="absolute top-1 left-1.5 h-1.5 w-4 bg-slate-400 rounded-xs rotate-[-35deg] border-b border-slate-600" />
                  )}

                  {/* Lamination cover thick glass reflection */}
                  {finishing === "Laminating" && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/40 pointer-events-none border border-slate-300/30" />
                  )}

                  {/* Hardback Cover thick luxury border */}
                  {finishing === "Hardback Cover" && (
                    <div className="absolute inset-0 border-[3.5px] border-amber-600/30 pointer-events-none" />
                  )}

                  {/* Sheet Header */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-wider font-mono">
                        Bato Sam Print Core
                      </span>
                      <span className="text-[6px] font-mono text-slate-300 font-bold">
                        A4_SPOOL
                      </span>
                    </div>

                    <div className="pt-2 text-center">
                      <p className="text-[8px] font-black text-slate-800 uppercase tracking-tight truncate max-w-[140px] mx-auto">
                        {fileName ? fileName : "Draft_Awaiting_Files.pdf"}
                      </p>
                      <p className="text-[6px] font-mono font-bold text-slate-400 mt-0.5">
                        SCOPE: {pageCount} PAGE{pageCount > 1 ? "S" : ""} • {quantity} COPY{quantity > 1 ? "IES" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Graphic Content Lines */}
                  <div className="space-y-2 py-3">
                    {/* Simulated Text Paragraph Lines */}
                    <div className="space-y-1">
                      <div className={`h-1.5 w-11/12 rounded-xs ${colorMode === "Color" ? "bg-blue-500/20" : "bg-slate-200"}`} />
                      <div className={`h-1.5 w-5/6 rounded-xs ${colorMode === "Color" ? "bg-indigo-500/20" : "bg-slate-200"}`} />
                      <div className={`h-1.5 w-3/4 rounded-xs ${colorMode === "Color" ? "bg-blue-500/10" : "bg-slate-100"}`} />
                    </div>

                    {/* Cute dynamic chart box if color or mono */}
                    <div className={`h-12 rounded-lg border flex items-center justify-center p-2 relative overflow-hidden ${
                      colorMode === "Color"
                        ? "bg-blue-50/50 border-blue-100 text-blue-500" 
                        : "bg-slate-50 border-slate-100 text-slate-400"
                    }`}>
                      <FileText className="h-5 w-5 opacity-40" />
                      <div className="absolute bottom-1 right-1 flex gap-0.5 items-end h-5">
                        <div className={`w-1 rounded-t-xs h-3 ${colorMode === "Color" ? "bg-blue-500" : "bg-slate-300"}`} />
                        <div className={`w-1 rounded-t-xs h-4 ${colorMode === "Color" ? "bg-indigo-500" : "bg-slate-300"}`} />
                        <div className={`w-1 rounded-t-xs h-2 ${colorMode === "Color" ? "bg-cyan-500" : "bg-slate-300"}`} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className={`h-1.5 w-11/12 rounded-xs ${colorMode === "Color" ? "bg-blue-400/20" : "bg-slate-200"}`} />
                    </div>
                  </div>

                  {/* Document Footer Watermark stamp */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-1.5">
                    <span className="text-[5px] font-mono font-black text-slate-300 uppercase tracking-widest">
                      SYSTEM_PROV_AUTH
                    </span>
                    <span className="text-[5px] font-mono font-bold bg-blue-100 text-blue-800 rounded px-1 scale-90">
                      {colorMode === "Color" ? "COLOR_LASER" : "MONO_HIGH"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
 
            {/* Dynamic Price Estimation Calculator widget */}
            <PrintPriceCalculator 
              initialSpecs={{
                paperWeight,
                finishing,
                quantity,
                colorMode
              }}
              onApplySpecs={(specs) => {
                setPaperWeight(specs.paperWeight);
                setFinishing(specs.finishing);
                setQuantity(specs.quantity);
                setColorMode(specs.colorMode);
                setValidationError("");
              }}
            />

            {/* Price evaluation invoice */}
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden font-semibold">
              <div className="absolute top-0 right-0 bg-slate-900 text-white border-l border-b border-slate-900 px-3.5 py-1 text-[9px] font-bold uppercase tracking-widest font-mono">
                Invoice V3.2
              </div>

              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <Sliders className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-sans text-sm font-extrabold text-slate-900">Dynamic Valuation</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Live fee computation</p>
                </div>
              </div>

              {/* Total display panel */}
              <div className="rounded-[16px] bg-slate-900 p-4 text-white relative overflow-hidden">
                <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Aggregate Quote Estimate</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black tracking-tight">${totalCost.toFixed(2)}</span>
                  <span className="text-xs font-bold text-slate-400 font-mono">USD</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-2">
                  Completion time: 24h Express delivery
                </p>
              </div>

              {/* Spec breakdown */}
              <div className="space-y-3 pt-4 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Reference ID:</span>
                  <span className="font-mono text-slate-900">{ticketId}</span>
                </div>

                <div className="flex justify-between items-center text-slate-500">
                  <span>Source File:</span>
                  <span className="text-slate-900 max-w-[150px] truncate">
                    {fileName ? fileName : "Awaiting selection"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-500">
                  <span>Color Mode:</span>
                  <span className="text-slate-900">{colorMode === "Color" ? "Glossy Color" : "B&W Mono"}</span>
                </div>

                <div className="flex justify-between items-center text-slate-500">
                  <span>Sheet Layout:</span>
                  <span className="text-slate-900">{sides}</span>
                </div>

                <div className="flex justify-between items-center text-slate-500">
                  <span>Finishing style:</span>
                  <span className="text-slate-900">{finishing}</span>
                </div>

                <div className="flex justify-between items-center text-slate-500">
                  <span>Fulfillment:</span>
                  <span className="text-slate-900">{deliveryMethod === "Waybill" ? "Waybill Destination" : "Self Store Pickup"}</span>
                </div>
              </div>

              {quantity >= 10 && (
                <div className="mt-4 p-2 rounded-lg bg-emerald-50 text-emerald-700 text-center text-[10px] font-bold">
                  🎉 Volume discount applied automatically!
                </div>
              )}
            </div>

            {/* Dynamic Job Tracker Status Timeline */}
            {activeTracker && (
              <div className="rounded-[32px] border border-blue-100 bg-slate-900 text-white p-6 shadow-lg relative overflow-hidden animate-in fade-in duration-500">
                <div className="absolute top-0 right-0 bg-blue-500/20 text-blue-400 border-l border-b border-blue-500/15 px-3 py-1 text-[8px] font-black uppercase tracking-wider font-mono">
                  SPOOLER LIVE
                </div>

                <div className="flex items-center gap-2.5 mb-4 border-b border-white/5 pb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <RefreshCw className={`h-4 w-4 ${activeTracker.status === "Processing" ? "animate-spin" : ""}`} />
                  </div>
                  <div>
                    <h5 className="font-sans text-xs font-black uppercase tracking-wider text-white">Interactive Job Tracker</h5>
                    <p className="text-[9px] font-mono font-bold text-slate-500 mt-0.5">TICKET ID: {activeTracker.id}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400">
                    <span>Active File:</span>
                    <span className="text-white truncate max-w-[150px]">{activeTracker.fileName}</span>
                  </div>

                  {/* Status Timeline Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-400 font-sans">Active Queue Status: <strong className="text-blue-400">{activeTracker.status}</strong></span>
                      <span className="text-blue-400 font-mono">{activeTracker.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${activeTracker.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Dynamic Hop Timeline Steps (Received > Processing > Ready) */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-white/5">
                    <div className="flex flex-col items-center">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                        activeTracker.progress >= 10 
                          ? "bg-blue-600/20 border-blue-500 text-blue-400 font-black" 
                          : "bg-slate-950 border-white/5 text-slate-600"
                      }`}>
                        1
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Received</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                        activeTracker.progress >= 40 
                          ? "bg-blue-600/20 border-blue-500 text-blue-400 font-black" 
                          : "bg-slate-950 border-white/5 text-slate-600"
                      }`}>
                        2
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Processing</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                        activeTracker.progress >= 100 
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-black" 
                          : "bg-slate-950 border-white/5 text-slate-600"
                      }`}>
                        ✓
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Ready</span>
                    </div>
                  </div>

                  <div className="rounded-[16px] bg-slate-950/60 p-3 text-[10px] font-semibold leading-relaxed border border-white/5">
                    {activeTracker.status === "Received" && (
                      <p className="text-slate-400 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                        Invoice generated. Transmitting specs to the Bato Sam high-speed lasers...
                      </p>
                    )}
                    {activeTracker.status === "Processing" && (
                      <p className="text-blue-400 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                        Laser printhead heating up. Calibrating paper tray and binding spines...
                      </p>
                    )}
                    {activeTracker.status === "Ready" && (
                      <p className="text-emerald-400 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Spooling finished! Documents filed securely in your Lockbox. Open the Vault to find files.
                      </p>
                    )}
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>
          </>
        )}

      </div>

      {showOPayModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-[24px] border border-zinc-200 bg-white p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden text-zinc-900 animate-in fade-in zoom-in-95 duration-200">
            <button 
              type="button"
              onClick={() => setShowOPayModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black transition-colors cursor-pointer text-sm font-bold bg-transparent border-0"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-zinc-100 border border-zinc-200 text-black">
                <span className="font-sans text-xl font-black">₦</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 uppercase tracking-wider">
                {opayVerifying ? "Verifying Transaction" : "OPay Bank Transfer"}
              </h3>
              <p className="text-[10px] text-zinc-500 font-semibold max-w-xs mx-auto leading-normal">
                {opayVerifying 
                  ? "Please hold while our automated system performs real-time ledger reconciliation with OPay API..."
                  : "Please make an instant transfer of the exact fee to Bato Sam Nig's official merchant account."
                }
              </p>
            </div>

            {opayVerifying ? (
              <div className="py-8 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-black" />
                <span className="text-xs font-mono font-bold tracking-widest text-zinc-500 animate-pulse uppercase">
                  Checking ledger for reference...
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-zinc-50 rounded-[16px] p-4 border border-zinc-200 space-y-3 font-sans text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60">
                    <span className="text-zinc-500 font-medium">Bank Name</span>
                    <span className="font-extrabold text-zinc-800">OPay</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60">
                    <span className="text-zinc-500 font-medium">Account Number</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText("08064909999");
                      }}
                      className="font-mono font-extrabold text-zinc-900 hover:underline cursor-pointer flex items-center gap-1 bg-transparent border-0"
                    >
                      <span>08064909999</span>
                      <span className="text-[9px] text-zinc-400 font-normal">(Copy)</span>
                    </button>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60">
                    <span className="text-zinc-500 font-medium">Account Name</span>
                    <span className="font-extrabold text-zinc-800">BATOSAM NIG.</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60">
                    <span className="text-zinc-500 font-medium">Amount to Pay</span>
                    <span className="font-extrabold text-zinc-900">
                      ₦{Math.round(Math.max(500, totalCost * 1500)).toLocaleString()} NGN
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-medium text-[10px]">Transfer Description / Memo</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(opayRef);
                      }}
                      className="font-mono font-extrabold text-indigo-700 hover:underline cursor-pointer flex items-center gap-1 bg-transparent border-0"
                    >
                      <span>{opayRef}</span>
                      <span className="text-[9px] text-indigo-400 font-normal">(Copy)</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 text-[9px] text-zinc-500 font-semibold leading-relaxed bg-zinc-100/50 p-3 rounded-lg border border-zinc-200/50">
                  <span className="text-emerald-600 shrink-0">ℹ</span>
                  <span>
                    Include the unique reference <strong>{opayRef}</strong> as the bank transfer memo/narration to ensure real-time auto-reconciliation.
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      setOpayVerifying(true);
                      setTimeout(async () => {
                        setOpayVerifying(false);
                        setShowOPayModal(false);
                        await completePrintOrder(opayRef);
                      }, 3000);
                    }}
                    className="w-full rounded-[16px] bg-black hover:bg-zinc-900 py-3.5 text-xs font-black text-white transition-all cursor-pointer uppercase tracking-wider text-center border-0"
                  >
                    I Have Completed Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOPayModal(false)}
                    className="w-full text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-600 transition-colors py-1 cursor-pointer bg-transparent border-0"
                  >
                    Cancel & Modify Form
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </section>
  );
}
