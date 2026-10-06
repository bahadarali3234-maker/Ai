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
  LogOut,
  Lock,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HERO_AVATAR } from '../data/portfolioData';
import defaultVisibleImg from '../assets/images/back_reveal.png';
import revealedUnderneathImg from '../assets/images/front_overlay.jpg';
import { FullScreenChatView, SttSoundBar } from './FullScreenChatView';
import { AttachedFile } from '../types';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import {
  subscribeToAuth,
  getCurrentUser,
  logOut,
  subscribeToUserChatThreads,
  deleteChatThreadFromFirestore,
} from '../firebase';

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
  onOpenLogin?: () => void;
  initialTopic?: string;
}

export const InteractiveRevealModal: React.FC<InteractiveRevealModalProps> = ({
  isOpen,
  onClose,
  onOpenBooking,
  onOpenLogin,
  initialTopic = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Chat & Prompt States
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'Build' | 'Design' | 'Code' | 'Brand'>('Build');
  const [isRecording, setIsRecording] = useState(false);
  const [activeRecentItem, setActiveRecentItem] = useState('Guest Session');
  const [showResponsePopup, setShowResponsePopup] = useState(false);
  const [isFullScreenChatOpen, setIsFullScreenChatOpen] = useState(false);
  const [currentFullScreenPrompt, setCurrentFullScreenPrompt] = useState('');
  const [currentFullScreenAttachments, setCurrentFullScreenAttachments] = useState<AttachedFile[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(() => getCurrentUser());
  const [userChatThreads, setUserChatThreads] = useState<Record<string, any>>({});

  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      setCurrentUser(user);
      if (user && !user.isAnonymous) {
        setActiveRecentItem('');
      } else {
        setActiveRecentItem('Guest Session');
        setUserChatThreads({});
      }
    });
    return () => unsub();
  }, []);

  // Listen to Firestore real-time chats if user is logged in
  useEffect(() => {
    if (!currentUser || currentUser.isAnonymous) {
      setUserChatThreads({});
      return;
    }
    const unsub = subscribeToUserChatThreads(currentUser.uid, (threads) => {
      setUserChatThreads(threads);
    });
    return () => unsub();
  }, [currentUser?.uid]);

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
      const reader = new FileReader();
      const attachmentId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const newAttachment: AttachedFile = {
          id: attachmentId,
          name: file.name,
          size: file.size,
          type: file.type,
          isImage: isImg,
          preview: dataUrl,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };

      if (file.type.includes('text') || /\.(txt|md|json|js|jsx|ts|tsx|html|css|py|csv)$/i.test(file.name)) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
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
        const targetTopic = currentUser && !currentUser.isAnonymous
          ? (initialTopic.length > 25 ? `${initialTopic.slice(0, 25)}...` : initialTopic)
          : 'Guest Session';
        setActiveRecentItem(targetTopic);
        setCurrentFullScreenPrompt(initialTopic);
        setIsFullScreenChatOpen(true);
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
    const targetTopic = currentUser && !currentUser.isAnonymous
      ? (promptText.length > 25 ? `${promptText.slice(0, 25)}...` : promptText)
      : 'Guest Session';

    setActiveRecentItem(targetTopic);
    setCurrentFullScreenPrompt(promptText);
    setCurrentFullScreenAttachments([...attachments]);
    setInputValue('');
    setAttachments([]); // Clean up already attached files
    setIsPlusMenuOpen(false);
    setIsModeMenuOpen(false);
    setIsDrawerOpen(false);
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
    if (!currentUser || currentUser.isAnonymous) {
      setIsDrawerOpen(false);
      onOpenLogin?.();
      return;
    }
    setInputValue('');
    setShowResponsePopup(false);
    setIsDrawerOpen(false);
    setCurrentFullScreenPrompt('');
    const newTopic = `Chat ${Object.keys(userChatThreads).length + 1}`;
    setActiveRecentItem(newTopic);
    setIsFullScreenChatOpen(true);
  };

  const handleSelectRecent = (title: string) => {
    if (!currentUser || currentUser.isAnonymous) {
      setIsDrawerOpen(false);
      onOpenLogin?.();
      return;
    }
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
        className={`fixed inset-0 z-[9999] bg-black overflow-hidden ${
          isFullScreenChatOpen ? '' : 'select-none touch-none'
        }`}
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

        {/* TOP CORNER: Three Lines Menu Button */}
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

        {/* TOP RIGHT CORNER: Theme Toggle & Close Button */}
        <div className="absolute top-5 sm:top-6 right-5 sm:right-6 z-40 pointer-events-auto flex items-center gap-2">
          <ThemeToggle showLabel={false} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="w-11 h-11 rounded-2xl bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.6)] active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* UPPER/MIDDLE SECTION: THINK CREATIVE directly above the Prompt Box */}
        <div className="absolute top-[23vh] xs:top-[25vh] sm:top-[11vh] md:top-[13vh] left-0 right-0 z-30 px-3 sm:px-4 flex flex-col items-center pointer-events-none transition-all duration-300">
          {/* Typography & Overlapping 3D Avatar: Directly above the prompt box */}
          <div className="relative flex flex-col items-center justify-center select-none text-center mb-2 sm:mb-3 pointer-events-auto">
            {/* First word: THINK (White uppercase) */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.88] text-white uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              THINK
            </motion.h1>

            {/* Second row: CREATIVE with overlapping 3D Character Avatar */}
            <div className="relative w-full flex items-center justify-center -mt-1 xs:-mt-2 sm:-mt-3 md:-mt-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.88] text-[#00a6ff] uppercase flex items-center justify-center w-full drop-shadow-[0_15px_35px_rgba(0, 166, 255,0.4)]"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                CREATIVE
              </motion.div>

              {/* 3D Cutout Avatar - Floating right over the center of typography exactly like HeroSection */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[48%] z-20 pointer-events-auto"
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                  className="relative group cursor-pointer select-none"
                >
                  {/* Crimson backlight glow behind character cutout */}
                  <div className="absolute inset-0 bg-[#00a6ff]/30 blur-2xl rounded-full transform scale-90 pointer-events-none" />

                  <img
                    src={HERO_AVATAR}
                    alt="Irtza 3D Cutout Character Avatar"
                    className="w-14 xs:w-18 sm:w-32 md:w-40 lg:w-48 max-w-none h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)] drop-shadow-[0_0_30px_rgba(0, 166, 255,0.4)] transform group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* THE PROMPT BOX (Matches User's Provided Image Exactly, Placed directly under THINK CREATIVE) */}
          <div className="w-full max-w-[94vw] sm:max-w-[560px] pointer-events-auto">
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
                    className={`relative rounded-[28px] sm:rounded-[32px] bg-[#f8f9fc]/95 backdrop-blur-xl text-zinc-900 px-5 pt-4 pb-3 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(0, 166, 255,0.15)] border transition-all ${
                      isDraggingOver
                        ? 'border-[#00a6ff] bg-white ring-2 ring-[#00a6ff]/30'
                        : 'border-white/90'
                    }`}
                  >
                    {/* Live Speech Recognition Pill */}
                    {isRecording && (
                      <div className="flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-red-50 border border-[#00a6ff]/25 text-[#00a6ff] text-xs font-semibold w-fit">
                        <span className="w-2 h-2 rounded-full bg-[#00a6ff] animate-ping" />
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
                                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/75 hover:bg-[#00a6ff] text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-90"
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
                          className="text-xs text-[#00a6ff] font-medium px-1 py-1"
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
                                        ? 'bg-[#00a6ff] text-white'
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
                    <span className="text-[#00a6ff] font-semibold">AI Intelligence Blueprint</span>
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
                          ? 'bg-[#00a6ff]/20 border border-[#00a6ff]/40 text-right text-white'
                          : 'bg-white/10 text-zinc-200'
                      }`}
                    >
                      {m.text}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex items-center gap-1.5 py-1 text-xs text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00a6ff] animate-ping" />
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
                {/* Floating Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, x: -40 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: -40 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-[345px] sm:max-w-[365px] h-[92vh] max-h-[820px] rounded-[38px] border-2 p-6 flex flex-col justify-between overflow-hidden select-none transition-colors duration-300"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--primary)',
                    boxShadow: isLight
                      ? '0 10px 40px rgba(71, 105, 135, 0.16)'
                      : '0 0 40px rgba(0, 166, 255, 0.45)',
                    color: 'var(--text)',
                  }}
                >
                  {/* Atmospheric subtle nebula background */}
                  <div
                    className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
                    style={{ backgroundColor: 'var(--primary)' }}
                  />
                  <div
                    className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
                    style={{ backgroundColor: 'var(--primary)' }}
                  />

                  {/* TOP FIXED SECTION: BMW ///M Logo & Theme Switcher */}
                  <div className="shrink-0 relative z-10">
                    {/* TOP LOGO: Exact BMW ///M Logo from Reference Image */}
                    <div className="flex items-center justify-between pt-1 pb-1">
                      <div className="flex items-center gap-2 select-none">
                        {/* Three slanted /// stripes: Light Blue, Dark Navy, Crimson Red */}
                        <div className="flex items-center gap-1.5 -skew-x-[18deg]">
                          <span className="w-2.5 h-7 sm:w-3 sm:h-8 bg-[#0082CA] rounded-[1px] shadow-[0_0_12px_rgba(0,130,202,0.7)]" />
                          <span className="w-2.5 h-7 sm:w-3 sm:h-8 bg-[#17205a] rounded-[1px]" />
                          <span className="w-2.5 h-7 sm:w-3 sm:h-8 bg-[#E21B23] rounded-[1px] shadow-[0_0_16px_rgba(226,27,35,0.9)]" />
                        </div>
                        {/* Metallic Chrome Slanted M */}
                        <span
                          className="text-3xl sm:text-4xl font-black italic tracking-tighter ml-1 transition-colors"
                          style={{ color: 'var(--text)' }}
                        >
                          M
                        </span>
                      </div>

                      {/* Theme Toggle in Drawer Header */}
                      <ThemeToggle showLabel={false} />
                    </div>
                  </div>

                  {!currentUser || currentUser.isAnonymous ? (
                    /* GUEST SIDEBAR / MENU: Sign In Required Box */
                    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-4 text-center my-auto">
                      <div className="w-14 h-14 rounded-2xl bg-[#120205] border border-[#00a6ff]/50 flex items-center justify-center text-[#00a6ff] shadow-[0_0_20px_rgba(0, 166, 255,0.35)] mb-3">
                        <Lock size={24} />
                      </div>
                      <h3 className="text-white text-base font-bold tracking-tight mb-1.5" style={{ fontFamily: "'Syne', sans-serif" }}>
                        Sign in required
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed max-w-[210px] mb-5">
                        Sign in to access your chats, projects and memory.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDrawerOpen(false);
                          onOpenLogin?.();
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#00a6ff] hover:bg-[#0094e6] text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(0, 166, 255,0.5)] cursor-pointer active:scale-95"
                      >
                        Sign In
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Authenticated Mode: New Chat + Navigation */}
                      <div className="shrink-0 space-y-4 relative z-10">
                        {/* + New Chat Pill Button */}
                        <button
                          type="button"
                          onClick={handleNewChat}
                          className="w-full py-3 px-4 rounded-[20px] bg-[#0c0204] border-[1.5px] border-[#00a6ff] text-white font-medium text-[15px] flex items-center justify-between shadow-[0_0_18px_rgba(0, 166, 255,0.6)] hover:shadow-[0_0_26px_rgba(0, 166, 255,0.85)] transition-all cursor-pointer active:scale-98 group"
                        >
                          <div className="flex items-center gap-3">
                            <Plus size={19} className="text-white group-hover:rotate-90 transition-transform" />
                            <span className="text-white tracking-wide">New Chat</span>
                          </div>
                          <ChevronRight size={18} className="text-[#00a6ff] font-bold group-hover:translate-x-0.5 transition-transform" />
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

                      {/* ONLY RECENT SECTION SCROLLABLE: User's real Firestore chats */}
                      <div className="flex-1 min-h-0 flex flex-col pt-3 relative z-10">
                        <span className="text-[13px] font-normal text-zinc-500 px-3 tracking-wide mb-2 shrink-0">
                          Recent
                        </span>

                        {/* Scrollable list of user's saved chats */}
                        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 no-scrollbar">
                          {Object.keys(userChatThreads).length === 0 ? (
                            <div className="px-3 py-6 text-center text-xs text-zinc-500">
                              No saved chats yet. Start a new conversation!
                            </div>
                          ) : (
                            Object.values(userChatThreads).map((thread: any) => (
                              <div
                                key={thread.id || thread.title}
                                className="w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer hover:bg-white/[0.06] text-zinc-200 hover:text-white border border-transparent group"
                              >
                                <button
                                  type="button"
                                  onClick={() => handleSelectRecent(thread.title || thread.id)}
                                  className="flex items-center gap-3 truncate text-left flex-1 min-w-0"
                                >
                                  <MessageSquare size={17} strokeWidth={1.8} className="text-zinc-400 group-hover:text-white shrink-0" />
                                  <span className="truncate text-[14px] text-white font-normal">{thread.title || thread.id}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (currentUser?.uid && thread.id) {
                                      await deleteChatThreadFromFirestore(thread.id, currentUser.uid);
                                    }
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-zinc-500 hover:text-red-400 transition-opacity ml-1 shrink-0"
                                  title="Delete chat"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* BOTTOM ACTIONS: Back to Dashboard & User Profile Row (Fixed) */}
                  <div className="shrink-0 space-y-3 pt-3 relative z-10">
                    {/* Theme-aware Button: ← Back to Dashboard */}
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full py-2.5 px-4 rounded-[18px] text-white font-semibold text-[14px] flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98 theme-button-primary"
                    >
                      <ArrowLeft size={17} className="text-white" />
                      <span>Back to Dashboard</span>
                    </button>

                    {/* Menu Account Actions: Sign In (Guest) or Sign Out (Logged In) */}
                    {currentUser && !currentUser.isAnonymous ? (
                      <div className="flex items-center justify-between px-2.5 py-2 select-none rounded-xl bg-white/[0.04] border border-white/10">
                        <div className="flex items-center gap-2.5 min-w-0 truncate">
                          <div className="w-9 h-9 rounded-full bg-[#120205] border-[1.5px] border-[#00a6ff] flex items-center justify-center text-[#00a6ff] shadow-[0_0_12px_rgba(0, 166, 255,0.6)] shrink-0 overflow-hidden">
                            {currentUser?.photoURL ? (
                              <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <UserIcon size={17} className="fill-[#00a6ff] text-[#00a6ff]" />
                            )}
                          </div>
                          <div className="flex flex-col truncate">
                            <span className="text-[13px] font-semibold text-white leading-tight truncate">
                              {currentUser.displayName || currentUser.email?.split('@')[0]}
                            </span>
                            <span className="text-[11px] text-zinc-400 truncate">
                              {currentUser.email || 'Cloud Account'}
                            </span>
                          </div>
                        </div>

                        {/* Sign Out Button in Menu */}
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await logOut();
                          }}
                          className="ml-2 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                          title="Sign Out"
                        >
                          <LogOut size={13} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={onOpenLogin}
                        className="flex items-center justify-between px-3 py-2 select-none cursor-pointer hover:bg-white/5 bg-white/[0.03] border border-white/10 rounded-xl transition-colors"
                        title="Click to sign in"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-9 h-9 rounded-full bg-[#120205] border-[1.5px] border-zinc-700 flex items-center justify-center text-zinc-400 shrink-0">
                            <UserIcon size={16} />
                          </div>
                          <div className="flex flex-col truncate">
                            <span className="text-[13px] font-semibold text-white leading-tight truncate">
                              Guest User
                            </span>
                            <span className="text-[11px] text-zinc-400 truncate">
                              Session Active
                            </span>
                          </div>
                        </div>

                        {/* Sign In Button in Menu */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenLogin?.();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#00a6ff] hover:bg-[#0094e6] text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(0, 166, 255,0.4)] cursor-pointer shrink-0"
                        >
                          Sign In
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* FULL SCREEN CHAT VIEW */}
        <FullScreenChatView
          isOpen={isFullScreenChatOpen}
          onClose={() => {
            setIsFullScreenChatOpen(false);
            setCurrentFullScreenPrompt('');
          }}
          initialPrompt={currentFullScreenPrompt}
          onClearInitialPrompt={() => setCurrentFullScreenPrompt('')}
          initialAttachments={currentFullScreenAttachments}
          selectedRecentTopic={currentUser && !currentUser.isAnonymous ? activeRecentItem : 'Guest Session'}
          onSelectRecentTopic={(topic) => setActiveRecentItem(topic)}
          onOpenLogin={onOpenLogin}
        />
      </motion.div>
    </AnimatePresence>
  );
};
