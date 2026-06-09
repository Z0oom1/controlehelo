'use client';

import React, { useEffect, useState } from 'react';
import { useFinanceState } from '@/context/FinanceContext';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  CreditCard, 
  DollarSign, 
  Sparkles, 
  ChevronRight,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Dashboard() {
  const { 
    transactions, 
    debts, 
    goals, 
    caixinhas, 
    bankConnections,
    dinheiroEmConta,
    valorCaixinhas,
    totalDividas,
    totalFaturasAberto,
    totalInvestido,
    patrimonioAtual,
    saldoLiquidoReal,
    profile
  } = useFinanceState();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format currency helpers
  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Main goal details
  const mainGoal = goals.find(g => g.priority === 'high') || goals[0];
  const targetRemaining = mainGoal ? Math.max(0, mainGoal.target_value - mainGoal.current_value) : 0;

  // Compute income vs expenses for the chart
  const realizedIncome = transactions
    .filter(t => t.type === 'income' && t.is_realized)
    .reduce((acc, t) => acc + t.amount, 0);

  const realizedExpense = transactions
    .filter(t => t.type === 'expense' && t.is_realized)
    .reduce((acc, t) => acc + t.amount, 0);

  const averageSavings = Math.max(500, realizedIncome - realizedExpense);

  const monthsToTarget = averageSavings > 0 && targetRemaining > 0
    ? Math.ceil(targetRemaining / averageSavings)
    : 0;

  // Projections
  const proj3Months = patrimonioAtual + averageSavings * 3;
  const proj6Months = patrimonioAtual + averageSavings * 6;
  const proj12Months = patrimonioAtual + averageSavings * 12;

  // Recharts mock monthly data
  const monthlyFlowData = [
    { name: 'Jan', Entradas: 4800, Saídas: 3100 },
    { name: 'Fev', Entradas: 5200, Saídas: 4200 },
    { name: 'Mar', Entradas: 5000, Saídas: 3500 },
    { name: 'Abr', Entradas: 6000, Saídas: 3800 },
    { name: 'Mai', Entradas: 6500, Saídas: 4100 },
    { name: 'Jun', Entradas: realizedIncome || 6700, Saídas: realizedExpense || 4300 }
  ];

  // Recharts category data
  const categoriesMap: { [key: string]: number } = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoriesMap[t.category] = (categoriesMap[t.category] || 0) + t.amount;
    });

  const categoryData = Object.keys(categoriesMap).map(name => ({
    name,
    value: categoriesMap[name]
  })).slice(0, 5);

  const COLORS = ['#FFB7C5', '#FF4D6D', '#E8D7F1', '#A2D2FF', '#F5B041'];

  // Quick advice from Helozinha based on state
  const getHelozinhaInsight = () => {
    if (totalDividas > patrimonioAtual) {
      return `Oi Helo! ❤️ Vejo que o valor de suas dívidas está alto hoje. Que tal usar o módulo de Planejamento na aba Dívidas para focarmos em quitar a de juros maiores?`;
    }
    if (dinheiroEmConta > 2000) {
      return `Oi Helo! ❤️ Seu saldo em conta está muito bom (R$ ${dinheiroEmConta.toFixed(2)}). Que tal guardar R$ 500,00 na caixinha "${caixinhas[0]?.name || 'Reserva'}" hoje?`;
    }
    return `Oi Helo! ❤️ Suas caixinhas estão rendendo e sua meta "${mainGoal?.name}" está ${((mainGoal?.current_value / mainGoal?.target_value) * 100).toFixed(0)}% concluída! Continue firme!`;
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Card & Helozinha Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-r from-primary/30 to-secondary/30 border border-border p-6 rounded-2xl flex items-center justify-between relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 dark:bg-card/60 text-xs font-bold text-accent shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Resumo do Dia</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Olá, {profile.name || 'Helo'}! ❤️
            </h1>
            <p className="text-sm text-muted-foreground max-w-md">
              Seu painel financeiro está atualizado. Hoje você tem {bankConnections.length} contas bancárias cadastradas.
            </p>
          </div>
          <div className="hidden sm:block absolute right-4 bottom-0 w-36 h-36 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent rounded-full blur-xl" />
          <div className="w-14 h-14 rounded-full bg-white dark:bg-card flex items-center justify-center text-3xl shadow-sm animate-float">
            🌸
          </div>
        </div>

        {/* Helozinha Assistant Widget */}
        <div className="bg-card border border-border p-5 rounded-2xl flex gap-4 items-start shadow-sm transition-transform hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-2xl text-white shadow-md shrink-0 select-none">
            🤖
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-accent flex items-center gap-1">
              Helozinha ❤️
              <span className="text-[10px] bg-primary/20 text-accent px-1.5 py-0.5 rounded-md font-normal">Assistente</span>
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              "{getHelozinhaInsight()}"
            </p>
          </div>
        </div>
      </div>

      {/* General Resume Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Net Worth */}
        <div className="col-span-2 md:col-span-2 bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-primary/40 p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Saldo Líquido Real</span>
            <div className="p-2 rounded-xl bg-accent text-white shadow">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-accent">
              {formatBRL(saldoLiquidoReal)}
            </span>
            <p className="text-xs text-muted-foreground">
              Total de Ativos - Dívidas e Faturas
            </p>
          </div>
        </div>

        {/* Account Balance */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Disponível em Conta</span>
            <div className="p-2 rounded-xl bg-primary/20 text-accent">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-xl md:text-2xl font-bold tracking-tight">
              {formatBRL(dinheiroEmConta)}
            </span>
            <p className="text-[10px] text-muted-foreground">
              Saldos em conta + conexões
            </p>
          </div>
        </div>

        {/* Caixinhas Savings */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nas Caixinhas</span>
            <div className="p-2 rounded-xl bg-secondary/30 text-accent">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-xl md:text-2xl font-bold tracking-tight">
              {formatBRL(valorCaixinhas)}
            </span>
            <p className="text-[10px] text-muted-foreground">
              Reserva de emergência e metas
            </p>
          </div>
        </div>

        {/* Total Debts */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total de Dívidas</span>
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/30 text-red-500">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-xl md:text-2xl font-bold tracking-tight text-red-500">
              {formatBRL(totalDividas)}
            </span>
            <p className="text-[10px] text-muted-foreground">
              Empréstimos e parcelamentos
            </p>
          </div>
        </div>

        {/* Faturas em Aberto */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Faturas em Aberto</span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/30 text-amber-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-xl md:text-2xl font-bold tracking-tight text-amber-600">
              {formatBRL(totalFaturasAberto)}
            </span>
            <p className="text-[10px] text-muted-foreground">
              Vencimento dos cartões
            </p>
          </div>
        </div>

        {/* Investments */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Investido</span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/30 text-blue-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-xl md:text-2xl font-bold tracking-tight text-blue-500">
              {formatBRL(totalInvestido)}
            </span>
            <p className="text-[10px] text-muted-foreground">
              Fundos e renda fixa
            </p>
          </div>
        </div>

        {/* Patrimonio bruto */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Patrimônio Bruto</span>
            <div className="p-2 rounded-xl bg-green-100 dark:bg-green-950/30 text-green-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-xl md:text-2xl font-bold tracking-tight text-green-600">
              {formatBRL(patrimonioAtual)}
            </span>
            <p className="text-[10px] text-muted-foreground">
              Total bruto de ativos
            </p>
          </div>
        </div>
      </div>

      {/* Projections & Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Indicators */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl space-y-5">
          <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
            🎯 Indicadores & Metas
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Meta Quitar Dívidas */}
            <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-muted-foreground">Falta para quitar dívidas</span>
                <span className="text-red-500 font-semibold">{formatBRL(totalDividas + totalFaturasAberto)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all" 
                  style={{ width: `${Math.max(5, Math.min(100, (valorCaixinhas / (totalDividas || 1)) * 100))}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Suas caixinhas cobrem {((valorCaixinhas / (totalDividas || 1)) * 100).toFixed(0)}% do seu saldo devedor.
              </p>
            </div>

            {/* Meta Principal */}
            {mainGoal && (
              <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground">Meta: {mainGoal.name}</span>
                  <span className="text-accent font-semibold">{((mainGoal.current_value / mainGoal.target_value) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-accent h-2 rounded-full transition-all" 
                    style={{ width: `${(mainGoal.current_value / mainGoal.target_value) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Falta: {formatBRL(targetRemaining)}</span>
                  <span>{monthsToTarget > 0 ? `Est. ${monthsToTarget} meses` : 'Concluído'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Projeção Patrimônio Futuro */}
          <div className="pt-2 border-t border-border">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Projeções de Patrimônio Futuro (Economizando {formatBRL(averageSavings)}/mês)
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-primary/5 border border-border rounded-xl text-center">
                <span className="text-[10px] text-muted-foreground font-semibold block">Próximos 3 Meses</span>
                <span className="text-sm font-extrabold text-foreground block mt-1">{formatBRL(proj3Months)}</span>
              </div>
              <div className="p-3 bg-primary/10 border border-border rounded-xl text-center">
                <span className="text-[10px] text-muted-foreground font-semibold block">Próximos 6 Meses</span>
                <span className="text-sm font-extrabold text-foreground block mt-1">{formatBRL(proj6Months)}</span>
              </div>
              <div className="p-3 bg-accent/5 border border-primary/30 rounded-xl text-center">
                <span className="text-[10px] text-accent font-bold block">Próximos 12 Meses</span>
                <span className="text-sm font-extrabold text-accent block mt-1">{formatBRL(proj12Months)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Progress visual */}
        <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-base tracking-tight">🌸 Suas Caixinhas</h3>
            <div className="space-y-3.5">
              {caixinhas.slice(0, 3).map((box) => (
                <div key={box.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold flex items-center gap-1">
                      <span>{box.icon}</span> {box.name}
                    </span>
                    <span className="text-muted-foreground font-medium">
                      {formatBRL(box.current_value)} / {formatBRL(box.target_value)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div 
                      className="h-1.5 rounded-full transition-all" 
                      style={{ 
                        width: `${(box.current_value / box.target_value) * 100}%`,
                        backgroundColor: box.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex justify-end">
            <a href="/caixinhas" className="text-xs text-accent font-bold flex items-center gap-1 hover:underline">
              Ver todas as caixinhas <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Recharts Graphs section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Income vs Expenses Graph */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
              📊 Fluxo de Caixa (Últimos 6 meses)
            </h3>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-primary"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Receitas</span>
              <span className="flex items-center gap-1.5 font-semibold text-accent"><span className="w-2.5 h-2.5 rounded-full bg-accent" /> Despesas</span>
            </div>
          </div>

          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyFlowData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFB7C5" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#FFB7C5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF4D6D" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#FF4D6D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      borderColor: 'var(--border)',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }} 
                  />
                  <Area type="monotone" dataKey="Entradas" stroke="#FFB7C5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEntradas)" />
                  <Area type="monotone" dataKey="Saídas" stroke="#FF4D6D" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSaidas)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-muted/20 animate-pulse rounded-xl" />
            )}
          </div>
        </div>

        {/* Expenses by Category Graph */}
        <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-base tracking-tight">
            🍕 Gastos por Categoria
          </h3>
          <div className="h-56 w-full flex items-center justify-center">
            {mounted ? (
              categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => formatBRL(Number(value || 0))}
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        borderColor: 'var(--border)',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-muted-foreground text-center">Nenhum gasto registrado este mês. 🌸</div>
              )
            ) : (
              <div className="h-full w-full bg-muted/20 animate-pulse rounded-xl" />
            )}
          </div>

          {/* Legend */}
          <div className="space-y-1.5">
            {mounted && categoryData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="font-medium">{entry.name}</span>
                </span>
                <span className="text-muted-foreground font-bold">{formatBRL(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
