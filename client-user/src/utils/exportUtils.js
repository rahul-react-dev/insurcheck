import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

/**
 * Export audit logs to PDF format
 */
export const exportToPDF = (data, filters = {}) => {
  try {
    const doc = new jsPDF();
    const timestamp = format(new Date(), 'yyyy-MM-dd');
    
    // Add title
    doc.setFontSize(20);
    doc.text('Audit Logs and Version History', 14, 22);
    
    // Add subtitle with date range if applicable
    doc.setFontSize(12);
    let subtitle = `Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`;
    if (filters.startDate || filters.endDate) {
      const start = filters.startDate ? format(new Date(filters.startDate), 'MMM dd, yyyy') : 'Start';
      const end = filters.endDate ? format(new Date(filters.endDate), 'MMM dd, yyyy') : 'End';
      subtitle += ` | Period: ${start} - ${end}`;
    }
    doc.text(subtitle, 14, 32);
    
    // Add filters information if any
    if (Object.keys(filters).some(key => filters[key] && key !== 'startDate' && key !== 'endDate')) {
      doc.setFontSize(10);
      let filtersText = 'Filters Applied: ';
      const activeFilters = [];
      
      if (filters.search) activeFilters.push(`Search: "${filters.search}"`);
      if (filters.documentName) activeFilters.push(`Document: "${filters.documentName}"`);
      if (filters.userEmail) activeFilters.push(`User: "${filters.userEmail}"`);
      if (filters.actionPerformed) activeFilters.push(`Action: "${filters.actionPerformed}"`);
      
      filtersText += activeFilters.join(', ');
      doc.text(filtersText, 14, 42);
    }
    
    // Prepare table data
    const tableColumns = [
      { header: 'Log ID', dataKey: 'logId' },
      { header: 'Document Name', dataKey: 'documentName' },
      { header: 'Version', dataKey: 'version' },
      { header: 'Action', dataKey: 'actionPerformed' },
      { header: 'Timestamp', dataKey: 'timestamp' },
      { header: 'User Email', dataKey: 'userEmail' }
    ];
    
    const tableData = data.map(log => ({
      logId: log.logId || 'N/A',
      documentName: log.documentName || 'N/A',
      version: log.version || '1.0',
      actionPerformed: log.actionPerformed || 'Unknown',
      timestamp: log.timestamp ? format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm') : 'N/A',
      userEmail: log.userEmail || 'System'
    }));
    
    // Add table
    doc.autoTable({
      columns: tableColumns,
      body: tableData,
      startY: Object.keys(filters).some(key => filters[key] && key !== 'startDate' && key !== 'endDate') ? 50 : 40,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue-600
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251] // Gray-50
      },
      margin: { top: 50, left: 14, right: 14 },
      didDrawPage: (data) => {
        // Add footer with page numbers
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10
        );
      }
    });
    
    // Save the PDF
    const fileName = `Audit_Logs_${timestamp}.pdf`;
    doc.save(fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('Failed to export PDF. Please try again.');
  }
};

/**
 * Export audit logs to Excel format
 */
