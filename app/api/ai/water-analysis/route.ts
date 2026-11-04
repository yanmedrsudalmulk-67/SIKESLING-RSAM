import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import {
  WaterQualityRow,
  WaterAIAnalysisResult,
  generateDeterministicWaterAnalysis,
  calculateWaterQualityMetrics,
} from '@/lib/water-quality';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rows: WaterQualityRow[] = Array.isArray(body?.rows) ? body.rows : [];
    const periodLabel: string = body?.periodLabel || '1 Tahun Penuh';

    const deterministic = generateDeterministicWaterAnalysis(rows, periodLabel);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      return NextResponse.json({
        analysis: deterministic,
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const metrics = calculateWaterQualityMetrics(rows);
    const tmsDetails = rows
      .filter((r) => r.status === 'TMS')
      .map(
        (r) =>
          `- Bulan ${r.monthName}: ${r.sourceName} | Parameter ${r.indicator} = ${r.resultValue}/100 ml (Baku Mutu: ${r.normalValue}) -> Status: TMS`
      )
      .join('\n');

    const prompt = `Anda adalah Konsultan Ahli Kesehatan Lingkungan (Sanitarian) Rumah Sakit untuk UOBK RSUD Al-Mulk Kota Sukabumi.
Lakukan analisis mendalam dan berikan rekomendasi teknis berdasarkan data pemeriksaan tabel "INDIKATOR BAKU MUTU AIR BERSIH" berikut:

Periode Evaluasi: ${periodLabel}
Total Parameter Diuji: ${metrics.totalTests}
Memenuhi Syarat (MS): ${metrics.msCount}
Tidak Memenuhi Syarat (TMS): ${metrics.tmsCount}
Persentase Kepatuhan: ${metrics.complianceRate}%
Titik Sampel Air: Artesis, Air RO Lab, Air RO Poli Gigi, Air Minum
Parameter Uji: Total Coliform (Nilai Normal 0/100 ml) dan E.Coli (Nilai Normal 0/100 ml), serta parameter fisik & kimia lengkap pada Bulan Juni dan Desember

Rincian Temuan TMS (Tidak Memenuhi Syarat):
${tmsDetails || 'Tidak ada temuan TMS. Seluruh parameter bernilai 0/100 ml (MS).'}

Berikan respons JSON terstruktur dalam Bahasa Indonesia yang formal, teknis, dan aplikatif untuk tim Sanitarian RSUD Al-Mulk mengacu pada Permenkes RI No. 2 Tahun 2023 dan Permenkes RI No. 7 Tahun 2019.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: {
              type: Type.STRING,
              description:
                'Pilih salah satu: "RENDAH (TERKENDALI)", "SEDANG (PERLU TINDAK LANJUT)", atau "TINGGI (KRITIS)"',
            },
            healthScore: {
              type: Type.NUMBER,
              description: 'Skor indeks mutu air bersih antara 0 hingga 100',
            },
            executiveSummary: {
              type: Type.STRING,
              description:
                'Ringkasan eksekutif komprehensif 2-3 kalimat mengenai hasil pemantauan kualitas air bersih pada periode ini',
            },
            sourceDiagnoses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sourceName: {
                    type: Type.STRING,
                    description: 'Nama titik air: Artesis, Air RO Lab, Air RO Poli Gigi, atau Air Minum',
                  },
                  status: {
                    type: Type.STRING,
                    description: 'MS atau TMS',
                  },
                  summary: {
                    type: Type.STRING,
                    description: 'Ringkasan capaian pada titik sampel tersebut',
                  },
                  rootCauseHypothesis: {
                    type: Type.STRING,
                    description: 'Analisis teknis potensi penyebab / faktor risiko',
                  },
                },
                required: ['sourceName', 'status', 'summary', 'rootCauseHypothesis'],
              },
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  priority: {
                    type: Type.STRING,
                    description:
                      'Prioritas waktu: SEGERA (24-48 Jam), JANGKA PENDEK (1-2 Minggu), atau PREVENTIF BERKALA',
                  },
                  action: {
                    type: Type.STRING,
                    description: 'Langkah intervensi teknis sanitarian yang spesifik dan terukur',
                  },
                  targetUnit: {
                    type: Type.STRING,
                    description: 'Unit pelaksana / penanggung jawab di rumah sakit',
                  },
                  standardRef: {
                    type: Type.STRING,
                    description: 'Referensi regulasi atau SOP teknis terkait',
                  },
                },
                required: ['priority', 'action', 'targetUnit', 'standardRef'],
              },
            },
            regulatoryNote: {
              type: Type.STRING,
              description: 'Catatan kepatuhan baku mutu sesuai Permenkes RI No. 2 Tahun 2023',
            },
          },
          required: [
            'riskLevel',
            'healthScore',
            'executiveSummary',
            'sourceDiagnoses',
            'recommendations',
            'regulatoryNote',
          ],
        },
      },
    });

    if (!response.text) {
      return NextResponse.json({ analysis: deterministic });
    }

    const parsed = JSON.parse(response.text);
    const merged: WaterAIAnalysisResult = {
      riskLevel: parsed.riskLevel || deterministic.riskLevel,
      healthScore:
        typeof parsed.healthScore === 'number' ? parsed.healthScore : deterministic.healthScore,
      executiveSummary: parsed.executiveSummary || deterministic.executiveSummary,
      keyFindings: deterministic.keyFindings,
      sourceDiagnoses:
        Array.isArray(parsed.sourceDiagnoses) && parsed.sourceDiagnoses.length > 0
          ? parsed.sourceDiagnoses
          : deterministic.sourceDiagnoses,
      recommendations:
        Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0
          ? parsed.recommendations
          : deterministic.recommendations,
      regulatoryNote: parsed.regulatoryNote || deterministic.regulatoryNote,
      generatedAt: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      sourceEngine: 'Gemini 3.8 Flash · AI Sanitary Intelligence RSAM',
    };

    return NextResponse.json({ analysis: merged });
  } catch {
    const fallbackRows: WaterQualityRow[] = [];
    return NextResponse.json({
      analysis: generateDeterministicWaterAnalysis(fallbackRows, '1 Tahun Penuh'),
    });
  }
}
