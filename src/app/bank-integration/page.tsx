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

// Bank Image Logos
const BankLogos: Record<string, React.ReactNode> = {
  'Nubank': <img src="/logos/nubank.png" alt="Nubank" className="w-12 h-12 object-contain bg-white rounded-lg p-1" />,
  'Itaú': <img src="/logos/itau.png" alt="Itaú" className="w-12 h-12 object-contain bg-white rounded-lg p-1" />,
  'Bradesco': <img src="/logos/bradesco.png" alt="Bradesco" className="w-12 h-12 object-contain bg-white rounded-lg p-1" />,
  'Santander': <img src="/logos/santander.png" alt="Santander" className="w-12 h-12 object-contain bg-white rounded-lg p-1" />,
  'Banco do Brasil': <img src="/logos/banco_do_brasil.png" alt="Banco do Brasil" className="w-12 h-12 object-contain bg-white rounded-lg p-1" />,
  'Inter': <img src="/logos/inter.png" alt="Inter" className="w-12 h-12 object-contain bg-white rounded-lg p-1" />,
  'C6 Bank': <img src="/logos/c6bank.png" alt="C6 Bank" className="w-12 h-12 object-contain bg-white rounded-lg p-1" />,
  'Mercado Pago': <img src="/logos/mercado_pago.png" alt="Mercado Pago" className="w-12 h-12 object-contain bg-white rounded-lg p-1" />,
  'PicPay': <img src="/logos/picpay.png" alt="PicPay" className="w-12 h-12 object-contain bg-white rounded-lg p-1" />,
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
  const [editInvoices, setEditInvoices] = useState<{id: string, month: string, amount: number, is_paid: boolean}[]>([]);
  const [activeInvoiceTab, setActiveInvoiceTab] = useState(0);
  const [showPayConfirm, setShowPayConfirm] = useState<string | null>(null);

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
    setEditInvoices(conn.invoices || []);
    setActiveInvoiceTab(-1);
  };

  const getNextMonth = (lastMonthStr?: string) => {
    const date = lastMonthStr ? new Date(lastMonthStr + '-01') : new Date();
    if (lastMonthStr) date.setMonth(date.getMonth() + 1);
    return date.toISOString().slice(0, 7); // YYYY-MM
  };

  const addFutureInvoice = () => {
    const lastMonth = editInvoices.length > 0 
      ? editInvoices[editInvoices.length - 1].month 
      : getNextMonth();
    const nextMonth = getNextMonth(lastMonth);
    setEditInvoices([...editInvoices, { 
      id: Math.random().toString(36).substr(2, 9),
      month: nextMonth, 
      amount: 0, 
      is_paid: false 
    }]);
    setActiveInvoiceTab(editInvoices.length);
  };

  const updateInvoiceAmount = (index: number, amount: string) => {
    const newInvoices = [...editInvoices];
    newInvoices[index].amount = parseFloat(amount) || 0;
    setEditInvoices(newInvoices);
  };

  const handleConfirmEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConnection) return;

    const balance = parseFloat(editBalance) || 0;
    const limit = parseFloat(editLimit) || 0;
    const invoice = parseFloat(editInvoice) || 0;

    // We'll need to update the context to accept invoices
    updateBankConnection(editingConnection.id, balance, limit, invoice, editInvoices);
    
    confetti({
      particleCount: 50,
      spread: 40,
      colors: ['#FFB7C5', '#A2D2FF']
    });

    setEditingConnection(null);
  };

  const handlePayInvoice = (connId: string) => {
    setShowPayConfirm(connId);
  };

  const confirmPayInvoice = (connId: string) => {
    // Logic to pay current invoice
    // For now, let's assume we pay the current invoice and set it to 0
    updateBankConnection(connId, -1, -1, 0); 
    setShowPayConfirm(null);
    confetti({
      particleCount: 100,
      spread: 70,
      colors: ['#FFB7C5', '#FF4D6D']
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Meus Cartões e Contas</h1>
          <p className="text-sm text-muted-foreground">Gerencie seus cartões e contas bancárias de forma integrada com suas dívidas.</p>
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
                      {conn.logo && conn.logo.startsWith('/') ? (
                        <img src={conn.logo} alt={conn.bank_name} className="w-12 h-12 object-contain bg-white rounded-lg p-1" />
                      ) : BankLogos[conn.bank_name] || (
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
                    <div className="flex justify-between items-center">
                      <span className="opacity-80">Fatura</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-yellow-200">{displayBRL(conn.credit_card_invoice)}</span>
                        {conn.credit_card_invoice > 0 && (
                          <button 
                            onClick={() => handlePayInvoice(conn.id)}
                            className="bg-white/20 hover:bg-white/40 px-2 py-0.5 rounded text-[9px] font-bold transition-colors"
                          >
                            PAGAR
                          </button>
                        )}
                      </div>
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
              Cadastrar Novo Cartão ou Conta
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
        <div className="fixed inset-0 bg-black/55 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="modal-sheet rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in slide-in-from-bottom-3 duration-300 relative flex flex-col max-h-[90vh]">
            {/* iOS handle pill */}
            <div className="w-12 h-1.5 bg-muted-foreground/20 dark:bg-muted-foreground/30 rounded-full mx-auto mt-3 -mb-2 shrink-0" />
            <div className="p-6 border-b border-border/40 flex justify-between items-center bg-muted/20 select-none">
              <h3 className="font-extrabold text-base">Editar {editingConnection.bank_name}</h3>
              <button 
                onClick={() => setEditingConnection(null)}
                className="p-1 hover:bg-muted rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmEdit} className="p-6 space-y-4 flex-1 overflow-y-auto">
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

              <div className="space-y-3">
                <div className="flex justify-between items-center select-none">
                  <label className="font-bold text-muted-foreground text-xs">Gestão de Faturas</label>
                  <button 
                    type="button"
                    onClick={addFutureInvoice}
                    className="p-1 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> ADICIONAR MÊS
                  </button>
                </div>

                <div className="space-y-2">
                  {/* Invoice Tabs/Abas */}
                  <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar select-none">
                    <button
                      type="button"
                      onClick={() => setActiveInvoiceTab(-1)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${activeInvoiceTab === -1 ? 'bg-accent text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    >
                      Atual
                    </button>
                    {editInvoices.map((inv, idx) => (
                      <button
                        key={inv.id}
                        type="button"
                        onClick={() => setActiveInvoiceTab(idx)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${activeInvoiceTab === idx ? 'bg-accent text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                      >
                        {inv.month}
                      </button>
                    ))}
                  </div>

                  {/* Active Tab Content */}
                  <div className="p-3 bg-muted/30 border border-border/50 rounded-2xl">
                    {activeInvoiceTab === -1 || !editInvoices[activeInvoiceTab] ? (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Valor Fatura Atual (R$)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={editInvoice}
                          onChange={(e) => setEditInvoice(e.target.value)}
                          className="w-full p-2 rounded-xl border border-border bg-background focus:outline-none focus:border-accent text-sm font-semibold text-foreground"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Valor Fatura {editInvoices[activeInvoiceTab].month} (R$)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={editInvoices[activeInvoiceTab].amount}
                          onChange={(e) => updateInvoiceAmount(activeInvoiceTab, e.target.value)}
                          className="w-full p-2 rounded-xl border border-border bg-background focus:outline-none focus:border-accent text-sm font-semibold text-foreground"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingConnection(null)}
                  className="flex-1 px-4 py-2.5 border border-border hover:bg-muted text-muted-foreground font-semibold rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl text-xs shadow-md transition-all cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Confirmation Modal */}
      {showPayConfirm && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="modal-sheet rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-5 animate-in slide-in-from-bottom-3 duration-300 relative select-none">
            {/* iOS handle pill */}
            <div className="w-12 h-1.5 bg-muted-foreground/20 dark:bg-muted-foreground/30 rounded-full mx-auto mt-1 -mb-2 shrink-0" />
            <div className="text-center space-y-2 pt-2">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-8 h-8 text-accent animate-bounce" />
              </div>
              <h3 className="font-black text-lg">Confirmar Pagamento?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Você está prestes a registrar o pagamento da fatura atual. Esta ação irá abater o valor do seu saldo em conta. Deseja continuar?
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => confirmPayInvoice(showPayConfirm)}
                className="w-full py-3 bg-accent hover:bg-accent/90 text-white font-black rounded-2xl text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                SIM, PAGAR FATURA
              </button>
              <button
                onClick={() => setShowPayConfirm(null)}
                className="w-full py-3 bg-muted hover:bg-muted/80 text-muted-foreground font-bold rounded-2xl text-xs transition-all cursor-pointer"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
