"use client";

/**
 * Screenshot Tool - Captures visual state of the current page
 */

export async function captureScreenshot(
  options: {
    fullPage?: boolean;
    selector?: string;
    quality?: number;
  } = {},
): Promise<{
  dataUrl: string;
  width: number;
  height: number;
  timestamp: number;
}> {
  const { fullPage = false, selector, quality = 0.8 } = options;

  try {
    let element: HTMLElement = document.body;

    // If selector provided, capture specific element
    if (selector) {
      const targetElement = document.querySelector(selector) as HTMLElement;
      if (!targetElement) {
        throw new Error(`Element not found: ${selector}`);
      }
      element = targetElement;
    }

    // Use html2canvas for client-side screenshots
    // Note: This requires html2canvas library
    const canvas = await html2canvasCapture(element);

    const dataUrl = canvas.toDataURL("image/png", quality);

    return {
      dataUrl,
      width: canvas.width,
      height: canvas.height,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    throw new Error(`Screenshot failed: ${error.message}`);
  }
}

// Fallback: Use html2canvas if available, otherwise use basic canvas
async function html2canvasCapture(
  element: HTMLElement,
): Promise<HTMLCanvasElement> {
  // @ts-ignore - html2canvas will be loaded dynamically
  if (typeof window !== "undefined" && window.html2canvas) {
    // @ts-ignore
    return await window.html2canvas(element, {
      logging: false,
      useCORS: true,
      allowTaint: true,
    });
  }

  // Fallback: Basic canvas capture (limited functionality)
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  const rect = element.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  // This is a very basic fallback and won't work for complex elements
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "16px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("Screenshot capture requires html2canvas library", 10, 30);

  return canvas;
}

/**
 * Get screenshot as base64 string (for API transmission)
 */
export async function getScreenshotBase64(
  options?: Parameters<typeof captureScreenshot>[0],
): Promise<string> {
  const screenshot = await captureScreenshot(options);
  // Remove data:image/png;base64, prefix
  return screenshot.dataUrl.split(",")[1];
}

/**
 * Capture multiple screenshots (e.g., different sections)
 */
export async function captureMultipleScreenshots(
  selectors: string[],
): Promise<Array<{ selector: string; dataUrl: string }>> {
  const screenshots = await Promise.all(
    selectors.map(async (selector) => {
      try {
        const screenshot = await captureScreenshot({ selector });
        return { selector, dataUrl: screenshot.dataUrl };
      } catch (error: any) {
        return {
          selector,
          dataUrl: `error:${error.message}`,
        };
      }
    }),
  );

  return screenshots;
}
