'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Clock,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  TrendingUp,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  AuthFlowStage,
  PortraitVideoFitMode,
  getPortraitVideoFitMode,
  getWelcomeVideoSrc,
  isPortraitViewport,
  validateLoginCredentials,
} from '@/lib/auth-gate';

interface WelcomeLoginGateProps {
  stage: Exclude<AuthFlowStage, 'authenticated'>;
  onEnterLogin: () => void;
  onBackToWelcome: () => void;
  onLoginSuccess: () => void;
}

export function WelcomeLoginGate({
  stage,
  onEnterLogin,
  onBackToWelcome,
  onLoginSuccess,
}: WelcomeLoginGateProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [portraitFitMode, setPortraitFitMode] =
    useState<PortraitVideoFitMode>('fit-width');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [realtimeClock, setRealtimeClock] = useState<{
    time: string;
    date: string;
  }>({
    time: '08:00:00',
    date: 'WIB • Live',
  });

  useEffect(() => {
    const updateOrientation = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsPortrait(isPortraitViewport(w, h));
      setPortraitFitMode(getPortraitVideoFitMode(w, h));
    };
    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'Mei',
        'Jun',
        'Jul',
        'Agu',
        'Sep',
        'Okt',
        'Nov',
        'Des',
      ];
      setRealtimeClock({
        time: `${hours}:${minutes}:${seconds}`,
        date: `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]}`,
      });
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeVideoSrc = getWelcomeVideoSrc(isPortrait);

  useEffect(() => {
    if (stage !== 'welcome') return;
    const vid = videoRef.current;
    if (!vid) return;

    vid.muted = isMuted;
    vid.currentTime = 0;
    vid.play().catch(() => {
      // Autoplay fallback handled silently
    });
  }, [stage, activeVideoSrc]);

  const toggleAudio = () => {
    const vid = videoRef.current;
    if (!vid) return;
    const nextMuted = !vid.muted;
    vid.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && vid.paused) {
      vid.play().catch(() => {});
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const result = validateLoginCredentials(username, password);
    if (!result.valid) {
      setErrorMsg(result.error || 'Username atau Password tidak valid.');
      return;
    }
    onLoginSuccess();
  };

  return (
    <div
      className={`relative min-h-screen h-screen h-dvh max-h-dvh w-full flex items-center justify-center bg-gradient-to-br from-[#001226] via-[#002147] to-[#082B54] overflow-hidden select-none ${
        stage === 'welcome'
          ? 'p-1.5 sm:p-3.5 md:p-4 lg:p-5'
          : 'p-1.5 sm:p-3.5 lg:p-5'
      }`}
    >
      {/* Ambient Background Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      >
        <div className="absolute -top-28 -left-28 w-[420px] h-[420px] rounded-full bg-[#D2B48C]/20 blur-[95px]" />
        <div className="absolute -bottom-28 -right-28 w-[460px] h-[460px] rounded-full bg-[#D2B48C]/25 blur-[105px]" />
      </div>

      {/* =====================================================================
          STAGE 1: WELCOME SCREEN
          - Portrait / Mobile: Proportional 9:16 Portrait Video (/assets/aistudio/gemini_generated_video_4eb3b858_7592732a.mp4)
            with seamless top/bottom ambient wave fill so tall 20:9 phones never stretch the video
          - Landscape / Desktop: Full-Canvas Landscape Video (/assets/aistudio/gemini_generated_video_91994e90_fb8b5397.mp4)
          - Both feature Top-Left Hospital Logo Badge & Responsive "Masuk Menu" CTA Button
         ===================================================================== */}
      {stage === 'welcome' && (
        <motion.div
          key="welcome-screen"
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative z-10 w-full h-full max-h-[calc(100dvh-0.75rem)] sm:max-h-none flex flex-col justify-between"
        >
          <div
            className={`relative w-full h-full flex-1 flex justify-center rounded-[22px] sm:rounded-[26px] lg:rounded-[30px] overflow-hidden border-2 border-[#D2B48C]/85 ring-1 ring-white/15 shadow-[0_24px_70px_rgba(0,0,0,0.6)] ${
              isPortrait
                ? 'items-start bg-gradient-to-b from-[#082E5E] via-[#F4E5D2] via-78% to-[#E5CCB0]'
                : 'items-center bg-[#082747]'
            }`}
          >
            {/* Seamless Bottom Cream Wave Extension for Tall Portrait Smartphones (20:9 / 19.5:9) */}
            {isPortrait && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[32%] overflow-hidden z-0 bg-gradient-to-b from-[#F5E6D3] via-[#EDD9C0] to-[#E2C8A8]"
              >
                <svg
                  viewBox="0 0 400 160"
                  preserveAspectRatio="none"
                  className="w-full h-full opacity-85"
                >
                  <path
                    d="M0,35 C115,95 265,-5 400,45 L400,160 L0,160 Z"
                    fill="#EAD4B8"
                  />
                  <path
                    d="M0,85 C140,40 275,125 400,70 L400,160 L0,160 Z"
                    fill="#DFC3A1"
                    fillOpacity="0.65"
                  />
                </svg>
              </div>
            )}

            {/* Proportional 9:16 Stage on Portrait (Never Stretches Vertically) vs Full Stage on Landscape */}
            <div
              data-testid="welcome-video-stage"
              data-fit-mode={isPortrait ? portraitFitMode : 'landscape-fill'}
              className={
                isPortrait
                  ? `relative z-10 flex items-start justify-center aspect-[9/16] shrink-0 ${
                      portraitFitMode === 'fit-width'
                        ? 'w-[105%] max-w-none'
                        : 'h-full max-w-full'
                    }`
                  : 'relative z-10 w-full h-full'
              }
            >
              <video
                ref={videoRef}
                key={activeVideoSrc}
                src={activeVideoSrc}
                data-testid="welcome-screen-video"
                data-orientation={isPortrait ? 'portrait' : 'landscape'}
                preload="auto"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className={
                  isPortrait
                    ? 'w-full h-full object-contain [mask-image:linear-gradient(to_bottom,black_0%,black_92%,transparent_100%)]'
                    : 'w-full h-full object-fill'
                }
              />
            </div>

            {/* Overlay CTA Button:
                - Portrait / Mobile: Wide full-pill button at bottom-center with "MASUK APLIKASI", right arrow with horizontal motion, and smooth vertical floating animation in Cream on Navy Blue
                - Landscape / Desktop: Bottom-left over navy area, Cream background with Navy Blue text */}
            {isPortrait ? (
              <div className="absolute inset-x-0 bottom-[4.5%] sm:bottom-[5.5%] z-20 flex items-center justify-center px-5 sm:px-7">
                <motion.button
                  type="button"
                  data-testid="welcome-enter-menu-btn"
                  onClick={onEnterLogin}
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full max-w-[400px] h-[56px] sm:h-[60px] rounded-full bg-gradient-to-r from-[#001B3A] via-[#083366] to-[#002147] hover:from-[#002147] hover:via-[#0B3C78] hover:to-[#002855] text-[#FAF6F0] border-[1.5px] border-[#D2B48C]/85 ring-1 ring-white/15 shadow-[0_14px_32px_rgba(0,33,71,0.42),inset_0_1px_1px_rgba(255,255,255,0.18)] flex items-center justify-center gap-3 transition-shadow cursor-pointer select-none"
                >
                  <span className="text-[16px] sm:text-[17px] font-extrabold tracking-[0.1em] text-[#FAF6F0]">
                    MASUK APLIKASI
                  </span>
                  <motion.span
                    animate={{ x: [0, 6, 0] }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="inline-flex items-center justify-center text-[#D2B48C]"
                  >
                    <ArrowRight className="w-5 h-5 stroke-[2.75]" />
                  </motion.span>
                </motion.button>
              </div>
            ) : (
              <div className="absolute left-[6.5%] bottom-[25.5%] md:bottom-[26.5%] z-20 flex flex-col items-start">
                <motion.button
                  type="button"
                  data-testid="welcome-enter-menu-btn"
                  onClick={onEnterLogin}
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-[320px] sm:w-[360px] md:w-[400px] max-w-[85vw] h-[56px] sm:h-[60px] rounded-full bg-gradient-to-r from-[#FAF6F0] via-[#F2E3CE] to-[#D2B48C] text-[#002147] border-2 border-white/95 shadow-[0_14px_34px_rgba(0,0,0,0.52),0_0_24px_rgba(210,180,140,0.5)] flex items-center justify-center gap-3 transition-shadow cursor-pointer select-none"
                >
                  <span className="text-[16px] sm:text-[17px] font-extrabold tracking-[0.1em] text-[#002147]">
                    MASUK APLIKASI
                  </span>
                  <motion.span
                    animate={{ x: [0, 6, 0] }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="inline-flex items-center justify-center text-[#002147]"
                  >
                    <ArrowRight className="w-5 h-5 stroke-[2.75]" />
                  </motion.span>
                </motion.button>
              </div>
            )}

            {/* Top-Left Official Hospital Logo & Header in Glassmorphism Blur Translucent Card */}
            <div
              data-testid="welcome-rs-logo-badge"
              className="flex absolute top-3.5 left-3.5 sm:top-5 sm:left-6 md:top-6 md:left-7 z-20 items-center gap-2 sm:gap-3 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl bg-[#002147]/80 hover:bg-[#002147]/90 backdrop-blur-md border border-[#D2B48C]/60 shadow-[0_10px_28px_rgba(0,0,0,0.45)] transition-all select-none"
            >
              <div className="relative w-7 h-7 sm:w-8.5 sm:h-8.5 md:w-10 md:h-10 shrink-0 flex items-center justify-center">
                <Image
                  src="/assets/aistudio/logo-1_06649eb7.png"
                  alt="Logo UOBK RSUD Al-Mulk"
                  width={40}
                  height={40}
                  className="object-contain"
                  referrerPolicy="no-referrer"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] sm:text-[13px] md:text-[15px] font-extrabold tracking-wide text-[#FAF6F0] font-sans leading-tight">
                  UOBK RSUD AL-MULK
                </span>
                <span className="text-[8.5px] sm:text-[9.5px] md:text-[10.5px] font-bold tracking-[0.16em] text-[#D2B48C] uppercase font-sans leading-none mt-0.5">
                  KOTA SUKABUMI
                </span>
              </div>
            </div>

            {/* Top-Right Audio Icon Button (Both Portrait & Landscape) */}
            <div className="flex absolute top-3.5 right-3.5 sm:top-5 sm:right-6 md:top-6 md:right-7 z-20 items-center">
              <button
                type="button"
                onClick={toggleAudio}
                aria-label={isMuted ? 'Nyalakan Suara Video' : 'Matikan Suara Video'}
                title={isMuted ? 'Nyalakan Suara Video' : 'Matikan Suara Video'}
                className="p-2 sm:p-2.5 md:p-3 rounded-full bg-[#002147]/90 hover:bg-[#082B54] backdrop-blur-md border border-[#D2B48C]/70 shadow-xl transition-all cursor-pointer"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-[#D2B48C]/65" />
                ) : (
                  <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-[#D2B48C]" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* =====================================================================
          STAGE 2: LOGIN PAGE (FULL 1 LAYAR PENUH DI MOBILE TANPA SISA RUANG KOSONG,
          GAMBAR SANITARIAN PROPORSIONAL BESAR, 3 WIDGET MELAYANG)
         ===================================================================== */}
      {stage === 'login' && (
        <motion.div
          key="login-page"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative z-10 w-full h-full lg:h-auto max-w-[1080px] max-h-[calc(100dvh-0.75rem)] sm:max-h-[calc(100dvh-1.75rem)] mx-auto rounded-[24px] sm:rounded-[34px] bg-gradient-to-br from-[#FAF6F0] via-[#F5EDE0] to-[#EADBC8] border-2 border-white/95 shadow-[0_28px_80px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col lg:grid lg:grid-cols-12"
        >
          {/* Left / Top Panel: Proportional Full-Bleed Top Banner on Mobile, Full Split Panel on Desktop */}
          <div className="lg:col-span-6 relative bg-gradient-to-b from-[#082B54] via-[#002147] to-[#00152E] text-white px-4 pt-3 pb-0 sm:p-6 lg:p-7 flex flex-col justify-between shrink-0 h-[50%] sm:h-[47%] lg:h-auto lg:min-h-[540px] overflow-hidden">
            {/* Decorative Background Orbs */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden z-0"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#D2B48C]/25 blur-3xl" />
              <div className="absolute bottom-12 -left-10 w-48 h-48 rounded-full bg-[#FAF6F0]/10 blur-2xl" />
            </div>

            {/* Top Navigation Bar inside Banner (Badge "UOBK RSUD AL-MULK" Removed) */}
            <div className="relative z-20 flex items-center justify-start">
              <button
                type="button"
                onClick={onBackToWelcome}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-[#D2B48C]/40 text-[#FAF6F0] text-[11px] sm:text-xs font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#D2B48C]" />
                <span>Welcome Screen</span>
              </button>
            </div>

            {/* Title & Single-Line Subtitle on All Platforms (Mobile & Desktop) */}
            <div className="relative z-20 mt-1 lg:mt-2.5">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                SIKRESMI
              </h1>
              <p className="text-[9px] sm:text-xs lg:text-[12.5px] xl:text-[13px] text-[#D2B48C] font-medium mt-0.5 lg:mt-1 whitespace-nowrap tracking-tight leading-snug">
                Sistem Informasi Kesehatan Lingkungan RSUD Al-Mulk Kota Sukabumi
              </p>
            </div>

            {/* Center Visual Stage: Proportional Large Fitria Cutout + 3 Floating Widgets */}
            <div className="relative z-10 flex-1 flex items-end justify-center pt-1 lg:pt-3 min-h-0">
              {/* KIRI ATAS AGAK KE BAWAH DIKIT (Top-Left Slightly Lower) Floating Widget: WIDGET WAKTU REALTIME */}
              <motion.div
                animate={{ y: [0, -3.5, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-0 sm:left-2 lg:left-0 top-5 sm:top-7 lg:top-9 z-20 rounded-xl sm:rounded-2xl bg-[#16355D]/90 backdrop-blur-md border border-white/25 p-1.5 sm:p-2 flex flex-col gap-0.5 shadow-[0_12px_24px_rgba(0,0,0,0.4)] w-[88px] sm:w-[106px] lg:w-[114px]"
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-md bg-[#D2B48C] text-[#002147] flex items-center justify-center shrink-0">
                      <Clock className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                    </span>
                    <span className="text-[6.5px] sm:text-[7.5px] font-extrabold text-[#D2B48C] leading-tight">
                      Waktu Realtime
                    </span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                </div>

                <div className="text-[10px] sm:text-xs lg:text-[13px] font-extrabold text-white tabular-nums tracking-tight leading-tight mt-0.5">
                  {realtimeClock.time}
                </div>

                <div className="flex items-center justify-between text-[6px] sm:text-[7px] text-slate-300 font-semibold leading-none">
                  <span>{realtimeClock.date}</span>
                  <span className="text-emerald-400 font-bold">WIB</span>
                </div>
              </motion.div>

              {/* KANAN ATAS (Top-Right) Floating Widget: WIDGET PERSENTASE CAPAIAN */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute right-0 sm:right-2 lg:right-0 top-1 sm:top-2.5 lg:top-4 z-20 rounded-xl sm:rounded-2xl bg-[#16355D]/90 backdrop-blur-md border border-white/25 p-1.5 sm:p-2.5 flex flex-col gap-1 shadow-[0_12px_24px_rgba(0,0,0,0.4)] w-[104px] sm:w-[128px] lg:w-[138px]"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[7.5px] sm:text-[9px] font-extrabold text-white leading-tight">
                    Persentase Capaian
                  </span>
                  <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 shrink-0" />
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 py-0.5">
                  {/* Donut Progress Gauge */}
                  <div className="relative w-6.5 h-6.5 sm:w-8.5 sm:h-8.5 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="3.8"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3.8"
                        strokeDasharray="88"
                        strokeDashoffset="7"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[7px] sm:text-[8.5px] font-extrabold text-white tabular-nums">
                      92%
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-[8px] sm:text-[9.5px] font-extrabold text-[#D2B48C] leading-tight">
                      Sangat Baik
                    </div>
                    <div className="text-[6.5px] sm:text-[7.5px] text-slate-300 leading-tight mt-0.5">
                      Target Baku Mutu
                    </div>
                  </div>
                </div>

                {/* Progress Bar Strip */}
                <div className="w-full h-1 rounded-full bg-white/15 overflow-hidden">
                  <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-[#D2B48C] to-emerald-400" />
                </div>
              </motion.div>

              {/* KIRI BAWAH (Bottom-Left) Floating Widget: WIDGET GRAFIK BATANG (Slightly Smaller Size) */}
              <motion.div
                animate={{ y: [0, 3.5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-0 sm:left-2 lg:left-0 bottom-2.5 sm:bottom-4 lg:bottom-5 z-20 rounded-xl sm:rounded-2xl bg-[#16355D]/90 backdrop-blur-md border border-white/25 p-1.5 sm:p-2 flex flex-col gap-0.5 shadow-[0_12px_24px_rgba(0,0,0,0.4)] w-[88px] sm:w-[108px] lg:w-[116px]"
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-md bg-[#D2B48C] text-[#002147] flex items-center justify-center shrink-0">
                      <BarChart3 className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                    </span>
                    <span className="text-[6.5px] sm:text-[8px] font-extrabold text-white leading-tight">
                      Grafik Batang
                    </span>
                  </div>
                  <span className="text-[6.5px] sm:text-[7.5px] font-extrabold text-emerald-400 tabular-nums">
                    +14%
                  </span>
                </div>

                {/* Mini Multi-Bar Chart Graphic */}
                <div className="flex items-end justify-between gap-1 h-4.5 sm:h-6 pt-0.5 px-0.5 border-b border-white/15 pb-0.5">
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-full h-2 sm:h-2.5 rounded-t-xs bg-[#D2B48C]/85" />
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-full h-3 sm:h-4 rounded-t-xs bg-emerald-400" />
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-full h-2.5 sm:h-3 rounded-t-xs bg-[#FAF6F0]/90" />
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-full h-3.5 sm:h-4.5 rounded-t-xs bg-[#D2B48C]" />
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-full h-4 sm:h-5 rounded-t-xs bg-emerald-400" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[6px] sm:text-[7px] text-slate-300 font-semibold px-0.5">
                  <span>Air</span>
                  <span>Udr</span>
                  <span>IPL</span>
                  <span>B3</span>
                  <span>Vkt</span>
                </div>
              </motion.div>

              {/* Center Sanitarian Character Image with Proportional Hero Size & Crisp Thin White Outline Stroke */}
              <div className="relative z-10 flex items-end justify-center shrink-0">
                <svg className="sr-only" aria-hidden="true">
                  <defs>
                    <filter id="fitria-white-outline" x="-10%" y="-10%" width="120%" height="120%">
                      <feMorphology in="SourceAlpha" operator="dilate" radius="1.4" result="dilated" />
                      <feFlood floodColor="#FFFFFF" floodOpacity="0.95" result="whiteStroke" />
                      <feComposite in="whiteStroke" in2="dilated" operator="in" result="outline" />
                      <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#000000" floodOpacity="0.45" result="shadow" />
                      <feMerge>
                        <feMergeNode in="shadow" />
                        <feMergeNode in="outline" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                </svg>
                <Image
                  src="/assets/aistudio/fitria_rsam_uniform_cutout.png"
                  alt="Fitria Wulandari, A.M.KL - Sanitarian RSUD Al-Mulk"
                  width={340}
                  height={370}
                  priority
                  referrerPolicy="no-referrer"
                  className="w-[235px] h-[252px] sm:w-[260px] sm:h-[280px] lg:w-[300px] lg:h-[325px] object-contain object-bottom [filter:url(#fitria-white-outline)]"
                />
              </div>
            </div>

            {/* Bottom Officer Bar on Desktop */}
            <div className="hidden lg:flex relative z-20 pt-3 border-t border-white/15 items-center justify-between gap-2">
              <div>
                <div className="text-sm font-extrabold text-white">
                  Fitria Wulandari, A.M.KL
                </div>
                <div className="text-xs font-semibold text-[#D2B48C]">
                  Sanitarian
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#D2B48C]/20 border border-[#D2B48C]/50 flex items-center justify-center text-[#D2B48C]">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Right / Bottom Panel: Login Form Filling Remaining Mobile Viewport Cleanly */}
          <div className="flex-1 lg:col-span-6 p-5 sm:p-7 lg:p-10 flex flex-col justify-center bg-gradient-to-br from-white/95 via-[#FAF6F0]/95 to-[#F5EDE0]/90">
            <div className="max-w-md mx-auto w-full space-y-4 sm:space-y-6">
              {/* Form Header */}
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#002147] tracking-tight">
                  Log In ke Halaman Utama
                </h2>
                <p className="text-[9.5px] sm:text-xs xl:text-[13px] text-slate-600 leading-relaxed tracking-tight sm:tracking-normal">
                  <span className="block whitespace-nowrap">
                    Masukkan username dan password petugas kesehatan lingkungan
                  </span>
                  <span className="block whitespace-nowrap">
                    untuk mengakses Dashboard utama SIKRESMI.
                  </span>
                </p>
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className="rounded-xl bg-rose-50 border border-rose-300 px-3.5 py-2.5 text-xs font-bold text-rose-800"
                >
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-5">
                {/* Username Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="login-username"
                    className="block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#002147]"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8B6B43] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="login-username"
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setErrorMsg(null);
                      }}
                      placeholder="Masukkan username"
                      autoComplete="username"
                      required
                      className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white border-[1.5px] border-[#D2B48C]/75 text-xs sm:text-sm font-bold text-[#002147] placeholder:text-slate-400 focus:outline-none focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/15 transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#002147]"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8B6B43] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMsg(null);
                      }}
                      placeholder="Masukkan password"
                      autoComplete="current-password"
                      required
                      className="w-full pl-10 pr-11 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white border-[1.5px] border-[#D2B48C]/75 text-xs sm:text-sm font-bold text-[#002147] placeholder:text-slate-400 focus:outline-none focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? 'Sembunyikan Password' : 'Tampilkan Password'
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-[#002147] cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 sm:py-4 px-5 rounded-xl sm:rounded-2xl bg-[#002147] hover:bg-[#003166] text-[#FAF6F0] text-xs sm:text-sm font-extrabold shadow-[0_12px_28px_rgba(0,33,71,0.25)] flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                >
                  <span>Masuk ke Halaman Utama</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 1.35,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="inline-flex"
                  >
                    <ArrowRight className="w-4 h-4 text-[#D2B48C]" />
                  </motion.span>
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
