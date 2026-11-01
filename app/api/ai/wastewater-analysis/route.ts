import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import {
  WastewaterRow,
  WastewaterAIAnalysisResult,
  generateDeterministicWastewaterAnalysis,
  calculateWastewaterMetrics,
} from '@/lib/wastewater-quality';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rows: WastewaterRow[] = Array.isArray(body?.rows) ? body.rows : [];
    const periodLabel: string = body?.periodLabel || '1 Tahun Penuh';

    const deterministic = generateDeterministicWastewaterAnalysis(rows, periodLabel);
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

    const metrics = calculateWastewaterMetrics(rows);
    const tmsDetails = rows
      .filter((r) => r.status === 'TMS')
      .map(
        (r) =>
          `- [${r.samplingPoint}] Bulan ${r.monthName}: Parameter ${r.indicator} = ${r.resultValue} ${r.unit} (Baku Mutu: ${r.normalValue} ${r.unit}) -> Status: TMS`
      )
      .join('\n');

    const prompt = `Anda adalah Konsultan Ahli Teknik Penyehatan Lingkungan & Sanitarian Rumah Sakit untuk UOBK RSUD Al-Mulk Kota Sukabumi.
Lakukan analisis mendalam dan berikan rekomendasi teknis operasional IPAL berdasarkan data tabel "INDIKATOR BAKU MUTU LIMBAH CAIR" berikut:

Periode Evaluasi: ${periodLabel}
Total Pengujian: ${metrics.totalTests}
Tingkat Kepatuhan Keseluruhan: ${metrics.complianceRate}%
Kepatuhan Efluen Outlet: ${metrics.outletComplianceRate}%
Efisiensi Reduksi Rata-rata:
- Reduksi BOD: ${metrics.avgBodReduction}%
- Reduksi COD: ${metrics.avgCodReduction}%
- Reduksi Total Coliform: ${metrics.avgColiformReduction}%

Daftar Temuan Tidak Memenuhi Syarat (TMS):
${tmsDetails || 'Tidak ada temuan TMS. Seluruh efluen outlet dan influen inlet berada dalam rentang baku mutu.'}

Berikan respons JSON terstruktur dalam Bahasa Indonesia yang formal, aplikatif, dan berbobot teknis medis lingkungan bagi petugas sanitarian dan operator IPAL RSUD Al-Mulk, mengacu pada Peraturan Menteri LHK RI No. P.68/2016 tentang Baku Mutu Air Limbah Domestik/Fasyankes dan Permenkes RI No. 2 Tahun 2023.`;

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
                'Pilih salah satu: "RENDAH (EFLUEN TERKENDALI)", "SEDANG (PERLU PENGAWASAN)", atau "TINGGI (RISIKO PENCEMARAN)"',
            },
            healthScore: {
              type: Type.NUMBER,
              description: 'Skor indeks kinerja pengolahan limbah cair antara 0 hingga 100',
            },
            treatmentEfficiencyScore: {
              type: Type.NUMBER,
              description: 'Persentase efisiensi pengolahan rata-rata IPAL antara 0 hingga 100',
            },
            executiveSummary: {
              type: Type.STRING,
              description:
                'Ringkasan eksekutif 2-3 kalimat komprehensif mengenai kondisi dan kinerja IPAL pada periode ini',
            },
            inletCharacteristics: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING },
                summary: { type: Type.STRING },
                criticalPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['status', 'summary', 'criticalPoints'],
            },
            outletCompliance: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING },
                summary: { type: Type.STRING },
                safeDischargeRate: { type: Type.STRING },
              },
              required: ['status', 'summary', 'safeDischargeRate'],
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  priority: {
                    type: Type.STRING,
                    description:
                      'Pilih: "SEGERA (24-48 Jam)", "JANGKA PENDEK (1-2 Minggu)", atau "PREVENTIF BERKALA"',
                  },
                  action: { type: Type.STRING },
                  targetUnit: { type: Type.STRING },
                  standardRef: { type: Type.STRING },
                  benefit: { type: Type.STRING },
                },
                required: ['priority', 'action', 'targetUnit', 'standardRef', 'benefit'],
              },
            },
            regulatoryNote: {
              type: Type.STRING,
              description: 'Catatan regulasi baku mutu lingkungan',
            },
          },
          required: [
            'riskLevel',
            'healthScore',
            'treatmentEfficiencyScore',
            'executiveSummary',
            'inletCharacteristics',
            'outletCompliance',
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
    const merged: WastewaterAIAnalysisResult = {
      riskLevel: parsed.riskLevel || deterministic.riskLevel,
      healthScore:
        typeof parsed.healthScore === 'number' ? parsed.healthScore : deterministic.healthScore,
      treatmentEfficiencyScore:
        typeof parsed.treatmentEfficiencyScore === 'number'
          ? parsed.treatmentEfficiencyScore
          : deterministic.treatmentEfficiencyScore,
      executiveSummary: parsed.executiveSummary || deterministic.executiveSummary,
      inletCharacteristics: parsed.inletCharacteristics || deterministic.inletCharacteristics,
      outletCompliance: parsed.outletCompliance || deterministic.outletCompliance,
      recommendations:
        Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0
          ? parsed.recommendations
          : deterministic.recommendations,
      regulatoryNote: parsed.regulatoryNote || deterministic.regulatoryNote,
      generatedAt: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      sourceEngine: 'Gemini 3.8 Flash · AI Wastewater Intelligence RSAM',
    };

    return NextResponse.json({ analysis: merged });
  } catch {
    const fallbackRows: WastewaterRow[] = [];
    return NextResponse.json({
      analysis: generateDeterministicWastewaterAnalysis(fallbackRows, '1 Tahun Penuh'),
    });
  }
}
