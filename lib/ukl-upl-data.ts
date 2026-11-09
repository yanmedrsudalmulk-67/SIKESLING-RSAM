/**
 * Master Data Resmi Laporan UKL-UPL UOBK RSUD Al-Mulk Kota Sukabumi
 * Sumber: Dokumen Laporan UKL-UPL Semester I Tahun 2026 (130 Halaman)
 */

export interface UklUplHospitalProfile {
  namaInstansi: string;
  namaFasilitas: string;
  alamatKantorPusat: string;
  noTelepon: string;
  email: string;
  kepalaDinas: string;
  penanggungJawab: string;
  jabatanPenanggungJawab: string;
  nipPenanggungJawab: string;
  jenisKegiatan: string;
  nib: string;
  izinLingkungan: string;
  beritaAcaraRintekTPS: string;
  lokasiKegiatan: {
    jalan: string;
    kelurahan: string;
    kecamatan: string;
    kota: string;
    koordinat: string;
    latitude: number;
    longitude: number;
  };
  skalaUsaha: {
    kapasitasTempatTidur: number;
    jumlahPegawai: number;
    waktuOperasi: string;
    luasLahan: string;
    luasBangunan: string;
    listrik: string;
    oliPelumas: string;
    gasBuang: string;
    airBersihHarian: string;
    sumberAir: string;
    kedalamanSumur: string;
    groundTank: string;
    kamarMandiHarian: string;
    produksiHarian: string;
    airLimbahHarian: string;
    limbahB3Harian: string;
    limbahPadatHarian: string;
  };
  proteksiKebakaran: {
    apar: string;
    hidran: string;
    alarm: string;
    jalurEvakuasi: string;
    titikKumpul: string;
    sprinkler: string;
  };
}

export interface GeospasialPoint {
  id: string;
  nama: string;
  kodeIzin: string;
  koordinatDisplay: string;
  latitudeDisplay: string;
  longitudeDisplay: string;
  keterangan: string;
  status: string;
}

export interface KeslingEvaluationItem {
  no: number;
  variabel: string;
  kegiatan: string;
  periode: string;
  hasil: string[];
  evaluasi: string[];
  statusBakuMutu: 'MEMENUHI' | 'SEBAGIAN' | 'PERLU_TINDAK_LANJUT';
}

export interface RklMatrixItem {
  no: number;
  jenisDampak: string;
  sumberDampak: string;
  besaranDampak: string;
  bentukUpaya: string;
  metodePengelolaan: string;
  lokasi: string;
  unitPelaksana: string;
}

export interface RplMatrixItem {
  no: number;
  jenisDampak: string;
  sumberDampak: string;
  parameterKunci: string;
  tolokUkur: string;
  metodeUklUpl: string;
  metodeSaatIni: string;
  lokasi: string;
  hasilAnalisis: string;
  evaluasi: string;
  tindakLanjut: string;
  statusKepatuhan: 'MEMENUHI' | 'BELUM_MEMENUHI' | 'DALAM_PROSES';
}

export interface PhysicalRoomMeasurement {
  no: number;
  kategori: string;
  unit: string;
  suhu: number;
  suhuDisplay: string;
  kelembaban: number;
  kelembabanDisplay: string;
  kelembabanScore: number;
  lux: number;
  luxDisplay: string;
  luxScore: number;
  kebisingan: number;
  kebisinganDisplay: string;
  kebisinganScore: number;
}

export interface WaterLabTestParam {
  parameter: string;
  bakuMutu: string;
  satuan: string;
  artesis: string;
  roPoliGigi: string;
  roLaboratorium: string;
  roCssd: string;
  keterangan: string;
}

export interface NeracaLimbahB3Item {
  no: number;
  jenisLimbah: string;
  kodeLimbah: string;
  jumlahKg: number;
  perlakuan: string;
  pengolah: string;
  statusIzin: string;
}

export interface MonthlyWasteRecap {
  bulan: string;
  bulanAngka: number;
  limbahTajamKg: number;
  limbahPadatKg: number;
  totalKg: number;
  manifestCount: number;
  primaryManifest: string;
}

export interface FacilityChecklistItem {
  kategori: string;
  indikator: string;
  standarRegulasi: string;
  hasilPemeriksaan: 'MEMENUHI' | 'TIDAK_MEMENUHI';
  keterangan: string;
}

export interface DocumentationPhotoItem {
  id: string;
  modul: string;
  judul: string;
  deskripsi: string;
  lokasi: string;
  halamanPdf: number;
}

/* =========================================================================
   DATASET RESMI (BERDASARKAN LAPORAN UKL-UPL RSUD AL-MULK SEMESTER I 2026)
   ========================================================================= */

export const UKL_UPL_PROFILE: UklUplHospitalProfile = {
  namaInstansi: 'Dinas Kesehatan Kota Sukabumi',
  namaFasilitas: 'UOBK RSUD Al-Mulk Kota Sukabumi',
  alamatKantorPusat: 'Jl. Suryakencana No. 41, Sukabumi, Jawa Barat, Indonesia',
  noTelepon: '(0266)-6243088',
  email: 'rsudalmulk@gmail.com',
  kepalaDinas: 'Ida Halimah, S.K.M., M.Si',
  penanggungJawab: 'Dr. Deni Purnama, S.Kep, MKM',
  jabatanPenanggungJawab: 'Direktur UOBK RSUD Al-Mulk Kota Sukabumi',
  nipPenanggungJawab: '198201109 200312 1 002',
  jenisKegiatan: 'Rumah Sakit Pemerintah Tipe D',
  nib: '1101220030984',
  izinLingkungan: 'SK Kepala DPMPTSP Kota Sukabumi No. 503/SK.29/DPMPTSP/2018 (Tanggal 13 September 2018)',
  beritaAcaraRintekTPS: 'BA No. 11/DLHRINTEKLB3/2023 (Tanggal 01 Desember 2023 Dinas Lingkungan Hidup)',
  lokasiKegiatan: {
    jalan: 'Jl. Pelabuhan II KM 6 RT 02 RW 07',
    kelurahan: 'Lembursitu',
    kecamatan: 'Lembursitu',
    kota: 'Kota Sukabumi, Jawa Barat',
    koordinat: '-6.95868, 106.89784',
    latitude: -6.95868,
    longitude: 106.89784,
  },
  skalaUsaha: {
    kapasitasTempatTidur: 53,
    jumlahPegawai: 179,
    waktuOperasi: '24 Jam Non-Stop (3 Shift Pelayanan)',
    luasLahan: '4.667 m²',
    luasBangunan: '7.183 m²',
    listrik: '10.150 kWh/kVA',
    oliPelumas: '29 liter/tahun',
    gasBuang: '80 ppm',
    airBersihHarian: '10 m³/hari',
    sumberAir: 'Sumur Bor / Artesis Kedalaman 98 m dan Sistem RO (Reverse Osmosis)',
    kedalamanSumur: '98 meter',
    groundTank: '4 m³ (2 sumber tangki ground)',
    kamarMandiHarian: '10 m³/hari',
    produksiHarian: '9 m³/hari',
    airLimbahHarian: '~7 m³/hari (100% diproses melalui IPAL aerob-anaerob)',
    limbahB3Harian: '~100 kg/hari (diangkut rutin tiap 3 hari ke PT Jasa Medivest)',
    limbahPadatHarian: '100 kg/hari',
  },
  proteksiKebakaran: {
    apar: '23 Unit APAR (Dry Chemical Powder & CO₂)',
    hidran: '3 Pilar Hidran Aktif',
    alarm: '1 Master Control Panel Alarm Kebakaran',
    jalurEvakuasi: '12 Titik Jalur Evakuasi Standar',
    titikKumpul: '1 Titik Kumpul Aman (Assembly Point)',
    sprinkler: '20 Head Sprinkler Otomatis',
  },
};

