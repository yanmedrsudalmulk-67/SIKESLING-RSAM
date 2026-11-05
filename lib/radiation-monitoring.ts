export type RadiationChoice = 'ya' | 'tidak' | null;

export interface RadiationMonitoringRow {
  no: number;
  monthLabel: string;
  monthShort: string;
  izinBapeten: RadiationChoice;
  peralatanProteksi: RadiationChoice;
  pemantauanPekerja: RadiationChoice;
  capaian: number;
}

export interface RadiationSummaryStats {
  totalMonths: number;
  avgCapaian: number;
  minCapaian: number;
  maxCapaian: number;
  perfect100Count: number;
  partialCount: number;
  izinBapetenYaCount: number;
  izinBapetenTidakCount: number;
  izinBapetenRate: number;
  peralatanProteksiYaCount: number;
  peralatanProteksiTidakCount: number;
  peralatanProteksiRate: number;
  pemantauanPekerjaYaCount: number;
  pemantauanPekerjaTidakCount: number;
  pemantauanPekerjaRate: number;
  months100List: string[];
  monthsPartialList: { month: string; capaian: number }[];
  tidakFindings: { month: string; indicator: string }[];
  analysisText: string;
  recommendations: string[];
  followUpPlans: string[];
}

export const RADIATION_MONTHS: {
  no: number;
  monthLabel: string;
  monthShort: string;
}[] = [
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
 * Menghitung persentase capaian berdasarkan 3 indikator pengamanan radiasi:
 * 3 'ya' -> 100%, 2 'ya' -> 67%, 1 'ya' -> 33%, 0 'ya' -> 0%
 */
export function calculateRadiationRowCapaian(
  izinBapeten: RadiationChoice,
  peralatanProteksi: RadiationChoice,
  pemantauanPekerja: RadiationChoice
): number {
  let yaCount = 0;
  if (izinBapeten === 'ya') yaCount += 1;
  if (peralatanProteksi === 'ya') yaCount += 1;
  if (pemantauanPekerja === 'ya') yaCount += 1;
  return Math.round((yaCount / 3) * 100);
}

/**
 * Data awal Pengamanan Radiasi sesuai referensi gambar (Januari–Desember 100%, ketiga indikator 'ya')
 */
export function createInitialRadiationMonitoringData(): RadiationMonitoringRow[] {
  return RADIATION_MONTHS.map((m) => {
    // Bulan 1..10 terisi (100% dari data inspeksi riil), Bulan 11 & 12 kosong / belum diinput
    const isRecorded = m.no <= 10;
    return {
      no: m.no,
      monthLabel: m.monthLabel,
      monthShort: m.monthShort,
      izinBapeten: isRecorded ? 'ya' : null,
      peralatanProteksi: isRecorded ? 'ya' : null,
      pemantauanPekerja: isRecorded ? 'ya' : null,
      capaian: isRecorded ? 100 : 0,
    };
  });
}

/**
 * Membuat baris tabel kosong untuk input baru secara realtime
 */
export function createEmptyRadiationMonitoringData(): RadiationMonitoringRow[] {
  return RADIATION_MONTHS.map((m) => ({
    no: m.no,
    monthLabel: m.monthLabel,
    monthShort: m.monthShort,
    izinBapeten: null,
    peralatanProteksi: null,
    pemantauanPekerja: null,
    capaian: 0,
  }));
}

/**
 * Menghitung statistik ringkasan, analisa otomatis, rekomendasi, dan rencana tindak lanjut
 * berdasarkan data tabel Pengamanan Radiasi yang sedang ditampilkan.
 */
export function calculateRadiationSummary(
  rows: RadiationMonitoringRow[]
): RadiationSummaryStats {
  const safeRows =
    rows.length > 0 ? rows : createInitialRadiationMonitoringData();
  const totalMonths = safeRows.length;

  const totalCapaian = safeRows.reduce(
    (acc, r) => acc + (Number(r.capaian) || 0),
    0
  );
  const avgCapaian =
    totalMonths > 0 ? Math.round((totalCapaian / totalMonths) * 10) / 10 : 0;

  const capaianValues = safeRows.map((r) => Number(r.capaian) || 0);
  const minCapaian = capaianValues.length > 0 ? Math.min(...capaianValues) : 0;
  const maxCapaian = capaianValues.length > 0 ? Math.max(...capaianValues) : 0;

  const perfect100Count = safeRows.filter((r) => r.capaian >= 100).length;
  const partialCount = safeRows.filter((r) => r.capaian < 100).length;

  const izinBapetenYaCount = safeRows.filter(
    (r) => r.izinBapeten === 'ya'
  ).length;
  const izinBapetenTidakCount = safeRows.filter(
    (r) => r.izinBapeten === 'tidak'
  ).length;
  const izinBapetenRate =
    totalMonths > 0 ? Math.round((izinBapetenYaCount / totalMonths) * 100) : 0;

  const peralatanProteksiYaCount = safeRows.filter(
    (r) => r.peralatanProteksi === 'ya'
  ).length;
  const peralatanProteksiTidakCount = safeRows.filter(
    (r) => r.peralatanProteksi === 'tidak'
  ).length;
  const peralatanProteksiRate =
    totalMonths > 0
      ? Math.round((peralatanProteksiYaCount / totalMonths) * 100)
      : 0;

  const pemantauanPekerjaYaCount = safeRows.filter(
    (r) => r.pemantauanPekerja === 'ya'
  ).length;
  const pemantauanPekerjaTidakCount = safeRows.filter(
    (r) => r.pemantauanPekerja === 'tidak'
  ).length;
  const pemantauanPekerjaRate =
    totalMonths > 0
      ? Math.round((pemantauanPekerjaYaCount / totalMonths) * 100)
      : 0;

  const months100List = safeRows
    .filter((r) => r.capaian >= 100)
    .map((r) => r.monthLabel);

  const monthsPartialList = safeRows
    .filter((r) => r.capaian < 100)
    .map((r) => ({ month: r.monthLabel, capaian: r.capaian }));

  const tidakFindings: { month: string; indicator: string }[] = [];
  for (const r of safeRows) {
    if (r.izinBapeten === 'tidak') {
      tidakFindings.push({
        month: r.monthLabel,
        indicator:
          'Kepemilikan izin penggunaan alat dari Badan Pengawas Tenaga Nuklir (BAPETEN)',
      });
    }
    if (r.peralatanProteksi === 'tidak') {
      tidakFindings.push({
        month: r.monthLabel,
        indicator: 'Ketersediaan peralatan proteksi radiasi',
      });
    }
    if (r.pemantauanPekerja === 'tidak') {
      tidakFindings.push({
        month: r.monthLabel,
        indicator:
          'Pemantauan pekerja radiasi menggunakan alat proteksi diri',
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
          .join(', ')}) berada di bawah 100% dan memerlukan evaluasi serta kelengkapan pemenuhan proteksi radiasi`
      : ', sehingga seluruh periode pemantauan telah mencapai target 100% secara konsisten';

  const tidakNoteText =
    tidakFindings.length > 0
      ? ` Selain itu, ditemukan ${tidakFindings.length} ketidaksesuaian indikator ("Tidak"), antara lain pada: ${tidakFindings
          .slice(0, 4)
          .map((f) => `${f.indicator} (${f.month})`)
          .join('; ')}.`
      : ` Pada aspek pemenuhan checklist parameter, indikator kepemilikan izin penggunaan alat dari BAPETEN mencapai ${izinBapetenRate}%, kepemilikan peralatan proteksi radiasi sebesar ${peralatanProteksiRate}%, serta pemantauan pekerja radiasi menggunakan alat proteksi diri sebesar ${pemantauanPekerjaRate}%.`;

  const analysisText = `Berdasarkan hasil pemantauan Pengamanan Radiasi di UOBK RSUD Al-Mulk Kota Sukabumi selama ${totalMonths} bulan periode berjalan, rata-rata capaian pengamanan radiasi berada pada angka ${avgCapaian}% (dengan rentang capaian terendah ${minCapaian}% dan tertinggi ${maxCapaian}%). ${months100Text}${monthsPartialText}.${tidakNoteText} Sesuai dengan Permenkes RI Nomor 7 Tahun 2019 tentang Kesehatan Lingkungan Rumah Sakit serta ketentuan Badan Pengawas Tenaga Nuklir (BAPETEN), rumah sakit yang memanfaatkan sumber radiasi pengion pada instalasi radiologi wajib memiliki izin pemanfaatan yang sah dari BAPETEN, menyediakan peralatan proteksi radiasi (apron timbal, pelindung tiroid, gonad shield, kaca timbal, dan surveymeter), serta melakukan pemantauan dosis paparan radiasi pekerja (TLD badge/film badge) secara berkala agar tidak melampaui Nilai Batas Dosis (NBD).`;

  // Generate dynamic recommendations
  const recommendations: string[] = [];

  if (izinBapetenTidakCount > 0 || izinBapetenRate < 100) {
    recommendations.push(
      'Memastikan seluruh pesawat sinar-X dan peralatan radiologi memiliki izin pemanfaatan aktif dari Badan Pengawas Tenaga Nuklir (BAPETEN) serta mengajukan perpanjangan izin dan uji kesesuaian sebelum masa berlaku berakhir.'
    );
  } else {
    recommendations.push(
      'Mempertahankan kepatuhan kepemilikan izin penggunaan alat dari Badan Pengawas Tenaga Nuklir (BAPETEN) yang telah mencapai 100% serta memantau jadwal uji kesesuaian pesawat sinar-X dan kalibrasi berkala.'
    );
  }

  if (peralatanProteksiTidakCount > 0 || peralatanProteksiRate < 100) {
    recommendations.push(
      'Melengkapi dan memeriksa kondisi fisik peralatan proteksi radiasi (apron Pb, pelindung tiroid, kacamata Pb, tabir mobile berlapis timbal) agar bebas dari keretakan dan layak pakai.'
    );
  } else {
    recommendations.push(
      'Mempertahankan ketersediaan dan kelayakan fungsi peralatan proteksi radiasi di Instalasi Radiologi serta melakukan uji kebocoran apron timbal (lead apron) secara periodik.'
    );
  }

  if (
    pemantauanPekerjaTidakCount > 0 ||
    pemantauanPekerjaRate < 100 ||
    partialCount > 0
  ) {
    recommendations.push(
      `Meningkatkan kedisiplinan pemakaian Alat Pelindung Diri (APD) proteksi radiasi dan dosimeter perorangan (TLD/Film Badge) bagi seluruh pekerja radiasi, terutama pada periode dengan capaian ${minCapaian}%.`
    );
  } else {
    recommendations.push(
      'Mempertahankan konsistensi pemantauan dosis radiasi perorangan menggunakan TLD badge dan kewajiban pemakaian alat proteksi diri bagi seluruh radiografer serta petugas di area radiasi.'
    );
  }

  recommendations.push(
    'Melaksanakan pengukuran paparan radiasi lingkungan (survei kebocoran radiasi di sekitar ruang pemeriksaan radiologi dan ruang tunggu pasien) serta pemeriksaan kesehatan berkala bagi pekerja radiasi.'
  );

  // Generate dynamic follow-up plans (Rencana Tindak Lanjut)
  const followUpPlans: string[] = [];

  if (partialCount > 0) {
    followUpPlans.push(
      `Melakukan koordinasi bersama Petugas Proteksi Radiasi (PPR) dan Kepala Instalasi Radiologi untuk menindaklanjuti bulan dengan capaian < 100% (${monthsPartialList
        .slice(0, 4)
        .map((m) => m.month)
        .join(', ')}${monthsPartialList.length > 4 ? ', dst.' : ''}) agar seluruh parameter terpenuhi 100%.`
    );
  } else {
    followUpPlans.push(
      'Melaksanakan monitoring dan supervisi bulanan pengamanan radiasi bersama Petugas Proteksi Radiasi (PPR) sesuai daftar tilik Permenkes No. 7 Tahun 2019.'
    );
  }

  followUpPlans.push(
    'Melakukan pengecekan masa berlaku izin BAPETEN, sertifikat uji kesesuaian alat radiologi, dan kalibrasi dosimeter saku/surveymeter secara terjadwal.'
  );

  followUpPlans.push(
    'Mengirimkan TLD badge pekerja radiasi ke laboratorium dosimetri terakreditasi secara rutin (setiap 3 bulan) dan mengarsipkan hasil evaluasi dosis paparan radiasi.'
  );

  followUpPlans.push(
    'Mendokumentasikan rekapitulasi hasil pemantauan pengamanan radiasi setiap bulan ke dalam sistem SIKRESMI dan melaporkannya pada Laporan Berkala Kesehatan Lingkungan UOBK RSUD Al-Mulk Kota Sukabumi.'
  );

  return {
    totalMonths,
    avgCapaian,
    minCapaian,
    maxCapaian,
    perfect100Count,
    partialCount,
    izinBapetenYaCount,
    izinBapetenTidakCount,
    izinBapetenRate,
    peralatanProteksiYaCount,
    peralatanProteksiTidakCount,
    peralatanProteksiRate,
    pemantauanPekerjaYaCount,
    pemantauanPekerjaTidakCount,
    pemantauanPekerjaRate,
    months100List,
    monthsPartialList,
    tidakFindings,
    analysisText,
    recommendations,
    followUpPlans,
  };
}
