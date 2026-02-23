/**
 * Screenshot capture for bug reports using html2canvas.
 */

import html2canvas from 'html2canvas';

export async function captureScreenshot(): Promise<string | null> {
  try {
    const root = document.getElementById('root');
    if (!root) return null;

    const canvas = await html2canvas(root, {
      useCORS: true,
      allowTaint: true,
      logging: false,
      scale: window.devicePixelRatio ?? 1,
      windowWidth: root.scrollWidth,
      windowHeight: root.scrollHeight,
    });

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn('[BugReport] Screenshot failed:', err);
    return null;
  }
}
