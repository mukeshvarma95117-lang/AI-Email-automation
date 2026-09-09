import React, { useState } from 'react';
import { UploadCloud, FileText, Download, CheckCircle, AlertCircle, X } from 'lucide-react';

export default function CsvImportModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const downloadSampleCsv = () => {
    const csvContent = `Name,Email,Phone,Group,event,date,time,location
Aarav Patel,aarav@example.com,+1 555-0301,AI Workshop Students,Generative AI Bootcamp,Tomorrow,10:00 AM,Tech Hall A
Sneha Rao,sneha@example.com,+1 555-0302,AI Workshop Students,Generative AI Bootcamp,Tomorrow,10:00 AM,Tech Hall A
Vikram Sethi,vikram@example.com,+1 555-0303,Web Dev Cohort,Full Stack Review,Friday,02:00 PM,Lab 2`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'smartsend_sample_contacts.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setError(null);
    setFile(selected);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        parseCsv(text);
      } catch (err) {
        setError('Failed to parse CSV file: ' + err.message);
      }
    };
    reader.readAsText(selected);
  };

  const parseCsvLine = (text) => {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const parseCsv = (csvText) => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      setError('CSV file must have at least a header row and one data row.');
      return;
    }

    // Parse header row
    const rawHeaders = parseCsvLine(lines[0]).map(h => h.trim().replace(/^["']|["']$/g, ''));
    setHeaders(rawHeaders);

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]).map(v => v.trim().replace(/^["']|["']$/g, ''));
      if (values.length > 0 && values.some(v => v.length > 0)) {
        const rowObj = {};
        rawHeaders.forEach((h, idx) => {
          rowObj[h] = values[idx] !== undefined ? values[idx] : '';
        });
        rows.push(rowObj);
      }
    }

    setParsedRows(rows);
  };

  const handleUpload = async () => {
    if (parsedRows.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      await onImportSuccess(parsedRows);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to import contacts.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
            <UploadCloud className="w-5 h-5 text-indigo-600" />
            <span>Import Contacts via CSV</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
            <div>
              <p className="font-semibold text-indigo-950 dark:text-indigo-200">Need a template?</p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">Download our structured sample CSV with custom variable columns.</p>
            </div>
            <button
              type="button"
              onClick={downloadSampleCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 font-semibold text-xs shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              Download Sample
            </button>
          </div>

          {/* Upload Drop Zone */}
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-file-upload"
            />
            <label
              htmlFor="csv-file-upload"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                  Click to select CSV file
                </span>
                <span className="text-slate-500"> or drag and drop</span>
              </div>
              <p className="text-[11px] text-slate-400">CSV files with Name, Email, Phone, and custom columns</p>
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview Parsed Data */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-semibold">
                <span>File Preview ({parsedRows.length} rows detected)</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5" /> Ready for import
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl max-h-48">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                    <tr>
                      {headers.map(h => (
                        <th key={h} className="px-3 py-2 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        {headers.map(h => (
                          <td key={h} className="px-3 py-1.5 whitespace-nowrap text-slate-700 dark:text-slate-300">
                            {row[h] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={parsedRows.length === 0 || isProcessing}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isProcessing ? 'Importing...' : `Import ${parsedRows.length} Contacts`}
          </button>
        </div>
      </div>
    </div>
  );
}

