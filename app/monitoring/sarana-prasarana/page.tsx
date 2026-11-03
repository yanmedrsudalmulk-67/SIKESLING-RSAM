import { SaranaPrasaranaView } from '@/components/sikesling/sarana-prasarana-view';

export const metadata = {
  title: 'Monitoring Sarana dan Prasarana — SIKRESMI RSUD Al-Mulk',
  description:
    'Pemantauan fisik sarana prasarana rumah sakit (Toilet, Lantai, Pintu/Jendela, Atap, Langit-langit) dengan rekapan 6 sheet, grafik interaktif, analisa, dan RTL.',
};

export default function SaranaPrasaranaPage() {
  return <SaranaPrasaranaView />;
}
