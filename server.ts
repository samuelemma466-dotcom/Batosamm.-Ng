import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialiser for Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not configured in environment variables.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Store enrollments and print jobs in-memory for session-based interactive state
const mockDatabase = {
  enrollments: [] as any[],
  printJobs: [] as any[],
};

// ==========================================
// API ENDPOINTS
// ==========================================

// 1. 24/7 AI Concierge Chat Proxy
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.json({
        text: "Hello! I am the Vanguard AI Concierge. It looks like my API key is not fully configured yet, but I can still tell you about Vanguard Digital & Tech Hub! We offer professional CAC business registration, high-quality printing, and tech courses (Web Development & Microsoft Office). How can I assist you with these services today?",
      });
    }

    // Map frontend messages to Gemini contents structure
    // Frontend structure: { sender: 'user' | 'bot', text: string }
    const formattedContents = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: `You are the elegant and highly professional 24/7 AI Concierge for Vanguard Digital & Tech Hub.
Your tone must be premium, trustworthy, welcoming, and precise. Avoid hype or slop. Use clean formatting.

About Vanguard Digital & Tech Hub:
- Location: Penthouse Suite, Vanguard Plaza, Tech District.
- Services Offered:
  1. Corporate Affairs (CAC) Registration: AI-assisted business registration (Sole Proprietorship, LLC, NGO/Association). We run name availability checks, prepare legal templates, and handle expert filings.
  2. Digital Print & Document Hub: High-end printing, high-volume documentation, binding, architectural blueprints, corporate stationery. Clients can upload files to calculate custom quotes.
  3. Tech Academy: Two premium career-accelerator programs:
     - Web Development Mastery (12 weeks, $450): React, Node.js, Express, Tailwind CSS, TypeScript, and modern engineering workflows.
     - Microsoft Office Suite Professional (4 weeks, $150): Complete mastery of Word, advanced Excel modeling, PowerPoint presentation design, and Access databases.

When talking about student portal enrollment, explain that they can register in our 'Tech Academy' section on this website, select their course, calculate the dynamic tuition fees, and instantly get a official printable Admission Letter.
When talking about Print Hub, explain they can drag and drop their PDFs or documents right into our calculator to get an instant quote.

Always answer concisely, maintain high corporate polish, and guide the user to the correct section of our website for interactive features.`,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 2. CAC Business Name AI Check & Classification Assistant
app.post("/api/cac/analyze-name", async (req, res) => {
  try {
    const { businessName, businessType, description } = req.body;
    if (!businessName) {
      return res.status(400).json({ error: "Proposed business name is required." });
    }

    const ai = getAiClient();
    if (!ai) {
      // Mock analysis fallback
      const cleanName = businessName.toUpperCase().trim();
      const status = cleanName.length > 5 ? "Highly Feasible" : "Requires Adjustment";
      const suggestions = [
        `${cleanName} GLOBAL SERVICES`,
        `${cleanName} VENTURES`,
        `THE ${cleanName} COMPANY`,
      ];
      return res.json({
        name: businessName,
        status,
        feasibilityScore: 85,
        analysis: `Vanguard Registry AI analysis is active in sandbox mode. The proposed name '${businessName}' is structurally valid for registration as a ${businessType || "Limited Liability Company"}.`,
        potentialConflicts: ["No direct trademark match found in preliminary scan."],
        suggestions,
      });
    }

    const prompt = `Analyze this proposed business name for CAC (Corporate Affairs Commission) registration in Nigeria or similar corporate registries:
Business Name: "${businessName}"
Entity Type: "${businessType || "Limited Liability Company"}"
Business Description: "${description || "Not specified"}"

Evaluate:
1. Feasibility & availability score (out of 100).
2. Legal compliance (any prohibited words like 'National', 'Federal', 'Chamber of Commerce' without special consent).
3. Potential trademark conflicts or similarity conflicts.
4. Suggestions for better alternatives or additions to improve approval odds.
5. Best industrial categorization (e.g. Technology, Retail, Consulting).

Please return the response as a valid JSON object matching this structure:
{
  "name": "string",
  "status": "Excellent" | "Good" | "Needs Modification" | "Prohibited",
  "feasibilityScore": number,
  "analysis": "A detailed, professional paragraph explaining your evaluation.",
  "potentialConflicts": ["string"],
  "suggestions": ["string"]
}
Only return the JSON code inside standard JSON block or as raw JSON, no surrounding talk.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error in /api/cac/analyze-name:", error);
    res.status(500).json({ error: error.message || "Failed to analyze business name." });
  }
});

// 2.5 CAC Brand Generator (Crazy Idea Branding Kit)
app.post("/api/cac/brand-generator", async (req, res) => {
  try {
    const { businessIdea } = req.body;
    if (!businessIdea) {
      return res.status(400).json({ error: "Business idea is required." });
    }

    const ai = getAiClient();
    if (!ai) {
      // High-quality local fallback suggestions
      const idea = businessIdea.toUpperCase().trim();
      const firstWord = idea.split(" ")[0] || "APEX";
      return res.json({
        idea: businessIdea,
        names: [
          `${firstWord} SHIFT SOLUTIONS`,
          `NEXUS ${firstWord} INDUSTRIES`,
          `THE ${firstWord} LOGIC GROUP`
        ],
        slogan: `Pioneering the Next Horizon of ${businessIdea}.`,
        colors: [
          { hex: "#00E5FF", name: "Neon Cyano", description: "A high-tech electric cyan representing digital innovation." },
          { hex: "#1A237E", name: "Premium Navy", description: "An ultra-deep space blue representing trust and legal excellence." }
        ]
      });
    }

    const prompt = `You are a high-end branding consultant. Provide a professional brand kit for this business idea:
Business Idea: "${businessIdea}"

Please generate:
1. Three distinct, modern, highly professional business name suggestions.
2. One memorable, high-impact corporate slogan.
3. Two premium, high-contrast brand colors (with HEX codes, names, and a short sentence about why they fit the industry mood).

Return the response ONLY as a valid JSON object matching this structure:
{
  "idea": "string",
  "names": ["string", "string", "string"],
  "slogan": "string",
  "colors": [
    { "hex": "string (HEX code e.g. #FF5722)", "name": "string (color name)", "description": "string" },
    { "hex": "string (HEX code)", "name": "string (color name)", "description": "string" }
  ]
}
Only return raw JSON code, do not add surrounding introductory text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error in /api/cac/brand-generator:", error);
    res.status(500).json({ error: error.message || "Failed to generate brand kit." });
  }
});

