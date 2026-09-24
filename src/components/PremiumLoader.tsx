import React, { useEffect, useRef, useState } from 'react';

// Import key app images to preload in background during loading
import heroAvatarImg from '../assets/images/avatar_cutout.png';
import heroGlowImg from '../assets/images/hero-glow.jpg';
import backRevealImg from '../assets/images/back_reveal.png';
import frontOverlayImg from '../assets/images/front_overlay.jpg';
import shadowsImg from '../assets/images/ai_shadows_streetwear_1789852712824.jpg';
import zaynSpicesImg from '../assets/images/ai_zayn_packaging_1789852729989.jpg';
import voltraImg from '../assets/images/ai_voltra_hardware_1789852745863.jpg';
import voltImg from '../assets/images/ai_volt_athletic_1789852764213.jpg';
import brandCraftMacroImg from '../assets/images/ai_neural_craft_1789852784169.jpg';
import studioVisionGridImg from '../assets/images/ai_workspace_ui_1789852801571.jpg';

interface PremiumLoaderProps {
  onLoaded?: () => void;
}

const IMAGES_TO_PRELOAD = [
  heroAvatarImg,
  heroGlowImg,
  backRevealImg,
  frontOverlayImg,
  shadowsImg,
  zaynSpicesImg,
  voltraImg,
  voltImg,
  brandCraftMacroImg,
  studioVisionGridImg,
];

