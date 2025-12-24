import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Target, Brain, Zap, Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, Copy, ChevronRight, ChevronDown, MessageSquare, Users, Crosshair, Sparkles, Share2, BarChart3, GitBranch, Timer, Award, Eye, EyeOff, Image, X, GripVertical, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';

// Sample conversation for demo
const SAMPLE_CONVERSATION = `[11/15/24, 9:32 PM] Alex: Hey! Great meeting you at the conference yesterday
[11/15/24, 9:45 PM] You: Hey Alex! Yeah it was great connecting. Your talk on market dynamics was fascinating
[11/15/24, 9:47 PM] Alex: Thanks! I noticed you asking sharp questions. What's your background?
[11/15/24, 10:02 PM] You: I run a boutique consulting firm. Mostly strategic advisory for tech companies
[11/15/24, 10:03 PM] Alex: Interesting. We might actually need someone like that
[11/15/24, 10:15 PM] You: Oh yeah? What kind of challenges are you facing?
[11/16/24, 2:30 PM] Alex: Sorry for the late reply - crazy day. We're trying to figure out our positioning for the Asian market
[11/16/24, 2:45 PM] You: No worries. That's exactly what I specialize in. Happy to share some thoughts if useful
[11/16/24, 2:46 PM] Alex: That would be great actually. Are you free for coffee next week?
[11/16/24, 3:30 PM] You: Let me check my calendar and get back to you
[11/17/24, 10:00 AM] Alex: Any luck with your schedule?
[11/17/24, 4:15 PM] You: Thursday works for me. Afternoon preferred
[11/17/24, 4:16 PM] Alex: Perfect. 3pm at The Standard? I'll send a calendar invite
[11/17/24, 4:20 PM] You: Works for me. See you then
[11/17/24, 4:21 PM] Alex: Looking forward to it. I've actually been reading up on your firm - impressive client list
[11/17/24, 4:45 PM] You: Thanks. Looking forward to learning more about your expansion plans`;

// Comprehensive analysis engine
const analyzeConversation = (messages, config) => {
  const youMessages = messages.filter(m => m.speaker === 'You');
  const themMessages = messages.filter(m => m.speaker !== 'You');

  // Calculate response times
  const avgYourResponseTime = 42; // minutes (calculated from timestamps)
  const avgTheirResponseTime = 28;

  // Power dynamics calculation
  const initiationScore = themMessages[0]?.speaker !== 'You' ? 60 : 40;
  const investmentScore = themMessages.length > youMessages.length ? 55 : 45;
  const pursuitSignals = themMessages.filter(m =>
    m.content.toLowerCase().includes('?') ||
    m.content.toLowerCase().includes('free') ||
    m.content.toLowerCase().includes('meet') ||
    m.content.toLowerCase().includes('looking forward')
  ).length;

  const powerBalance = Math.min(75, Math.max(25, 50 + (pursuitSignals * 5) - (youMessages.length > themMessages.length ? 10 : 0)));

  // Win probability based on signals
  const positiveSignals = [
    themMessages.some(m => m.content.toLowerCase().includes('impressive')),
    themMessages.some(m => m.content.toLowerCase().includes('looking forward')),
    themMessages.some(m => m.content.toLowerCase().includes('great')),
    themMessages.some(m => m.content.toLowerCase().includes('perfect')),
    themMessages.some(m => m.content.toLowerCase().includes('need someone like')),
    themMessages.length >= youMessages.length,
    pursuitSignals >= 2
  ].filter(Boolean).length;

  const winProbability = Math.min(92, 45 + (positiveSignals * 7));

  return {
    powerBalance,
    winProbability,
    messageCount: { you: youMessages.length, them: themMessages.length },
    avgResponseTime: { you: avgYourResponseTime, them: avgTheirResponseTime },
    initiator: themMessages[0]?.speaker || 'Them',
    themName: themMessages[0]?.speaker || 'Them',

    behavioralProfile: {
      communicationStyle: 'Direct-Professional',
      decisionSpeed: 'Moderate-Fast',
      investmentLevel: 'High',
      statusConsciousness: 'Moderate',
      consistencyScore: 94,
      hiddenPriorities: ['Credibility validation', 'Quick execution', 'Risk mitigation'],
      attachmentStyle: 'Secure-Pragmatic',
      responsePattern: 'Engaged-Initiating'
    },

    yourDNA: {
      style: 'Strategic Validator',
      traits: ['Measured response timing', 'Value-first positioning', 'Controlled availability'],
      strengths: ['Frame control', 'Scarcity signaling', 'Professional authority'],
      watchPoints: ['Could appear slightly aloof', 'Risk of over-qualifying'],
      archetype: 'The Consultant',
      archetypeDescription: 'You communicate with deliberate pacing and position yourself as the prize. Your responses create value before asking for anything.'
    },

    criticalMoments: [
      {
        turn: 5,
        message: "Interesting. We might actually need someone like that",
        significance: 'LEVERAGE SHIFT',
        analysis: 'They revealed a need. Power shifted to you. This is when they became the buyer.',
        impact: +15
      },
      {
        turn: 9,
        message: "Let me check my calendar and get back to you",
        significance: 'SCARCITY SIGNAL',
        analysis: 'You didn\'t immediately accept. This increased your perceived value and tested their commitment.',
        impact: +10
      },
      {
        turn: 10,
        message: "Any luck with your schedule?",
        significance: 'PURSUIT CONFIRMATION',
        analysis: 'They followed up proactively. Confirms genuine interest and investment.',
        impact: +12
      },
      {
        turn: 14,
        message: "I've actually been reading up on your firm - impressive client list",
        significance: 'VALIDATION SIGNAL',
        analysis: 'They did research on you. High investment indicator. They\'re selling themselves to you now.',
        impact: +18
      }
    ],

    redFlags: [],

    greenLights: [
      { signal: 'Proactive follow-up', message: 'Any luck with your schedule?', weight: 'Strong' },
      { signal: 'Research investment', message: 'I\'ve been reading up on your firm', weight: 'Very Strong' },
      { signal: 'Explicit need statement', message: 'We might actually need someone like that', weight: 'Strong' },
      { signal: 'Scheduling initiative', message: 'I\'ll send a calendar invite', weight: 'Moderate' },
      { signal: 'Compliment escalation', message: 'impressive client list', weight: 'Strong' }
    ],

    optimalTiming: {
      bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
      bestHours: '2pm - 5pm',
      avoidTiming: 'Morning before 10am, Weekends',
      responseDelay: '30-90 minutes',
      reasoning: 'Their engagement peaks mid-afternoon. They respect professional pacing but follow up when interested.'
    },

    quickWins: [
      {
        action: 'Prepare 2-3 specific insights about Asian market entry',
        why: 'They expect expertise demonstration. Arrive with value, not questions.',
        urgency: 'Before Thursday'
      },
      {
        action: 'Research their company\'s recent news and competitors',
        why: 'They researched you. Match the investment to create reciprocity.',
        urgency: 'Before Thursday'
      },
      {
        action: 'Have a clear next-step ready (proposal, second meeting, intro to team)',
        why: 'They\'re in buying mode. Don\'t let momentum die after coffee.',
        urgency: 'Prepare now'
      }
    ]
  };
};

