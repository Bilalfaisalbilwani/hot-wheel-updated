import { jsPDF } from 'jspdf';

export interface CarRentalPdfData {
  referenceId: string;
  submissionDate?: string;
  name: string;
  whatsappNumber: string;
  email?: string;
  pickupLocation: string;
  dropOffLocation: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  serviceType: string;
  vehicleType: string;
  estimatedPrice?: string | number;
  currency?: string;
  notes?: string;
  status?: string;
}

/**
 * Generates official Car Rental Enquiry PDF
 */
export async function generateCarRentalPdf(data: CarRentalPdfData): Promise<{
  doc: jsPDF;
  pdfBase64: string;
  pdfBytes: Uint8Array;
  save: (fileName?: string) => void;
}> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const submissionDate = data.submissionDate || new Date().toLocaleString('en-AE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  // Color Palette
  const primaryNavy = [10, 37, 64];   // #0A2540
  const accentBlue = [11, 77, 162];   // #0B4DA2
  const textDark = [30, 41, 59];      // #1E293B
  const textMuted = [100, 116, 139];  // #64748B
  const bgLight = [248, 250, 252];    // #F8FAFC
  const borderLight = [226, 232, 240];

  // Header Banner
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('HOTWHEELS CAR RENTAL LLC', 16, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(210, 225, 245);
  doc.text('CAR RENTAL ENQUIRY SUMMARY', 16, 20);

  // Reference Box
  doc.setFillColor(accentBlue[0], accentBlue[1], accentBlue[2]);
  doc.roundedRect(132, 5, 62, 18, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('REFERENCE ID:', 136, 11);
  doc.setFontSize(9.5);
  doc.text(data.referenceId, 136, 18);

  // Submission Date line
  let y = 35;
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Submission Date: ${submissionDate}`, 16, y);

  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.setLineWidth(0.5);
  doc.line(16, y + 2, 194, y + 2);

  // Helper to draw label & value
  const drawField = (label: string, value: string, xPos: number, yField: number) => {
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(label.toUpperCase(), xPos, yField);

    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const displayVal = (value || 'N/A').length > 45 ? (value || 'N/A').substring(0, 42) + '...' : (value || 'N/A');
    doc.text(displayVal, xPos, yField + 4.5);
  };

  // SECTION 1: CUSTOMER INFORMATION
  y = 44;
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(16, y, 178, 32, 2, 2, 'F');
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.roundedRect(16, y, 178, 32, 2, 2, 'S');

  doc.setFillColor(accentBlue[0], accentBlue[1], accentBlue[2]);
  doc.rect(16, y, 3, 32, 'F');

  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('1. CUSTOMER INFORMATION', 23, y + 7);

  drawField('Customer Name', data.name, 23, y + 15);
  drawField('WhatsApp / Phone', data.whatsappNumber, 110, y + 15);

  if (data.email) {
    drawField('Email Address', data.email, 23, y + 25);
  }

  // SECTION 2: RENTAL DETAILS
  y = 82;
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(16, y, 178, 54, 2, 2, 'F');
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.roundedRect(16, y, 178, 54, 2, 2, 'S');

  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.rect(16, y, 3, 54, 'F');

  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('2. RENTAL PARAMETERS', 23, y + 7);

  drawField('Service Type', data.serviceType, 23, y + 15);
  drawField('Vehicle / Category', data.vehicleType, 110, y + 15);

  drawField('Pickup Location', data.pickupLocation, 23, y + 27);
  drawField('Drop-off Location', data.dropOffLocation, 110, y + 27);

  drawField('Pickup Date & Time', `${data.pickupDate} (${data.pickupTime || 'N/A'})`, 23, y + 39);
  drawField('Return Date & Time', `${data.returnDate} (${data.returnTime || 'N/A'})`, 110, y + 39);

  // SECTION 3: PRICING (IF APPLICABLE)
  if (data.estimatedPrice) {
    y = 142;
    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.roundedRect(16, y, 178, 20, 2, 2, 'F');
    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.roundedRect(16, y, 178, 20, 2, 2, 'S');

    doc.setFillColor(accentBlue[0], accentBlue[1], accentBlue[2]);
    doc.rect(16, y, 3, 20, 'F');

    doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('3. PRICING DETAILS', 23, y + 7);

    const priceText = `${data.currency || 'AED'} ${data.estimatedPrice}`;
    drawField('Estimated / Selected Rate', priceText, 23, y + 13);
  }

  // SECTION 4: ADDITIONAL REQUIREMENTS
  if (data.notes && data.notes.trim()) {
    y = data.estimatedPrice ? 168 : 142;
    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.roundedRect(16, y, 178, 24, 2, 2, 'F');
    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.roundedRect(16, y, 178, 24, 2, 2, 'S');

    doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('ADDITIONAL REQUIREMENTS & NOTES:', 23, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    const splitNotes = doc.splitTextToSize(data.notes.trim(), 168);
    doc.text(splitNotes, 23, y + 13);
  }

  // Footer
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    'HOTWHEELS CAR RENTAL LLC • Dubai, UAE • Phone/WhatsApp: +971 55 558 6359 • Email: info@zonetourism.ae',
    16,
    286
  );

  const baseArrayBuffer = doc.output('arraybuffer');
  const pdfBytes = new Uint8Array(baseArrayBuffer);

  // Convert Uint8Array to base64
  let binary = '';
  const chunkSize = 32768;
  for (let i = 0; i < pdfBytes.length; i += chunkSize) {
    const chunk = pdfBytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  const pdfBase64 = btoa(binary);

  return {
    doc,
    pdfBase64,
    pdfBytes,
    save: (fileName?: string) => {
      const fName = fileName || `car-rental-${data.referenceId}.pdf`;
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fName;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 1500);
    }
  };
}
