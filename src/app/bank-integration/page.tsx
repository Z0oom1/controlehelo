'use client';

import React, { useState } from 'react';
import { useFinanceState } from '@/context/FinanceContext';
import { 
  Landmark, 
  Trash2, 
  Sparkles, 
  CheckCircle,
  CreditCard,
  AlertTriangle,
  Plus,
  X,
  Edit2,
  Wallet,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Bank SVG Logos
const BankLogos: Record<string, React.ReactNode> = {
  'Nubank': (
    <svg viewBox="0 0 100 100" className="w-12 h-12">
      <rect fill="#8B2E8F" width="100" height="100" rx="8"/>
      <text x="50" y="60" fontSize="40" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">ν</text>
    </svg>
  ),
  'Itaú': (
    <svg viewBox="0 0 100 100" className="w-12 h-12">
      <rect fill="#FF6B35" width="100" height="100" rx="8"/>
      <text x="50" y="60" fontSize="32" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">Itaú</text>
    </svg>
  ),
  'Bradesco': (
    <svg viewBox="0 0 100 100" className="w-12 h-12">
      <rect fill="#DC143C" width="100" height="100" rx="8"/>
      <text x="50" y="60" fontSize="28" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">Bradesco</text>
    </svg>
  ),
  'Santander': (
    <svg viewBox="0 0 100 100" className="w-12 h-12">
      <rect fill="#E41E3F" width="100" height="100" rx="8"/>
      <text x="50" y="60" fontSize="28" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">Santander</text>
    </svg>
  ),
  'Banco do Brasil': (
    <svg viewBox="0 0 100 100" className="w-12 h-12">
      <rect fill="#FFD700" width="100" height="100" rx="8"/>
      <text x="50" y="60" fontSize="28" fontWeight="bold" fill="#003366" textAnchor="middle" fontFamily="Arial">BB</text>
    </svg>
  ),
  'Inter': (
    <svg viewBox="0 0 100 100" className="w-12 h-12">
      <rect fill="#FF6B00" width="100" height="100" rx="8"/>
      <text x="50" y="60" fontSize="32" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">Inter</text>
    </svg>
  ),
  'C6 Bank': (
    <svg viewBox="0 0 100 100" className="w-12 h-12">
      <rect fill="#1D1D1D" width="100" height="100" rx="8"/>
      <text x="50" y="60" fontSize="32" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">C6</text>
    </svg>
  ),
  'Mercado Pago': (
    <svg viewBox="0 0 100 100" className="w-12 h-12">
      <rect fill="#3483FA" width="100" height="100" rx="8"/>
      <text x="50" y="60" fontSize="24" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">MP</text>
    </svg>
  ),
  'PicPay': (
    <svg viewBox="0 0 100 100" className="w-12 h-12">
      <rect fill="#52C41A" width="100" height="100" rx="8"/>
      <text x="50" y="60" fontSize="28" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">PP</text>
    </svg>
  ),
};

// Bank gradient colors
const BankGradients: Record<string, string> = {
  'Nubank': 'from-purple-600 to-purple-900',
  'Itaú': 'from-orange-500 to-orange-700',
  'Bradesco': 'from-red-600 to-red-800',
  'Santander': 'from-red-500 to-red-700',
  'Banco do Brasil': 'from-yellow-400 to-yellow-600',
  'Inter': 'from-orange-500 to-orange-700',
  'C6 Bank': 'from-gray-800 to-gray-900',
  'Mercado Pago': 'from-blue-500 to-blue-700',
  'PicPay': 'from-green-500 to-green-700',
};

export default function BankIntegrationPage() {
  const { 
    bankConnections, 
    connectBankFile, 
    disconnectBank,
    updateBankConnection,
    showValues
  } = useFinanceState();

  // Form states for manual creation
  const [selectedBank, setSelectedBank] = useState('Nubank');
  const [customBankName, setCustomBankName] = useState('');
  const [manualBalance, setManualBalance] = useState('');
  const [manualLimit, setManualLimit] = useState('');
  const [manualInvoice, setManualInvoice] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Editing states
  const [editingConnection, setEditingConnection] = useState<any | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [editLimit, setEditLimit] = useState('');
  const [editInvoice, setEditInvoice] = useState('');

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const displayBRL = (val: number) => {
    if (!showValues) return 'R$ ••••••';
    return formatBRL(val);
  };

  const getBankName = () => {
    return selectedBank === 'Outro' ? customBankName || 'Outro Banco' : selectedBank;
  };

  const getBankGradient = (bankName: string): string => {
    return BankGradients[bankName] || 'from-blue-500 to-blue-700';
  };

  const handleAddManualAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const bankName = getBankName();
    if (!bankName.trim()) {
      setUploadError('Por favor, digite o nome do banco.');
      return;
    }

    const balance = parseFloat(manualBalance) || 0;
    const limit = parseFloat(manualLimit) || 0;
    const invoice = parseFloat(manualInvoice) || 0;

    connectBankFile(
      bankName,
      balance,
      limit,
      invoice,
      []
    );

    confetti({
      particleCount: 80,
      spread: 60,
      colors: ['#FFB7C5', '#FF4D6D']
    });

    // Reset inputs
    setManualBalance('');
    setManualLimit('');
    setManualInvoice('');
    setCustomBankName('');
    setUploadError('');
    setSelectedBank('Nubank');
  };

  const handleStartEdit = (conn: any) => {
    setEditingConnection(conn);
    setEditBalance(conn.balance.toString());
    setEditLimit(conn.limit.toString());
    setEditInvoice(conn.credit_card_invoice.toString());
  };

  const handleConfirmEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConnection) return;

    const balance = parseFloat(editBalance) || 0;
    const limit = parseFloat(editLimit) || 0;
    const invoice = parseFloat(editInvoice) || 0;

    updateBankConnection(editingConnection.id, balance, limit, invoice);
    
    confetti({
      particleCount: 50,
      spread: 40,
      colors: ['#FFB7C5', '#A2D2FF']
    });

    setEditingConnection(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Minhas Contas e Cartões</h1>
          <p className="text-sm text-muted-foreground">Cadastre e gerencie suas contas bancárias com uma experiência premium.</p>
        </div>
      </div>

      {/* Active connections list */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base tracking-tight flex items-center gap-1.5">
          <span>Suas Contas Cadastradas ({bankConnections.length})</span>
        </h3>

        {bankConnections.length === 0 ? (
          <div className="bg-card border border-border p-8 text-center rounded-3xl">
            <Landmark className="w-10 h-10 text-primary mx-auto mb-3" />
            <p className="text-sm font-semibold">Nenhuma conta cadastrada ainda.</p>
            <p className="text-xs text-muted-foreground mt-1">Utilize o formulário abaixo para adicionar uma conta manualmente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankConnections.map((conn) => (
              <div key={conn.id} className="group relative overflow-hidden rounded-3xl shadow-lg transition-all duration-300 hover:shadow-2xl">
                {/* Dynamic Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getBankGradient(conn.bank_name)} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                
                {/* Card Content */}
                <div className="relative p-6 text-white space-y-4 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {BankLogos[conn.bank_name] || (
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-extrabold text-lg">{conn.bank_name}</h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded-md">
                          Manual
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 bg-black/20 rounded-lg p-1">
                      <button 
                        onClick={() => handleStartEdit(conn)}
                        className="p-1.5 text-white hover:bg-white/20 rounded-lg transition-colors"
                        title="Editar saldo/limites"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => disconnectBank(conn.id)}
                        className="p-1.5 text-white hover:bg-red-500/30 rounded-lg transition-colors"
                        title="Excluir conta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Saldo Display */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold opacity-80 block uppercase tracking-wider">Saldo Disponível</span>
                    <span className="font-extrabold text-2xl">{displayBRL(conn.balance)}</span>
                  </div>

                  {/* Bottom Info */}
                  <div className="pt-4 border-t border-white/20 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="opacity-80">Limite</span>
                      <span className="font-bold">{displayBRL(conn.limit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-80">Fatura</span>
                      <span className="font-bold text-yellow-200">{displayBRL(conn.credit_card_invoice)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Manual Account Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card border border-border p-6 rounded-3xl space-y-4 shadow-sm">
            <h3 className="font-extrabold text-base flex items-center gap-1.5">
              <Plus className="w-5 h-5 text-accent" />
              Cadastrar Nova Conta Bancária
            </h3>
            
            <form onSubmit={handleAddManualAccount} className="space-y-4 text-xs">
              {/* Left side: Dynamic Card Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card Preview */}
                <div className={`bg-gradient-to-br ${getBankGradient(selectedBank === 'Outro' ? 'Nubank' : selectedBank)} rounded-2xl p-6 text-white space-y-4 h-64 flex flex-col justify-between shadow-lg`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-semibold opacity-80 uppercase tracking-wider">Seu Cartão</p>
                      <h4 className="font-extrabold text-lg mt-1">{getBankName()}</h4>
                    </div>
                    {BankLogos[selectedBank === 'Outro' ? 'Nubank' : selectedBank] && (
                      <div className="opacity-80">
                        {BankLogos[selectedBank === 'Outro' ? 'Nubank' : selectedBank]}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold opacity-80 uppercase tracking-wider">Saldo Disponível</p>
                    <p className="font-extrabold text-2xl">{manualBalance ? formatBRL(parseFloat(manualBalance)) : 'R$ 0,00'}</p>
                  </div>

                  <div className="pt-4 border-t border-white/20 flex justify-between text-xs">
                    <div>
                      <p className="opacity-80 text-[10px]">Limite</p>
                      <p className="font-bold">{manualLimit ? formatBRL(parseFloat(manualLimit)) : 'R$ 0,00'}</p>
                    </div>
                    <div className="text-right">
                      <p className="opacity-80 text-[10px]">Fatura</p>
                      <p className="font-bold text-yellow-200">{manualInvoice ? formatBRL(parseFloat(manualInvoice)) : 'R$ 0,00'}</p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-muted-foreground">Instituição Financeira</label>
                    <select 
                      value={selectedBank} 
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full p-2.5 rounded-2xl border border-border bg-background focus:outline-none focus:border-accent text-foreground font-semibold transition-colors"
                    >
                      <option value="Nubank">Nubank</option>
                      <option value="Itaú">Itaú</option>
                      <option value="Bradesco">Bradesco</option>
                      <option value="Santander">Santander</option>
                      <option value="Banco do Brasil">Banco do Brasil</option>
                      <option value="Inter">Inter</option>
                      <option value="C6 Bank">C6 Bank</option>
                      <option value="Mercado Pago">Mercado Pago</option>
                      <option value="PicPay">PicPay</option>
                      <option value="Outro">Outro (Digitar nome)</option>
                    </select>
                  </div>

                  {selectedBank === 'Outro' && (
                    <div className="space-y-1.5">
                      <label className="font-bold text-muted-foreground">Nome do Banco</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Banco Cooperativo"
                        value={customBankName}
                        onChange={(e) => setCustomBankName(e.target.value)}
                        className="w-full p-2.5 rounded-2xl border border-border bg-background focus:outline-none focus:border-accent text-foreground font-semibold transition-colors"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="font-bold text-muted-foreground">Saldo em Conta (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="Ex: 1500.00"
                      value={manualBalance}
                      onChange={(e) => setManualBalance(e.target.value)}
                      className="w-full p-2.5 rounded-2xl border border-border bg-background focus:outline-none focus:border-accent text-foreground transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-muted-foreground">Limite do Cartão (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="Ex: 5000.00"
                      value={manualLimit}
                      onChange={(e) => setManualLimit(e.target.value)}
                      className="w-full p-2.5 rounded-2xl border border-border bg-background focus:outline-none focus:border-accent text-foreground transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-muted-foreground">Fatura Atual (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="Ex: 850.00"
                      value={manualInvoice}
                      onChange={(e) => setManualInvoice(e.target.value)}
                      className="w-full p-2.5 rounded-2xl border border-border bg-background focus:outline-none focus:border-accent text-foreground transition-colors"
                    />
                  </div>
                </div>
              </div>

              {uploadError && (
                <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-500 text-xs font-semibold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-2xl text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Adicionar Conta
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-card border border-border p-6 rounded-3xl space-y-4 shadow-sm h-fit">
          <h4 className="font-extrabold text-sm flex items-center gap-1.5 text-accent">
            <Sparkles className="w-4 h-4 text-accent" />
            Gerenciamento Premium
          </h4>
          <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
            <div className="space-y-1">
              <span className="font-bold text-foreground block flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-accent" />
                Controle Total
              </span>
              <p>Cadastre suas contas e atualize os saldos sempre que necessário. Clique no ícone de lápis para editar.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-foreground block flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-accent" />
                Cartões Dinâmicos
              </span>
              <p>Cada banco possui um design único com cores e logotipos exclusivos para melhor identificação.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-foreground block flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-accent" />
                100% Seguro
              </span>
              <p>Tudo é salvo localmente no seu navegador. Nenhum dado é enviado para servidores externos.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingConnection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in slide-in-from-bottom-3 duration-300">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <h3 className="font-extrabold text-base">Editar {editingConnection.bank_name}</h3>
              <button 
                onClick={() => setEditingConnection(null)}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground text-xs">Saldo em Conta (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-border bg-background focus:outline-none focus:border-accent text-foreground transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground text-xs">Limite do Cartão (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editLimit}
                  onChange={(e) => setEditLimit(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-border bg-background focus:outline-none focus:border-accent text-foreground transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground text-xs">Fatura Atual (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editInvoice}
                  onChange={(e) => setEditInvoice(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-border bg-background focus:outline-none focus:border-accent text-foreground transition-colors"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingConnection(null)}
                  className="flex-1 px-4 py-2.5 border border-border hover:bg-muted text-muted-foreground font-semibold rounded-2xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl text-xs shadow-md transition-all"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
