/**
 * Certificate PDF Generator - Client-side only, no server required
 * Uses jsPDF for PDF generation in the browser
 * 
 * To use this, you'll need to install jsPDF:
 * npm install jspdf
 * 
 * Usage:
 * import { generateCertificatePDF } from '@utils/certificatePDF.js';
 * generateCertificatePDF(studentName, courseTitle, completionDate, instructorName);
 */

// Uncomment after installing jsPDF
// import { jsPDF } from 'jspdf';

export function generateCertificatePDF(studentName, courseTitle, completionDate, instructorName, lessonsCompleted = 0) {
  // NOTE: This requires jsPDF to be installed
  // Run: npm install jspdf
  
  // Uncomment the code below after installing jsPDF:
  
  /*
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'in',
    format: 'letter'
  });

  // Set page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;

  // Draw border
  doc.setLineWidth(3);
  doc.setDrawColor(184, 118, 6); // Gold color
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  
  doc.setLineWidth(1);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Title
  doc.setFontSize(48);
  doc.setFont('times', 'bold');
  doc.text('CERTIFICATE', centerX, 40, { align: 'center' });
  
  doc.setFontSize(24);
  doc.setFont('times', 'normal');
  doc.text('OF COMPLETION', centerX, 50, { align: 'center' });

  // Student name section
  let yPos = 80;
  
  if (studentName) {
    doc.setFontSize(14);
    doc.text('This certifies that', centerX, yPos, { align: 'center' });
    yPos += 15;
    
    doc.setFontSize(32);
    doc.setFont('times', 'italic');
    doc.setTextColor(184, 118, 6);
    doc.text(studentName, centerX, yPos, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    yPos += 15;
    
    doc.setFontSize(14);
    doc.setFont('times', 'normal');
    doc.text('has successfully completed the course:', centerX, yPos, { align: 'center' });
    yPos += 12;
  } else {
    doc.setFontSize(16);
    doc.text('Awarded for completion of:', centerX, yPos, { align: 'center' });
    yPos += 12;
  }

  // Course title
  doc.setFontSize(20);
  doc.setFont('times', 'bold');
  doc.text(courseTitle, centerX, yPos, { align: 'center' });
  yPos += 15;

  // Date and lessons
  doc.setFontSize(12);
  doc.setFont('times', 'normal');
  doc.text(`Completed on: ${completionDate}`, centerX, yPos, { align: 'center' });
  yPos += 8;
  doc.text(`Lessons completed: ${lessonsCompleted}`, centerX, yPos, { align: 'center' });

  // Signature line
  yPos = pageHeight - 50;
  const sigLineX = centerX - 50;
  const sigLineWidth = 100;
  
  doc.line(sigLineX, yPos, sigLineX + sigLineWidth, yPos);
  
  doc.setFontSize(16);
  doc.setFont('times', 'italic');
  doc.text(instructorName, centerX, yPos - 5, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  doc.text('Instructor Signature', centerX, yPos + 5, { align: 'center' });

  // Save or open PDF
  doc.save(`certificate-${Date.now()}.pdf`);
  
  // Alternative: Open in new window
  // window.open(doc.output('bloburl'), '_blank');
  */
  
  console.warn('jsPDF not installed. Run: npm install jspdf');
  alert('PDF generation requires jsPDF library. Please install it first.');
}

/**
 * Generate and download certificate as PDF
 */
export function downloadCertificatePDF(options) {
  const {
    studentName = '',
    courseTitle = 'Course',
    completionDate = new Date().toLocaleDateString(),
    instructorName = 'Instructor',
    lessonsCompleted = 0
  } = options;
  
  generateCertificatePDF(studentName, courseTitle, completionDate, instructorName, lessonsCompleted);
}
