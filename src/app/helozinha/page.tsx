'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFinanceState } from '@/context/FinanceContext';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  TrendingUp, 
  AlertCircle,
  Clock,
  PiggyBank
} from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'helozinha';
  text: string;
  timestamp: string;
}

export default function HelozinhaPage() {
  const { 
    dinheiroEmConta, 
    valorCaixinhas, 
    totalDividas, 
    goals, 
    caixinhas, 
    transactions 
  } = useFinanceState();

  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      sender: 'helozinha', 
      text: 'Oi Helo! ❤️ Sou a Helozinha, sua assistente de inteligência financeira pessoal. Como posso te ajudar a organizar seu dinheiro hoje?', 
      timestamp: '14:20' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickPrompts = [
    'Qual o meu saldo líquido real? 💰',
    'Como estão minhas dívidas? 💸',
    'Dê conselhos para esta semana 🌸',
    'Como estão minhas metas? 🎯'
  ];

  // Helper logic to build context-aware replies
  const generateReply = (query: string): string => {
    const q = query.toLowerCase();

    // Saldo
    if (q.includes('saldo') || q.includes('dinheiro') || q.includes('quanto tenho')) {
      const totalActives = dinheiroEmConta + valorCaixinhas;
      return `Helo, analisando suas contas agora, você tem um saldo disponível de **${formatBRL(dinheiroEmConta)}** e mais **${formatBRL(valorCaixinhas)}** guardado nas Caixinhas, totalizando **${formatBRL(totalActives)}** em ativos líquidos. Seu saldo líquido real (ativos menos dívidas) é de **${formatBRL(totalActives - totalDividas)}**!`;
    }

    // Dividas
    if (q.includes('dívida') || q.includes('divida') || q.includes('devedor') || q.includes('devo')) {
      if (totalDividas === 0) {
        return 'Ótimas notícias, Helo! Você não possui nenhuma dívida ativa cadastrada no momento. Todo o seu excedente pode ser direcionado para investimento!';
      }
      const sortedDebts = [...caixinhas].sort((a,b) => b.current_value - a.current_value);
      return `Atualmente, você tem um total de **${formatBRL(totalDividas)}** em dívidas parceladas de longo prazo. A maior delas está sob o credor. Se você destinar R$ 500/mês para quitá-las, você estará livre de todas em cerca de **${Math.ceil(totalDividas / 500)} meses**!`;
    }

    // Metas
    if (q.includes('meta') || q.includes('objetivo') || q.includes('prazo')) {
      if (goals.length === 0) {
        return 'Você ainda não cadastrou metas. Crie uma meta clicando nas abas para que eu possa acompanhar seu progresso!';
      }
      const highPriority = goals.find(g => g.priority === 'high');
      const text = goals.map(g => `- **${g.name}**: ${formatBRL(g.current_value)} de ${formatBRL(g.target_value)} (${((g.current_value / g.target_value) * 100).toFixed(0)}%)`).join('\n');
      
      let addition = '';
      if (highPriority) {
        const remaining = highPriority.target_value - highPriority.current_value;
        addition = `\n\nSua meta prioritária "${highPriority.name}" falta **${formatBRL(remaining)}** para ser atingida.`;
      }
      return `Aqui está o progresso das suas metas:\n\n${text}${addition}`;
    }

    // Conselhos / Insights
    if (q.includes('conselho') || q.includes('insight') || q.includes('ajuda') || q.includes('dica')) {
      const foodExpense = transactions
        .filter(t => t.category === 'Alimentação' && t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

      let advice = 'Evite gastar mais de **R$ 420,00** nesta semana em despesas supérfluas. ';
      if (foodExpense > 400) {
        advice += `Notei que seus gastos com alimentação estão em ${formatBRL(foodExpense)}. Tente cozinhar mais em casa para economizar! `;
      }
      if (totalDividas > 0) {
        advice += `Direcione qualquer dinheiro extra (como freelances) para abater a dívida de maior juro.`;
      } else {
        advice += `Aproveite para reabastecer sua caixinha Reserva de Emergência!`;
      }

      return `Oi Helo! 🌸 Aqui vai meu conselho financeiro especial para você esta semana:\n\n1. **Orçamento Semanal:** ${advice}\n2. **Metas:** Seu planejamento de patrimônio futuro está seguro, mas manter a consistência nas caixinhas é fundamental!`;
    }

    // Default Reply
    return `Não entendi muito bem, Helo. ❤️ Quer que eu te passe o **saldo líquido**, mostre a projeção de **dívidas**, explique as **metas** ou te dê um **conselho semanal** de economia?`;
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulated bot delay
    setTimeout(() => {
      const replyText = generateReply(text);
      const botMsg: ChatMessage = {
        sender: 'helozinha',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Helozinha ❤️</h1>
        <p className="text-sm text-muted-foreground">Tire dúvidas sobre suas contas e receba insights automatizados para organizar seu dinheiro.</p>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Helozinha Insights sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm">
            <h3 className="font-extrabold text-sm flex items-center gap-1.5 text-accent">
              <Sparkles className="w-4 h-4 text-accent animate-heartbeat" />
              Insights Automáticos
            </h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-muted/30 border border-border rounded-xl space-y-1">
                <span className="font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 text-accent" /> Orçamento Semanal</span>
                <p className="text-muted-foreground leading-relaxed">Evite gastar mais de R$ 420,00 no lazer ou assinaturas nesta semana.</p>
              </div>

              <div className="p-3 bg-muted/30 border border-border rounded-xl space-y-1">
                <span className="font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-accent" /> Quitação Prevista</span>
                <p className="text-muted-foreground leading-relaxed">Mantendo o ritmo de R$ 500,00 ao mês, suas dívidas somem em meados de 2027.</p>
              </div>

              <div className="p-3 bg-muted/30 border border-border rounded-xl space-y-1">
                <span className="font-bold flex items-center gap-1"><PiggyBank className="w-3.5 h-3.5 text-accent" /> Metas Adiantadas</span>
                <p className="text-muted-foreground leading-relaxed">Sua meta principal "Guardar R$ 50.000" está 12% adiantada em relação ao prazo original.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat window */}
        <div className="lg:col-span-3 bg-card border border-border rounded-3xl h-[480px] md:h-[550px] flex flex-col justify-between overflow-hidden shadow-sm">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center gap-3 bg-muted/20">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white text-xl shadow select-none animate-float">
              🤖
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Helozinha ❤️</h3>
              <span className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
              </span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => {
              const isMe = msg.sender === 'user';
              return (
                <div 
                  key={index}
                  className={`flex items-start gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-accent/20 border border-primary/40 flex items-center justify-center font-bold text-accent shrink-0 text-sm">
                      H
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-2xl p-3.5 shadow-sm text-xs leading-relaxed ${
                    isMe 
                      ? 'bg-accent text-white rounded-tr-none' 
                      : 'bg-muted/40 border border-border text-foreground rounded-tl-none'
                  }`}>
                    {/* Render newlines */}
                    <div className="whitespace-pre-line">{msg.text}</div>
                    <span className={`text-[9px] block text-right mt-1.5 ${isMe ? 'text-white/60' : 'text-muted-foreground/60'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                  {isMe && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground shrink-0 text-xs">
                      H
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-accent/20 border border-primary/40 flex items-center justify-center font-bold text-accent shrink-0 text-sm">
                  H
                </div>
                <div className="bg-muted/40 border border-border text-foreground rounded-2xl rounded-tl-none p-3.5 max-w-[75%] shadow-sm text-xs">
                  <div className="flex gap-1 items-center py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts row */}
          <div className="px-4 py-2 border-t border-border bg-muted/10 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                className="px-3 py-1.5 bg-card border border-border hover:border-primary/50 text-[10px] font-bold rounded-full transition-all shrink-0 hover:scale-105"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-border flex gap-2 bg-card">
            <input 
              type="text" 
              placeholder="Pergunte à Helozinha..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
              className="flex-1 p-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-accent"
            />
            <button 
              onClick={() => handleSendMessage(inputText)}
              className="p-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl shadow transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