export const GEOSPASIAL_POINTS: GeospasialPoint[] = [
  {
    id: 'tps-b3',
    nama: 'TPS Limbah Bahan Berbahaya & Beracun (B3)',
    kodeIzin: 'NIB 1101220030984 / BA 11/DLHRINTEKLB3/2023',
    koordinatDisplay: "S: -6°57'29.984\", E: 106°53'50.454\"",
    latitudeDisplay: "S 6°57'29.984\"",
    longitudeDisplay: "E 106°53'50.454\"",
    keterangan: 'Bangunan beton tertutup di area belakang manajemen, kapasitas maks 250 kg/hari, dilengkapi eyewash, APAR, spill kit.',
    status: 'Berizin & Aktif',
  },
  {
    id: 'ipal',
    nama: 'Instalasi Pengolahan Air Limbah (IPAL)',
    kodeIzin: 'NIB 1101220030984 / Permen LHK No. 68/2016',
    koordinatDisplay: "S: -6°57'29.964\", E: 106°53'50.454\"",
    latitudeDisplay: "S 6°57'29.964\"",
    longitudeDisplay: "E 106°53'50.454\"",
    keterangan: 'Kapasitas 7 m³/hari, proses biologi aerob-anaerob & klorinasi. Air hasil olahan dimanfaatkan ulang untuk siram tanaman & cuci mobil.',
    status: '100% Memenuhi Baku Mutu',
  },
  {
    id: 'sumur-artesis',
    nama: 'Air Sumur Bor (Artesis) Sumber Utama',
    kodeIzin: 'No. Izin: 29/291300/DPMPTSP/2022 (SB-1)',
    koordinatDisplay: "S: -6.958619°, E: 106.897242\"",
    latitudeDisplay: "S 6° 958'619\"",
    longitudeDisplay: "E 106° 897'242\"",
    keterangan: 'Kedalaman sumur 98 meter, menyuplai kebutuhan harian kamar mandi, utilitas, dan bahan baku olahan RO.',
    status: 'Operasional (Proses Pengajuan Filtrasi UV)',
  },
  {
    id: 'ro-system',
    nama: 'Instalasi Pemurnian Air Reverse Osmosis (RO)',
    kodeIzin: 'No. Izin: 29/291300/DPMPTSP/2022 (SB-1)',
    koordinatDisplay: "S: -6.958619°, E: 106.897242\"",
    latitudeDisplay: "S 6° 958'619\"",
    longitudeDisplay: "E 106° 897'242\"",
    keterangan: 'Menghasilkan air murni higienis untuk Poli Gigi, Laboratorium Patologi, dan Unit Sterilisasi Pusat (CSSD).',
    status: 'Memenuhi Baku Mutu (PMK 2/2023)',
  },
];

export const KESLING_EVALUATIONS: KeslingEvaluationItem[] = [
  {
    no: 1,
    variabel: 'Kesehatan Air Rumah Sakit',
    kegiatan: 'Pemeriksaan kualitas air bersih parameter fisika, kimia, dan mikrobiologi',
    periode: 'Januari – Juni 2026',
    hasil: [
      'Air Artesis pada bulan April ditemukan sampel yang belum memenuhi syarat total coliform & air agak keruh.',
      'Air RO Poli Klinik Gigi dan Poli Klinik Laboratorium Memenuhi Syarat berdasarkan PMK No. 2 Tahun 2023.',
      'Hasil pengujian mikrobiologi & kimia secara berkala dilaporkan ke Labkesda Kota Sukabumi.',
    ],
    evaluasi: [
      'Pembersihan lumpur dan kuras sumur artesis secara mekanik.',
      'Klorinasi sumur menggunakan larutan kaporit dosis tepat, didiamkan 12-24 jam sebelum pengurasan.',
      'Pengajuan pemasangan sistem filtrasi multi-media (pasir, karbon aktif, filter mangan) dan lampu sterilisasi Ultraviolet (UV).',
      'Pengawasan jarak aman sumur dari saluran septic tank dan sumber kontaminan potensial.',
    ],
    statusBakuMutu: 'SEBAGIAN',
  },
  {
    no: 2,
    variabel: 'Kesehatan Udara, Suhu, Pencahayaan & Kebisingan',
    kegiatan: 'Pemeriksaan kualitas udara ruang, suhu, pencahayaan, kelembaban (indoor), dan kebisingan',
    periode: 'Januari – Juni 2026',
    hasil: [
      'Kualitas udara dan suhu ruangan sebagian besar memenuhi syarat kenyamanan KRIS (Kelas Rawat Inap Standar).',
      'Parameter kebisingan di area rawat jalan/poli mencapai 64 dBA, belum memenuhi baku mutu Kepmen LH No. 48/1996 (baku mutu 55 dBA) karena berdekatan langsung dengan jalan raya provinsi yang padat.',
      'Pencahayaan di beberapa lorong dan ruang tindakan masih di bawah nilai minimum rekomendasi lux.',
    ],
    evaluasi: [
      'Penambahan dan peningkatan daya pencahayaan lampu LED di ruangan yang masih kurang terang.',
      'Pintu penghubung utama poli rawat jalan senantiasa ditutup rapat untuk meredam bising jalan raya.',
      'Sosialisasi budaya bicara tenang dan suara rendah kepada seluruh staf, pasien, dan pengunjung rawat inap.',
      'Penanaman pohon penyerap suara (buffer hijau) di area perbatasan pagar depan rumah sakit.',
    ],
    statusBakuMutu: 'SEBAGIAN',
  },
  {
    no: 3,
    variabel: 'Kesehatan Sarana dan Bangunan',
    kegiatan: 'Pemeriksaan kelaikan sarana dan bangunan berdasarkan Form Permenkes No. 7 Tahun 2019',
    periode: 'Januari – Juni 2026',
    hasil: [
      'Secara struktural bangunan memenuhi persyaratan teknis kesehatan lingkungan rumah sakit.',
      'Pertemuan dinding dan lantai di area kritis telah berbentuk konus/lengkung untuk mempermudah sanitasi.',
      'Perawatan rutin fasilitas terus berjalan untuk mempertahankan kesesuaian standar akreditasi RS.',
    ],
    evaluasi: [
      'Melakukan monev berkala antara sanitarian, unit IPSRS, dan penanggung jawab cleaning service.',
      'Pengusulan pelatihan berkala tata cara disinfeksi ruangan bagi tenaga sanitasi dan pekarya.',
      'Penyusunan logbook pemeliharaan sarana secara digital agar progres perbaikan terpantau *realtime*.',
    ],
    statusBakuMutu: 'MEMENUHI',
  },
  {
    no: 4,
    variabel: 'Pengamanan Limbah (Padat B3 & Cair)',
    kegiatan: 'Pengelolaan limbah medis B3, pemilahan limbah domestik, dan pengoperasian IPAL',
    periode: 'Januari – Juni 2026',
    hasil: [
      'Pengelolaan limbah medis padat B3 bekerja sama dengan transporter dan pengolah resmi PT Jasa Medivest.',
      'Pengangkutan rutin limbah medis terlaksana terjadwal setiap 3 hari sekali dengan total 284 kg selama 6 bulan.',
      'Air limbah 100% parameter memenuhi baku mutu Permen LHK No. 68/2016, tidak mencemari lingkungan.',
      'Air hasil olahan IPAL yang telah bersih dimanfaatkan kembali (*recycle*) untuk menyiram taman dan mencuci mobil operasional.',
    ],
    evaluasi: [
      'Jadwal pengangkutan limbah medis pihak ketiga terus dikoordinasikan secara ketat (konfirmasi H-1 jika ada perubahan).',
      'Pengajuan persetujuan teknis (pertek) air limbah dan tangki penampungan tambahan untuk pemanfaatan *flushing toilet*.',
    ],
    statusBakuMutu: 'MEMENUHI',
  },
  {
    no: 5,
    variabel: 'Vektor dan Binatang Pengganggu',
    kegiatan: 'Pemeriksaan vektor (nyamuk, kecoa, lalat, tikus) dan binatang pengganggu (kucing)',
    periode: 'Januari – Juni 2026',
    hasil: [
      'Pemeriksaan dan survei jentik/vektor dilaksanakan secara rutin setiap 1 bulan sekali.',
      'Masih ditemukan kucing liar yang masuk ke selasar rumah sakit dari permukiman warga sekitar.',
      'Index lalat dan kecoa berada di bawah batas ambang bahaya.',
    ],
    evaluasi: [
      'Inspeksi rutin area belakang lemari, gudang, dan sudut ruangan yang berpotensi menjadi sarang.',
      'Pembersihan saluran drainase luar gedung agar aliran air lancar dan tidak menjadi tempat perindukan jentik.',
      'Penyemprotan insektisida ramah lingkungan secara berkala di area rawan.',
      'Kerja sama dengan pihak ketiga *pest control* untuk relokasi kucing liar tanpa menyakiti satwa.',
    ],
    statusBakuMutu: 'SEBAGIAN',
  },
  {
    no: 6,
    variabel: 'Pangan Siap Saji',
    kegiatan: 'Inspeksi sanitasi dapur gizi dan monitoring pantry ruang rawat',
    periode: 'Januari – Juni 2026',
    hasil: [
      'Pemeriksaan menyeluruh dilakukan setiap 6 bulan ke dapur pengolahan dan setiap 1 bulan ke pantry ruangan.',
      'Peralatan makan melalui proses sterilisasi air panas dan disimpan di lemari tertutup.',
      'Kerja sama penyediaan bahan pangan dengan mitra berizin laik higiene sanitasi jasaboga.',
    ],
    evaluasi: [
      'Mempertahankan kepatuhan pemakaian APD (celemek, sarung tangan, masker, hairnet) oleh pramusaji gizi.',
      'Pemeriksaan berkala swab usap alat makan dan usap dubur penjamah makanan ke Labkesda.',
    ],
    statusBakuMutu: 'MEMENUHI',
  },
  {
    no: 7,
    variabel: 'Penyelenggaraan Linen',
    kegiatan: 'Pengawasan alur linen, dekontaminasi, pencucian, dan penyimpanan linen bersih',
    periode: 'Januari – Juni 2026',
    hasil: [
      'Pemeriksaan dan pengawasan rutin terlaksana setiap 1 bulan sekali.',
      'Pemisahan kantong kuning (linen infeksius) dan kantong bening/hitam (linen non-infeksius) terlaksana 100%.',
      'Pencucian linen infeksius menggunakan mesin cuci khusus dengan desinfektan klorin suhu 70°C.',
    ],
    evaluasi: [
      'Troli linen bersih dan troli linen kotor diberi kode warna jelas dan tidak saling silang alur.',
      'Pemeliharaan berkala lemari penyimpanan linen bersih bertekanan positif bebas debu.',
    ],
    statusBakuMutu: 'MEMENUHI',
  },
  {
    no: 8,
    variabel: 'Pengamanan Radiasi',
    kegiatan: 'Pemeriksaan paparan radiasi ruang X-Ray dan sertifikasi alat radiologi',
    periode: 'Januari – Juni 2026',
    hasil: [
      'Pemeriksaan proteksi radiasi rutin setiap bulan bekerja sama dengan Tim Radiologi RSUD Al-Mulk.',
      'Dinding berlapis timbal (Pb) 2 mm dan kaca intip timbal dalam kondisi kedap radiasi.',
      'Petugas radiasi dilengkapi kartu dosimeter TLD untuk memantau dosis radiasi kumulatif perorangan.',
    ],
    evaluasi: [
      'Memastikan uji kesesuaian pesawat rontgen dan kalibrasi tahunan BAPETEN berjalan tepat waktu.',
      'Inspeksi kelengkapan apron timbal, pelindung tiroid, dan gonadal shield sebelum tindakan radiografi.',
    ],
    statusBakuMutu: 'MEMENUHI',
  },
];

