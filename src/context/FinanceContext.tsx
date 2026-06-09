'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  FinanceState, 
  Transaction, 
  Debt, 
  Goal, 
  Caixinha, 
  BankConnection, 
  AppNotification,
  Profile
} from '../types';

interface FinanceContextType extends FinanceState {
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (t: Transaction) => void;
  addDebt: (d: Omit<Debt, 'id'>) => void;
  deleteDebt: (id: string) => void;
  payDebtInstallment: (id: string) => void;
  addGoal: (g: Omit<Goal, 'id'>) => void;
  deleteGoal: (id: string) => void;
  updateGoalProgress: (id: string, amount: number) => void;
  addCaixinha: (c: Omit<Caixinha, 'id'>) => void;
  deleteCaixinha: (id: string) => void;
  depositToCaixinha: (id: string, amount: number) => boolean;
  withdrawFromCaixinha: (id: string, amount: number) => boolean;
  transferBetweenCaixinhas: (fromId: string, toId: string, amount: number) => boolean;
  connectBankFile: (bankName: string, balance: number, limit: number, creditCardInvoice: number, importedTxs: (Omit<Transaction, 'id'> & { id?: string })[]) => void;
  disconnectBank: (id: string) => void;
  updateBankConnection: (id: string, balance: number, limit: number, creditCardInvoice: number) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  toggleTheme: () => void;
  updateProfile: (p: Profile) => void;
  
