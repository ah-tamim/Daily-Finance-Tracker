import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Wallet, 
  Transaction, 
  DebtItem, 
  BudgetItem, 
  DEFAULT_WALLETS, 
  DEFAULT_INCOME_CATEGORIES, 
  DEFAULT_EXPENSE_CATEGORIES, 
  CustomCategories, 
  WalletStats 
} from '../types/finance';

const LOCAL_STORAGE_WALLETS_KEY = 'daily_finance_wallets_v3';
const LOCAL_STORAGE_TRANSACTIONS_KEY = 'daily_finance_transactions_v3';
const LOCAL_STORAGE_DEBTS_KEY = 'daily_finance_debts_v3';
const LOCAL_STORAGE_BUDGETS_KEY = 'daily_finance_budgets_v3';
const LOCAL_STORAGE_CATEGORIES_KEY = 'daily_finance_categories_v3';

// Helper to strip undefined properties before sending to Firestore (Firestore throws on undefined)
const removeUndefinedFields = <T extends Record<string, any>>(obj: T): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
};

// Get month key helper YYYY-MM
export const getMonthKey = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString().slice(0, 7);
  return dateStr.slice(0, 7);
};

// Calculate 6 months ago month key
export const getSixMonthsAgoMonthKey = (): string => {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString().slice(0, 7);
};

// Seed initial default data for new users or offline fallback
export const getInitialDefaultWallets = (): Wallet[] => {
  return DEFAULT_WALLETS.map((w, index) => ({
    id: `wallet_default_${index + 1}`,
    ...w,
    createdAt: new Date().toISOString(),
  }));
};

export const getInitialDefaultTransactions = (_wallets: Wallet[]): Transaction[] => {
  return [];
};

// Wallet CRUD
export const subscribeWallets = (
  userId: string,
  onUpdate: (wallets: Wallet[]) => void,
  onError?: (err: any) => void
) => {
  if (!userId) return () => {};

  const userWalletsRef = collection(db, 'users', userId, 'wallets');

  return onSnapshot(
    userWalletsRef,
    (snapshot) => {
      if (snapshot.empty) {
        // Seed default wallets to Firestore
        const defaults = getInitialDefaultWallets();
        defaults.forEach((w) => {
          setDoc(doc(db, 'users', userId, 'wallets', w.id), w).catch(console.error);
        });
        onUpdate(defaults);
      } else {
        const walletsList: Wallet[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Wallet, 'id'>),
        }));
        // Cache to localStorage
        localStorage.setItem(`${LOCAL_STORAGE_WALLETS_KEY}_${userId}`, JSON.stringify(walletsList));
        onUpdate(walletsList);
      }
    },
    (error) => {
      console.warn('Firestore wallets listener offline or error, reading local cache:', error);
      const cached = localStorage.getItem(`${LOCAL_STORAGE_WALLETS_KEY}_${userId}`);
      if (cached) {
        try {
          onUpdate(JSON.parse(cached));
        } catch {
          onUpdate(getInitialDefaultWallets());
        }
      } else {
        onUpdate(getInitialDefaultWallets());
      }
      if (onError) onError(error);
    }
  );
};

export const addCustomWallet = async (userId: string, walletData: Omit<Wallet, 'id'>) => {
  if (!userId) throw new Error('User not authenticated');
  const userWalletsRef = collection(db, 'users', userId, 'wallets');
  const docRef = await addDoc(userWalletsRef, removeUndefinedFields({
    ...walletData,
    createdAt: new Date().toISOString(),
  }));
  return docRef.id;
};

export const updateWalletInitialBalance = async (userId: string, walletId: string, newInitialBalance: number) => {
  if (!userId) throw new Error('User not authenticated');
  const walletRef = doc(db, 'users', userId, 'wallets', walletId);
  await updateDoc(walletRef, { initialBalance: newInitialBalance });
};