// 3. Printing Quote Calculator Endpoint
app.post("/api/print/quote", (req, res) => {
  try {
    const { fileName, fileSize, pageCount, isColor, bindingType, quantity } = req.body;

    const basePageCount = parseInt(pageCount) || 1;
    const qty = parseInt(quantity) || 1;
    const costPerPage = isColor ? 0.35 : 0.08; // $0.35 per color page, $0.08 for B&W
    let bindingCost = 0;

    switch (bindingType) {
      case "spiral":
        bindingCost = 3.5;
        break;
      case "hardback":
        bindingCost = 15.0;
        break;
      case "stapled":
        bindingCost = 0.5;
        break;
      default:
        bindingCost = 0;
    }

    const singleUnitCost = basePageCount * costPerPage + bindingCost;
    const subtotal = singleUnitCost * qty;
    
    // Apply volume discount (5% for > 10 units, 10% for > 50 units, 15% for > 100 units)
    let discountRate = 0;
    if (qty >= 100) discountRate = 0.15;
    else if (qty >= 50) discountRate = 0.1;
    else if (qty >= 10) discountRate = 0.05;

    const discountAmount = subtotal * discountRate;
    const totalCost = subtotal - discountAmount;
    const estimatedDays = qty > 500 ? 3 : qty > 100 ? 2 : 1;

    const quote = {
      jobId: `VPG-PRN-${Math.floor(100000 + Math.random() * 900000)}`,
      fileName: fileName || "Digital_Document.pdf",
      fileSizeMb: fileSize ? (fileSize / (1024 * 1024)).toFixed(2) : "0.0",
      pageCount: basePageCount,
      isColor,
      bindingType,
      quantity: qty,
      singleUnitCost: singleUnitCost.toFixed(2),
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      discountPercentage: (discountRate * 100).toFixed(0),
      totalCost: totalCost.toFixed(2),
      estimatedDays,
      createdAt: new Date().toISOString(),
    };

    mockDatabase.printJobs.push(quote);
    res.json(quote);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate print quote." });
  }
});

// ==========================================
// NEW: FILE CONVERSION & DATA ENTRY SUITE APIs
// ==========================================