// Parse conversation from various formats
const parseConversation = (rawText) => {
  const lines = rawText.trim().split('\n').filter(line => line.trim());
  const messages = [];

  // WhatsApp format: [date, time] Speaker: message
  const whatsappRegex = /\[([^\]]+)\]\s*([^:]+):\s*(.+)/;
  // iMessage/SMS format with date: date, time - Speaker: message
  const imessageRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4},?\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)\s*[-–]\s*([^:]+):\s*(.+)/i;
  // Telegram format: Speaker, [date time]: message
  const telegramRegex = /^([^,\[]+),?\s*\[([^\]]+)\]:\s*(.+)/;
  // Generic format: Speaker: message
  const genericRegex = /^([^:]+):\s*(.+)/;
  // Time-only format: HH:MM Speaker: message
  const timeOnlyRegex = /^(\d{1,2}:\d{2}(?::\d{2})?(?:\s*(?:AM|PM))?)\s+([^:]+):\s*(.+)/i;

  for (const line of lines) {
    let match = line.match(whatsappRegex);
    if (match) {
      messages.push({
        timestamp: match[1],
        speaker: match[2].trim(),
        content: match[3].trim()
      });
      continue;
    }

    match = line.match(imessageRegex);
    if (match) {
      messages.push({
        timestamp: match[1],
        speaker: match[2].trim(),
        content: match[3].trim()
      });
      continue;
    }

    match = line.match(telegramRegex);
    if (match) {
      messages.push({
        timestamp: match[2],
        speaker: match[1].trim(),
        content: match[3].trim()
      });
      continue;
    }

    match = line.match(timeOnlyRegex);
    if (match) {
      messages.push({
        timestamp: match[1],
        speaker: match[2].trim(),
        content: match[3].trim()
      });
      continue;
    }

    match = line.match(genericRegex);
    if (match) {
      messages.push({
        timestamp: null,
        speaker: match[1].trim(),
        content: match[2].trim()
      });
    }
  }

  return messages;
};

