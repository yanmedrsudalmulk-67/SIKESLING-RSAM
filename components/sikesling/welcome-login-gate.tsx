'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  EyeOff,
  Lock,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  AuthFlowStage,
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
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (stage !== 'welcome') return;
    const vid = videoRef.current;
    if (!vid) return;

    vid.muted = true;
    setIsMuted(true);
    vid.currentTime = 0;
    vid.play().catch(() => {
      // Autoplay fallback handled silently
    });
  }, [stage]);

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

  const replayVideo = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = 0;
    vid.play().catch(() => {});
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
      className={`relative h-dvh max-h-dvh w-full flex items-center justify-center bg-gradient-to-br from-[#001226] via-[#002147] to-[#082B54] overflow-hidden select-none ${
        stage === 'welcome'
          ? 'p-2.5 sm:p-3.5 md:p-4 lg:p-5'
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
          STAGE 1: WELCOME SCREEN (CARD BERBINGKAI DENGAN MARGIN TIPIS PROPORSIONAL,
          TOMBOL NAIK 3 BARIS, TANPA ICON PANAH KIRI, EFEK PANAH KANAN MAJU-MUNDUR HALUS)
         ===================================================================== */}
      {stage === 'welcome' && (
        <motion.div
          key="welcome-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-3.5 sm:gap-0"
        >
          {/* Portrait / Mobile Top Header Pill (Only visible on portrait/mobile screens) */}
          <div className="flex sm:hidden w-full items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-[#D2B48C]/40 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#D2B48C] text-[#002147] flex items-center justify-center font-extrabold text-xs shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#D2B48C]">
                  UOBK RSUD AL-MULK
                </div>
                <div className="text-xs font-extrabold text-white leading-tight">
                  SIKESLING RSAM
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleAudio}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#002147]/90 border border-[#D2B48C]/60 text-[#FAF6F0] text-[10px] font-bold"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-3 h-3 text-[#D2B48C]" />
                    <span>Suara</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3 text-emerald-400" />
                    <span>Aktif</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={replayVideo}
                aria-label="Putar Ulang Video"
                className="p-1.5 rounded-full bg-[#002147]/90 border border-[#D2B48C]/60 text-[#D2B48C]"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Video Stage — Framed Card with Visible Gold Border & Compact Edge Margin on Tablet/Desktop,
              Proportional 16:9 Card on Portrait Mobile */}
          <div className="relative w-full aspect-video sm:aspect-auto sm:w-full sm:h-full rounded-[22px] sm:rounded-[26px] lg:rounded-[30px] overflow-hidden border-2 border-[#D2B48C]/80 ring-1 ring-white/15 shadow-[0_24px_70px_rgba(0,0,0,0.6)] bg-[#082747] shrink-0">
            <video
              ref={videoRef}
              src="/assets/aistudio/gemini_generated_video_2ff806d3_bfa4751c.mp4"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover sm:object-fill"
            />

            {/* Top-Right Controls on Tablet/Desktop */}
            <div className="hidden sm:flex absolute top-5 right-6 z-20 items-center gap-2.5">
              <button
                type="button"
                onClick={toggleAudio}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#002147]/85 hover:bg-[#002147] backdrop-blur-md border border-[#D2B48C]/65 text-[#FAF6F0] text-xs font-bold shadow-lg transition-all cursor-pointer"
                title={isMuted ? 'Nyalakan Suara Video' : 'Matikan Suara Video'}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-[#D2B48C]" />
                    <span>Nyalakan Suara</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Suara Aktif</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={replayVideo}
                aria-label="Putar Ulang Video"
                title="Putar Ulang Video"
                className="p-2 rounded-full bg-[#002147]/85 hover:bg-[#002147] backdrop-blur-md border border-[#D2B48C]/65 text-[#D2B48C] shadow-lg transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom-Left Below Video Text (Raised by 3 lines to bottom-[22.5%]/bottom-[23%]):
                Tombol Masuk Menu — No Left Arrow, Smooth Back-and-Forth Right Arrow */}
            <div className="absolute left-[5.5%] bottom-[21%] sm:left-[6.8%] sm:bottom-[22.5%] md:bottom-[23%] z-20 flex flex-col items-start">
              <motion.button
                type="button"
                onClick={onEnterLogin}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex items-center gap-1.5 sm:gap-3.5 px-2.5 py-1 sm:px-6 sm:py-2.5 md:px-7 md:py-3 rounded-full bg-gradient-to-r from-[#FAF6F0] via-[#F2E3CE] to-[#D2B48C] text-[#002147] border sm:border-2 border-white/95 shadow-[0_14px_35px_rgba(0,0,0,0.48),0_0_25px_rgba(210,180,140,0.45)] hover:shadow-[0_18px_42px_rgba(0,0,0,0.58),0_0_32px_rgba(210,180,140,0.75)] transition-all cursor-pointer"
              >
                <div className="text-left">
                  <div className="hidden sm:block text-[9px] md:text-[10px] font-extrabold uppercase tracking-widest text-[#6E502B] leading-none">
                    PORTAL UTAMA
                  </div>
                  <div className="text-[9px] sm:text-sm md:text-base font-extrabold tracking-tight text-[#002147] leading-tight sm:mt-0.5">
                    Masuk Menu
                  </div>
                </div>

                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{
                    duration: 1.35,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="inline-flex items-center justify-center w-4 h-4 sm:w-7 sm:h-7 rounded-full bg-[#002147] text-[#D2B48C] shadow-xs shrink-0"
                >
                  <ArrowRight className="w-2.5 h-2.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </motion.span>
              </motion.button>
            </div>
          </div>

          {/* Portrait / Mobile Bottom Welcome Summary Card (Only visible on portrait/mobile screens) */}
          <div className="flex sm:hidden w-full flex-col gap-3 rounded-[24px] bg-gradient-to-br from-[#FAF6F0] via-[#F5EDE0] to-[#EADBC8] p-4 border-2 border-white/90 shadow-xl shrink-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#002147] text-[#D2B48C] text-[9px] font-extrabold uppercase tracking-wider">
                  <Sparkles className="w-2.5 h-2.5" />
                  SELAMAT DATANG DI SIKESLING RSAM
                </div>
                <h2 className="text-sm font-extrabold text-[#002147] mt-1 leading-snug">
                  Sistem Informasi Kesehatan Lingkungan RSUD Al-Mulk Kota Sukabumi
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-white/85 border border-[#D2B48C]/60 p-2 text-center">
                <Activity className="w-4 h-4 text-[#002147] mx-auto mb-0.5" />
                <div className="text-[10px] font-extrabold text-[#002147]">
                  6 Modul
                </div>
                <div className="text-[9px] text-slate-500">Monitoring</div>
              </div>
              <div className="rounded-xl bg-white/85 border border-[#D2B48C]/60 p-2 text-center">
                <ClipboardCheck className="w-4 h-4 text-[#002147] mx-auto mb-0.5" />
                <div className="text-[10px] font-extrabold text-[#002147]">
                  5 Ruangan
                </div>
                <div className="text-[9px] text-slate-500">Supervisi</div>
              </div>
              <div className="rounded-xl bg-white/85 border border-[#D2B48C]/60 p-2 text-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-0.5" />
                <div className="text-[10px] font-extrabold text-[#002147]">
                  Terpadu
                </div>
                <div className="text-[9px] text-slate-500">Tindak Lanjut</div>
              </div>
            </div>

            <button
              type="button"
              onClick={onEnterLogin}
              className="w-full py-3 px-4 rounded-2xl bg-[#002147] text-[#FAF6F0] text-xs font-extrabold flex items-center justify-center gap-2 shadow-md"
            >
              <span>Masuk Menu Log In</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.35, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex"
              >
                <ArrowRight className="w-4 h-4 text-[#D2B48C]" />
              </motion.span>
            </button>
          </div>
        </motion.div>
      )}

      {/* =====================================================================
          STAGE 2: LOGIN PAGE (FULL 1 LAYAR PENUH DI MOBILE TANPA SISA RUANG KOSONG
          ATAS/BAWAH, TANPA BADGE UOBK RSUD AL-MULK, WIDGET GRAFIK BATANG & PERSENTASE CAPAIAN)
         ===================================================================== */}
      {stage === 'login' && (
        <motion.div
          key="login-page"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative z-10 w-full h-full lg:h-auto max-w-[1080px] max-h-[calc(100dvh-0.75rem)] sm:max-h-[calc(100dvh-1.75rem)] mx-auto rounded-[24px] sm:rounded-[34px] bg-gradient-to-br from-[#FAF6F0] via-[#F5EDE0] to-[#EADBC8] border-2 border-white/95 shadow-[0_28px_80px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col lg:grid lg:grid-cols-12"
        >
          {/* Left / Top Panel: Proportional Full-Bleed Top Banner on Mobile, Full Split Panel on Desktop */}
          <div className="lg:col-span-6 relative bg-gradient-to-b from-[#082B54] via-[#002147] to-[#00152E] text-white px-4 pt-3.5 pb-0 sm:p-6 lg:p-7 flex flex-col justify-between shrink-0 h-[48%] sm:h-[46%] lg:h-auto lg:min-h-[540px] overflow-hidden">
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

            {/* Title & Single-Line Desktop / Compact Mobile Subtitle */}
            <div className="relative z-20 mt-1.5 lg:mt-3">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                SIKESLING RSAM
              </h1>
              <p className="text-[11px] sm:text-xs lg:text-[12.5px] xl:text-[13px] text-[#D2B48C] font-medium mt-0.5 lg:mt-1 lg:whitespace-nowrap tracking-tight leading-snug">
                Sistem Informasi Kesehatan Lingkungan RSUD Al-Mulk Kota Sukabumi
              </p>
            </div>

            {/* Center Visual Stage: Fitria Cutout + Floating Bar Chart Widget & Percentage Achievement Widget (Visible on Mobile & Desktop) */}
            <div className="relative z-10 flex-1 flex items-end justify-center pt-2 lg:pt-4 min-h-0">
              {/* Left Floating Widget: WIDGET GRAFIK BATANG (Compact Size) */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-0 sm:left-2 lg:left-0 top-2 sm:top-5 lg:top-8 z-20 rounded-xl sm:rounded-2xl bg-[#16355D]/90 backdrop-blur-md border border-white/25 p-1.5 sm:p-2.5 flex flex-col gap-1 shadow-[0_12px_24px_rgba(0,0,0,0.35)] w-[98px] sm:w-[124px] lg:w-[134px]"
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <span className="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-md bg-[#D2B48C] text-[#002147] flex items-center justify-center shrink-0">
                      <BarChart3 className="w-2 h-2 sm:w-3 sm:h-3" />
                    </span>
                    <span className="text-[7.5px] sm:text-[9px] font-extrabold text-white leading-tight">
                      Grafik Batang
                    </span>
                  </div>
                  <span className="text-[7px] sm:text-[8px] font-extrabold text-emerald-400 tabular-nums">
                    +14%
                  </span>
                </div>

                {/* Mini Multi-Bar Chart Graphic */}
                <div className="flex items-end justify-between gap-1 h-6 sm:h-8 pt-1 px-0.5 border-b border-white/15 pb-0.5">
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-full h-2.5 sm:h-3.5 rounded-t-xs bg-[#D2B48C]/85" />
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-full h-4 sm:h-5 rounded-t-xs bg-emerald-400" />
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-full h-3 sm:h-4 rounded-t-xs bg-[#FAF6F0]/90" />
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-full h-4.5 sm:h-6 rounded-t-xs bg-[#D2B48C]" />
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-full h-5 sm:h-7 rounded-t-xs bg-emerald-400" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[6.5px] sm:text-[7.5px] text-slate-300 font-semibold px-0.5">
                  <span>Air</span>
                  <span>Udr</span>
                  <span>IPL</span>
                  <span>B3</span>
                  <span>Vkt</span>
                </div>
              </motion.div>

              {/* Right Floating Widget: WIDGET PERSENTASE CAPAIAN (Compact Size) */}
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute right-0 sm:right-2 lg:right-0 top-3.5 sm:top-8 lg:top-12 z-20 rounded-xl sm:rounded-2xl bg-[#16355D]/90 backdrop-blur-md border border-white/25 p-1.5 sm:p-2.5 flex flex-col gap-1 shadow-[0_12px_24px_rgba(0,0,0,0.35)] w-[102px] sm:w-[128px] lg:w-[138px]"
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

              {/* Center Sanitarian Character Image with Crisp Thin White Outline Stroke Effect */}
              <div className="relative flex items-end justify-center shrink-0">
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
                  src="/assets/aistudio/fitria_mirrored_cutout.png"
                  alt="Fitria Wulandari, A.M.KL - Sanitarian RSUD Al-Mulk"
                  width={260}
                  height={290}
                  priority
                  referrerPolicy="no-referrer"
                  className="w-36 h-40 sm:w-44 sm:h-48 lg:w-60 lg:h-64 object-contain object-bottom [filter:url(#fitria-white-outline)]"
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
                  Sanitarian Ahli Kesehatan Lingkungan
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
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Masukkan username dan password petugas kesehatan lingkungan untuk
                  mengakses Dashboard utama SIKESLING RSAM.
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
