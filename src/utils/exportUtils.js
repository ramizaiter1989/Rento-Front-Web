/**
 * Export Utilities
 * Functions to export data as PDF or Excel
 */

/**
 * Export data to CSV/Excel format
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions [{key, label, transform?}, ...]
 * @param {string} filename - Name of the file (without extension)
 */
export const exportToExcel = (data, columns, filename = 'export') => {
  // Create CSV content
  const headers = columns.map(col => col.label || col.key).join(',');
  const rows = data.map(item => {
    return columns.map(col => {
      let value = item[col.key];
      // Apply transform if provided
      if (col.transform && typeof col.transform === 'function') {
        value = col.transform(item);
      }
      // Handle null/undefined
      if (value === null || value === undefined) return '';
      // Escape commas and quotes in CSV
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });

  const csvContent = [headers, ...rows].join('\n');
  
  // Add BOM for Excel UTF-8 support
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data to PDF using browser print
 * @param {HTMLElement} element - HTML element to export
 * @param {string} filename - Name of the file (without extension)
 */
export const exportToPDF = (element, filename = 'export') => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          @media print {
            body { margin: 0; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

/**
 * Export table data to PDF (creates a table from data array)
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions [{key, label}, ...]
 * @param {string} title - Title for the PDF
 * @param {string} filename - Name of the file (without extension)
 */
export const exportTableToPDF = (data, columns, title = 'Export', filename = 'export') => {
  const tableHtml = `
    <div>
      <h1>${title}</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col.label || col.key}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(item => `
            <tr>
              ${columns.map(col => `<td>${item[col.key] ?? ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          @media print {
            body { margin: 0; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        ${tableHtml}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};