export const RKL_MATRIX: RklMatrixItem[] = [
  {
    no: 1,
    jenisDampak: 'Kualitas Air Artesis (Bakteriologis & Kekeruhan)',
    sumberDampak: 'Pengelolaan sumur, potensi intrusi permukaan, dan jarak sarana sanitasi di sekitar sumur.',
    besaranDampak: 'Dampak signifikan terhadap keamanan konsumsi air bagi pasien rawat inap dan operasional klinis.',
    bentukUpaya: 'Pemantauan berkala kualitas mikrobiologi air, perlindungan zona sumur, dan penyiapan sistem desinfeksi.',
    metodePengelolaan: 'Pemasangan filter multi-media (pasir, karbon aktif), injeksi klorinasi berkala, pengurasan sumur bor, pemeliharaan pipa.',
    lokasi: 'Sumur Bor Artesis UOBK RSUD Al-Mulk',
    unitPelaksana: 'Petugas Sanitarian & Tim IPSRS',
  },
  {
    no: 2,
    jenisDampak: 'Peningkatan Kebisingan Ruangan Pelayanan',
    sumberDampak: 'Lalu lintas kendaraan jalan raya Pelabuhan II, aktivitas pengunjung, dan mesin operasional instalasi.',
    besaranDampak: 'Tingkat bising di poli rawat jalan mencapai 64 dBA (ambang baku mutu 55 dBA), berpotensi mengganggu kenyamanan istirahat pasien.',
    bentukUpaya: 'Penataan tata ruang kedap suara, isolasi sumber bunyi bising, dan pembatasan suara operasional internal.',
    metodePengelolaan: 'Menutup rapat pintu poli area depan yang berbatasan jalan raya, memasang rambu peringatan hening, pemasangan peredam plafon akustik, penanaman pohon pelindung bising.',
    lokasi: 'Area Rawat Jalan, Poli Klinik, dan Selasar Depan',
    unitPelaksana: 'Petugas Sanitarian, IPSRS, dan Keamanan (Satpam)',
  },
  {
    no: 3,
    jenisDampak: 'Limbah Padat Medis B3 dan Domestik',
    sumberDampak: 'Aktivitas pelayanan medis pasien, tindakan IGD/Bedah/Ranap, laboratorium, obat kadaluarsa, dan sampah dapur.',
    besaranDampak: 'Timbulan limbah medis padat B3 sebesar 284 kg (0,284 ton) selama Semester I 2026. Berisiko infeksi nosokomial & cidera jarum tajam.',
    bentukUpaya: 'Segregasi pemilahan dari sumber, pewadahan safety box jarum suntik, penyimpanan dingin TPS B3, pemusnahan resmi pihak ketiga.',
    metodePengelolaan: 'Pemilahan wadah berkode warna (Kuning = Medis, Hitam = Domestik), safety box anti bocor, TPS LB3 beratap beton 6,75 m², kerja sama angkut rutin dengan PT Jasa Medivest.',
    lokasi: 'Seluruh Ruangan Penghasil Limbah & TPS LB3',
    unitPelaksana: 'Sanitarian & Petugas Kebersihan / Pihak Ketiga',
  },
  {
    no: 4,
    jenisDampak: 'Limbah Cair Rumah Sakit',
    sumberDampak: 'Air buangan toilet/kamar mandi, wastafel laboratorium, laundry linen, dan ruang tindakan medis (~7 m³/hari).',
    besaranDampak: 'Potensi pencemaran badan air penerima dan penyebaran patogen jika tidak diolah sesuai baku mutu Permen LHK 68/2016.',
    bentukUpaya: 'Pengaliran sistem tertutup kedap bocor langsung ke IPAL, proses biologis aerobik/anaerobik, dan klorinasi akhir.',
    metodePengelolaan: 'Penyaringan kotoran padat di bar screen, aerasi aerator IPAL, pengendapan sedimentasi, klorinasi pembunuh kuman. Hasil olahan diuji lab dan dipakai siram tanaman.',
    lokasi: 'Instalasi Pengolahan Air Limbah (IPAL)',
    unitPelaksana: 'Petugas Sanitarian & Operator IPAL',
  },
  {
    no: 5,
    jenisDampak: 'Potensi Bahaya Kebakaran Gedung',
    sumberDampak: 'Peralatan medis bertenaga listrik tinggi, panel instalasi, sentral tabung oksigen, dan dapur gizi.',
    besaranDampak: 'Ancaman terhadap keselamatan jiwa pasien rawat inap, petugas medis, dan kerugian aset fisik rumah sakit.',
    bentukUpaya: 'Penyediaan sistem proteksi aktif-pasif dan kesiapsiagaan tim tanggap darurat bencana kebakaran (Code Red).',
    metodePengelolaan: 'Pemasangan 23 APAR dan 3 Hidran di seluruh unit kritis, inspeksi tekanan tabung setiap bulan, pembentukan tim penanggulangan kebakaran tiap shift.',
    lokasi: 'Seluruh Gedung dan Unit Pelayanan RSUD Al-Mulk',
    unitPelaksana: 'Tim K3RS & Petugas Sanitarian',
  },
  {
    no: 6,
    jenisDampak: 'Kemacetan Lalu Lintas Akses Rumah Sakit',
    sumberDampak: 'Kendaraan keluar masuk pasien, pengantar, ambulans gawat darurat, dan tingginya volume jalur jalan provinsi Pelabuhan II.',
    besaranDampak: 'Potensi keterlambatan rujukan gawat darurat ambulans IGD dan kesemrawutan akses parkir.',
    bentukUpaya: 'Manajemen rekayasa sirkulasi parkir dan jalur khusus kendaraan darurat.',
    metodePengelolaan: 'Penempatan Satpam pengatur lalu lintas 3 shift 24 jam di pintu gerbang utama, penggunaan rambu lampu pengatur malam hari, jalur steril ambulans.',
    lokasi: 'Pintu Gerbang Keluar Masuk & Area Parkir Depan',
    unitPelaksana: 'Petugas Keamanan (Satpam) & Manajemen RS',
  },
  {
    no: 7,
    jenisDampak: 'Tingginya Volume Pengambilan Air Tanah',
    sumberDampak: 'Kebutuhan suplai air medis, higiene sanitasi, pencucian linen, dan kamar mandi pasien rawat inap (~10-25 m³/hari).',
    besaranDampak: 'Penurunan muka air tanah jika pemanfaatan air artesis tidak dibarengi dengan konservasi dan efisiensi air.',
    bentukUpaya: 'Gerakan efisiensi air, pencegahan kebocoran jalur pipa, dan pemanfaatan kembali air limbah olahan IPAL.',
    metodePengelolaan: 'Pemasangan stiker hemat air di setiap wastafel, kontrol otomatis penarikan pompa dari ground tank ke toren, pemanfaatan air IPAL untuk taman.',
    lokasi: 'Seluruh Titik Kran, Wastafel, dan Ground Tank RS',
    unitPelaksana: 'Petugas Sanitarian & Tim IPSRS',
  },
  {
    no: 8,
    jenisDampak: 'Volume Air Buangan Domestik (Urin & Tinja)',
    sumberDampak: 'Kamar mandi pasien dan toilet umum rumah sakit dengan estimasi timbulan urin & tinja ~2,7 m³/hari.',
    besaranDampak: 'Beban pemurnian limbah organik pada unit pengolahan dan potensi bau jika septic tank tidak terpelihara.',
    bentukUpaya: 'Pengaliran limbah biologis terintegrasi ke instalasi IPAL dan pemeliharaan resapan.',
    metodePengelolaan: 'Pengolahan lumpur biologis di reaktor IPAL, desinfeksi sebelum *discharge*, pemanfaatan air daur ulang (*recycle*) untuk toilet *flushing*.',
    lokasi: 'Kamar Mandi / Toilet Seluruh Gedung & IPAL',
    unitPelaksana: 'Petugas Sanitarian & Tim IPSRS',
  },
  {
    no: 9,
    jenisDampak: 'Penurunan Kualitas Air Tanah Dangkal & Permukaan',
    sumberDampak: 'Limpasan air hujan permukaan (*run-off*), ceceran bahan kimia ringan, dan sistem drainase kawasan.',
    besaranDampak: 'Gangguan penyerapan air tanah alami dan potensi genangan di area sekitar pemukiman warga.',
    bentukUpaya: 'Konservasi resapan air hujan ke tanah dan pemantauan kualitas air permukaan secara periodik.',
    metodePengelolaan: 'Pembuatan dan pemeliharaan sumur resapan, penggalian lubang resapan biopori yang diisi sampah organik dedaunan, pengujian rutin sampel ke lab.',
    lokasi: 'Kawasan Terbuka Hijau & Saluran Drainase RS',
    unitPelaksana: 'Petugas Sanitarian & Tim IPSRS',
  },
];

