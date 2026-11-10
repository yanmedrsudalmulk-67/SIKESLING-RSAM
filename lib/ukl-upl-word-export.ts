/**
 * Generator File Dokumen Word Resmi UKL-UPL (.doc / HTML compatible)
 * Memungkinkan ekspor dokumen ke Microsoft Word dengan layout halaman resmi F4 (215.9mm x 330.2mm)
 * dan margin 2,5 cm persis seperti modul Laporan Kesling.
 */

export function generateUklUplWordDocumentHtml(params: {
  title: string;
  bodyHtml: string;
  year: number;
}): string {
  const { title, bodyHtml, year } = params;

  return `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${title} - ${year}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: 21.59cm 33.02cm; /* F4 / FOLIO STANDAR RESMI */
      margin: 2.5cm 2.5cm 2.5cm 2.5cm; /* MARGIN 2,5 CM SELURUH SISI */
      mso-page-orientation: portrait;
    }
    @page Section_Landscape {
      size: 33.02cm 21.59cm; /* F4 LANDSCAPE */
      margin: 2.5cm 2.5cm 2.5cm 2.5cm;
      mso-page-orientation: landscape;
    }
    div.Section_Landscape {
      page: Section_Landscape;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #0f172a;
      background: #ffffff;
    }
    h1, h2, h3, h4 {
      font-family: Arial, Helvetica, sans-serif;
      color: #002147;
      margin-top: 14pt;
      margin-bottom: 6pt;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8pt;
      margin-bottom: 12pt;
      font-size: 9.5pt;
    }
    th, td {
      border: 1px solid #475569;
      padding: 5pt 7pt;
      vertical-align: top;
    }
    th {
      background-color: #f1f5f9;
      font-weight: bold;
      text-align: center;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-justify { text-align: justify; }
    .font-bold { font-weight: bold; }
    .page-break {
      page-break-after: always;
      break-after: page;
    }
    .kop-surat {
      text-align: center;
      border-bottom: 3px double #000000;
      padding-bottom: 8pt;
      margin-bottom: 16pt;
    }
    .kop-surat h2 {
      margin: 0;
      font-size: 14pt;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
    }
    .kop-surat h3 {
      margin: 0;
      font-size: 12pt;
      text-transform: uppercase;
    }
    .kop-surat p {
      margin: 2pt 0 0 0;
      font-size: 9pt;
      color: #334155;
    }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>
  `.trim();
}
