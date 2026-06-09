'use client';

import React, { useState } from 'react';
import { useFinanceState } from '@/context/FinanceContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Search, 
  SlidersHorizontal,
  Download,
  Calendar,
  CheckCircle,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { Transaction, TransactionType } from '@/types';

export default function TransactionsPage() {
  const { 
    transactions, 
    addTransaction, 
    deleteTransaction, 
    updateTransaction,
    dinheiroEmConta 
  } = useFinanceState();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'predicted_income'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('Alimentação');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [recurrence, setRecurrence] = useState<'none' | 'monthly' | 'weekly'>('none');
  const [observations, setObservations] = useState('');
  const [isRealized, setIsRealized] = useState(true);

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

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

    // Reset Form
    setDescription('');
    setAmount('');
    setObservations('');
    setShowAddForm(false);
  };

  const handleToggleRealized = (t: Transaction) => {
    updateTransaction({
      ...t,
      is_realized: !t.is_realized,
      // If we mark predicted_income as realized, it turns into a real income!
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
      
      {/* Projection Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Saldo Atual Real</span>
          <span className="text-xl font-extrabold text-foreground block mt-1">{formatBRL(saldoAtual)}</span>
          <p className="text-[9px] text-muted-foreground mt-0.5">Saldo real disponível em conta</p>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/40 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] text-accent font-bold uppercase tracking-wider block">Saldo Previsto</span>
          <span className="text-xl font-extrabold text-accent block mt-1">{formatBRL(saldoPrevisto)}</span>
          <p className="text-[9px] text-muted-foreground mt-0.5">Incluindo projeções e ganhos previstos</p>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-wider block">Saldo Otimista</span>
          <span className="text-xl font-extrabold text-green-600 dark:text-green-400 block mt-1">{formatBRL(saldoOtimista)}</span>
          <p className="text-[9px] text-muted-foreground mt-0.5">Freelances extras e menos gastos (+15%)</p>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider block">Saldo Conservador</span>
          <span className="text-xl font-extrabold text-amber-600 dark:text-amber-500 block mt-1">{formatBRL(saldoConservador)}</span>
          <p className="text-[9px] text-muted-foreground mt-0.5">Apenas receitas fixas garantidas (-15%)</p>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-extrabold text-base tracking-tight flex items-center gap-2">
          📋 Extrato & Lançamentos
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" /> Novo Lançamento
          </button>
        </div>
      </div>

      {/* Collapsible Add Transaction Form */}
      {showAddForm && (
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm animate-in slide-in-from-top-3 duration-200">
          <h3 className="font-bold text-sm mb-4">✍️ Registrar Transação</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type selector buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'expense' 
                    ? 'border-red-500 bg-red-500/5 text-red-500 font-bold' 
                    : 'border-border bg-transparent text-muted-foreground hover:bg-muted'
                }`}
              >
                💸 Despesa Real
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'income' 
                    ? 'border-green-500 bg-green-500/5 text-green-500 font-bold' 
                    : 'border-border bg-transparent text-muted-foreground hover:bg-muted'
                }`}
              >
                💰 Receita Real
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('predicted_income')}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'predicted_income' 
                    ? 'border-primary bg-primary/10 text-accent font-bold' 
                    : 'border-border bg-transparent text-muted-foreground hover:bg-muted'
                }`}
              >
                🔮 Ganho Previsto
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Descrição / Nome *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Supermercado BH"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Valor (R$) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="150"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Categoria</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
                >
                  {activeCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Data do Lançamento *</label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Recorrência</label>
                <select 
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
                >
                  <option value="none">Nenhuma</option>
                  <option value="monthly">Mensal</option>
                  <option value="weekly">Semanal</option>
                </select>
              </div>

              {type !== 'predicted_income' && (
                <div className="flex items-center gap-2 pt-8">
                  <input 
                    type="checkbox" 
                    id="isRealized"
                    checked={isRealized}
                    onChange={(e) => setIsRealized(e.target.checked)}
                    className="w-4.5 h-4.5 rounded accent-accent"
                  />
                  <label htmlFor="isRealized" className="text-xs font-semibold cursor-pointer">Já foi pago/recebido?</label>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Observações / Comentários</label>
              <textarea 
                placeholder="Detalhes adicionais sobre a transação..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent h-20 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)} 
                className="px-4 py-2 border border-border hover:bg-muted rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold shadow"
              >
                Confirmar Lançamento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Pesquisar descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-accent"
          />
        </div>

        {/* Filters Select */}
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto items-center justify-end">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground hidden sm:block" />
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="p-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-accent"
          >
            <option value="all">Todos os tipos</option>
            <option value="income">Apenas Receitas</option>
            <option value="expense">Apenas Despesas</option>
            <option value="predicted_income">Apenas Ganho Previsto</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-accent"
          >
            <option value="all">Todas categorias</option>
            {expenseCategories.concat(incomeCategories).filter((val, i, self) => self.indexOf(val) === i).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Export options */}
          <button 
            onClick={exportCSV}
            className="p-2 border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl flex items-center gap-1.5 text-xs font-semibold"
            title="Exportar CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" /> Exportar CSV
          </button>
          <button 
            onClick={triggerPrint}
            className="p-2 border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl flex items-center gap-1.5 text-xs font-semibold"
            title="Imprimir Extrato"
          >
            <FileText className="w-4 h-4 text-blue-500" /> Imprimir
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-muted/30 border-b border-border text-muted-foreground font-bold uppercase tracking-wider">
                <th className="p-4">Status</th>
                <th className="p-4">Data</th>
                <th className="p-4">Descrição</th>
                <th className="p-4">Categoria</th>
                <th className="p-4 text-right">Valor</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    Nenhuma transação encontrada com os filtros selecionados. 🌸
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => {
                  return (
                    <tr key={t.id} className="hover:bg-muted/10 transition-colors">
                      {/* Status */}
                      <td className="p-4">
                        {t.is_realized ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-950/20 text-green-600">
                            Confirmado
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleRealized(t)}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 hover:bg-green-100 dark:bg-amber-950/20 text-amber-600 hover:text-green-600 transition-colors"
                            title="Clique para confirmar pagamento/recebimento"
                          >
                            Previsto
                          </button>
                        )}
                      </td>
                      {/* Date */}
                      <td className="p-4 text-muted-foreground font-medium flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5" />
                        {t.date}
                      </td>
                      {/* Description */}
                      <td className="p-4">
                        <div className="font-semibold text-foreground">{t.description}</div>
                        {t.observations && <div className="text-[10px] text-muted-foreground mt-0.5 max-w-[200px] truncate" title={t.observations}>{t.observations}</div>}
                      </td>
                      {/* Category */}
                      <td className="p-4">
                        <span className="font-semibold">{t.category}</span>
                      </td>
                      {/* Amount */}
                      <td className={`p-4 text-right font-extrabold text-sm whitespace-nowrap ${
                        t.type === 'expense' ? 'text-red-500' : 'text-green-600 dark:text-green-400'
                      }`}>
                        {t.type === 'expense' ? '-' : '+'} {formatBRL(t.amount)}
                      </td>
                      {/* Actions */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => deleteTransaction(t.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-muted transition-colors"
                          title="Excluir lançamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
