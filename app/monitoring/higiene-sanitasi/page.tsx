import { MonitoringSubmoduleView } from '@/components/sikesling/monitoring-views';

export default function MonitoringHigieneSanitasiPage() {
  return (
    <MonitoringSubmoduleView
      routePath="/monitoring/higiene-sanitasi"
      subCategories={['Kebersihan Ruangan', 'Fasilitas Sanitasi & Toilet', 'Pengelolaan Linen']}
    />
  );
}