export const exportToExcel = (data, filters = {}) => {
  try {
    const timestamp = format(new Date(), 'yyyy-MM-dd');
    
    // Prepare worksheet data
    const worksheetData = [
      // Title row
      ['Audit Logs and Version History'],
      [`Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`],
      [], // Empty row
    ];
    
    // Add filters information if any
    if (Object.keys(filters).some(key => filters[key])) {
      const activeFilters = [];
      if (filters.search) activeFilters.push(`Search: "${filters.search}"`);
      if (filters.documentName) activeFilters.push(`Document: "${filters.documentName}"`);
      if (filters.userEmail) activeFilters.push(`User: "${filters.userEmail}"`);
      if (filters.actionPerformed) activeFilters.push(`Action: "${filters.actionPerformed}"`);
      if (filters.startDate) activeFilters.push(`Start Date: ${format(new Date(filters.startDate), 'MMM dd, yyyy')}`);
      if (filters.endDate) activeFilters.push(`End Date: ${format(new Date(filters.endDate), 'MMM dd, yyyy')}`);
      
      if (activeFilters.length > 0) {
        worksheetData.push(['Filters Applied:']);
        activeFilters.forEach(filter => worksheetData.push([filter]));
        worksheetData.push([]); // Empty row
      }
    }
    
    // Add table headers
    worksheetData.push([
      'Log ID',
      'Document Name', 
      'Version',
      'Action Performed',
      'Timestamp',
      'User Email',
      'Action'
    ]);
    
    // Add table data
    data.forEach(log => {
      worksheetData.push([
        log.logId || 'N/A',
        log.documentName || 'N/A',
        log.version || '1.0',
        log.actionPerformed || 'Unknown',
        log.timestamp ? format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm') : 'N/A',
        log.userEmail || 'System',
        log.action || 'View'
      ]);
    });
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    const columnWidths = [
      { wch: 12 }, // Log ID
      { wch: 30 }, // Document Name
      { wch: 10 }, // Version
      { wch: 20 }, // Action Performed
      { wch: 18 }, // Timestamp
      { wch: 25 }, // User Email
      { wch: 10 }  // Action
    ];
    worksheet['!cols'] = columnWidths;
    
    // Style the title and headers
    const headerRowIndex = worksheetData.findIndex(row => row[0] === 'Log ID');
    if (headerRowIndex > -1) {
      // Style header row
      const headerRange = XLSX.utils.encode_range({
        s: { c: 0, r: headerRowIndex },
        e: { c: 6, r: headerRowIndex }
      });
      
      for (let c = 0; c <= 6; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c });
        if (!worksheet[cellAddress]) continue;
        
        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "3B82F6" } }, // Blue-600
          alignment: { horizontal: "center" }
        };
      }
    }
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Logs');
    
    // Save the Excel file
    const fileName = `Audit_Logs_${timestamp}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Excel export error:', error);
    throw new Error('Failed to export Excel. Please try again.');
  }
};

/**
 * Export audit logs to CSV format (frontend version)
 */
export const exportToCSV = (data, filters = {}) => {
  try {
    const timestamp = format(new Date(), 'yyyy-MM-dd');
    
    // Prepare CSV content
    const headers = [
      'Log ID',
      'Document Name',
      'Version', 
      'Action Performed',
      'Timestamp',
      'User Email',
      'Action'
    ];
    
    const csvContent = [
      headers.join(','),
      ...data.map(log => [
        `"${log.logId || 'N/A'}"`,
        `"${log.documentName || 'N/A'}"`,
        `"${log.version || '1.0'}"`,
        `"${log.actionPerformed || 'Unknown'}"`,
        `"${log.timestamp ? format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm') : 'N/A'}"`,
        `"${log.userEmail || 'System'}"`,
        `"${log.action || 'View'}"`
      ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Audit_Logs_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { success: true, fileName: `Audit_Logs_${timestamp}.csv` };
  } catch (error) {
    console.error('CSV export error:', error);
    throw new Error('Failed to export CSV. Please try again.');
  }
};

/**
 * Main export function that handles all formats
 */
export const exportAuditLogs = async (format, data, filters = {}) => {
  if (!data || data.length === 0) {
    throw new Error('No data available to export');
  }
  
  switch (format.toLowerCase()) {
    case 'pdf':
      return exportToPDF(data, filters);
    case 'excel':
    case 'xlsx':
      return exportToExcel(data, filters);
    case 'csv':
      return exportToCSV(data, filters);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

/**
 * Export single audit log to PDF format
 */
export const exportSingleLogToPDF = (log) => {
  try {
    const doc = new jsPDF();
    const currentDate = new Date();
    
    // Add header with logo placeholder and title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('InsurCheck - Audit Log Report', 14, 22);
    
    // Add a line under the header
    doc.setLineWidth(0.5);
    doc.line(14, 26, 196, 26);
    
    // Add generation info
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated on: ${format(currentDate, 'MMM dd, yyyy HH:mm')}`, 14, 35);
    
    // Add log details section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Audit Log Details', 14, 50);
    
    // Create details table
    const details = [
      ['Log ID:', log.logId || 'N/A'],
      ['Document Name:', log.documentName || 'N/A'],
      ['Version:', log.version || '1.0'],
      ['Action Performed:', log.actionPerformed || 'Unknown Action'],
      ['Timestamp:', log.timestamp ? format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm') : 'N/A'],
      ['User Email:', log.userEmail || 'System']
    ];
    
    // Add details with proper formatting
    let yPos = 60;
    details.forEach(([label, value]) => {
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(label, 14, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(value, 55, yPos);
      yPos += 12;
    });
    
    // Add additional information section if available
    if (log.details && log.details !== 'No details available') {
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Additional Details', 14, yPos + 10);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const splitDetails = doc.splitTextToSize(log.details, 170);
      doc.text(splitDetails, 14, yPos + 22);
    }
    
    // Add footer with page number and generation date
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(`Page 1 of 1`, 14, pageHeight - 10);
    doc.text(`Generated: ${format(currentDate, 'yyyy-MM-dd HH:mm')}`, doc.internal.pageSize.width - 50, pageHeight - 10);
    
    // Save the PDF with specific naming convention
    const fileName = `Audit_Log_${log.logId || 'Unknown'}.pdf`;
    doc.save(fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Single PDF export error:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

// All functions are already exported as named exports above