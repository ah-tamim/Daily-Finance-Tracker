import React, { useState } from 'react';
import { DebtItem } from '../types/finance';
import { X, CreditCard, Calendar, User, DollarSign, FileText, CheckCircle2 } from 'lucide-react';

interface AddDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (debtData: Omit<DebtItem, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
}

export const AddDebtModal: React.FC<AddDebtModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'borrowed' | 'lent'>('borrowed'); // borrowed = I owe, lent = someone owes me
  const [totalAmount, setTotalAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('0');
  const [isEmi, setIsEmi] = useState(false);
  const [emiTotalMonths, setEmiTotalMonths] = useState('12');
  const [emiMonthlyAmount, setEmiMonthlyAmount] = useState('');
  const [lenderBorrower, setLenderBorrower] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Auto calculate monthly EMI if total amount and months are provided
  const handleTotalAmountChange = (val: string) => {
    setTotalAmount(val);
    const amt = parseFloat(val);
    const months = parseInt(emiTotalMonths, 10);
    if (isEmi && !isNaN(amt) && !isNaN(months) && months > 0) {
      setEmiMonthlyAmount((amt / months).toFixed(2));
    }
  };

  const handleMonthsChange = (val: string) => {
    setEmiTotalMonths(val);
    const amt = parseFloat(totalAmount);
    const months = parseInt(val, 10);
    if (isEmi && !isNaN(amt) && !isNaN(months) && months > 0) {
      setEmiMonthlyAmount((amt / months).toFixed(2));
    }
  };

  const handleEmiToggle = (checked: boolean) => {
    setIsEmi(checked);
    if (checked) {
      const amt = parseFloat(totalAmount);
      const months = parseInt(emiTotalMonths, 10) || 12;
      if (!isNaN(amt) && amt > 0) {
        setEmiMonthlyAmount((amt / months).toFixed(2));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const parsedTotal = parseFloat(totalAmount);
    const parsedPaid = parseFloat(paidAmount) || 0;

    if (!title.trim()) {
      setErrorMsg('Please enter a debt title/description.');
      return;
    }

    if (isNaN(parsedTotal) || parsedTotal <= 0) {
      setErrorMsg('Please enter a valid total amount.');
      return;
    }

    let parsedEmiMonthly = 0;
    let parsedEmiMonths = 0;

    if (isEmi) {
      parsedEmiMonths = parseInt(emiTotalMonths, 10) || 12;
      parsedEmiMonthly = parseFloat(emiMonthlyAmount) || (parsedTotal / parsedEmiMonths);
      if (parsedEmiMonthly <= 0) {
        setErrorMsg('Please enter a valid monthly EMI amount.');
        return;
      }
    }

    try {
      setIsSaving(true);
      await onSave({
        title: title.trim(),
        type,
        totalAmount: parsedTotal,
        paidAmount: parsedPaid,
        isEmi,
        emiMonthlyAmount: isEmi ? parsedEmiMonthly : undefined,
        emiTotalMonths: isEmi ? parsedEmiMonths : undefined,
        emiPaidMonths: isEmi ? Math.floor(parsedPaid / (parsedEmiMonthly || 1)) : undefined,
        dueDate: dueDate.trim() || undefined,
        lenderBorrower: lenderBorrower.trim() || undefined,
        notes: notes.trim() || undefined,
        status: parsedPaid >= parsedTotal ? 'paid' : 'active',
      });
      setIsSaving(false);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to create debt record.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6">
      <div className="min-h-full flex items-center justify-center">
        <div className="theme-modal border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Add Debt or EMI Plan</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 theme-subtle-btn rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}

          {/* Type Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border text-xs font-semibold">
            <button
              type="button"
              onClick={() => setType('borrowed')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                type === 'borrowed'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'theme-text-muted hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>I Owe / Borrowed</span>
            </button>
            <button
              type="button"
              onClick={() => setType('lent')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                type === 'lent'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'theme-text-muted hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>Owed to Me / Lent</span>
            </button>
          </div>

          {/* Debt Title */}
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Debt / EMI Name
            </label>
            <input
              type="text"
              placeholder="e.g. Laptop EMI, Car Loan, Borrowed from Rahim"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full theme-input border focus:border-indigo-500 rounded-xl p-3 text-sm focus:outline-none"
            />
          </div>

          {/* Lender / Person */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 theme-text-muted" />
              <span>Lender / Institution Name (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. City Bank, Daraz, Friend"
              value={lenderBorrower}
              onChange={(e) => setLenderBorrower(e.target.value)}
              className="w-full theme-input border focus:border-indigo-500 rounded-xl p-3 text-sm focus:outline-none"
            />
          </div>

          {/* Amount and Initial Paid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Total Amount (৳)</span>
              </label>
              <input
                type="number"
                step="any"
                placeholder="24000"
                value={totalAmount}
                onChange={(e) => handleTotalAmountChange(e.target.value)}
                required
                className="w-full theme-input border focus:border-indigo-500 rounded-xl p-3 text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5">
                Already Paid (৳)
              </label>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full theme-input border focus:border-indigo-500 rounded-xl p-3 text-sm font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* EMI Toggle Checkbox */}
          <div className="p-3.5 theme-card border rounded-2xl space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${isEmi ? 'text-indigo-600 dark:text-indigo-400' : 'theme-text-muted'}`} />
                <div>
                  <span className="text-xs font-bold block">Is this an EMI / Installment Plan?</span>
                  <span className="text-[10px] theme-text-muted block">Split total debt into monthly fixed payments</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isEmi}
                onChange={(e) => handleEmiToggle(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </label>

            {isEmi && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div>
                  <label className="block text-[11px] font-semibold mb-1 theme-text-muted">
                    Total Months
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={emiTotalMonths}
                    onChange={(e) => handleMonthsChange(e.target.value)}
                    className="w-full theme-input border focus:border-indigo-500 rounded-xl p-2.5 text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1 theme-text-muted">
                    Monthly EMI (৳)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={emiMonthlyAmount}
                    onChange={(e) => setEmiMonthlyAmount(e.target.value)}
                    className="w-full theme-input border focus:border-indigo-500 rounded-xl p-2.5 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 theme-text-muted" />
              <span>Monthly Due Date / Payment Day</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 10th of every month, or 2026-08-15"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full theme-input border focus:border-indigo-500 rounded-xl p-3 text-sm focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 theme-text-muted" />
              <span>Notes / Purpose</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 0% interest offer, 12-month tenure"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full theme-input border focus:border-indigo-500 rounded-xl p-3 text-sm focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 theme-subtle-btn rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="w-2/3 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-900/20"
            >
              {isSaving ? 'Saving...' : 'Save Debt / EMI'}
            </button>
          </div>
        </form>

        </div>
      </div>
    </div>
  );
};
