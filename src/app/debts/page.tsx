'use client';

import React, { useState, useEffect } from 'react';
import { useFinanceState } from '@/context/FinanceContext';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Calendar, 
  ChevronDown,
  ChevronUp,
  CheckCircle,
  X,
  Edit2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DebtsPage() {
  const { 
    debts, 
    addDebt, 
    deleteDebt, 
    updateDebt,
    payDebtInstallment, 
    dinheiroEmConta,
    showValues
  } = useFinanceState();

  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [editDebtId, setEditDebtId] = useState<string | null>(null);

  // Form inputs
  const [name, setName] = useState('');
  const [creditor, setCreditor] = useState('');
  const [originalValue, setOriginalValue] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [remainingInstallments, setRemainingInstallments] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Planner state
  const [monthlyAllotment, setMonthlyAllotment] = useState(600);
  const [planningMethod, setPlanningMethod] = useState<'snowball' | 'avalanche'>('avalanche');

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

  const handleOpenModal = () => setIsModalOpen(true);

  const handleStartEdit = (debt: any) => {
    setEditDebtId(debt.id);
    setName(debt.name);
    setCreditor(debt.creditor);
    setOriginalValue(debt.original_value.toString());
    setCurrentValue(debt.current_value.toString());
    setInterestRate(debt.interest_rate.toString());
    setTotalInstallments(debt.total_installments.toString());
    setRemainingInstallments(debt.remaining_installments.toString());
    setDueDate(debt.due_date);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditDebtId(null);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setCreditor('');
    setOriginalValue('');
    setCurrentValue('');
    setInterestRate('');
    setTotalInstallments('');
    setRemainingInstallments('');
    setDueDate('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !creditor || !originalValue || !currentValue || !totalInstallments || !remainingInstallments || !dueDate) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (editDebtId) {
      updateDebt({
        id: editDebtId,
        name,
        creditor,
        original_value: parseFloat(originalValue),
        current_value: parseFloat(currentValue),
        interest_rate: interestRate ? parseFloat(interestRate) : 0,
        total_installments: parseInt(totalInstallments),
        remaining_installments: parseInt(remainingInstallments),
        due_date: dueDate
      });
    } else {
      addDebt({
        name,
        creditor,
        original_value: parseFloat(originalValue),
        current_value: parseFloat(currentValue),
        interest_rate: interestRate ? parseFloat(interestRate) : 0,
        total_installments: parseInt(totalInstallments),
        remaining_installments: parseInt(remainingInstallments),
        due_date: dueDate
      });
    }

    handleCloseModal();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#FFB7C5', '#FF4D6D', '#FFF0F2']
    });
  };

  const handlePayInstallment = (id: string) => {
    payDebtInstallment(id);
    confetti({
      particleCount: 150,
      spread: 80,
      colors: ['#FFB7C5', '#FF4D6D', '#FFCCD5', '#FFFFFF']
    });
  };

  // Calculations for general progress
  const totalOriginal = debts.reduce((acc, d) => acc + d.original_value, 0);
  const totalCurrent = debts.reduce((acc, d) => acc + d.current_value, 0);
  const totalPaid = totalOriginal - totalCurrent;
  const generalProgress = totalOriginal > 0 ? (totalPaid / totalOriginal) * 100 : 0;

  // Payoff Plan projections
  const totalRemainingDebts = totalCurrent;
  const monthsToPayoff = monthlyAllotment > 0 
    ? Math.ceil(totalRemainingDebts / monthlyAllotment) 
    : 0;

  // Interest saved calculator (simulated estimation)
  const estimatedInterestRate = debts.reduce((acc, d) => acc + (d.interest_rate * d.current_value), 0) / (totalCurrent || 1);
  const standardTime = debts.reduce((acc, d) => acc + d.remaining_installments, 0) / (debts.length || 1);
  
  const timeDifference = Math.max(0, standardTime - monthsToPayoff);
  const interestSaved = totalRemainingDebts * (estimatedInterestRate / 100) * (timeDifference / 12);

  return (
    <div className="space-y-6">
      
      {/* Header with quick stats */}
      <div className="bg-card border border-border p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-6 select-none">
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Total Devedor</span>
            <span className="text-xl font-extrabold text-accent">{displayBRL(totalCurrent)}</span>
          </div>
          <div className="border-r border-border" />
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Total já Pago</span>
            <span className="text-xl font-extrabold text-foreground">{displayBRL(totalPaid)}</span>
          </div>
        </div>

        <button 
          onClick={handleOpenModal}
          className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-103 cursor-pointer animate-fade-in"
        >
          <Plus className="w-4 h-4" /> Nova Dívida
        </button>
      </div>

      {/* Progress & Insight Bar */}
      <div className="bg-card border border-border p-5 rounded-3xl shadow-sm space-y-3.5">
        <div className="flex justify-between items-center text-xs font-bold text-muted-foreground select-none">
          <span>PROCESSO GERAL DE QUITAÇÃO</span>
          <span className="text-accent">{generalProgress.toFixed(0)}% Concluído</span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-accent h-2 rounded-full transition-all duration-500" 
            style={{ width: `${generalProgress}%` }}
          />
        </div>
      </div>

      {/* Active Debts Grid */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2 select-none">
          Suas Dívidas Ativas ({debts.length})
        </h3>
        
        {debts.length === 0 ? (
          <div className="bg-card border border-border p-12 text-center rounded-3xl shadow-sm text-muted-foreground select-none">
            <CheckCircle className="w-10 h-10 text-primary mx-auto mb-2" />
            <p className="text-sm font-semibold">Tudo quitado! Nenhuma dívida ativa no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {debts.map((debt) => {
              const paidAmount = debt.original_value - debt.current_value;
              const progressPercent = (paidAmount / debt.original_value) * 100;
              const installmentValue = debt.current_value / debt.remaining_installments;

              return (
                <div key={debt.id} className="bg-card border border-border p-5 rounded-3xl shadow-sm space-y-4 relative hover:border-primary/40 transition-colors group">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-accent bg-primary/20 px-2 py-0.5 rounded-md">
                        {debt.creditor}
                      </span>
                      <h4 className="font-extrabold text-sm text-foreground block">{debt.name}</h4>
                    </div>
                    
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleStartEdit(debt)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-accent rounded-lg hover:bg-muted transition-all cursor-pointer"
                        title="Editar dívida"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteDebt(debt.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-muted transition-all cursor-pointer"
                        title="Excluir dívida"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Clean stats row */}
                  <div className="grid grid-cols-3 gap-2.5 py-2 px-3 bg-muted/20 border border-border/60 rounded-2xl text-center text-xs select-none">
                    <div>
                      <span className="text-[9px] text-muted-foreground block font-bold">Saldo Devedor</span>
                      <span className="font-extrabold text-foreground">{displayBRL(debt.current_value)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-foreground block font-bold">Taxa Juros</span>
                      <span className="font-extrabold text-foreground">{debt.interest_rate}% a.m.</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-foreground block font-bold">Próx. Parcela</span>
                      <span className="font-extrabold text-accent">{displayBRL(installmentValue)}</span>
                    </div>
                  </div>

                  {/* Compact Progress */}
                  <div className="space-y-1 select-none">
                    <div className="flex justify-between text-[9px] text-muted-foreground font-bold">
                      <span>{debt.remaining_installments} de {debt.total_installments} parcelas restantes</span>
                      <span>{progressPercent.toFixed(0)}% pago</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1">
                      <div 
                        className="bg-primary h-1 rounded-full transition-all" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Vence em: {debt.due_date}
                    </span>
                    <button
                      onClick={() => handlePayInstallment(debt.id)}
                      className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-xl shadow-sm transition-colors text-xs cursor-pointer"
                    >
                      Pagar Parcela
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Debt Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-3 duration-300">
            {/* Header with gradient accent */}
            <div className="p-6 border-b border-border flex justify-between items-center bg-gradient-to-r from-primary/10 to-accent/10">
              <div>
                <h3 className="font-extrabold text-lg flex items-center gap-2 text-foreground">
                  <CreditCard className="w-5 h-5 text-accent" />
                  {editDebtId ? "Editar Dívida" : "Cadastrar Nova Dívida"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Preencha os dados da dívida para rastrear e planejar o pagamento</p>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Creditor and Name Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <span className="text-accent">*</span> Nome da Dívida
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ex: Financiamento Carro"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-foreground font-semibold transition-all"
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <span className="text-accent">*</span> Instituição Credora
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ex: Santander"
                    value={creditor}
                    onChange={(e) => setCreditor(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-foreground font-semibold transition-all"
                    required
                  />
                </div>
              </div>

              {/* Values Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <span className="text-accent">*</span> Valor Inicial (R$)
                  </label>
                  <input 
                    type="number" 
                    placeholder="15000"
                    value={originalValue}
                    onChange={(e) => setOriginalValue(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-foreground transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <span className="text-accent">*</span> Valor Restante (R$)
                  </label>
                  <input 
                    type="number" 
                    placeholder="8500"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-foreground font-bold transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-bold text-sm text-foreground">Juros (% a.m.)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="1.99"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-foreground transition-all"
                  />
                </div>
              </div>

              {/* Installments Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <span className="text-accent">*</span> Parcelas Totais
                  </label>
                  <input 
                    type="number" 
                    placeholder="24"
                    value={totalInstallments}
                    onChange={(e) => setTotalInstallments(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-foreground transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <span className="text-accent">*</span> Restantes
                  </label>
                  <input 
                    type="number" 
                    placeholder="14"
                    value={remainingInstallments}
                    onChange={(e) => setRemainingInstallments(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-foreground transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <span className="text-accent">*</span> Próx. Vencimento
                  </label>
                  <input 
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-foreground font-semibold transition-all"
                    required
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-6 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 border border-border hover:bg-muted rounded-2xl font-bold text-sm cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-2xl font-bold text-sm shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {editDebtId ? "Salvar Alterações" : "Cadastrar Dívida"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
