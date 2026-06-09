'use client';

import React, { useState } from 'react';
import { useFinanceState } from '@/context/FinanceContext';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  HelpCircle,
  PiggyBank,
  CheckCircle,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DebtsPage() {
  const { 
    debts, 
    addDebt, 
    deleteDebt, 
    payDebtInstallment, 
    dinheiroEmConta 
  } = useFinanceState();

  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
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
  
  // Calculate simulated interest saved: if paid off in monthsToPayoff instead of standardTime
  const timeDifference = Math.max(0, standardTime - monthsToPayoff);
  const interestSaved = totalRemainingDebts * (estimatedInterestRate / 100) * (timeDifference / 12);

  return (
    <div className="space-y-6">
      
      {/* Header with quick stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Controle de Dívidas 💸</h1>
          <p className="text-sm text-muted-foreground">Gerencie seus parcelamentos a longo prazo e trace um plano inteligente de quitação.</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="px-4 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Nova Dívida
        </button>
      </div>

      {/* Debt Progress Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-card border border-border p-6 rounded-2xl space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Progresso Geral de Quitação</h3>
          <div className="flex justify-between items-end">
            <div>
              <span className="text-3xl font-extrabold text-accent">{formatBRL(totalCurrent)}</span>
              <span className="text-xs text-muted-foreground block mt-1">Valor restante para quitar</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-foreground">{formatBRL(totalPaid)} pagos</span>
              <span className="text-xs text-muted-foreground block mt-1">de {formatBRL(totalOriginal)} originais</span>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-accent h-3 rounded-full transition-all duration-500" 
              style={{ width: `${generalProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Você já quitou <strong className="text-accent">{generalProgress.toFixed(1)}%</strong> do valor de todas as suas dívidas cadastradas!
          </p>
        </div>

        {/* Action status */}
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-accent flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 animate-heartbeat text-accent" />
              Insight da Helozinha
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {debts.length === 0 
                ? "Parabéns, Helo! Você não tem dívidas cadastradas. Que tal focar 100% nas suas metas de investimento?"
                : `Se você direcionar R$ ${monthlyAllotment} mensais para suas dívidas, estará livre de todas em cerca de ${monthsToPayoff} meses, economizando juros!`
              }
            </p>
          </div>
          <div className="pt-4 border-t border-border/40 text-xs text-muted-foreground">
            Saldo em conta: <span className="font-semibold text-foreground">{formatBRL(dinheiroEmConta)}</span>
          </div>
        </div>
      </div>

      {/* Debts List */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
          📋 Suas Dívidas Ativas ({debts.length})
        </h3>
        
        {debts.length === 0 ? (
          <div className="bg-card border border-border p-12 text-center rounded-2xl">
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="text-sm font-semibold">Tudo limpo! Nenhuma dívida ativa no momento. 🎉</p>
            <p className="text-xs text-muted-foreground mt-1">Clique em "Nova Dívida" se precisar registrar um parcelamento ou empréstimo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {debts.map((debt) => {
              const paidAmount = debt.original_value - debt.current_value;
              const progressPercent = (paidAmount / debt.original_value) * 100;
              const installmentValue = debt.current_value / debt.remaining_installments;

              return (
                <div key={debt.id} className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4 relative hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-accent bg-primary/20 px-2 py-0.5 rounded-md">
                        {debt.creditor}
                      </span>
                      <h4 className="font-extrabold text-base mt-1.5">{debt.name}</h4>
                    </div>
                    <button 
                      onClick={() => deleteDebt(debt.id)}
                      className="p-1 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-muted transition-colors"
                      title="Excluir dívida"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-1 text-center bg-muted/20 border border-border rounded-xl">
                    <div>
                      <span className="text-[9px] text-muted-foreground block font-semibold">Saldo Devedor</span>
                      <span className="text-xs font-bold text-foreground">{formatBRL(debt.current_value)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-foreground block font-semibold">Juros Mensal</span>
                      <span className="text-xs font-bold text-foreground">{debt.interest_rate}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-foreground block font-semibold">Próx. Parcela</span>
                      <span className="text-xs font-bold text-accent">{formatBRL(installmentValue)}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{debt.remaining_installments} de {debt.total_installments} parcelas restantes</span>
                      <span className="font-bold">{progressPercent.toFixed(0)}% pago</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Vence em: {debt.due_date}
                    </span>
                    <button
                      onClick={() => handlePayInstallment(debt.id)}
                      className="px-3.5 py-1.5 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary-hover shadow-sm transition-colors text-xs"
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

      {/* Planejamento de Quitação Inteligente (Simulator) */}
      <div className="bg-card border border-border p-6 rounded-2xl space-y-6 shadow-sm">
        <div className="space-y-1">
          <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
            🧠 Simulador de Quitação Inteligente (Snowball vs Avalanche)
          </h3>
          <p className="text-xs text-muted-foreground">
            Ajuste quanto você pode economizar por mês exclusivamente para liquidar dívidas e veja as estimativas de tempo e economia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            {/* Slider */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase flex justify-between">
                <span>Valor Destinado p/ Mês</span>
                <span className="text-accent font-semibold">{formatBRL(monthlyAllotment)}</span>
              </label>
              <input 
                type="range" 
                min="100" 
                max="5000" 
                step="50"
                value={monthlyAllotment} 
                onChange={(e) => setMonthlyAllotment(parseInt(e.target.value))}
                className="w-full accent-accent bg-muted h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Method Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Método Preferencial</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPlanningMethod('avalanche')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    planningMethod === 'avalanche' 
                      ? 'border-accent bg-accent/5 text-accent' 
                      : 'border-border bg-transparent text-muted-foreground hover:bg-muted'
                  }`}
                >
                  🏔️ Avalanche
                </button>
                <button
                  onClick={() => setPlanningMethod('snowball')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    planningMethod === 'snowball' 
                      ? 'border-accent bg-accent/5 text-accent' 
                      : 'border-border bg-transparent text-muted-foreground hover:bg-muted'
                  }`}
                >
                  ❄️ Bola de Neve
                </button>
              </div>
            </div>
          </div>

          {/* Results column */}
          <div className="md:col-span-2 p-5 bg-muted/20 border border-border rounded-xl grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Meses para Quitação</span>
              <span className="text-2xl font-extrabold text-foreground block">
                {debts.length === 0 ? '0' : `${monthsToPayoff} meses`}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                {monthsToPayoff > 0 
                  ? `Previsão: ${new Date(new Date().setMonth(new Date().getMonth() + monthsToPayoff)).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
                  : 'Nenhuma dívida pendente.'
                }
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Economia Estimada de Juros</span>
              <span className="text-2xl font-extrabold text-green-600 dark:text-green-400 block">
                {debts.length === 0 || interestSaved <= 0 ? 'R$ 0,00' : formatBRL(interestSaved)}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                Comparado ao pagamento padrão.
              </span>
            </div>

            <div className="col-span-2 pt-3 border-t border-border text-xs text-muted-foreground">
              {planningMethod === 'avalanche' ? (
                <span>
                  <strong>🏔️ Método Avalanche:</strong> Quita primeiro as dívidas de <strong>juros mais altos</strong> (ex: {debts.sort((a,b) => b.interest_rate - a.interest_rate)[0]?.name || 'Empréstimo'}). Matematicamente mais eficiente, economizando mais juros.
                </span>
              ) : (
                <span>
                  <strong>❄️ Método Bola de Neve:</strong> Quita primeiro as dívidas de <strong>menor valor</strong> (ex: {debts.sort((a,b) => a.current_value - b.current_value)[0]?.name || 'Notebook'}). Excelente para motivação psicológica ao eliminar credores rapidamente.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Debt Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border flex justify-between items-center bg-muted/20">
              <h3 className="font-bold text-base flex items-center gap-2">
                💸 Cadastrar Nova Dívida
              </h3>
              <button 
                onClick={handleCloseModal}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Nome da Dívida *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Empréstimo Nubank"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Creditor (Instituição) *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Nubank"
                    value={creditor}
                    onChange={(e) => setCreditor(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Valor Inicial (R$) *</label>
                  <input 
                    type="number" 
                    placeholder="15000"
                    value={originalValue}
                    onChange={(e) => setOriginalValue(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Valor Restante (R$) *</label>
                  <input 
                    type="number" 
                    placeholder="8500"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Taxa de Juros (% a.m.)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="1.99"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Parcelas Totais *</label>
                  <input 
                    type="number" 
                    placeholder="24"
                    value={totalInstallments}
                    onChange={(e) => setTotalInstallments(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Restantes *</label>
                  <input 
                    type="number" 
                    placeholder="14"
                    value={remainingInstallments}
                    onChange={(e) => setRemainingInstallments(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Próximo Vencimento *</label>
                  <input 
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-border hover:bg-muted rounded-xl text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-bold shadow"
                >
                  Salvar Dívida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
