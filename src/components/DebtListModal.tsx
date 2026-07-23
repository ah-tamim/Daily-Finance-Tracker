import React, { useState } from 'react';
import { DebtItem, Wallet } from '../types/finance';
import { 
  CreditCard, 
  X, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  User, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet as WalletIcon,
  Clock,
  Sparkles
} from 'lucide-react';

interface DebtListModalProps {
  isOpen: boolean;
  onClose: () => void;
  debts: DebtItem[];
  wallets: Wallet[];
  onOpenAddModal: () => void;
  onPayInstallment: (debt: DebtItem, amount: number, walletId?: string) => Promise<void>;
  onDeleteDebt: (debtId: string) => Promise<void>;
}

export const DebtListModal: React.FC<DebtListModalProps> = ({
  isOpen,
  onClose,
  debts,
  wallets,
  onOpenAddModal,
  onPayInstallment,
  onDeleteDebt,
}) => {
  const [filter, setFilter] = useState<'all' | 'borrowed' | 'lent' | 'active' | 'paid'>('all');
  const [payingDebt, setPayingDebt] = useState<DebtItem | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>(wallets[0]?.id || '');
  const [isSubmittingPay, setIsSubmittingPay] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  // Totals calculation
  const totalBorrowedActive = debts
    .filter((d) => d.type === 'borrowed' && d.status === 'active')
    .reduce((acc, d) => acc + (d.totalAmount - d.paidAmount), 0);

  const totalLentActive = debts
    .filter((d) => d.type === 'lent' && d.status === 'active')
    .reduce((acc, d) => acc + (d.totalAmount - d.paidAmount), 0);

  const totalMonthlyEmiCommitment = debts
    .filter((d) => d.status === 'active' && d.isEmi && d.emiMonthlyAmount)
    .reduce((acc, d) => acc + (d.emiMonthlyAmount || 0), 0);

  // Filtered list
  const filteredDebts = debts.filter((d) => {
    if (filter === 'borrowed') return d.type === 'borrowed';
    if (filter === 'lent') return d.type === 'lent';
    if (filter === 'active') return d.status === 'active';
    if (filter === 'paid') return d.status === 'paid';
    return true;
  });

  const handleOpenPayModal = (debt: DebtItem) => {
    setPayingDebt(debt);
    const defaultPay = debt.isEmi && debt.emiMonthlyAmount 
      ? Math.min(debt.totalAmount - debt.paidAmount, debt.emiMonthlyAmount)
      : debt.totalAmount - debt.paidAmount;
    setPaymentAmount(defaultPay.toString());
    if (wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id);
    }
    setMsg(null);
  };

  const handleConfirmPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingDebt) return;
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      setMsg({ text: 'Please enter a valid payment amount.', type: 'error' });
      return;
    }

    try {
      setIsSubmittingPay(true);
      await onPayInstallment(payingDebt, amt, selectedWalletId || undefined);
      setIsSubmittingPay(false);
      setPayingDebt(null);
      setMsg({ text: 'Payment recorded successfully!', type: 'success' });
    } catch (err: any) {
      setIsSubmittingPay(false);
      setMsg({ text: err?.message || 'Failed to record payment.', type: 'error' });
    }
  };

  const handleDelete = async (debtId: string) => {
    if (window.confirm('Are you sure you want to delete this debt record?')) {
      try {
        await onDeleteDebt(debtId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6">
      <div className="min-h-full flex items-center justify-center">
        <div className="theme-modal border rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/20">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                <span>Debts &amp; EMI Tracker</span>
              </h2>
              <p className="text-xs theme-text-muted">
                Track borrowed loans, EMI monthly installments, and money lent
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-900/20"
            >
              <Plus className="w-4 h-4" />
              <span>New Debt / EMI</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 theme-subtle-btn rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Overview Banner Cards */}
        <div className="p-6 pb-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="theme-card border rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
              <span>Total Owed (Debt)</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div className="text-xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
              ৳{totalBorrowedActive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] theme-text-muted">Net active liabilities</p>
          </div>

          <div className="theme-card border rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
              <span>Total Owed to Me</span>
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div className="text-xl font-extrabold font-mono text-teal-600 dark:text-teal-400">
              ৳{totalLentActive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] theme-text-muted">Money lent to others</p>
          </div>

          <div className="theme-card border rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>Monthly EMI Commitments</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
              ৳{totalMonthlyEmiCommitment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] theme-text-muted">Total monthly installments</p>
          </div>
        </div>

        {/* Notifications */}
        {msg && (
          <div className="px-6 pt-2">
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              msg.type === 'success' 
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{msg.text}</span>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="px-6 pt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl border transition ${
              filter === 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'theme-subtle-btn'
            }`}
          >
            All ({debts.length})
          </button>
          <button
            onClick={() => setFilter('borrowed')}
            className={`px-3 py-1.5 rounded-xl border transition ${
              filter === 'borrowed' ? 'bg-rose-600 text-white border-rose-600' : 'theme-subtle-btn'
            }`}
          >
            I Owe ({debts.filter(d => d.type === 'borrowed').length})
          </button>
          <button
            onClick={() => setFilter('lent')}
            className={`px-3 py-1.5 rounded-xl border transition ${
              filter === 'lent' ? 'bg-teal-600 text-white border-teal-600' : 'theme-subtle-btn'
            }`}
          >
            Owed to Me ({debts.filter(d => d.type === 'lent').length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-xl border transition ${
              filter === 'active' ? 'bg-amber-600 text-white border-amber-600' : 'theme-subtle-btn'
            }`}
          >
            Active ({debts.filter(d => d.status === 'active').length})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-3 py-1.5 rounded-xl border transition ${
              filter === 'paid' ? 'bg-emerald-600 text-white border-emerald-600' : 'theme-subtle-btn'
            }`}
          >
            Settled ({debts.filter(d => d.status === 'paid').length})
          </button>
        </div>

        {/* Debt List Container */}
        <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto">
          {filteredDebts.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-3xl theme-card space-y-3">
              <CreditCard className="w-10 h-10 mx-auto theme-text-muted opacity-40" />
              <p className="text-sm font-bold theme-text">No Debt or EMI records found</p>
              <p className="text-xs theme-text-muted max-w-sm mx-auto">
                Track laptop EMIs, loans from banks or friends, and installments here easily.
              </p>
              <button
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-500 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Debt/EMI</span>
              </button>
            </div>
          ) : (
            filteredDebts.map((debt) => {
              const remaining = Math.max(0, debt.totalAmount - debt.paidAmount);
              const progressPct = Math.min(100, Math.round((debt.paidAmount / debt.totalAmount) * 100));
              const isBorrowed = debt.type === 'borrowed';
              const isPaid = debt.status === 'paid' || remaining <= 0;

              return (
                <div
                  key={debt.id}
                  className="theme-card border rounded-2xl p-4 space-y-3 relative overflow-hidden transition hover:border-indigo-500/40"
                >
                  {/* Top line: title, type badge, status */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg text-xs font-bold ${
                        isBorrowed 
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' 
                          : 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20'
                      }`}>
                        {isBorrowed ? 'I Owe' : 'Owed to Me'}
                      </span>
                      <h3 className="font-extrabold text-sm theme-text">{debt.title}</h3>
                      {debt.isEmi && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          EMI Plan
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        isPaid
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {isPaid ? 'Fully Paid / Settled' : 'Active'}
                      </span>
                      <button
                        onClick={() => handleDelete(debt.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition rounded-lg"
                        title="Delete Debt"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Sub details: lender, due date, notes */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs theme-text-muted">
                    {debt.lenderBorrower && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <span>{debt.lenderBorrower}</span>
                      </span>
                    )}
                    {debt.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Due: {debt.dueDate}</span>
                      </span>
                    )}
                    {debt.notes && (
                      <span className="truncate max-w-xs">
                        Note: {debt.notes}
                      </span>
                    )}
                  </div>

                  {/* Amounts & EMI Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t text-xs">
                    <div>
                      <span className="theme-text-muted block text-[10px]">Total Debt</span>
                      <span className="font-mono font-bold text-sm">৳{debt.totalAmount.toLocaleString()}</span>
                    </div>

                    <div>
                      <span className="theme-text-muted block text-[10px]">Paid So Far</span>
                      <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                        ৳{debt.paidAmount.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="theme-text-muted block text-[10px]">Remaining</span>
                      <span className={`font-mono font-bold text-sm ${
                        remaining > 0 
                          ? isBorrowed ? 'text-rose-600 dark:text-rose-400' : 'text-teal-600 dark:text-teal-400'
                          : 'text-slate-400'
                      }`}>
                        ৳{remaining.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="theme-text-muted block text-[10px]">
                        {debt.isEmi ? 'Monthly EMI' : 'Repayment Status'}
                      </span>
                      <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                        {debt.isEmi && debt.emiMonthlyAmount 
                          ? `৳${debt.emiMonthlyAmount.toLocaleString()}/mo`
                          : `${progressPct}% Paid`}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] theme-text-muted">
                      <span>Repayment Progress</span>
                      <span>
                        {debt.isEmi && debt.emiTotalMonths
                          ? `${debt.emiPaidMonths || 0} / ${debt.emiTotalMonths} Months (${progressPct}%)`
                          : `${progressPct}%`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progressPct >= 100 
                            ? 'bg-emerald-500' 
                            : isBorrowed ? 'bg-indigo-600' : 'bg-teal-600'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Pay Installment / Repay Action */}
                  {!isPaid && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleOpenPayModal(debt)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-900/20"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{debt.isEmi ? 'Pay Monthly EMI' : 'Record Repayment'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Quick Payment Modal overlay */}
        {payingDebt && (
          <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-3 sm:p-6">
            <div className="min-h-full flex items-center justify-center">
              <div className="theme-modal border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95 my-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  <span>{payingDebt.isEmi ? 'Pay Monthly EMI' : 'Record Repayment'}</span>
                </h3>
                <button
                  onClick={() => setPayingDebt(null)}
                  className="p-1.5 theme-subtle-btn rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleConfirmPay} className="space-y-4">
                <div>
                  <span className="text-xs theme-text-muted block">Debt Item</span>
                  <p className="font-bold text-sm theme-text">{payingDebt.title}</p>
                  <p className="text-xs text-rose-500 font-mono mt-0.5">
                    Remaining Balance: ৳{(payingDebt.totalAmount - payingDebt.paidAmount).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Payment Amount (৳)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                    className="w-full theme-input border focus:border-indigo-500 rounded-xl p-3 text-sm font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                    <WalletIcon className="w-3.5 h-3.5 theme-text-muted" />
                    <span>Deduct / Add to Wallet (Optional)</span>
                  </label>
                  <select
                    value={selectedWalletId}
                    onChange={(e) => setSelectedWalletId(e.target.value)}
                    className="w-full theme-input border rounded-xl p-3 text-sm focus:outline-none"
                  >
                    <option value="">Do not log wallet transaction</option>
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} (Balance: ৳{w.initialBalance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] theme-text-muted mt-1">
                    Selecting a wallet will automatically create a transaction log for this repayment!
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPayingDebt(null)}
                    className="w-1/3 py-2.5 theme-subtle-btn rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPay}
                    className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-900/20"
                  >
                    {isSubmittingPay ? 'Processing...' : 'Confirm Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  </div>
);
};
