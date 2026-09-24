import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  Video,
  CheckCheck,
  Menu,
  Plus,
  ChevronDown,
  Mic,
  MicOff,
  Image as ImageIcon,
  Code,
  Globe,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { HERO_AVATAR } from '../data/portfolioData';
import carRainImg from '../assets/images/creatively_car_rain_1789854143893.jpg';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface IosChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  onOpenBooking?: () => void;
}

export const IosChatModal: React.FC<IosChatModalProps> = ({
  isOpen,
  onClose,
  initialTopic = '',
  onOpenBooking,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hey! 👋 I'm your Gemini AI creative co-pilot. What would you like to create or build today?",
      timestamp: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'Build' | 'Design' | 'Code' | 'Brand'>('Build');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialTopic && isOpen) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'user',
          text: `I'm interested in: ${initialTopic}`,
          timestamp: 'Just now',
        },
      ]);
      simulateReply(
        `Awesome! ${initialTopic} is a core specialty. Let me generate tailored blueprints and technical specs for your vision.`
      );
    }
  }, [initialTopic, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickBoxyPrompts = [
    {
      title: 'Build a landing page for my product',
      tag: 'Web & UI',
      prompt: 'Build a high-converting landing page with modern dark aesthetics and fast performance',
    },
    {
      title: 'Multimodal Packaging Design',
      tag: '3D Materials',
      prompt: 'Synthesize custom sustainable packaging with 3D tactile renders and dielines',
    },
    {
      title: 'Synthesize Cyberpunk Streetwear',
      tag: 'Visual Identity',
      prompt: 'Generate an autonomous streetwear apparel identity with vector graphics & logos',
    },
    {
      title: 'Schedule 1-on-1 AI Strategy Call',
      tag: 'Consultation',
      prompt: 'Schedule an AI strategy consultation call to plan our upcoming project launch',
    },
  ];

  const simulateReply = (replyText: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1100);
  };

  const handleSend = (customText?: string) => {
    const textToSend = (customText || inputValue).trim();
    if (!textToSend) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputValue('');
    setIsPlusMenuOpen(false);
    setIsModeMenuOpen(false);

    const lower = textToSend.toLowerCase();

    if (
      lower.includes('call') ||
      lower.includes('schedule') ||
      lower.includes('meet') ||
      lower.includes('strategy')
    ) {
      simulateReply(
        "I'd love to collaborate! Opening the calendar scheduler now so you can book a 1-on-1 private slot."
      );
      if (onOpenBooking) {
        setTimeout(() => {
          onOpenBooking();
        }, 1400);
      }
    } else if (lower.includes('landing') || lower.includes('web') || lower.includes('build')) {
      simulateReply(
        "Initiating blueprint for your landing page! Scaffolding responsive hero viewport, dynamic micro-interactions, dark obsidian visual accents, and full TypeScript architecture. Tell me your brand name or target audience!"
      );
    } else if (lower.includes('brand') || lower.includes('logo') || lower.includes('identity')) {
      simulateReply(
        "Synthesizing vector brand marks, typographic hierarchies, color scales, and spatial guidelines in high-velocity generative sprints. What visual tone resonates best?"
      );
    } else if (lower.includes('package') || lower.includes('packaging')) {
      simulateReply(
        "Packaging engine activated! Formulating structural dielines, matte-embossed foil coatings, and photorealistic 3D spatial renders."
      );
    } else {
      simulateReply(
        `Understood under ${selectedMode} mode! Processing prompt and structuring the ideal creative pipeline. Ready for your next specification.`
      );
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setInputValue('Build a landing page for my new AI startup...');
      }, 2200);
    } else {
      setIsRecording(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'ai',
        text: "Workspace cleared! How can I assist your next creative milestone?",
        timestamp: 'Just now',
      },
    ]);
    setIsDrawerOpen(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Cinematic Creative Studio Chat Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 25 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full sm:max-w-4xl lg:max-w-5xl h-full sm:h-[92vh] max-h-[900px] bg-[#07070a] sm:rounded-[36px] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.95)] z-10 flex flex-col border border-white/15"
        >
          {/* Full Cinematic Visual Background: Rainy Autumn Road & Covered Sports Car */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <img
              src={carRainImg}
              alt="Cinematic Rainy Road & Car"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            {/* Gradient Overlays for perfect legibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#07070a]/70 via-[#07070a]/45 to-[#07070a]/90" />
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/95 via-black/70 to-transparent" />
          </div>

          {/* Top Bar with Three Lines Menu on One Side (as requested) */}
          <div className="relative z-20 px-4 sm:px-6 py-4 flex items-center justify-between">
            {/* THREE LINES MENU BUTTON on the left side */}
            <div className="flex items-center gap-3">
              <button
                id="chat-three-lines-menu-btn"
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                title="Workspace Menu"
                className="w-10 h-10 rounded-xl bg-black/40 hover:bg-black/60 text-white/90 hover:text-white flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/20 shadow-md backdrop-blur-md active:scale-95"
              >
                {/* 3 distinct sleek horizontal lines */}
                <span className="w-5 h-[2px] bg-white rounded-full transition-transform" />
                <span className="w-5 h-[2px] bg-white rounded-full transition-transform" />
                <span className="w-5 h-[2px] bg-white rounded-full transition-transform" />
              </button>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono text-zinc-300">Gemini 3.0 Pro</span>
              </div>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-2">
              {onOpenBooking && (
                <button
                  onClick={onOpenBooking}
                  title="Schedule AI Consultation"
                  className="w-10 h-10 rounded-xl bg-black/40 hover:bg-black/60 text-white/90 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 shadow-md backdrop-blur-md active:scale-95"
                >
                  <Video size={18} />
                </button>
              )}
              <button
                onClick={onClose}
                title="Close Window"
                className="w-10 h-10 rounded-xl bg-black/40 hover:bg-black/60 text-white/90 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 shadow-md backdrop-blur-md active:scale-95"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Slide-out Menu Drawer */}
          <AnimatePresence>
            {isDrawerOpen && (
              <motion.div
                initial={{ opacity: 0, x: -300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                className="absolute top-0 bottom-0 left-0 w-72 sm:w-80 bg-[#09090f]/95 backdrop-blur-2xl border-r border-white/15 z-30 p-6 flex flex-col justify-between shadow-2xl"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <span className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                      Studio Directives
                    </span>
                    <button
                      onClick={() => setIsDrawerOpen(false)}
                      className="text-zinc-400 hover:text-white p-1 rounded-lg"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Mode selector */}
                  <div>
                    <label className="text-[11px] text-zinc-400 uppercase font-mono tracking-wider mb-2 block">
                      Execution Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Build', 'Design', 'Code', 'Brand'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => {
                            setSelectedMode(m);
                            setIsDrawerOpen(false);
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                            selectedMode === m
                              ? 'bg-[#f41151] text-white shadow-[0_0_15px_rgba(244,17,81,0.5)]'
                              : 'bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1] border border-white/5'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <label className="text-[11px] text-zinc-400 uppercase font-mono tracking-wider mb-2 block">
                      Quick Generators
                    </label>
                    <button
                      onClick={() => {
                        handleSend('Build a high-performance modern web application');
                        setIsDrawerOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-zinc-200 hover:text-white hover:bg-white/[0.08] flex items-center gap-3 transition-all border border-transparent hover:border-white/10"
                    >
                      <Zap size={15} className="text-[#f41151]" />
                      <span>New Web Application</span>
                    </button>
                    <button
                      onClick={() => {
                        handleSend('Synthesize high-end tactile packaging specifications');
                        setIsDrawerOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-zinc-200 hover:text-white hover:bg-white/[0.08] flex items-center gap-3 transition-all border border-transparent hover:border-white/10"
                    >
                      <Sparkles size={15} className="text-[#f41151]" />
                      <span>New Packaging System</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={clearChat}
                    className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-red-500/20 text-zinc-400 hover:text-red-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/5"
                  >
                    <RotateCcw size={14} />
                    <span>Clear Conversation</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <div className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-8 flex flex-col justify-between pb-4">
            {/* Top Identity: THINK CREATIVELY & Avatar with "Irtza" */}
            <div className="text-center pt-2 sm:pt-4 select-none">
              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)]"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                THINK
              </h1>

              {/* Red Line + CREATIVELY + Red Line */}
              <div className="flex items-center justify-center gap-3 sm:gap-5 my-1 sm:my-1.5">
                <div className="h-[2px] sm:h-[3px] w-12 sm:w-20 bg-[#f41151] rounded-full shadow-[0_0_10px_#f41151]" />
                <span
                  className="text-3xl sm:text-4xl md:text-5xl font-black tracking-wider text-[#f41151] uppercase drop-shadow-[0_0_25px_rgba(244,17,81,0.6)]"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  CREATIVELY
                </span>
                <div className="h-[2px] sm:h-[3px] w-12 sm:w-20 bg-[#f41151] rounded-full shadow-[0_0_10px_#f41151]" />
              </div>

              {/* Avatar + Script Name "Irtza" */}
              <div className="inline-flex flex-col items-center mt-2 relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#f41151] via-purple-600 to-amber-500 p-[2px] shadow-[0_0_30px_rgba(244,17,81,0.5)]">
                  <div className="w-full h-full rounded-full bg-[#101018] overflow-hidden flex items-center justify-center">
                    <img
                      src={HERO_AVATAR}
                      alt="Irtza Avatar"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                <span
                  className="mt-1 text-base sm:text-lg font-bold text-zinc-100 tracking-wide italic"
                  style={{ fontFamily: "'Brush Script MT', 'Dancing Script', 'Caveat', cursive, sans-serif" }}
                >
                  Irtza
                </span>
              </div>
            </div>

            {/* Conversation Messages Display (Always showing on top!) */}
            <div className="flex-1 my-4 overflow-y-auto space-y-3.5 max-h-[300px] px-2 sm:px-6">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] sm:max-w-[78%] px-4 sm:px-5 py-3 rounded-2xl text-sm sm:text-base leading-relaxed ${
                        isUser
                          ? 'bg-gradient-to-r from-[#f41151] to-[#ff2a6d] text-white rounded-br-sm shadow-[0_6px_25px_rgba(244,17,81,0.4)] font-medium'
                          : 'bg-black/75 backdrop-blur-xl text-zinc-100 rounded-bl-sm border border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.8)]'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-400 px-1 font-mono">
                      <span>{msg.timestamp}</span>
                      {isUser && <CheckCheck size={13} className="text-[#f41151]" />}
                    </div>
                  </motion.div>
                );
              })}

              {/* Real-time typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm bg-black/75 backdrop-blur-xl border border-white/20 w-fit"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-[#f41151] animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-[#f41151] animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-[#f41151] animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Boxy Directives (Clickable Prompt Chips) */}
            <div className="mb-3 px-1">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {quickBoxyPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(item.prompt)}
                    className="whitespace-nowrap px-3.5 py-1.5 rounded-xl bg-black/50 hover:bg-black/80 backdrop-blur-md text-xs text-zinc-200 hover:text-white border border-white/15 hover:border-[#f41151]/60 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(244,17,81,0.3)] shrink-0 flex items-center gap-1.5"
                  >
                    <span className="text-[#f41151] font-semibold">{item.tag}:</span>
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Boxy Prompt Input (Matches Image 1 & 2 Exactly) */}
            <div className="w-full max-w-2xl mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="relative"
              >
                {/* Boxy Card Container */}
                <div className="relative rounded-2xl sm:rounded-[22px] bg-white text-zinc-900 px-4 pt-3.5 pb-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_35px_rgba(244,17,81,0.3)] border border-white/90">
                  {/* Top Text Input */}
                  <input
                    type="text"
                    placeholder="Build a landing page for my..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-transparent text-zinc-900 text-sm sm:text-base font-medium placeholder:text-zinc-500 focus:outline-none pb-2"
                  />

                  {/* Bottom Action Row: Plus on Left, Build Mode, Voice Mic & Send on Right */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-zinc-200">
                    {/* Plus Icon with context menu */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                        className="w-8 h-8 rounded-lg hover:bg-zinc-100 active:scale-95 text-zinc-800 flex items-center justify-center transition-all cursor-pointer"
                        title="Add context / attachments"
                      >
                        <Plus size={20} />
                      </button>

                      <AnimatePresence>
                        {isPlusMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-11 left-0 w-52 bg-[#12121a] text-white rounded-xl shadow-2xl border border-white/15 p-2 z-40 space-y-1"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setInputValue((prev) => prev + ' [Attached reference image]');
                                setIsPlusMenuOpen(false);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-white/10 flex items-center gap-2"
                            >
                              <ImageIcon size={14} className="text-[#f41151]" />
                              <span>Attach Reference Image</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setInputValue((prev) => prev + ' [Attached code]');
                                setIsPlusMenuOpen(false);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-white/10 flex items-center gap-2"
                            >
                              <Code size={14} className="text-emerald-400" />
                              <span>Insert Code Snippet</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setInputValue((prev) => prev + ' [Web search]');
                                setIsPlusMenuOpen(false);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-white/10 flex items-center gap-2"
                            >
                              <Globe size={14} className="text-blue-400" />
                              <span>Search Web Grounding</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Right Controls: Mode Selector ("Build ˅"), Mic, and Send */}
                    <div className="flex items-center gap-2">
                      {/* Mode dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
                          className="px-3 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-800 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-300/80"
                        >
                          <span>{selectedMode}</span>
                          <ChevronDown size={14} className="text-zinc-600" />
                        </button>

                        <AnimatePresence>
                          {isModeMenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute bottom-11 right-0 w-36 bg-[#12121a] text-white rounded-xl shadow-2xl border border-white/15 p-1.5 z-40 space-y-1"
                            >
                              {(['Build', 'Design', 'Code', 'Brand'] as const).map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => {
                                    setSelectedMode(m);
                                    setIsModeMenuOpen(false);
                                  }}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                                    selectedMode === m
                                      ? 'bg-[#f41151] text-white'
                                      : 'text-zinc-300 hover:bg-white/10'
                                  }`}
                                >
                                  <span>{m}</span>
                                  {selectedMode === m && <CheckCheck size={12} />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Microphone voice button */}
                      <button
                        type="button"
                        onClick={toggleRecording}
                        title={isRecording ? 'Listening...' : 'Voice Input'}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          isRecording
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                      </button>

                      {/* Send button */}
                      <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className={`h-8 px-3 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          inputValue.trim()
                            ? 'bg-[#f41151] hover:bg-[#ff1e5d] text-white shadow-md shadow-[#f41151]/30 active:scale-95'
                            : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                        }`}
                      >
                        <Send size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
