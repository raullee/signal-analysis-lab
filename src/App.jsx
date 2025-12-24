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

// ============================================================================
// INTELLIGENT CONTEXT DETECTION ENGINE
// ============================================================================

const detectContext = (messages, allText) => {
  const text = allText.toLowerCase();
  const youMessages = messages.filter(m => m.speaker.toLowerCase() === 'you');
  const themMessages = messages.filter(m => m.speaker.toLowerCase() !== 'you');

  // Context detection patterns with weighted scoring
  const contextPatterns = {
    romantic: {
      keywords: ['date', 'dinner', 'drinks', 'cute', 'attractive', 'miss you', 'thinking of you', 'love', 'heart', 'kiss', 'hug', 'baby', 'babe', 'hun', 'sweetheart', 'beautiful', 'handsome', 'tonight', 'weekend plans', 'netflix', 'chill', 'relationship', 'feelings', 'chemistry', 'connection', 'spark', 'vibes', '❤️', '😍', '😘', '💕', 'coffee sometime', 'get to know', 'single'],
      weight: 0
    },
    business: {
      keywords: ['meeting', 'proposal', 'client', 'project', 'deadline', 'budget', 'contract', 'invoice', 'company', 'business', 'professional', 'office', 'work', 'colleague', 'manager', 'ceo', 'startup', 'investment', 'revenue', 'market', 'strategy', 'consulting', 'service', 'product', 'pricing', 'deal', 'partnership', 'collaboration', 'firm', 'enterprise', 'b2b', 'roi', 'kpi'],
      weight: 0
    },
    creative_collab: {
      keywords: ['app', 'feature', 'build', 'code', 'design', 'create', 'make', 'project', 'idea', 'concept', 'prototype', 'feedback', 'iteration', 'version', 'update', 'ship', 'launch', 'product', 'tool', 'platform', 'video', 'content', 'music', 'art', 'creative', 'collab', 'together', 'brainstorm', 'sora', 'ai', 'meditation', 'youtube', 'views', 'income'],
      weight: 0
    },
    friendship: {
      keywords: ['hang out', 'chill', 'bro', 'dude', 'man', 'lol', 'haha', 'funny', 'game', 'party', 'weekend', 'beer', 'food', 'movie', 'show', 'trip', 'vacation', 'gym', 'workout', 'sports', 'match', 'team', 'cool', 'awesome', 'sick', 'fire', 'ya', 'yeah', 'nah', 'fr', 'tbh', 'ngl', 'imo'],
      weight: 0
    },
    conflict: {
      keywords: ['angry', 'upset', 'disappointed', 'frustrated', 'annoyed', 'problem', 'issue', 'wrong', 'fault', 'blame', 'sorry', 'apologize', 'hurt', 'offensive', 'rude', 'disrespect', 'unfair', 'disagree', 'argument', 'fight', 'misunderstand', 'explain', 'clarify', 'resolve', 'fix'],
      weight: 0
    },
    negotiation: {
      keywords: ['price', 'cost', 'offer', 'counter', 'deal', 'terms', 'agreement', 'negotiate', 'discount', 'value', 'worth', 'budget', 'afford', 'pay', 'rate', 'fee', 'compensation', 'salary', 'raise', 'promotion'],
      weight: 0
    },
    support_seeking: {
      keywords: ['help', 'advice', 'suggest', 'recommend', 'think', 'opinion', 'should i', 'what do you', 'confused', 'unsure', 'stuck', 'struggling', 'difficult', 'hard', 'stress', 'anxious', 'worried', 'scared', 'need', 'please'],
      weight: 0
    }
  };

  // Score each context
  for (const [context, data] of Object.entries(contextPatterns)) {
    for (const keyword of data.keywords) {
      if (text.includes(keyword)) {
        contextPatterns[context].weight += keyword.length > 4 ? 2 : 1; // Longer keywords = stronger signal
      }
    }
  }

  // Find dominant context
  let maxWeight = 0;
  let detectedContext = 'general';
  for (const [context, data] of Object.entries(contextPatterns)) {
    if (data.weight > maxWeight) {
      maxWeight = data.weight;
      detectedContext = context;
    }
  }

  // Confidence calculation
  const totalWeight = Object.values(contextPatterns).reduce((sum, d) => sum + d.weight, 0);
  const confidence = totalWeight > 0 ? Math.min(98, Math.round((maxWeight / totalWeight) * 100 + 30)) : 50;

  return {
    primary: detectedContext,
    confidence,
    scores: contextPatterns,
    isRomantic: detectedContext === 'romantic',
    isBusiness: detectedContext === 'business',
    isCreative: detectedContext === 'creative_collab',
    isFriendship: detectedContext === 'friendship',
    isConflict: detectedContext === 'conflict',
    isNegotiation: detectedContext === 'negotiation'
  };
};

// ============================================================================
// DYNAMIC SIGNAL DETECTION
// ============================================================================

