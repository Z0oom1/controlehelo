'use client';

import React, { useEffect, useState } from 'react';
import { useFinanceState } from '@/context/FinanceContext';
import { 
  PiggyBank, 
  ChevronRight,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar
} from 'lucide-react';

export default function Dashboard() {
  const { 
    transactions, 
    caixinhas, 
    dinheiroEmConta,
    valorCaixinhas,
    totalDividas,
    totalFaturasAberto,
    totalInvestido,
    saldoLiquidoReal,
    profile,
    showValues,
    toggleShowValues
  } = useFinanceState();

  const [mounted, setMounted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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

  const recentTransactions = transactions.slice(0, 3);
  const activeCaixinhas = caixinhas.slice(0, 3);

  return (
    <div className="space-y-6">
      
      {/* Welcome Header */}
      <div className="flex flex-col justify-between items-start gap-1 py-2 select-none">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Olá, {profile.name || 'Helo'}
        </h1>
        <p className="text-xs text-muted-foreground">
          Bem-vindo ao seu painel financeiro pessoal.
        </p>
      </div>

      {/* Unified Asset Card */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Saldo Líquido Real</span>
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-black tracking-tight transition-all ${showValues ? 'text-accent' : 'text-muted-foreground'}`}>
                {displayBRL(saldoLiquidoReal)}
              </span>
              <button 
                onClick={toggleShowValues} 
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title={showValues ? "Ocultar Valores" : "Mostrar Valores"}
              >
                {showValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Seus ativos reais (Conta + Caixinhas) deduzidos de suas dívidas e faturas.
            </p>
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border hover:bg-muted rounded-xl text-xs font-bold text-foreground transition-all self-start sm:self-center cursor-pointer"
          >
            <span>{showDetails ? "Ocultar Detalhes" : "Ver Detalhes"}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Quick horizontal categories */}
        <div className="grid grid-cols-3 gap-4 pt-5 select-none">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Disponível</span>
            <span className="text-base font-bold text-foreground block">{displayBRL(dinheiroEmConta + valorCaixinhas)}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Comprometido</span>
            <span className="text-base font-bold text-red-500 block">{displayBRL(totalDividas + totalFaturasAberto)}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Investido</span>
            <span className="text-base font-bold text-blue-500 block">{displayBRL(totalInvestido)}</span>
          </div>
        </div>

        {/* Expandable full list */}
        {showDetails && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/60 animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="bg-muted/20 border border-border/50 p-3 rounded-2xl">
              <span className="text-[9px] font-bold text-muted-foreground uppercase block">Dinheiro em Conta</span>
              <span className="text-xs font-extrabold text-foreground block mt-1">{displayBRL(dinheiroEmConta)}</span>
            </div>
            <div className="bg-muted/20 border border-border/50 p-3 rounded-2xl">
              <span className="text-[9px] font-bold text-muted-foreground uppercase block">Nas Caixinhas</span>
              <span className="text-xs font-extrabold text-foreground block mt-1">{displayBRL(valorCaixinhas)}</span>
            </div>
            <div className="bg-muted/20 border border-border/50 p-3 rounded-2xl">
              <span className="text-[9px] font-bold text-muted-foreground uppercase block">Dívidas</span>
              <span className="text-xs font-extrabold text-red-500 block mt-1">{displayBRL(totalDividas)}</span>
            </div>
            <div className="bg-muted/20 border border-border/50 p-3 rounded-2xl">
              <span className="text-[9px] font-bold text-muted-foreground uppercase block">Faturas em Aberto</span>
              <span className="text-xs font-extrabold text-amber-600 block mt-1">{displayBRL(totalFaturasAberto)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Transactions list */}
        <div className="bg-card border border-border p-6 rounded-3xl flex flex-col justify-between shadow-sm min-h-[300px]">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-foreground tracking-tight select-none">
              Últimas Transações
            </h3>
            
            <div className="divide-y divide-border/60">
              {recentTransactions.map((t) => {
                const isExpense = t.type === 'expense';
                const icon = getCategoryIcon(t.category, t.type);
                return (
                  <div key={t.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-lg bg-muted/50 border border-border/40 flex items-center justify-center text-sm shrink-0">
                        {icon}
                      </span>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-foreground block truncate max-w-[150px] sm:max-w-xs">{t.description}</span>
                        <span className="text-[9px] text-muted-foreground block">{t.date} • {t.category}</span>
                      </div>
                    </div>
                    <span className={`text-xs font-black shrink-0 ${isExpense ? 'text-red-500' : 'text-green-600'}`}>
                      {isExpense ? '-' : '+'} {displayBRL(t.amount)}
                    </span>
                  </div>
                );
              })}

              {recentTransactions.length === 0 && (
                <p className="text-xs text-muted-foreground py-8 text-center select-none">Nenhum lançamento recente registrado.</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex justify-end">
            <a href="/transactions" className="text-[11px] text-accent font-bold flex items-center gap-1 hover:underline select-none">
              Ver extrato completo <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Caixinhas list */}
        <div className="bg-card border border-border p-6 rounded-3xl flex flex-col justify-between shadow-sm min-h-[300px]">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-foreground tracking-tight select-none">
              Caixinhas Guardadas
            </h3>
            
            <div className="space-y-3.5">
              {activeCaixinhas.map((box) => {
                const progress = (box.current_value / box.target_value) * 100;
                return (
                  <div key={box.id} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold flex items-center gap-1 text-foreground">
                        <span className="w-5 h-5 rounded bg-muted/65 flex items-center justify-center text-sm">{box.icon}</span> 
                        {box.name}
                      </span>
                      <span className="text-muted-foreground font-bold">
                        {displayBRL(box.current_value)}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1">
                      <div 
                        className="h-1 rounded-full transition-all" 
                        style={{ 
                          width: `${Math.min(100, progress)}%`,
                          backgroundColor: box.color 
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {activeCaixinhas.length === 0 && (
                <p className="text-xs text-muted-foreground py-8 text-center select-none">Nenhuma caixinha de economia registrada.</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex justify-end">
            <a href="/caixinhas" className="text-[11px] text-accent font-bold flex items-center gap-1 hover:underline select-none">
              Ver todas as caixinhas <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>

    </div>
  );
}
