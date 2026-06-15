'use client';

import React, { useState, useEffect } from 'react';
import { useFinanceState } from '@/context/FinanceContext';
import { 
  PiggyBank, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  Trash2, 
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CaixinhasPage() {
  const { 
    caixinhas, 
    addCaixinha, 
    deleteCaixinha, 
    depositToCaixinha, 
    withdrawFromCaixinha, 
    transferBetweenCaixinhas, 
    dinheiroEmConta,
    showValues
  } = useFinanceState();

  const [mounted, setMounted] = useState(false);
  
  // Management & Action Modals
  const [manageBoxId, setManageBoxId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'create' | 'deposit' | 'withdraw' | 'transfer' | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<string>('');
  const [targetBoxId, setTargetBoxId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  // Create caixinha form state
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('🌸');
  const [newColor, setNewColor] = useState('#FFB7C5');
  const [newTarget, setNewTarget] = useState('');

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

  const handleOpenAction = (modalType: 'deposit' | 'withdraw' | 'transfer', boxId: string) => {
    setSelectedBoxId(boxId);
    setManageBoxId(null); // close the management modal
    setActiveModal(modalType);
    setAmount('');
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedBoxId('');
    setTargetBoxId('');
    setAmount('');
    // reset create box form
    setNewName('');
    setNewIcon('🌸');
    setNewColor('#FFB7C5');
    setNewTarget('');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newTarget) {
      alert('Preencha todos os campos.');
      return;
    }
    addCaixinha({
      name: newName,
      icon: newIcon,
      color: newColor,
      current_value: 0,
      target_value: parseFloat(newTarget)
    });
    handleCloseModal();
    confetti({
      particleCount: 50,
      spread: 60,
      colors: [newColor, '#FFFFFF', '#FFB7C5']
    });
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    const success = depositToCaixinha(selectedBoxId, val);
    if (!success) {
      alert('Saldo em conta insuficiente para depósito.');
      return;
    }

    handleCloseModal();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.7 }
    });
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    const success = withdrawFromCaixinha(selectedBoxId, val);
    if (!success) {
      alert('Saldo da caixinha insuficiente para resgate.');
      return;
    }

    handleCloseModal();
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0 || !targetBoxId) return;

    const success = transferBetweenCaixinhas(selectedBoxId, targetBoxId, val);
    if (!success) {
      alert('Saldo insuficiente para transferência.');
      return;
    }

    handleCloseModal();
  };

  const totalSaved = caixinhas.reduce((acc, c) => acc + c.current_value, 0);
  const selectedBoxName = caixinhas.find(c => c.id === selectedBoxId)?.name || '';
  const manageBoxName = caixinhas.find(c => c.id === manageBoxId)?.name || '';

  const iconsList = ['🌸', '❤️', '🏖️', '🚗', '💍', '🏠', '💰', '🎒', '🍿', '💡'];
  const colorsList = ['#FFB7C5', '#FF4D6D', '#A2D2FF', '#E8D7F1', '#4EAD80', '#F5B041'];

  return (
    <div className="space-y-6">
      
      {/* Header with Quick Totals */}
      <div className="bg-card border border-border p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-6">
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Total Guardado</span>
            <span className="text-xl font-extrabold text-accent">{displayBRL(totalSaved)}</span>
          </div>
          <div className="border-r border-border" />
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Saldo Disponível</span>
            <span className="text-xl font-extrabold text-foreground">{displayBRL(dinheiroEmConta)}</span>
          </div>
        </div>

        <button 
          onClick={() => setActiveModal('create')}
          className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-103 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Criar Caixinha
        </button>
      </div>

      {/* Insight Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 p-4 rounded-3xl flex items-center justify-between shadow-sm select-none">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-float">🌸</span>
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold text-accent uppercase tracking-wider block">Meta Consolidada</span>
            <p className="text-xs text-muted-foreground">
              Seu dinheiro guardado já representa **{((totalSaved / 96000) * 100).toFixed(0)}%** da sua meta consolidada de R$ 96.000,00.
            </p>
          </div>
        </div>
      </div>

      {/* Caixinhas Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {caixinhas.map((box) => {
          const progress = (box.current_value / box.target_value) * 100;
          return (
            <div 
              key={box.id} 
              className="bg-card border border-border p-5 rounded-3xl shadow-sm flex flex-col justify-between hover:border-primary/40 transition-all group min-h-[200px]"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm"
                    style={{ backgroundColor: `${box.color}20`, border: `1px solid ${box.color}40` }}
                  >
                    {box.icon}
                  </div>
                  <button 
                    onClick={() => deleteCaixinha(box.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-muted transition-all cursor-pointer"
                    title="Excluir caixinha"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-foreground tracking-tight">{box.name}</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-black text-foreground">{displayBRL(box.current_value)}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold block">
                    Meta: {displayBRL(box.target_value)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 select-none">
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div 
                      className="h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, progress)}%`, backgroundColor: box.color }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground font-bold block text-right">
                    {progress.toFixed(0)}% concluído
                  </span>
                </div>
              </div>

              {/* Minimal Manage Button */}
              <button
                onClick={() => setManageBoxId(box.id)}
                className="mt-4 w-full py-2 bg-muted/40 hover:bg-muted text-accent font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span>Gerenciar Caixinha</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {caixinhas.length === 0 && (
          <div className="col-span-full bg-card border border-border p-12 text-center rounded-3xl text-muted-foreground shadow-sm">
            <span className="block text-2xl mb-2">🌸</span>
            <p className="text-sm font-semibold">Nenhuma caixinha criada.</p>
            <p className="text-xs mt-1">Crie caixinhas para organizar suas economias por objetivo.</p>
          </div>
        )}
      </div>

      {/* Box Management Modal */}
      {manageBoxId && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border flex justify-between items-center bg-muted/20 select-none">
              <h3 className="font-extrabold text-sm text-foreground">
                🌸 Gerenciar Caixinha
              </h3>
              <button onClick={() => setManageBoxId(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="text-center pb-2">
                <span className="text-3xl block mb-1">💼</span>
                <h4 className="font-black text-sm text-foreground">{manageBoxName}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Saldo: {displayBRL(caixinhas.find(c => c.id === manageBoxId)?.current_value || 0)}
                </p>
              </div>

              <div className="space-y-2 select-none">
                <button
                  onClick={() => handleOpenAction('deposit', manageBoxId)}
                  className="w-full p-3 bg-muted/20 hover:bg-muted border border-border/60 text-foreground font-bold rounded-2xl text-xs flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ArrowDownLeft className="w-4 h-4 text-green-500" />
                    <span>Guardar Dinheiro</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>

                <button
                  onClick={() => handleOpenAction('withdraw', manageBoxId)}
                  className="w-full p-3 bg-muted/20 hover:bg-muted border border-border/60 text-foreground font-bold rounded-2xl text-xs flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-blue-500" />
                    <span>Resgatar Dinheiro</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>

                <button
                  onClick={() => handleOpenAction('transfer', manageBoxId)}
                  className="w-full p-3 bg-muted/20 hover:bg-muted border border-border/60 text-foreground font-bold rounded-2xl text-xs flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4 text-accent" />
                    <span>Transferir para outra Caixinha</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {activeModal === 'deposit' && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20 select-none">
              <h3 className="font-bold text-xs flex items-center gap-1.5 text-foreground">
                <ArrowDownLeft className="w-4 h-4 text-green-500" /> Guardar: {selectedBoxName}
              </h3>
              <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleDepositSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase text-[9px] tracking-wider block">Valor para Guardar (R$)</label>
                <input 
                  type="number" 
                  placeholder="Ex: 500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-background font-bold text-lg focus:outline-none focus:border-accent text-foreground"
                  required
                  min="0.01"
                  step="0.01"
                  autoFocus
                />
                <span className="text-[10px] text-muted-foreground block mt-1">
                  Disponível em conta: {displayBRL(dinheiroEmConta)}
                </span>
              </div>
              <div className="pt-2 flex justify-end gap-2.5 select-none">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-border hover:bg-muted rounded-xl text-xs font-semibold cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {activeModal === 'withdraw' && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20 select-none">
              <h3 className="font-bold text-xs flex items-center gap-1.5 text-foreground">
                <ArrowUpRight className="w-4 h-4 text-blue-500" /> Resgatar: {selectedBoxName}
              </h3>
              <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleWithdrawSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase text-[9px] tracking-wider block">Valor para Resgatar (R$)</label>
                <input 
                  type="number" 
                  placeholder="Ex: 500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-background font-bold text-lg focus:outline-none focus:border-accent text-foreground"
                  required
                  min="0.01"
                  step="0.01"
                  autoFocus
                />
                <span className="text-[10px] text-muted-foreground block mt-1">
                  Saldo na caixinha: {displayBRL(caixinhas.find(c => c.id === selectedBoxId)?.current_value || 0)}
                </span>
              </div>
              <div className="pt-2 flex justify-end gap-2.5 select-none">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-border hover:bg-muted rounded-xl text-xs font-semibold cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {activeModal === 'transfer' && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20 select-none">
              <h3 className="font-bold text-xs flex items-center gap-1.5 text-foreground">
                <ArrowLeftRight className="w-4 h-4 text-accent" /> Transferir de: {selectedBoxName}
              </h3>
              <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleTransferSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase text-[9px] tracking-wider block">Transferir para qual Caixinha?</label>
                <select 
                  value={targetBoxId}
                  onChange={(e) => setTargetBoxId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-accent text-foreground font-semibold cursor-pointer"
                  required
                >
                  <option value="">Selecione a caixinha...</option>
                  {caixinhas.filter(c => c.id !== selectedBoxId).map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase text-[9px] tracking-wider block">Valor (R$)</label>
                <input 
                  type="number" 
                  placeholder="Ex: 250"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-background font-bold text-lg focus:outline-none focus:border-accent text-foreground"
                  required
                  min="0.01"
                  step="0.01"
                />
                <span className="text-[10px] text-muted-foreground block mt-1">
                  Saldo de origem: {displayBRL(caixinhas.find(c => c.id === selectedBoxId)?.current_value || 0)}
                </span>
              </div>
              <div className="pt-2 flex justify-end gap-2.5 select-none">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-border hover:bg-muted rounded-xl text-xs font-semibold cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer">Transferir</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {activeModal === 'create' && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20 select-none">
              <h3 className="font-bold text-xs text-foreground">🌸 Criar Nova Caixinha</h3>
              <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Nome da Caixinha</label>
                <input 
                  type="text" 
                  placeholder="Ex: Reserva de Emergência"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-accent text-foreground"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Meta de Valor (R$)</label>
                <input 
                  type="number" 
                  placeholder="Ex: 5000"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-accent text-foreground font-bold"
                  required
                  min="1"
                />
              </div>

              {/* Icon select */}
              <div className="space-y-1.5 select-none">
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Ícone representativo</label>
                <div className="flex gap-1.5 flex-wrap">
                  {iconsList.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewIcon(icon)}
                      className={`w-8.5 h-8.5 rounded-lg border text-base flex items-center justify-center transition-all cursor-pointer ${
                        newIcon === icon ? 'border-accent bg-accent/10' : 'border-border bg-transparent'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color select */}
              <div className="space-y-1.5 select-none">
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Cor temática</label>
                <div className="flex gap-2.5 flex-wrap pt-0.5">
                  {colorsList.map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewColor(col)}
                      className={`w-6.5 h-6.5 rounded-full border-2 transition-all cursor-pointer ${
                        newColor === col ? 'border-foreground scale-105' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5 select-none">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-border hover:bg-muted rounded-xl text-xs font-semibold cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