const detectSignals = (messages, context) => {
  const greenLights = [];
  const redFlags = [];
  const allText = messages.map(m => m.content).join(' ').toLowerCase();
  const youMessages = messages.filter(m => m.speaker.toLowerCase() === 'you');
  const themMessages = messages.filter(m => m.speaker.toLowerCase() !== 'you');

  // Universal positive signals
  const positivePatterns = [
    { pattern: /looking forward/i, signal: 'Anticipation expressed', weight: 'Strong' },
    { pattern: /great|awesome|perfect|love it|amazing/i, signal: 'Positive affirmation', weight: 'Moderate' },
    { pattern: /yes|yeah|definitely|absolutely|for sure/i, signal: 'Agreement signal', weight: 'Moderate' },
    { pattern: /thanks|thank you|appreciate/i, signal: 'Gratitude expressed', weight: 'Light' },
    { pattern: /\?.*\?/s, signal: 'High engagement (multiple questions)', weight: 'Strong' },
    { pattern: /!{1,}/i, signal: 'Enthusiasm markers', weight: 'Light' },
    { pattern: /let me|i('ll| will)|going to/i, signal: 'Commitment language', weight: 'Strong' },
    { pattern: /we (could|should|can)/i, signal: 'Collaborative framing', weight: 'Strong' },
  ];

  // Universal warning signals
  const warningPatterns = [
    { pattern: /busy|swamped|crazy|hectic/i, signal: 'Availability concern', weight: 'Light' },
    { pattern: /maybe|perhaps|possibly|not sure/i, signal: 'Hedging language', weight: 'Moderate' },
    { pattern: /later|eventually|sometime|when i can/i, signal: 'Delay indicators', weight: 'Moderate' },
    { pattern: /sorry|apologize|my bad/i, signal: 'Friction acknowledgment', weight: 'Light' },
    { pattern: /but |however |although /i, signal: 'Qualification markers', weight: 'Light' },
  ];

  // Context-specific signals
  if (context.isCreative) {
    positivePatterns.push(
      { pattern: /cool|nice|sick|fire|dope/i, signal: 'Casual approval', weight: 'Moderate' },
      { pattern: /love it|dig it|into it/i, signal: 'Creative buy-in', weight: 'Strong' },
      { pattern: /let('s| us) (do|make|build|try)/i, signal: 'Action orientation', weight: 'Strong' },
      { pattern: /idea|concept|vision/i, signal: 'Creative engagement', weight: 'Moderate' },
      { pattern: /update|check it out|done/i, signal: 'Delivery momentum', weight: 'Strong' }
    );
    warningPatterns.push(
      { pattern: /clunky|awkward|weird|off/i, signal: 'UX friction feedback', weight: 'Strong' },
      { pattern: /would love it if|wish it/i, signal: 'Feature request (opportunity)', weight: 'Moderate' },
      { pattern: /confus|unclear|don('t| not) get/i, signal: 'Comprehension gap', weight: 'Strong' }
    );
  }

  if (context.isBusiness) {
    positivePatterns.push(
      { pattern: /need someone|looking for|require/i, signal: 'Explicit need stated', weight: 'Very Strong' },
      { pattern: /budget|ready to|prepared to/i, signal: 'Resource commitment', weight: 'Very Strong' },
      { pattern: /decision maker|authority|approve/i, signal: 'Power indicator', weight: 'Strong' },
      { pattern: /timeline|deadline|asap|urgent/i, signal: 'Urgency signal', weight: 'Strong' },
      { pattern: /impressive|excellent|outstanding/i, signal: 'High praise', weight: 'Strong' }
    );
    warningPatterns.push(
      { pattern: /competitor|alternative|other option/i, signal: 'Shopping around', weight: 'Strong' },
      { pattern: /check with|run it by|get approval/i, signal: 'Not sole decision maker', weight: 'Moderate' },
      { pattern: /budget constraint|limited|tight/i, signal: 'Financial hesitation', weight: 'Strong' }
    );
  }

  if (context.isRomantic) {
    positivePatterns.push(
      { pattern: /miss you|thinking (of|about) you/i, signal: 'Emotional investment', weight: 'Very Strong' },
      { pattern: /see you|meet up|hang out/i, signal: 'Seeking proximity', weight: 'Strong' },
      { pattern: /😍|❤️|😘|💕|🥰/i, signal: 'Romantic emoji usage', weight: 'Moderate' },
      { pattern: /you('re| are) (so |really )?(cute|sweet|amazing|special)/i, signal: 'Direct compliment', weight: 'Very Strong' },
      { pattern: /can('t|not) wait/i, signal: 'Anticipation', weight: 'Strong' }
    );
    warningPatterns.push(
      { pattern: /friend|buddy|pal|mate/i, signal: 'Friend-zone language', weight: 'Very Strong' },
      { pattern: /busy|rain check|another time/i, signal: 'Avoidance pattern', weight: 'Strong' },
      { pattern: /ex|previous|last relationship/i, signal: 'Past relationship focus', weight: 'Moderate' },
      { pattern: /slow down|take it slow|not ready/i, signal: 'Pace concern', weight: 'Strong' }
    );
  }

  // Analyze messages for signals
  for (const msg of themMessages) {
    const content = msg.content;

    for (const { pattern, signal, weight } of positivePatterns) {
      if (pattern.test(content)) {
        const excerpt = content.length > 50 ? content.substring(0, 47) + '...' : content;
        if (!greenLights.find(g => g.signal === signal)) {
          greenLights.push({ signal, message: excerpt, weight });
        }
      }
    }

    for (const { pattern, signal, weight } of warningPatterns) {
      if (pattern.test(content)) {
        const excerpt = content.length > 50 ? content.substring(0, 47) + '...' : content;
        if (!redFlags.find(r => r.signal === signal)) {
          redFlags.push({ signal, message: excerpt, weight });
        }
      }
    }
  }

  // Sort by weight
  const weightOrder = { 'Very Strong': 0, 'Strong': 1, 'Moderate': 2, 'Light': 3 };
  greenLights.sort((a, b) => weightOrder[a.weight] - weightOrder[b.weight]);
  redFlags.sort((a, b) => weightOrder[a.weight] - weightOrder[b.weight]);

  return { greenLights: greenLights.slice(0, 6), redFlags: redFlags.slice(0, 4) };
};

// ============================================================================
// RESPONSE TIME ANALYSIS
// ============================================================================

const analyzeResponseTimes = (messages) => {
  const youMessages = messages.filter(m => m.speaker.toLowerCase() === 'you');
  const themMessages = messages.filter(m => m.speaker.toLowerCase() !== 'you');

  // Parse timestamps and calculate gaps
  const parseTime = (timestamp) => {
    if (!timestamp) return null;
    // Try various formats
    const patterns = [
      /(\d{1,2})\/(\d{1,2})\/(\d{2,4}),?\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i,
      /(\d{1,2}):(\d{2})\s*(AM|PM)?/i
    ];

    for (const pattern of patterns) {
      const match = timestamp.match(pattern);
      if (match) {
        if (match.length > 5) {
          // Full date format
          let [, month, day, year, hours, minutes, , ampm] = match;
          hours = parseInt(hours);
          if (ampm?.toUpperCase() === 'PM' && hours !== 12) hours += 12;
          if (ampm?.toUpperCase() === 'AM' && hours === 12) hours = 0;
          return new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day), hours, parseInt(minutes));
        } else {
          // Time only
          let [, hours, minutes, ampm] = match;
          hours = parseInt(hours);
          if (ampm?.toUpperCase() === 'PM' && hours !== 12) hours += 12;
          if (ampm?.toUpperCase() === 'AM' && hours === 12) hours = 0;
          return new Date(2024, 0, 1, hours, parseInt(minutes));
        }
      }
    }
    return null;
  };

  // Calculate average response times
  let yourTotalTime = 0, yourCount = 0;
  let theirTotalTime = 0, theirCount = 0;

  for (let i = 1; i < messages.length; i++) {
    const prev = messages[i - 1];
    const curr = messages[i];
    const prevTime = parseTime(prev.timestamp);
    const currTime = parseTime(curr.timestamp);

    if (prevTime && currTime && currTime > prevTime) {
      const diffMinutes = (currTime - prevTime) / (1000 * 60);
      if (diffMinutes < 1440) { // Less than 24 hours
        if (curr.speaker.toLowerCase() === 'you' && prev.speaker.toLowerCase() !== 'you') {
          yourTotalTime += diffMinutes;
          yourCount++;
        } else if (curr.speaker.toLowerCase() !== 'you' && prev.speaker.toLowerCase() === 'you') {
          theirTotalTime += diffMinutes;
          theirCount++;
        }
      }
    }
  }

  return {
    you: yourCount > 0 ? Math.round(yourTotalTime / yourCount) : 30,
    them: theirCount > 0 ? Math.round(theirTotalTime / theirCount) : 30
  };
};

// ============================================================================
// CRITICAL MOMENTS DETECTION
// ============================================================================

const detectCriticalMoments = (messages, context) => {
  const moments = [];
  const themMessages = messages.filter(m => m.speaker.toLowerCase() !== 'you');
  const youMessages = messages.filter(m => m.speaker.toLowerCase() === 'you');

  // Pattern-based moment detection
  const momentPatterns = [
    { pattern: /need|require|looking for|want/i, significance: 'NEED REVEALED', impact: 15, analysis: 'They expressed a need or desire. This creates an opportunity for you to provide value.' },
    { pattern: /would love it if|wish|if only/i, significance: 'DESIRE EXPRESSED', impact: 12, analysis: 'An implicit request or wish - addressing this directly builds goodwill.' },
    { pattern: /impressive|amazing|wow|incredible/i, significance: 'VALIDATION MOMENT', impact: 18, analysis: 'Strong positive feedback. Your value is recognized.' },
    { pattern: /let me check|get back to you|think about/i, significance: 'CONSIDERATION PAUSE', impact: -5, analysis: 'A deliberation moment. They need time or have reservations.' },
    { pattern: /yes|definitely|absolutely|let('s| us) do/i, significance: 'COMMITMENT SIGNAL', impact: 20, analysis: 'Clear agreement or commitment. Momentum is in your favor.' },
    { pattern: /sorry|apologize|my fault/i, significance: 'ACCOUNTABILITY TAKEN', impact: 8, analysis: 'Taking responsibility shows maturity and investment in the relationship.' },
    { pattern: /done|finished|ready|check it out/i, significance: 'DELIVERY MOMENT', impact: 15, analysis: 'A deliverable or promise fulfilled. Builds trust and momentum.' },
    { pattern: /clunky|confus|problem|issue|doesn('t| not) work/i, significance: 'FRICTION POINT', impact: -10, analysis: 'A problem or complaint surfaced. Address this to maintain momentum.' },
    { pattern: /cool|nice|good|ok|sounds good/i, significance: 'SOFT APPROVAL', impact: 5, analysis: 'Casual positive acknowledgment. Steady but not enthusiastic.' },
    { pattern: /\?{2,}|really\?|seriously\?/i, significance: 'SURPRISE/DOUBT', impact: -3, analysis: 'Questioning or disbelief. May need clarification or proof.' },
  ];

  // Check messages for patterns
  messages.forEach((msg, index) => {
    if (msg.speaker.toLowerCase() === 'you') return; // Only analyze their messages

    for (const { pattern, significance, impact, analysis } of momentPatterns) {
      if (pattern.test(msg.content)) {
        const excerpt = msg.content.length > 60 ? msg.content.substring(0, 57) + '...' : msg.content;
        if (!moments.find(m => m.significance === significance)) {
          moments.push({
            turn: index + 1,
            message: excerpt,
            significance,
            analysis,
            impact
          });
        }
        break; // One moment per message
      }
    }
  });

  // Sort by absolute impact
  moments.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return moments.slice(0, 5);
};

// ============================================================================
// BEHAVIORAL PROFILE ANALYSIS
// ============================================================================

const analyzeBehavior = (messages, context) => {
  const themMessages = messages.filter(m => m.speaker.toLowerCase() !== 'you');
  const themText = themMessages.map(m => m.content).join(' ');
  const avgLength = themMessages.reduce((sum, m) => sum + m.content.length, 0) / themMessages.length;

  // Communication style detection
  let communicationStyle = 'Balanced';
  if (avgLength > 100) communicationStyle = 'Detailed-Expressive';
  else if (avgLength < 30) communicationStyle = 'Concise-Direct';
  else if (themText.match(/!{2,}/g)) communicationStyle = 'Enthusiastic-Energetic';
  else if (themText.match(/\.\.\./g)) communicationStyle = 'Thoughtful-Measured';

  // Decision speed
  let decisionSpeed = 'Moderate';
  if (/now|asap|immediately|today|right away/i.test(themText)) decisionSpeed = 'Fast-Decisive';
  else if (/think about|consider|maybe later|not sure yet/i.test(themText)) decisionSpeed = 'Deliberate-Cautious';

  // Investment level
  const questionCount = (themText.match(/\?/g) || []).length;
  const exclamationCount = (themText.match(/!/g) || []).length;
  let investmentLevel = 'Moderate';
  if (questionCount > 3 || exclamationCount > 3 || themMessages.length > messages.length * 0.6) {
    investmentLevel = 'High';
  } else if (themMessages.length < messages.length * 0.4) {
    investmentLevel = 'Low';
  }

  // Response pattern
  let responsePattern = 'Balanced';
  if (themMessages.length > messages.length * 0.55) responsePattern = 'Engaged-Initiating';
  else if (themMessages.length < messages.length * 0.45) responsePattern = 'Responsive-Reactive';

  // Hidden priorities based on context
  let hiddenPriorities = [];
  if (context.isCreative) {
    hiddenPriorities = ['Ease of use', 'Quick results', 'Creative freedom'];
  } else if (context.isBusiness) {
    hiddenPriorities = ['Risk mitigation', 'ROI validation', 'Credibility'];
  } else if (context.isRomantic) {
    hiddenPriorities = ['Emotional safety', 'Genuine connection', 'Compatibility'];
  } else if (context.isFriendship) {
    hiddenPriorities = ['Low friction', 'Mutual benefit', 'Reliability'];
  } else {
    hiddenPriorities = ['Value exchange', 'Trust building', 'Clear communication'];
  }

  // Consistency score
  const consistencyScore = Math.min(98, 70 + Math.floor(Math.random() * 20) + (investmentLevel === 'High' ? 8 : 0));

  return {
    communicationStyle,
    decisionSpeed,
    investmentLevel,
    consistencyScore,
    hiddenPriorities,
    responsePattern,
    attachmentStyle: investmentLevel === 'High' ? 'Engaged-Invested' : investmentLevel === 'Low' ? 'Detached-Casual' : 'Balanced-Pragmatic'
  };
};

// ============================================================================
// YOUR DNA ANALYSIS
// ============================================================================

const analyzeYourDNA = (messages, context) => {
  const youMessages = messages.filter(m => m.speaker.toLowerCase() === 'you');
  const yourText = youMessages.map(m => m.content).join(' ');
  const avgLength = youMessages.reduce((sum, m) => sum + m.content.length, 0) / youMessages.length;

  // Archetype detection
  let archetype = 'The Communicator';
  let style = 'Adaptive';
  let traits = [];
  let strengths = [];
  let watchPoints = [];
  let description = '';

  // Analyze patterns
  const isQuestionAsker = (yourText.match(/\?/g) || []).length > 2;
  const isExclaimer = (yourText.match(/!/g) || []).length > 3;
  const isVerbose = avgLength > 80;
  const isConcise = avgLength < 40;
  const isHelpful = /help|here|done|check|update|ready/i.test(yourText);
  const isDeliberate = /let me|i('ll| will) get back|check my/i.test(yourText);

  if (isHelpful && context.isCreative) {
    archetype = 'The Builder';
    style = 'Action-Oriented Creator';
    traits = ['Quick to deliver', 'Solution-focused', 'Responsive to feedback'];
    strengths = ['Fast iteration', 'Bias to action', 'User empathy'];
    watchPoints = ['May over-promise on timelines', 'Risk of burnout from over-responsiveness'];
    description = 'You show up with results, not excuses. Your quick turnaround builds trust and momentum. People know you deliver.';
  } else if (isDeliberate && context.isBusiness) {
    archetype = 'The Consultant';
    style = 'Strategic Validator';
    traits = ['Measured responses', 'Value-first positioning', 'Controlled availability'];
    strengths = ['Frame control', 'Professional authority', 'Scarcity signaling'];
    watchPoints = ['Could appear aloof', 'Risk of over-qualifying'];
    description = 'You communicate with deliberate pacing and position yourself as the prize. Your responses create value before asking for anything.';
  } else if (isQuestionAsker) {
    archetype = 'The Explorer';
    style = 'Curiosity-Driven';
    traits = ['Active listener', 'Genuine interest', 'Information gatherer'];
    strengths = ['Builds rapport through questions', 'Learns quickly', 'Shows engagement'];
    watchPoints = ['May seem interrogative', 'Could ask before contributing'];
    description = 'You lead with curiosity and make others feel heard. Your questions show genuine interest and help you understand before acting.';
  } else if (isConcise) {
    archetype = 'The Minimalist';
    style = 'Efficient Communicator';
    traits = ['Direct messaging', 'No filler', 'Action-oriented'];
    strengths = ['Clear communication', 'Respects others\' time', 'Gets to the point'];
    watchPoints = ['May seem cold or disinterested', 'Could add more warmth'];
    description = 'You say what needs to be said without excess. Your communication is efficient and respectful of time.';
  } else {
    archetype = 'The Connector';
    style = 'Balanced Communicator';
    traits = ['Adaptive tone', 'Reciprocal engagement', 'Steady presence'];
    strengths = ['Versatile communication', 'Matches energy well', 'Reliable'];
    watchPoints = ['Could differentiate more', 'Risk of being forgettable'];
    description = 'You adapt to the conversation\'s needs and maintain balanced engagement. Reliable and easy to work with.';
  }

  return { archetype, style, traits, strengths, watchPoints, archetypeDescription: description };
};

// ============================================================================
// CONTEXT-AWARE QUICK WINS
// ============================================================================

const generateQuickWins = (messages, context, signals) => {
  const themMessages = messages.filter(m => m.speaker.toLowerCase() !== 'you');
  const lastThemMsg = themMessages[themMessages.length - 1]?.content || '';
  const quickWins = [];

  // Context-specific quick wins
  if (context.isCreative) {
    if (/clunky|confus|wish|would love/i.test(lastThemMsg)) {
      quickWins.push({
        action: 'Address their specific feedback immediately',
        why: 'They gave you a direct improvement suggestion. Acting on it fast shows you listen and care.',
        urgency: 'Now'
      });
    }
    quickWins.push({
      action: 'Send a quick demo or screenshot of progress',
      why: 'Visual progress builds excitement and keeps momentum. Show, don\'t tell.',
      urgency: 'Within hours'
    });
    quickWins.push({
      action: 'Ask one specific question about their use case',
      why: 'Shows you\'re building for them, not just building. Creates investment.',
      urgency: 'Next message'
    });
  } else if (context.isBusiness) {
    quickWins.push({
      action: 'Prepare 2-3 specific insights relevant to their situation',
      why: 'Arrive with value, not questions. Show expertise before asking for commitment.',
      urgency: 'Before next meeting'
    });
    quickWins.push({
      action: 'Research their company and recent news',
      why: 'Match their investment. If they researched you, reciprocate.',
      urgency: 'Today'
    });
    quickWins.push({
      action: 'Have a clear next step ready (proposal, timeline, intro)',
      why: 'Don\'t let momentum die. Make it easy for them to say yes to the next step.',
      urgency: 'Prepare now'
    });
  } else if (context.isRomantic) {
    quickWins.push({
      action: 'Suggest a specific plan, not an open question',
      why: '"Want to grab coffee at [place] on Saturday?" beats "Want to hang sometime?"',
      urgency: 'Next message'
    });
    quickWins.push({
      action: 'Reference something specific they mentioned',
      why: 'Shows you listen and remember. Creates feeling of being understood.',
      urgency: 'In conversation'
    });
    quickWins.push({
      action: 'Match their energy level, then add 10%',
      why: 'Don\'t be more invested than them, but show clear interest.',
      urgency: 'Ongoing'
    });
  } else if (context.isFriendship) {
    quickWins.push({
      action: 'Make concrete plans instead of vague intentions',
      why: '"Let\'s hang soon" dies. "Saturday at 3?" happens.',
      urgency: 'Next message'
    });
    quickWins.push({
      action: 'Share something relevant to their interests',
      why: 'A meme, article, or link shows you think of them outside the chat.',
      urgency: 'When you see something relevant'
    });
  }

  // Add signal-based quick wins
  if (signals.redFlags.length > 0) {
    const topFlag = signals.redFlags[0];
    if (topFlag.signal.includes('friction') || topFlag.signal.includes('Friction')) {
      quickWins.unshift({
        action: `Address the "${topFlag.signal.toLowerCase()}" directly`,
        why: 'Unaddressed friction compounds. Acknowledge and resolve it.',
        urgency: 'Priority'
      });
    }
  }

  return quickWins.slice(0, 4);
};

// ============================================================================
// CONTEXT-AWARE MESSAGE GENERATION
// ============================================================================

const generateMessages = (analysis, context, messages) => {
  const themMessages = messages.filter(m => m.speaker.toLowerCase() !== 'you');
  const themName = themMessages[0]?.speaker || 'them';
  const lastThemMsg = themMessages[themMessages.length - 1]?.content || '';

  if (context.isCreative) {
    return [
      {
        type: 'Action-Oriented',
        style: 'builder',
        message: `Just pushed the update - ${lastThemMsg.includes('screenshot') ? 'screenshot upload' : 'that feature'} should be working now. Try it out and let me know what you think.`,
        annotations: [
          { phrase: 'Just pushed', principle: 'Immediate Action', explanation: 'Shows you act fast. Builds trust through delivery.' },
          { phrase: 'Try it out', principle: 'Engagement Invitation', explanation: 'Invites them to participate, creates ownership.' },
          { phrase: 'let me know what you think', principle: 'Feedback Loop', explanation: 'Shows you value their input. Keeps iteration going.' }
        ],
        risk: 'Very Low',
        impact: 'High'
      },
      {
        type: 'Curiosity-Driven',
        style: 'explorer',
        message: `Done! Quick question - how are you actually using this? Want to make sure I'm building the right thing for your workflow.`,
        annotations: [
          { phrase: 'Done!', principle: 'Delivery Confirmation', explanation: 'Short, confident. You delivered.' },
          { phrase: 'how are you actually using this', principle: 'User Research', explanation: 'Gets real insight, not assumptions.' },
          { phrase: 'right thing for your workflow', principle: 'User-Centric Framing', explanation: 'Shows you\'re building for them, not your ego.' }
        ],
        risk: 'Very Low',
        impact: 'Moderate-High'
      },
      {
        type: 'Minimal',
        style: 'concise',
        message: `Done, check it out 👆`,
        annotations: [
          { phrase: 'Done', principle: 'Delivery Signal', explanation: 'No fluff. You said you\'d do it, you did it.' },
          { phrase: '👆', principle: 'Visual Direction', explanation: 'Points to the link/update. Efficient.' }
        ],
        risk: 'Very Low',
        impact: 'Moderate'
      }
    ];
  }

  if (context.isBusiness) {
    return [
      {
        type: 'Frame Control',
        style: 'assertive',
        message: `Looking forward to our conversation. I've been thinking about your situation - I have some frameworks that might shift your perspective. Bring your toughest constraints.`,
        annotations: [
          { phrase: 'I\'ve been thinking', principle: 'Investment Signal', explanation: 'Shows you\'re already engaged, creates reciprocity.' },
          { phrase: 'shift your perspective', principle: 'Authority Frame', explanation: 'Positions you as the one with superior insight.' },
          { phrase: 'Bring your toughest constraints', principle: 'Challenge Frame', explanation: 'Flips dynamic - you\'re testing them, not vice versa.' }
        ],
        risk: 'Low',
        impact: 'High'
      },
      {
        type: 'Value-First',
        style: 'balanced',
        message: `Great, I've pulled together some initial thoughts specific to your situation - curious to pressure-test them with you. See you then.`,
        annotations: [
          { phrase: 'pulled together some initial thoughts', principle: 'Prepared Value', explanation: 'You\'re arriving with something, not extracting.' },
          { phrase: 'pressure-test', principle: 'Collaborative Frame', explanation: 'Implies partnership, reduces sales resistance.' },
          { phrase: 'specific to your situation', principle: 'Personalization', explanation: 'Shows you understand their context is unique.' }
        ],
        risk: 'Very Low',
        impact: 'Moderate-High'
      },
      {
        type: 'Professional Minimal',
        style: 'minimal',
        message: `Confirmed. Looking forward to it.`,
        annotations: [
          { phrase: 'Confirmed', principle: 'Clarity', explanation: 'No ambiguity. Professional and direct.' },
          { phrase: 'Looking forward to it', principle: 'Positive Close', explanation: 'Warm but not over-eager.' }
        ],
        risk: 'Very Low',
        impact: 'Moderate'
      }
    ];
  }

  if (context.isRomantic) {
    return [
      {
        type: 'Confident Initiative',
        style: 'assertive',
        message: `I've been thinking about that thing you mentioned. Free Saturday afternoon? I know a great spot.`,
        annotations: [
          { phrase: 'I\'ve been thinking', principle: 'Investment Signal', explanation: 'Shows they\'re on your mind. Flattering but not desperate.' },
          { phrase: 'Free Saturday afternoon?', principle: 'Specific Ask', explanation: 'Concrete > vague. Makes it easy to say yes.' },
          { phrase: 'I know a great spot', principle: 'Leadership', explanation: 'You have a plan. Confident, not needy.' }
        ],
        risk: 'Low',
        impact: 'High'
      },
      {
        type: 'Warm & Playful',
        style: 'balanced',
        message: `That's actually really interesting. We should talk about it more - maybe over coffee this week?`,
        annotations: [
          { phrase: 'That\'s actually really interesting', principle: 'Genuine Interest', explanation: 'Validates their thought. Makes them feel heard.' },
          { phrase: 'We should talk about it more', principle: 'Continuation Hook', explanation: 'Creates reason for next interaction.' },
          { phrase: 'maybe over coffee', principle: 'Low-Pressure Suggestion', explanation: 'Coffee is casual. Easy yes.' }
        ],
        risk: 'Very Low',
        impact: 'Moderate-High'
      },
      {
        type: 'Cool & Chill',
        style: 'minimal',
        message: `Ha yeah for sure. Let me know when you're free 🙂`,
        annotations: [
          { phrase: 'Ha yeah', principle: 'Casual Agreement', explanation: 'Relaxed, not over-eager.' },
          { phrase: 'Let me know when you\'re free', principle: 'Ball in Their Court', explanation: 'Shows interest without chasing.' }
        ],
        risk: 'Very Low',
        impact: 'Moderate'
      }
    ];
  }

  // Default/friendship context
  return [
    {
      type: 'Engaged',
      style: 'active',
      message: `Yeah that's dope. I'm down - when works for you?`,
      annotations: [
        { phrase: 'that\'s dope', principle: 'Affirmation', explanation: 'Shows enthusiasm and agreement.' },
        { phrase: 'I\'m down', principle: 'Clear Commitment', explanation: 'No ambiguity. You\'re in.' },
        { phrase: 'when works for you', principle: 'Collaborative Scheduling', explanation: 'Moves toward action.' }
      ],
      risk: 'Very Low',
      impact: 'Moderate'
    },
    {
      type: 'Add Value',
      style: 'contributor',
      message: `Nice, that reminds me of something - let me send you this thing I found. Might be relevant.`,
      annotations: [
        { phrase: 'that reminds me', principle: 'Connection Making', explanation: 'Shows active listening and association.' },
        { phrase: 'let me send you', principle: 'Value Offer', explanation: 'You\'re adding to the conversation, not just taking.' }
      ],
      risk: 'Very Low',
      impact: 'Moderate'
    },
    {
      type: 'Minimal',
      style: 'chill',
      message: `Facts. Let's do it.`,
      annotations: [
        { phrase: 'Facts', principle: 'Agreement', explanation: 'Casual strong agreement.' },
        { phrase: 'Let\'s do it', principle: 'Action Commitment', explanation: 'Short, decisive, committed.' }
      ],
      risk: 'Very Low',
      impact: 'Light'
    }
  ];
};

// ============================================================================
// OPTIMAL TIMING ANALYSIS
// ============================================================================

const analyzeOptimalTiming = (messages, responseTimes) => {
  const themMessages = messages.filter(m => m.speaker.toLowerCase() !== 'you');

  // Analyze their message timestamps for patterns
  const hours = themMessages.map(m => {
    const match = m.timestamp?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let hour = parseInt(match[1]);
      if (match[3]?.toUpperCase() === 'PM' && hour !== 12) hour += 12;
      if (match[3]?.toUpperCase() === 'AM' && hour === 12) hour = 0;
      return hour;
    }
    return null;
  }).filter(h => h !== null);

  let bestHours = '10am - 6pm';
  let bestDays = ['Tuesday', 'Wednesday', 'Thursday'];

  if (hours.length > 0) {
    const avgHour = Math.round(hours.reduce((a, b) => a + b, 0) / hours.length);
    if (avgHour < 12) bestHours = '9am - 12pm';
    else if (avgHour < 17) bestHours = '12pm - 5pm';
    else bestHours = '5pm - 9pm';
  }

  // Response delay recommendation based on their pattern
  let responseDelay = '15-45 minutes';
  if (responseTimes.them > 60) responseDelay = '30-90 minutes';
  if (responseTimes.them > 180) responseDelay = '1-3 hours';
  if (responseTimes.them < 15) responseDelay = '5-20 minutes';

  return {
    bestDays,
    bestHours,
    avoidTiming: 'Late night (after 10pm), Early morning (before 8am)',
    responseDelay,
    reasoning: `Based on their message patterns. Match their pacing without being slower.`
  };
};

// ============================================================================
// MAIN ANALYSIS ENGINE
// ============================================================================

const analyzeConversation = (messages, config) => {
  const allText = messages.map(m => `${m.speaker}: ${m.content}`).join('\n');
  const youMessages = messages.filter(m => m.speaker.toLowerCase() === 'you');
  const themMessages = messages.filter(m => m.speaker.toLowerCase() !== 'you');

  // 1. Detect context
  const context = detectContext(messages, allText);

  // 2. Analyze response times
  const responseTimes = analyzeResponseTimes(messages);

  // 3. Detect signals
  const signals = detectSignals(messages, context);

  // 4. Calculate power balance
  const theirQuestions = themMessages.filter(m => m.content.includes('?')).length;
  const yourQuestions = youMessages.filter(m => m.content.includes('?')).length;
  const theirInitiation = messages[0]?.speaker.toLowerCase() !== 'you';
  const messageRatio = themMessages.length / (youMessages.length || 1);

  let powerBalance = 50;
  powerBalance += theirInitiation ? 5 : -5;
  powerBalance += (messageRatio > 1.2) ? 10 : (messageRatio < 0.8) ? -10 : 0;
  powerBalance += (theirQuestions > yourQuestions) ? 8 : -5;
  powerBalance += signals.greenLights.length * 3;
  powerBalance -= signals.redFlags.length * 4;
  powerBalance = Math.min(85, Math.max(15, powerBalance));

  // 5. Calculate win probability
  let winProbability = 50;
  winProbability += signals.greenLights.length * 6;
  winProbability -= signals.redFlags.length * 8;
  winProbability += (powerBalance - 50) * 0.3;
  winProbability += context.confidence * 0.1;
  winProbability = Math.min(95, Math.max(20, Math.round(winProbability)));

  // 6. Behavioral analysis
  const behavioralProfile = analyzeBehavior(messages, context);

  // 7. Your DNA
  const yourDNA = analyzeYourDNA(messages, context);

  // 8. Critical moments
  const criticalMoments = detectCriticalMoments(messages, context);

  // 9. Optimal timing
  const optimalTiming = analyzeOptimalTiming(messages, responseTimes);

  // 10. Quick wins
  const quickWins = generateQuickWins(messages, context, signals);

  return {
    // Context
    detectedContext: context,
    contextLabel: context.primary.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    contextConfidence: context.confidence,

    // Core metrics
    powerBalance,
    winProbability,
    messageCount: { you: youMessages.length, them: themMessages.length },
    avgResponseTime: responseTimes,
    initiator: messages[0]?.speaker || 'Unknown',
    themName: themMessages[0]?.speaker || 'Them',

    // Analysis
    behavioralProfile,
    yourDNA,
    criticalMoments,
    greenLights: signals.greenLights,
    redFlags: signals.redFlags,
    optimalTiming,
    quickWins
  };
};

// ============================================================================
// MOVE TREE GENERATION
// ============================================================================

const generateMoveTree = (selectedMessage, context) => {
  if (context?.isCreative) {
    return {
      positive: {
        probability: 70,
        response: "They try it out and give positive feedback or more specific requests",
        yourMove: "Acknowledge, then ask what they'd want to see next"
      },
      neutral: {
        probability: 25,
        response: "Brief acknowledgment like 'cool' or 'nice'",
        yourMove: "Let it sit. They'll come back when they have more to say"
      },
      negative: {
        probability: 5,
        response: "More feedback or issues discovered",
        yourMove: "Thank them for the feedback, address it promptly"
      }
    };
  }

  return {
    positive: {
      probability: 60,
      response: "They respond with enthusiasm or add to the conversation",
      yourMove: "Match energy, add value, suggest next step if appropriate"
    },
    neutral: {
      probability: 30,
      response: "Simple acknowledgment without much elaboration",
      yourMove: "No immediate action needed. Let conversation breathe."
    },
    negative: {
      probability: 10,
      response: "Delayed response, pushback, or topic change",
      yourMove: "Give space. Don't chase. Reengage with new value later."
    }
  };
};

// ============================================================================
// PARSING & UTILITIES
// ============================================================================

const parseConversation = (rawText) => {
  const lines = rawText.trim().split('\n').filter(line => line.trim());
  const messages = [];

  const whatsappRegex = /\[([^\]]+)\]\s*([^:]+):\s*(.+)/;
  const imessageRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4},?\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)\s*[-–]\s*([^:]+):\s*(.+)/i;
  const telegramRegex = /^([^,\[]+),?\s*\[([^\]]+)\]:\s*(.+)/;
  const genericRegex = /^([^:]+):\s*(.+)/;
  const timeOnlyRegex = /^(\d{1,2}:\d{2}(?::\d{2})?(?:\s*(?:AM|PM))?)\s+([^:]+):\s*(.+)/i;

  for (const line of lines) {
    let match = line.match(whatsappRegex);
    if (match) {
      messages.push({ timestamp: match[1], speaker: match[2].trim(), content: match[3].trim() });
      continue;
    }
    match = line.match(imessageRegex);
    if (match) {
      messages.push({ timestamp: match[1], speaker: match[2].trim(), content: match[3].trim() });
      continue;
    }
    match = line.match(telegramRegex);
    if (match) {
      messages.push({ timestamp: match[2], speaker: match[1].trim(), content: match[3].trim() });
      continue;
    }
    match = line.match(timeOnlyRegex);
    if (match) {
      messages.push({ timestamp: match[1], speaker: match[2].trim(), content: match[3].trim() });
      continue;
    }
    match = line.match(genericRegex);
    if (match) {
      messages.push({ timestamp: null, speaker: match[1].trim(), content: match[2].trim() });
    }
  }

  return messages;
};

const extractTimestamp = (text) => {
  const patterns = [
    /\[(\d{1,2}\/\d{1,2}\/\d{2,4},?\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)\]/i,
    /(\d{1,2}\/\d{1,2}\/\d{2,4},?\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)/i,
    /(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const parseTimestampToDate = (timestamp) => {
  if (!timestamp) return new Date(0);
  const cleanTimestamp = timestamp.replace(/,/g, '').trim();
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
  const parsed = Date.parse(cleanTimestamp);
  return isNaN(parsed) ? new Date(0) : new Date(parsed);
};

// ============================================================================
// UI COMPONENTS
// ============================================================================

const Card = ({ children, className = '', glow = false }) => (
  <div className={`bg-[#0c0c12] border border-white/[0.06] rounded-xl p-6 ${glow ? 'shadow-[0_0_40px_rgba(99,102,241,0.15)]' : ''} ${className}`}>
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
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
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
      <div className={`h-full ${colors[color]} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  );
};

// ============================================================================
// MAIN APPLICATION
// ============================================================================

export default function SignalAnalysisLab() {
  const [step, setStep] = useState(1);
  const [inputMode, setInputMode] = useState('text');
  const [rawConversation, setRawConversation] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [processingImages, setProcessingImages] = useState(false);
  const [ocrProgress, setOcrProgress] = useState({ current: 0, total: 0 });
  const [messages, setMessages] = useState([]);
  const [config, setConfig] = useState({ relationshipType: 'auto', objective: 'auto', stakes: 7 });
  const [analysis, setAnalysis] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    context: true, power: true, profile: true, dna: true, moments: true, signals: true, timing: true, composer: true, quickwins: true
  });
  const [copied, setCopied] = useState(false);
  const [showMoveTree, setShowMoveTree] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const toggleSection = (section) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  const handleLoadSample = () => setRawConversation(SAMPLE_CONVERSATION);

  const handleImageSelect = useCallback(async (files) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/') || f.name.match(/\.(png|jpg|jpeg|gif|webp|bmp)$/i));
    if (imageFiles.length === 0) return;
    const newImages = await Promise.all(imageFiles.map(async (file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file, url: URL.createObjectURL(file), name: file.name,
      extractedText: '', timestamp: null, processing: false, processed: false
    })));
    setUploadedImages(prev => [...prev, ...newImages]);
    setInputMode('image');
  }, []);

  const handleDrop = useCallback((e) => { e.preventDefault(); setDragOver(false); handleImageSelect(e.dataTransfer.files); }, [handleImageSelect]);
  const handleDragOver = useCallback((e) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setDragOver(false); }, []);
  const removeImage = (id) => {
    setUploadedImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      if (updated.length === 0) setInputMode('text');
      return updated;
    });
  };

  const processImagesOCR = async () => {
    if (uploadedImages.length === 0) return;
    setProcessingImages(true);
    setOcrProgress({ current: 0, total: uploadedImages.length });
    const processedImages = [];
    for (let i = 0; i < uploadedImages.length; i++) {
      const img = uploadedImages[i];
      setOcrProgress({ current: i + 1, total: uploadedImages.length });
      try {
        const result = await Tesseract.recognize(img.url, 'eng', {});
        const text = result.data.text;
        const timestamp = extractTimestamp(text);
        processedImages.push({ ...img, extractedText: text, timestamp, parsedDate: parseTimestampToDate(timestamp), processed: true });
      } catch (error) {
        processedImages.push({ ...img, extractedText: '', timestamp: null, processed: true, error: true });
      }
    }
    processedImages.sort((a, b) => {
      if (!a.parsedDate && !b.parsedDate) return 0;
      if (!a.parsedDate) return 1;
      if (!b.parsedDate) return -1;
      return a.parsedDate - b.parsedDate;
    });
    setUploadedImages(processedImages);
    const combinedText = processedImages.map(img => img.extractedText).filter(t => t.trim()).join('\n\n');
    setRawConversation(combinedText);
    setProcessingImages(false);
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

  const canAnalyze = inputMode === 'text' ? rawConversation.trim().length >= 20 : uploadedImages.length > 0;
  const isReadyToAnalyze = inputMode === 'text' ? rawConversation.trim().length >= 20 : uploadedImages.length > 0 && uploadedImages.every(img => img.processed) && rawConversation.trim().length >= 20;
  const needsOCR = inputMode === 'image' && uploadedImages.length > 0 && !uploadedImages.every(img => img.processed);

  const handleMainAction = async () => {
    if (inputMode === 'image' && needsOCR) {
      await processImagesOCR();
    } else if (isReadyToAnalyze) {
      handleParse();
    }
  };

  const messageVariants = analysis ? generateMessages(analysis, analysis.detectedContext, messages) : [];
  const moveTree = messageVariants[selectedVariant] ? generateMoveTree(messageVariants[selectedVariant], analysis?.detectedContext) : null;

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const SectionHeader = ({ icon: Icon, title, section, badge }) => (
    <button onClick={() => toggleSection(section)} className="w-full flex items-center justify-between mb-4 group">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-500/10 rounded-lg"><Icon className="w-4 h-4 text-indigo-400" /></div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {badge && <Badge variant={badge.variant}>{badge.text}</Badge>}
      </div>
      <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform ${expandedSections[section] ? 'rotate-180' : ''}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-[#08080c] text-zinc-100">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

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
              {[1, 2, 3].map(s => (<div key={s} className={`w-2 h-2 rounded-full transition-all ${step >= s ? 'bg-indigo-500' : 'bg-white/10'}`} />))}
            </div>
          )}
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-6 py-8">
        {step === 1 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">Decode Any Conversation</h2>
              <p className="text-zinc-400 text-lg">Paste text or upload screenshots. Get strategic intelligence.</p>
            </div>

            <div className="flex justify-center gap-2 mb-4">
              <button onClick={() => setInputMode('text')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${inputMode === 'text' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
                <FileText className="w-4 h-4" /> Paste Text
              </button>
              <button onClick={() => setInputMode('image')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${inputMode === 'image' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
                <Image className="w-4 h-4" /> Upload Screenshots
              </button>
            </div>

            {inputMode === 'text' ? (
              <Card glow>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-zinc-300">Paste conversation</label>
                    <button onClick={handleLoadSample} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Load sample
                    </button>
                  </div>
                  <textarea value={rawConversation} onChange={(e) => setRawConversation(e.target.value)} placeholder="Paste your WhatsApp, iMessage, or any text conversation here..." className="w-full h-64 bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 resize-none font-mono" />
                  <div className="flex items-center gap-3 pt-2">
                    <div className="p-2 bg-white/5 rounded-lg"><FileText className="w-4 h-4 text-zinc-500" /></div>
                    <div className="text-xs text-zinc-500">Supports WhatsApp exports, iMessage, Telegram, or any "Speaker: message" format</div>
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
                  <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onClick={() => fileInputRef.current?.click()} className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'}`}>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => handleImageSelect(e.target.files)} className="hidden" />
                    <Upload className={`w-10 h-10 mx-auto mb-3 ${dragOver ? 'text-indigo-400' : 'text-zinc-600'}`} />
                    <p className="text-sm text-zinc-400 mb-1">Drop images here or click to browse</p>
                    <p className="text-xs text-zinc-600">PNG, JPG, JPEG supported • Multiple images allowed</p>
                  </div>
                  {uploadedImages.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500">{uploadedImages.some(img => img.timestamp) ? 'Sorted by detected timestamp' : 'Drag to reorder if needed'}</span>
                        {!processingImages && uploadedImages.some(img => !img.processed) && (
                          <button onClick={processImagesOCR} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Extract text
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {uploadedImages.map((img, index) => (
                          <div key={img.id} className="relative group rounded-lg overflow-hidden border border-white/10 bg-white/[0.02]">
                            <img src={img.url} alt={img.name} className="w-full h-24 object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                              <span className="text-[10px] text-zinc-400 truncate max-w-[60%]">{img.timestamp || `Image ${index + 1}`}</span>
                              {img.processed ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : img.processing ? <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" /> : null}
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); removeImage(img.id); }} className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {processingImages && (
                        <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                            <span className="text-sm text-indigo-400">Extracting text... ({ocrProgress.current}/{ocrProgress.total})</span>
                          </div>
                          <ProgressBar value={ocrProgress.current} max={ocrProgress.total} color="indigo" />
                        </div>
                      )}
                      {uploadedImages.every(img => img.processed) && rawConversation && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-500">Extracted text (editable)</span>
                            <Badge variant="success">Ready</Badge>
                          </div>
                          <textarea value={rawConversation} onChange={(e) => setRawConversation(e.target.value)} className="w-full h-40 bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 resize-none font-mono" />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="p-2 bg-white/5 rounded-lg"><Image className="w-4 h-4 text-zinc-500" /></div>
                    <div className="text-xs text-zinc-500">Screenshots are processed locally using OCR. Timestamps are auto-detected for sorting.</div>
                  </div>
                </div>
              </Card>
            )}

            <button onClick={handleMainAction} disabled={!canAnalyze || processingImages} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 group">
              {processingImages ? (<>Processing... <Loader2 className="w-4 h-4 animate-spin" /></>) : needsOCR ? (<>Extract Text <Zap className="w-4 h-4" /></>) : isReadyToAnalyze ? (<>Analyze Conversation <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>) : (<>Upload Screenshots First</>)}
            </button>
            <p className="text-center text-xs text-zinc-600">All processing happens locally. Your conversations are never stored.</p>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Ready to Analyze</h2>
              <p className="text-zinc-400">Context will be auto-detected from your conversation</p>
            </div>
            <Card>
              <div className="space-y-6">
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-sm font-medium text-emerald-400">Parsed {messages.length} messages</p>
                      <p className="text-xs text-zinc-500">Between "You" and "{messages.find(m => m.speaker.toLowerCase() !== 'you')?.speaker || 'Them'}"</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-sm font-medium text-cyan-400">Auto-Detection Enabled</p>
                      <p className="text-xs text-zinc-500">Context, relationship type, and objectives will be intelligently detected from the conversation content</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-zinc-300">Stakes Level</label>
                    <span className="text-sm text-indigo-400">{config.stakes}/10</span>
                  </div>
                  <input type="range" min="1" max="10" value={config.stakes} onChange={(e) => setConfig(prev => ({ ...prev, stakes: parseInt(e.target.value) }))} className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-xs text-zinc-600">
                    <span>Low stakes</span>
                    <span>Career/relationship defining</span>
                  </div>
                </div>
              </div>
            </Card>
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-medium text-zinc-300 transition-all">Back</button>
              <button onClick={handleAnalyze} className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 group">
                Generate Intelligence <Zap className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && analysis && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Context Detection Banner */}
            <Card className="border-cyan-500/20 bg-cyan-500/[0.02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-500/10 rounded-xl">
                    <Brain className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">Detected: {analysis.contextLabel}</h3>
                      <Badge variant="cyan">{analysis.contextConfidence}% confident</Badge>
                    </div>
                    <p className="text-sm text-zinc-400">Analysis tailored to this context</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{analysis.winProbability}%</div>
                  <div className="text-xs text-zinc-500">Success probability</div>
                </div>
              </div>
            </Card>

            {/* Quick Wins */}
            <Card className="border-amber-500/20 bg-amber-500/[0.02]">
              <SectionHeader icon={Zap} title="Quick Wins" section="quickwins" badge={{ text: `${analysis.quickWins.length} Actions`, variant: 'warning' }} />
              {expandedSections.quickwins && (
                <div className="space-y-3">
                  {analysis.quickWins.map((win, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-white/[0.02] rounded-lg border border-white/[0.04]">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">{i + 1}</div>
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
                        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-amber-500 rounded-full" style={{ width: `${100 - analysis.powerBalance}%` }} />
                        <div className="absolute inset-y-0 right-0 bg-gradient-to-l from-emerald-500 to-cyan-500 rounded-full" style={{ width: `${analysis.powerBalance}%` }} />
                        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg border-2 border-zinc-800" style={{ left: `${analysis.powerBalance}%`, transform: 'translate(-50%, -50%)' }} />
                      </div>
                      <div className="flex justify-center mt-2">
                        <Badge variant={analysis.powerBalance > 50 ? 'success' : 'warning'}>{analysis.powerBalance > 50 ? 'Advantage: You' : 'Advantage: Them'}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white/[0.02] rounded-lg">
                        <div className="text-xs text-zinc-500 mb-1">Initiated by</div>
                        <div className="text-sm font-medium text-white">{analysis.initiator}</div>
                      </div>
                      <div className="p-3 bg-white/[0.02] rounded-lg">
                        <div className="text-xs text-zinc-500 mb-1">Message ratio</div>
                        <div className="text-sm font-medium text-white">{analysis.messageCount.them}:{analysis.messageCount.you}</div>
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
                        <div className="text-xs text-zinc-500 mb-1">Investment</div>
                        <div className="text-sm font-medium text-white">{analysis.behavioralProfile.investmentLevel}</div>
                      </div>
                      <div className="p-3 bg-white/[0.02] rounded-lg">
                        <div className="text-xs text-zinc-500 mb-1">Pattern</div>
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
                      <div className="text-xs text-zinc-500 mb-2">Likely Priorities</div>
                      <div className="flex flex-wrap gap-2">
                        {analysis.behavioralProfile.hiddenPriorities.map((p, i) => (<Badge key={i} variant="info">{p}</Badge>))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Your DNA */}
            <Card className="border-purple-500/20 bg-purple-500/[0.02]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg"><Users className="w-4 h-4 text-purple-400" /></div>
                  <h3 className="text-lg font-semibold text-white">Your Communication DNA</h3>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="p-6 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-500/20 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center"><Award className="w-8 h-8 text-purple-400" /></div>
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
                        {analysis.yourDNA.strengths.map((s, i) => (<div key={i} className="flex items-center gap-2 text-sm text-emerald-400"><CheckCircle className="w-3 h-3" /> {s}</div>))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-2">Watch Points</div>
                      <div className="space-y-1">
                        {analysis.yourDNA.watchPoints.map((w, i) => (<div key={i} className="flex items-center gap-2 text-sm text-amber-400"><AlertTriangle className="w-3 h-3" /> {w}</div>))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Critical Moments */}
            {analysis.criticalMoments.length > 0 && (
              <Card>
                <SectionHeader icon={Zap} title="Critical Moments" section="moments" badge={{ text: `${analysis.criticalMoments.length} Turning Points`, variant: 'info' }} />
                {expandedSections.moments && (
                  <div className="space-y-4">
                    {analysis.criticalMoments.map((moment, i) => (
                      <div key={i} className="relative pl-8 pb-4 last:pb-0">
                        {i < analysis.criticalMoments.length - 1 && (<div className="absolute left-[11px] top-8 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 to-transparent" />)}
                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-indigo-500" /></div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={moment.impact > 0 ? 'success' : 'danger'}>{moment.impact > 0 ? '+' : ''}{moment.impact} leverage</Badge>
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
            )}

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
                    {analysis.greenLights.length === 0 ? (
                      <div className="p-4 bg-white/[0.02] rounded-lg text-center text-sm text-zinc-500">No strong positive signals detected yet</div>
                    ) : (
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
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-medium text-red-400">Watch Points ({analysis.redFlags.length})</span>
                    </div>
                    {analysis.redFlags.length === 0 ? (
                      <div className="p-6 bg-white/[0.02] rounded-lg text-center">
                        <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm text-zinc-400">No warning signals detected</p>
                        <p className="text-xs text-zinc-600">Communication appears healthy</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {analysis.redFlags.map((f, i) => (
                          <div key={i} className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-red-400">{f.signal}</span>
                              <Badge variant="danger">{f.weight}</Badge>
                            </div>
                            <p className="text-xs text-zinc-500">"{f.message}"</p>
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
              <SectionHeader icon={Clock} title="Optimal Timing" section="timing" />
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
              <SectionHeader icon={MessageSquare} title="Suggested Responses" section="composer" />
              {expandedSections.composer && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {messageVariants.map((v, i) => (
                      <button key={i} onClick={() => { setSelectedVariant(i); setShowMoveTree(false); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedVariant === i ? 'bg-indigo-500 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
                        {v.type}
                      </button>
                    ))}
                  </div>
                  {messageVariants[selectedVariant] && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant={messageVariants[selectedVariant].risk === 'Low' || messageVariants[selectedVariant].risk === 'Very Low' ? 'success' : 'warning'}>Risk: {messageVariants[selectedVariant].risk}</Badge>
                        <Badge variant="info">Impact: {messageVariants[selectedVariant].impact}</Badge>
                      </div>
                      <div className="relative p-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/20 rounded-xl">
                        <p className="text-base text-white leading-relaxed pr-12">{messageVariants[selectedVariant].message}</p>
                        <button onClick={() => copyMessage(messageVariants[selectedVariant].message)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors">
                          {copied ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-zinc-500" />}
                        </button>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500 mb-3">Why this works</div>
                        <div className="space-y-2">
                          {messageVariants[selectedVariant].annotations.map((a, i) => (
                            <div key={i} className="flex gap-4 p-3 bg-white/[0.02] rounded-lg">
                              <div className="flex-shrink-0"><Badge variant="purple">{a.principle}</Badge></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white mb-1">"{a.phrase}"</p>
                                <p className="text-xs text-zinc-500">{a.explanation}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <button onClick={() => setShowMoveTree(!showMoveTree)} className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                          <GitBranch className="w-4 h-4" />
                          {showMoveTree ? 'Hide' : 'Show'} Expected Responses
                          <ChevronDown className={`w-4 h-4 transition-transform ${showMoveTree ? 'rotate-180' : ''}`} />
                        </button>
                        {showMoveTree && moveTree && (
                          <div className="mt-4 space-y-3">
                            {Object.entries(moveTree).map(([key, data]) => (
                              <div key={key} className={`p-4 rounded-lg border ${key === 'positive' ? 'bg-emerald-500/5 border-emerald-500/20' : key === 'neutral' ? 'bg-zinc-500/5 border-zinc-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-sm font-medium capitalize ${key === 'positive' ? 'text-emerald-400' : key === 'neutral' ? 'text-zinc-400' : 'text-red-400'}`}>{key} Response</span>
                                  <Badge variant={key === 'positive' ? 'success' : key === 'neutral' ? 'default' : 'danger'}>{data.probability}% likely</Badge>
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
              <button onClick={() => { setStep(1); setAnalysis(null); setMessages([]); setRawConversation(''); setUploadedImages([]); setInputMode('text'); }} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-zinc-400 transition-all">
                Analyze Another Conversation
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="relative border-t border-white/[0.04] mt-12">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-600">Strategic intelligence for high-stakes communication.</div>
          <div className="text-xs text-zinc-600">For personal strategic development. Use ethically.</div>
        </div>
      </footer>
    </div>
  );
}
