'use client';

import React, { useState } from 'react';
import { useFinanceState } from '@/context/FinanceContext';
import { 
  PiggyBank, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  Trash2, 
  X,
  Sparkles
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
    dinheiroEmConta 
  } = useFinanceState();

  const [activeModal, setActiveModal] = useState<'create' | 'deposit' | 'withdraw' | 'transfer' | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<string>('');
  const [targetBoxId, setTargetBoxId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  // Create caixinha form state
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('🌸');
  const [newColor, setNewColor] = useState('#FFB7C5');
  const [newTarget, setNewTarget] = useState('');

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleOpenAction = (modalType: 'deposit' | 'withdraw' | 'transfer', boxId: string) => {
    setSelectedBoxId(boxId);
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

  const iconsList = ['🌸', '❤️', '🏖️', '🚗', '💍', '🏠', '💰', '🎒', '🍿', '💡'];
  const colorsList = ['#FFB7C5', '#FF4D6D', '#A2D2FF', '#E8D7F1', '#4EAD80', '#F5B041'];

  return (
    <div className="space-y-6">
      
      {/* Header and top summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Caixinhas 🌸</h1>
          <p className="text-sm text-muted-foreground">Guarde dinheiro de forma organizada com focos específicos, igualzinho ao Nubank.</p>
        </div>
        <button 
          onClick={() => setActiveModal('create')}
          className="px-4 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Criar Caixinha
        </button>
      </div>

      {/* Caixinhas Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-primary/20 text-accent rounded-xl">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Total Guardado</span>
            <span className="text-2xl font-extrabold text-accent">{formatBRL(totalSaved)}</span>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-secondary/30 text-accent rounded-xl">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Disponível em Conta</span>
            <span className="text-2xl font-extrabold text-foreground">{formatBRL(dinheiroEmConta)}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="font-bold text-sm text-accent flex items-center gap-1">
              <Sparkles className="w-4 h-4 animate-heartbeat text-accent" />
              Meta de Economia
            </span>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              Seu dinheiro guardado já representa {(totalSaved / 96000 * 100).toFixed(0)}% da sua meta consolidada de R$ 96.000,00.
            </p>
          </div>
          <span className="text-3xl">🌸</span>
        </div>
      </div>

      {/* Caixinhas Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {caixinhas.map((box) => {
          const progress = (box.current_value / box.target_value) * 100;
          return (
            <div 
              key={box.id} 
              className="bg-card border border-border p-5 rounded-3xl shadow-sm flex flex-col justify-between hover:border-primary/50 transition-all relative overflow-hidden group"
            >
              {/* Top Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                    style={{ backgroundColor: `${box.color}20`, border: `1px solid ${box.color}50` }}
                  >
                    {box.icon}
                  </div>
                  <button 
                    onClick={() => deleteCaixinha(box.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-muted transition-all"
                    title="Excluir caixinha"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-base tracking-tight">{box.name}</h4>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-foreground">{formatBRL(box.current_value)}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold block">
                    Meta: {formatBRL(box.target_value)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, progress)}%`, backgroundColor: box.color }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium block text-right">
                    {progress.toFixed(0)}% concluído
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-1.5 pt-4 mt-4 border-t border-border/40">
                <button
                  onClick={() => handleOpenAction('deposit', box.id)}
                  className="py-2 bg-muted/40 hover:bg-muted text-accent font-bold rounded-xl text-xs flex flex-col items-center gap-1 transition-colors"
                  title="Depositar"
                >
                  <ArrowDownLeft className="w-4 h-4 text-green-500" />
                  <span>Guardar</span>
                </button>
                <button
                  onClick={() => handleOpenAction('withdraw', box.id)}
                  className="py-2 bg-muted/40 hover:bg-muted text-accent font-bold rounded-xl text-xs flex flex-col items-center gap-1 transition-colors"
                  title="Resgatar"
                >
                  <ArrowUpRight className="w-4 h-4 text-blue-500" />
                  <span>Resgatar</span>
                </button>
                <button
                  onClick={() => handleOpenAction('transfer', box.id)}
                  className="py-2 bg-muted/40 hover:bg-muted text-accent font-bold rounded-xl text-xs flex flex-col items-center gap-1 transition-colors"
                  title="Transferir entre caixinhas"
                >
                  <ArrowLeftRight className="w-4 h-4 text-accent" />
                  <span>Trocar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deposit Modal */}
      {activeModal === 'deposit' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <ArrowDownLeft className="w-4 h-4 text-green-500" /> Guardar na Caixinha: {selectedBoxName}
              </h3>
              <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleDepositSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Valor para Guardar (R$)</label>
                <input 
                  type="number" 
                  placeholder="500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-background font-bold text-lg focus:outline-none focus:border-accent"
                  required
                  min="0.01"
                  step="0.01"
                  autoFocus
                />
                <span className="text-[10px] text-muted-foreground">
                  Disponível em conta: {formatBRL(dinheiroEmConta)}
                </span>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-border hover:bg-muted rounded-xl text-xs font-semibold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold shadow">Confirmar Depósito</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {activeModal === 'withdraw' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4 text-blue-500" /> Resgatar da Caixinha: {selectedBoxName}
              </h3>
              <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleWithdrawSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Valor para Resgatar (R$)</label>
                <input 
                  type="number" 
                  placeholder="500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-background font-bold text-lg focus:outline-none focus:border-accent"
                  required
                  min="0.01"
                  step="0.01"
                  autoFocus
                />
                <span className="text-[10px] text-muted-foreground">
                  Saldo nesta caixinha: {formatBRL(caixinhas.find(c => c.id === selectedBoxId)?.current_value || 0)}
                </span>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-border hover:bg-muted rounded-xl text-xs font-semibold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold shadow">Confirmar Resgate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {activeModal === 'transfer' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <ArrowLeftRight className="w-4 h-4 text-accent" /> Transferir de: {selectedBoxName}
              </h3>
              <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleTransferSubmit} className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold">Transferir para qual Caixinha?</label>
                <select 
                  value={targetBoxId}
                  onChange={(e) => setTargetBoxId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
                  required
                >
                  <option value="">Selecione a caixinha destino...</option>
                  {caixinhas.filter(c => c.id !== selectedBoxId).map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Valor (R$)</label>
                <input 
                  type="number" 
                  placeholder="250"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-background font-bold text-lg focus:outline-none focus:border-accent"
                  required
                  min="0.01"
                  step="0.01"
                />
                <span className="text-[10px] text-muted-foreground">
                  Saldo de origem: {formatBRL(caixinhas.find(c => c.id === selectedBoxId)?.current_value || 0)}
                </span>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-border hover:bg-muted rounded-xl text-xs font-semibold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold shadow">Transferir</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {activeModal === 'create' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
              <h3 className="font-bold text-sm">🌸 Criar Nova Caixinha</h3>
              <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Nome da Caixinha</label>
                <input 
                  type="text" 
                  placeholder="Ex: Viagem para Gramado"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Meta de Valor (R$)</label>
                <input 
                  type="number" 
                  placeholder="6000"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
                  required
                  min="1"
                />
              </div>

              {/* Icon select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Escolha um Ícone</label>
                <div className="flex gap-1.5 flex-wrap">
                  {iconsList.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewIcon(icon)}
                      className={`w-9 h-9 rounded-lg border text-lg flex items-center justify-center transition-all ${
                        newIcon === icon ? 'border-accent bg-accent/10' : 'border-border bg-transparent'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Escolha uma Cor</label>
                <div className="flex gap-2.5 flex-wrap pt-1">
                  {colorsList.map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewColor(col)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        newColor === col ? 'border-foreground scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-border hover:bg-muted rounded-xl text-xs font-semibold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold shadow">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