  // Computed Metrics
  dinheiroEmConta: number;
  valorCaixinhas: number;
  totalDividas: number;
  totalFaturasAberto: number;
  totalInvestido: number;
  patrimonioAtual: number;
  saldoLiquidoReal: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const initialProfile: Profile = {
  name: '',
  avatar_url: '',
  salaryAmount: undefined,
  salaryDay: undefined
};

const initialTransactions: Transaction[] = [];
const initialDebts: Debt[] = [];
const initialGoals: Goal[] = [];
const initialCaixinhas: Caixinha[] = [];
const initialBankConnections: BankConnection[] = [];
const initialNotifications: AppNotification[] = [];

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [debts, setDebts] = useState<Debt[]>(initialDebts);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [caixinhas, setCaixinhas] = useState<Caixinha[]>(initialCaixinhas);
  const [bankConnections, setBankConnections] = useState<BankConnection[]>(initialBankConnections);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  


  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage with version check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const DATA_VERSION = 3;
      const localData = localStorage.getItem('helo_finance_state');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (!parsed.__version || parsed.__version < DATA_VERSION) {
            console.log('Dados antigos detectados no localStorage. Limpando dados para início limpo.');
            localStorage.removeItem('helo_finance_state');
          } else {
            if (parsed.profile) setProfile(parsed.profile);
            if (parsed.transactions) setTransactions(parsed.transactions);
            if (parsed.debts) setDebts(parsed.debts);
            if (parsed.goals) setGoals(parsed.goals);
            if (parsed.caixinhas) setCaixinhas(parsed.caixinhas);
            if (parsed.bankConnections) setBankConnections(parsed.bankConnections);
            if (parsed.notifications) setNotifications(parsed.notifications);

            if (parsed.theme) {
              setTheme(parsed.theme);
              if (parsed.theme === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            }
          }
        } catch (e) {
          console.error('Error parsing localStorage state:', e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage with version
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      const DATA_VERSION = 3;
      const stateToSave = {
        profile,
        transactions,
        debts,
        goals,
        caixinhas,
        bankConnections,
        notifications,
        theme,
        __version: DATA_VERSION
      };
      localStorage.setItem('helo_finance_state', JSON.stringify(stateToSave));
    }
  }, [profile, transactions, debts, goals, caixinhas, bankConnections, notifications, theme, isLoaded]);

  const toggleTheme = () => {
    setTheme(prev => {
      const nextTheme = prev === 'light' ? 'dark' : 'light';
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return nextTheme;
    });
  };

  const updateProfile = (p: Profile) => setProfile(p);
  


  // Financial calculations
  const dinheiroEmConta = transactions
    .filter(t => t.is_realized)
    .reduce((acc, t) => {
      if (t.type === 'income') return acc + t.amount;
      if (t.type === 'expense') return acc - t.amount;
      return acc;
    }, 0) + bankConnections
    .filter(c => c.status === 'connected')
    .reduce((acc, c) => acc + c.balance, 0);

  const valorCaixinhas = caixinhas.reduce((acc, c) => acc + c.current_value, 0);
  const totalDividas = debts.reduce((acc, d) => acc + d.current_value, 0);
  const totalFaturasAberto = bankConnections.reduce((acc, c) => acc + c.credit_card_invoice, 0);
  
  // Total investido is set to 0 as mock data is removed
  const totalInvestido = 0; 

  const patrimonioAtual = dinheiroEmConta + valorCaixinhas + totalInvestido;
  const saldoLiquidoReal = patrimonioAtual - totalDividas - totalFaturasAberto;

  // Transactions Handlers
  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...t,
      id: 't_' + Math.random().toString(36).substr(2, 9)
    };
    setTransactions(prev => [newTransaction, ...prev]);

    // Add notification if spending is high
    if (newTransaction.type === 'expense' && newTransaction.amount > 500) {
      addSystemNotification(
        'Alerta de Gasto Alto ⚠️',
        `Você registrou uma despesa de R$ ${newTransaction.amount.toFixed(2)} em ${newTransaction.category}.`,
        'warning'
      );
    }
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateTransaction = (updated: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  // Debts Handlers
  const addDebt = (d: Omit<Debt, 'id'>) => {
    const newDebt: Debt = {
      ...d,
      id: 'd_' + Math.random().toString(36).substr(2, 9)
    };
    setDebts(prev => [...prev, newDebt]);
    addSystemNotification(
      'Nova Dívida Registrada 💸',
      `A dívida "${d.name}" com ${d.creditor} foi cadastrada com sucesso.`,
      'info'
    );
  };

  const deleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  const payDebtInstallment = (id: string) => {
    setDebts(prev => {
      return prev.map(d => {
        if (d.id === id) {
          const installmentValue = d.current_value / d.remaining_installments;
          const nextRemaining = d.remaining_installments - 1;
          const nextValue = nextRemaining === 0 ? 0 : d.current_value - installmentValue;
          
          // Log payment transaction
          addTransaction({
            description: `Pgto. Parcela - ${d.name}`,
            amount: installmentValue,
            type: 'expense',
            category: 'Contas & Dívidas',
            date: new Date().toISOString().split('T')[0],
            recurrence: 'none',
            is_realized: true,
            observations: `Instituição: ${d.creditor}. Restam ${nextRemaining} parcelas.`
          });

          // System Notification
          if (nextRemaining === 0) {
            addSystemNotification(
              'Dívida Quitada! 🎉❤️',
              `Parabéns! Você quitou totalmente a dívida "${d.name}". Que alívio financeiro!`,
              'success'
            );
          } else {
            addSystemNotification(
              'Parcela de Dívida Paga 🌸',
              `Você pagou R$ ${installmentValue.toFixed(2)} da dívida "${d.name}". Restam ${nextRemaining} parcelas.`,
              'success'
            );
          }

          return {
            ...d,
            current_value: nextValue,
            remaining_installments: nextRemaining,
            due_date: new Date(new Date(d.due_date).setMonth(new Date(d.due_date).getMonth() + 1)).toISOString().split('T')[0]
          };
        }
        return d;
      }).filter(d => d.remaining_installments > 0 || d.current_value > 0);
    });
  };

  // Goals Handlers
  const addGoal = (g: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...g,
      id: 'g_' + Math.random().toString(36).substr(2, 9)
    };
    setGoals(prev => [...prev, newGoal]);
    addSystemNotification(
      'Nova Meta Financeira! 🎯',
      `Meta "${g.name}" de R$ ${g.target_value.toFixed(2)} criada com sucesso.`,
      'success'
    );
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const updateGoalProgress = (id: string, amount: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const nextVal = Math.min(g.target_value, Math.max(0, g.current_value + amount));
        if (nextVal >= g.target_value && g.current_value < g.target_value) {
          addSystemNotification(
            'Meta Atingida! 🎉🏆❤️',
            `Parabéns Helo! Você alcançou 100% da sua meta: "${g.name}"!`,
            'success'
          );
        }
        return { ...g, current_value: nextVal };
      }
      return g;
    }));
  };

  // Caixinhas Handlers
  const addCaixinha = (c: Omit<Caixinha, 'id'>) => {
    const newCaixinha: Caixinha = {
      ...c,
      id: 'c_' + Math.random().toString(36).substr(2, 9)
    };
    setCaixinhas(prev => [...prev, newCaixinha]);
  };

  const deleteCaixinha = (id: string) => {
    setCaixinhas(prev => prev.filter(c => c.id !== id));
  };

  const depositToCaixinha = (id: string, amount: number): boolean => {
    if (dinheiroEmConta < amount) return false;
    
    // Deduct from balance via registering an expense or directly adjusting state
    // Let's create an expense transaction to track this
    addTransaction({
      description: `Depósito Caixinha - ${caixinhas.find(c => c.id === id)?.name}`,
      amount: amount,
      type: 'expense',
      category: 'Investimentos',
      date: new Date().toISOString().split('T')[0],
      recurrence: 'none',
      is_realized: true
    });

    setCaixinhas(prev => prev.map(c => {
      if (c.id === id) {
        const nextVal = c.current_value + amount;
        // Hook to goals
        if (c.name === 'Reserva de Emergência') {
          updateGoalProgress(goals.find(g => g.name.includes('Reserva'))?.id || '', amount);
        } else if (c.name === 'Casamento') {
          updateGoalProgress(goals.find(g => g.name.includes('Casamento'))?.id || '', amount);
        }
        return { ...c, current_value: nextVal };
      }
      return c;
    }));

    addSystemNotification(
      'Valor Guardado! 🌸💰',
      `R$ ${amount.toFixed(2)} guardados com sucesso na caixinha!`,
      'success'
    );
    return true;
  };

  const withdrawFromCaixinha = (id: string, amount: number): boolean => {
    const box = caixinhas.find(c => c.id === id);
    if (!box || box.current_value < amount) return false;

    // Refund back to balance
    addTransaction({
      description: `Resgate Caixinha - ${box.name}`,
      amount: amount,
      type: 'income',
      category: 'Outros',
      date: new Date().toISOString().split('T')[0],
      recurrence: 'none',
      is_realized: true
    });

    setCaixinhas(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, current_value: c.current_value - amount };
      }
      return c;
    }));

    addSystemNotification(
      'Resgate Concluído 💸',
      `R$ ${amount.toFixed(2)} resgatados da caixinha "${box.name}" para sua conta.`,
      'info'
    );
    return true;
  };

  const transferBetweenCaixinhas = (fromId: string, toId: string, amount: number): boolean => {
    const sourceBox = caixinhas.find(c => c.id === fromId);
    const destBox = caixinhas.find(c => c.id === toId);
    
    if (!sourceBox || !destBox || sourceBox.current_value < amount) return false;

    setCaixinhas(prev => prev.map(c => {
      if (c.id === fromId) return { ...c, current_value: c.current_value - amount };
      if (c.id === toId) return { ...c, current_value: c.current_value + amount };
      return c;
    }));

    addSystemNotification(
      'Transferência Realizada ❤️',
      `R$ ${amount.toFixed(2)} transferidos de "${sourceBox.name}" para "${destBox.name}".`,
      'success'
    );
    return true;
  };

  const updateBankConnection = (id: string, balance: number, limit: number, creditCardInvoice: number) => {
    setBankConnections(prev => prev.map(c => 
      c.id === id 
        ? { ...c, balance, limit, credit_card_invoice: creditCardInvoice, connected_at: new Date().toISOString().split('T')[0] }
        : c
    ));
    addSystemNotification(
      'Conta Atualizada 🏦',
      `Os valores da sua conta foram atualizados manualmente.`,
      'success'
    );
  };

  const disconnectBank = (id: string) => {
    const conn = bankConnections.find(b => b.id === id);
    setBankConnections(prev => prev.filter(b => b.id !== id));
    if (conn) {
      addSystemNotification(
        'Conexão Removida 🏦',
        `A integração com o ${conn.bank_name} foi desconectada.`,
        'info'
      );
    }
  };

  const connectBankFile = (
    bankName: string, 
    balance: number, 
    limit: number, 
    creditCardInvoice: number, 
    importedTxs: (Omit<Transaction, 'id'> & { id?: string })[]
  ) => {
    const id = 'local_' + bankName.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.random().toString(36).substr(2, 9);
    
    // Logo emoji builder
    let logo = '🏦';
    const nameLower = bankName.toLowerCase();
    if (nameLower.includes('nubank')) logo = '💜';
    else if (nameLower.includes('brasil')) logo = '💛';
    else if (nameLower.includes('itaú') || nameLower.includes('itau')) logo = '🧡';
    else if (nameLower.includes('bradesco')) logo = '❤️';
    else if (nameLower.includes('inter')) logo = '🧡';
    else if (nameLower.includes('santander')) logo = '❤️';
    else if (nameLower.includes('caixa')) logo = '💙';
    else if (nameLower.includes('c6')) logo = '🖤';
    else if (nameLower.includes('mercado')) logo = '💙';
    else if (nameLower.includes('picpay')) logo = '💚';

    const bankConnection: BankConnection = {
      id,
      bank_name: bankName,
      connected_at: new Date().toISOString().split('T')[0],
      status: 'connected',
      balance,
      limit,
      credit_card_invoice: creditCardInvoice,
      logo,
    };

    // Replace if existing connection with the same name, or add new
    setBankConnections(prev => {
      const filtered = prev.filter(c => c.bank_name.toLowerCase() !== bankName.toLowerCase());
      return [...filtered, bankConnection];
    });

    // Map and inject transactions
    const mappedTransactions: Transaction[] = importedTxs.map(t => ({
      ...t,
      id: t.id || 'tx_' + Math.random().toString(36).substr(2, 9)
    }));

    setTransactions(prev => {
      // Avoid duplication by looking at matching description, amount, date, and type
      const isDuplicate = (t1: Transaction, t2: Transaction) => 
        t1.description === t2.description &&
        t1.amount === t2.amount &&
        t1.date === t2.date &&
        t1.type === t2.type;

      const newTxs = mappedTransactions.filter(newTx => 
        !prev.some(existingTx => isDuplicate(existingTx, newTx))
      );
      return [...newTxs, ...prev];
    });

    addSystemNotification(
      'Extrato Importado com Sucesso 🌸📄',
      `Sua conta do ${bankName} foi atualizada. Importadas ${mappedTransactions.length} transações. Saldo atualizado para R$ ${balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`,
      'success'
    );
  };

  // Notifications Helpers
  const addSystemNotification = (title: string, content: string, type: 'warning' | 'info' | 'success') => {
    const newNotif: AppNotification = {
      id: 'n_' + Math.random().toString(36).substr(2, 9),
      title,
      content,
      type,
      date: new Date().toISOString().replace('T', ' ').substr(0, 16),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <FinanceContext.Provider value={{
      profile,
      transactions,
      debts,
      goals,
      caixinhas,
      bankConnections,
      notifications,
      theme,
      toggleTheme,
      updateProfile,
      addTransaction,
      deleteTransaction,
      updateTransaction,
      addDebt,
      deleteDebt,
      payDebtInstallment,
      addGoal,
      deleteGoal,
      updateGoalProgress,
      addCaixinha,
      deleteCaixinha,
      depositToCaixinha,
      withdrawFromCaixinha,
      transferBetweenCaixinhas,
      connectBankFile,
      disconnectBank,
      updateBankConnection,
      markNotificationRead,
      clearNotifications,
      
      // Computed Metrics
      dinheiroEmConta,
      valorCaixinhas,
      totalDividas,
      totalFaturasAberto,
      totalInvestido,
      patrimonioAtual,
      saldoLiquidoReal
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinanceState = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinanceState must be used within a FinanceProvider');
  }
  return context;
};