export const PremiumLoader: React.FC<PremiumLoaderProps> = ({ onLoaded }) => {
  const [stage, setStage] = useState<'intro' | 'cycling' | 'loading' | 'exit' | 'complete'>('intro');
  const [introHide, setIntroHide] = useState(false);
  const [somethingShow, setSomethingShow] = useState(false);
  const [somethingBigOut, setSomethingBigOut] = useState(false);
  const [currentFont, setCurrentFont] = useState('Arial Black,Arial,sans-serif');
  const [scale, setScale] = useState(1);
  const [coloredIndices, setColoredIndices] = useState<number[]>([2]);
  const [percent, setPercent] = useState(0);
  const [statusShow, setStatusShow] = useState(false);
  const [flash, setFlash] = useState(false);

  // Audio system (pure browser Web Audio, completely optional and non-blocking)
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  const initAudio = () => {
    if (audioContextRef.current) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const master = ctx.createGain();
        master.gain.value = 0.055;
        master.connect(ctx.destination);
        audioContextRef.current = ctx;
        masterGainRef.current = master;
      }
    } catch {
      // Audio is non-critical; animations proceed regardless
    }
  };

  const playTone = (freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.035, delay = 0) => {
    try {
      const ctx = audioContextRef.current;
      const master = masterGainRef.current;
      if (!ctx || !master || ctx.state !== 'running') return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      g.gain.setValueAtTime(0, ctx.currentTime + delay);
      g.gain.linearRampToValueAtTime(gain, ctx.currentTime + delay + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
      o.connect(g);
      g.connect(master);
      o.start(ctx.currentTime + delay);
      o.stop(ctx.currentTime + delay + dur + 0.03);
    } catch {
      // ignore
    }
  };

  const playWhoosh = () => {
    try {
      const ctx = audioContextRef.current;
      const master = masterGainRef.current;
      if (!ctx || !master || ctx.state !== 'running') return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(120, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + 0.55);
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.055, ctx.currentTime + 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      o.connect(g);
      g.connect(master);
      o.start();
      o.stop(ctx.currentTime + 0.62);
    } catch {
      // ignore
    }
  };

  const playClickEffect = () => {
    playTone(700, 0.055, 'square', 0.025);
    playTone(1200, 0.04, 'sine', 0.018, 0.045);
  };

  // Preload actual assets immediately
  useEffect(() => {
    IMAGES_TO_PRELOAD.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // AUTOMATIC SELF-DRIVING SEQUENCE - NO USER TOUCH/CLICK REQUIRED
  useEffect(() => {
    let isCancelled = false;
    const timeouts: NodeJS.Timeout[] = [];

    const schedule = (fn: () => void, delay: number) => {
      const id = setTimeout(() => {
        if (!isCancelled) fn();
      }, delay);
      timeouts.push(id);
      return id;
    };

    // Try starting audio if allowed by browser, but DO NOT block
    try {
      initAudio();
      playTone(90, 0.18, 'sine', 0.03);
    } catch {
      // ignore
    }

    // 1. INTRO: U R U READY shows automatically for 750ms, then starts exiting
    schedule(() => {
      setIntroHide(true);

      // 2. SOMETHING: Word cycling starts after intro fades
      schedule(() => {
        setStage('cycling');
        setSomethingShow(true);

        const fonts = [
          'Arial Black,Arial,sans-serif',
          'Impact,sans-serif',
          'Georgia,serif',
          'Courier New,monospace',
          'Trebuchet MS,sans-serif',
          'Times New Roman,serif',
          'Verdana,sans-serif',
          'Garamond,serif',
          'Franklin Gothic Medium,Arial,sans-serif',
          'Arial Narrow,Arial,sans-serif',
        ];

        const groups = [
          [2],
          [6],
          [8],
          [0, 1],
          [3, 4],
          [6, 7, 8],
          [0, 2, 3],
          [4, 6],
          [1, 2, 3, 4],
        ];

        let step = 0;
        const maxSteps = 15;

        const cycleWord = () => {
          if (isCancelled) return;
          setCurrentFont(fonts[step % fonts.length]);
          setScale(0.95 + Math.random() * 0.1);
          const chosenGroup = groups[Math.floor(Math.random() * groups.length)];
          setColoredIndices(chosenGroup);
          playClickEffect();

          step++;
          if (step < maxSteps) {
            const stepDelay = step < 5 ? 130 : step % 3 === 0 ? 250 : 150;
            schedule(cycleWord, stepDelay);
          } else {
            // Transition from cycling to progress loading
            playWhoosh();
            schedule(() => {
              setSomethingBigOut(true);
              playTone(220, 0.35, 'sawtooth', 0.035);

              schedule(() => {
                setStage('loading');
                setStatusShow(true);

                // 3. PROGRESS LOADING: 0% to 100%
                const startTime = performance.now();
                const totalDuration = 2200; // 2.2 seconds smooth load

                let animFrameId: number;
                const animateProgress = (now: number) => {
                  if (isCancelled) return;
                  const elapsed = now - startTime;
                  const rawPercent = Math.min(100, (elapsed / totalDuration) * 100);
                  const currentVal = Math.floor(rawPercent);

                  setPercent(currentVal);

                  if (currentVal % 10 === 0 && currentVal > 0) {
                    playTone(180 + currentVal * 5, 0.045, 'sine', 0.012);
                  }

                  if (rawPercent < 100) {
                    animFrameId = requestAnimationFrame(animateProgress);
                  } else {
                    setPercent(100);
                    playWhoosh();
                    setFlash(true);

                    schedule(() => {
                      setFlash(false);
                      setStage('exit');

                      // Final complete unmount after 1.2s curtain slide
                      schedule(() => {
                        setStage('complete');
                        if (onLoaded) onLoaded();
                      }, 1250);
                    }, 180);
                  }
                };

                animFrameId = requestAnimationFrame(animateProgress);
              }, 450);
            }, 300);
          }
        };

        cycleWord();
      }, 550);
    }, 750);

    // Fallback safety timer: guarantees app opens within 6.5s no matter what
    const safetyId = setTimeout(() => {
      if (!isCancelled) {
        setStage('exit');
        setTimeout(() => {
          setStage('complete');
          if (onLoaded) onLoaded();
        }, 1100);
      }
    }, 6500);

    return () => {
      isCancelled = true;
      clearTimeout(safetyId);
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, []);

  if (stage === 'complete') return null;

  const parts = [
    { text: 'YOU', id: 0 },
    { text: ' ', id: 1 },
    { text: 'ARE', id: 2 },
    { text: ' ', id: 3 },
    { text: 'READY', id: 4 },
    { text: ' ', id: 5 },
    { text: 'FOR', id: 6 },
    { text: ' ', id: 7 },
    { text: 'SOMETHING', id: 8 },
  ];

  return (
    <div
      id="loader"
      className="fixed inset-0 bg-black text-white z-[999999] overflow-hidden select-none"
      style={{
        transform: stage === 'exit' ? 'translateY(-105%)' : 'translateY(0)',
        transition: 'transform 1.3s cubic-bezier(.76, 0, .18, 1)',
        pointerEvents: stage === 'exit' ? 'none' : 'auto',
      }}
    >
      <style>{`
        @keyframes show { to { opacity: 1; } }
        @keyframes fade { to { opacity: 1; } }
        @keyframes introOut { to { opacity: 0; transform: translateY(-65%) scale(.96); } }
        @keyframes bigOut { to { opacity: 0; transform: scale(1.4); } }
      `}</style>

      {/* 1. INTRO: U R U READY */}
      {stage === 'intro' && (
        <div
          className="absolute left-[7vw] top-1/2 -translate-y-1/2 font-black leading-[0.76] tracking-[-0.09em] uppercase select-none"
          style={{
            animation: introHide ? 'introOut .65s cubic-bezier(.7,0,.2,1) forwards' : 'none',
          }}
        >
          <div className="text-[clamp(80px,16vw,170px)] text-[#f11]">U</div>
          <div className="text-[clamp(80px,16vw,170px)]">R</div>
          <div className="text-[clamp(80px,16vw,170px)]">U</div>
          <div className="text-[clamp(48px,9vw,100px)] mt-4">READY</div>
        </div>
      )}

      {/* 2. SOMETHING: Rapid Font/Color Cycling */}
      {(stage === 'cycling' || (stage === 'loading' && somethingBigOut)) && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: somethingShow ? 1 : 0,
            animation: somethingBigOut
              ? 'bigOut .7s cubic-bezier(.7,0,.2,1) forwards'
              : somethingShow
              ? 'show .55s forwards'
              : 'none',
          }}
        >
          <div
            id="word"
            style={{
              fontFamily: currentFont,
              transform: `scale(${scale})`,
              fontSize: 'clamp(38px, 8.5vw, 140px)',
              lineHeight: '0.9',
              letterSpacing: '-0.075em',
              transition: 'font-family .08s, transform .08s',
            }}
            className="font-black uppercase text-center px-[4vw]"
          >
            {parts.map((p) => {
              const isColored = coloredIndices.includes(p.id);
              return (
                <span
                  key={p.id}
                  style={{
                    color: isColored ? '#ff1515' : '#ffffff',
                    display: 'inline-block',
                    transition: 'color .08s',
                  }}
                >
                  {p.text}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. PROGRESS LOADING BAR + PERCENTAGE */}
      {(stage === 'loading' || stage === 'exit') && (
        <>
          {/* Status on Bottom Left */}
          <div
            className="absolute left-[5vw] bottom-[8.8vh] text-xs tracking-[0.22em] uppercase font-mono text-zinc-300"
            style={{
              opacity: statusShow ? 1 : 0,
              animation: statusShow ? 'fade .4s forwards' : 'none',
            }}
          >
            Loading experience
          </div>

          {/* Percentage on Bottom Right with subtle wobble */}
          <div
            className="absolute right-[5vw] bottom-[8vh] font-black tracking-[-0.09em] flex items-baseline leading-none"
            style={{
              fontSize: 'clamp(58px, 10vw, 130px)',
              transform: `translate(${Math.sin(percent * 0.12) * 4}px, ${Math.sin(percent * 0.18) * 7}px)`,
              opacity: statusShow ? 1 : 0,
              animation: statusShow ? 'fade .4s forwards' : 'none',
            }}
          >
            <span>{percent}</span>
            <small className="text-[0.35em] text-[#f11] ml-1">%</small>
          </div>

          {/* Glowing Red Progress Bar */}
          <div
            className="absolute left-[5vw] right-[5vw] bottom-[6vh] h-[3px] bg-white/10 overflow-hidden rounded-full"
            style={{
              opacity: statusShow ? 1 : 0,
              animation: statusShow ? 'fade .4s forwards' : 'none',
            }}
          >
            <i
              style={{
                display: 'block',
                height: '100%',
                width: `${percent}%`,
                background: '#f11',
                boxShadow: '0 0 20px #f11, 0 0 40px #f11',
                transition: 'width 0.05s ease-out',
              }}
            />
          </div>
        </>
      )}

      {/* Flash overlay upon 100% completion */}
      <div
        className="absolute inset-0 bg-white pointer-events-none"
        style={{
          opacity: flash ? 0.15 : 0,
          transition: 'opacity .12s ease-out',
        }}
      />
    </div>
  );
};
