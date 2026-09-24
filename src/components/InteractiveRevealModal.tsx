import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  ChevronDown,
  Mic,
  MicOff,
  ArrowUp,
  Image as ImageIcon,
  Code,
  Globe,
  MessageSquare,
  LayoutGrid,
  Folder,
  ChevronRight,
  ArrowLeft,
  User as UserIcon,
  X,
  Paperclip,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HERO_AVATAR } from '../data/portfolioData';
import defaultVisibleImg from '../assets/images/back_reveal.png';
import revealedUnderneathImg from '../assets/images/front_overlay.jpg';
import { FullScreenChatView, SttSoundBar } from './FullScreenChatView';
import { AttachedFile } from '../types';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface InteractiveRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking?: () => void;
  initialTopic?: string;
}

export const InteractiveRevealModal: React.FC<InteractiveRevealModalProps> = ({
  isOpen,
  onClose,
  initialTopic = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Chat & Prompt States
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'Build' | 'Design' | 'Code' | 'Brand'>('Build');
  const [isRecording, setIsRecording] = useState(false);
  const [activeRecentItem, setActiveRecentItem] = useState('Landing Page Design');
  const [showResponsePopup, setShowResponsePopup] = useState(false);
  const [isFullScreenChatOpen, setIsFullScreenChatOpen] = useState(false);
  const [currentFullScreenPrompt, setCurrentFullScreenPrompt] = useState('');
  const [currentFullScreenAttachments, setCurrentFullScreenAttachments] = useState<AttachedFile[]>([]);

  // Working File Attachments (Matches exact screenshot styling, Max 10 files)
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [fileLimitError, setFileLimitError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Microphone and Speech-to-Text Support with Live Transcription
  const [micStatusMsg, setMicStatusMsg] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);
  const micBaseInputRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);

  const showMicToast = (msg: string) => {
    setMicStatusMsg(msg);
    setTimeout(() => setMicStatusMsg(null), 3000);
  };

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;

    if (attachments.length >= 10) {
      setFileLimitError('Max 10 files can be attached.');
      setTimeout(() => setFileLimitError(null), 3500);
      return;
    }

    const availableSlots = 10 - attachments.length;
    const filesToAttach = fileArray.slice(0, availableSlots);

    if (fileArray.length > availableSlots) {
      setFileLimitError(`Max 10 files limit reached. Added ${availableSlots} file(s).`);
      setTimeout(() => setFileLimitError(null), 3500);
    }

    filesToAttach.forEach((file) => {
      const isImg = file.type.startsWith('image/');
      const newAttachment: AttachedFile = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        isImage: isImg,
        preview: isImg ? URL.createObjectURL(file) : undefined,
      };
      setAttachments((prev) => [...prev, newAttachment]);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  // Spotlight Lerp Radius Calculation
  const getAdaptiveRadius = useCallback((): number => {
    if (typeof window === 'undefined') return 140;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const minDim = Math.min(w, h);

    if (w < 640) return Math.round(Math.max(75, Math.min(minDim * 0.22, 95)));
    if (w < 1024) return Math.round(Math.max(120, Math.min(minDim * 0.18, 150)));
    if (w < 1536) return Math.round(Math.max(170, Math.min(minDim * 0.2, 210)));
    return Math.round(Math.max(220, Math.min(minDim * 0.22, 280)));
  }, []);

  const targetPos = useRef<{ x: number; y: number }>({ x: -500, y: -500 });
  const currentPos = useRef<{ x: number; y: number }>({ x: -500, y: -500 });
  const [renderPos, setRenderPos] = useState<{ x: number; y: number }>({ x: -500, y: -500 });

  const targetRadius = useRef<number>(0);
  const currentRadius = useRef<number>(0);
  const [renderRadius, setRenderRadius] = useState<number>(0);

  const targetOpacity = useRef<number>(0);
  const currentOpacity = useRef<number>(0);
  const [renderOpacity, setRenderOpacity] = useState<number>(0);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isDrawerOpen) {
          setIsDrawerOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDrawerOpen, onClose]);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      targetRadius.current = 0;
      currentRadius.current = 0;
      targetOpacity.current = 0;
      currentOpacity.current = 0;
      setRenderRadius(0);
      setRenderOpacity(0);
      if (initialTopic) {
        setInputValue(initialTopic);
      }
    }
  }, [isOpen, initialTopic]);

  // Smooth animation loop
  useEffect(() => {
    if (!isOpen) return;
    let animId: number;

    const smoothLoop = () => {
      const dx = targetPos.current.x - currentPos.current.x;
      const dy = targetPos.current.y - currentPos.current.y;
      currentPos.current.x += dx * 0.16;
      currentPos.current.y += dy * 0.16;

      currentRadius.current += (targetRadius.current - currentRadius.current) * 0.15;
      currentOpacity.current += (targetOpacity.current - currentOpacity.current) * 0.15;

      const safeOpacity = currentOpacity.current < 0.005 ? 0 : currentOpacity.current;
      const safeRadius = currentRadius.current < 0.5 ? 0 : currentRadius.current;

      setRenderPos({
        x: currentPos.current.x,
        y: currentPos.current.y,
      });
      setRenderRadius(safeRadius);
      setRenderOpacity(safeOpacity);

      animId = requestAnimationFrame(smoothLoop);
    };

    animId = requestAnimationFrame(smoothLoop);
    return () => cancelAnimationFrame(animId);
  }, [isOpen]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      targetRadius.current = getAdaptiveRadius();
      targetOpacity.current = 1;
    },
    [getAdaptiveRadius]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      currentPos.current = { x: e.clientX, y: e.clientY };
      targetRadius.current = getAdaptiveRadius();
      targetOpacity.current = 1;
    },
    [getAdaptiveRadius]
  );

  const handleMouseLeave = useCallback(() => {
    targetRadius.current = 0;
    targetOpacity.current = 0;
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0];
      if (touch) {
        targetPos.current = { x: touch.clientX, y: touch.clientY };
        currentPos.current = { x: touch.clientX, y: touch.clientY };
        targetRadius.current = getAdaptiveRadius();
        targetOpacity.current = 1;
      }
    },
    [getAdaptiveRadius]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0];
      if (touch) {
        targetPos.current = { x: touch.clientX, y: touch.clientY };
        targetRadius.current = getAdaptiveRadius();
        targetOpacity.current = 1;
      }
    },
    [getAdaptiveRadius]
  );

  const handleTouchEnd = useCallback(() => {
    targetRadius.current = 0;
    targetOpacity.current = 0;
  }, []);

  const handleTouchCancel = useCallback(() => {
    targetRadius.current = 0;
    targetOpacity.current = 0;
  }, []);

  // Send action - Opens full screen chat view with prompt and attachments
  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text && attachments.length === 0) return;

    const promptText = text || (attachments[0] ? `Analyze ${attachments[0].name}` : 'File analysis request');

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setCurrentFullScreenPrompt(promptText);
    setCurrentFullScreenAttachments([...attachments]);
    setInputValue('');
    setAttachments([]); // Clean up already attached files
    setIsPlusMenuOpen(false);
    setIsModeMenuOpen(false);
    setIsFullScreenChatOpen(true);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      isRecordingRef.current = false;
      setIsRecording(false);
      showMicToast('Microphone stopped');
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
        speechRecognitionRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
      return;
    }

    isRecordingRef.current = true;
    setIsRecording(true);
    // Capture starting text in input box
    micBaseInputRef.current = inputValue;
    showMicToast('Listening... Speak now (Live transcription active)');

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    let startedSpeechRecognition = false;

    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = navigator.language || 'en-US';

        recognition.onresult = (event: any) => {
          let interim = '';
          let finalChunk = '';
          for (let i = 0; i < event.results.length; ++i) {
            const res = event.results[i];
            if (res.isFinal) {
              finalChunk += (finalChunk ? ' ' : '') + res[0].transcript.trim();
            } else {
              interim += (interim ? ' ' : '') + res[0].transcript.trim();
            }
          }
          const base = micBaseInputRef.current;
          const liveCombined = [base, finalChunk, interim].filter(Boolean).join(' ');
          setInputValue(liveCombined);
        };

        recognition.onerror = (e: any) => {
          console.warn('SpeechRecognition error:', e?.error);
          if (e?.error === 'not-allowed') {
            isRecordingRef.current = false;
            setIsRecording(false);
            showMicToast('Microphone access denied');
          }
        };

        recognition.onend = () => {
          if (isRecordingRef.current) {
            try {
              recognition.start();
            } catch {}
          }
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
        startedSpeechRecognition = true;
      } catch (recErr) {
        console.warn('SpeechRecognition failed, falling back to MediaRecorder:', recErr);
      }
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (audioBlob.size < 50) return;

          // If SpeechRecognition didn't produce text, fallback to /api/stt
          if (!startedSpeechRecognition || inputValue === micBaseInputRef.current) {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Audio = reader.result as string;
              try {
                showMicToast('Transcribing audio...');
                const sttRes = await fetch('/api/stt', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ audio: base64Audio, mimeType: 'audio/webm' }),
                });
                const sttData = await sttRes.json();
                if (sttData.text && sttData.text.trim()) {
                  setInputValue((prev) => (prev ? `${prev} ${sttData.text.trim()}` : sttData.text.trim()));
                  showMicToast('Transcribed speech');
                }
              } catch (sttErr) {
                console.warn('STT transcription error:', sttErr);
              }
            };
          }
        };

        mediaRecorder.start(250);
        mediaRecorderRef.current = mediaRecorder;
      }
    } catch (err: any) {
      if (!startedSpeechRecognition) {
        console.warn('Microphone permission error:', err);
        isRecordingRef.current = false;
        setIsRecording(false);
        showMicToast('Microphone permission denied or unavailable');
      }
    }
  };

  const handleNewChat = () => {
    setInputValue('');
    setShowResponsePopup(false);
    setIsDrawerOpen(false);
    setCurrentFullScreenPrompt('');
    setActiveRecentItem('Landing Page Design');
    setIsFullScreenChatOpen(true);
  };

  const handleSelectRecent = (title: string) => {
    setActiveRecentItem(title);
    setCurrentFullScreenPrompt('');
    setIsDrawerOpen(false);
    setIsFullScreenChatOpen(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed inset-0 z-[9999] bg-black select-none overflow-hidden touch-none"
      >
        {/* Interactive Dual-Layer Reveal Canvas (Active across the whole screen) */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          className="absolute inset-0 w-full h-full cursor-none overflow-hidden bg-black z-0"
        >
          {/* Base Layer: Front Visible Image */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            <img
              src={defaultVisibleImg}
              alt="Base layer"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Underneath Revealed Image (revealed through spotlight mask) */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-150"
            style={{
              opacity: renderOpacity,
              maskImage:
                renderRadius > 0
                  ? `radial-gradient(circle ${renderRadius}px at ${renderPos.x}px ${renderPos.y}px, black 65%, transparent 100%)`
                  : 'none',
              WebkitMaskImage:
                renderRadius > 0
                  ? `radial-gradient(circle ${renderRadius}px at ${renderPos.x}px ${renderPos.y}px, black 65%, transparent 100%)`
                  : 'none',
            }}
          >
            <img
              src={revealedUnderneathImg}
              alt="Revealed underneath layer"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Vignette Gradients for optical balance and text contrast */}
          <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-black/80 via-black/35 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-black/75 to-transparent pointer-events-none" />
        </div>

        {/* TOP CORNER: Three Lines Menu Button ONLY (No back arrow, cross, or camera icon) */}
        <div className="absolute top-5 sm:top-6 left-5 sm:left-6 z-40 pointer-events-auto">
          <button
            id="reveal-three-lines-menu-btn"
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open Menu"
            title="Open Menu"
            className="w-11 h-11 rounded-2xl bg-black/40 hover:bg-black/70 text-white flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/20 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.6)] active:scale-95 group"
          >
            <span className="w-5 h-[2px] bg-white rounded-full transition-all group-hover:w-6" />
            <span className="w-5 h-[2px] bg-white rounded-full transition-all group-hover:w-4" />
            <span className="w-5 h-[2px] bg-white rounded-full transition-all group-hover:w-6" />
          </button>
        </div>

        {/* UPPER SECTION: Exact Hero Section Typography (THINK CREATIVE with Overlapping 3D Avatar) + Prompt Box */}
        <div className="absolute top-2 sm:top-4 md:top-6 left-0 right-0 z-30 px-4 flex flex-col items-center pointer-events-none">
          {/* Typography & Overlapping 3D Avatar (Exact HeroSection Style) */}
          <div className="relative flex flex-col items-center justify-center select-none text-center mb-3 sm:mb-4">
            {/* First word: THINK (White uppercase) */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.88] text-white uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              THINK
            </motion.h1>

            {/* Second row: CREATIVE with overlapping 3D Character Avatar */}
            <div className="relative w-full flex items-center justify-center -mt-1.5 xs:-mt-2 sm:-mt-3 md:-mt-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.88] text-[#f41151] uppercase flex items-center justify-center w-full drop-shadow-[0_15px_35px_rgba(244,17,81,0.4)]"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                CREATIVE
              </motion.div>

              {/* 3D Cutout Avatar - Floating right over the center of typography exactly like HeroSection */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[48%] z-20 pointer-events-auto"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                  className="relative group cursor-pointer select-none"
                >
                  {/* Crimson backlight glow behind character cutout */}
                  <div className="absolute inset-0 bg-[#f41151]/30 blur-2xl rounded-full transform scale-90 pointer-events-none" />

                  <img
                    src={HERO_AVATAR}
                    alt="Irtza 3D Cutout Character Avatar"
                    className="w-20 xs:w-24 sm:w-32 md:w-40 lg:w-48 max-w-none h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)] drop-shadow-[0_0_30px_rgba(244,17,81,0.4)] transform group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* THE PROMPT BOX (Matches User's Provided Image Exactly, Placed directly above BMW) */}
          <div className="w-full max-w-[560px] pointer-events-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative"
            >
              {/* Hidden File Input (Max 10 files) */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="*/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    processFiles(e.target.files);
                    e.target.value = '';
                  }
                }}
                className="hidden"
              />

              {/* Dynamic Sound Bar Waveform or Rounded card container matching Screenshot_20260920-021407.png */}
              <AnimatePresence mode="wait">
                {isRecording ? (
                  <SttSoundBar
                    key="stt-sound-bar-modal"
                    isTranscribing={false}
                    onCancel={() => {
                      if (isRecording) toggleRecording();
                      showMicToast('Recording cancelled');
                    }}
                    onConfirm={() => {
                      if (isRecording) toggleRecording();
                      showMicToast('Voice input captured');
                    }}
                    onAttach={() => fileInputRef.current?.click()}
                  />
                ) : (
                  <div
                    key="regular-prompt-box-modal"
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(true);
                    }}
                    onDragLeave={() => setIsDraggingOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        processFiles(e.dataTransfer.files);
                      }
                    }}
                    className={`relative rounded-[28px] sm:rounded-[32px] bg-[#f8f9fc]/95 backdrop-blur-xl text-zinc-900 px-5 pt-4 pb-3 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(244,17,81,0.15)] border transition-all ${
                      isDraggingOver
                        ? 'border-[#ff1828] bg-white ring-2 ring-[#ff1828]/30'
                        : 'border-white/90'
                    }`}
                  >
                    {/* Live Speech Recognition Pill */}
                    {isRecording && (
                      <div className="flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-red-50 border border-[#ff1828]/25 text-[#ff1828] text-xs font-semibold w-fit">
                        <span className="w-2 h-2 rounded-full bg-[#ff1828] animate-ping" />
                        <span>Live Listening... Jo aap bolenge sath sath yahan type hoga</span>
                      </div>
                    )}

                    {/* Input Text Area */}
                    <input
                      type="text"
                      placeholder={isRecording ? "Bolna shuru kijiye..." : "Build a landing page for my..."}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full bg-transparent text-zinc-800 text-sm sm:text-base font-normal placeholder:text-zinc-400 focus:outline-none pb-2.5 tracking-wide"
                    />

                    {/* Attached Files Strip (Matches User Requirement: only image shown for images, no name pill) */}
                    {attachments.length > 0 && (
                      <div className="flex items-center gap-2.5 overflow-x-auto py-2 px-0.5 no-scrollbar max-w-full">
                        {attachments.map((file) => (
                          <div key={file.id} className="relative shrink-0 group">
                            {file.isImage && file.preview ? (
                              /* ONLY image thumbnail is shown with sleek remove button */
                              <div className="relative w-[84px] h-[56px] sm:w-[94px] sm:h-[62px] rounded-2xl overflow-hidden border border-zinc-300 shadow-md bg-zinc-900 shrink-0 select-none">
                                <img
                                  src={file.preview}
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                />
                                {/* Sleek top-right remove button on image */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeAttachment(file.id);
                                  }}
                                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/75 hover:bg-[#ff1828] text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-90"
                                  title={`Remove ${file.name}`}
                                  aria-label={`Remove ${file.name}`}
                                >
                                  <X size={11} strokeWidth={2.5} />
                                </button>
                              </div>
                            ) : (
                              /* Non-image files show standard pill */
                              <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.06)] rounded-full px-3.5 py-1.5 text-xs sm:text-sm text-zinc-800 font-medium shrink-0 select-none">
                                <Paperclip size={14} className="text-zinc-600 shrink-0 rotate-[-45deg]" />
                                <span className="max-w-[130px] sm:max-w-[170px] truncate" title={file.name}>
                                  {file.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeAttachment(file.id)}
                                  className="w-4 h-4 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-800 transition-colors ml-0.5 cursor-pointer active:scale-90"
                                  title={`Remove ${file.name}`}
                                  aria-label={`Remove ${file.name}`}
                                >
                                  <X size={12} strokeWidth={2.5} />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Counter Badge if multiple attachments */}
                        {attachments.length > 1 && (
                          <span className="text-[11px] font-semibold text-zinc-400 px-1 shrink-0 select-none">
                            {attachments.length}/10
                          </span>
                        )}
                      </div>
                    )}

                    {/* Error Banner when Max 10 Files Exceeded */}
                    <AnimatePresence>
                      {fileLimitError && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-xs text-[#ff1828] font-medium px-1 py-1"
                        >
                          {fileLimitError}
                        </motion.div>
                      )}
                      {micStatusMsg && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-xs text-zinc-600 font-medium px-1 py-0.5 flex items-center gap-1.5"
                        >
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          {micStatusMsg}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Bottom Row: + on Left, Build ˅ on Right with Unified Arrow / Mic Button */}
                    <div className="flex items-center justify-between pt-1">
                      {/* Plus Icon (+) - Triggers Working File Upload (Max 10) */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-8 h-8 rounded-full hover:bg-zinc-200/70 text-zinc-800 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                          title="Attach files (Max 10)"
                          aria-label="Attach files (Max 10)"
                        >
                          <Plus size={22} strokeWidth={2} />
                        </button>
                      </div>

                      {/* Right side: Build ˅ dropdown AND Single Unified Arrow/Mic button */}
                      <div className="flex items-center gap-3 sm:gap-4">
                        {/* Build ˅ Dropdown */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
                            className="flex items-center gap-1.5 text-zinc-800 text-sm sm:text-base font-normal hover:opacity-75 transition-all cursor-pointer active:scale-95"
                          >
                            <span>{selectedMode}</span>
                            <ChevronDown size={17} strokeWidth={2.2} className="text-zinc-700 mt-0.5" />
                          </button>

                          {/* Mode Popup */}
                          <AnimatePresence>
                            {isModeMenuOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute bottom-11 right-0 w-36 bg-[#12121a] text-white rounded-2xl shadow-2xl border border-white/15 p-1.5 z-50 space-y-1"
                              >
                                {(['Build', 'Design', 'Code', 'Brand'] as const).map((m) => (
                                  <button
                                    key={m}
                                    type="button"
                                    onClick={() => {
                                      setSelectedMode(m);
                                      setIsModeMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                                      selectedMode === m
                                        ? 'bg-[#f41151] text-white'
                                        : 'text-zinc-300 hover:bg-white/10'
                                    }`}
                                  >
                                    <span>{m}</span>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* UNIFIED BUTTON: When user types or has files, converts into Arrow; otherwise Mic */}
                        {inputValue.trim().length > 0 || attachments.length > 0 ? (
                          /* ARROW ICON BUTTON */
                          <motion.button
                            key="send-arrow-btn"
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.7, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            type="submit"
                            aria-label="Send Prompt"
                            title="Send Prompt"
                            className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-black text-white flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer"
                          >
                            <ArrowUp size={18} strokeWidth={2.6} />
                          </motion.button>
                        ) : (
                          /* MIC ICON BUTTON (When not typing) */
                          <motion.button
                            key="mic-voice-btn"
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.7, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            type="button"
                            onClick={toggleRecording}
                            aria-label={isRecording ? 'Listening...' : 'Voice Input'}
                            title={isRecording ? 'Listening...' : 'Voice Input'}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                              isRecording
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'text-zinc-800 hover:bg-zinc-200/70'
                            }`}
                          >
                            {isRecording ? (
                              <MicOff size={19} strokeWidth={2.2} />
                            ) : (
                              <Mic size={20} strokeWidth={2.2} />
                            )}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Quick Floating Chat Response Bubble (If prompt was submitted) */}
          <AnimatePresence>
            {showResponsePopup && messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                className="w-full max-w-[560px] mt-3 pointer-events-auto"
              >
                <div className="rounded-2xl bg-black/85 backdrop-blur-2xl border border-red-500/30 p-4 shadow-[0_15px_40px_rgba(0,0,0,0.85)] text-white text-xs sm:text-sm space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pb-1 border-b border-white/10">
                    <span className="text-[#f41151] font-semibold">Gemini 3.0 Blueprint</span>
                    <button
                      onClick={() => setShowResponsePopup(false)}
                      className="hover:text-white p-0.5 rounded cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {messages.slice(-2).map((m) => (
                    <div
                      key={m.id}
                      className={`p-2.5 rounded-xl ${
                        m.sender === 'user'
                          ? 'bg-[#f41151]/20 border border-[#f41151]/40 text-right text-white'
                          : 'bg-white/10 text-zinc-200'
                      }`}
                    >
                      {m.text}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex items-center gap-1.5 py-1 text-xs text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f41151] animate-ping" />
                      <span>Synthesizing specs...</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SIDEBAR MENU BAR (Matches Image 2 Exactly: Authentic BMW ///M Red Glowing Neon Cockpit) */}
        <AnimatePresence>
          {isDrawerOpen && (
            <>
              {/* Dim backdrop to close on outside click */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDrawerOpen(false)}
                className="absolute inset-0 bg-black/75 backdrop-blur-md z-50 pointer-events-auto flex items-center justify-start p-2 sm:p-6"
              >
                {/* Floating Card exactly like 818353585_2187346241811364_3188723849392091368_n.webp.jpg */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, x: -40 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: -40 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-[345px] sm:max-w-[365px] h-[92vh] max-h-[820px] bg-black rounded-[38px] border-2 border-[#ff1828] shadow-[0_0_40px_rgba(255,24,40,0.55),inset_0_0_25px_rgba(255,24,40,0.2)] p-6 flex flex-col justify-between overflow-hidden select-none"
                >
                  {/* Atmospheric subtle red smoky nebula background */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#ff1828]/15 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#ff1828]/15 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute top-1/2 right-0 w-32 h-32 bg-[#ff1828]/10 rounded-full blur-3xl pointer-events-none" />

                  {/* TOP FIXED SECTION: BMW ///M Logo + Navigation */}
                  <div className="shrink-0 space-y-4 relative z-10">
                    {/* TOP LOGO: Exact BMW ///M Logo from Reference Image */}
                    <div className="flex items-center justify-center pt-2 pb-1">
                      <div className="flex items-center gap-2 select-none">
                        {/* Three slanted /// stripes: Light Blue, Dark Navy, Crimson Red */}
                        <div className="flex items-center gap-1.5 -skew-x-[18deg]">
                          <span className="w-2.5 h-7 sm:w-3 sm:h-8 bg-[#0082CA] rounded-[1px] shadow-[0_0_12px_rgba(0,130,202,0.7)]" />
                          <span className="w-2.5 h-7 sm:w-3 sm:h-8 bg-[#17205a] rounded-[1px]" />
                          <span className="w-2.5 h-7 sm:w-3 sm:h-8 bg-[#E21B23] rounded-[1px] shadow-[0_0_16px_rgba(226,27,35,0.9)]" />
                        </div>
                        {/* Metallic Chrome Slanted M (clean without blurry drop shadow) */}
                        <span className="text-white text-3xl sm:text-4xl font-black italic tracking-tighter ml-1">
                          M
                        </span>
                      </div>
                    </div>

                    {/* + New Chat Pill Button */}
                    <button
                      type="button"
                      onClick={handleNewChat}
                      className="w-full py-3 px-4 rounded-[20px] bg-[#0c0204] border-[1.5px] border-[#ff1828] text-white font-medium text-[15px] flex items-center justify-between shadow-[0_0_18px_rgba(255,24,40,0.6)] hover:shadow-[0_0_26px_rgba(255,24,40,0.85)] transition-all cursor-pointer active:scale-98 group"
                    >
                      <div className="flex items-center gap-3">
                        <Plus size={19} className="text-white group-hover:rotate-90 transition-transform" />
                        <span className="text-white tracking-wide">New Chat</span>
                      </div>
                      <ChevronRight size={18} className="text-[#ff1828] font-bold group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    {/* Navigation List Items: Chat, Explore GPTs, Library */}
                    <div className="space-y-1.5 pt-0.5 text-[15px] font-normal text-white">
                      <button
                        type="button"
                        onClick={() => setIsDrawerOpen(false)}
                        className="w-full px-3 py-2 rounded-xl hover:bg-white/[0.06] text-left flex items-center gap-3.5 text-white transition-all cursor-pointer"
                      >
                        <MessageSquare size={19} strokeWidth={1.8} className="text-white" />
                        <span className="tracking-wide">Chat</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDrawerOpen(false)}
                        className="w-full px-3 py-2 rounded-xl hover:bg-white/[0.06] text-left flex items-center gap-3.5 text-zinc-300 hover:text-white transition-all cursor-pointer"
                      >
                        <LayoutGrid size={19} strokeWidth={1.8} className="text-zinc-400" />
                        <span className="tracking-wide">Explore GPTs</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDrawerOpen(false)}
                        className="w-full px-3 py-2 rounded-xl hover:bg-white/[0.06] text-left flex items-center gap-3.5 text-zinc-300 hover:text-white transition-all cursor-pointer"
                      >
                        <Folder size={19} strokeWidth={1.8} className="text-zinc-400" />
                        <span className="tracking-wide">Library</span>
                      </button>
                    </div>
                  </div>

                  {/* ONLY RECENT SECTION SCROLLABLE: Clean list without glowing highlight div */}
                  <div className="flex-1 min-h-0 flex flex-col pt-3 relative z-10">
                    <span className="text-[13px] font-normal text-zinc-500 px-3 tracking-wide mb-2 shrink-0">
                      Recent
                    </span>

                    {/* Scrollable list of recent items */}
                    <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 no-scrollbar">
                      {[
                        'Landing Page Design',
                        'Website Layout Ideas',
                        'UI/UX Best Practices',
                        'Tailwind CSS Guide',
                        'Product Marketing Plan',
                      ].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleSelectRecent(item)}
                          className="w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer hover:bg-white/[0.06] text-zinc-200 hover:text-white border border-transparent group"
                        >
                          <div className="flex items-center gap-3 truncate">
                            <MessageSquare size={17} strokeWidth={1.8} className="text-zinc-400 group-hover:text-white shrink-0" />
                            <span className="truncate text-[14px] text-white font-normal">{item}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BOTTOM ACTIONS: Back to Dashboard & User Profile Row (Fixed) */}
                  <div className="shrink-0 space-y-3 pt-3 relative z-10">
                    {/* Glowing Red Button: ← Back to Dashboard */}
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full py-2.5 px-4 rounded-[18px] bg-[#120205] border-[1.5px] border-[#ff1828] hover:border-red-400 text-white font-semibold text-[14px] flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(255,24,40,0.7)] hover:shadow-[0_0_28px_rgba(255,24,40,0.9)] transition-all cursor-pointer active:scale-98"
                    >
                      <ArrowLeft size={17} className="text-white" />
                      <span>Back to Dashboard</span>
                    </button>

                    {/* User Profile Row: Red Glowing User Avatar + Free Plan */}
                    <div className="flex items-center justify-between px-2 pt-1 select-none">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#120205] border-[1.5px] border-[#ff1828] flex items-center justify-center text-[#ff1828] shadow-[0_0_14px_rgba(255,24,40,0.8),inset_0_0_8px_rgba(255,24,40,0.4)]">
                          <UserIcon size={19} className="fill-[#ff1828] text-[#ff1828]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-semibold text-white leading-tight">User</span>
                          <span className="text-xs text-zinc-400">Free Plan</span>
                        </div>
                      </div>
                      <ChevronDown size={16} className="text-[#ff1828]" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* FULL SCREEN CHAT VIEW (Matches file_00000000b5f482119eb4dbb89d8067b4.png) */}
        <FullScreenChatView
          isOpen={isFullScreenChatOpen}
          onClose={() => setIsFullScreenChatOpen(false)}
          initialPrompt={currentFullScreenPrompt}
          initialAttachments={currentFullScreenAttachments}
          selectedRecentTopic={activeRecentItem}
          onSelectRecentTopic={(topic) => setActiveRecentItem(topic)}
        />
      </motion.div>
    </AnimatePresence>
  );
};