// Transaction CRUD
export const subscribeTransactions = (
  userId: string,
  onUpdate: (transactions: Transaction[]) => void,
  onError?: (err: any) => void
) => {
  if (!userId) return () => {};

  const txRef = collection(db, 'users', userId, 'transactions');
  const q = query(txRef, orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
      } else {
        const txs: Transaction[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Transaction, 'id'>),
        }));
        localStorage.setItem(`${LOCAL_STORAGE_TRANSACTIONS_KEY}_${userId}`, JSON.stringify(txs));
        onUpdate(txs);
      }
    },
    (error) => {
      console.warn('Firestore transactions error/offline, fallback to local storage:', error);
      const cached = localStorage.getItem(`${LOCAL_STORAGE_TRANSACTIONS_KEY}_${userId}`);
      if (cached) {
        try {
          onUpdate(JSON.parse(cached));
        } catch {
          onUpdate([]);
        }
      } else {
        onUpdate([]);
      }
      if (onError) onError(error);
    }
  );
};

export const addTransaction = async (
  userId: string,
  txData: Omit<Transaction, 'id' | 'userId' | 'monthKey' | 'createdAt'>
) => {
  if (!userId) throw new Error('User not authenticated');
  const monthKey = getMonthKey(txData.date);
  const txRef = collection(db, 'users', userId, 'transactions');
  const newTx = removeUndefinedFields({
    ...txData,
    userId,
    monthKey,
    createdAt: Date.now(),
  });
  const docRef = await addDoc(txRef, newTx);
  return docRef.id;
};

export const updateTransaction = async (
  userId: string,
  txId: string,
  txData: Partial<Transaction>
) => {
  if (!userId) throw new Error('User not authenticated');
  const docRef = doc(db, 'users', userId, 'transactions', txId);
  const updates: any = removeUndefinedFields({ ...txData });
  if (txData.date) {
    updates.monthKey = getMonthKey(txData.date);
  }
  await updateDoc(docRef, updates);
};

export const deleteTransaction = async (userId: string, txId: string) => {
  if (!userId) throw new Error('User not authenticated');
  const docRef = doc(db, 'users', userId, 'transactions', txId);
  await deleteDoc(docRef);
};

// Clear transactions older than 6 months
export const clearTransactionsOlderThanSixMonths = async (userId: string): Promise<number> => {
  if (!userId) return 0;
  const cutoffMonthKey = getSixMonthsAgoMonthKey();
  const txRef = collection(db, 'users', userId, 'transactions');
  const q = query(txRef, where('monthKey', '<', cutoffMonthKey));

  const snapshot = await getDocs(q);
  if (snapshot.empty) return 0;

  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();

  return snapshot.size;
};

// Calculate Wallet Statistics and balances
export const computeWalletStats = (wallets: Wallet[], transactions: Transaction[]): WalletStats[] => {
  return wallets.map((w) => {
    let totalIncome = 0;
    let totalExpense = 0;
    let transfersIn = 0;
    let transfersOut = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'income' && tx.walletId === w.id) {
        totalIncome += tx.amount;
      } else if (tx.type === 'expense' && tx.walletId === w.id) {
        totalExpense += tx.amount;
      } else if (tx.type === 'transfer') {
        if (tx.walletId === w.id) {
          transfersOut += tx.amount;
        }
        if (tx.targetWalletId === w.id) {
          transfersIn += tx.amount;
        }
      }
    });

    const currentBalance = w.initialBalance + totalIncome - totalExpense + transfersIn - transfersOut;

    return {
      wallet: w,
      initialBalance: w.initialBalance,
      totalIncome,
      totalExpense,
      transfersIn,
      transfersOut,
      currentBalance,
    };
  });
};

// ================= DEBT & EMI MANAGEMENT ================= //