// A. OCR (Image-to-Text) API utilizing Gemini-3.5-flash
app.post("/api/convert/ocr", async (req, res) => {
  try {
    const { fileBase64, mimeType, fileName } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ error: "File base64 content is required for OCR processing." });
    }

    const ai = getAiClient();
    if (!ai) {
      // Fallback elegant response if API Key is not set yet
      return res.json({
        success: true,
        extractedText: `# Extracted Text from ${fileName || "Document"}\n\nThis is a standard text fallback because the Google Gemini API Key is not configured. Under active production, this leverages Gemini-3.5-flash to run high-precision OCR.\n\n## Mock Content Extracted:\n- **Client Reference**: Bato Sam Digital Hub\n- **Project Scope**: Technology Integration & Printing Spooler\n- **Date**: July 13, 2026\n- **Objective**: Ensure high-fidelity transcription of scanned mobile photos and documents.`,
        confidence: 94,
        wordsCount: 52,
        tablesDetected: 0
      });
    }

    // Pass the base64 media content directly to Gemini along with a precise prompt
    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: fileBase64
      }
    };

    const textPart = {
      text: "Perform optical character recognition (OCR) on this document. Transcribe all text, numbers, formulas, and structural layouts. If you detect any table structures, format them cleanly using markdown tables. Maintain absolute precision and semantic clarity. Return your entire transcription as clean, well-formatted markdown."
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] }
    });

    const text = response.text || "No legible text could be extracted from this asset.";
    const wordsCount = text.split(/\s+/).length;

    res.json({
      success: true,
      extractedText: text,
      confidence: 99,
      wordsCount,
      tablesDetected: text.includes("|") ? 1 : 0
    });
  } catch (error: any) {
    console.error("OCR Endpoint Error:", error);
    res.status(500).json({ error: error.message || "Failed to process image OCR." });
  }
});

// B. PDF to Word (DOCX style) Structural Extraction API
app.post("/api/convert/pdf-to-word", async (req, res) => {
  try {
    const { fileTextContent, fileName } = req.body;
    const contentToAnalyze = fileTextContent || "Vanguard Printing Hub document. Client: Samuel Chinedu. Requested 120 copies spiral-bound A4.";

    const ai = getAiClient();
    if (!ai) {
      return res.json({
        success: true,
        docxMarkdown: `# DOCUMENT STRUCTURE ANALYSIS: ${fileName || "Project_Export"}\n\nThis is a simulated DOCX-structured text conversion because the Google Gemini API Key is not configured. In a live environment, this processes documents using deep-learning models.\n\n---\n## Header Info\n**Title**: Bato Sam Corporate Portfolio\n**Status**: Print-Ready\n\n## Section 1: Introduction\nThis document describes the career accelerators and digital publishing services of Bato Sam Digital Hub. All materials are spooled with premium resolution.`,
        paragraphsCount: 3,
        headings: ["Header Info", "Section 1: Introduction"],
        estimatedPages: 1
      });
    }

    const prompt = `Convert this raw text or document data into a beautifully structured, highly readable Microsoft Word (DOCX compatible) format block.
Format and add missing professional headers, clean paragraphs, and clean alignments. Reconstruct it so that it is polished enough to be copied straight into Word:

Document Name: "${fileName || "Unlabeled_Doc"}"
Source Content:
"""
${contentToAnalyze}
"""

Please return the output as a valid JSON object matching this structure:
{
  "success": true,
  "docxMarkdown": "string (The complete beautifully-formatted, structured document in Markdown, including clear title, headers, bold terms, aligned paragraphs, and lists)",
  "paragraphsCount": number,
  "headings": ["string"],
  "estimatedPages": number
}
Return only raw JSON. No markdown backticks or extra text outside the JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("PDF-to-Word Error:", error);
    res.status(500).json({ error: error.message || "Failed to convert PDF structure to Word." });
  }
});

// C. Intelligent Data Entry Proofreader Layer
app.post("/api/data-entry/proofread", async (req, res) => {
  try {
    const { text, templateType } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "No text provided for proofreading." });
    }

    const ai = getAiClient();
    if (!ai) {
      // Fallback simulated proofreading result
      return res.json({
        success: true,
        originalText: text,
        polishedText: text.replace(/\bda\b/gi, "the").replace(/\brecieve\b/gi, "receive") + "\n\n[Polished with Vanguard Proofread Layer]",
        corrections: [
          {
            type: "spelling",
            original: "recieve",
            replacement: "receive",
            reason: "Standard English dictionary spelling correction."
          }
        ],
        score: 95,
        readability: "Excellent"
      });
    }

    const prompt = `You are a professional editorial editor and proofreader. Please review the following text for a "${templateType || "Standard Document"}" template.
Find spelling mistakes, grammar errors, punctuation slips, and improve overall flow, clarity, and precision. Provide a helpful editorial evaluation.

Source Text:
"""
${text}
"""

You MUST return your analysis as a valid JSON object matching this exact TypeScript interface:
interface ProofreadResult {
  success: boolean;
  originalText: string;
  polishedText: string; // The complete, fully rewritten, corrected, and pristine text
  corrections: Array<{
    type: "spelling" | "grammar" | "punctuation" | "style";
    original: string; // The error segment
    replacement: string; // The corrected segment
    reason: string; // Detailed reason for this change
  }>;
  score: number; // General quality score (out of 100) of the original text
  readability: "Easy" | "Moderate" | "Difficult" | "Excellent";
}

Return ONLY raw JSON inside your response, with no surrounding introductory text or explanation.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Proofreader Endpoint Error:", error);
    res.status(500).json({ error: error.message || "Failed to complete document proofreading." });
  }
});

