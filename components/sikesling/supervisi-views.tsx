'use client';

import React from 'react';
import { resolveRouteMeta } from '@/lib/navigation';
import { PageContainer, PageHeader } from '@/components/sikesling/ui-system';
import { AplicleanModuleId } from '@/lib/apliclean';
import { SupervisiCardId } from '@/lib/supervisi-hub';
import { SupervisiHubWorkspace } from '@/components/sikesling/supervisi-hub-workspace';

function mapAplicleanModuleToCardId(mod: AplicleanModuleId): SupervisiCardId {
  switch (mod) {
    case 'RAWAT_JALAN':
      return 'RAWAT_JALAN';
    case 'IGD':
      return 'IGD';
    case 'ICU_IBS':
      return 'RANAP_ICU_IBS';
    case 'RANAP':
      return 'RANAP_USMAN';
    case 'SUPERVISI':
    default:
      return 'SUPERVISI';
  }
}

export function SupervisiDashboardView({
  routePath = '/supervisi/dashboard',
}: {
  routePath?: string;
}) {
  const meta = resolveRouteMeta(routePath);

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard Supervisi"
        status="Functional"
        breadcrumbs={meta.breadcrumbs}
      />
      <SupervisiHubWorkspace initialMode="cards" initialCardId="SUPERVISI" />
    </PageContainer>
  );
}

export function MulaiSupervisiView({
  initialModule,
  initialTab = 'input',
}: {
  initialModule?: AplicleanModuleId;
  initialTab?: 'input' | 'matrix' | 'gallery';
} = {}) {
  const cardId = initialModule
    ? mapAplicleanModuleToCardId(initialModule)
    : 'SUPERVISI';
  const mode =
    initialTab === 'matrix' ? 'table' : initialModule ? 'form' : 'cards';

  return (
    <PageContainer>
      <SupervisiHubWorkspace initialMode={mode} initialCardId={cardId} />
    </PageContainer>
  );
}

export function RiwayatSupervisiView() {
  const meta = resolveRouteMeta('/supervisi/riwayat');

  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description={meta.description}
        status="Functional"
        breadcrumbs={meta.breadcrumbs}
      />
      <SupervisiHubWorkspace initialMode="table" initialCardId="SUPERVISI" />
    </PageContainer>
  );
}

export function DokumentasiSupervisiView() {
  const meta = resolveRouteMeta('/supervisi/dokumentasi');

  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description={meta.description}
        status="Functional"
        breadcrumbs={meta.breadcrumbs}
      />
      <SupervisiHubWorkspace initialMode="table" initialCardId="SUPERVISI" />
    </PageContainer>
  );
}

export function SupervisiPlaceholderSubView({
  routePath,
}: {
  routePath: string;
}) {
  const meta = resolveRouteMeta(routePath);
  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description={meta.description}
        status="Functional"
        breadcrumbs={meta.breadcrumbs}
      />
      <SupervisiHubWorkspace initialMode="cards" initialCardId="SUPERVISI" />
    </PageContainer>
  );
}
