'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Filter,
  FolderOpen,
  Image as ImageIcon,
  Info,
  Layers,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  Wrench,
} from 'lucide-react';
import { ModuleStatusType } from '@/lib/navigation';
import { PhotoAttachmentMeta, validateFileUpload } from '@/lib/domain';

// --- LAYOUT COMPONENTS ---

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full px-3 sm:px-4 lg:px-5 py-3 pb-24 lg:pb-10 space-y-6">
      {children}
    </div>
  );
}

export function BreadcrumbNavigation({
  items,
}: {
  items: { label: string; href: string }[];
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400"
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={item.href + idx}>
            {idx > 0 && (
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                /
              </span>
            )}
            {isLast ? (
              <span className="font-semibold text-[#002147] dark:text-[#D2B48C] whitespace-nowrap">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-[#002147] dark:hover:text-[#D2B48C] transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export function PageHeader({
  title,
  description,
  status,
  breadcrumbs,
  actions,
}: {
  title: string;
  description?: string;
  status?: ModuleStatusType;
  breadcrumbs?: { label: string; href: string }[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 pb-2">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <BreadcrumbNavigation items={breadcrumbs} />
      )}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1
              className="text-[28px] font-bold tracking-tight text-[#002147] dark:text-slate-50 text-balance"
              style={{ fontSize: '28px' }}
            >
              {title}
            </h1>
          </div>
          {description ? (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// --- DASHBOARD & BENTO COMPONENTS ---

export function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  href,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  href?: string;
}) {
  const content = (
    <div className="group h-full rounded-[26px] border border-[#D2B48C]/45 dark:border-[#D2B48C]/20 bg-white/95 dark:bg-[#001835]/90 backdrop-blur-xs p-5 shadow-[0_10px_30px_-12px_rgba(0,33,71,0.08)] transition-all hover:shadow-[0_16px_36px_-12px_rgba(0,33,71,0.16)] hover:border-[#002147]/40 flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold text-slate-600 dark:text-[#D2B48C]/85">
          {title}
        </span>
        <div className="w-9 h-9 rounded-full bg-[#F5EDE0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] flex items-center justify-center shrink-0 group-hover:bg-[#002147] group-hover:text-[#D2B48C] transition-colors">
          {href ? <ArrowUpRight className="w-4 h-4" /> : icon}
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-light font-mono tabular-nums text-[#002147] dark:text-slate-50">
          {value}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002147] rounded-[26px]"
      >
        {content}
      </Link>
    );
  }
  return content;
}

export function StatisticsCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#D2B48C]/45 dark:border-slate-800 bg-white/95 dark:bg-[#001835] p-4 shadow-xs space-y-1">
      <p className="text-xs text-slate-500 dark:text-[#D2B48C]/85">{label}</p>
      <p className="text-2xl font-light font-mono tabular-nums text-[#002147] dark:text-slate-100">
        {value}
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500">{note}</p>
    </div>
  );
}

export function ChartContainer({
  title,
  subtitle,
  isEmpty,
  emptyMessage,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  isEmpty?: boolean;
  emptyMessage?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-[#D2B48C]/45 dark:border-slate-800 bg-white/95 dark:bg-[#001835]/90 backdrop-blur-xs p-6 shadow-[0_12px_32px_-12px_rgba(0,33,71,0.08)] flex flex-col justify-between gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D2B48C]/30 dark:border-slate-800/80">
        <div>
          <h3 className="text-base font-bold text-[#002147] dark:text-slate-100">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {isEmpty ? (
        <div className="h-60 flex flex-col items-center justify-center text-center px-4 py-6 rounded-2xl bg-[#FAF6F0] dark:bg-[#001228]/50 border border-dashed border-[#D2B48C]/70 dark:border-slate-800">
          <FolderOpen className="w-8 h-8 text-[#002147]/65 dark:text-[#D2B48C]/60 mb-2" />
          <p className="text-xs font-semibold text-[#002147] dark:text-slate-300">
            Belum Terdapat Data Aktual
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            {emptyMessage ||
              'Grafik akan menampilkan visualisasi otomatis setelah petugas mencatat data kegiatan atau supervisi.'}
          </p>
        </div>
      ) : (
        <div className="h-64 w-full pt-2">{children}</div>
      )}
    </div>
  );
}

export function QuickActionCard({
  title,
  description,
  href,
  icon,
  primary = false,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-[24px] border p-4 transition-all flex items-start gap-3.5 ${
        primary
          ? 'border-[#002147] bg-[#002147] text-white hover:bg-[#001630] shadow-md'
          : 'border-[#D2B48C]/50 dark:border-slate-800 bg-white/95 dark:bg-[#001835] hover:border-[#002147]/60 text-[#002147] dark:text-slate-100 shadow-xs'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
          primary
            ? 'bg-[#D2B48C]/20 text-[#D2B48C]'
            : 'bg-[#F5EDE0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C]'
        }`}
      >
        {icon}
      </div>
      <div className="space-y-0.5 min-w-0 flex-1">
        <div className="text-sm font-semibold truncate">{title}</div>
        <p
          className={`text-xs line-clamp-2 ${
            primary ? 'text-[#EADBC8]' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {description}
        </p>
      </div>
    </Link>
  );
}

// --- DATA COMPONENTS ---

export function StatusBadge({
  status,
  variant = 'neutral',
}: {
  status: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}) {
  const styles = {
    success: 'text-emerald-700 dark:text-emerald-400',
    warning: 'text-amber-700 dark:text-amber-400',
    danger: 'text-red-700 dark:text-red-400',
    info: 'text-[#002147] dark:text-[#D2B48C]',
    neutral: 'text-slate-600 dark:text-slate-400',
  };

  const icons = {
    success: <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />,
    warning: <Clock className="w-3.5 h-3.5 shrink-0" />,
    danger: <AlertCircle className="w-3.5 h-3.5 shrink-0" />,
    info: <Info className="w-3.5 h-3.5 shrink-0" />,
    neutral: <FileText className="w-3.5 h-3.5 shrink-0" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${styles[variant]}`}
    >
      {icons[variant]}
      <span>{status}</span>
    </span>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Cari data...',
  label = 'Pencarian data',
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
}) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <label className="sr-only">{label}</label>
      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-full border border-[#D2B48C]/60 dark:border-slate-700 bg-[#FAF6F0]/70 dark:bg-slate-950 text-[#002147] dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002147]"
      />
    </div>
  );
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}: {
  startDate: string;
  endDate: string;
  onStartChange: (val: string) => void;
  onEndChange: (val: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
          Dari:
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
          aria-label="Tanggal Mulai"
          className="px-3 py-1.5 text-xs font-mono tabular-nums rounded-full border border-[#D2B48C]/60 dark:border-slate-700 bg-[#FAF6F0]/70 dark:bg-slate-950 text-[#002147] dark:text-slate-200"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
          Sampai:
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          aria-label="Tanggal Akhir"
          className="px-3 py-1.5 text-xs font-mono tabular-nums rounded-full border border-[#D2B48C]/60 dark:border-slate-700 bg-[#FAF6F0]/70 dark:bg-slate-950 text-[#002147] dark:text-slate-200"
        />
      </div>
    </div>
  );
}

export function FilterToolbar({
  children,
  onReset,
}: {
  children: React.ReactNode;
  onReset?: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-[#D2B48C]/45 dark:border-slate-800 bg-white/95 dark:bg-[#001835]/90 backdrop-blur-xs p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3 flex-1">{children}</div>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#002147] dark:text-slate-300 hover:bg-[#F5EDE0] dark:hover:bg-slate-800 rounded-full border border-[#D2B48C]/60 dark:border-slate-700 transition-colors whitespace-nowrap shrink-0 self-end md:self-auto"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Reset Filter</span>
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  icon,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-[26px] border border-dashed border-[#D2B48C]/80 dark:border-slate-800 bg-white/85 dark:bg-[#001835]/60 p-8 sm:p-10 text-center flex flex-col items-center justify-center max-w-2xl mx-auto my-2">
      <div className="w-12 h-12 rounded-2xl bg-[#F5EDE0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] flex items-center justify-center mb-3">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-[#002147] dark:text-slate-100">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md leading-relaxed">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-full bg-[#002147] text-white hover:bg-[#001630] transition-colors whitespace-nowrap shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#D2B48C]" />
          <span>{actionLabel}</span>
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-full bg-[#002147] text-white hover:bg-[#001630] transition-colors whitespace-nowrap shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#D2B48C]" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#D2B48C]/35 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
      <div>
        Total{' '}
        <span className="font-mono tabular-nums font-semibold text-[#002147] dark:text-slate-200">
          {totalItems}
        </span>{' '}
        baris data
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Halaman Sebelumnya"
          className="p-1.5 rounded-full border border-[#D2B48C]/60 dark:border-slate-700 disabled:opacity-40 hover:bg-[#F5EDE0] dark:hover:bg-slate-800"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-mono tabular-nums">
          Hal {currentPage} / {Math.max(1, totalPages)}
        </span>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Halaman Berikutnya"
          className="p-1.5 rounded-full border border-[#D2B48C]/60 dark:border-slate-700 disabled:opacity-40 hover:bg-[#F5EDE0] dark:hover:bg-slate-800"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// --- FORM COMPONENTS ---

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-[#D2B48C]/45 dark:border-slate-800 bg-white/95 dark:bg-[#001835]/90 backdrop-blur-xs p-6 shadow-[0_12px_32px_-12px_rgba(0,33,71,0.08)] space-y-5">
      <div className="pb-3 border-b border-[#D2B48C]/30 dark:border-slate-800">
        <h2 className="text-base font-semibold text-[#002147] dark:text-slate-100">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  error,
  multiline = false,
  rows = 3,
  helperText,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
  multiline?: boolean;
  rows?: number;
  helperText?: string;
}) {
  const id = `field-${name}`;
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-[#002147] dark:text-slate-300"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 text-sm rounded-2xl border bg-[#FAF6F0]/60 dark:bg-slate-950 text-[#002147] dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002147] ${
            error ? 'border-red-500' : 'border-[#D2B48C]/60 dark:border-slate-700'
          }`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 text-sm rounded-2xl border bg-[#FAF6F0]/60 dark:bg-slate-950 text-[#002147] dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002147] ${
            type === 'date' ? 'font-mono tabular-nums' : ''
          } ${
            error ? 'border-red-500' : 'border-[#D2B48C]/60 dark:border-slate-700'
          }`}
        />
      )}
      {helperText && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  error,
  placeholder = 'Pilih salah satu...',
}: {
  label: string;
  name: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  error?: string;
  placeholder?: string;
}) {
  const id = `select-${name}`;
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-[#002147] dark:text-slate-300"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2.5 text-sm rounded-2xl border bg-[#FAF6F0]/60 dark:bg-slate-950 text-[#002147] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#002147] ${
          error ? 'border-red-500' : 'border-[#D2B48C]/60 dark:border-slate-700'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export function FileUploader({
  attachments,
  onChange,
  label = 'Dokumentasi Foto Lapangan',
}: {
  attachments: PhotoAttachmentMeta[];
  onChange: (items: PhotoAttachmentMeta[]) => void;
  label?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: PhotoAttachmentMeta[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const check = validateFileUpload({
        name: f.name,
        type: f.type,
        size: f.size,
      });
      if (!check.valid) {
        setUploadError(check.error || 'File tidak valid.');
        continue;
      }

      const objectUrl = URL.createObjectURL(f);
      newAttachments.push({
        id: `att-${Date.now()}-${i}`,
        fileName: f.name,
        mimeType: f.type,
        sizeBytes: f.size,
        caption: '',
        previewUrl: objectUrl,
        createdAt: new Date().toISOString(),
      });
    }

    if (newAttachments.length > 0) {
      onChange([...attachments, ...newAttachments]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCaptionChange = (id: string, caption: string) => {
    onChange(
      attachments.map((att) => (att.id === id ? { ...att, caption } : att))
    );
  };

  const handleRemove = (id: string) => {
    onChange(attachments.filter((att) => att.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#002147] dark:text-slate-300">
          {label}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Format JPG/PNG/WebP · Maks. 5 MB/foto · Tanpa Geotag Otomatis
        </span>
      </div>

      <div className="rounded-2xl border border-dashed border-[#D2B48C] dark:border-slate-700 bg-[#FAF6F0]/70 dark:bg-slate-950/50 p-5 text-center space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          multiple
          onChange={handleFilesSelected}
          className="hidden"
          id="sikesling-photo-upload"
        />
        <div className="w-10 h-10 rounded-2xl bg-[#F5EDE0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] flex items-center justify-center mx-auto">
          <Upload className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-medium text-[#002147] dark:text-slate-200">
            Ambil Foto Kamera Smartphone atau Unggah File Gambar
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mendukung multi-foto, preview langsung, dan keterangan per dokumentasi. Penyimpanan produksi dirancang pada direktori privat terkontrol.
          </p>
        </div>
        <div>
          <label
            htmlFor="sikesling-photo-upload"
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-full bg-white dark:bg-[#002147] border border-[#D2B48C]/70 dark:border-slate-700 text-[#002147] dark:text-slate-200 hover:bg-[#F5EDE0] dark:hover:bg-slate-800 cursor-pointer transition-colors shadow-2xs"
          >
            <ImageIcon className="w-4 h-4 text-[#002147] dark:text-[#D2B48C]" />
            <span>Pilih Foto / Buka Kamera</span>
          </label>
        </div>
      </div>

      {uploadError && (
        <div className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/40 px-4 py-2.5 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="rounded-2xl border border-[#D2B48C]/50 dark:border-slate-800 bg-white dark:bg-[#001835] p-3.5 flex flex-col gap-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#002147] dark:text-slate-200 truncate">
                    {att.fileName}
                  </p>
                  <p className="text-[11px] font-mono tabular-nums text-slate-400">
                    {(att.sizeBytes / 1024).toFixed(1)} KB · {att.mimeType}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(att.id)}
                  aria-label={`Hapus foto ${att.fileName}`}
                  className="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={att.caption}
                onChange={(e) => handleCaptionChange(att.id, e.target.value)}
                placeholder="Tambahkan keterangan foto (misal: Kondisi bak kontrol IPAL)..."
                aria-label={`Keterangan untuk ${att.fileName}`}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#D2B48C]/50 dark:border-slate-700 bg-[#FAF6F0] dark:bg-slate-950 text-[#002147] dark:text-slate-200"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- MODULE PLACEHOLDER COMPONENT (PRIORITY 5) ---

export function ModulePlaceholder({
  title,
  description,
  status = 'Placeholder',
  plannedFeatures,
  consultationNotes,
  children,
}: {
  title: string;
  description: string;
  status?: ModuleStatusType;
  plannedFeatures: string[];
  consultationNotes?: string[];
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Official Development Stage Notice */}
      <div className="rounded-[26px] border border-[#D2B48C]/60 dark:border-[#D2B48C]/25 bg-white/95 dark:bg-[#001835]/90 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#002147] text-[#D2B48C] flex items-center justify-center shrink-0 mt-0.5">
            <Wrench className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-[#002147] dark:text-slate-100">
                Modul ini sedang dalam tahap pengembangan.
              </h2>
              <span className="text-xs text-[#002147] dark:text-[#D2B48C] font-semibold">
                · Status: {status} (Tahap 1 — Foundation)
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              Wadah arsitektur, rute navigasi, dan tata letak antarmuka untuk{' '}
              <strong>{title}</strong> telah disiapkan. Aturan teknis, parameter pemeriksaan, dan ambang batas baku mutu sengaja tidak dikunci (tidak di-hardcode) hingga diverifikasi bersama petugas Kesehatan Lingkungan UOBK RSUD Al-Mulk Kota Sukabumi.
            </p>
          </div>
        </div>
      </div>

      {children}

      {/* Planned Features & Consultation Scope */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[26px] border border-[#D2B48C]/45 dark:border-slate-800 bg-white/95 dark:bg-[#001835] p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#002147] dark:text-slate-100 font-semibold text-sm">
            <Layers className="w-4 h-4 text-[#002147] dark:text-[#D2B48C]" />
            <h3>Fitur yang Direncanakan pada Tahap Berikutnya</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
          <ul className="space-y-2 pt-1">
            {plannedFeatures.map((feat, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
              >
                <span className="font-mono text-xs font-semibold text-[#002147] dark:text-[#D2B48C] mt-0.5">
                  0{i + 1}.
                </span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[26px] border border-[#D2B48C]/45 dark:border-slate-800 bg-white/95 dark:bg-[#001835] p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#002147] dark:text-slate-100 font-semibold text-sm">
            <Sparkles className="w-4 h-4 text-[#002147] dark:text-[#D2B48C]" />
            <h3>Kesiapan Data-Driven & Konsultasi Kesling</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kebutuhan spesifikasi yang akan dikonfigurasi bersama tim Kesling RSUD Al-Mulk:
          </p>
          <ul className="space-y-2 pt-1">
            {(consultationNotes && consultationNotes.length > 0
              ? consultationNotes
              : [
                  'Konfirmasi parameter pemeriksaan dan satuan ukur resmi rumah sakit',
                  'Penetapan frekuensi pemantauan (harian, mingguan, bulanan, semesteran)',
                  'Format tabel rekapitulasi untuk pelaporan internal dan eksternal',
                ]
            ).map((note, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
              >
                <span className="font-mono text-xs font-semibold text-[#002147] dark:text-[#D2B48C] mt-0.5">
                  •
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Memuat data">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="h-12 w-full rounded-2xl bg-slate-100 dark:bg-slate-800/70 animate-pulse"
        />
      ))}
    </div>
  );
}