export const RPL_MATRIX: RplMatrixItem[] = [
  {
    no: 1,
    jenisDampak: 'Kualitas Air Artesis (Bakteriologis)',
    sumberDampak: 'Pengelolaan sumur dan kondisi sanitasi lingkungan sekitar sumber air bor.',
    parameterKunci: 'Total Coliform, E.Coli, Kekeruhan, pH, Bau, dan Logam Berat',
    tolokUkur: 'Permenkes (PMK) No. 2 Tahun 2023 tentang Standar Baku Mutu Kesehatan Lingkungan untuk Higiene Sanitasi',
    metodeUklUpl: 'Pengambilan sampel representatif bulanan dan pengujian mikrobiologi di laboratorium terakreditasi.',
    metodeSaatIni: 'Pengiriman sampel berkala ke Labkesda Kota Sukabumi dan pemeriksaan mandiri indikator fisik rutin.',
    lokasi: 'Kran Output Sumur Artesis & Toren Distribusi',
    hasilAnalisis: 'Pada bulan April ditemukan parameter Total Coliform melebihi ambang batas dan air agak keruh. Bulan lainnya memenuhi standar.',
    evaluasi: 'Diperlukan desinfeksi klorin berkala dan penambahan sistem filtrasi terpadu agar kualitas air konstan aman.',
    tindakLanjut: 'Pengadaan paket sistem filtrasi air dan lampu UV sterilisasi telah dimasukkan ke perencanaan anggaran 2026.',
    statusKepatuhan: 'DALAM_PROSES',
  },
  {
    no: 2,
    jenisDampak: 'Peningkatan Kebisingan Ruang Pelayanan',
    sumberDampak: 'Lalu lintas kendaraan jalan raya Pelabuhan II dan aktivitas operasional rumah sakit.',
    parameterKunci: 'Tingkat Intensitas Kebisingan (dB / dBA)',
    tolokUkur: 'Kepmen LH No. 48/1996 tentang Baku Tingkat Kebisingan (Ambang Rumah Sakit: 55 dBA)',
    metodeUklUpl: 'Pengukuran kebisingan menggunakan Sound Level Meter di seluruh unit pelayanan pada waktu siang dan malam.',
    metodeSaatIni: 'Pengukuran berkala menggunakan Sound Level Meter digital terkalibrasi oleh Petugas Sanitarian.',
    lokasi: 'Area Poli Rawat Jalan, Selasar Tunggu Pasien, Ruang Rawat Inap, ICU',
    hasilAnalisis: 'Pengukuran di area Poli Rawat Jalan mencapai 64 dBA (melebihi baku mutu 55 dBA) akibat paparan bising jalan provinsi.',
    evaluasi: 'Posisi bangunan poli berjarak dekat dengan tepi jalan raya utama sehingga transmisi gelombang suara langsung masuk lorong.',
    tindakLanjut: 'Pintu utama poli selalu ditutup, peredam suara plafon ditambahkan, dan rambu dilarang berisik dipertegas.',
    statusKepatuhan: 'DALAM_PROSES',
  },
  {
    no: 3,
    jenisDampak: 'Limbah Padat Medis B3 dan Domestik',
    sumberDampak: 'Tindakan medis rawat jalan, rawat inap, IGD, laboratorium, farmasi, dan sampah non-medis.',
    parameterKunci: 'Volume Timbulan (kg/hari), Segregasi Warna Kantong, Manifest Festronik, Neraca Limbah B3',
    tolokUkur: 'Permenkes No. 7 Tahun 2019 & PP No. 22 Tahun 2021 tentang Pengelolaan Limbah B3',
    metodeUklUpl: 'Penimbangan harian di setiap unit penghasil, pencatatan logbook, dan verifikasi nomor manifest angkut.',
    metodeSaatIni: 'Pencatatan digital Log Book Limbah Medis SIKRESMI per ruangan & penimbangan bersama transporter PT Jasa Medivest.',
    lokasi: 'Seluruh Ruangan Tindakan Medis & TPS Limbah B3 RSUD Al-Mulk',
    hasilAnalisis: 'Total limbah medis Semester I 2026 terkelola 292 kg (neraca B3) dan 1.794 kg akumulasi timbulan logbook, terangkut 100%.',
    evaluasi: 'Segregasi dari sumber berjalan sangat baik, safety box jarum tidak pernah over-capacity (>3/4 penuh).',
    tindakLanjut: 'Mempertahankan jadwal pengangkutan 3 hari sekali dan peremajaan simbol label pada drum TPS B3.',
    statusKepatuhan: 'MEMENUHI',
  },
  {
    no: 4,
    jenisDampak: 'Air Limbah Rumah Sakit',
    sumberDampak: 'Seluruh buangan cair domestik dan medis yang dialirkan ke sistem perpipaan tertutup IPAL.',
    parameterKunci: 'BOD, COD, TSS, pH, Amonia (NH3-N), Minyak & Lemak, dan Total Coliform',
    tolokUkur: 'Permen LHK No. 68 Tahun 2016 tentang Baku Mutu Air Limbah Domestik & Rumah Sakit',
    metodeUklUpl: 'Pengambilan sampel komposit inlet dan outlet setiap bulan, pengujian di laboratorium lingkungan terakreditasi.',
    metodeSaatIni: 'Uji laboratorium rutin bulanan bekerja sama dengan Labkesda / Lab Lingkungan Terakreditasi KAN.',
    lokasi: 'Bak Inlet, Reaktor Aerasi, dan Bak Outlet IPAL',
    hasilAnalisis: '100% parameter kimia & biologi outlet IPAL Memenuhi Syarat Baku Mutu Lingkungan. Air jernih dan tidak berbau.',
    evaluasi: 'Proses pengolahan biologis stabil. Pemanfaatan air olahan untuk menyiram tanaman dan mencuci kendaraan operasional berjalan baik.',
    tindakLanjut: 'Sedang proses pengurusan dokumen Persetujuan Teknis (Pertek) Air Limbah ke Dinas Lingkungan Hidup Kota Sukabumi.',
    statusKepatuhan: 'MEMENUHI',
  },
  {
    no: 5,
    jenisDampak: 'Potensi Bahaya Kebakaran Gedung',
    sumberDampak: 'Sistem elektrikal tegangan tinggi, instalasi oksigen medis, gas dapur, dan genset darurat.',
    parameterKunci: 'Kesiapan Tabung APAR, Tekanan Pressure Gauge, Masa Berlaku Isi, Kesiapan Pilar Hidran',
    tolokUkur: 'UU No. 24 Tahun 2007 tentang Penanggulangan Bencana & Permenaker No. 04/MEN/1980',
    metodeUklUpl: 'Inspeksi fisik bulanan terhadap 23 unit APAR, 3 pilar hidran, dan simulasi evakuasi berkala.',
    metodeSaatIni: 'Pemeriksaan kartu gantung kontrol APAR dan uji coba fungsi pilar hidran oleh Tim K3RS.',
    lokasi: 'Area IGD, Poli, Farmasi, Rekam Medik, Laboratorium, Rawat Inap, Genset, TPS LB3',
    hasilAnalisis: 'Seluruh APAR terpasang di titik strategis dengan tinggi ideal 120 cm, tekanan di zona hijau, tidak ada yang kedaluwarsa.',
    evaluasi: 'Sistem proteksi aktif siap pakai sewaktu-waktu. Penjadwalan isi ulang rutin dilaksanakan sebelum masa kedaluwarsa tiba.',
    tindakLanjut: 'Melaksanakan pelatihan *refreshing* pemadaman api menggunakan APAR bagi seluruh staf baru dan tenaga keamanan.',
    statusKepatuhan: 'MEMENUHI',
  },
  {
    no: 6,
    jenisDampak: 'Kemacetan Lalu Lintas Akses Rumah Sakit',
    sumberDampak: 'Akses keluar masuk kendaraan pengunjung dan lalu lintas padat jalan provinsi Pelabuhan II.',
    parameterKunci: 'Kecepatan Arus Keluar Masuk, Waktu Tanggap Ambulans Masuk IGD, Kerapian Area Parkir',
    tolokUkur: 'Kepmenkes No. 27/Menkes/Per/III/2017 tentang Pedoman Teknis Fasilitas Pelayanan Kesehatan',
    metodeUklUpl: 'Pemantauan visual harian kelancaran akses dan pengaturan parkir oleh petugas satuan pengamanan.',
    metodeSaatIni: 'Penjagaan pos satpam gerbang depan selama 24 jam dibagi 3 shift kerja dengan rambu lalin menyala di malam hari.',
    lokasi: 'Pintu Gerbang Utama & Area Drop-off Pasien IGD',
    hasilAnalisis: 'Arus lalu lintas di depan RS terkendali dengan baik, tidak terjadi antrean kemacetan yang menghalangi laju ambulans.',
    evaluasi: 'Keterbatasan luas lahan parkir kadang memicu penumpukan kendaraan pada jam puncak kunjungan dokter spesialis.',
    tindakLanjut: 'Penerapan marka pembatas parkir yang lebih tegas dan prioritas khusus jalur cepat (*fast track*) bagi ambulans gawat darurat.',
    statusKepatuhan: 'MEMENUHI',
  },
  {
    no: 7,
    jenisDampak: 'Volume Pengambilan Air Tanah',
    sumberDampak: 'Pemanfaatan sumur artesis untuk suplai operasional seluruh gedung rumah sakit.',
    parameterKunci: 'Volume Pemakaian (m³/hari), Efisiensi Distribusi, Debit Sumur Bor',
    tolokUkur: 'PP No. 122 Tahun 2015 tentang Sistem Penyediaan Air Minum & Konservasi Sumber Daya Air',
    metodeUklUpl: 'Pencatatan meteran air harian dan inspeksi kebocoran saluran pipa distribusi.',
    metodeSaatIni: 'Pencatatan meteran toren dan inspeksi visual oleh petugas sanitarian serta kampanye hemat air.',
    lokasi: 'Unit Penampungan Air, Saluran Pipa Distribusi, dan Seluruh Wastafel Ruangan',
    hasilAnalisis: 'Poster dan stiker gerakan efisiensi air telah terpasang di seluruh wastafel dan kran toilet rumah sakit.',
    evaluasi: 'Sistem otomatisasi pelampung toren berfungsi optimal mencegah air meluap terbuang sia-sia.',
    tindakLanjut: 'Monitoring ketat jalur pipa bawah tanah untuk mendeteksi potensi rembesan atau kebocoran kecil secara dini.',
    statusKepatuhan: 'MEMENUHI',
  },
  {
    no: 8,
    jenisDampak: 'Volume Air Buangan Domestik (Urin & Tinja)',
    sumberDampak: 'Kamar mandi pasien rawat inap, rawat jalan, dan toilet karyawan.',
    parameterKunci: 'BOD, COD, TSS limbah domestik, debit pengaliran ke IPAL',
    tolokUkur: 'Kepmen LH No. 128 Tahun 2003 tentang Baku Mutu Air Limbah Domestik',
    metodeUklUpl: 'Pemantauan saluran pipa air buangan menuju inlet IPAL dan efektivitas pengolahan resapan.',
    metodeSaatIni: 'Seluruh air buangan kamar mandi disalurkan lewat pipa tertutup menuju bak penampung IPAL.',
    lokasi: 'Instalasi Sanitasi Toilet Seluruh Ruangan & Unit IPAL',
    hasilAnalisis: 'Air hasil olahan IPAL terbukti aman dan memenuhi baku mutu, telah digunakan untuk penyiraman ruang terbuka hijau.',
    evaluasi: 'Pemanfaatan air daur ulang menghemat penggunaan air bersih tanah hingga 15-20% per bulan.',
    tindakLanjut: 'Persiapan instalasi pipa ganda (*dual plumbing*) untuk penggunaan air olahan IPAL pada pembilasan kloset (*flushing toilet*).',
    statusKepatuhan: 'MEMENUHI',
  },
  {
    no: 9,
    jenisDampak: 'Kualitas Air Tanah Dangkal & Resapan Permukaan',
    sumberDampak: 'Limpasan air hujan atap gedung, ceceran air cuci kendaraan, dan drainase lingkungan.',
    parameterKunci: 'Fungsi Sumur Resapan, Kerapatan Lubang Biopori, Parameter Kualitas Air Permukaan',
    tolokUkur: 'Kepmenkes No. 416/1990 tentang Syarat-Syarat dan Pengawasan Kualitas Air',
    metodeUklUpl: 'Pengecekan fungsi sumur resapan, pengukuran daya serap biopori, dan uji laboratorium berkala.',
    metodeSaatIni: 'Pengoperasian sumur resapan dan pengisian sampah organik dedaunan ke lubang biopori secara teratur.',
    lokasi: 'Area Taman Rumah Sakit, Saluran Terbuka Drainase, dan Bak Kontrol Resapan',
    hasilAnalisis: 'Tidak terjadi genangan air saat hujan lebat. Air resapan terserap dengan baik ke dalam lapisan tanah.',
    evaluasi: 'Sebagian titik pembuatan biopori baru menemui kendala lapisan tanah berbatu pada kedalaman > 80 cm.',
    tindakLanjut: 'Identifikasi titik-titik tanah gembur baru untuk menambah 10 unit lubang resapan biopori di taman sisi timur.',
    statusKepatuhan: 'MEMENUHI',
  },
];

