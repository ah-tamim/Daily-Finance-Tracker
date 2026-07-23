import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { 
  subscribeToAuth, 
  loginAsDemo 
} from './lib/firebase';
import { 
  Wallet, 
  Transaction, 
  WalletStats,
  DebtItem,
  BudgetItem
} from './types/finance';
import { 
  subscribeWallets, 
  subscribeTransactions, 
  subscribeDebts,
  subscribeBudgets,
  addCustomWallet, 
  updateWalletInitialBalance, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  clearTransactionsOlderThanSixMonths, 
  computeWalletStats,
  getInitialDefaultWallets,
  getInitialDefaultTransactions,
  addDebt,
  updateDebt,
  deleteDebt,
  recordDebtPayment,
  addBudget,
  updateBudget,
  deleteBudget
} from './services/financeService';

import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { WalletList } from './components/WalletList';
import { WalletDetailModal } from './components/WalletDetailModal';
import { TransactionModal } from './components/TransactionModal';
import { TransactionHistory } from './components/TransactionHistory';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { AddWalletModal } from './components/AddWalletModal';
import { ExportModal } from './components/ExportModal';
import { CleanupModal } from './components/CleanupModal';
import { ThemeModal } from './components/ThemeModal';
import { AddDebtModal } from './components/AddDebtModal';
import { DebtListModal } from './components/DebtListModal';
import { AddBudgetModal } from './components/AddBudgetModal';
import { BudgetListModal } from './components/BudgetListModal';
import { ProfileModal } from './components/ProfileModal';
import { getStoredTheme, applyTheme, ThemeId } from './utils/theme';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Theme state
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => getStoredTheme());
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);
  
  // Real-time current month calculation (e.g. July 2026 -> 2026-07)
  const [currentMonthKey, setCurrentMonthKey] = useState<string>(() => {
    return new Date().toISOString().slice(0, 7);
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);

  // Periodically re-check current month so it automatically updates when July ends and August starts
  useEffect(() => {
    const updateCurrentMonth = () => {
      const nowKey = new Date().toISOString().slice(0, 7);
      setCurrentMonthKey((prevKey) => {
        if (prevKey !== nowKey) {
          setSelectedMonth(nowKey); // Automatically advance selected month when month changes
          return nowKey;
        }
        return prevKey;
      });
    };

    const interval = setInterval(updateCurrentMonth, 60000); // Check every minute
    window.addEventListener('focus', updateCurrentMonth);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', updateCurrentMonth);
    };
  }, []);

  // Modals state
  const [selectedDetailWallet, setSelectedDetailWallet] = useState<Wallet | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [quickEntryWalletId, setQuickEntryWalletId] = useState<string | undefined>(undefined);
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isCleanupModalOpen, setIsCleanupModalOpen] = useState<boolean>(false);

  // Debts & EMI State
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [isDebtListModalOpen, setIsDebtListModalOpen] = useState<boolean>(false);
  const [isAddDebtModalOpen, setIsAddDebtModalOpen] = useState<boolean>(false);

  // Budget State
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [isBudgetListModalOpen, setIsBudgetListModalOpen] = useState<boolean>(false);
  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] = useState<boolean>(false);

  // 1. Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // Fallback to cached guest data or default sample data
        const cachedWallets = localStorage.getItem('daily_finance_wallets_v3_guest');
        const cachedTx = localStorage.getItem('daily_finance_transactions_v3_guest');
        let initialW = getInitialDefaultWallets();
        if (cachedWallets) {
          try {
            initialW = JSON.parse(cachedWallets);
          } catch {
            /* ignore JSON parse error */
          }
        }
        setWallets(initialW);

        if (cachedTx) {
          try {
            setTransactions(JSON.parse(cachedTx));
          } catch {
            setTransactions(getInitialDefaultTransactions(initialW));
          }
        } else {
          setTransactions(getInitialDefaultTransactions(initialW));
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Save guest changes to localStorage when not signed in
  useEffect(() => {
    if (!user && wallets.length > 0) {
      localStorage.setItem('daily_finance_wallets_v3_guest', JSON.stringify(wallets));
    }
  }, [wallets, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('daily_finance_transactions_v3_guest', JSON.stringify(transactions));
    }
  }, [transactions, user]);

  useEffect(() => {
    if (!user) {
      const cached = localStorage.getItem('daily_finance_debts_v3_guest');
      if (cached) {
        try { setDebts(JSON.parse(cached)); } catch {}
      }
      const cachedBudgets = localStorage.getItem('daily_finance_budgets_v3_guest');
      if (cachedBudgets) {
        try { setBudgets(JSON.parse(cachedBudgets)); } catch {}
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user && debts.length > 0) {
      localStorage.setItem('daily_finance_debts_v3_guest', JSON.stringify(debts));
    }
  }, [debts, user]);

  useEffect(() => {
    if (!user && budgets.length > 0) {
      localStorage.setItem('daily_finance_budgets_v3_guest', JSON.stringify(budgets));
    }
  }, [budgets, user]);

  // 2. Subscribe to Firestore Wallets, Transactions, Debts and Budgets for logged-in user
  useEffect(() => {
    if (!user) return;

    const unsubsWallets = subscribeWallets(
      user.uid,
      (updatedWallets) => {
        if (updatedWallets.length === 0) {
          const defaults = getInitialDefaultWallets();
          setWallets(defaults);
        } else {
          setWallets(updatedWallets);
        }
      },
      () => {
        const defaults = getInitialDefaultWallets();
        setWallets(defaults);
      }
    );

    const unsubsTransactions = subscribeTransactions(
      user.uid,
      (updatedTransactions) => {
        setTransactions(updatedTransactions);
      },
      () => {
        setTransactions([]);
      }
    );

    const unsubsDebts = subscribeDebts(
      user.uid,
      (updatedDebts) => {
        setDebts(updatedDebts);
      },
      () => {
        setDebts([]);
      }
    );

    const unsubsBudgets = subscribeBudgets(
      user.uid,
      (updatedBudgets) => {
        setBudgets(updatedBudgets);
      },
      () => {
        setBudgets([]);
      }
    );

    return () => {
      unsubsWallets();
      unsubsTransactions();
      unsubsDebts();
      unsubsBudgets();
    };
  }, [user]);

  // Compute available month options from transactions
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    monthSet.add(currentMonthKey);
    transactions.forEach((tx) => {
      if (tx.monthKey) monthSet.add(tx.monthKey);
    });
    const sorted = Array.from(monthSet).sort().reverse();
    return ['ALL', ...sorted];
  }, [transactions, currentMonthKey]);

  // Compute Wallet Statistics & Balances
  const walletStats: WalletStats[] = useMemo(() => {
    return computeWalletStats(wallets, transactions);
  }, [wallets, transactions]);

  // Find stats for selectedDetailWallet
  const selectedWalletStats = useMemo(() => {
    if (!selectedDetailWallet) return undefined;
    return walletStats.find((s) => s.wallet.id === selectedDetailWallet.id);
  }, [selectedDetailWallet, walletStats]);

  // Filter transactions for selected month
  const monthTransactions = useMemo(() => {
    if (selectedMonth === 'ALL') return transactions;
    return transactions.filter((tx) => tx.monthKey === selectedMonth);
  }, [transactions, selectedMonth]);

  // Monthly totals
  const totalIncomeMonth = useMemo(() => {
    return monthTransactions
      .filter((tx) => tx.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [monthTransactions]);

  const totalExpenseMonth = useMemo(() => {
    return monthTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [monthTransactions]);

  // Month label helper
  const selectedMonthLabel = useMemo(() => {
    if (selectedMonth === 'ALL') return 'All Time';
    const [year, month] = selectedMonth.split('-');
    if (!year || !month) return selectedMonth;
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [selectedMonth]);

  // Handlers
  const handleSaveTransaction = async (
    txData: Omit<Transaction, 'id' | 'userId' | 'monthKey' | 'createdAt'>
  ) => {
    if (editingTransaction) {
      if (user?.uid) {
        await updateTransaction(user.uid, editingTransaction.id, txData);
      } else {
        setTransactions((prev) =>
          prev.map((t) => (t.id === editingTransaction.id ? { ...t, ...txData } : t))
        );
      }
    } else {
      if (user?.uid) {
        await addTransaction(user.uid, txData);
      } else {
        const newTx: Transaction = {
          id: `tx_${Date.now()}`,
          userId: user?.uid || 'demo',
          monthKey: txData.date.slice(0, 7),
          createdAt: Date.now(),
          ...txData,
        };
        setTransactions((prev) => [newTx, ...prev]);
      }
    }
    setEditingTransaction(null);
    setQuickEntryWalletId(undefined);
  };

  const handleDeleteTransaction = async (txId: string) => {
    if (user?.uid) {
      await deleteTransaction(user.uid, txId);
    } else {
      setTransactions((prev) => prev.filter((t) => t.id !== txId));
    }
  };

  const handleAddCustomWallet = async (walletData: Omit<Wallet, 'id'>) => {
    if (user?.uid) {
      await addCustomWallet(user.uid, walletData);
    } else {
      const newW: Wallet = {
        id: `wallet_custom_${Date.now()}`,
        ...walletData,
      };
      setWallets((prev) => [...prev, newW]);
    }
  };

  const handleUpdateInitialBalance = async (walletId: string, newBalance: number) => {
    if (user?.uid) {
      await updateWalletInitialBalance(user.uid, walletId, newBalance);
    } else {
      setWallets((prev) =>
        prev.map((w) => (w.id === walletId ? { ...w, initialBalance: newBalance } : w))
      );
    }
  };

  const handleConfirmCleanup = async (): Promise<number> => {
    if (user?.uid) {
      return await clearTransactionsOlderThanSixMonths(user.uid);
    } else {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - 6);
      const cutoffKey = cutoff.toISOString().slice(0, 7);

      const beforeLen = transactions.length;
      const filtered = transactions.filter((tx) => tx.monthKey >= cutoffKey);
      setTransactions(filtered);
      return beforeLen - filtered.length;
    }
  };

  const handleSaveDebt = async (debtData: Omit<DebtItem, 'id' | 'userId' | 'createdAt'>) => {
    if (user?.uid) {
      await addDebt(user.uid, debtData);
    } else {
      const newDebt: DebtItem = {
        id: `debt_${Date.now()}`,
        userId: 'demo',
        createdAt: Date.now(),
        ...debtData,
      };
      setDebts((prev) => [newDebt, ...prev]);
    }
  };

  const handlePayDebtInstallment = async (debt: DebtItem, amount: number, walletId?: string) => {
    if (user?.uid) {
      await recordDebtPayment(user.uid, debt, amount, walletId);
    } else {
      const newPaidAmount = Math.min(debt.totalAmount, debt.paidAmount + amount);
      const newPaidMonths = debt.isEmi ? (debt.emiPaidMonths || 0) + 1 : debt.emiPaidMonths;
      const isNowPaid = newPaidAmount >= debt.totalAmount;

      setDebts((prev) =>
        prev.map((d) =>
          d.id === debt.id
            ? {
                ...d,
                paidAmount: newPaidAmount,
                emiPaidMonths: newPaidMonths,
                status: isNowPaid ? 'paid' : 'active',
              }
            : d
        )
      );

      if (walletId) {
        const isBorrowed = debt.type === 'borrowed';
        const txType = isBorrowed ? 'expense' : 'income';
        const category = isBorrowed ? 'Loan Repayment' : 'Debt Recovered';
        const desc = debt.isEmi
          ? `EMI Payment #${newPaidMonths || 1} for ${debt.title}`
          : `Repayment for ${debt.title}`;

        const newTx: Transaction = {
          id: `tx_${Date.now()}`,
          userId: 'demo',
          date: new Date().toISOString().slice(0, 10),
          monthKey: new Date().toISOString().slice(0, 7),
          type: txType,
          walletId,
          category,
          description: desc,
          amount,
          createdAt: Date.now(),
        };
        setTransactions((prev) => [newTx, ...prev]);
      }
    }
  };

  const handleDeleteDebt = async (debtId: string) => {
    if (user?.uid) {
      await deleteDebt(user.uid, debtId);
    } else {
      setDebts((prev) => prev.filter((d) => d.id !== debtId));
    }
  };

  const handleSaveBudget = async (budgetData: Omit<BudgetItem, 'id' | 'userId' | 'createdAt'>) => {
    if (user?.uid) {
      await addBudget(user.uid, budgetData);
    } else {
      const newB: BudgetItem = {
        id: `budget_${Date.now()}`,
        userId: 'demo',
        createdAt: Date.now(),
        ...budgetData,
      };
      setBudgets((prev) => [newB, ...prev]);
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (user?.uid) {
      await deleteBudget(user.uid, budgetId);
    } else {
      setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
    }
  };

  return (
    <div className="min-h-screen theme-app font-sans antialiased selection:bg-emerald-500 selection:text-white transition-colors">
      
      {/* Top Header */}
      <Header
        user={user}
        selectedMonth={selectedMonth}
        availableMonths={availableMonths}
        onMonthChange={setSelectedMonth}
        onOpenTransactionModal={() => {
          setEditingTransaction(null);
          setQuickEntryWalletId(undefined);
          setIsTransactionModalOpen(true);
        }}
        onOpenWalletModal={() => setIsAddWalletModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenCleanupModal={() => setIsCleanupModalOpen(true)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenDebtModal={() => setIsDebtListModalOpen(true)}
        onOpenBudgetModal={() => setIsBudgetListModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        activeDebtCount={debts.filter((d) => d.status === 'active').length}
      />

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-3 sm:px-5 py-4 space-y-4">
        
        {/* Top Summary Banner Cards */}
        <SummaryCards
          walletStats={walletStats}
          totalIncomeMonth={totalIncomeMonth}
          totalExpenseMonth={totalExpenseMonth}
          selectedMonthLabel={selectedMonthLabel}
          onOpenBudgetModal={() => setIsBudgetListModalOpen(true)}
          onOpenDebtModal={() => setIsDebtListModalOpen(true)}
        />

        {/* Wallets Grid with Balance Breakdown */}
        <WalletList
          walletStats={walletStats}
          onSelectWallet={(w) => setSelectedDetailWallet(w)}
          onOpenAddWalletModal={() => setIsAddWalletModalOpen(true)}
        />

        {/* Recharts Analytics Breakdown */}
        <AnalyticsCharts
          transactions={monthTransactions}
          walletStats={walletStats}
          selectedMonthLabel={selectedMonthLabel}
        />

        {/* Transaction History & Filters */}
        <TransactionHistory
          transactions={monthTransactions}
          wallets={wallets}
          selectedMonthLabel={selectedMonthLabel}
          onEditTransaction={(tx) => {
            setEditingTransaction(tx);
            setIsTransactionModalOpen(true);
          }}
          onDeleteTransaction={handleDeleteTransaction}
        />

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 theme-header py-3.5 text-center text-[12px] theme-text-muted transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Daily Finance Tracker — Multi-Wallet Offline &amp; Cloud Sync</span>
          <span className="theme-text-muted">
            Created &amp; Developed by <strong className="font-bold text-emerald-600 dark:text-emerald-400">Ahsan Habib Tamim</strong>
          </span>
        </div>
      </footer>

      {/* Modals */}
      <WalletDetailModal
        wallet={selectedDetailWallet}
        walletStats={selectedWalletStats}
        transactions={transactions}
        allWallets={wallets}
        onClose={() => setSelectedDetailWallet(null)}
        onUpdateInitialBalance={handleUpdateInitialBalance}
        onOpenQuickEntryForWallet={(wId) => {
          setQuickEntryWalletId(wId);
          setEditingTransaction(null);
          setIsTransactionModalOpen(true);
        }}
        onEditTransaction={(tx) => {
          setEditingTransaction(tx);
          setIsTransactionModalOpen(true);
        }}
        onDeleteTransaction={handleDeleteTransaction}
      />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        editingTransaction={editingTransaction}
        defaultWalletId={quickEntryWalletId}
        wallets={wallets}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
          setQuickEntryWalletId(undefined);
        }}
        onSave={handleSaveTransaction}
      />

      <AddWalletModal
        isOpen={isAddWalletModalOpen}
        onClose={() => setIsAddWalletModalOpen(false)}
        onAddWallet={handleAddCustomWallet}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        userEmail={user?.email || undefined}
        allTransactions={transactions}
        walletStats={walletStats}
        availableMonths={availableMonths}
        onClose={() => setIsExportModalOpen(false)}
      />

      <CleanupModal
        isOpen={isCleanupModalOpen}
        transactions={transactions}
        onClose={() => setIsCleanupModalOpen(false)}
        onConfirmCleanup={handleConfirmCleanup}
      />

      <ThemeModal
        isOpen={isThemeModalOpen}
        currentTheme={currentTheme}
        onSelectTheme={(themeId) => {
          setCurrentTheme(themeId);
          applyTheme(themeId);
        }}
        onClose={() => setIsThemeModalOpen(false)}
      />

      <DebtListModal
        isOpen={isDebtListModalOpen}
        onClose={() => setIsDebtListModalOpen(false)}
        debts={debts}
        wallets={wallets}
        onOpenAddModal={() => setIsAddDebtModalOpen(true)}
        onPayInstallment={handlePayDebtInstallment}
        onDeleteDebt={handleDeleteDebt}
      />

      <AddDebtModal
        isOpen={isAddDebtModalOpen}
        onClose={() => setIsAddDebtModalOpen(false)}
        onSave={handleSaveDebt}
      />

      <BudgetListModal
        isOpen={isBudgetListModalOpen}
        onClose={() => setIsBudgetListModalOpen(false)}
        budgets={budgets}
        transactions={transactions}
        selectedMonth={selectedMonth === 'ALL' ? currentMonthKey : selectedMonth}
        onOpenAddBudgetModal={() => setIsAddBudgetModalOpen(true)}
        onDeleteBudget={handleDeleteBudget}
      />

      <AddBudgetModal
        isOpen={isAddBudgetModalOpen}
        onClose={() => setIsAddBudgetModalOpen(false)}
        onSave={handleSaveBudget}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        walletsCount={wallets.length}
        transactionsCount={transactions.length}
        activeBudgetsCount={budgets.length}
        activeDebtsCount={debts.filter((d) => d.status === 'active').length}
        totalBalance={walletStats.reduce((acc, curr) => acc + curr.currentBalance, 0)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        currentTheme={currentTheme}
      />

    </div>
  );
}