// 4. Tech Academy Student Enrollment API
app.post("/api/academy/enroll", (req, res) => {
  try {
    const { fullName, email, phone, courseId, cohort, paymentOption } = req.body;
    
    if (!fullName || !email || !courseId) {
      return res.status(400).json({ error: "Full name, email, and course selection are required." });
    }

    let courseName = "";
    let basePrice = 0;
    let duration = "";

    if (courseId === "webdev") {
      courseName = "Web Development Career Masterclass";
      basePrice = 450;
      duration = "12 Weeks (Saturdays & Weekdays)";
    } else if (courseId === "msoffice") {
      courseName = "Microsoft Office Suite Professional Mastery";
      basePrice = 150;
      duration = "4 Weeks (Accelerated)";
    } else {
      return res.status(400).json({ error: "Invalid course ID selected." });
    }

    const studentId = `VTA-${new Date().getFullYear() % 100}-${Math.floor(1000 + Math.random() * 9000)}`;
    const admissionCode = `ADM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const enrollment = {
      studentId,
      admissionCode,
      fullName,
      email,
      phone: phone || "Not Provided",
      courseId,
      courseName,
      cohort: cohort || "Next Available Cohort",
      duration,
      tuitionFee: basePrice,
      paymentOption: paymentOption || "full",
      status: "Admitted & Pending Verification",
      enrolledAt: new Date().toISOString(),
    };

    mockDatabase.enrollments.push(enrollment);

    // Return the generated admission letter details
    res.json({
      success: true,
      message: "Enrollment submitted successfully. Your Admission Letter is ready.",
      enrollment,
      admissionLetter: {
        title: "OFFICIAL LETTER OF PROVISIONAL ADMISSION",
        reference: `VGA/ACA/${new Date().getFullYear()}/${studentId}`,
        salutation: `Dear ${fullName},`,
        paragraph1: `We are pleased to inform you that your application for admission into the Vanguard Tech Academy has been reviewed and approved. You have been granted provisional admission to undertake the ${courseName} starting with the ${cohort || "upcoming"} cohort.`,
        paragraph2: `The Vanguard Tech Academy is committed to delivering state-of-the-art educational standards, equipping you with essential industry-relevant skills. Your program is structured to span ${duration}, with a total tuition fee of $${basePrice}.00 USD. Your enrollment status will be finalized upon the verification of your initial tuition installment.`,
        closing: "Yours faithfully,",
        signatureName: "Dr. Evelyn Vance",
        signatureRole: "Director of Admissions, Vanguard Tech Academy",
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: "Enrollment failed." });
  }
});

// 5. Dynamic Academic Admission Letter HTML Generator Route
app.get("/api/academy/admission-letter", (req, res) => {
  const name = (req.query.name as string) || "Candidate Name";
  const course = (req.query.course as string) || "Technology Program";
  const studentId = `VTA-26-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const letterHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admission Letter - ${name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
      body {
        font-family: 'Inter', sans-serif;
      }
      .serif-heading {
        font-family: 'Playfair Display', serif;
      }
      @media print {
        .no-print {
          display: none;
        }
        body {
          background-color: #ffffff;
        }
      }
    </style>
  </head>
  <body class="bg-slate-100 py-12 px-4 print:py-0 print:px-0">
    <div class="max-w-2xl mx-auto bg-white border border-slate-200 shadow-xl rounded-2xl p-8 sm:p-12 relative overflow-hidden print:shadow-none print:border-none print:rounded-none">
      
      {/* Decorative seal watermark backdrop */}
      <div class="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
        <svg class="w-[500px] h-[500px]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
        </svg>
      </div>

      {/* Button to print */}
      <div class="no-print mb-8 flex justify-between items-center bg-slate-900 text-white rounded-xl p-4">
        <div>
          <h1 class="text-xs font-bold uppercase tracking-wider">Admission Letter PDF sandbox</h1>
          <p class="text-[10px] text-slate-400 mt-0.5">Please press Print below to convert this file into a local PDF.</p>
        </div>
        <button onclick="window.print()" class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
          Print Admission Letter
        </button>
      </div>

      {/* Corporate Letterhead Header */}
      <div class="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
        <div>
          <h2 class="text-xl font-extrabold tracking-tight text-slate-950">VANGUARD DIGITAL HUB</h2>
          <p class="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mt-0.5">Vanguard Tech Academy & CAC Registrar Network</p>
          <p class="text-[10px] text-slate-400 mt-2">Plaza Suite 402, Tech District, Lagos • www.vanguardtech.hub</p>
        </div>
        <div class="border-2 border-slate-950 rounded p-2 text-center shrink-0 min-w-[120px]">
          <p class="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">STUDENT REGISTRY ID</p>
          <p class="text-xs font-black font-mono text-slate-950 mt-0.5">${studentId}</p>
        </div>
      </div>

      {/* Reference Meta Info */}
      <div class="flex justify-between text-[11px] text-slate-500 font-semibold mb-8">
        <div>
          <p>Reference: <strong class="text-slate-900">VGA/ACA/26/${studentId.substring(4)}</strong></p>
          <p className="mt-1">Status: <strong class="text-emerald-600 uppercase">Admitted & Active</strong></p>
        </div>
        <div class="text-right">
          <p>Date: <strong class="text-slate-900">${dateStr}</strong></p>
        </div>
      </div>

      {/* Salutation */}
      <div class="space-y-6 text-sm text-slate-800 leading-relaxed font-medium">
        <p class="serif-heading text-lg font-bold text-slate-950">OFFICIAL LETTER OF PROVISIONAL ADMISSION</p>

        <p>Dear <strong class="text-slate-950">${name.toUpperCase()}</strong>,</p>

        <p>
          We are pleased to inform you that your registration at the <strong>Vanguard Tech Academy</strong> platform has been validated. You are hereby offered provisional admission to participate in our flagship professional accelerator program:
        </p>

        <div class="bg-slate-50 border border-slate-200/60 rounded-xl p-5 space-y-2 text-xs font-semibold text-slate-700">
          <div class="flex justify-between">
            <span>Career Path Course:</span>
            <strong class="text-slate-950">${course}</strong>
          </div>
          <div class="flex justify-between">
            <span>Fulfillment Category:</span>
            <strong class="text-slate-950">Intensive Practical Cohort</strong>
          </div>
          <div class="flex justify-between">
            <span>Accredited Academy Level:</span>
            <strong class="text-blue-600 uppercase font-bold">Level 1 - Executive Career Track</strong>
          </div>
        </div>

        <p>
          Vanguard Tech Academy is committed to delivering state-of-the-art educational standards, equipping you with essential industry-relevant coding and corporate management skills. You will receive certified assignments, live case-study portfolios, and dedicated corporate mentorship opportunities designed to elevate your marketplace readiness.
        </p>

        <p>
          Please make sure to present this letter alongside your primary identification documents to the operations coordinator within fourteen (14) business days of this notification to complete your physical enrollment badge and settle the initial tuition installment.
        </p>

        <p>
          We look forward to guiding you on this transformative career acceleration voyage. Congratulations!
        </p>

        <p>Yours faithfully,</p>
      </div>

      {/* Signature blocks */}
      <div class="mt-12 pt-8 border-t border-slate-100 flex justify-between items-end">
        <div>
          {/* Simulated Signature Line */}
          <div class="serif-heading italic text-lg text-blue-700 font-bold mb-1">Evelyn Vance</div>
          <p class="text-xs font-bold text-slate-950">Dr. Evelyn Vance</p>
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Director of Admissions, Vanguard Academy</p>
        </div>
        <div class="text-center no-print border border-dashed border-slate-200 rounded-lg p-3 max-w-[150px]">
          <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-normal">Corporate Seal Verified</p>
          <div class="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mt-2 border border-emerald-100">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

    </div>
  </body>
  </html>
  `;

  res.send(letterHtml);
});

// ==========================================
// STATIC FILES & VITE MIDDLEWARE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Vanguard Server] Running at http://localhost:${PORT}`);
  });
}

startServer();
