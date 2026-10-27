import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportBriefToPdf = async (techId: string, title: string): Promise<Blob> => {
  const pageElements = document.querySelectorAll<HTMLElement>('.sheet-page');
  if (!pageElements.length) {
    throw new Error('No printable pages found in document');
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  for (let i = 0; i < pageElements.length; i++) {
    const pageEl = pageElements[i];

    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    // Render page canvas with high resolution
    const canvas = await html2canvas(pageEl, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  }

  const filename = `${techId || 'Technology_Brief'}_${title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  pdf.save(filename);

  return pdf.output('blob');
};

export const printBrief = () => {
  window.print();
};