export const PHYSICAL_ROOM_MEASUREMENTS: PhysicalRoomMeasurement[] = [
  { no: 1, kategori: 'IGD', unit: 'Ruang Isolasi IGD', suhu: 27.94, suhuDisplay: '27,94 °C', kelembaban: 70.4, kelembabanDisplay: '70,4% RH', kelembabanScore: 0, lux: 252, luxDisplay: '252 Lux', luxScore: 1, kebisingan: 43, kebisinganDisplay: '43 dB', kebisinganScore: 1 },
  { no: 2, kategori: 'IGD', unit: 'Ruang Resusitasi IGD', suhu: 27.55, suhuDisplay: '27,55 °C', kelembaban: 71.8, kelembabanDisplay: '71,8% RH', kelembabanScore: 0, lux: 259.1, luxDisplay: '259,1 Lux', luxScore: 1, kebisingan: 44, kebisinganDisplay: '44 dB', kebisinganScore: 1 },
  { no: 3, kategori: 'IGD', unit: 'Emergency Kebidanan IGD', suhu: 28.19, suhuDisplay: '28,19 °C', kelembaban: 71.7, kelembabanDisplay: '71,7% RH', kelembabanScore: 0, lux: 192.4, luxDisplay: '192,4 Lux', luxScore: 1, kebisingan: 45, kebisinganDisplay: '45 dB', kebisinganScore: 1 },
  { no: 4, kategori: 'RAJAL', unit: 'Poli Rawat Jalan Anak', suhu: 26.75, suhuDisplay: '26,75 °C', kelembaban: 68.2, kelembabanDisplay: '68,2% RH', kelembabanScore: 0, lux: 70, luxDisplay: '70 Lux', luxScore: 0, kebisingan: 48, kebisinganDisplay: '48 dB', kebisinganScore: 0 },
  { no: 5, kategori: 'RAJAL', unit: 'Poli Rawat Jalan Bedah', suhu: 25.30, suhuDisplay: '25,30 °C', kelembaban: 62.2, kelembabanDisplay: '62,2% RH', kelembabanScore: 0, lux: 120, luxDisplay: '120 Lux', luxScore: 0, kebisingan: 44, kebisinganDisplay: '44 dB', kebisinganScore: 1 },
  { no: 6, kategori: 'RAJAL', unit: 'Poli Gigi & Mulut', suhu: 25.53, suhuDisplay: '25,53 °C', kelembaban: 63.0, kelembabanDisplay: '63,0% RH', kelembabanScore: 0, lux: 334, luxDisplay: '334 Lux', luxScore: 1, kebisingan: 51, kebisinganDisplay: '51 dB', kebisinganScore: 1 },
  { no: 7, kategori: 'RAJAL', unit: 'Poli Rawat Jalan Umum', suhu: 29.20, suhuDisplay: '29,20 °C', kelembaban: 65.6, kelembabanDisplay: '65,6% RH', kelembabanScore: 0, lux: 61.2, luxDisplay: '61,2 Lux', luxScore: 0, kebisingan: 46, kebisinganDisplay: '46 dB', kebisinganScore: 0 },
  { no: 8, kategori: 'RAJAL', unit: 'Poli Rawat Jalan Kebidanan', suhu: 28.00, suhuDisplay: '28,00 °C', kelembaban: 68.2, kelembabanDisplay: '68,2% RH', kelembabanScore: 0, lux: 116, luxDisplay: '116 Lux', luxScore: 0, kebisingan: 52, kebisinganDisplay: '52 dB', kebisinganScore: 0 },
  { no: 9, kategori: 'PENUNJANG', unit: 'Instalasi Farmasi', suhu: 29.24, suhuDisplay: '29,24 °C', kelembaban: 64.0, kelembabanDisplay: '64,0% RH', kelembabanScore: 0.5, lux: 366, luxDisplay: '366 Lux', luxScore: 1, kebisingan: 58, kebisinganDisplay: '58 dB', kebisinganScore: 1 },
  { no: 10, kategori: 'PENUNJANG', unit: 'Rekam Medik Bawah', suhu: 26.16, suhuDisplay: '26,16 °C', kelembaban: 77.5, kelembabanDisplay: '77,5% RH', kelembabanScore: 0.5, lux: 159.8, luxDisplay: '159,8 Lux', luxScore: 1, kebisingan: 57, kebisinganDisplay: '57 dB', kebisinganScore: 1 },
  { no: 11, kategori: 'PENUNJANG', unit: 'Laboratorium Klinis', suhu: 28.00, suhuDisplay: '28,00 °C', kelembaban: 53.8, kelembabanDisplay: '53,8% RH', kelembabanScore: 0.5, lux: 60.1, luxDisplay: '60,1 Lux', luxScore: 1, kebisingan: 53, kebisinganDisplay: '53 dB', kebisinganScore: 1 },
  { no: 12, kategori: 'PENUNJANG', unit: 'Instalasi Radiologi', suhu: 27.30, suhuDisplay: '27,30 °C', kelembaban: 66.2, kelembabanDisplay: '66,2% RH', kelembabanScore: 0, lux: 60.1, luxDisplay: '60,1 Lux', luxScore: 1, kebisingan: 53, kebisinganDisplay: '53 dB', kebisinganScore: 0 },
  { no: 13, kategori: 'KRITIS', unit: 'Ruang Rawat Intensif (ICU)', suhu: 26.60, suhuDisplay: '26,60 °C', kelembaban: 75.2, kelembabanDisplay: '75,2% RH', kelembabanScore: 0, lux: 220, luxDisplay: '220 Lux', luxScore: 1, kebisingan: 57, kebisinganDisplay: '57 dB', kebisinganScore: 0 },
  { no: 14, kategori: 'KRITIS', unit: 'Instalasi Bedah Sentral (IBS)', suhu: 26.60, suhuDisplay: '26,60 °C', kelembaban: 60.0, kelembabanDisplay: '60,0% RH', kelembabanScore: 1, lux: 662.4, luxDisplay: '662,4 Lux', luxScore: 1, kebisingan: 48, kebisinganDisplay: '48 dB', kebisinganScore: 1 },
  { no: 15, kategori: 'RANAP', unit: 'Ranap Gabung Aisyah 1', suhu: 27.57, suhuDisplay: '27,57 °C', kelembaban: 75.0, kelembabanDisplay: '75,0% RH', kelembabanScore: 1, lux: 50, luxDisplay: '50 Lux', luxScore: 1, kebisingan: 69, kebisinganDisplay: '69 dB', kebisinganScore: 0 },
  { no: 16, kategori: 'RANAP', unit: 'Ranap Gabung Aisyah 2', suhu: 28.26, suhuDisplay: '28,26 °C', kelembaban: 59.8, kelembabanDisplay: '59,8% RH', kelembabanScore: 1, lux: 50, luxDisplay: '50 Lux', luxScore: 1, kebisingan: 48, kebisinganDisplay: '48 dB', kebisinganScore: 0 },
  { no: 17, kategori: 'RANAP', unit: 'Ranap Khadijah 1', suhu: 28.50, suhuDisplay: '28,50 °C', kelembaban: 68.6, kelembabanDisplay: '68,6% RH', kelembabanScore: 0.5, lux: 50, luxDisplay: '50 Lux', luxScore: 1, kebisingan: 49, kebisinganDisplay: '49 dB', kebisinganScore: 0 },
  { no: 18, kategori: 'RANAP', unit: 'Ranap Isolasi Fatimah 1', suhu: 28.43, suhuDisplay: '28,43 °C', kelembaban: 75.3, kelembabanDisplay: '75,3% RH', kelembabanScore: 0.5, lux: 250.2, luxDisplay: '250,2 Lux', luxScore: 1, kebisingan: 48, kebisinganDisplay: '48 dB', kebisinganScore: 0 },
  { no: 19, kategori: 'RANAP', unit: 'Ranap Isolasi Fatimah 2', suhu: 28.72, suhuDisplay: '28,72 °C', kelembaban: 72.9, kelembabanDisplay: '72,9% RH', kelembabanScore: 0.5, lux: 272.5, luxDisplay: '272,5 Lux', luxScore: 1, kebisingan: 49, kebisinganDisplay: '49 dB', kebisinganScore: 0 },
  { no: 20, kategori: 'RANAP', unit: 'Ranap Kelas 1 Usman 1', suhu: 28.22, suhuDisplay: '28,22 °C', kelembaban: 75.5, kelembabanDisplay: '75,5% RH', kelembabanScore: 0.5, lux: 240.2, luxDisplay: '240,2 Lux', luxScore: 1, kebisingan: 48, kebisinganDisplay: '48 dB', kebisinganScore: 0 },
  { no: 21, kategori: 'RANAP', unit: 'Ranap Kelas 1 Usman 9 (Malam)', suhu: 27.66, suhuDisplay: '27,66 °C', kelembaban: 75.5, kelembabanDisplay: '75,5% RH', kelembabanScore: 0.5, lux: 50, luxDisplay: '50 Lux (Tidur)', luxScore: 1, kebisingan: 45, kebisinganDisplay: '45 dB', kebisinganScore: 1 },
];

