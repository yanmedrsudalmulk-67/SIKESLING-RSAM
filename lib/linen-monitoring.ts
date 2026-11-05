export type LinenChoice = 'ya' | 'tidak' | null;

export interface LinenMonitoringRow {
  no: number;
  monthLabel: string;
  monthShort: string;
  mouPihakKetiga: LinenChoice;
  pemilahanInfeksius: LinenChoice;
  pengawasan: LinenChoice;
  capaian: number;
}

export interface LinenSummaryStats {
  totalMonths: number;
  avgCapaian: number;
  minCapaian: number;
  maxCapaian: number;
  perfect100Count: number;
  partialCount: number;
  mouYaCount: number;
  mouTidakCount: number;
  mouRate: number;
  pemilahanYaCount: number;
  pemilahanTidakCount: number;
  pemilahanRate: number;
  pengawasanYaCount: number;
  pengawasanTidakCount: number;
  pengawasanRate: number;
  months100List: string[];
  monthsPartialList: { month: string; capaian: number }[];
  tidakFindings: { month: string; indicator: string }[];
  analysisText: string;
  recommendations: string[];
  followUpPlans: string[];
}

export const LINEN_MONTHS: { no: number; monthLabel: string; monthShort: string }[] = [
  { no: 1, monthLabel: 'Januari', monthShort: 'Jan' },
  { no: 2, monthLabel: 'Februari', monthShort: 'Feb' },
  { no: 3, monthLabel: 'Maret', monthShort: 'Mar' },
  { no: 4, monthLabel: 'April', monthShort: 'Apr' },
  { no: 5, monthLabel: 'Mei', monthShort: 'Mei' },
  { no: 6, monthLabel: 'Juni', monthShort: 'Jun' },
  { no: 7, monthLabel: 'Juli', monthShort: 'Jul' },
  { no: 8, monthLabel: 'Agustus', monthShort: 'Agu' },
  { no: 9, monthLabel: 'September', monthShort: 'Sep' },
  { no: 10, monthLabel: 'Oktober', monthShort: 'Okt' },
  { no: 11, monthLabel: 'November', monthShort: 'Nov' },
  { no: 12, monthLabel: 'Desember', monthShort: 'Des' },
];

/**
 * Menghitung persentase capaian berdasarkan 3 indikator penyelenggaraan linen:
 * 3 'ya' -> 100%, 2 'ya' -> 67%, 1 'ya' -> 33%, 0 'ya' -> 0%
 */
export function calculateLinenRowCapaian(
  mouPihakKetiga: LinenChoice,
  pemilahanInfeksius: LinenChoice,
  pengawasan: LinenChoice
): number {
  let yaCount = 0;
  if (mouPihakKetiga === 'ya') yaCount += 1;
  if (pemilahanInfeksius === 'ya') yaCount += 1;
  if (pengawasan === 'ya') yaCount += 1;
  return Math.round((yaCount / 3) * 100);
}

/**
 * Data awal Penyelenggaraan Linen sesuai referensi gambar (Jan–Feb 100%, Mar–Okt 67%, Nov–Des 100%)
 */
export function createInitialLinenMonitoringData(): LinenMonitoringRow[] {
  return LINEN_MONTHS.map((m) => {
    // Bulan 1..10 terisi (100% dari data inspeksi riil), Bulan 11 & 12 kosong / belum diinput
    const isRecorded = m.no <= 10;
    return {
      no: m.no,
      monthLabel: m.monthLabel,
      monthShort: m.monthShort,
      mouPihakKetiga: isRecorded ? 'ya' : null,
      pemilahanInfeksius: isRecorded ? 'ya' : null,
      pengawasan: isRecorded ? 'ya' : null,
      capaian: isRecorded ? 100 : 0,
    };
  });
}

/**
 * Membuat baris tabel kosong untuk input baru secara realtime dari nol
 */
export function createEmptyLinenMonitoringData(): LinenMonitoringRow[] {
  return LINEN_MONTHS.map((m) => ({
    no: m.no,
    monthLabel: m.monthLabel,
    monthShort: m.monthShort,
    mouPihakKetiga: null,
    pemilahanInfeksius: null,
    pengawasan: null,
    capaian: 0,
  }));
}

/**
 * Menghitung statistik ringkasan, analisa otomatis, rekomendasi, dan rencana tindak lanjut
 * berdasarkan data tabel Penyelenggaraan Linen yang sedang ditampilkan.
 */
