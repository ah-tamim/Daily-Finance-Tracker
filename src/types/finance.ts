export type TransactionType = 'income' | 'expense' | 'transfer';

export interface BudgetItem {
  id: string;
  userId: string;
  category: string; // 'All' or specific category
  period: 'monthly' | 'weekly';
  limitAmount: number;
  createdAt: number;
}

export interface DebtItem {
  id: string;
  userId: string;
  title: string;
  type: 'borrowed' | 'lent'; // 'borrowed' = Debt owed to someone; 'lent' = Money lent to someone
  totalAmount: number;
  paidAmount: number;
  isEmi: boolean;
  emiMonthlyAmount?: number;
  emiTotalMonths?: number;
  emiPaidMonths?: number;
  dueDate?: string; // e.g., "10th of every month" or YYYY-MM-DD
  lenderBorrower?: string;
  notes?: string;
  status: 'active' | 'paid';
  walletId?: string; // Associated wallet ID
  createdAt: number;
}

export interface CustomCategories {
  income: string[];
  expense: string[];
}

export interface Wallet {
  id: string;
  name: string;
  type: 'cash' | 'mobile_banking' | 'bank' | 'custom';
  initialBalance: number;
  isDefault?: boolean;
  color?: string;
  createdAt?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  monthKey: string; // YYYY-MM
  type: TransactionType;
  walletId: string; // Source wallet
  targetWalletId?: string; // For transfers
  category: string;
  description: string;
  amount: number;
  createdAt: number;
}

export interface WalletStats {
  wallet: Wallet;
  initialBalance: number;
  totalIncome: number;
  totalExpense: number;
  transfersIn: number;
  transfersOut: number;
  currentBalance: number;
}

export interface MonthSummary {
  monthKey: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  transactionCount: number;
}

export const DEFAULT_WALLETS: Omit<Wallet, 'id'>[] = [
  { name: 'Savings', type: 'cash', initialBalance: 0, isDefault: true, color: '#10B981' },
  { name: 'Current Cash', type: 'cash', initialBalance: 0, isDefault: true, color: '#059669' },
  { name: 'Bkash', type: 'mobile_banking', initialBalance: 0, isDefault: true, color: '#E11D48' },
];

export const DEFAULT_INCOME_CATEGORIES = [
  'Monthly',
  'Salary',
  'Reward',
  'Apu Gift',
  'Bonus',
  'Refund',
  'Investment',
  'Other Income'
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Stationary',
  'Monthly',
  'Print & Copy',
  'Lunch & Assignment',
  'Loan Repayment',
  'Personal',
  'Bills',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Other Expense'
];
