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
  ChevronRight,
  Edit2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CaixinhasPage() {
  const { 
    caixinhas, 
    addCaixinha, 
    deleteCaixinha, 
    updateCaixinha,
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
  const [editBoxId, setEditBoxId] = useState<string | null>(null);

  // Create/Edit caixinha form state
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
    setManageBoxId(null);
    setActiveModal(modalType);
    setAmount('');
  };

  const handleStartEdit = (box: any) => {
    setEditBoxId(box.id);
    setNewName(box.name);
    setNewTarget(box.target_value.toString());
    setNewIcon(box.icon);
    setNewColor(box.color);
    setManageBoxId(null); // close management menu
    setActiveModal('create'); // open standard form
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedBoxId('');
    setTargetBoxId('');
    setAmount('');
    setEditBoxId(null);
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

    if (editBoxId) {
      updateCaixinha({
        id: editBoxId,
        name: newName,
        icon: newIcon,
        color: newColor,
        current_value: caixinhas.find(c => c.id === editBoxId)?.current_value || 0,
        target_value: parseFloat(newTarget)
      });
    } else {
      addCaixinha({
        name: newName,
        icon: newIcon,
        color: newColor,
        current_value: 0,
        target_value: parseFloat(newTarget)
      });
    }
    
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
        <div className="flex gap-6 select-none">
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
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm bg-muted/45 border border-border/40"
                    style={{ borderLeftColor: box.color, borderLeftWidth: '3px' }}
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
                <span>Gerenciar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {caixinhas.length === 0 && (
          <div className="col-span-full bg-card border border-border p-12 text-center rounded-3xl text-muted-foreground shadow-sm">
            <p className="text-sm font-semibold">Nenhuma caixinha de economia criada.</p>
            <p className="text-xs mt-1">Crie caixinhas para organizar seu dinheiro por metas específicas.</p>
          </div>
        )}
      </div>

      {/* Box Management Modal */}
      {manageBoxId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-3 duration-300">
            <div className="p-6 border-b border-border flex justify-between items-center bg-gradient-to-r from-primary/10 to-accent/10">
              <div>
                <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                  <PiggyBank className="w-5 h-5 text-accent" />
                  Gerenciar Caixinha
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Escolha uma ação para gerenciar sua caixinha</p>
              </div>
              <button onClick={() => setManageBoxId(null)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-center pb-4 border-b border-border/40">
                <span className="text-4xl block mb-2">{caixinhas.find(c => c.id === manageBoxId)?.icon}</span>
                <h4 className="font-extrabold text-base text-foreground">{manageBoxName}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Saldo: <span className="font-bold text-accent">{displayBRL(caixinhas.find(c => c.id === manageBoxId)?.current_value || 0)}</span>
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => handleOpenAction('deposit', manageBoxId)}
                  className="w-full p-3.5 bg-gradient-to-r from-green-500/10 to-green-600/10 hover:from-green-500/20 hover:to-green-600/20 border border-green-500/30 text-foreground font-bold rounded-2xl text-sm flex items-center justify-between transition-all cursor-pointer group"
                >
                  <span className="flex items-center gap-2">
                    <ArrowDownLeft className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
                    <span>Guardar Dinheiro</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>

                <button
                  onClick={() => handleOpenAction('withdraw', manageBoxId)}
                  className="w-full p-3.5 bg-gradient-to-r from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 border border-blue-500/30 text-foreground font-bold rounded-2xl text-sm flex items-center justify-between transition-all cursor-pointer group"
                >
                  <span className="flex items-center gap-2">
                    <ArrowUpRight className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span>Resgatar Dinheiro</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>

                <button
                  onClick={() => handleOpenAction('transfer', manageBoxId)}
                  className="w-full p-3.5 bg-gradient-to-r from-accent/10 to-primary/10 hover:from-accent/20 hover:to-primary/20 border border-accent/30 text-foreground font-bold rounded-2xl text-sm flex items-center justify-between transition-all cursor-pointer group"
                >
                  <span className="flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                    <span>Transferir para outra</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>

                <button
                  onClick={() => handleStartEdit(caixinhas.find(c => c.id === manageBoxId)!)}
                  className="w-full p-3.5 bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 border border-amber-500/30 text-foreground font-bold rounded-2xl text-sm flex items-center justify-between transition-all cursor-pointer group"
                >
                  <span className="flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span>Editar Configurações</span>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-3 duration-300">
            <div className="p-6 border-b border-border flex justify-between items-center bg-gradient-to-r from-green-500/10 to-green-600/10">
              <div>
                <h3 className="font-extrabold text-lg flex items-center gap-2 text-foreground">
                  <ArrowDownLeft className="w-5 h-5 text-green-500" /> Guardar Dinheiro
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{selectedBoxName}</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleDepositSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="font-bold text-sm text-foreground">Valor para Guardar (R$)</label>
                <input 
                  type="number" 
                  placeholder="Ex: 500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-border bg-background font-bold text-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-foreground transition-all"
                  required
                  min="0.01"
                  step="0.01"
                  autoFocus
                />
                <span className="text-xs text-muted-foreground block mt-2">
                  Disponível em conta: <span className="font-bold text-accent">{displayBRL(dinheiroEmConta)}</span>
                </span>
              </div>
              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 border border-border hover:bg-muted rounded-2xl text-sm font-bold cursor-pointer transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-2xl text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {activeModal === 'withdraw' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-3 duration-300">
            <div className="p-6 border-b border-border flex justify-between items-center bg-gradient-to-r from-blue-500/10 to-blue-600/10">
              <div>
                <h3 className="font-extrabold text-lg flex items-center gap-2 text-foreground">
                  <ArrowUpRight className="w-5 h-5 text-blue-500" /> Resgatar Dinheiro
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{selectedBoxName}</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleWithdrawSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="font-bold text-sm text-foreground">Valor para Resgatar (R$)</label>
                <input 
                  type="number" 
                  placeholder="Ex: 500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-border bg-background font-bold text-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-foreground transition-all"
                  required
                  min="0.01"
                  step="0.01"
                  autoFocus
                />
                <span className="text-xs text-muted-foreground block mt-2">
                  Saldo na caixinha: <span className="font-bold text-accent">{displayBRL(caixinhas.find(c => c.id === selectedBoxId)?.current_value || 0)}</span>
                </span>
              </div>
              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 border border-border hover:bg-muted rounded-2xl text-sm font-bold cursor-pointer transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-2xl text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {activeModal === 'transfer' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-3 duration-300">
            <div className="p-6 border-b border-border flex justify-between items-center bg-gradient-to-r from-accent/10 to-primary/10">
              <div>
                <h3 className="font-extrabold text-lg flex items-center gap-2 text-foreground">
                  <ArrowLeftRight className="w-5 h-5 text-accent" /> Transferir Dinheiro
                </h3>
                <p className="text-xs text-muted-foreground mt-1">De: {selectedBoxName}</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleTransferSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="font-bold text-sm text-foreground">Para qual Caixinha?</label>
                <select 
                  value={targetBoxId}
                  onChange={(e) => setTargetBoxId(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-foreground font-semibold cursor-pointer transition-all"
                  required
                >
                  <option value="">Selecione a caixinha...</option>
                  {caixinhas.filter(c => c.id !== selectedBoxId).map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-sm text-foreground">Valor (R$)</label>
                <input 
                  type="number" 
                  placeholder="Ex: 250"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-border bg-background font-bold text-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-foreground transition-all"
                  required
                  min="0.01"
                  step="0.01"
                />
                <span className="text-xs text-muted-foreground block mt-2">
                  Saldo de origem: <span className="font-bold text-accent">{displayBRL(caixinhas.find(c => c.id === selectedBoxId)?.current_value || 0)}</span>
                </span>
              </div>
              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 border border-border hover:bg-muted rounded-2xl text-sm font-bold cursor-pointer transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-2xl text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer">Transferir</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {activeModal === 'create' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-3 duration-300">
            <div className="p-6 border-b border-border flex justify-between items-center bg-gradient-to-r from-primary/10 to-accent/10">
              <div>
                <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                  <PiggyBank className="w-5 h-5 text-accent" />
                  {editBoxId ? "Editar Caixinha" : "Criar Nova Caixinha"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Organize seu dinheiro com metas específicas</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="font-bold text-sm text-foreground">Nome da Caixinha</label>
                <input 
                  type="text" 
                  placeholder="Ex: Reserva de Emergência"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-foreground font-semibold transition-all"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-sm text-foreground">Meta de Valor (R$)</label>
                <input 
                  type="number" 
                  placeholder="Ex: 5000"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-foreground font-bold transition-all"
                  required
                  min="1"
                />
              </div>

              {/* Icon select */}
              <div className="space-y-2">
                <label className="font-bold text-sm text-foreground block">Ícone representativo</label>
                <div className="flex gap-2 flex-wrap">
                  {iconsList.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewIcon(icon)}
                      className={`w-10 h-10 rounded-2xl border-2 text-lg flex items-center justify-center transition-all cursor-pointer ${
                        newIcon === icon ? 'border-accent bg-accent/10 scale-110' : 'border-border hover:border-accent/50'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color select */}
              <div className="space-y-2">
                <label className="font-bold text-sm text-foreground block">Cor temática</label>
                <div className="flex gap-3 flex-wrap">
                  {colorsList.map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewColor(col)}
                      className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                        newColor === col ? 'border-foreground scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 border border-border hover:bg-muted rounded-2xl text-sm font-bold cursor-pointer transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-2xl text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer">
                  {editBoxId ? "Salvar Alterações" : "Criar Caixinha"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
