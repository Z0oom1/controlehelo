'use client';

import React, { useState, useEffect } from 'react';
import { useFinanceState } from '@/context/FinanceContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Search, 
  SlidersHorizontal,
  Calendar,
  FileSpreadsheet,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Edit2
} from 'lucide-react';
import { Transaction, TransactionType } from '@/types';

export default function TransactionsPage() {
  const { 
    transactions, 
    addTransaction, 
    deleteTransaction, 
    updateTransaction,
    dinheiroEmConta,
    showValues
  } = useFinanceState();

  const [mounted, setMounted] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showProjections, setShowProjections] = useState(false);
  const [editTransactionId, setEditTransactionId] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'predicted_income'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('Alimentação');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [recurrence, setRecurrence] = useState<'none' | 'monthly' | 'weekly'>('none');
  const [observations, setObservations] = useState('');
  const [isRealized, setIsRealized] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const displayBRL = (val: number) => {
    if (!showValues) return 'R$ ••••••';
    return formatBRL(val);
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income' || newType === 'predicted_income') {
      setCategory('Salário');
      setIsRealized(newType === 'income');
    } else {
      setCategory('Alimentação');
      setIsRealized(true);
    }
  };

  const handleStartEdit = (t: Transaction) => {
    setEditTransactionId(t.id);
    setDescription(t.description);
    setAmount(t.amount.toString());
    setType(t.type);
    setCategory(t.category);
    setDate(t.date);
    setRecurrence(t.recurrence);
    setObservations(t.observations || '');
    setIsRealized(t.is_realized);
    setShowAddForm(true);
  };

  const handleCloseAddForm = () => {
    setEditTransactionId(null);
    setDescription('');
    setAmount('');
    setType('expense');
    setCategory('Alimentação');
    setDate(new Date().toISOString().split('T')[0]);
    setRecurrence('none');
    setObservations('');
    setIsRealized(true);
    setShowAddForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    if (editTransactionId) {
      updateTransaction({
        id: editTransactionId,
        description,
        amount: parseFloat(amount),
        type: type === 'predicted_income' ? 'predicted_income' : type,
        category,
        date,
        recurrence,
        is_realized: type === 'predicted_income' ? false : isRealized,
        observations
      });
    } else {
      addTransaction({
        description,
        amount: parseFloat(amount),
        type: type === 'predicted_income' ? 'predicted_income' : type,
        category,
        date,
        recurrence,
        is_realized: type === 'predicted_income' ? false : isRealized,
        observations
      });
    }

    handleCloseAddForm();
  };

  const handleToggleRealized = (t: Transaction) => {
    updateTransaction({
      ...t,
      is_realized: !t.is_realized,
      type: t.type === 'predicted_income' && !t.is_realized ? 'income' : t.type
    });
  };

  // Calculations for projections
  const futureIncome = transactions
    .filter(t => t.type === 'predicted_income' || (!t.is_realized && t.type === 'income'))
    .reduce((acc, t) => acc + t.amount, 0);

  const futureExpense = transactions
    .filter(t => !t.is_realized && t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const saldoAtual = dinheiroEmConta;
  const saldoPrevisto = saldoAtual + futureIncome - futureExpense;
  const saldoOtimista = saldoAtual + (futureIncome * 1.15) - (futureExpense * 0.90);
  const saldoConservador = saldoAtual + (futureIncome * 0.85) - (futureExpense * 1.10);

  // Categories list based on transaction type
  const expenseCategories = ['Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Moradia', 'Educação', 'Assinaturas', 'Compras', 'Outros'];
  const incomeCategories = ['Salário', 'Freelance', 'Comissão', 'Vendas', 'Rendimentos', 'Outros'];
  const activeCategories = type === 'expense' ? expenseCategories : incomeCategories;

  // Filtered transactions list
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.observations && t.observations.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || 
                        (typeFilter === 'income' && t.type === 'income') ||
                        (typeFilter === 'expense' && t.type === 'expense') ||
                        (typeFilter === 'predicted_income' && t.type === 'predicted_income');

    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Category Icon Mapper
  const getCategoryIcon = (cat: string, txType: string) => {
    if (txType === 'income' || txType === 'predicted_income') {
      switch (cat) {
        case 'Salário': return '💰';
        case 'Freelance': return '💻';
        case 'Comissão': return '📈';
        case 'Vendas': return '🏷️';
        case 'Rendimentos': return '🪙';
        default: return '💼';
      }
    } else {
      switch (cat) {
        case 'Alimentação': return '🍽️';
        case 'Transporte': return '🚗';
        case 'Saúde': return '💊';
        case 'Lazer': return '🏖️';
        case 'Moradia': return '🏠';
        case 'Educação': return '📚';
        case 'Assinaturas': return '📺';
        case 'Compras': return '🛍️';
        default: return '💸';
      }
    }
  };

  // Group by Date helper
  const groupedTransactions: { [date: string]: Transaction[] } = {};
  filteredTransactions.forEach(t => {
    if (!groupedTransactions[t.date]) {
      groupedTransactions[t.date] = [];
    }
    groupedTransactions[t.date].push(t);
  });

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

  // Client-side CSV/Excel export
  const exportCSV = () => {
    const headers = ['Descrição,Valor,Tipo,Categoria,Data,Realizado,Recorrência,Observação\n'];
    const rows = transactions.map(t => {
      return `"${t.description}",${t.amount},"${t.type}","${t.category}","${t.date}",${t.is_realized},"${t.recurrence}","${t.observations || ''}"`;
    });
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.concat(rows.join('\n')).join('');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `helo_financ_extrato_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Client-side PDF print trigger
  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Quick Totals */}
      <div className="bg-card border border-border p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-6 select-none">
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Saldo Real</span>
            <span className="text-xl font-extrabold text-foreground">{displayBRL(saldoAtual)}</span>
          </div>
          <div className="border-r border-border" />
          <div className="space-y-0.5">
            <span className="text-[10px] text-accent font-bold uppercase tracking-wider block">Saldo Previsto</span>
            <span className="text-xl font-extrabold text-accent">{displayBRL(saldoPrevisto)}</span>
          </div>
        </div>

        <button
          onClick={() => setShowProjections(!showProjections)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border hover:bg-muted text-xs font-bold rounded-xl transition-all text-muted-foreground hover:text-foreground cursor-pointer select-none"
        >
          <span>Projeções de Cenário</span>
          {showProjections ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expandable scenario projections */}
      {showProjections && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/15 border border-border/80 rounded-3xl animate-in fade-in slide-in-from-top-3 duration-200 select-none">
          <div className="bg-card border border-border p-4 rounded-2xl">
            <span className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-wider block">Cenário Otimista</span>
            <span className="text-lg font-black text-green-600 dark:text-green-400 block mt-1">{displayBRL(saldoOtimista)}</span>
            <p className="text-[10px] text-muted-foreground mt-1">Estimativa considerando ganhos extras (+15%) e despesas contidas (-10%).</p>
          </div>
          <div className="bg-card border border-border p-4 rounded-2xl">
            <span className="text-[10px] text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider block">Cenário Conservador</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-500 block mt-1">{displayBRL(saldoConservador)}</span>
            <p className="text-[10px] text-muted-foreground mt-1">Estimativa de segurança caso algumas receitas falhem (-15%) e gastos subam (+10%).</p>
          </div>
        </div>
      )}

      {/* Main Section Header */}
      <div className="flex justify-between items-center select-none">
        <h2 className="font-extrabold text-base tracking-tight flex items-center gap-2">
          📋 Histórico Financeiro
        </h2>
        <button 
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-103 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Novo Lançamento
        </button>
      </div>

      {/* Search and Filter Panel */}
      <div className="bg-card border border-border p-4 rounded-3xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border bg-background text-xs focus:outline-none focus:border-accent"
          />
        </div>

        {/* Action Selects */}
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto items-center justify-end select-none">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground hidden sm:block" />
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="p-2 px-3 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-accent font-semibold text-foreground cursor-pointer"
          >
            <option value="all">Todos os tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
            <option value="predicted_income">Ganhos Previstos</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 px-3 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-accent font-semibold text-foreground cursor-pointer"
          >
            <option value="all">Todas as categorias</option>
            {expenseCategories.concat(incomeCategories).filter((val, i, self) => self.indexOf(val) === i).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button 
            onClick={exportCSV}
            className="p-2 px-3 border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Exportar Planilha (CSV)"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" /> <span className="hidden sm:inline">CSV</span>
          </button>
          <button 
            onClick={triggerPrint}
            className="p-2 px-3 border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Imprimir Relatório"
          >
            <FileText className="w-4 h-4 text-blue-500" /> <span className="hidden sm:inline">Imprimir</span>
          </button>
        </div>
      </div>

      {/* Transaction List grouped by date */}
      <div className="space-y-5">
        {sortedDates.length === 0 ? (
          <div className="bg-card border border-border p-12 text-center rounded-3xl shadow-sm text-muted-foreground">
            <p className="text-sm font-semibold">Nenhuma transação encontrada.</p>
            <p className="text-xs mt-1">Tente ajustar seus filtros ou faça um novo lançamento.</p>
          </div>
        ) : (
          sortedDates.map((dateStr) => {
            const dayTxs = groupedTransactions[dateStr];
            
            const dateObj = new Date(dateStr + 'T00:00:00');
            const formattedDate = dateObj.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            });

            return (
              <div key={dateStr} className="space-y-2.5">
                {/* Section Date header */}
                <h4 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest pl-2 capitalize">
                  {formattedDate}
                </h4>

                {/* Day's transactions list */}
                <div className="bg-card border border-border rounded-3xl overflow-hidden divide-y divide-border/60 shadow-sm">
                  {dayTxs.map((t) => {
                    const isExpense = t.type === 'expense';
                    const icon = getCategoryIcon(t.category, t.type);

                    return (
                      <div key={t.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                        
                        {/* Category Icon and Details */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-center text-lg shrink-0">
                            {icon}
                          </div>
                          
                          <div className="min-w-0 space-y-0.5">
                            <h5 className="font-bold text-xs text-foreground truncate max-w-[200px] sm:max-w-md" title={t.description}>
                              {t.description}
                            </h5>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[9px] bg-muted/40 text-muted-foreground font-extrabold px-1.5 py-0.5 rounded">
                                {t.category}
                              </span>
                              
                              {/* Status Badge */}
                              {t.is_realized ? (
                                <span className="text-[9px] text-green-600 bg-green-50 dark:bg-green-950/20 font-bold px-1.5 py-0.5 rounded">
                                  Confirmado
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleToggleRealized(t)}
                                  className="text-[9px] text-amber-600 bg-amber-50 hover:bg-green-50 dark:bg-amber-950/20 hover:text-green-600 font-bold px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                                  title="Clique para confirmar pagamento/recebimento"
                                >
                                  Pendente (Confirmar?)
                                </button>
                              )}
                            </div>
                            {t.observations && (
                              <p className="text-[9px] text-muted-foreground italic truncate max-w-[150px] sm:max-w-sm">
                                "{t.observations}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className={`text-sm font-black tracking-tight ${
                            isExpense ? 'text-red-500' : 'text-green-600 dark:text-green-400'
                          }`}>
                            {isExpense ? '-' : '+'} {displayBRL(t.amount)}
                          </span>

                          <button
                            onClick={() => handleStartEdit(t)}
                            className="p-1.5 text-muted-foreground hover:text-accent hover:bg-muted rounded-xl transition-all cursor-pointer"
                            title="Editar Lançamento"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => deleteTransaction(t.id)}
                            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-muted rounded-xl transition-all cursor-pointer"
                            title="Excluir Lançamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal form overlay */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="modal-sheet w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-3 duration-300 relative flex flex-col max-h-[90vh]">
            {/* iOS handle pill */}
            <div className="w-12 h-1.5 bg-muted-foreground/20 dark:bg-muted-foreground/30 rounded-full mx-auto mt-3 -mb-2 shrink-0" />
            
            {/* Modal Header */}
            <div className="p-6 border-b border-border/40 flex justify-between items-center bg-gradient-to-r from-primary/10 to-accent/10 select-none">
              <div>
                <h3 className="font-extrabold text-lg flex items-center gap-2 text-foreground font-outfit">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  {editTransactionId ? "Editar Lançamento" : "Novo Lançamento"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Registre suas transações financeiras com facilidade</p>
              </div>
              <button 
                onClick={handleCloseAddForm}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {/* Type Switcher */}
              <div className="space-y-2">
                <label className="font-bold text-sm text-foreground">Tipo de Lançamento</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('expense')}
                    className={`p-3 rounded-2xl border-2 text-sm font-bold transition-all cursor-pointer ${
                      type === 'expense' 
                        ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400' 
                        : 'border-border bg-transparent text-muted-foreground hover:border-red-500/50'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4 inline mr-1" />
                    Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('income')}
                    className={`p-3 rounded-2xl border-2 text-sm font-bold transition-all cursor-pointer ${
                      type === 'income' 
                        ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400' 
                        : 'border-border bg-transparent text-muted-foreground hover:border-green-500/50'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    Receita
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('predicted_income')}
                    className={`p-3 rounded-2xl border-2 text-sm font-bold transition-all cursor-pointer ${
                      type === 'predicted_income' 
                        ? 'border-primary bg-primary/10 text-accent' 
                        : 'border-border bg-transparent text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    Previsto
                  </button>
                </div>
              </div>

              {/* Main Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <span className="text-accent">*</span> Descrição
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ex: Assinatura Netflix"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-foreground font-semibold transition-all"
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <span className="text-accent">*</span> Valor (R$)
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="Ex: 55.90"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 font-bold text-foreground transition-all"
                    required
                  />
                </div>
              </div>

              {/* Date and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <span className="text-accent">*</span> Data do Lançamento
                  </label>
                  <input 
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-foreground font-semibold transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-sm text-foreground">Categoria</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-foreground font-semibold cursor-pointer transition-all"
                  >
                    {activeCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Advanced options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="space-y-2">
                  <label className="font-bold text-sm text-foreground">Recorrência</label>
                  <select 
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as any)}
                    className="w-full p-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-foreground font-semibold cursor-pointer transition-all"
                  >
                    <option value="none">Nenhuma</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>

                {type !== 'predicted_income' && (
                  <div className="flex items-center gap-3 pt-2">
                    <input 
                      type="checkbox" 
                      id="isRealized"
                      checked={isRealized}
                      onChange={(e) => setIsRealized(e.target.checked)}
                      className="w-5 h-5 rounded accent-accent cursor-pointer"
                    />
                    <label htmlFor="isRealized" className="font-bold text-sm text-foreground cursor-pointer">Já foi pago/recebido?</label>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-bold text-sm text-foreground">Observações (Opcional)</label>
                <textarea 
                  placeholder="Comentários adicionais sobre este lançamento..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 h-20 resize-none text-foreground transition-all"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-6 border-t border-border flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseAddForm} 
                  className="px-6 py-2.5 border border-border hover:bg-muted rounded-2xl font-bold text-sm cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-2xl font-bold text-sm shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {editTransactionId ? "Salvar Alterações" : "Confirmar Lançamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
