import React, { useState } from 'react';
import { Transaction, WalletStats } from '../types/finance';
import { generateXmlReport, downloadXmlFile } from '../utils/xmlExporter';
import { X, Download, FileCode, CheckSquare, Square, Calendar } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  userEmail?: string;
  allTransactions: Transaction[];
  walletStats: WalletStats[];
  availableMonths: string[];
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  userEmail,
  allTransactions,
  walletStats,
  availableMonths,
  onClose,
}) => {
  if (!isOpen) return null;

  const validMonths = availableMonths.filter((m) => m !== 'ALL');
  const [exportMode, setExportMode] = useState<'single_month' | 'selected_months' | 'six_months'>('single_month');
  const [singleMonth, setSingleMonth] = useState<string>(validMonths[0] || new Date().toISOString().slice(0, 7));
  const [selectedMonths, setSelectedMonths] = useState<string[]>(validMonths.slice(0, 3));

  const toggleMonthSelection = (mKey: string) => {
    if (selectedMonths.includes(mKey)) {
      setSelectedMonths(selectedMonths.filter((m) => m !== mKey));
    } else {
      setSelectedMonths([...selectedMonths, mKey]);
    }
  };

  const formatMonthLabel = (mKey: string) => {
    const [year, month] = mKey.split('-');
    if (!year || !month) return mKey;
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const handleExport = () => {
    let filteredTxs: Transaction[] = [];
    let periodLabel = '';

    if (exportMode === 'single_month') {
      filteredTxs = allTransactions.filter((tx) => tx.monthKey === singleMonth);
      periodLabel = formatMonthLabel(singleMonth);
    } else if (exportMode === 'selected_months') {
      filteredTxs = allTransactions.filter((tx) => selectedMonths.includes(tx.monthKey));
      periodLabel = selectedMonths.map(formatMonthLabel).join(', ');
    } else if (exportMode === 'six_months') {
      // Get cutoff date 6 months ago
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - 6);
      const cutoffMonthKey = cutoffDate.toISOString().slice(0, 7);

      filteredTxs = allTransactions.filter((tx) => tx.monthKey >= cutoffMonthKey);
      periodLabel = `Last 6 Months (Up to ${formatMonthLabel(new Date().toISOString().slice(0, 7))})`;
    }

    const xmlContent = generateXmlReport({
      userEmail,
      periodLabel,
      wallets: walletStats,
      transactions: filteredTxs,
      exportType: exportMode,
    });

    const sanitizedPeriod = periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const fileName = `finance_report_${exportMode}_${sanitizedPeriod}.xml`;

    downloadXmlFile(xmlContent, fileName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6">
      <div className="min-h-full flex items-center justify-center">
        <div className="theme-modal border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <span>Download XML Finance Report</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 theme-subtle-btn rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-xs theme-text-muted">
            Export structured XML data containing wallet balances, income/expense breakdown, inter-transfers, and transaction records.
          </p>

          {/* Export Mode Tabs */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold">
              Select Export Scope
            </label>

            {/* Mode 1: Single Month */}
            <div
              onClick={() => setExportMode('single_month')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                exportMode === 'single_month'
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-700 dark:text-cyan-200'
                  : 'theme-input border theme-text-muted hover:border-slate-400 dark:hover:border-slate-700'
              }`}
            >
              <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="font-bold text-xs block">Single Month Export</span>
                <span className="text-[11px] theme-text-muted block mt-0.5">
                  Export XML data for one specific month
                </span>

                {exportMode === 'single_month' && (
                  <select
                    value={singleMonth}
                    onChange={(e) => setSingleMonth(e.target.value)}
                    className="mt-2.5 w-full theme-input border rounded-xl p-2 text-xs focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {validMonths.map((m) => (
                      <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                        {formatMonthLabel(m)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Mode 2: Selective Month Wise */}
            <div
              onClick={() => setExportMode('selected_months')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                exportMode === 'selected_months'
                  ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-700 dark:text-indigo-200'
                  : 'theme-input border theme-text-muted hover:border-slate-400 dark:hover:border-slate-700'
              }`}
            >
              <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="font-bold text-xs block">Selective Months Export</span>
                <span className="text-[11px] theme-text-muted block mt-0.5">
                  Choose specific custom months to combine into XML
                </span>

                {exportMode === 'selected_months' && (
                  <div className="mt-2.5 grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 theme-input border rounded-xl">
                    {validMonths.map((mKey) => {
                      const isChecked = selectedMonths.includes(mKey);
                      return (
                        <button
                          key={mKey}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMonthSelection(mKey);
                          }}
                          className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition text-left ${
                            isChecked ? 'bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30' : 'theme-text-muted hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> : <Square className="w-3.5 h-3.5 theme-text-muted" />}
                          <span>{formatMonthLabel(mKey)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Mode 3: 6 Month Bundle */}
            <div
              onClick={() => setExportMode('six_months')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                exportMode === 'six_months'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-200'
                  : 'theme-input border theme-text-muted hover:border-slate-400 dark:hover:border-slate-700'
              }`}
            >
              <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-xs block">Full 6 Months Export</span>
                <span className="text-[11px] theme-text-muted block mt-0.5">
                  Export complete data recorded over the last 6 months
                </span>
              </div>
            </div>

          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 theme-subtle-btn rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="w-2/3 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download XML File</span>
            </button>
          </div>

        </div>

        </div>
      </div>
    </div>
  );
};
