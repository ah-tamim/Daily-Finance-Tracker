import { DebtItem } from '../types/finance';

export interface DebtAlert {
  id: string;
  debt: DebtItem;
  type: 'borrowed_3day' | 'borrowed_due' | 'borrowed_emi' | 'lent_3day' | 'lent_due';
  severity: 'urgent' | 'warning' | 'info';
  title: string;
  message: string;
  daysActive: number;
  daysUntilDue?: number;
  dueDateStr?: string;
}

/**
 * Calculates active debt alerts based on 3-day intervals and upcoming clear / EMI due dates.
 */
export function getDebtAlerts(debts: DebtItem[]): DebtAlert[] {
  const alerts: DebtAlert[] = [];
  const now = new Date();
  const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const activeDebts = debts.filter((d) => d.status === 'active');

  for (const debt of activeDebts) {
    const createdDate = new Date(debt.createdAt);
    const createdMs = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate()).getTime();
    const daysActive = Math.max(0, Math.floor((todayMs - createdMs) / (1000 * 60 * 60 * 24)));

    const remainingAmount = Math.max(0, debt.totalAmount - debt.paidAmount);
    if (remainingAmount <= 0) continue;

    const personLabel = debt.lenderBorrower?.trim() 
      ? debt.lenderBorrower.trim() 
      : (debt.type === 'borrowed' ? 'Lender' : 'Borrower');

    // --- Parse Due Date if available ---
    let dueTargetDate: Date | null = null;
    let daysUntilDue: number | undefined = undefined;

    if (debt.dueDate && debt.dueDate.trim()) {
      const rawDue = debt.dueDate.trim();
      // Check if format is YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawDue)) {
        const [y, m, d] = rawDue.split('-').map(Number);
        dueTargetDate = new Date(y, m - 1, d);
      } else {
        // Extract day number (e.g., "10", "15th", "10th of every month")
        const match = rawDue.match(/\d+/);
        if (match) {
          const dayNum = Math.min(28, Math.max(1, parseInt(match[0], 10)));
          // Construct date for current month or next month if day already passed
          const curMonthDate = new Date(now.getFullYear(), now.getMonth(), dayNum);
          if (curMonthDate.getTime() < todayMs) {
            // Due date passed in current month, look at next month or today
            dueTargetDate = curMonthDate;
          } else {
            dueTargetDate = curMonthDate;
          }
        }
      }
    }

    if (dueTargetDate) {
      const dueMs = new Date(dueTargetDate.getFullYear(), dueTargetDate.getMonth(), dueTargetDate.getDate()).getTime();
      daysUntilDue = Math.round((dueMs - todayMs) / (1000 * 60 * 60 * 24));
    }

    // 1. BORROWED DEBT ALERTS (Debt taken by me)
    if (debt.type === 'borrowed') {
      // Rule A: Alert before clear date or EMI due date (within 3 days, today, or overdue)
      if (daysUntilDue !== undefined && daysUntilDue <= 3) {
        if (daysUntilDue < 0) {
          alerts.push({
            id: `${debt.id}_borrowed_overdue`,
            debt,
            type: debt.isEmi ? 'borrowed_emi' : 'borrowed_due',
            severity: 'urgent',
            title: `🚨 Overdue: ${debt.isEmi ? 'EMI' : 'Debt'} Payment`,
            message: `Your payment of ৳${(debt.isEmi && debt.emiMonthlyAmount ? debt.emiMonthlyAmount : remainingAmount).toLocaleString()} for "${debt.title}" to ${personLabel} was due ${Math.abs(daysUntilDue)} day(s) ago.`,
            daysActive,
            daysUntilDue,
            dueDateStr: debt.dueDate,
          });
        } else if (daysUntilDue === 0) {
          alerts.push({
            id: `${debt.id}_borrowed_today`,
            debt,
            type: debt.isEmi ? 'borrowed_emi' : 'borrowed_due',
            severity: 'urgent',
            title: `⚠️ ${debt.isEmi ? 'EMI' : 'Debt'} Due Today!`,
            message: `Your ${debt.isEmi ? 'monthly EMI' : 'debt clearance'} payment for "${debt.title}" (৳${(debt.isEmi && debt.emiMonthlyAmount ? debt.emiMonthlyAmount : remainingAmount).toLocaleString()}) is due TODAY to ${personLabel}.`,
            daysActive,
            daysUntilDue: 0,
            dueDateStr: debt.dueDate,
          });
        } else {
          alerts.push({
            id: `${debt.id}_borrowed_due_soon`,
            debt,
            type: debt.isEmi ? 'borrowed_emi' : 'borrowed_due',
            severity: 'warning',
            title: `⏰ ${debt.isEmi ? 'EMI' : 'Debt'} Due in ${daysUntilDue} Day(s)`,
            message: `${debt.isEmi ? 'Monthly EMI' : 'Clearance payment'} for "${debt.title}" (৳${(debt.isEmi && debt.emiMonthlyAmount ? debt.emiMonthlyAmount : remainingAmount).toLocaleString()}) to ${personLabel} is due on ${dueTargetDate?.toLocaleDateString() || debt.dueDate}.`,
            daysActive,
            daysUntilDue,
            dueDateStr: debt.dueDate,
          });
        }
      }

      // Rule B: Alert every 3 days for taken debt (3-day periodic reminder)
      // Checks if daysActive > 0 and daysActive is a multiple of 3, or active >= 3 days
      if (daysActive > 0 && daysActive % 3 === 0) {
        alerts.push({
          id: `${debt.id}_borrowed_3day_${daysActive}`,
          debt,
          type: 'borrowed_3day',
          severity: 'warning',
          title: `🔔 3-Day Debt Reminder: Owed Money`,
          message: `It has been ${daysActive} days since borrowing "${debt.title}". You owe ৳${remainingAmount.toLocaleString()} to ${personLabel}.`,
          daysActive,
          daysUntilDue,
          dueDateStr: debt.dueDate,
        });
      }
    }

    // 2. LENT DEBT ALERTS (Debt given to someone else)
    if (debt.type === 'lent') {
      // Rule A: Alert every 3 days for lent debt (3-day collection reminder)
      if (daysActive > 0 && daysActive % 3 === 0) {
        alerts.push({
          id: `${debt.id}_lent_3day_${daysActive}`,
          debt,
          type: 'lent_3day',
          severity: 'info',
          title: `📢 3-Day Follow-Up: Money Lent`,
          message: `It has been ${daysActive} days since lending money for "${debt.title}". Don't forget to follow up with ${personLabel} to collect ৳${remainingAmount.toLocaleString()}.`,
          daysActive,
          daysUntilDue,
          dueDateStr: debt.dueDate,
        });
      }

      // Rule B: Due date alert for money lent to someone
      if (daysUntilDue !== undefined && daysUntilDue <= 3) {
        if (daysUntilDue < 0) {
          alerts.push({
            id: `${debt.id}_lent_overdue`,
            debt,
            type: 'lent_due',
            severity: 'warning',
            title: `⚠️ Overdue Collection: ${debt.title}`,
            message: `${personLabel} was supposed to return ৳${remainingAmount.toLocaleString()} for "${debt.title}" ${Math.abs(daysUntilDue)} day(s) ago.`,
            daysActive,
            daysUntilDue,
            dueDateStr: debt.dueDate,
          });
        } else if (daysUntilDue === 0) {
          alerts.push({
            id: `${debt.id}_lent_due_today`,
            debt,
            type: 'lent_due',
            severity: 'info',
            title: `📅 Collection Due Today`,
            message: `${personLabel} is scheduled to return ৳${remainingAmount.toLocaleString()} for "${debt.title}" today.`,
            daysActive,
            daysUntilDue: 0,
            dueDateStr: debt.dueDate,
          });
        }
      }
    }
  }

  // Sort alerts by urgency (urgent first, then warning, then info)
  const severityScore = { urgent: 3, warning: 2, info: 1 };
  return alerts.sort((a, b) => severityScore[b.severity] - severityScore[a.severity]);
}