export const WATER_LAB_TEST_PARAMS: WaterLabTestParam[] = [
  { parameter: 'Total Coliform', bakuMutu: '0', satuan: 'CFU / 100 ml', artesis: '4 (Juni) / 0 (Jan-Mei)', roPoliGigi: '0', roLaboratorium: '4 (Juni) / 0 (Jan-Mei)', roCssd: '4 (Juni)', keterangan: 'Perlu filtrasi UV & klorinasi berkala' },
  { parameter: 'Escherichia Coli (E.Coli)', bakuMutu: '0', satuan: 'CFU / 100 ml', artesis: '0 (Juni) / 150 (Mei)', roPoliGigi: '0 (100% Bersih)', roLaboratorium: '0 (100% Bersih)', roCssd: '0 (100% Bersih)', keterangan: 'Air RO bebas E.Coli' },
  { parameter: 'Derajat Keasaman (pH)', bakuMutu: '6.5 – 8.5', satuan: '-', artesis: '6.74', roPoliGigi: '6.80', roLaboratorium: '6.75', roCssd: '6.74', keterangan: 'Memenuhi Baku Mutu' },
  { parameter: 'Kekeruhan (Turbidity)', bakuMutu: '≤ 25', satuan: 'NTU', artesis: '0 (stabil)', roPoliGigi: '0', roLaboratorium: '0', roCssd: '0', keterangan: 'Memenuhi Baku Mutu' },
  { parameter: 'Total Dissolved Solids (TDS)', bakuMutu: '< 300', satuan: 'mg/L', artesis: '40', roPoliGigi: '35', roLaboratorium: '50', roCssd: '50', keterangan: 'Kategori Air Sangat Ringan / Lunak' },
  { parameter: 'Suhu Udara Air', bakuMutu: 'Suhu ± 3°C', satuan: '°C', artesis: '24.3 °C', roPoliGigi: '24.2 °C', roLaboratorium: '24.1 °C', roCssd: '24.3 °C', keterangan: 'Normal Suhu Ruang' },
  { parameter: 'Bau & Rasa', bakuMutu: 'Tidak Berbau', satuan: '-', artesis: 'Tidak Berbau', roPoliGigi: 'Tidak Berbau', roLaboratorium: 'Tidak Berbau', roCssd: 'Tidak Berbau', keterangan: 'Organoleptik Memenuhi Syarat' },
  { parameter: 'Warna', bakuMutu: '≤ 50', satuan: 'Pt-Co', artesis: '0', roPoliGigi: '0', roLaboratorium: '0', roCssd: '0', keterangan: 'Jernih Memenuhi Syarat' },
  { parameter: 'Nitrat (NO3-N)', bakuMutu: '≤ 10', satuan: 'mg/L', artesis: '4.3', roPoliGigi: '< 0.1', roLaboratorium: '7.2', roCssd: '< 0.1', keterangan: 'Memenuhi Baku Mutu' },
  { parameter: 'Nitrit (NO2-N)', bakuMutu: '≤ 1', satuan: 'mg/L', artesis: '< 0.01', roPoliGigi: '< 0.01', roLaboratorium: '< 0.01', roCssd: '< 0.01', keterangan: 'Memenuhi Baku Mutu' },
  { parameter: 'Besi (Fe)', bakuMutu: '≤ 1', satuan: 'mg/L', artesis: '< 0.0025', roPoliGigi: '< 0.0025', roLaboratorium: '0.19', roCssd: '< 0.0025', keterangan: 'Memenuhi Baku Mutu' },
  { parameter: 'Mangan (Mn)', bakuMutu: '≤ 0.5', satuan: 'mg/L', artesis: '< 0.01', roPoliGigi: '< 0.01', roLaboratorium: '0.044', roCssd: '< 0.01', keterangan: 'Memenuhi Baku Mutu' },
  { parameter: 'Cromium Valensi 6 (Cr⁶⁺)', bakuMutu: '≤ 0.05', satuan: 'mg/L', artesis: '< 0.01', roPoliGigi: '< 0.01', roLaboratorium: '< 0.01', roCssd: '< 0.01', keterangan: 'Memenuhi Baku Mutu' },
  { parameter: 'Kesadahan (CaCO3)', bakuMutu: '≤ 500', satuan: 'mg/L', artesis: '120', roPoliGigi: '15', roLaboratorium: '25', roCssd: '18', keterangan: 'Memenuhi Baku Mutu' },
];