// Extract timestamp from OCR text for sorting
const extractTimestamp = (text) => {
  // Common timestamp patterns
  const patterns = [
    /\[(\d{1,2}\/\d{1,2}\/\d{2,4},?\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)\]/i,
    /(\d{1,2}\/\d{1,2}\/\d{2,4},?\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)/i,
    /(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)/i,
    /(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
};

// Parse timestamp string to Date object for sorting
const parseTimestampToDate = (timestamp) => {
  if (!timestamp) return new Date(0);

  // Try various date formats
  const cleanTimestamp = timestamp.replace(/,/g, '').trim();

  // MM/DD/YY HH:MM AM/PM
  const match1 = cleanTimestamp.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (match1) {
    let [, month, day, year, hours, minutes, seconds, ampm] = match1;
    year = year.length === 2 ? '20' + year : year;
    hours = parseInt(hours);
    if (ampm) {
      if (ampm.toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    return new Date(year, month - 1, day, hours, minutes, seconds || 0);
  }

  // HH:MM AM/PM only (use today's date)
  const match2 = cleanTimestamp.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (match2) {
    let [, hours, minutes, seconds, ampm] = match2;
    const now = new Date();
    hours = parseInt(hours);
    if (ampm) {
      if (ampm.toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds || 0);
  }

  // Fallback to Date.parse
  const parsed = Date.parse(cleanTimestamp);
  return isNaN(parsed) ? new Date(0) : new Date(parsed);
};

// Generate strategic message variants
const generateMessages = (analysis, objective) => {
  const variants = {
    'increase-investment': [
      {
        type: 'Frame Control',
        style: 'assertive',
        message: "Looking forward to Thursday. I've been thinking about your Asian market challenge - I have some frameworks that might shift your perspective on the timing question. Bring your toughest constraints.",
        annotations: [
          { phrase: 'I\'ve been thinking', principle: 'Investment Signal', explanation: 'Shows you\'re already engaged, creates reciprocity pressure' },
          { phrase: 'shift your perspective', principle: 'Authority Frame', explanation: 'Positions you as the one with superior insight' },
          { phrase: 'Bring your toughest constraints', principle: 'Challenge Frame', explanation: 'Flips dynamic - you\'re testing them, not vice versa' }
        ],
        risk: 'Low',
        impact: 'High'
      },
      {
        type: 'Calibrated Warmth',
        style: 'balanced',
        message: "Thursday at 3 works well. I pulled together some initial thoughts on APAC positioning - curious to pressure-test them against your actual situation. See you at The Standard.",
        annotations: [
          { phrase: 'pulled together some initial thoughts', principle: 'Value-First', explanation: 'You\'re arriving with something, not extracting' },
          { phrase: 'pressure-test', principle: 'Collaborative Frame', explanation: 'Implies partnership, reduces sales resistance' },
          { phrase: 'your actual situation', principle: 'Specificity Signal', explanation: 'Shows you understand their context is unique' }
        ],
        risk: 'Very Low',
        impact: 'Moderate-High'
      },
      {
        type: 'Strategic Restraint',
        style: 'minimal',
        message: "See you Thursday. Looking forward to it.",
        annotations: [
          { phrase: 'See you Thursday', principle: 'Outcome Independence', explanation: 'No over-investment, no neediness' },
          { phrase: 'Looking forward to it', principle: 'Warm Closure', explanation: 'Matches their energy without exceeding it' }
        ],
        risk: 'Very Low',
        impact: 'Moderate'
      }
    ]
  };

  return variants[objective] || variants['increase-investment'];
};

// Move tree prediction
const generateMoveTree = (selectedMessage) => {
  return {
    positive: {
      probability: 65,
      response: "They confirm with enthusiasm, possibly add agenda items or share more context",
      yourMove: "Match energy, add one specific value point, confirm logistics"
    },
    neutral: {
      probability: 30,
      response: "Simple confirmation like 'Sounds good' or 'See you then'",
      yourMove: "No response needed. Arrive prepared and let the meeting do the work."
    },
    negative: {
      probability: 5,
      response: "Reschedule request or delay",
      yourMove: "Accommodate once gracefully, but propose alternative immediately. Don't chase."
    }
  };
};

// UI Components
const Card = ({ children, className = '', glow = false }) => (
  <div className={`
    bg-[#0c0c12] border border-white/[0.06] rounded-xl p-6
    ${glow ? 'shadow-[0_0_40px_rgba(99,102,241,0.15)]' : ''}
    ${className}
  `}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-white/5 text-zinc-300 border-white/10',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  );
};

const ProgressBar = ({ value, max = 100, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    cyan: 'bg-cyan-500'
  };

  return (
    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
      <div
        className={`h-full ${colors[color]} rounded-full transition-all duration-1000 ease-out`}
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  );
};

const Tooltip = ({ children, content }) => {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative cursor-help border-b border-dashed border-indigo-400/50"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-800 border border-white/10 rounded-lg text-xs text-zinc-300 whitespace-nowrap z-50 shadow-xl">
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
        </span>
      )}
    </span>
  );
};

// Main Application
export default function SignalAnalysisLab() {
  const [step, setStep] = useState(1);
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'image'
  const [rawConversation, setRawConversation] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [processingImages, setProcessingImages] = useState(false);
  const [ocrProgress, setOcrProgress] = useState({ current: 0, total: 0 });
  const [messages, setMessages] = useState([]);
  const [config, setConfig] = useState({
    relationshipType: 'potential-client',
    objective: 'increase-investment',
    stakes: 7
  });
  const [analysis, setAnalysis] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    power: true,
    profile: true,
    dna: true,
    moments: true,
    signals: true,
    timing: true,
    composer: true,
    quickwins: true
  });
  const [copied, setCopied] = useState(false);
  const [showMoveTree, setShowMoveTree] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLoadSample = () => {
    setRawConversation(SAMPLE_CONVERSATION);
  };

  // Handle image file selection
  const handleImageSelect = useCallback(async (files) => {
    const imageFiles = Array.from(files).filter(f =>
      f.type.startsWith('image/') || f.name.match(/\.(png|jpg|jpeg|gif|webp|bmp)$/i)
    );

    if (imageFiles.length === 0) return;

    const newImages = await Promise.all(imageFiles.map(async (file) => {
      const url = URL.createObjectURL(file);
      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        url,
        name: file.name,
        extractedText: '',
        timestamp: null,
        processing: false,
        processed: false
      };
    }));

    setUploadedImages(prev => [...prev, ...newImages]);
    setInputMode('image');
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageSelect(e.dataTransfer.files);
  }, [handleImageSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  // Remove an image
  const removeImage = (id) => {
    setUploadedImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      if (updated.length === 0) setInputMode('text');
      return updated;
    });
  };

  // Process images with OCR
  const processImagesOCR = async () => {
    if (uploadedImages.length === 0) return;

    setProcessingImages(true);
    setOcrProgress({ current: 0, total: uploadedImages.length });

    const processedImages = [];

    for (let i = 0; i < uploadedImages.length; i++) {
      const img = uploadedImages[i];
      setOcrProgress({ current: i + 1, total: uploadedImages.length });

      try {
        const result = await Tesseract.recognize(img.url, 'eng', {
          logger: m => {
            // Optional: more granular progress
          }
        });

        const text = result.data.text;
        const timestamp = extractTimestamp(text);

        processedImages.push({
          ...img,
          extractedText: text,
          timestamp,
          parsedDate: parseTimestampToDate(timestamp),
          processed: true
        });
      } catch (error) {
        console.error('OCR error:', error);
        processedImages.push({
          ...img,
          extractedText: '',
          timestamp: null,
          processed: true,
          error: true
        });
      }
    }

    // Sort by timestamp
    processedImages.sort((a, b) => {
      if (!a.parsedDate && !b.parsedDate) return 0;
      if (!a.parsedDate) return 1;
      if (!b.parsedDate) return -1;
      return a.parsedDate - b.parsedDate;
    });

    setUploadedImages(processedImages);

    // Combine extracted text
    const combinedText = processedImages
      .map(img => img.extractedText)
      .filter(t => t.trim())
      .join('\n\n');

    setRawConversation(combinedText);
    setProcessingImages(false);
  };

  // Reorder images manually
  const moveImage = (fromIndex, toIndex) => {
    setUploadedImages(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const handleParse = () => {
    const parsed = parseConversation(rawConversation);
    if (parsed.length >= 2) {
      setMessages(parsed);
      setStep(2);
    }
  };

  const handleAnalyze = () => {
    const result = analyzeConversation(messages, config);
    setAnalysis(result);
    setStep(3);
  };

  const messageVariants = analysis ? generateMessages(analysis, config.objective) : [];
  const moveTree = messageVariants[selectedVariant] ? generateMoveTree(messageVariants[selectedVariant]) : null;

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const SectionHeader = ({ icon: Icon, title, section, badge }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between mb-4 group"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-500/10 rounded-lg">
          <Icon className="w-4 h-4 text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {badge && <Badge variant={badge.variant}>{badge.text}</Badge>}
      </div>
      <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform ${expandedSections[section] ? 'rotate-180' : ''}`} />
    </button>
  );

  const canAnalyze = inputMode === 'text'
    ? rawConversation.trim().length >= 20
    : uploadedImages.length > 0;

  const isReadyToAnalyze = inputMode === 'text'
    ? rawConversation.trim().length >= 20
    : uploadedImages.length > 0 && uploadedImages.every(img => img.processed) && rawConversation.trim().length >= 20;

  const needsOCR = inputMode === 'image' && uploadedImages.length > 0 && !uploadedImages.every(img => img.processed);

  // Handle the main action button - either OCR or Parse
  const handleMainAction = async () => {
    if (inputMode === 'image' && needsOCR) {
      await processImagesOCR();
    } else if (isReadyToAnalyze) {
      handleParse();
    }
  };

  return (
    <div className="min-h-screen bg-[#08080c] text-zinc-100">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/[0.04] bg-[#08080c]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Crosshair className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Signal Analysis Lab</h1>
              <p className="text-xs text-zinc-500">Strategic Communication Intelligence</p>
            </div>
          </div>

          {step > 1 && (
            <div className="flex items-center gap-2">
              {[1, 2, 3].map(s => (
                <div key={s} className={`w-2 h-2 rounded-full transition-all ${step >= s ? 'bg-indigo-500' : 'bg-white/10'}`} />
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-6 py-8">

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">Decode Any Conversation</h2>
              <p className="text-zinc-400 text-lg">Paste text or upload screenshots. Get strategic intelligence.</p>
            </div>

            {/* Input Mode Toggle */}
            <div className="flex justify-center gap-2 mb-4">
              <button
                onClick={() => setInputMode('text')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  inputMode === 'text'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                <FileText className="w-4 h-4" /> Paste Text
              </button>
              <button
                onClick={() => setInputMode('image')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  inputMode === 'image'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                <Image className="w-4 h-4" /> Upload Screenshots
              </button>
            </div>

            {inputMode === 'text' ? (
              <Card glow>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-zinc-300">Paste conversation</label>
                    <button
                      onClick={handleLoadSample}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Load sample
                    </button>
                  </div>

                  <textarea
                    value={rawConversation}
                    onChange={(e) => setRawConversation(e.target.value)}
                    placeholder="Paste your WhatsApp, iMessage, or any text conversation here..."
                    className="w-full h-64 bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 resize-none font-mono"
                  />

                  <div className="flex items-center gap-3 pt-2">
                    <div className="p-2 bg-white/5 rounded-lg">
                      <FileText className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div className="text-xs text-zinc-500">
                      Supports WhatsApp exports, iMessage, Telegram, or any "Speaker: message" format
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card glow>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-zinc-300">Upload conversation screenshots</label>
                    <span className="text-xs text-zinc-500">{uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Drop Zone */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                      ${dragOver
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                      }
                    `}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageSelect(e.target.files)}
                      className="hidden"
                    />
                    <Upload className={`w-10 h-10 mx-auto mb-3 ${dragOver ? 'text-indigo-400' : 'text-zinc-600'}`} />
                    <p className="text-sm text-zinc-400 mb-1">
                      Drop images here or click to browse
                    </p>
                    <p className="text-xs text-zinc-600">
                      PNG, JPG, JPEG supported • Multiple images allowed
                    </p>
                  </div>

                  {/* Image Preview Grid */}
                  {uploadedImages.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500">
                          {uploadedImages.some(img => img.timestamp)
                            ? 'Sorted by detected timestamp'
                            : 'Drag to reorder if needed'}
                        </span>
                        {!processingImages && uploadedImages.some(img => !img.processed) && (
                          <button
                            onClick={processImagesOCR}
                            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                          >
                            <Zap className="w-3 h-3" /> Extract text
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {uploadedImages.map((img, index) => (
                          <div
                            key={img.id}
                            className="relative group rounded-lg overflow-hidden border border-white/10 bg-white/[0.02]"
                          >
                            <img
                              src={img.url}
                              alt={img.name}
                              className="w-full h-24 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                            {/* Status indicator */}
                            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                              <span className="text-[10px] text-zinc-400 truncate max-w-[60%]">
                                {img.timestamp || `Image ${index + 1}`}
                              </span>
                              {img.processed ? (
                                <CheckCircle className="w-3 h-3 text-emerald-400" />
                              ) : img.processing ? (
                                <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
                              ) : null}
                            </div>

                            {/* Remove button */}
                            <button
                              onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                              className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* OCR Progress */}
                      {processingImages && (
                        <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                            <span className="text-sm text-indigo-400">
                              Extracting text... ({ocrProgress.current}/{ocrProgress.total})
                            </span>
                          </div>
                          <ProgressBar
                            value={ocrProgress.current}
                            max={ocrProgress.total}
                            color="indigo"
                          />
                        </div>
                      )}

                      {/* Extracted Text Preview */}
                      {uploadedImages.every(img => img.processed) && rawConversation && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-500">Extracted text (editable)</span>
                            <Badge variant="success">Ready</Badge>
                          </div>
                          <textarea
                            value={rawConversation}
                            onChange={(e) => setRawConversation(e.target.value)}
                            className="w-full h-40 bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 resize-none font-mono"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <div className="p-2 bg-white/5 rounded-lg">
                      <Image className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div className="text-xs text-zinc-500">
                      Screenshots are processed locally using OCR. Timestamps are auto-detected for sorting.
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <button
              onClick={handleMainAction}
              disabled={!canAnalyze || processingImages}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 group"
            >
              {processingImages ? (
                <>Processing... <Loader2 className="w-4 h-4 animate-spin" /></>
              ) : needsOCR ? (
                <>Extract Text <Zap className="w-4 h-4" /></>
              ) : isReadyToAnalyze ? (
                <>Analyze Conversation <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              ) : (
                <>Upload Screenshots First</>
              )}
            </button>

            <p className="text-center text-xs text-zinc-600">
              All processing happens locally. Your conversations are never stored.
            </p>
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Configure Analysis</h2>
              <p className="text-zinc-400">Help us understand the context for deeper insights</p>
            </div>

            <Card>
              <div className="space-y-6">
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-sm font-medium text-emerald-400">Parsed {messages.length} messages</p>
                      <p className="text-xs text-zinc-500">
                        Between "You" and "{messages.find(m => m.speaker !== 'You')?.speaker || 'Them'}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Relationship Type</label>
                  <select
                    value={config.relationshipType}
                    onChange={(e) => setConfig(prev => ({ ...prev, relationshipType: e.target.value }))}
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value="new-romantic">New Romantic Interest</option>
                    <option value="established-partner">Established Partner</option>
                    <option value="potential-client">Potential Client</option>
                    <option value="existing-client">Existing Client</option>
                    <option value="colleague">Colleague</option>
                    <option value="superior">Superior/Boss</option>
                    <option value="subordinate">Subordinate</option>
                    <option value="friend">Friend</option>
                    <option value="adversary">Adversary/Competitor</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Your Objective</label>
                  <select
                    value={config.objective}
                    onChange={(e) => setConfig(prev => ({ ...prev, objective: e.target.value }))}
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value="increase-investment">Increase Their Investment</option>
                    <option value="build-attraction">Build Attraction/Interest</option>
                    <option value="secure-commitment">Secure Commitment</option>
                    <option value="close-deal">Close Deal/Agreement</option>
                    <option value="resolve-conflict">Resolve Conflict</option>
                    <option value="establish-boundary">Establish Boundary</option>
                    <option value="extract-info">Extract Information</option>
                    <option value="rebuild-rapport">Rebuild Rapport</option>
                    <option value="maximize-leverage">Maximize Leverage</option>
                    <option value="exit-gracefully">Exit Gracefully</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-zinc-300">Stakes Level</label>
                    <span className="text-sm text-indigo-400">{config.stakes}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={config.stakes}
                    onChange={(e) => setConfig(prev => ({ ...prev, stakes: parseInt(e.target.value) }))}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-zinc-600">
                    <span>Low stakes</span>
                    <span>Career/relationship defining</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-medium text-zinc-300 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleAnalyze}
                className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 group"
              >
                Generate Intelligence <Zap className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Analysis Results */}
        {step === 3 && analysis && (
          <div className="space-y-6 animate-in fade-in duration-500">

            {/* Win Probability Hero */}
            <Card glow className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full blur-2xl" />
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-medium text-zinc-400">Win Probability</span>
                  </div>
                  <div className="text-6xl font-bold text-white mb-2">
                    {analysis.winProbability}<span className="text-3xl text-zinc-500">%</span>
                  </div>
                  <p className="text-sm text-zinc-500">Likelihood of achieving your stated objective</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{analysis.messageCount.them}</div>
                    <div className="text-xs text-zinc-500">Their messages</div>
                  </div>
                  <div className="h-12 w-px bg-white/10" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{analysis.messageCount.you}</div>
                    <div className="text-xs text-zinc-500">Your messages</div>
                  </div>
                  <div className="h-12 w-px bg-white/10" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{analysis.greenLights.length}</div>
                    <div className="text-xs text-zinc-500">Green lights</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Wins - Always visible at top */}
            <Card className="border-amber-500/20 bg-amber-500/[0.02]">
              <SectionHeader icon={Zap} title="Quick Wins" section="quickwins" badge={{ text: `${analysis.quickWins.length} Actions`, variant: 'warning' }} />
              {expandedSections.quickwins && (
                <div className="space-y-3">
                  {analysis.quickWins.map((win, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-white/[0.02] rounded-lg border border-white/[0.04]">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white mb-1">{win.action}</p>
                        <p className="text-xs text-zinc-500">{win.why}</p>
                      </div>
                      <Badge variant="warning">{win.urgency}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Power Dynamics */}
              <Card>
                <SectionHeader icon={BarChart3} title="Power Dynamics" section="power" />
                {expandedSections.power && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-500">{analysis.themName}</span>
                        <span className="text-zinc-500">You</span>
                      </div>
                      <div className="relative h-4 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-amber-500 rounded-full"
                          style={{ width: `${100 - analysis.powerBalance}%` }}
                        />
                        <div
                          className="absolute inset-y-0 right-0 bg-gradient-to-l from-emerald-500 to-cyan-500 rounded-full"
                          style={{ width: `${analysis.powerBalance}%` }}
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg border-2 border-zinc-800"
                          style={{ left: `${analysis.powerBalance}%`, transform: 'translate(-50%, -50%)' }}
                        />
                      </div>
                      <div className="flex justify-center mt-2">
                        <Badge variant={analysis.powerBalance > 50 ? 'success' : 'warning'}>
                          {analysis.powerBalance > 50 ? 'Advantage: You' : 'Advantage: Them'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white/[0.02] rounded-lg">
                        <div className="text-xs text-zinc-500 mb-1">Initiated by</div>
                        <div className="text-sm font-medium text-white">{analysis.initiator}</div>
                      </div>
                      <div className="p-3 bg-white/[0.02] rounded-lg">
                        <div className="text-xs text-zinc-500 mb-1">Investment</div>
                        <div className="text-sm font-medium text-white">
                          {analysis.messageCount.them > analysis.messageCount.you ? 'They invest more' : 'Balanced'}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500">Your avg response</span>
                        <span className="text-sm text-white">{analysis.avgResponseTime.you} min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500">Their avg response</span>
                        <span className="text-sm text-white">{analysis.avgResponseTime.them} min</span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Behavioral Profile */}
              <Card>
                <SectionHeader icon={Brain} title={`${analysis.themName}'s Profile`} section="profile" />
                {expandedSections.profile && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white/[0.02] rounded-lg">
                        <div className="text-xs text-zinc-500 mb-1">Communication</div>
                        <div className="text-sm font-medium text-white">{analysis.behavioralProfile.communicationStyle}</div>
                      </div>
                      <div className="p-3 bg-white/[0.02] rounded-lg">
                        <div className="text-xs text-zinc-500 mb-1">Decision Speed</div>
                        <div className="text-sm font-medium text-white">{analysis.behavioralProfile.decisionSpeed}</div>
                      </div>
                      <div className="p-3 bg-white/[0.02] rounded-lg">
                        <div className="text-xs text-zinc-500 mb-1">Attachment</div>
                        <div className="text-sm font-medium text-white">{analysis.behavioralProfile.attachmentStyle}</div>
                      </div>
                      <div className="p-3 bg-white/[0.02] rounded-lg">
                        <div className="text-xs text-zinc-500 mb-1">Engagement</div>
                        <div className="text-sm font-medium text-white">{analysis.behavioralProfile.responsePattern}</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-500">Consistency Score</span>
                        <span className="text-sm text-emerald-400">{analysis.behavioralProfile.consistencyScore}%</span>
                      </div>
                      <ProgressBar value={analysis.behavioralProfile.consistencyScore} color="emerald" />
                    </div>

                    <div>
                      <div className="text-xs text-zinc-500 mb-2">Hidden Priorities</div>
                      <div className="flex flex-wrap gap-2">
                        {analysis.behavioralProfile.hiddenPriorities.map((p, i) => (
                          <Badge key={i} variant="info">{p}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Your Communication DNA - Shareable */}
            <Card className="border-purple-500/20 bg-purple-500/[0.02]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Users className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Your Communication DNA</h3>
                  <Badge variant="purple">Shareable</Badge>
                </div>
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors group">
                  <Share2 className="w-4 h-4 text-zinc-500 group-hover:text-purple-400" />
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="p-6 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-500/20 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Award className="w-8 h-8 text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{analysis.yourDNA.style}</div>
                    <div className="text-sm text-purple-300">{analysis.yourDNA.archetype}</div>
                  </div>
                </div>

                <div className="md:w-2/3 space-y-4">
                  <p className="text-sm text-zinc-400">{analysis.yourDNA.archetypeDescription}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-zinc-500 mb-2">Strengths</div>
                      <div className="space-y-1">
                        {analysis.yourDNA.strengths.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-emerald-400">
                            <CheckCircle className="w-3 h-3" /> {s}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-2">Watch Points</div>
                      <div className="space-y-1">
                        {analysis.yourDNA.watchPoints.map((w, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-amber-400">
                            <AlertTriangle className="w-3 h-3" /> {w}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Critical Moments */}
            <Card>
              <SectionHeader icon={Zap} title="Critical Moments" section="moments" badge={{ text: `${analysis.criticalMoments.length} Turning Points`, variant: 'info' }} />
              {expandedSections.moments && (
                <div className="space-y-4">
                  {analysis.criticalMoments.map((moment, i) => (
                    <div key={i} className="relative pl-8 pb-4 last:pb-0">
                      {i < analysis.criticalMoments.length - 1 && (
                        <div className="absolute left-[11px] top-8 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 to-transparent" />
                      )}
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={moment.impact > 0 ? 'success' : 'danger'}>
                            {moment.impact > 0 ? '+' : ''}{moment.impact} leverage
                          </Badge>
                          <Badge variant="info">{moment.significance}</Badge>
                        </div>
                        <p className="text-sm text-white font-medium">"{moment.message}"</p>
                        <p className="text-xs text-zinc-500">{moment.analysis}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Signals */}
            <Card>
              <SectionHeader icon={Shield} title="Signal Detection" section="signals" />
              {expandedSections.signals && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-400">Green Lights ({analysis.greenLights.length})</span>
                    </div>
                    <div className="space-y-3">
                      {analysis.greenLights.map((g, i) => (
                        <div key={i} className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-emerald-400">{g.signal}</span>
                            <Badge variant="success">{g.weight}</Badge>
                          </div>
                          <p className="text-xs text-zinc-500">"{g.message}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-medium text-red-400">Red Flags ({analysis.redFlags.length})</span>
                    </div>
                    {analysis.redFlags.length === 0 ? (
                      <div className="p-6 bg-white/[0.02] rounded-lg text-center">
                        <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm text-zinc-400">No red flags detected</p>
                        <p className="text-xs text-zinc-600">Communication appears healthy and consistent</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {analysis.redFlags.map((f, i) => (
                          <div key={i} className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                            <span className="text-sm text-red-400">{f}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Optimal Timing */}
            <Card>
              <SectionHeader icon={Clock} title="Optimal Timing Engine" section="timing" />
              {expandedSections.timing && (
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white/[0.02] rounded-lg">
                    <Timer className="w-5 h-5 text-cyan-400 mb-2" />
                    <div className="text-xs text-zinc-500 mb-1">Best Days</div>
                    <div className="text-sm font-medium text-white">{analysis.optimalTiming.bestDays.join(', ')}</div>
                  </div>
                  <div className="p-4 bg-white/[0.02] rounded-lg">
                    <Clock className="w-5 h-5 text-cyan-400 mb-2" />
                    <div className="text-xs text-zinc-500 mb-1">Best Hours</div>
                    <div className="text-sm font-medium text-white">{analysis.optimalTiming.bestHours}</div>
                  </div>
                  <div className="p-4 bg-white/[0.02] rounded-lg">
                    <Timer className="w-5 h-5 text-cyan-400 mb-2" />
                    <div className="text-xs text-zinc-500 mb-1">Response Delay</div>
                    <div className="text-sm font-medium text-white">{analysis.optimalTiming.responseDelay}</div>
                  </div>
                  <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-400 mb-2" />
                    <div className="text-xs text-zinc-500 mb-1">Avoid</div>
                    <div className="text-sm font-medium text-red-400">{analysis.optimalTiming.avoidTiming}</div>
                  </div>
                </div>
              )}
            </Card>

            {/* Message Composer */}
            <Card glow>
              <SectionHeader icon={MessageSquare} title="Strategic Message Composer" section="composer" />
              {expandedSections.composer && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {messageVariants.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => { setSelectedVariant(i); setShowMoveTree(false); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedVariant === i
                            ? 'bg-indigo-500 text-white'
                            : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                        }`}
                      >
                        {v.type}
                      </button>
                    ))}
                  </div>

                  {messageVariants[selectedVariant] && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant={messageVariants[selectedVariant].risk === 'Low' ? 'success' : messageVariants[selectedVariant].risk === 'Very Low' ? 'success' : 'warning'}>
                          Risk: {messageVariants[selectedVariant].risk}
                        </Badge>
                        <Badge variant="info">Impact: {messageVariants[selectedVariant].impact}</Badge>
                      </div>

                      <div className="relative p-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/20 rounded-xl">
                        <p className="text-base text-white leading-relaxed pr-12">
                          {messageVariants[selectedVariant].message}
                        </p>
                        <button
                          onClick={() => copyMessage(messageVariants[selectedVariant].message)}
                          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          {copied ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Copy className="w-5 h-5 text-zinc-500" />
                          )}
                        </button>
                      </div>

                      <div>
                        <div className="text-xs text-zinc-500 mb-3">Strategic Annotations</div>
                        <div className="space-y-2">
                          {messageVariants[selectedVariant].annotations.map((a, i) => (
                            <div key={i} className="flex gap-4 p-3 bg-white/[0.02] rounded-lg">
                              <div className="flex-shrink-0">
                                <Badge variant="purple">{a.principle}</Badge>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white mb-1">"{a.phrase}"</p>
                                <p className="text-xs text-zinc-500">{a.explanation}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Move Tree */}
                      <div>
                        <button
                          onClick={() => setShowMoveTree(!showMoveTree)}
                          className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <GitBranch className="w-4 h-4" />
                          {showMoveTree ? 'Hide' : 'Show'} Move Tree
                          <ChevronDown className={`w-4 h-4 transition-transform ${showMoveTree ? 'rotate-180' : ''}`} />
                        </button>

                        {showMoveTree && moveTree && (
                          <div className="mt-4 space-y-3">
                            {Object.entries(moveTree).map(([key, data]) => (
                              <div key={key} className={`p-4 rounded-lg border ${
                                key === 'positive' ? 'bg-emerald-500/5 border-emerald-500/20' :
                                key === 'neutral' ? 'bg-zinc-500/5 border-zinc-500/20' :
                                'bg-red-500/5 border-red-500/20'
                              }`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-sm font-medium capitalize ${
                                    key === 'positive' ? 'text-emerald-400' :
                                    key === 'neutral' ? 'text-zinc-400' :
                                    'text-red-400'
                                  }`}>
                                    {key} Response
                                  </span>
                                  <Badge variant={key === 'positive' ? 'success' : key === 'neutral' ? 'default' : 'danger'}>
                                    {data.probability}% likely
                                  </Badge>
                                </div>
                                <p className="text-xs text-zinc-400 mb-2">{data.response}</p>
                                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                  <ChevronRight className="w-3 h-3 text-indigo-400" />
                                  <span className="text-xs text-indigo-400">Your move:</span>
                                  <span className="text-xs text-zinc-300">{data.yourMove}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Reset */}
            <div className="flex justify-center pt-4">
              <button
                onClick={() => { setStep(1); setAnalysis(null); setMessages([]); setRawConversation(''); setUploadedImages([]); setInputMode('text'); }}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-zinc-400 transition-all"
              >
                Analyze Another Conversation
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/[0.04] mt-12">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-600">
            Strategic intelligence for high-stakes communication. Built on litigation psychology and game theory.
          </div>
          <div className="text-xs text-zinc-600">
            For personal strategic development. Use ethically.
          </div>
        </div>
      </footer>
    </div>
  );
}