export function calculateLinenSummary(rows: LinenMonitoringRow[]): LinenSummaryStats {
  const safeRows = rows.length > 0 ? rows : createInitialLinenMonitoringData();
  const totalMonths = safeRows.length;

  const totalCapaian = safeRows.reduce((acc, r) => acc + (Number(r.capaian) || 0), 0);
  const avgCapaian = totalMonths > 0 ? Math.round((totalCapaian / totalMonths) * 10) / 10 : 0;

  const capaianValues = safeRows.map((r) => Number(r.capaian) || 0);
  const minCapaian = capaianValues.length > 0 ? Math.min(...capaianValues) : 0;
  const maxCapaian = capaianValues.length > 0 ? Math.max(...capaianValues) : 0;

  const perfect100Count = safeRows.filter((r) => r.capaian >= 100).length;
  const partialCount = safeRows.filter((r) => r.capaian < 100).length;

  const mouYaCount = safeRows.filter((r) => r.mouPihakKetiga === 'ya').length;
  const mouTidakCount = safeRows.filter((r) => r.mouPihakKetiga === 'tidak').length;
  const mouRate = totalMonths > 0 ? Math.round((mouYaCount / totalMonths) * 100) : 0;

  const pemilahanYaCount = safeRows.filter((r) => r.pemilahanInfeksius === 'ya').length;
  const pemilahanTidakCount = safeRows.filter((r) => r.pemilahanInfeksius === 'tidak').length;
  const pemilahanRate = totalMonths > 0 ? Math.round((pemilahanYaCount / totalMonths) * 100) : 0;

  const pengawasanYaCount = safeRows.filter((r) => r.pengawasan === 'ya').length;
  const pengawasanTidakCount = safeRows.filter((r) => r.pengawasan === 'tidak').length;
  const pengawasanRate = totalMonths > 0 ? Math.round((pengawasanYaCount / totalMonths) * 100) : 0;

  const months100List = safeRows
    .filter((r) => r.capaian >= 100)
    .map((r) => r.monthLabel);

  const monthsPartialList = safeRows
    .filter((r) => r.capaian < 100)
    .map((r) => ({ month: r.monthLabel, capaian: r.capaian }));

  const tidakFindings: { month: string; indicator: string }[] = [];
  for (const r of safeRows) {
    if (r.mouPihakKetiga === 'tidak') {
      tidakFindings.push({
        month: r.monthLabel,
        indicator: 'Adanya MoU dengan Pihak Ketiga',
      });
    }
    if (r.pemilahanInfeksius === 'tidak') {
      tidakFindings.push({
        month: r.monthLabel,
        indicator: 'Pemilahan antara linen infeksius dan non infeksius',
      });
    }
    if (r.pengawasan === 'tidak') {
      tidakFindings.push({
        month: r.monthLabel,
        indicator: 'Pelaksanaan pengawasan penyelenggaraan linen',
      });
    }
  }

  // Generate dynamic analysis text
  const months100Text =
    months100List.length > 0
      ? `Capaian paripurna (100%) tercatat pada ${months100List.length} bulan (${months100List.join(', ')})`
      : 'Belum terdapat bulan yang mencapai nilai paripurna 100%';

  const monthsPartialText =
    monthsPartialList.length > 0
      ? `, sedangkan ${monthsPartialList.length} bulan lainnya (${monthsPartialList
          .map((m) => `${m.month} ${m.capaian}%`)
          .join(', ')}) berada di bawah 100% dan memerlukan penguatan operasional serta kelengkapan verifikasi lapangan`
      : ', sehingga seluruh periode pemantauan telah mencapai target 100% secara konsisten';

  const tidakNoteText =
    tidakFindings.length > 0
      ? ` Selain itu, ditemukan ${tidakFindings.length} ketidaksesuaian indikator ("Tidak"), antara lain pada: ${tidakFindings
          .slice(0, 4)
          .map((f) => `${f.indicator} (${f.month})`)
          .join('; ')}.`
      : ' Pada aspek pemenuhan checklist parameter, indikator Adanya MoU dengan Pihak Ketiga mencapai ' +
        `${mouRate}%, Pemilahan Linen Infeksius dan Non Infeksius sebesar ${pemilahanRate}%, serta Pelaksanaan Pengawasan sebesar ${pengawasanRate}%.`;

  const analysisText = `Berdasarkan hasil pemantauan Penyelenggaraan Linen di UOBK RSUD Al-Mulk Kota Sukabumi selama ${totalMonths} bulan periode berjalan, rata-rata capaian penyelenggaraan linen berada pada angka ${avgCapaian}% (dengan rentang capaian terendah ${minCapaian}% dan tertinggi ${maxCapaian}%). ${months100Text}${monthsPartialText}.${tidakNoteText} Berdasarkan standar Permenkes RI Nomor 7 Tahun 2019 tentang Kesehatan Lingkungan Rumah Sakit, pengelolaan linen wajib menjamin kepastian perjanjian kerjasama (MoU) yang aktif dengan pihak ketiga apabila dilakukan secara outsourcing, pemisahan ketat antara kantong linen infeksius (kuning) dan non-infeksius sejak dari ruangan penghasil, serta pengawasan mutu pencucian dan distribusi secara berkesinambungan.`;

  // Generate dynamic recommendations
  const recommendations: string[] = [];

  if (mouTidakCount > 0 || mouRate < 100) {
    recommendations.push(
      'Memastikan dokumen Perjanjian Kerja Sama (MoU) penyelenggaraan pencucian linen dengan pihak ketiga selalu aktif, terdokumentasi lengkap dengan SLA (Service Level Agreement), dan dievaluasi masa berlakunya sebelum berakhir.'
    );
  } else {
    recommendations.push(
      'Mempertahankan kepatuhan dokumen MoU dengan Pihak Ketiga yang telah berjalan 100% serta melakukan evaluasi berkala terhadap pemenuhan klausul standar mutu hasil cucian linen rumah sakit.'
    );
  }

  if (pemilahanTidakCount > 0 || pemilahanRate < 100) {
    recommendations.push(
      'Meningkatkan kedisiplinan perawat dan petugas ruangan dalam melakukan pemilahan linen infeksius dan non-infeksius menggunakan wadah/kantong terpisah berlabel khusus sejak dari titik penghasil (bedside).'
    );
  } else {
    recommendations.push(
      'Mempertahankan konsistensi pemilahan antara linen infeksius dan non-infeksius di seluruh ruang rawat inap, IGD, ICU, OK, dan poliklinik agar tidak terjadi kontaminasi silang (cross-contamination).'
    );
  }

  if (pengawasanTidakCount > 0 || pengawasanRate < 100 || partialCount > 0) {
    recommendations.push(
      `Mengoptimalkan frekuensi pengawasan dan verifikasi kelengkapan dokumen berita acara serah terima linen, terutama pada periode bulan yang masih memiliki capaian ${minCapaian}% agar seluruh indikator mencapai 100%.`
    );
  } else {
    recommendations.push(
      'Mempertahankan pengawasan rutin tahapan pengumpulan, pengangkutan, pencucian, penyimpanan di ruang linen bersih, hingga pendistribusian kembali ke unit pelayanan.'
    );
  }

  recommendations.push(
    'Melaksanakan pemeriksaan kualitas fisik, kimia, dan mikrobiologi (uji usap linen bersih) secara berkala untuk memastikan linen bebas dari kuman patogen, noda, dan residu bahan kimia deterjen/desinfektan.'
  );

  // Generate dynamic follow-up plans (Rencana Tindak Lanjut)
  const followUpPlans: string[] = [];

  if (partialCount > 0) {
    followUpPlans.push(
      `Melakukan audit dan evaluasi bersama petugas laundry/penanggung jawab linen pada bulan dengan capaian < 100% (${monthsPartialList
        .slice(0, 4)
        .map((m) => m.month)
        .join(', ')}${monthsPartialList.length > 4 ? ', dst.' : ''}) untuk melengkapi seluruh bukti fisik dan log pengawasan.`
    );
  } else {
    followUpPlans.push(
      'Melaksanakan monitoring dan supervisi bulanan secara konsisten menggunakan daftar tilik (checklist) Penyelenggaraan Linen sesuai Permenkes No. 7 Tahun 2019.'
    );
  }

  followUpPlans.push(
    'Melakukan inspeksi lapangan ke unit penghasil linen dan ruang transit linen (linen kotor & linen bersih) untuk memastikan troli pengangkut linen bersih dan linen kotor terpisah serta tertutup rapat.'
  );

  followUpPlans.push(
    'Menyelenggarakan koordinasi dan evaluasi triwulanan dengan pihak ketiga penyedia jasa pencucian linen terkait ketepatan waktu distribusi, suhu pencucian termal (70°C selama 25 menit atau 95°C selama 10 menit), dan takaran desinfektan.'
  );

  followUpPlans.push(
    'Mendokumentasikan hasil pemantauan penyelenggaraan linen setiap bulan ke dalam sistem SIKRESMI dan melaporkannya pada Laporan Berkala Kesehatan Lingkungan Rumah Sakit.'
  );

  return {
    totalMonths,
    avgCapaian,
    minCapaian,
    maxCapaian,
    perfect100Count,
    partialCount,
    mouYaCount,
    mouTidakCount,
    mouRate,
    pemilahanYaCount,
    pemilahanTidakCount,
    pemilahanRate,
    pengawasanYaCount,
    pengawasanTidakCount,
    pengawasanRate,
    months100List,
    monthsPartialList,
    tidakFindings,
    analysisText,
    recommendations,
    followUpPlans,
  };
}
