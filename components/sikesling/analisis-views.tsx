'use client';

import React from 'react';
import Link from 'next/link';
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  PieChart as PieChartIcon,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { resolveRouteMeta } from '@/lib/navigation';
import { useApp } from '@/components/sikesling/app-provider';
import {
  PageContainer,
  PageHeader,
  SummaryCard,
  ChartContainer,
  ModulePlaceholder,
} from '@/components/sikesling/ui-system';
import { FINDING_WORKFLOW_ORDER } from '@/lib/domain';

export function AnalisisView({ routePath }: { routePath: string }) {
  const meta = resolveRouteMeta(routePath);
  const { activities, supervisions, findings } = useApp();

  // Compute real chart series from session state
  const activityByCat = Object.values(
    activities.reduce<Record<string, { label: string; total: number }>>((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { label: item.category.slice(0, 22), total: 0 };
      }
      acc[item.category].total += 1;
      return acc;
    }, {})
  );

  const supervisionByRoom = Object.values(
    supervisions.reduce<Record<string, { label: string; total: number }>>((acc, item) => {
      if (!acc[item.roomOrUnit]) {
        acc[item.roomOrUnit] = { label: item.roomOrUnit.slice(0, 20), total: 0 };
      }
      acc[item.roomOrUnit].total += 1;
      return acc;
    }, {})
  );

  const findingDist = FINDING_WORKFLOW_ORDER.map((status) => ({
    name: status,
    count: findings.filter((f) => f.status === status).length,
  }));

  const activeFindingsCount = findings.length;
  const verifiedFindingsCount = findings.filter(
    (f) => f.status === 'Selesai Terverifikasi'
  ).length;
  const completionRate =
    activeFindingsCount > 0
      ? Math.round((verifiedFindingsCount / activeFindingsCount) * 100)
      : 0;

  const COLORS = ['#D97706', '#0284C7', '#7C3AED', '#1D7AFC'];

  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description={meta.description}
        status={meta.status}
        breadcrumbs={meta.breadcrumbs}
      />

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <SummaryCard
          title="Data Kegiatan Aktual"
          value={activities.length}
          subtitle="Sumber: Pencatatan Harian"
          icon={<ClipboardList className="w-5 h-5" />}
        />
        <SummaryCard
          title="Data Supervisi Aktual"
          value={supervisions.length}
          subtitle="Sumber: Supervisi Ruangan"
          icon={<ShieldCheck className="w-5 h-5" />}
        />
        <SummaryCard
          title="Total Temuan Tercatat"
          value={findings.length}
          subtitle="Sumber: Alur Tindak Lanjut"
          icon={<PieChartIcon className="w-5 h-5" />}
        />
        <SummaryCard
          title="Rasio Verifikasi Selesai"
          value={findings.length === 0 ? '0%' : `${completionRate}%`}
          subtitle="Dari total temuan sesi ini"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
      </div>

      {/* Reusable Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <ChartContainer
          title="Bar Chart — Distribusi Kegiatan per Kategori"
          subtitle="Komponen grafik batang reusable berbasis data aktual"
          isEmpty={activityByCat.length === 0}
          emptyMessage="Belum ada data kegiatan operasional tercatat. Catat kegiatan harian untuk menampilkan Bar Chart."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityByCat}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#1D7AFC" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Area / Line Chart */}
        <ChartContainer
          title="Area & Line Chart — Frekuensi Supervisi per Ruangan"
          subtitle="Visualisasi cakupan pemeriksaan lapangan"
          isEmpty={supervisionByRoom.length === 0}
          emptyMessage="Belum ada data supervisi tercatat. Isi formulir Mulai Supervisi untuk menampilkan grafik."
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={supervisionByRoom}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#153E75"
                fill="#153E75"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Donut Chart */}
        <ChartContainer
          title="Donut Chart — Distribusi Status Tindak Lanjut"
          subtitle="Proporsi temuan pada tiap tahap alur kerja"
          isEmpty={findings.length === 0}
          emptyMessage="Belum terdapat data temuan lapangan untuk divisualisasikan pada Donut Chart."
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={findingDist.filter((d) => d.count > 0)}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
              >
                {findingDist.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Progress Indicator & Status Distribution */}
        <div className="rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] p-5 flex flex-col justify-between gap-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Progress Indicator & Status Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rincian kuantitatif per tahapan alur kerja tindak lanjut temuan
            </p>
          </div>

          <div className="space-y-4 my-auto">
            {findingDist.map((item, idx) => {
              const pct =
                findings.length > 0
                  ? Math.round((item.count / findings.length) * 100)
                  : 0;
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      0{idx + 1}. {item.name}
                    </span>
                    <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {item.count} temuan ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#153E75] transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {(routePath === '/analisis/monitoring' || routePath === '/analisis/tren') && (
        <ModulePlaceholder
          title={meta.title}
          description={meta.description}
          status={meta.status}
          plannedFeatures={
            meta.subMenu?.plannedFeatures || [
              'Visualisasi parameter teknis lingkungan rumah sakit setelah standar ditetapkan',
            ]
          }
        />
      )}
    </PageContainer>
  );
}
