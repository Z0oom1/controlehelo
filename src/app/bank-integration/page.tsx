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
  Upload,
  HelpCircle,
  ArrowRight,
  Edit2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ParsedTransaction {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  recurrence: 'none' | 'monthly' | 'weekly';
  is_realized: boolean;
}

export default function BankIntegrationPage() {
  const { 
    bankConnections, 
    connectBankFile, 
    disconnectBank,
    updateBankConnection
  } = useFinanceState();

  // Drag and drop states
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [fileName, setFileName] = useState('');
  
  // Form states for manual creation
  const [selectedBank, setSelectedBank] = useState('Nubank');
  const [customBankName, setCustomBankName] = useState('');
  const [manualBalance, setManualBalance] = useState('');
  const [manualLimit, setManualLimit] = useState('');
  const [manualInvoice, setManualInvoice] = useState('');

  // Editing states
  const [editingConnection, setEditingConnection] = useState<any | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [editLimit, setEditLimit] = useState('');
  const [editInvoice, setEditInvoice] = useState('');

  // Parsed preview state
  const [previewData, setPreviewData] = useState<{
    bankName: string;
    balance: number;
    limit: number;
    invoice: number;
    transactions: ParsedTransaction[];
  } | null>(null);

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getBankName = () => {
    return selectedBank === 'Outro' ? customBankName || 'Outro Banco' : selectedBank;
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

  // Heuristic to guess category based on description
  const guessCategory = (description: string, isExpense: boolean): string => {
    if (!isExpense) return 'Salário';
    const desc = description.toLowerCase();
    if (desc.includes('ifood') || desc.includes('eats') || desc.includes('restaurante') || desc.includes('padaria') || desc.includes('mercado') || desc.includes('supermercado') || desc.includes('carrefour') || desc.includes('pao de acucar')) return 'Alimentação';
    if (desc.includes('uber') || desc.includes('99taxis') || desc.includes('posto') || desc.includes('combustivel') || desc.includes('gasolina') || desc.includes('metro') || desc.includes('onibus') || desc.includes('pedagio')) return 'Transporte';
    if (desc.includes('farmacia') || desc.includes('drogaria') || desc.includes('medico') || desc.includes('consulta') || desc.includes('hospital') || desc.includes('dentista') || desc.includes('amei')) return 'Saúde';
    if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('disney') || desc.includes('hbo') || desc.includes('amazon prime') || desc.includes('globo') || desc.includes('apple.com')) return 'Assinaturas';
    if (desc.includes('cinema') || desc.includes('show') || desc.includes('ingresso') || desc.includes('lazer') || desc.includes('viagem') || desc.includes('hotel') || desc.includes('booking') || desc.includes('decolar')) return 'Lazer';
    if (desc.includes('colegio') || desc.includes('escola') || desc.includes('faculdade') || desc.includes('curso') || desc.includes('livro') || desc.includes('udemy') || desc.includes('coursera')) return 'Educação';
    if (desc.includes('aluguel') || desc.includes('condominio') || desc.includes('luz') || desc.includes('enel') || desc.includes('agua') || desc.includes('sabesp') || desc.includes('internet') || desc.includes('iptu')) return 'Moradia';
    return 'Compras';
  };

  // OFX Parser
  const parseOFX = (text: string): { bankName: string; balance: number; transactions: ParsedTransaction[] } => {
    const transactions: ParsedTransaction[] = [];
    let bankName = getBankName();
    let balance = parseFloat(manualBalance) || 0;

    // Detect Bank name from ORG tag
    const orgMatch = text.match(/<ORG>([^<]+)/i);
    if (orgMatch) {
      const org = orgMatch[1].trim();
      if (org.toLowerCase().includes('nubank')) bankName = 'Nubank';
      else if (org.toLowerCase().includes('itau')) bankName = 'Itaú';
      else if (org.toLowerCase().includes('bradesco')) bankName = 'Bradesco';
      else if (org.toLowerCase().includes('santander')) bankName = 'Santander';
      else if (org.toLowerCase().includes('brasil') || org.toLowerCase().includes('bb')) bankName = 'Banco do Brasil';
      else if (org.toLowerCase().includes('inter')) bankName = 'Inter';
      else if (org.toLowerCase().includes('c6')) bankName = 'C6 Bank';
      else bankName = org;
    }

    const txRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
    let match;
    while ((match = txRegex.exec(text)) !== null) {
      const txContent = match[1];
      const typeMatch = txContent.match(/<TRNTYPE>([^<]+)/i);
      const dateMatch = txContent.match(/<DTPOSTED>([^<]+)/i);
      const amtMatch = txContent.match(/<TRNAMT>([^<]+)/i);
      const memoMatch = txContent.match(/<MEMO>([^<]+)/i) || txContent.match(/<NAME>([^<]+)/i);

      if (amtMatch && memoMatch && dateMatch) {
        const rawAmt = parseFloat(amtMatch[1].trim());
        const rawDate = dateMatch[1].trim(); // YYYYMMDD...
        const dateFormatted = `${rawDate.slice(0,4)}-${rawDate.slice(4,6)}-${rawDate.slice(6,8)}`;
        
        const isExpense = rawAmt < 0;
        const desc = memoMatch[1].trim();
        const category = guessCategory(desc, isExpense);

        transactions.push({
          description: desc,
          amount: Math.abs(rawAmt),
          type: isExpense ? 'expense' : 'income',
          category,
          date: dateFormatted,
          recurrence: 'none',
          is_realized: true,
        });
      }
    }

    // Try to get balance
    const balMatch = text.match(/<BALAMT>([^<]+)/i);
    if (balMatch && !manualBalance) {
      balance = parseFloat(balMatch[1].trim());
    }

    return { bankName, balance, transactions };
  };

  // CSV Parser
  const parseCSV = (text: string): { transactions: ParsedTransaction[] } => {
    const lines = text.split('\n');
    const transactions: ParsedTransaction[] = [];
    
    if (lines.length < 2) {
      throw new Error('Arquivo CSV vazio ou sem cabeçalhos.');
    }

    const header = lines[0];
    const sep = header.includes(';') ? ';' : ',';
    const cols = header.split(sep).map(c => c.trim().toLowerCase());

    const dateIdx = cols.findIndex(c => c.includes('data') || c.includes('date'));
    const valueIdx = cols.findIndex(c => c.includes('valor') || c.includes('value') || c.includes('amount'));
    const descIdx = cols.findIndex(c => c.includes('desc') || c.includes('memo') || c.includes('title') || c.includes('histórico') || c.includes('identificador') || c.includes('descrição'));

    if (dateIdx === -1 || valueIdx === -1 || descIdx === -1) {
      throw new Error('Não identificamos as colunas de Data, Valor ou Descrição no cabeçalho do CSV.');
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(sep).map(p => p.replace(/^"|"$/g, '').trim());
      if (parts.length < cols.length) continue;

      const rawDate = parts[dateIdx];
      const rawVal = parts[valueIdx];
      const rawDesc = parts[descIdx];

      // Parse value (handling R$ 1.000,00 or -123.45)
      let cleanedVal = rawVal.replace(/\s/g, '');
      const isNegative = cleanedVal.includes('-');
      cleanedVal = cleanedVal.replace(/[-+R$\s]/g, '');

      if (cleanedVal.includes(',') && cleanedVal.includes('.')) {
        cleanedVal = cleanedVal.replace(/\./g, '').replace(',', '.');
      } else if (cleanedVal.includes(',')) {
        cleanedVal = cleanedVal.replace(',', '.');
      }

      const amount = parseFloat(cleanedVal);
      if (isNaN(amount)) continue;

      // Parse date (DD/MM/YYYY or YYYY-MM-DD)
      let dateFormatted = '';
      if (rawDate.includes('/')) {
        const dParts = rawDate.split('/');
        if (dParts[0].length === 4) {
          dateFormatted = `${dParts[0]}-${dParts[1].padStart(2, '0')}-${dParts[2].padStart(2, '0')}`;
        } else {
          dateFormatted = `${dParts[2]}-${dParts[1].padStart(2, '0')}-${dParts[0].padStart(2, '0')}`;
        }
      } else if (rawDate.includes('-')) {
        const dParts = rawDate.split('-');
        if (dParts[0].length === 4) {
          dateFormatted = rawDate;
        } else {
          dateFormatted = `${dParts[2]}-${dParts[1].padStart(2, '0')}-${dParts[0].padStart(2, '0')}`;
        }
      }

      if (!dateFormatted || dateFormatted.length !== 10) continue;

      const isExpense = isNegative || parseFloat(rawVal.replace(/[R$\s]/g, '').replace(',', '.')) < 0;
      const category = guessCategory(rawDesc, isExpense);

      transactions.push({
        description: rawDesc,
        amount: Math.abs(amount),
        type: isExpense ? 'expense' : 'income',
        category,
        date: dateFormatted,
        recurrence: 'none',
        is_realized: true
      });
    }

    return { transactions };
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setUploadError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const isOfx = file.name.toLowerCase().endsWith('.ofx');
        const isCsv = file.name.toLowerCase().endsWith('.csv');

        if (!isOfx && !isCsv) {
          throw new Error('Formato de arquivo não suportado. Por favor, envie um arquivo .ofx ou .csv.');
        }

        const bankName = getBankName();

        if (isOfx) {
          const parsed = parseOFX(text);
          setPreviewData({
            bankName: parsed.bankName || bankName,
            balance: parsed.balance,
            limit: parseFloat(manualLimit) || 0,
            invoice: parseFloat(manualInvoice) || 0,
            transactions: parsed.transactions
          });
        } else {
          const parsed = parseCSV(text);
          setPreviewData({
            bankName: bankName,
            balance: parseFloat(manualBalance) || 0,
            limit: parseFloat(manualLimit) || 0,
            invoice: parseFloat(manualInvoice) || 0,
            transactions: parsed.transactions
          });
        }
      } catch (err: any) {
        console.error(err);
        setUploadError(err.message || 'Erro ao processar arquivo.');
        setPreviewData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (!previewData) return;

    connectBankFile(
      previewData.bankName,
      previewData.balance,
      previewData.limit,
      previewData.invoice,
      previewData.transactions
    );

    confetti({
      particleCount: 80,
      spread: 60,
      colors: ['#FFB7C5', '#FF4D6D']
    });

    // Reset state
    setFileName('');
    setPreviewData(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Minhas Contas e Cartões 🏦</h1>
          <p className="text-sm text-muted-foreground">Cadastre e gerencie suas contas bancárias manualmente ou faça upload offline de extratos.</p>
        </div>
      </div>

      {/* Active connections list */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base tracking-tight flex items-center gap-1.5">
          <span>💼 Suas Contas Cadastradas ({bankConnections.length})</span>
        </h3>

        {bankConnections.length === 0 ? (
          <div className="bg-card border border-border p-8 text-center rounded-3xl">
            <Landmark className="w-10 h-10 text-primary mx-auto mb-3" />
            <p className="text-sm font-semibold">Nenhuma conta cadastrada ainda. 🌸</p>
            <p className="text-xs text-muted-foreground mt-1">Utilize o formulário abaixo para adicionar uma conta manualmente ou importar um extrato bancário.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankConnections.map((conn) => (
              <div key={conn.id} className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{conn.logo}</span>
                    <div>
                      <h4 className="font-extrabold text-base">{conn.bank_name}</h4>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-green-600 bg-green-100 dark:bg-green-950/20 px-1.5 py-0.5 rounded-md">
                        Manual
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleStartEdit(conn)}
                      className="p-1.5 text-muted-foreground hover:text-accent rounded-lg hover:bg-muted transition-colors"
                      title="Editar saldo/limites"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => disconnectBank(conn.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-muted transition-colors"
                      title="Excluir conta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] text-muted-foreground block font-semibold">Saldo Disponível</span>
                    <span className="font-extrabold text-foreground">{formatBRL(conn.balance)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground block font-semibold">Fatura do Cartão</span>
                    <span className="font-extrabold text-amber-600">{formatBRL(conn.credit_card_invoice)}</span>
                  </div>
                  <div className="col-span-2 mt-2">
                    <span className="text-[9px] text-muted-foreground block font-semibold flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Limite de Crédito
                    </span>
                    <span className="font-bold text-foreground">{formatBRL(conn.limit)}</span>
                  </div>
                </div>

                <div className="text-[10px] text-muted-foreground mt-4 text-right">
                  Última alteração: {conn.connected_at}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form and Upload area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Add Manual Account Form */}
          <div className="bg-card border border-border p-6 rounded-3xl space-y-4 shadow-sm">
            <h3 className="font-extrabold text-base flex items-center gap-1.5">
              🌸 Cadastrar Nova Conta Bancária
            </h3>
            
            <form onSubmit={handleAddManualAccount} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground">Instituição Financeira</label>
                  <select 
                    value={selectedBank} 
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-accent text-foreground font-semibold"
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
                      className="w-full p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-accent text-foreground font-semibold"
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
                    className="w-full p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-accent text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground">Limite do Cartão de Crédito (R$) <span className="text-[10px] text-muted-foreground/60">(Opcional)</span></label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Ex: 5000.00"
                    value={manualLimit}
                    onChange={(e) => setManualLimit(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-accent text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground">Fatura Atual do Cartão (R$) <span className="text-[10px] text-muted-foreground/60">(Opcional)</span></label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Ex: 850.00"
                    value={manualInvoice}
                    onChange={(e) => setManualInvoice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-accent text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Adicionar Conta Manual
                </button>
              </div>
            </form>
          </div>

          {/* Import Offline File Area */}
          <div className="bg-card border border-border p-6 rounded-3xl space-y-4 shadow-sm">
            <h3 className="font-extrabold text-base flex items-center gap-1.5">
              📄 Importar Transações de Extrato (Offline)
            </h3>
            <p className="text-xs text-muted-foreground">Arraste um arquivo de extrato exportado do seu banco para importar transações e atualizar saldos offline.</p>
            
            {/* Drag and Drop Zone */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer relative ${
                dragActive ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40 bg-muted/10'
              }`}
            >
              <input 
                type="file" 
                accept=".ofx,.csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <Upload className="w-10 h-10 text-accent/80 mx-auto mb-2 animate-float" />
              <p className="text-sm font-bold text-foreground">
                {fileName ? `Selecionado: ${fileName}` : 'Arraste e solte seu arquivo de extrato aqui'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Suporta arquivos .OFX ou .CSV. O arquivo é processado localmente no seu navegador.
              </p>
            </div>

            {uploadError && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-500 text-xs font-semibold flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Import Instructions */}
        <div className="bg-card border border-border p-6 rounded-3xl space-y-4 shadow-sm h-fit">
          <h4 className="font-extrabold text-sm flex items-center gap-1.5 text-accent">
            <HelpCircle className="w-4 h-4 text-accent" />
            Como gerenciar suas contas?
          </h4>
          <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
            <div className="space-y-1">
              <span className="font-bold text-foreground block">1. Controle Totalmente Manual</span>
              <p>Cadastre suas contas e digite o saldo correspondente. Sempre que quiser atualizar, clique no ícone de lápis correspondente.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-foreground block">2. Extratos Locais</span>
              <p>Para poupar digitação, você pode baixar extratos OFX ou CSV do home banking e arrastá-los aqui. As transações serão inseridas e o saldo atualizado localmente.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-foreground block">3. Segurança Garantida</span>
              <p>Sem APIs de terceiros, sem chaves. Tudo é salvo localmente no seu navegador por meio de armazenamento seguro (localStorage).</p>
            </div>
          </div>
        </div>

        {/* Preview and Confirmation (Full-width overlay or card) */}
        {previewData && (
          <div className="col-span-1 lg:col-span-3 bg-card border border-primary p-6 rounded-3xl shadow-md space-y-5 animate-in slide-in-from-bottom-3 duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 bg-primary/20 text-accent rounded-full flex items-center justify-center text-2xl font-semibold">
                  {previewData.bankName === 'Nubank' ? '💜' : 
                   previewData.bankName === 'Itaú' ? '🧡' : 
                   previewData.bankName === 'Bradesco' ? '❤️' : 
                   previewData.bankName === 'Santander' ? '❤️' : 
                   previewData.bankName === 'Banco do Brasil' ? '💛' : '🏦'}
                </span>
                <div>
                  <h3 className="font-extrabold text-base">Revisar Importação: {previewData.bankName}</h3>
                  <p className="text-xs text-muted-foreground">Encontradas {previewData.transactions.length} transações no extrato.</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => { setPreviewData(null); setFileName(''); }}
                  className="px-4 py-2 border border-border hover:bg-muted text-muted-foreground font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmImport}
                  className="px-4 py-2 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition-all"
                >
                  Confirmar Importação <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-muted/20 border border-border rounded-xl">
                <span className="text-[10px] text-muted-foreground block font-bold uppercase">Saldo no Extrato</span>
                <span className="text-base font-extrabold text-foreground">{formatBRL(previewData.balance)}</span>
              </div>
              <div className="p-4 bg-muted/20 border border-border rounded-xl">
                <span className="text-[10px] text-muted-foreground block font-bold uppercase">Limite de Crédito</span>
                <span className="text-base font-extrabold text-foreground">{formatBRL(previewData.limit)}</span>
              </div>
              <div className="p-4 bg-muted/20 border border-border rounded-xl">
                <span className="text-[10px] text-muted-foreground block font-bold uppercase">Fatura Pendente</span>
                <span className="text-base font-extrabold text-amber-600">{formatBRL(previewData.invoice)}</span>
              </div>
            </div>

            {/* Transactions Preview List */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-muted-foreground uppercase">Transações Encontradas (Amostra dos primeiros 5 registros)</h4>
              <div className="border border-border rounded-2xl overflow-hidden divide-y divide-border text-xs">
                {previewData.transactions.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">Nenhuma transação encontrada no arquivo.</div>
                ) : (
                  previewData.transactions.slice(0, 5).map((tx, idx) => (
                    <div key={idx} className="p-3.5 flex justify-between items-center gap-2 hover:bg-muted/10">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-muted-foreground font-semibold">{tx.date}</span>
                        <span className="font-bold text-foreground block leading-tight">{tx.description}</span>
                        <span className="text-[9px] bg-primary/20 text-accent px-1.5 py-0.5 rounded-md font-semibold">{tx.category}</span>
                      </div>
                      <span className={`font-extrabold text-sm ${
                        tx.type === 'expense' ? 'text-red-500' : 'text-green-600'
                      }`}>
                        {tx.type === 'expense' ? '-' : '+'} {formatBRL(tx.amount)}
                      </span>
                    </div>
                  ))
                )}
                {previewData.transactions.length > 5 && (
                  <div className="p-3 bg-muted/20 text-[10px] text-muted-foreground font-bold text-center">
                    ...e mais {previewData.transactions.length - 5} transações adicionais prontas para importação.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Editing Modal */}
      {editingConnection && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
              <h3 className="font-bold text-sm">
                Editar Conta: {editingConnection.bank_name}
              </h3>
              <button 
                onClick={() => setEditingConnection(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleConfirmEdit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground">Saldo da Conta (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-accent text-foreground"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground">Limite do Cartão (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editLimit}
                  onChange={(e) => setEditLimit(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-accent text-foreground"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground">Fatura do Cartão (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editInvoice}
                  onChange={(e) => setEditInvoice(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-accent text-foreground"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button 
                  type="button"
                  onClick={() => setEditingConnection(null)}
                  className="px-4 py-2 border border-border hover:bg-muted rounded-xl font-semibold text-muted-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl font-bold transition-all shadow-sm"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
