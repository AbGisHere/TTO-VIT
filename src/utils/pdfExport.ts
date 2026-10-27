import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

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
      if (img.complete && img.naturalWidth > 0) {
        return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
      }
      return new Promise<void>(resolve => {
        img.onload = () => {
          if (img.decode) {
            img.decode().then(() => resolve()).catch(() => resolve());
          } else {
            resolve();
          }
        };
        img.onerror = () => resolve();
      });
    })
  );

  // 3. Remove CSS scale transform during capture so metrics and typography are 100% natural
  const prevTransform = container.style.transform;
  container.style.transform = 'none';

  // Allow DOM to reflow at natural 100% scale
  await new Promise(resolve => setTimeout(resolve, 300));

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

    // Preload the official header banner to guarantee 100% visibility on all pages
    const headerImg = new Image();
    headerImg.src = '/assets/branding/tto_header.png';
    await new Promise<void>((resolve) => {
      if (headerImg.complete && headerImg.naturalWidth > 0) return resolve();
      headerImg.onload = () => resolve();
      headerImg.onerror = () => resolve();
    });
    const headerAspect = headerImg.naturalHeight > 0 && headerImg.naturalWidth > 0
      ? headerImg.naturalHeight / headerImg.naturalWidth
      : 168 / 1241;
    const headerHeightMm = 210 * headerAspect;

    let headerDataUrl: string | HTMLImageElement = headerImg;
    try {
      const headerCanvas = document.createElement('canvas');
      headerCanvas.width = headerImg.naturalWidth || 1241;
      headerCanvas.height = headerImg.naturalHeight || 168;
      const hctx = headerCanvas.getContext('2d');
      if (hctx) {
        hctx.drawImage(headerImg, 0, 0);
        headerDataUrl = headerCanvas.toDataURL('image/png');
      }
    } catch {
      headerDataUrl = headerImg;
    }

    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      // Capture at 2.5x retina quality using native SVG layout engine
      // Preserves exact fonts, exact layout, true shapes, and crystal-clear clarity!
      const imgData = await toPng(pageEl, {
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        width: 893,
        height: 1263,
        canvasWidth: 893 * 2.5,
        canvasHeight: 1263 * 2.5,
        cacheBust: false
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');

      // Stamping the razor-sharp header banner directly at (0, 0) guarantees
      // that Page 1 and Page 2 are 100% complete with zero SVG foreignObject dropouts.
      try {
        pdf.addImage(headerDataUrl, 'PNG', 0, 0, 210, headerHeightMm, undefined, 'FAST');
      } catch (stampErr) {
        console.warn('Header stamp fallback:', stampErr);
      }
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
