import React, { useState } from 'react';
import { DebtAlert } from '../utils/debtAlerts';
import { DebtItem } from '../types/finance';
import { 
  BellRing, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles
} from 'lucide-react';

interface DebtAlertBannerProps {
  alerts: DebtAlert[];
  onOpenDebtModal: () => void;
  onRecordPayment?: (debt: DebtItem) => void;
}

export const DebtAlertBanner: React.FC<DebtAlertBannerProps> = ({
  alerts,
  onOpenDebtModal,
  onRecordPayment,
}) => {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const visibleAlerts = alerts.filter((a) => !dismissedIds.includes(a.id));

  if (visibleAlerts.length === 0) return null;

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds((prev) => [...prev, id]);
  };

  const urgentCount = visibleAlerts.filter((a) => a.severity === 'urgent').length;

  return (
    <div className="w-full space-y-2.5 my-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-xl flex items-center justify-center ${
            urgentCount > 0 
              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 animate-pulse' 
              : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
          }`}>
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold theme-text flex items-center gap-1.5 uppercase tracking-wider">
              <span>Debt &amp; EMI Reminders</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                urgentCount > 0 
                  ? 'bg-rose-600 text-white' 
                  : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
              }`}>
                {visibleAlerts.length} Active
              </span>
            </h3>
            <p className="text-[10px] theme-text-muted">
              3-Day periodic updates &amp; clearance/EMI due notifications
            </p>
          </div>
        </div>

        <button
          onClick={onOpenDebtModal}
          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>View All Debts</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {visibleAlerts.map((alert) => {
          const isBorrowed = alert.debt.type === 'borrowed';
          const isUrgent = alert.severity === 'urgent';
          const isWarning = alert.severity === 'warning';

          const cardBg = isUrgent
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100'
            : isWarning
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100'
            : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-950 dark:text-indigo-100';

          const badgeBg = isBorrowed
            ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30'
            : 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30';

          return (
            <div
              key={alert.id}
              className={`p-3.5 rounded-2xl border ${cardBg} backdrop-blur-xs flex flex-col justify-between gap-2.5 shadow-2xs relative group transition hover:border-emerald-500/40`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    isBorrowed ? 'bg-rose-500/20 text-rose-600' : 'bg-teal-500/20 text-teal-600'
                  }`}>
                    {isBorrowed ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-xs tracking-tight">
                        {alert.title}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 font-bold uppercase rounded border ${badgeBg}`}>
                        {isBorrowed ? 'Taken Debt' : 'Lent Money'}
                      </span>
                      {alert.debt.isEmi && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold rounded border border-indigo-500/30">
                          EMI
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-1 leading-snug theme-text font-medium">
                      {alert.message}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDismiss(alert.id, e)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition shrink-0"
                  title="Dismiss for this session"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between border-t border-slate-500/15 pt-2 text-[11px]">
                <div className="flex items-center gap-2 theme-text-muted font-mono font-semibold">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Active: {alert.daysActive}d</span>
                  {alert.dueDateStr && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Due: {alert.dueDateStr}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {onRecordPayment && (
                    <button
                      onClick={() => onRecordPayment(alert.debt)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] shadow-2xs transition flex items-center gap-1 active:scale-95"
                    >
                      <DollarSign className="w-3 h-3" />
                      <span>{isBorrowed ? 'Pay Now' : 'Record Received'}</span>
                    </button>
                  )}
                  <button
                    onClick={onOpenDebtModal}
                    className="px-2 py-1 theme-subtle-btn rounded-lg text-[11px] font-semibold border"
                  >
                    Details
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