export const subscribeDebts = (
  userId: string,
  onUpdate: (debts: DebtItem[]) => void,
  onError?: (err: any) => void
) => {
  if (!userId) return () => {};

  const debtRef = collection(db, 'users', userId, 'debts');
  const q = query(debtRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
      } else {
        const debtsList: DebtItem[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<DebtItem, 'id'>),
        }));
        localStorage.setItem(`${LOCAL_STORAGE_DEBTS_KEY}_${userId}`, JSON.stringify(debtsList));
        onUpdate(debtsList);
      }
    },
    (error) => {
      console.warn('Firestore debts error/offline, fallback to local storage:', error);
      const cached = localStorage.getItem(`${LOCAL_STORAGE_DEBTS_KEY}_${userId}`);
      if (cached) {
        try {
          onUpdate(JSON.parse(cached));
        } catch {
          onUpdate([]);
        }
      } else {
        onUpdate([]);
      }
      if (onError) onError(error);
    }
  );
};

export const addDebt = async (
  userId: string,
  debtData: Omit<DebtItem, 'id' | 'userId' | 'createdAt'>,
  recordInitialTxInWallet: boolean = false
) => {
  if (!userId) throw new Error('User not authenticated');
  const debtRef = collection(db, 'users', userId, 'debts');
  const newDebt = removeUndefinedFields({
    ...debtData,
    userId,
    createdAt: Date.now(),
  });
  const docRef = await addDoc(debtRef, newDebt);

  // If user linked a wallet and requested initial money flow transaction
  if (recordInitialTxInWallet && debtData.walletId && debtData.totalAmount > 0) {
    const isBorrowed = debtData.type === 'borrowed';
    const txType = isBorrowed ? 'income' : 'expense';
    const category = isBorrowed ? 'Borrowed Funds' : 'Loan Repayment';
    const desc = isBorrowed 
      ? `Borrowed funds received: ${debtData.title}${debtData.lenderBorrower ? ` from ${debtData.lenderBorrower}` : ''}`
      : `Lent funds provided: ${debtData.title}${debtData.lenderBorrower ? ` to ${debtData.lenderBorrower}` : ''}`;

    await addTransaction(userId, {
      date: new Date().toISOString().slice(0, 10),
      type: txType,
      walletId: debtData.walletId,
      category,
      description: desc,
      amount: debtData.totalAmount,
    });
  }

  return docRef.id;
};

export const updateDebt = async (
  userId: string,
  debtId: string,
  debtData: Partial<DebtItem>
) => {
  if (!userId) throw new Error('User not authenticated');
  const docRef = doc(db, 'users', userId, 'debts', debtId);
  await updateDoc(docRef, removeUndefinedFields(debtData));
};

export const deleteDebt = async (userId: string, debtId: string) => {
  if (!userId) throw new Error('User not authenticated');
  const docRef = doc(db, 'users', userId, 'debts', debtId);
  await deleteDoc(docRef);
};

export const recordDebtPayment = async (
  userId: string,
  debt: DebtItem,
  amount: number,
  walletId?: string
) => {
  if (!userId) throw new Error('User not authenticated');

  const newPaidAmount = Math.min(debt.totalAmount, debt.paidAmount + amount);
  const newPaidMonths = debt.isEmi ? (debt.emiPaidMonths || 0) + 1 : debt.emiPaidMonths;
  const isNowPaid = newPaidAmount >= debt.totalAmount;

  // 1. Update debt doc
  await updateDebt(userId, debt.id, {
    paidAmount: newPaidAmount,
    emiPaidMonths: newPaidMonths,
    status: isNowPaid ? 'paid' : 'active',
  });

  // 2. If wallet provided, log transaction
  if (walletId) {
    const isBorrowed = debt.type === 'borrowed';
    const txType = isBorrowed ? 'expense' : 'income';
    const category = isBorrowed ? 'Loan Repayment' : 'Debt Recovered';
    const desc = debt.isEmi
      ? `EMI Payment #${newPaidMonths || 1} for ${debt.title}`
      : `Repayment for ${debt.title}`;

    await addTransaction(userId, {
      date: new Date().toISOString().slice(0, 10),
      type: txType,
      walletId,
      category,
      description: desc,
      amount,
    });
  }
};

// ================= BUDGET MANAGEMENT ================= //