export const NERACA_LIMBAH_B3: NeracaLimbahB3Item[] = [
  {
    no: 1,
    jenisLimbah: 'Limbah Medis Padat / Infeksius',
    kodeLimbah: 'A337-1',
    jumlahKg: 209,
    perlakuan: 'Disimpan di TPS LB3 & Diserahkan ke Pihak Ke-3',
    pengolah: 'PT Jasa Medivest',
    statusIzin: 'Ada (Izin KLHK Pengolah & Transporter Aktif)',
  },
  {
    no: 2,
    jenisLimbah: 'Limbah Medis Benda Tajam (Safety Box)',
    kodeLimbah: 'A337-1',
    jumlahKg: 75,
    perlakuan: 'Disimpan di TPS LB3 & Diserahkan ke Pihak Ke-3',
    pengolah: 'PT Jasa Medivest',
    statusIzin: 'Ada (Izin KLHK Pengolah & Transporter Aktif)',
  },
  {
    no: 3,
    jenisLimbah: 'Limbah Farmasi & Obat Kedaluwarsa',
    kodeLimbah: 'A337-2',
    jumlahKg: 8,
    perlakuan: 'Disimpan di TPS LB3 & Diserahkan ke Pihak Ke-3',
    pengolah: 'PT Jasa Medivest',
    statusIzin: 'Ada (Izin KLHK Pengolah & Transporter Aktif)',
  },
];

export const MONTHLY_WASTE_RECAPS: MonthlyWasteRecap[] = [
  { bulan: 'Januari 2026', bulanAngka: 1, limbahTajamKg: 58.0, limbahPadatKg: 214.0, totalKg: 272.0, manifestCount: 6, primaryManifest: 'QR1120919, QR1120045' },
  { bulan: 'Februari 2026', bulanAngka: 2, limbahTajamKg: 58.0, limbahPadatKg: 194.0, totalKg: 252.0, manifestCount: 7, primaryManifest: 'RQ1121180, QR1120529' },
  { bulan: 'Maret 2026', bulanAngka: 3, limbahTajamKg: 77.0, limbahPadatKg: 208.0, totalKg: 285.0, manifestCount: 7, primaryManifest: 'QR1120420, QR1121587' },
  { bulan: 'April 2026', bulanAngka: 4, limbahTajamKg: 115.0, limbahPadatKg: 254.0, totalKg: 369.0, manifestCount: 9, primaryManifest: 'QR1122361, QR1122640' },
  { bulan: 'Mei 2026', bulanAngka: 5, limbahTajamKg: 105.0, limbahPadatKg: 242.0, totalKg: 347.0, manifestCount: 8, primaryManifest: 'QR1122833, QR1122744' },
  { bulan: 'Juni 2026', bulanAngka: 6, limbahTajamKg: 101.0, limbahPadatKg: 168.0, totalKg: 269.0, manifestCount: 8, primaryManifest: 'QR1122155, QR1123331' },
];

