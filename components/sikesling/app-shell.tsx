'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CalendarRange,
  CheckSquare,
  ChevronDown,
  ClipboardList,
  Database,
  FileSpreadsheet,
  FolderArchive,
  LayoutDashboard,
  Menu,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  UserCheck,
  X,
} from 'lucide-react';
import { MAIN_NAVIGATION, MainMenuItem } from '@/lib/navigation';
import { UserRole } from '@/lib/domain';
import { useApp } from '@/components/sikesling/app-provider';
import { PWAInstallButton, OfflineIndicator } from '@/components/sikesling/pwa-elements';

function getMenuIcon(iconName: string, className = 'w-4 h-4') {
  switch (iconName) {
    case 'LayoutDashboard':
      return <LayoutDashboard className={className} />;
    case 'CalendarRange':
      return <CalendarRange className={className} />;
    case 'CalendarDays':
      return <CalendarDays className={className} />;
    case 'ClipboardList':
      return <ClipboardList className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'CheckSquare':
      return <CheckSquare className={className} />;
    case 'BarChart3':
      return <BarChart3 className={className} />;
    case 'FileSpreadsheet':
      return <FileSpreadsheet className={className} />;
    case 'FolderArchive':
      return <FolderArchive className={className} />;
    case 'Database':
      return <Database className={className} />;
    case 'Settings':
      return <Settings className={className} />;
    default:
      return <LayoutDashboard className={className} />;
  }
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/dashboard';
  const {
    resolvedTheme,
    setTheme,
    mobileMenuOpen,
    setMobileMenuOpen,
    currentRole,
    setCurrentRole,
    currentUserName,
    toasts,
    dismissToast,
  } = useApp();

  // Persistent click-triggered dropdown state for top navigation items
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [mobilePopupMenuId, setMobilePopupMenuId] = useState<string | null>(null);
  const [mobileLaporanTab, setMobileLaporanTab] = useState<'laporan' | 'analisis'>('laporan');
  const [expandedMobileMenus, setExpandedMobileMenus] = useState<Record<string, boolean>>({
    operasional: true,
    supervisi: true,
  });

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileBounceTick, setMobileBounceTick] = useState(0);

  const navContainerRef = useRef<HTMLDivElement>(null);

  // Track window scroll for sticky header Glassmorphism 2.0 effects with 120 FPS rAF throttling
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 15;
          setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close top dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navContainerRef.current &&
        !navContainerRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownId(null);
        setShowRoleMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdownId(null);
        setMobilePopupMenuId(null);
        setShowRoleMenu(false);
        setShowSearchModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isMenuActive = (menu: MainMenuItem) => {
    if (pathname === menu.href) return true;
    if (menu.subItems?.some((s) => pathname.startsWith(s.href))) return true;
    if (pathname.startsWith(menu.href) && menu.href !== '/dashboard') return true;
    return false;
  };

  // Filter out Operasional, Arsip (dokumentasi), and Master Data per user request
  const hiddenMenuIds = new Set(['operasional', 'dokumentasi', 'master-data']);
  const visibleNavigation = MAIN_NAVIGATION.filter((m) => !hiddenMenuIds.has(m.id));

  // Separate primary capsule menus and Settings pill
  const primaryCapsuleMenus = visibleNavigation.filter((m) => m.id !== 'pengaturan');
  const settingsMenu = visibleNavigation.find((m) => m.id === 'pengaturan');

  // Flatten navigable items for quick search dialog
  const allSearchItems = visibleNavigation.flatMap((m) => [
    { title: m.title, href: m.href, category: m.group, desc: m.description },
    ...(m.subItems?.map((s) => ({
      title: `${m.title} — ${s.title}`,
      href: s.href,
      category: m.title,
      desc: s.description,
    })) || []),
  ]);

  const filteredSearchItems = searchQuery.trim()
    ? allSearchItems.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allSearchItems.slice(0, 10);

  const renderDropdownPanel = (menu: MainMenuItem, alignRight = false) => {
    if (!menu.subItems || menu.subItems.length === 0) return null;

    return (
      <div
        role="menu"
        aria-label={`Submenu ${menu.title}`}
        className={`absolute top-full mt-2.5 w-[300px] sm:w-[360px] max-w-[calc(100vw-1.5rem)] rounded-[26px] bg-white/95 dark:bg-[#001835]/95 backdrop-blur-2xl border-[1.5px] border-[#D2B48C]/60 dark:border-[#D2B48C]/25 shadow-[0_24px_60px_rgba(0,33,71,0.22),inset_0_1px_2px_rgba(255,255,255,0.95)] p-3.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 ${
          alignRight ? '-right-14 sm:right-0' : 'left-0'
        }`}
      >
        {/* Dropdown Header */}
        <div className="flex items-start justify-between gap-3 px-3 py-2.5 rounded-2xl bg-[#F7F1E7] dark:bg-[#002147]/80 border border-[#D2B48C]/45 dark:border-[#D2B48C]/20 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#002147] text-[#D2B48C] flex items-center justify-center shrink-0">
              {getMenuIcon(menu.iconName, 'w-4 h-4')}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#002147] dark:text-white truncate">
                {menu.title}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-[#D2B48C]/85 truncate">
                {menu.subItems.length} Submenu Tersedia
              </div>
            </div>
          </div>
          <Link
            href={menu.href}
            onClick={() => setOpenDropdownId(null)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-[#001630] border border-[#D2B48C]/50 text-[11px] font-semibold text-[#002147] dark:text-[#D2B48C] hover:bg-[#002147] hover:text-white transition-colors shrink-0 shadow-2xs"
          >
            <span>Ringkasan</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Submenu Items List */}
        <div className="max-h-[340px] overflow-y-auto space-y-1 pr-0.5">
          {menu.subItems.map((sub) => {
            const subActive = pathname === sub.href;
            return (
              <Link
                key={sub.id}
                href={sub.href}
                role="menuitem"
                onClick={() => setOpenDropdownId(null)}
                className={`group flex items-start justify-between gap-3 px-3 py-2.5 rounded-2xl transition-all ${
                  subActive
                    ? 'bg-[#002147] text-white shadow-xs'
                    : 'text-[#002147] dark:text-slate-200 hover:bg-[#F7F1E7] dark:hover:bg-[#002147]/70'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        subActive
                          ? 'bg-[#D2B48C]'
                          : sub.status === 'UI Ready' || sub.status === 'Functional'
                            ? 'bg-[#002147] dark:bg-[#D2B48C]'
                            : 'bg-amber-500'
                      }`}
                    />
                    <span className="text-xs font-semibold truncate">{sub.title}</span>
                  </div>
                  <p
                    className={`text-[11px] line-clamp-1 mt-0.5 pl-3.5 ${
                      subActive
                        ? 'text-[#EADBC8]'
                        : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                    }`}
                  >
                    {sub.description}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${
                    subActive
                      ? 'bg-[#D2B48C] text-[#002147] font-bold'
                      : sub.status === 'UI Ready' || sub.status === 'Functional'
                        ? 'bg-[#F5EDE0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] border border-[#D2B48C]/40'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {sub.status}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-[#DFC5A2] via-[#F2E8D9] to-[#D2B48C] dark:from-[#001024] dark:via-[#001835] dark:to-[#001228] text-[#002147] dark:text-slate-100 selection:bg-[#002147] selection:text-[#D2B48C]">
      {/* Ambient Light Refraction Orbs Behind Glass Frame (Oxford & Tan Palette) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden z-0 contain-strict transform-gpu will-change-transform"
      >
        <div className="absolute -top-28 -left-24 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-[#D2B48C]/45 via-[#E8D5B7]/35 to-[#002147]/15 blur-[80px]" />
        <div className="absolute top-12 -right-24 w-[560px] h-[560px] rounded-full bg-gradient-to-bl from-[#002147]/20 via-[#D2B48C]/40 to-[#FFFDF9]/45 blur-[90px]" />
        <div className="absolute -bottom-32 left-1/4 w-[680px] h-[440px] rounded-full bg-gradient-to-tr from-[#D2B48C]/45 via-[#F5EDE0]/40 to-[#002147]/15 blur-[90px]" />
      </div>

      {/* Outer Framed Container with High-Performance Luminous White & Cream Glass Surface */}
      <div
        className={`relative z-10 flex-1 flex flex-col w-full max-w-[1920px] mx-auto px-2 sm:px-2.5 lg:px-3 pt-2 sm:pt-2.5 lg:pt-2.5 pb-24 lg:pb-2.5 ${
          pathname === '/dashboard' ? 'lg:h-screen lg:max-h-screen lg:overflow-hidden' : ''
        }`}
      >
        <div className="relative flex-1 min-h-0 flex flex-col rounded-[28px] sm:rounded-[34px] bg-gradient-to-br from-white/85 via-[#FAF6F0]/75 to-white/85 dark:from-[#001E42]/80 dark:via-[#001630]/75 dark:to-[#001B3B]/80 border-[1.5px] border-white/95 dark:border-[#D2B48C]/20 shadow-[0_20px_60px_rgba(0,33,71,0.14),inset_0_1px_2px_rgba(255,255,255,0.95)]">
          {/* Subtle Internal Specular Light Highlights for Inner Glass Cards */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[28px] sm:rounded-[34px] overflow-hidden z-0 contain-paint"
          >
            <div className="absolute top-24 left-[28%] w-96 h-96 rounded-full bg-[#D2B48C]/20 blur-[60px]" />
            <div className="absolute bottom-16 right-[22%] w-96 h-96 rounded-full bg-[#002147]/10 blur-[60px]" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-95" />
          </div>

          {/* TOP CAPSULE NAVIGATION BAR - STICKY WITH GLASSMORPHISM 2.0 (120 FPS ZERO JANK) */}
          <header
            ref={navContainerRef}
            className={`sticky top-0 z-40 shrink-0 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-200 ease-out transform-gpu will-change-[background-color,box-shadow] flex items-center justify-between gap-2 px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 ${
              isScrolled
                ? 'bg-white/90 dark:bg-[#00152E]/90 backdrop-blur-md border-b border-[#D2B48C]/45 dark:border-[#D2B48C]/20 shadow-[0_16px_40px_rgba(0,33,71,0.12),inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-t-[28px] sm:rounded-t-[34px] rounded-b-[22px]'
                : 'bg-transparent border-b border-transparent shadow-none backdrop-blur-none'
            }`}
          >
            {/* Left: Outlined Glass Brand Pill ("SIKESLING RSAM") — Hamburger Removed */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/dashboard"
                onClick={() => {
                  setOpenDropdownId(null);
                  setMobilePopupMenuId(null);
                }}
                className="inline-flex items-center gap-2.5 px-3.5 xl:px-4 py-2 rounded-full bg-white/85 dark:bg-[#002147]/80 backdrop-blur-sm border-[1.5px] border-[#D2B48C]/70 dark:border-[#D2B48C]/30 hover:bg-white dark:hover:bg-[#002147] transition-all shadow-[0_8px_24px_rgba(0,33,71,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)]"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#002147] dark:bg-[#D2B48C] ring-2 ring-[#D2B48C] dark:ring-white/40 shrink-0" />
                <span className="text-xs xl:text-sm font-bold tracking-tight text-[#002147] dark:text-white whitespace-nowrap">
                  SIKESLING RSAM
                </span>
              </Link>
            </div>

            {/* Center: Floating Frosted Glass Capsule Menu Bar with Click Dropdowns */}
            <nav
              aria-label="Navigasi Utama SIKESLING RSAM"
              className="hidden lg:flex items-center bg-white/80 dark:bg-[#001835]/80 backdrop-blur-md rounded-full p-1.5 border-[1.5px] border-[#D2B48C]/55 dark:border-[#D2B48C]/25 shadow-[0_10px_32px_rgba(0,33,71,0.09),inset_0_1px_2px_rgba(255,255,255,0.95)] gap-1"
            >
              {primaryCapsuleMenus.map((menu) => {
                const active = isMenuActive(menu);
                const hasSubs = Boolean(menu.subItems && menu.subItems.length > 0);
                const isDropdownOpen = openDropdownId === menu.id;

                return (
                  <div key={menu.id} className="relative">
                    {hasSubs ? (
                      <button
                        type="button"
                        onClick={() =>
                          setOpenDropdownId((prev) => (prev === menu.id ? null : menu.id))
                        }
                        aria-expanded={isDropdownOpen}
                        aria-haspopup="menu"
                        className={`inline-flex items-center px-4 py-2 rounded-full text-xs xl:text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                          active
                            ? 'bg-[#002147] text-white shadow-sm'
                            : isDropdownOpen
                              ? 'bg-[#F5EDE0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] font-bold shadow-2xs'
                              : 'text-[#002147]/85 dark:text-slate-200 hover:text-[#002147] dark:hover:text-white hover:bg-[#F5EDE0]/70 dark:hover:bg-[#002147]/60'
                        }`}
                      >
                        <span>{menu.shortTitle}</span>
                      </button>
                    ) : (
                      <Link
                        href={menu.href}
                        onClick={() => setOpenDropdownId(null)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs xl:text-[13px] font-semibold transition-all whitespace-nowrap ${
                          active
                            ? 'bg-[#002147] text-white shadow-sm'
                            : 'text-[#002147]/85 dark:text-slate-200 hover:text-[#002147] dark:hover:text-white hover:bg-[#F5EDE0]/70 dark:hover:bg-[#002147]/60'
                        }`}
                      >
                        <span>{menu.shortTitle}</span>
                      </Link>
                    )}

                    {/* Persistent Dropdown Menu when clicked */}
                    {hasSubs && isDropdownOpen && renderDropdownPanel(menu, menu.number >= 7)}
                  </div>
                );
              })}
            </nav>

            {/* Right: Setting Icon + Theme Toggle + User Profile */}
            <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
              {/* Pengaturan Icon Button Beside Dark/Light Mode Toggle (Visible on Mobile & Desktop) */}
              {settingsMenu && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoleMenu(false);
                      setMobilePopupMenuId(null);
                      setOpenDropdownId((prev) =>
                        prev === settingsMenu.id ? null : settingsMenu.id
                      );
                    }}
                    aria-expanded={openDropdownId === settingsMenu.id}
                    aria-haspopup="menu"
                    aria-label="Pengaturan Sistem"
                    title="Pengaturan"
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border-[1.5px] cursor-pointer ${
                      isMenuActive(settingsMenu)
                        ? 'bg-[#002147] text-[#D2B48C] border-[#002147] shadow-sm'
                        : openDropdownId === settingsMenu.id
                          ? 'bg-[#F5EDE0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] border-[#D2B48C]'
                          : 'bg-white/80 dark:bg-[#001835]/80 backdrop-blur-sm text-[#002147] dark:text-[#D2B48C] border-[#D2B48C]/55 dark:border-[#D2B48C]/25 shadow-[0_8px_24px_rgba(0,33,71,0.07),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:bg-white dark:hover:bg-[#002147]'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  {openDropdownId === settingsMenu.id &&
                    renderDropdownPanel(settingsMenu, true)}
                </div>
              )}

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                aria-label={
                  resolvedTheme === 'dark' ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'
                }
                title={
                  resolvedTheme === 'dark' ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'
                }
                className="w-9 h-9 rounded-full bg-white/80 dark:bg-[#001835]/80 backdrop-blur-sm border-[1.5px] border-[#D2B48C]/55 dark:border-[#D2B48C]/25 flex items-center justify-center text-[#002147] dark:text-[#D2B48C] hover:bg-white dark:hover:bg-[#002147] transition-colors shadow-[0_8px_24px_rgba(0,33,71,0.07),inset_0_1px_1px_rgba(255,255,255,0.9)]"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 text-[#D2B48C]" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )}
              </button>

              {/* User Role / Profile Circle Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleMenu(!showRoleMenu);
                    setOpenDropdownId(null);
                  }}
                  aria-label="Profil dan Simulasi Role Pengguna"
                  title={`Role Aktif: ${currentRole}`}
                  className="h-9 px-2.5 rounded-full bg-white/80 dark:bg-[#001835]/80 backdrop-blur-sm border-[1.5px] border-[#D2B48C]/55 dark:border-[#D2B48C]/25 flex items-center gap-1.5 hover:bg-white dark:hover:bg-[#002147] transition-colors shadow-[0_8px_24px_rgba(0,33,71,0.07),inset_0_1px_1px_rgba(255,255,255,0.9)] text-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-[#002147] text-[#D2B48C] flex items-center justify-center">
                    <UserCheck className="w-3 h-3" />
                  </div>
                  <span className="hidden 2xl:inline font-semibold text-[#002147] dark:text-slate-200 whitespace-nowrap">
                    {currentRole}
                  </span>
                </button>

                {showRoleMenu && (
                  <div className="absolute right-0 mt-2.5 w-68 rounded-[24px] border border-[#D2B48C]/60 dark:border-[#D2B48C]/25 bg-white dark:bg-[#001835] p-4 shadow-xl z-50 space-y-2.5">
                    <div className="pb-2.5 border-b border-[#D2B48C]/30 dark:border-slate-800">
                      <div className="text-xs font-bold text-[#002147] dark:text-slate-100">
                        {currentUserName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-[#D2B48C]/80">
                        Simulasi Hak Akses (RBAC Foundation)
                      </div>
                    </div>
                    <div className="space-y-1">
                      {(
                        [
                          'Administrator',
                          'Petugas Kesling',
                          'Koordinator Kesling',
                          'Pimpinan / Viewer',
                        ] as UserRole[]
                      ).map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            setCurrentRole(role);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-full text-xs font-medium transition-colors flex items-center justify-between ${
                            currentRole === role
                              ? 'bg-[#002147] text-white'
                              : 'text-[#002147] dark:text-slate-300 hover:bg-[#F5EDE0] dark:hover:bg-[#002147]/70'
                          }`}
                        >
                          <span>{role}</span>
                          {currentRole === role && (
                            <span className="text-[10px] font-semibold text-[#D2B48C]">
                              Aktif
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-[#D2B48C]/30 dark:border-slate-800 space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <Link
                          href="/pengaturan/hak-akses"
                          onClick={() => setShowRoleMenu(false)}
                          className="text-[#002147] dark:text-[#D2B48C] font-semibold hover:underline"
                        >
                          Matriks RBAC
                        </Link>
                        <Link
                          href="/pengaturan/tampilan"
                          onClick={() => setShowRoleMenu(false)}
                          className="text-slate-500 hover:underline"
                        >
                          Preferensi Tema
                        </Link>
                      </div>
                      <PWAInstallButton compact />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 min-h-0 flex flex-col">{children}</main>
        </div>
      </div>

      {/* Mobile / Portrait Floating Arch-Wave Pill Navigation Bar (6 Menus: Dashboard, Monitoring, Supervisi, Temuan, Grafik, Laporan) + Glassmorphism Submenu Popup */}
      {(() => {
        const mobileNavItems = [
          {
            id: 'dashboard',
            label: 'Dashboard',
            href: '/dashboard',
            hasPopup: false,
            isRouteActive:
              pathname === '/dashboard' ||
              (!pathname.startsWith('/monitoring') &&
                !pathname.startsWith('/supervisi') &&
                !pathname.startsWith('/tindak-lanjut') &&
                !pathname.startsWith('/analisis') &&
                !pathname.startsWith('/laporan')),
            Icon: LayoutDashboard,
          },
          {
            id: 'monitoring',
            label: 'Monitoring',
            href: '/monitoring/kualitas-air',
            hasPopup: true,
            isRouteActive: pathname.startsWith('/monitoring'),
            Icon: Activity,
          },
          {
            id: 'supervisi',
            label: 'Supervisi',
            href: '/supervisi/baru',
            hasPopup: true,
            isRouteActive: pathname.startsWith('/supervisi'),
            Icon: ShieldCheck,
          },
          {
            id: 'tindak-lanjut',
            label: 'Temuan',
            href: '/tindak-lanjut/temuan',
            hasPopup: true,
            isRouteActive: pathname.startsWith('/tindak-lanjut'),
            Icon: CheckSquare,
          },
          {
            id: 'analisis',
            label: 'Grafik',
            href: '/analisis/grafik',
            hasPopup: true,
            isRouteActive: pathname.startsWith('/analisis'),
            Icon: BarChart3,
          },
          {
            id: 'laporan',
            label: 'Laporan',
            href: '/laporan/bulanan',
            hasPopup: true,
            isRouteActive: pathname.startsWith('/laporan'),
            Icon: FileSpreadsheet,
          },
        ];

        const activeIdx = Math.max(
          0,
          mobilePopupMenuId
            ? mobileNavItems.findIndex((item) => item.id === mobilePopupMenuId)
            : mobileNavItems.findIndex((item) => item.isRouteActive)
        );
        // Shift the 300%-wide SVG wave so its center arch (x=750 of 1500) aligns with column activeIdx (0..5)
        const waveShiftPercent = (activeIdx - 2.5) * 5.38;

        // Resolve the active menu object for the open mobile popup
        const activePopupMenu = mobilePopupMenuId
          ? MAIN_NAVIGATION.find((m) => m.id === mobilePopupMenuId)
          : null;

        return (
          <>
            {/* Glassmorphism Mobile Submenu Popup (Appears Above Bottom Nav Bar) */}
            <AnimatePresence>
              {mobilePopupMenuId && activePopupMenu && activePopupMenu.subItems && (
                <>
                  {/* Subtle Backdrop to Close Popup When Tapping Outside */}
                  <motion.div
                    key="mobile-popup-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    onClick={() => setMobilePopupMenuId(null)}
                    className="lg:hidden fixed inset-0 z-40 bg-[#001228]/25 dark:bg-[#000814]/50 backdrop-blur-[2px]"
                    aria-hidden="true"
                  />

                  {/* Floating Translucent Blur Glassmorphism Card */}
                  <motion.div
                    key={`mobile-popup-${mobilePopupMenuId}`}
                    role="menu"
                    aria-label={`Submenu ${activePopupMenu.title}`}
                    initial={{ opacity: 0, y: 18, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 14, scale: 0.96 }}
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 28,
                      mass: 0.8,
                    }}
                    className="lg:hidden fixed bottom-[92px] inset-x-3 sm:inset-x-6 z-50 mx-auto max-w-[430px] rounded-[28px] bg-white/78 dark:bg-[#001835]/82 backdrop-blur-2xl border-[1.5px] border-white/90 dark:border-[#D2B48C]/35 shadow-[0_24px_60px_rgba(0,24,53,0.32),inset_0_1px_2px_rgba(255,255,255,0.92)] p-3 overflow-hidden"
                  >
                    {/* Top Specular Light Reflection */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-95"
                    />

                    {/* Popup Header */}
                    <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-2xl bg-[#F7F1E7]/85 dark:bg-[#002147]/85 border border-[#D2B48C]/50 dark:border-[#D2B48C]/25 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#002147] text-[#D2B48C] flex items-center justify-center shrink-0 shadow-xs">
                          {getMenuIcon(activePopupMenu.iconName, 'w-4 h-4')}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-extrabold text-[#002147] dark:text-white leading-tight">
                            {activePopupMenu.title}
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-[#D2B48C]/85 leading-tight mt-0.5">
                            {activePopupMenu.subItems.length} Submenu Tersedia
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href={activePopupMenu.href}
                          onClick={() => setMobilePopupMenuId(null)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 dark:bg-[#001630] border border-[#D2B48C]/55 text-[11px] font-semibold text-[#002147] dark:text-[#D2B48C] hover:bg-[#002147] hover:text-white transition-colors shadow-2xs"
                        >
                          <span>Ringkasan</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setMobilePopupMenuId(null)}
                          aria-label="Tutup popup menu"
                          className="w-7 h-7 rounded-full bg-white/85 dark:bg-[#001630]/80 border border-[#D2B48C]/40 flex items-center justify-center text-[#002147] dark:text-[#D2B48C] hover:bg-[#002147] hover:text-white transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Submenu Items List */}
                    <div className="max-h-[46vh] overflow-y-auto space-y-1.5 pr-0.5">
                      {activePopupMenu.subItems.map((sub) => {
                        const subActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.id}
                            href={sub.href}
                            role="menuitem"
                            onClick={() => setMobilePopupMenuId(null)}
                            className={`group flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl transition-all ${
                              subActive
                                ? 'bg-[#002147] text-white shadow-sm'
                                : 'bg-white/65 dark:bg-[#002147]/45 text-[#002147] dark:text-slate-100 hover:bg-[#F7F1E7]/95 dark:hover:bg-[#002147]/80 border border-white/75 dark:border-[#D2B48C]/20'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${
                                    subActive
                                      ? 'bg-[#D2B48C] shadow-[0_0_6px_#D2B48C]'
                                      : 'bg-[#002147] dark:bg-[#D2B48C]'
                                  }`}
                                />
                                <span className="text-[12.5px] font-bold leading-snug">
                                  {sub.title}
                                </span>
                              </div>
                              <p
                                className={`text-[11px] line-clamp-1 mt-0.5 pl-4 ${
                                  subActive
                                    ? 'text-[#EADBC8]'
                                    : 'text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                {sub.description}
                              </p>
                            </div>
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                subActive
                                  ? 'bg-[#D2B48C] text-[#002147]'
                                  : 'bg-[#F5EDE0]/90 dark:bg-[#001835] text-[#002147] dark:text-[#D2B48C] border border-[#D2B48C]/40 group-hover:bg-[#002147] group-hover:text-white'
                              }`}
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <div className="lg:hidden fixed bottom-3 inset-x-0 z-50 px-2.5 sm:px-6 pointer-events-none flex justify-center">
              <nav
                aria-label="Navigasi Bawah Mobile"
                className="pointer-events-auto relative w-full max-w-[430px] h-[74px] rounded-full bg-gradient-to-b from-[#002855] via-[#001D3D] to-[#001329] border border-[#D2B48C]/35 shadow-[0_5px_0_#000B18,0_18px_38px_rgba(0,18,40,0.48),inset_0_1.5px_1px_rgba(255,255,255,0.22)] overflow-hidden select-none"
              >
                {/* Soft Top Specular Sheen */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent"
                />

                {/* Continuous Glowing Arch-Wave Line Layer (Matches Reference Design in Oxford & Warm Tan Theme) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(90deg,transparent_0.5%,#000_4%,#000_96%,transparent_99.5%)]"
                >
                  <motion.svg
                    viewBox="0 0 1500 74"
                    preserveAspectRatio="none"
                    initial={false}
                    animate={{ x: `${waveShiftPercent}%` }}
                    transition={{
                      type: 'spring',
                      stiffness: 340,
                      damping: 30,
                      mass: 0.85,
                    }}
                    className="absolute top-0 left-[-100%] w-[300%] h-full"
                  >
                    <defs>
                      <linearGradient id="sikeslingWaveStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#D2B48C" stopOpacity="0.45" />
                        <stop offset="44%" stopColor="#E6C9A2" stopOpacity="0.95" />
                        <stop offset="50%" stopColor="#FFF3DF" stopOpacity="1" />
                        <stop offset="56%" stopColor="#E6C9A2" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#D2B48C" stopOpacity="0.45" />
                      </linearGradient>
                      <linearGradient id="sikeslingArchPocket" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#000D1F" stopOpacity="0.84" />
                        <stop offset="65%" stopColor="#00152E" stopOpacity="0.58" />
                        <stop offset="100%" stopColor="#001D3D" stopOpacity="0.12" />
                      </linearGradient>
                      <radialGradient id="sikeslingArchGlow" cx="50%" cy="20%" r="55%">
                        <stop offset="0%" stopColor="#D2B48C" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#D2B48C" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Recessed Dark Well Inside the Active Arch */}
                    <path
                      d="M 692 66 C 703 66, 706 50, 710 33 C 714 15, 727 7, 750 7 C 773 7, 786 15, 790 33 C 794 50, 797 66, 808 66 Z"
                      fill="url(#sikeslingArchPocket)"
                    />

                    {/* Subtle Warm Radial Glow Inside the Active Arch */}
                    <path
                      d="M 692 66 C 703 66, 706 50, 710 33 C 714 15, 727 7, 750 7 C 773 7, 786 15, 790 33 C 794 50, 797 66, 808 66 Z"
                      fill="url(#sikeslingArchGlow)"
                    />

                    {/* Soft Ambient Glow Along the Continuous Wave Contour */}
                    <path
                      d="M 0 66 L 692 66 C 703 66, 706 50, 710 33 C 714 15, 727 7, 750 7 C 773 7, 786 15, 790 33 C 794 50, 797 66, 808 66 L 1500 66"
                      fill="none"
                      stroke="#D2B48C"
                      strokeWidth="6"
                      strokeOpacity="0.32"
                      strokeLinecap="round"
                    />

                    {/* Main Crisp Continuous Arch-Wave Line */}
                    <path
                      d="M 0 66 L 692 66 C 703 66, 706 50, 710 33 C 714 15, 727 7, 750 7 C 773 7, 786 15, 790 33 C 794 50, 797 66, 808 66 L 1500 66"
                      fill="none"
                      stroke="url(#sikeslingWaveStroke)"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                    />
                  </motion.svg>
                </div>

                {/* 6 Navigation Slots (Dashboard, Monitoring, Supervisi, Temuan, Grafik, Laporan) */}
                <div className="relative z-10 grid grid-cols-6 h-full items-center px-[5px]">
                  {mobileNavItems.map((item, idx) => {
                    const IconComponent = item.Icon;
                    const active = idx === activeIdx;

                    const innerContent = (
                      <>
                        {/* Animated Icon Container: Smooth Up-and-Down Jump on Selection */}
                        <motion.div
                          key={active ? `active-${item.id}-${mobileBounceTick}` : `idle-${item.id}`}
                          initial={false}
                          animate={
                            active
                              ? {
                                  y: [0, -7.5, 1.5, -4, 0],
                                  scale: [1, 1.16, 0.94, 1.06, 1],
                                }
                              : { y: 0, scale: 1 }
                          }
                          transition={{
                            duration: 0.62,
                            ease: [0.22, 1, 0.36, 1],
                            times: [0, 0.28, 0.54, 0.78, 1],
                          }}
                          className={`flex items-center justify-center transition-colors ${
                            active
                              ? 'text-[#D2B48C] drop-shadow-[0_2px_8px_rgba(210,180,140,0.55)] -mt-0.5'
                              : 'text-[#EADBC8]/75 group-hover:text-white'
                          }`}
                        >
                          <motion.div
                            animate={active ? { y: [0, -2.5, 0] } : { y: 0 }}
                            transition={
                              active
                                ? {
                                    duration: 1.9,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: 0.6,
                                  }
                                : { duration: 0.2 }
                            }
                          >
                            <IconComponent
                              className="w-[19px] h-[19px]"
                              strokeWidth={active ? 2.3 : 1.75}
                              fill={active ? 'rgba(210, 180, 140, 0.22)' : 'none'}
                            />
                          </motion.div>
                        </motion.div>

                        {/* Menu Label (Clean — No Dot Below Icon) */}
                        <span
                          className={`text-[9.5px] sm:text-[10.5px] leading-none tracking-[-0.02em] whitespace-nowrap transition-colors ${
                            active
                              ? 'text-white font-bold'
                              : 'text-[#EADBC8]/75 font-medium group-hover:text-white/95'
                          }`}
                        >
                          {item.label}
                        </span>
                      </>
                    );

                    if (item.hasPopup) {
                      const isPopupOpen = mobilePopupMenuId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setMobileBounceTick((prev) => prev + 1);
                            setOpenDropdownId(null);
                            setMobilePopupMenuId((prev) => (prev === item.id ? null : item.id));
                          }}
                          aria-expanded={isPopupOpen}
                          aria-haspopup="menu"
                          className="group relative flex flex-col items-center justify-center gap-1.5 h-full px-0.5 focus:outline-none cursor-pointer"
                        >
                          {innerContent}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => {
                          setMobileBounceTick((prev) => prev + 1);
                          setOpenDropdownId(null);
                          setMobilePopupMenuId(null);
                        }}
                        aria-current={active ? 'page' : undefined}
                        className="group relative flex flex-col items-center justify-center gap-1.5 h-full px-0.5 focus:outline-none"
                      >
                        {innerContent}
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>
          </>
        );
      })()}

      {/* Quick Module Navigator Modal */}
      {showSearchModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-[#001228]/50 backdrop-blur-xs p-4 pt-16"
          role="dialog"
          aria-modal="true"
          aria-label="Pencarian Cepat Modul"
        >
          <div className="w-full max-w-xl rounded-[28px] bg-white dark:bg-[#001835] border border-[#D2B48C]/60 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#D2B48C]/35 dark:border-slate-800 flex items-center gap-3">
              <Search className="w-4 h-4 text-[#002147] dark:text-[#D2B48C] shrink-0" />
              <input
                type="search"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik nama menu atau modul (misal: IPAL, Supervisi, Limbah, Standar)..."
                className="flex-1 text-sm bg-transparent text-[#002147] dark:text-slate-100 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                aria-label="Tutup pencarian"
                className="p-1.5 rounded-full text-slate-400 hover:text-[#002147] hover:bg-[#F5EDE0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 py-2 bg-[#F5EDE0] dark:bg-[#002147] text-[11px] font-medium text-[#002147] dark:text-[#D2B48C] border-b border-[#D2B48C]/30 dark:border-slate-800">
              Navigasi cepat seluruh 10 Menu Utama & 38 Submenu SIKESLING RSAM
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSearchItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setShowSearchModal(false);
                    setSearchQuery('');
                  }}
                  className="block px-5 py-3 hover:bg-[#FAF6F0] dark:hover:bg-[#002147]/60 transition-colors"
                >
                  <div className="text-xs font-semibold text-[#002147] dark:text-slate-100">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {item.desc}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div
          className="fixed bottom-16 lg:bottom-5 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
          aria-live="polite"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              className="pointer-events-auto rounded-[22px] border border-[#D2B48C]/70 dark:border-[#D2B48C]/30 bg-white dark:bg-[#001835] p-4 shadow-xl flex items-start justify-between gap-3"
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#002147] dark:text-[#D2B48C]">
                  {t.title}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                aria-label="Tutup pesan"
                className="text-slate-400 hover:text-[#002147]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <OfflineIndicator />
    </div>
  );
}
