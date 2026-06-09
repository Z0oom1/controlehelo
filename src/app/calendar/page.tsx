'use client';

import React, { useState, useEffect } from 'react';
import { useFinanceState } from '@/context/FinanceContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  DollarSign, 
  CreditCard, 
  Sparkles,
  CheckCircle,
  X
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'debt' | 'goal';
  date: string; // YYYY-MM-DD
  institution?: string;
  isRealized?: boolean;
}

export default function CalendarPage() {
  const { 
    transactions, 
    debts, 
    goals, 
    bankConnections,
    profile,
    updateProfile
  } = useFinanceState();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 3)); // Fixed to June 2026 as current date
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [selectedDayString, setSelectedDayString] = useState<string>('');

  // Salary configuration state
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [salaryInput, setSalaryInput] = useState('');
  const [salaryDayInput, setSalaryDayInput] = useState('');
  const [salaryError, setSalaryError] = useState('');

  // Sync inputs when modal opens or profile changes
  useEffect(() => {
    if (showSalaryModal) {
      setSalaryInput(profile.salaryAmount?.toString() || '');
      setSalaryDayInput(profile.salaryDay?.toString() || '');
      setSalaryError('');
    }
  }, [showSalaryModal, profile]);

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Helper calendar grid logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Generate calendar events from state
  const getEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = [];

    // Salary Recurring Event
    if (profile && profile.salaryDay && profile.salaryAmount) {
      // Current month salary
      const currentSalaryDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(profile.salaryDay).padStart(2, '0')}`;
      events.push({
        id: `salary-current-${year}-${month}`,
        title: `Salário 💰`,
        amount: profile.salaryAmount,
        type: 'income',
        date: currentSalaryDateStr,
        isRealized: true
      });

      // Previous month salary (for padding dates)
      const prevMonthDate = new Date(year, month - 1, 1);
      const prevYear = prevMonthDate.getFullYear();
      const prevM = prevMonthDate.getMonth();
      const prevSalaryDateStr = `${prevYear}-${String(prevM + 1).padStart(2, '0')}-${String(profile.salaryDay).padStart(2, '0')}`;
      events.push({
        id: `salary-prev-${prevYear}-${prevM}`,
        title: `Salário 💰`,
        amount: profile.salaryAmount,
        type: 'income',
        date: prevSalaryDateStr,
        isRealized: true
      });

      // Next month salary (for padding dates)
      const nextMonthDate = new Date(year, month + 1, 1);
      const nextYear = nextMonthDate.getFullYear();
      const nextM = nextMonthDate.getMonth();
      const nextSalaryDateStr = `${nextYear}-${String(nextM + 1).padStart(2, '0')}-${String(profile.salaryDay).padStart(2, '0')}`;
      events.push({
        id: `salary-next-${nextYear}-${nextM}`,
        title: `Salário 💰`,
        amount: profile.salaryAmount,
        type: 'income',
        date: nextSalaryDateStr,
        isRealized: true
      });
    }

    // Transactions (excluding finished ones for clarity, showing pending)
    transactions.forEach(t => {
      events.push({
        id: `t-${t.id}`,
        title: t.description,
        amount: t.amount,
        type: t.type === 'expense' ? 'expense' : 'income',
        date: t.date,
        isRealized: t.is_realized
      });
    });

    // Debts
    debts.forEach(d => {
      events.push({
        id: `d-${d.id}`,
        title: `Parcela - ${d.name}`,
        amount: d.current_value / d.remaining_installments,
        type: 'debt',
        date: d.due_date,
        institution: d.creditor,
        isRealized: false
      });
    });

    // Credit card invoices from connected banks (sandbox mock at 20th of the month)
    bankConnections.forEach(b => {
      if (b.credit_card_invoice > 0) {
        events.push({
          id: `b-${b.id}`,
          title: `Fatura Cartão - ${b.bank_name}`,
          amount: b.credit_card_invoice,
          type: 'expense',
          date: '2026-06-20', // standard due date in our context
          institution: b.bank_name,
          isRealized: false
        });
      }
    });

    // Goals deadlines
    goals.forEach(g => {
      events.push({
        id: `g-${g.id}`,
        title: `Prazo: ${g.name}`,
        amount: g.target_value,
        type: 'goal',
        date: g.deadline,
        isRealized: g.current_value >= g.target_value
      });
    });

    return events;
  };

  const allEvents = getEvents();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Month stats calculations
  const totalDays = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday=0, Monday=1, etc.
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const days: { day: number; isCurrentMonth: boolean; dateString: string }[] = [];

  // Previous month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    const dateString = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ day: d, isCurrentMonth: false, dateString });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ day: i, isCurrentMonth: true, dateString });
  }

  // Next month padding
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    const dateString = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ day: i, isCurrentMonth: false, dateString });
  }

  const handleDayClick = (dayStr: string) => {
    const dayEvents = allEvents.filter(e => e.date === dayStr);
    setSelectedDayEvents(dayEvents);
    setSelectedDayString(dayStr);
  };

  return (
    <div className="space-y-6">
      
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Calendário Financeiro 📅</h1>
          <p className="text-sm text-muted-foreground">Monitore vencimentos de faturas, parcelas de empréstimos, ganhos e metas.</p>
        </div>
        <button 
          onClick={() => setShowSalaryModal(true)}
          className="px-4 py-2.5 bg-primary/20 text-accent hover:bg-primary/30 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm shrink-0"
        >
          ⚙️ Configurar Salário
        </button>
      </div>

      {/* Salary Suggestion Banner */}
      {(!profile.salaryDay || !profile.salaryAmount) && (
        <div className="bg-gradient-to-r from-accent/10 to-primary/10 border border-primary/20 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="space-y-1">
            <h4 className="font-bold text-xs text-accent">Dica: Adicione seu salário no calendário 🌸</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Defina o valor e o dia de recebimento do seu salário para que ele fique automaticamente marcado no calendário todos os meses.
            </p>
          </div>
          <button 
            onClick={() => setShowSalaryModal(true)}
            className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold transition-all shrink-0 shadow-sm"
          >
            Configurar Agora
          </button>
        </div>
      )}

      {/* Main Grid Calendar Card */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
        
        {/* Navigation Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-primary/20 text-accent rounded-xl">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <h2 className="text-base font-extrabold capitalize">{monthName}</h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={prevMonth}
              className="p-2 border border-border hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextMonth}
              className="p-2 border border-border hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Weekday Names */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-muted-foreground/80 uppercase pb-2 border-b border-border">
            <div>Dom</div>
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div>Sáb</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {days.map((item, idx) => {
              const dayEvents = allEvents.filter(e => e.date === item.dateString);
              const isToday = item.dateString === '2026-06-03'; // mock today

              return (
                <button
                  key={idx}
                  onClick={() => handleDayClick(item.dateString)}
                  className={`min-h-[70px] md:min-h-[85px] p-2 rounded-2xl border text-left flex flex-col justify-between transition-all relative hover:border-primary/50 group ${
                    item.isCurrentMonth 
                      ? 'bg-card border-border text-foreground' 
                      : 'bg-muted/10 border-border/30 text-muted-foreground/50'
                  } ${
                    isToday ? 'border-2 border-accent ring-2 ring-primary/30' : ''
                  }`}
                >
                  <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-accent text-white' : ''
                  }`}>
                    {item.day}
                  </span>

                  {/* Mini Event Dots/Lines */}
                  <div className="space-y-1 w-full mt-2">
                    {dayEvents.slice(0, 2).map((event, eventIdx) => {
                      let bgColor = 'bg-primary';
                      if (event.type === 'expense' || event.type === 'debt') bgColor = 'bg-red-400 dark:bg-red-600';
                      if (event.type === 'income') bgColor = 'bg-green-400 dark:bg-green-600';
                      if (event.type === 'goal') bgColor = 'bg-amber-400 dark:bg-amber-500';

                      return (
                        <div 
                          key={eventIdx}
                          className={`text-[8px] md:text-[9px] px-1 py-0.5 rounded font-semibold truncate text-white leading-tight ${bgColor}`}
                        >
                          {event.title.split(' ')[0]}: {formatBRL(event.amount)}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <div className="text-[8px] text-muted-foreground font-bold text-center">
                        + {dayEvents.length - 2} mais
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-border text-xs text-muted-foreground justify-center">
          <span className="flex items-center gap-1.5 font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-green-400 dark:bg-green-600" /> Receitas</span>
          <span className="flex items-center gap-1.5 font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-red-400 dark:bg-red-600" /> Contas & Dívidas</span>
          <span className="flex items-center gap-1.5 font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 dark:bg-amber-500" /> Metas de Investimento</span>
        </div>
      </div>

      {/* Day Events Detail Drawer/Modal */}
      {selectedDayString && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
              <h3 className="font-bold text-sm">
                📅 Agenda do Dia: {selectedDayString}
              </h3>
              <button 
                onClick={() => { setSelectedDayString(''); setSelectedDayEvents([]); }}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-80 overflow-y-auto space-y-3">
              {selectedDayEvents.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  Nenhum compromisso financeiro para este dia. 🌸
                </div>
              ) : (
                selectedDayEvents.map((event) => {
                  let badgeColor = 'bg-primary/20 text-accent';
                  if (event.type === 'expense' || event.type === 'debt') badgeColor = 'bg-red-100 text-red-500 dark:bg-red-950/20';
                  if (event.type === 'income') badgeColor = 'bg-green-100 text-green-600 dark:bg-green-950/20';

                  return (
                    <div 
                      key={event.id}
                      className="p-3 border border-border rounded-xl flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${badgeColor}`}>
                          {event.type}
                        </span>
                        <h4 className="font-bold text-xs mt-1 text-foreground leading-tight">
                          {event.title}
                        </h4>
                        {event.institution && (
                          <span className="text-[10px] text-muted-foreground block mt-0.5">Banco: {event.institution}</span>
                        )}
                      </div>
                      <span className={`font-extrabold text-sm ${
                        event.type === 'expense' || event.type === 'debt' ? 'text-red-500' : 'text-green-600'
                      }`}>
                        {formatBRL(event.amount)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Salary Configuration Modal */}
      {showSalaryModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                💰 Configurar Salário Recorrente
              </h3>
              <button 
                onClick={() => setShowSalaryModal(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const amount = parseFloat(salaryInput);
                const day = parseInt(salaryDayInput);
                if (isNaN(amount) || amount <= 0) {
                  setSalaryError('Por favor, informe um valor de salário válido.');
                  return;
                }
                if (isNaN(day) || day < 1 || day > 31) {
                  setSalaryError('Por favor, informe um dia do mês válido (1 a 31).');
                  return;
                }
                updateProfile({
                  ...profile,
                  salaryAmount: amount,
                  salaryDay: day
                });
                setShowSalaryModal(false);
              }}
              className="p-5 space-y-4 text-xs"
            >
              {salaryError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-500 font-semibold">
                  ⚠️ {salaryError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground">Valor do Salário (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="Ex: 5000.00"
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-accent"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground">Dia de Recebimento</label>
                <input 
                  type="number" 
                  min="1" 
                  max="31" 
                  placeholder="Ex: 5"
                  value={salaryDayInput}
                  onChange={(e) => setSalaryDayInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-accent"
                  required
                />
                <span className="text-[10px] text-muted-foreground block">
                  O salário será marcado neste dia em todos os meses do calendário.
                </span>
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button 
                  type="button"
                  onClick={() => setShowSalaryModal(false)}
                  className="px-4 py-2 border border-border hover:bg-muted rounded-xl font-semibold text-muted-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl font-bold transition-all shadow-sm"
                >
                  Salvar Configuração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