export const subscribeBudgets = (
  userId: string,
  onUpdate: (budgets: BudgetItem[]) => void,
  onError?: (err: any) => void
) => {
  if (!userId) return () => {};

  const budgetRef = collection(db, 'users', userId, 'budgets');
  const q = query(budgetRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
      } else {
        const list: BudgetItem[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<BudgetItem, 'id'>),
        }));
        localStorage.setItem(`${LOCAL_STORAGE_BUDGETS_KEY}_${userId}`, JSON.stringify(list));
        onUpdate(list);
      }
    },
    (error) => {
      console.warn('Firestore budgets error/offline, fallback to local storage:', error);
      const cached = localStorage.getItem(`${LOCAL_STORAGE_BUDGETS_KEY}_${userId}`);
      if (cached) {
        try {
          onUpdate(JSON.parse(cached));
        } catch {
          onUpdate([]);
        }
      } else {
        onUpdate([]);
      }
      if (onError) onError(error);
    }
  );
};

export const addBudget = async (
  userId: string,
  budgetData: Omit<BudgetItem, 'id' | 'userId' | 'createdAt'>
) => {
  if (!userId) throw new Error('User not authenticated');
  const ref = collection(db, 'users', userId, 'budgets');
  const newBudget = removeUndefinedFields({
    ...budgetData,
    userId,
    createdAt: Date.now(),
  });
  const docRef = await addDoc(ref, newBudget);
  return docRef.id;
};

export const updateBudget = async (
  userId: string,
  budgetId: string,
  data: Partial<BudgetItem>
) => {
  if (!userId) throw new Error('User not authenticated');
  const docRef = doc(db, 'users', userId, 'budgets', budgetId);
  await updateDoc(docRef, removeUndefinedFields(data));
};

export const deleteBudget = async (userId: string, budgetId: string) => {
  if (!userId) throw new Error('User not authenticated');
  const docRef = doc(db, 'users', userId, 'budgets', budgetId);
  await deleteDoc(docRef);
};

// ================= CUSTOM CATEGORY MANAGEMENT ================= //

export const subscribeCustomCategories = (
  userId: string,
  onUpdate: (categories: CustomCategories) => void,
  onError?: (err: any) => void
) => {
  if (!userId) return () => {};

  const categoriesDocRef = doc(db, 'users', userId, 'settings', 'categories');

  return onSnapshot(
    categoriesDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const cats: CustomCategories = {
          income: data.income && Array.isArray(data.income) ? data.income : DEFAULT_INCOME_CATEGORIES,
          expense: data.expense && Array.isArray(data.expense) ? data.expense : DEFAULT_EXPENSE_CATEGORIES,
        };
        localStorage.setItem(`${LOCAL_STORAGE_CATEGORIES_KEY}_${userId}`, JSON.stringify(cats));
        onUpdate(cats);
      } else {
        const initialCats: CustomCategories = {
          income: DEFAULT_INCOME_CATEGORIES,
          expense: DEFAULT_EXPENSE_CATEGORIES,
        };
        setDoc(categoriesDocRef, initialCats).catch(console.error);
        onUpdate(initialCats);
      }
    },
    (error) => {
      console.warn('Firestore categories listener offline/error, fallback to local storage:', error);
      const cached = localStorage.getItem(`${LOCAL_STORAGE_CATEGORIES_KEY}_${userId}`);
      if (cached) {
        try {
          onUpdate(JSON.parse(cached));
        } catch {
          onUpdate({ income: DEFAULT_INCOME_CATEGORIES, expense: DEFAULT_EXPENSE_CATEGORIES });
        }
      } else {
        onUpdate({ income: DEFAULT_INCOME_CATEGORIES, expense: DEFAULT_EXPENSE_CATEGORIES });
      }
      if (onError) onError(error);
    }
  );
};

export const saveCustomCategories = async (
  userId: string,
  categories: CustomCategories
) => {
  if (!userId) throw new Error('User not authenticated');
  const categoriesDocRef = doc(db, 'users', userId, 'settings', 'categories');
  await setDoc(categoriesDocRef, categories);
  localStorage.setItem(`${LOCAL_STORAGE_CATEGORIES_KEY}_${userId}`, JSON.stringify(categories));
};
