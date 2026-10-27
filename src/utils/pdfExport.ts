import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportBriefToPdf = async (techId: string, title: string): Promise<Blob> => {
  // 1. Ensure all custom web fonts are fully ready
  await document.fonts.ready;

  const container = document.querySelector<HTMLElement>('.tech-brief-print-container');
  if (!container) {
    throw new Error('No printable container found in document');
  }

  // 2. Crucial fix: Remove CSS scale transform during canvas capture so text kerning does not overlap!
  const prevTransform = container.style.transform;
  container.style.transform = 'none';

  // Allow DOM to reflow at natural 100% scale
  await new Promise(resolve => setTimeout(resolve, 120));

  try {
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

      // Capture at crisp 2x resolution with clean font metrics
      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 893,
        height: 1263
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }

    const safeFilename = `${techId || 'Technology_Brief'}_${title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    pdf.save(safeFilename);

    return pdf.output('blob');
  } finally {
    // Restore preview zoom scale
    container.style.transform = prevTransform;
  }
};

export const printBrief = () => {
  window.print();
};
