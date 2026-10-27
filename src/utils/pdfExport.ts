import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportBriefToPdf = async (
  techId: string,
  title: string,
  downloadDirectly: boolean = true
): Promise<Blob> => {
  // 1. Ensure all custom web fonts (Montserrat, Plus Jakarta Sans, Arial) are fully loaded
  await document.fonts.ready;

  const container = document.querySelector<HTMLElement>('.tech-brief-print-container');
  if (!container) {
    throw new Error('No printable container found in document');
  }

  // 2. Ensure all images in the document are fully loaded and decoded in memory
  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    images.map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );

  // 3. Remove CSS scale transform during capture so metrics and typography are 100% natural
  const prevTransform = container.style.transform;
  container.style.transform = 'none';

  // Allow DOM to reflow at natural 100% scale
  await new Promise(resolve => setTimeout(resolve, 200));

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

      // html2canvas draws images via direct canvas drawImage, ensuring headers,
      // logos, and figures are 100% visible on all pages without browser sandbox blocks.
      const canvas = await html2canvas(pageEl, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 893,
        height: 1263,
        windowWidth: 893,
        windowHeight: 1263
      });

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
    }

    if (downloadDirectly) {
      const safeFilename = `${techId || 'Technology_Brief'}_${title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      pdf.save(safeFilename);
    }

    return pdf.output('blob');
  } finally {
    // Restore preview zoom scale
    container.style.transform = prevTransform;
  }
};

export const printBrief = () => {
  window.print();
};
