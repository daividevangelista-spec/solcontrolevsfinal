/**
 * Utilities for exporting database tables to JSON and CSV formats.
 */

export const downloadFile = (data: string, filename: string, mimeType: string) => {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const jsonToCsv = (json: any[]) => {
  if (!json || json.length === 0) return '';
  const headers = Object.keys(json[0]);
  const rows = json.map(obj => 
    headers.map(header => {
      const val = obj[header];
      if (val === null || val === undefined) return '';
      if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
      return val;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
};

export const exportToJson = (data: any, identifier: string) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const date = new Date().toISOString().split('T')[0];
  const filename = `backup_${identifier}_${date}.json`;
  downloadFile(jsonStr, filename, 'application/json');
  return { filename, sizeKb: Math.round(jsonStr.length / 1024) };
};

export const exportToCsv = (data: any[], identifier: string) => {
  const csvStr = jsonToCsv(data);
  const date = new Date().toISOString().split('T')[0];
  const filename = `export_${identifier}_${date}.csv`;
  downloadFile(csvStr, filename, 'text/csv');
  return { filename, sizeKb: Math.round(csvStr.length / 1024) };
};
