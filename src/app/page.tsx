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
  ShieldCheck,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
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
    profile,
    showValues,
    toggleShowValues
  } = useFinanceState();

  const [mounted, setMounted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showProjections, setShowProjections] = useState(false);
  const [activeChart, setActiveChart] = useState<'flow' | 'categories'>('flow');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format currency helpers
  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const displayBRL = (val: number) => {
    if (!showValues) return 'R$ ••••••';
    return formatBRL(val);
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
      return `Oi Helo! ❤️ Vejo que o valor de suas dívidas está alto hoje. Que tal usar o módulo de Planejamento na aba Dívidas para quitarmos o quanto antes?`;
    }
    if (dinheiroEmConta > 2000) {
      return `Oi Helo! ❤️ Seu saldo em conta está excelente! Que tal poupar R$ 500,00 na caixinha "${caixinhas[0]?.name || 'Reserva'}" hoje?`;
    }
    return `Oi Helo! ❤️ Suas caixinhas estão rendendo e sua meta "${mainGoal?.name || 'Futuro'}" continua evoluindo. Continue firme!`;
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-br from-primary/10 to-secondary/10 border border-border p-6 rounded-3xl gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-card/80 text-[10px] font-bold text-accent shadow-sm">
            <Sparkles className="w-3 h-3" />
            <span>Resumo de Hoje</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Olá, {profile.name || 'Helo'}! ❤️
          </h1>
          <p className="text-xs text-muted-foreground">
            Hoje você possui {bankConnections.length} conexões de contas ativas.
          </p>
        </div>

        {/* Compact Helozinha Advice Banner */}
        <div className="flex items-center gap-3 bg-card border border-border p-3.5 rounded-2xl max-w-md shadow-sm">
          <span className="text-2xl shrink-0 animate-float select-none">🌸</span>
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold text-accent uppercase tracking-wider block">Helozinha ❤️</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              "{getHelozinhaInsight()}"
            </p>
          </div>
        </div>
      </div>

      {/* Unified Asset Card */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Saldo Líquido Real</span>
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-black tracking-tight transition-all ${showValues ? 'text-accent' : 'text-muted-foreground'}`}>
                {displayBRL(saldoLiquidoReal)}
              </span>
              <button 
                onClick={toggleShowValues} 
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title={showValues ? "Ocultar Valores" : "Mostrar Valores"}
              >
                {showValues ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Seus ativos reais (Conta + Caixinhas) deduzidos de suas dívidas e faturas.
            </p>
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-border hover:bg-muted rounded-xl text-xs font-bold text-foreground transition-all self-start md:self-center"
          >
            <span>{showDetails ? "Ocultar Detalhes" : "Ver Detalhamento"}</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick horizontal categories */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Disponível</span>
            <span className="text-lg font-bold text-foreground block">{displayBRL(dinheiroEmConta + valorCaixinhas)}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Comprometido</span>
            <span className="text-lg font-bold text-red-500 block">{displayBRL(totalDividas + totalFaturasAberto)}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Investido</span>
            <span className="text-lg font-bold text-blue-500 block">{displayBRL(totalInvestido)}</span>
          </div>
        </div>

        {/* Expandable full list */}
        {showDetails && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/60 animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="bg-muted/20 border border-border/50 p-3.5 rounded-2xl">
              <span className="text-[9px] font-bold text-muted-foreground uppercase block">Dinheiro em Conta</span>
              <span className="text-sm font-extrabold text-foreground block mt-1">{displayBRL(dinheiroEmConta)}</span>
            </div>
            <div className="bg-muted/20 border border-border/50 p-3.5 rounded-2xl">
              <span className="text-[9px] font-bold text-muted-foreground uppercase block">Nas Caixinhas</span>
              <span className="text-sm font-extrabold text-foreground block mt-1">{displayBRL(valorCaixinhas)}</span>
            </div>
            <div className="bg-muted/20 border border-border/50 p-3.5 rounded-2xl">
              <span className="text-[9px] font-bold text-muted-foreground uppercase block">Dívidas Cadastradas</span>
              <span className="text-sm font-extrabold text-red-500 block mt-1">{displayBRL(totalDividas)}</span>
            </div>
            <div className="bg-muted/20 border border-border/50 p-3.5 rounded-2xl">
              <span className="text-[9px] font-bold text-muted-foreground uppercase block">Faturas em Aberto</span>
              <span className="text-sm font-extrabold text-amber-600 block mt-1">{displayBRL(totalFaturasAberto)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Projections & Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Indicators */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-3xl space-y-5 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-2">
              🎯 Metas & Indicadores
            </h3>
            
            <button
              onClick={() => setShowProjections(!showProjections)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-accent hover:underline"
            >
              <span>{showProjections ? "Ocultar Projeções" : "Ver Projeções"}</span>
              {showProjections ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Meta Quitar Dívidas */}
            <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-muted-foreground">Cobertura de Dívidas</span>
                <span className="text-red-500 font-semibold">{displayBRL(totalDividas + totalFaturasAberto)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div 
                  className="bg-red-500 h-1.5 rounded-full transition-all" 
                  style={{ width: `${Math.max(5, Math.min(100, (valorCaixinhas / (totalDividas || 1)) * 100))}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Suas caixinhas cobrem {((valorCaixinhas / (totalDividas || 1)) * 100).toFixed(0)}% das suas dívidas.
              </p>
            </div>

            {/* Meta Principal */}
            {mainGoal && (
              <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground">Meta: {mainGoal.name}</span>
                  <span className="text-accent font-semibold">{((mainGoal.current_value / mainGoal.target_value) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className="bg-accent h-1.5 rounded-full transition-all" 
                    style={{ width: `${(mainGoal.current_value / mainGoal.target_value) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Falta: {displayBRL(targetRemaining)}</span>
                  <span>{monthsToTarget > 0 ? `Est. ${monthsToTarget} meses` : 'Concluído'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Collapsible projections */}
          {showProjections && (
            <div className="pt-4 border-t border-border/60 animate-in fade-in slide-in-from-top-3 duration-200">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Previsão de Patrimônio (guardando {displayBRL(averageSavings)}/mês)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-primary/10 border border-border rounded-2xl text-center">
                  <span className="text-[9px] text-muted-foreground font-semibold block">3 meses</span>
                  <span className="text-xs font-extrabold text-foreground block mt-1">{displayBRL(proj3Months)}</span>
                </div>
                <div className="p-3 bg-primary/10 border border-border rounded-2xl text-center">
                  <span className="text-[9px] text-muted-foreground font-semibold block">6 meses</span>
                  <span className="text-xs font-extrabold text-foreground block mt-1">{displayBRL(proj6Months)}</span>
                </div>
                <div className="p-3 bg-accent/5 border border-primary/20 rounded-2xl text-center">
                  <span className="text-[9px] text-accent font-bold block">12 meses</span>
                  <span className="text-xs font-extrabold text-accent block mt-1">{displayBRL(proj12Months)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Goals Progress visual */}
        <div className="bg-card border border-border p-6 rounded-3xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm tracking-tight">🌸 Suas Caixinhas</h3>
            <div className="space-y-3">
              {caixinhas.slice(0, 3).map((box) => (
                <div key={box.id} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold flex items-center gap-1">
                      <span>{box.icon}</span> {box.name}
                    </span>
                    <span className="text-muted-foreground font-medium">
                      {displayBRL(box.current_value)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div 
                      className="h-1 rounded-full transition-all" 
                      style={{ 
                        width: `${(box.current_value / box.target_value) * 100}%`,
                        backgroundColor: box.color 
                      }}
                    />
                  </div>
                </div>
              ))}
              {caixinhas.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">Nenhuma caixinha cadastrada. 🌸</p>
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex justify-end">
            <a href="/caixinhas" className="text-[11px] text-accent font-bold flex items-center gap-1 hover:underline">
              Ver todas as caixinhas <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Analytics Graph Toggles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graph Area */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-3xl space-y-5 flex flex-col justify-between min-h-[350px]">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-2">
              📊 Análise Financeira
            </h3>
            
            {/* Tab Selectors */}
            <div className="inline-flex p-1 bg-muted rounded-xl text-xs self-start sm:self-auto select-none">
              <button
                onClick={() => setActiveChart('flow')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeChart === 'flow' 
                    ? 'bg-card text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Fluxo de Caixa
              </button>
              <button
                onClick={() => setActiveChart('categories')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeChart === 'categories' 
                    ? 'bg-card text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Gastos por Categoria
              </button>
            </div>
          </div>

          {activeChart === 'flow' ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="flex gap-4 text-[10px] justify-end">
                <span className="flex items-center gap-1.5 font-semibold text-primary"><span className="w-2 h-2 rounded-full bg-primary" /> Receitas</span>
                <span className="flex items-center gap-1.5 font-semibold text-accent"><span className="w-2 h-2 rounded-full bg-accent" /> Despesas</span>
              </div>

              <div className="h-60 w-full">
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
                      <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center flex-1 pt-2">
              <div className="h-48 w-full flex items-center justify-center">
                {mounted ? (
                  categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
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
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {mounted && categoryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="font-semibold text-foreground truncate max-w-[120px]">{entry.name}</span>
                    </span>
                    <span className="text-muted-foreground font-bold">{displayBRL(entry.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick advice/alerts right column */}
        <div className="bg-card border border-border p-6 rounded-3xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm tracking-tight">🔔 Lembretes Ativos</h3>
            <div className="space-y-3.5 text-xs text-muted-foreground">
              {debts.filter(d => d.remaining_installments > 0).slice(0, 2).map((d) => (
                <div key={d.id} className="p-3 bg-muted/20 border border-border/60 rounded-2xl flex items-center gap-3">
                  <span className="text-lg">💸</span>
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground block leading-tight">{d.name}</span>
                    <span className="text-[10px] block">Vence em: {d.due_date} • {displayBRL(d.current_value / d.remaining_installments)}</span>
                  </div>
                </div>
              ))}
              {debts.filter(d => d.remaining_installments > 0).length === 0 && (
                <div className="p-4 text-center bg-muted/10 border border-dashed border-border rounded-2xl">
                  <span className="block text-lg mb-1">🎉</span>
                  <span className="text-[11px] font-semibold text-foreground block">Tudo em dia!</span>
                  <span className="text-[10px] block mt-0.5">Você não possui parcelamentos pendentes.</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-4 flex justify-end">
            <a href="/calendar" className="text-[11px] text-accent font-bold flex items-center gap-1 hover:underline">
              Ver Agenda Financeira <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
