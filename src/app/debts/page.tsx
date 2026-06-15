'use client';

import React, { useState, useEffect } from 'react';
import { useFinanceState } from '@/context/FinanceContext';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Sparkles, 
  Calendar, 
  ChevronDown,
  ChevronUp,
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
    dinheiroEmConta,
    showValues
  } = useFinanceState();

  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

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
  
  const timeDifference = Math.max(0, standardTime - monthsToPayoff);
  const interestSaved = totalRemainingDebts * (estimatedInterestRate / 100) * (timeDifference / 12);

  return (
    <div className="space-y-6">
      
      {/* Header with quick stats */}
      <div className="bg-card border border-border p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-6">
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
          className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-103 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nova Dívida
        </button>
      </div>

      {/* Progress & Insight Bar */}
      <div className="bg-card border border-border p-5 rounded-3xl shadow-sm space-y-3.5">
        <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
          <span>PROCESSO GERAL DE QUITAÇÃO</span>
          <span className="text-accent">{generalProgress.toFixed(0)}% Concluído</span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-accent h-2 rounded-full transition-all duration-500" 
            style={{ width: `${generalProgress}%` }}
          />
        </div>

        {/* Compact Helozinha Insight Banner */}
        <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-2xl select-none">
          <span className="text-xl animate-float">🌸</span>
          <div className="space-y-0.5">
            <span className="text-[9px] font-extrabold text-accent uppercase tracking-wider block">Análise da Helozinha</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {debts.length === 0 
                ? "Parabéns, Helo! Nenhuma dívida ativa cadastrada. Foco total em caixinhas e investimentos!"
                : `Se poupar R$ ${monthlyAllotment} mensais para quitação acelerada, estará livre de todas em cerca de ${monthsToPayoff} meses.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Active Debts Grid */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
          📋 Suas Dívidas Ativas ({debts.length})
        </h3>
        
        {debts.length === 0 ? (
          <div className="bg-card border border-border p-12 text-center rounded-3xl shadow-sm text-muted-foreground">
            <CheckCircle className="w-10 h-10 text-primary mx-auto mb-2" />
            <p className="text-sm font-semibold">Tudo quitado! Nenhuma dívida ativa no momento. 🎉</p>
            <p className="text-xs mt-1">Clique em "Nova Dívida" se precisar parcelar compras de longo prazo.</p>
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
                    <button 
                      onClick={() => deleteDebt(debt.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-muted transition-all cursor-pointer"
                      title="Excluir dívida"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

      {/* Collapsible payoff simulator */}
      {debts.length > 0 && (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          {/* Header Toggle */}
          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className="w-full p-5 flex items-center justify-between bg-muted/20 border-b border-border/50 hover:bg-muted/30 transition-all font-extrabold text-sm text-foreground select-none cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              🧠 Simulador de Quitação Inteligente (Avalanche vs Bola de Neve)
            </span>
            {showSimulator ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showSimulator && (
            <div className="p-6 space-y-6 text-xs animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Inputs */}
                <div className="space-y-4">
                  <div className="space-y-2 select-none">
                    <label className="font-bold text-muted-foreground uppercase text-[9px] tracking-wider flex justify-between">
                      <span>Aporte Mensal Extra</span>
                      <span className="text-accent font-semibold">{formatBRL(monthlyAllotment)}</span>
                    </label>
                    <input 
                      type="range" 
                      min="100" 
                      max="5000" 
                      step="50"
                      value={monthlyAllotment} 
                      onChange={(e) => setMonthlyAllotment(parseInt(e.target.value))}
                      className="w-full accent-accent bg-muted h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2 select-none">
                    <label className="font-bold text-muted-foreground uppercase text-[9px] tracking-wider block">Método de Quitação</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPlanningMethod('avalanche')}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          planningMethod === 'avalanche' 
                            ? 'border-accent bg-accent/5 text-accent' 
                            : 'border-border bg-transparent text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        🏔️ Avalanche
                      </button>
                      <button
                        onClick={() => setPlanningMethod('snowball')}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
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

                {/* Projections Display */}
                <div className="md:col-span-2 p-5 bg-muted/20 border border-border/80 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Tempo Estimado p/ Quitação</span>
                    <span className="text-xl font-black text-foreground block">
                      {debts.length === 0 ? '0' : `${monthsToPayoff} meses`}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      {monthsToPayoff > 0 
                        ? `Previsão: ${new Date(new Date().setMonth(new Date().getMonth() + monthsToPayoff)).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
                        : 'Sem parcelamentos pendentes.'
                      }
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Economia de Juros Estimada</span>
                    <span className="text-xl font-black text-green-600 dark:text-green-400 block">
                      {debts.length === 0 || interestSaved <= 0 ? 'R$ 0,00' : formatBRL(interestSaved)}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Em comparação ao pagamento mínimo das parcelas.
                    </span>
                  </div>

                  <div className="sm:col-span-2 pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                    {planningMethod === 'avalanche' ? (
                      <span>
                        <strong>🏔️ Método Avalanche:</strong> Foca em liquidar primeiro a dívida de <strong>juros mais altos</strong> (ex: {debts.sort((a,b) => b.interest_rate - a.interest_rate)[0]?.name || 'Empréstimos'}). Este é o método matematicamente mais vantajoso, pois reduz o pagamento total de juros.
                      </span>
                    ) : (
                      <span>
                        <strong>❄️ Método Bola de Neve:</strong> Foca em liquidar primeiro a dívida de <strong>menor valor absoluto</strong> (ex: {debts.sort((a,b) => a.current_value - b.current_value)[0]?.name || 'Fatura'}). Este método visa a motivação psicológica rápida, eliminando contas uma a uma de forma veloz.
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Debt Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border flex justify-between items-center bg-muted/20 select-none">
              <h3 className="font-extrabold text-sm flex items-center gap-1.5 text-accent">
                💸 Cadastrar Nova Dívida / Financiamento
              </h3>
              <button 
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground">Nome da Dívida *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Financiamento Carro"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-accent text-foreground"
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground">Instituição Credora *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Santander"
                    value={creditor}
                    onChange={(e) => setCreditor(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-accent text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground">Valor Inicial (R$) *</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 15000"
                    value={originalValue}
                    onChange={(e) => setOriginalValue(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-accent text-foreground"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground">Valor Restante (R$) *</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 8500"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-accent font-bold text-foreground"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground">Juros (% a.m.)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="Ex: 1.99"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-accent text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground">Parcelas Totais *</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 24"
                    value={totalInstallments}
                    onChange={(e) => setTotalInstallments(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-accent text-foreground"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground">Restantes *</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 14"
                    value={remainingInstallments}
                    onChange={(e) => setRemainingInstallments(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-accent text-foreground"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground">Próx. Vencimento *</label>
                  <input 
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-accent text-foreground"
                    required
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-border flex justify-end gap-2.5 select-none">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-border hover:bg-muted rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl font-bold shadow-sm transition-all cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