export const FACILITY_CHECKLIST: FacilityChecklistItem[] = [
  {
    kategori: 'Toilet & Sanitasi',
    indikator: 'Ketersediaan Toilet Ramah Disabilitas & Pemisahan Gender',
    standarRegulasi: 'Tersedia toilet aksesibel, pegangan rambat (handrail), pintu buka ke luar, tombol darurat',
    hasilPemeriksaan: 'MEMENUHI',
    keterangan: 'Tersedia di IGD dan Rawat Jalan serta 14 dari 32 kamar mandi rawat inap telah berstandar aksesibel.',
  },
  {
    kategori: 'Lantai Bangunan',
    indikator: 'Lantai Kedap Air, Tidak Licin, dan Pertemuan Dinding Konus/Lengkung',
    standarRegulasi: 'Permukaan rata, kuat, mudah dibersihkan, kemiringan ke arah saluran buangan, sambungan sudut konus',
    hasilPemeriksaan: 'MEMENUHI',
    keterangan: 'Seluruh area rawat inap dan tindakan telah mengaplikasikan plint melengkung (hospital plinth).',
  },
  {
    kategori: 'Atap Bangunan',
    indikator: 'Kekuatan Struktur Atap, Bebas Bocor, dan Bebas Sarang Hama',
    standarRegulasi: 'Konstruksi tahan cuaca, kemiringan cukup, tidak menjadi sarang tikus atau burung liar',
    hasilPemeriksaan: 'MEMENUHI',
    keterangan: 'Inspeksi berkala setiap awal musim hujan; saluran talang dibersihkan dari daun kering.',
  },
  {
    kategori: 'Langit-Langit (Plafon)',
    indikator: 'Ketinggian Plafon Ruangan dan Ketahanan Api (TKA)',
    standarRegulasi: 'Tinggi ruangan min 2,80 m, selasar min 2,40 m, ruang operasi min 3,00 m dengan TKA min 2 jam',
    hasilPemeriksaan: 'MEMENUHI',
    keterangan: 'Plafon ruang operasi menggunakan gypsum fire-stop dan lampu penerangan model dibenamkan (recessed).',
  },
  {
    kategori: 'Pintu & Jendela',
    indikator: 'Lebar Bukaan Pintu Brankar dan Keamanan Bukaan Jendela',
    standarRegulasi: 'Lebar pintu brankar min 120 cm, pintu non-bed min 90 cm, jendela bertingkat aman dari risiko pasien lolos',
    hasilPemeriksaan: 'MEMENUHI',
    keterangan: 'Seluruh akses brankar IGD dan rawat inap memiliki bukaan > 120 cm berlapis pelindung benturan (door kick plate).',
  },
];

export const DOCUMENTATION_PHOTOS: DocumentationPhotoItem[] = [
  { id: 'dok-1', modul: 'Kualitas Air', judul: 'Pengambilan Sampel Air Bersih & RO', deskripsi: 'Pengambilan sampel air sumur artesis dan air RO oleh sanitarian menggunakan botol steril dan jerigen khusus untuk diuji ke Labkesda.', lokasi: 'Kran Wastafel Laboratorium, Sumur Bor, Poli Gigi', halamanPdf: 106 },
  { id: 'dok-2', modul: 'Air Limbah IPAL', judul: 'Sampling Limbah Cair Inlet & Outlet IPAL', deskripsi: 'Pemeriksaan debit, warna, dan pengambilan sampel air limbah di bak pengolahan IPAL aerob-anaerob.', lokasi: 'Instalasi Pengolahan Air Limbah RSUD Al-Mulk', halamanPdf: 107 },
  { id: 'dok-3', modul: 'Air Limbah IPAL', judul: 'Pengoperasian & Kontrol Panel IPAL', deskripsi: 'Pemeliharaan blower aerator, sistem dosing klorin otomatis, dan kontrol panel elektrik IPAL.', lokasi: 'Ruang Mesin & Panel IPAL', halamanPdf: 108 },
  { id: 'dok-4', modul: 'Pemanfaatan IPAL', judul: 'Pemanfaatan Air Recycle Hasil IPAL', deskripsi: 'Penyaluran air olahan IPAL yang telah jernih dan steril untuk menyiram tanaman taman RS dan mencuci armada ambulans.', lokasi: 'Ruang Terbuka Hijau & Area Parkir Kendaraan', halamanPdf: 110 },
  { id: 'dok-5', modul: 'Air Bersih', judul: 'Instalasi Sumur Artesis & Mesin Pompa', deskripsi: 'Sistem pompa submersible kedalaman 98 meter terhubung dengan water meter dan tangki penampungan ground tank.', lokasi: 'Rumah Pompa Sumur Artesis', halamanPdf: 111 },
  { id: 'dok-6', modul: 'Air RO', judul: 'Mesin Reverse Osmosis (RO) Bertekanan', deskripsi: 'Unit membran filtrasi RO berdaya murni tinggi untuk penyuplaian air tindakan medis dan sterilisasi CSSD.', lokasi: 'Ruang Instalasi RO Gedung Pelayanan', halamanPdf: 112 },
  { id: 'dok-7', modul: 'Limbah Medis B3', judul: 'Pengangkutan Limbah Medis PT Jasa Medivest', deskripsi: 'Penyerahan limbah medis infeksius dan safety box dari TPS LB3 ke armada boks berpendingin berizin KLHK.', lokasi: 'TPS LB3 RSUD Al-Mulk', halamanPdf: 113 },
  { id: 'dok-8', modul: 'Limbah Medis B3', judul: 'Penimbangan & Verifikasi Manifest LB3', deskripsi: 'Penimbangan digital kantong limbah kuning dan serah terima dokumen festronik resmi sebelum pengangkutan.', lokasi: 'Depan TPS Bahan Berbahaya & Beracun', halamanPdf: 114 },
  { id: 'dok-9', modul: 'Kualitas Udara', judul: 'Pengukuran Pencahayaan & Kebisingan', deskripsi: 'Pengukuran intensitas cahaya (Lux Meter) dan tingkat kebisingan (Sound Level Meter) di ruang rawat inap dan poli.', lokasi: 'Poli Anak, Poli Bedah, Ranap Usman, ICU', halamanPdf: 115 },
  { id: 'dok-10', modul: 'Kualitas Udara', judul: 'Pengukuran Suhu & Kelembaban Ruangan', deskripsi: 'Pengukuran thermo-hygrometer digital untuk memastikan kesesuaian parameter fisik standar KRIS.', lokasi: 'Poli Kebidanan, Farmasi, Radiologi, Selasar', halamanPdf: 116 },
  { id: 'dok-11', modul: 'Vektor & Hama', judul: 'Pengendalian Vektor & Inspeksi Sarang Hama', deskripsi: 'Pemeriksaan jentik nyamuk pada dispenser, sudut kamar mandi, dan pencegahan tikus dengan perangkap higienis.', lokasi: 'Pantry, Kamar Mandi, Kolong Lemari, Taman', halamanPdf: 118 },
  { id: 'dok-12', modul: 'Proteksi Radiasi', judul: 'Pengamanan Radiasi Instalasi Radiologi', deskripsi: 'Pengecekan integritas dinding timbal (Pb), kaca intip berpelindung, dan kelaikan apron proteksi X-Ray.', lokasi: 'Ruang Rontgen & Panoramic Radiologi', halamanPdf: 120 },
  { id: 'dok-13', modul: 'Linen & Laundry', judul: 'Penyelenggaraan Linen & Alur Dekontaminasi', deskripsi: 'Penimbangan linen kotor berwadah khusus, pemilahan infeksius, pencucian mesin desinfeksi, dan lemari simpan bersih.', lokasi: 'Instalasi Pencucian Linen (Laundry)', halamanPdf: 121 },
  { id: 'dok-14', modul: 'Sterilisasi CSSD', judul: 'Dekontaminasi & Sterilisasi Autoclave CSSD', deskripsi: 'Proses pembersihan instrumen bedah, pengemasan pouches indikator, dan sterilisasi uap bertekanan tinggi.', lokasi: 'Central Sterile Supply Department (CSSD)', halamanPdf: 125 },
  { id: 'dok-15', modul: 'Sanitasi Pangan', judul: 'Higiene Sanitasi Dapur Gizi & Pramusaji', deskripsi: 'Pemeriksaan kebersihan tempat pengolahan makanan, pemakaian APD pramusaji, dan uji kelayakan organoleptik makanan.', lokasi: 'Instalasi Gizi & Dapur RSUD Al-Mulk', halamanPdf: 126 },
  { id: 'dok-16', modul: 'K3 & Kebakaran', judul: 'Pemeriksaan APAR & Kartu Gantung Inspeksi', deskripsi: 'Pengecekan jarum manometer tekanan tabung APAR dan kartu kontrol masa berlaku di seluruh koridor.', lokasi: 'Area Poli, Farmasi, IGD, Gedung Rawat Inap', halamanPdf: 127 },
  { id: 'dok-17', modul: 'Konservasi Air', judul: 'Stiker Hemat Air & Lubang Resapan Biopori', deskripsi: 'Pemasangan edukasi hemat air pada kran wastafel dan pembuatan lubang biopori untuk konservasi air tanah.', lokasi: 'Taman Depan & Selasar Kamar Mandi', halamanPdf: 127 },
  { id: 'dok-18', modul: 'Drainase & Resapan', judul: 'Sumur Resapan Air Hujan & Bak Kontrol', deskripsi: 'Inspeksi saluran drainase keliling dan bak kontrol resapan untuk mencegah genangan dan menjaga muka air tanah.', lokasi: 'Halaman Belakang & Sisi Barat Gedung', halamanPdf: 128 },
];
