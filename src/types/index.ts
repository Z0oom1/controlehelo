export interface Profile {
  name: string;
  avatar_url?: string;
  salaryAmount?: number;
  salaryDay?: number; // day of month (1-31)
}

export type TransactionType = 'income' | 'expense' | 'predicted_income';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO date string (YYYY-MM-DD)
  recurrence: 'none' | 'monthly' | 'weekly';
  is_realized: boolean;
  observations?: string;
}

export interface Debt {
  id: string;
  name: string;
  original_value: number;
  current_value: number;
  interest_rate: number; // percentage, e.g. 1.99
  total_installments: number;
  remaining_installments: number;
  due_date: string; // YYYY-MM-DD
  creditor: string;
  bank_connection_id?: string; // Link to a credit card invoice
}

export interface Goal {
  id: string;
  name: string;
  target_value: number;
  current_value: number;
  deadline: string; // YYYY-MM-DD
  priority: 'low' | 'medium' | 'high';
  icon: string; // Emoji character or icon name
}

export interface Caixinha {
  id: string;
  name: string;
  icon: string; // Emoji character
  color: string; // Hex color or tailwind class
  current_value: number;
  target_value: number;
}

export interface BankConnection {
  id: string;
  bank_name: string;
  connected_at: string;
  status: 'syncing' | 'connected' | 'error';
  balance: number;
  limit: number;
  credit_card_invoice: number;
  logo: string;
}

export interface AppNotification {
  id: string;
  title: string;
  content: string;
  type: 'warning' | 'info' | 'success';
  date: string; // YYYY-MM-DD HH:MM
  read: boolean;
}

export interface FinanceState {
  profile: Profile;
  transactions: Transaction[];
  debts: Debt[];
  goals: Goal[];
  caixinhas: Caixinha[];
  bankConnections: BankConnection[];
  notifications: AppNotification[];
  theme: 'light' | 'dark';
}
