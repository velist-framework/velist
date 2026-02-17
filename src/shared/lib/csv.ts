/**
 * Converts an array of objects to CSV format
 * @param data - Array of objects to convert
 * @param headers - Optional custom headers (key: header label)
 * @returns CSV formatted string
 */
export function convertToCSV<T extends Record<string, unknown>>(
  data: T[],
  headers?: Record<keyof T, string>
): string {
  if (data.length === 0) return '';

  const keys = Object.keys(data[0]) as (keyof T)[];
  
  // Header row
  const headerRow = keys.map(key => {
    const label = headers?.[key] ?? String(key);
    return escapeCSV(String(label));
  }).join(',');

  // Data rows
  const rows = data.map(item => {
    return keys.map(key => {
      const value = item[key];
      return escapeCSV(value === null || value === undefined ? '' : String(value));
    }).join(',');
  });

  return [headerRow, ...rows].join('\r\n');
}

/**
 * Escape CSV value
 */
function escapeCSV(value: string): string {
  // If value contains comma, quote, or newline, wrap in quotes
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Download data as CSV file
 * @param filename - Name of the file (without .csv)
 * @param data - Array of objects
 * @param headers - Optional custom headers
 */
export function downloadCSV<T extends Record<string, unknown>>(
  filename: string,
  data: T[],
  headers?: Record<keyof T, string>
): void {
  const csv = convertToCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Convert array to TSV (Tab Separated Values) for Excel paste
 */
export function convertToTSV<T extends Record<string, unknown>>(
  data: T[],
  headers?: Record<keyof T, string>
): string {
  if (data.length === 0) return '';

  const keys = Object.keys(data[0]) as (keyof T)[];
  
  const headerRow = keys.map(key => {
    return headers?.[key] ?? String(key);
  }).join('\t');

  const rows = data.map(item => {
    return keys.map(key => {
      const value = item[key];
      return value === null || value === undefined ? '' : String(value);
    }).join('\t');
  });

  return [headerRow, ...rows].join('\r\n');
}
