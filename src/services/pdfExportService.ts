import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { logger } from "@/lib/logger";

export interface PDFExportOptions {
  filename?: string;
  format?: "a4" | "letter";
  quality?: "standard" | "high";
}

const defaultOptions: PDFExportOptions = {
  filename: "kernel-competitive-analysis.pdf",
  format: "a4",
  quality: "high",
};

export const pdfExportService = {
  /**
   * Generates a PDF from an HTML element
   */
  async generatePDFFromElement(
    element: HTMLElement,
    options: PDFExportOptions = {}
  ): Promise<Blob> {
    const mergedOptions = { ...defaultOptions, ...options };
    const pixelRatio = mergedOptions.quality === "high" ? 2 : 1;

    try {
      // Capture the element as a canvas
      const canvas = await html2canvas(element, {
        scale: pixelRatio,
        useCORS: true,
        logging: false,
        backgroundColor: "#0a0a0f",
        allowTaint: true,
      });

      // Create PDF with proper dimensions
      const imgWidth = mergedOptions.format === "a4" ? 210 : 215.9; // mm
      const imgHeight = mergedOptions.format === "a4" ? 297 : 279.4; // mm

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: mergedOptions.format,
      });

      // Add metadata
      pdf.setProperties({
        title: "Kernel Competitive Analysis",
        subject: "Platform comparison and feature analysis",
        author: "Kernel",
        keywords: "AI, development platform, comparison, competitive analysis",
        creator: "Kernel PDF Export",
      });

      // Convert canvas to image and add to PDF
      const imgData = canvas.toDataURL("image/png", 1.0);
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Return as blob
      return pdf.output("blob");
    } catch (error) {
      logger.error("Failed to generate PDF:", error);
      throw new Error("Failed to generate PDF. Please try again.");
    }
  },

  /**
   * Downloads a blob as a file
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Combined method to generate and download PDF
   */
  async exportAndDownload(
    element: HTMLElement,
    options: PDFExportOptions = {}
  ): Promise<void> {
    const mergedOptions = { ...defaultOptions, ...options };
    const blob = await this.generatePDFFromElement(element, mergedOptions);
    this.downloadBlob(blob, mergedOptions.filename!);
  },
};
