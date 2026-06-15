'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useFinanceState } from '../context/FinanceContext';
import { 
  LayoutDashboard, 
  PiggyBank, 
  CreditCard, 
  TrendingUp, 
  Landmark, 
  Calendar, 
  Sparkles, 
  Moon, 
  Sun, 
  Bell, 
  Menu, 
  X,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { 
    profile, 
    notifications, 
    markNotificationRead, 
    clearNotifications, 
    theme, 
    toggleTheme,
    updateProfile,
    importState,
    exportState,
    showValues,
    toggleShowValues
  } = useFinanceState();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [salaryAmount, setSalaryAmount] = useState('');
  const [salaryDay, setSalaryDay] = useState('');
  const [profileError, setProfileError] = useState('');

  // Sync inputs when modal opens or profile changes
  React.useEffect(() => {
    if (showProfileSettings) {
      setProfileName(profile.name || '');
      setSalaryAmount(profile.salaryAmount?.toString() || '');
      setSalaryDay(profile.salaryDay?.toString() || '');
      setProfileError('');
    }
  }, [showProfileSettings, profile]);

  const menuItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Dívidas', href: '/debts', icon: CreditCard },
    { name: 'Caixinhas', href: '/caixinhas', icon: PiggyBank },
    { name: 'Transações', href: '/transactions', icon: TrendingUp },
    { name: 'Cartões', href: '/bank-integration', icon: CreditCard },
    { name: 'Calendário', href: '/calendar', icon: Calendar },
    { name: 'Assistente Virtual', href: '/helozinha', icon: Sparkles },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-300 relative font-inter">
      
      {/* Ambient background glowing circles/blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-pink-500/15 to-purple-600/5 blur-[120px] dark:from-pink-500/10 dark:to-purple-600/5 animate-pulse-slow" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-cyan-500/15 to-indigo-600/5 blur-[120px] dark:from-cyan-500/10 dark:to-indigo-600/5 animate-pulse-slow" style={{ animationDelay: '-4s' }} />
        <div className="absolute top-[35%] left-[25%] w-[35vw] h-[35vw] rounded-full bg-gradient-to-r from-blue-500/10 to-teal-400/5 blur-[100px] dark:from-blue-500/5 dark:to-teal-400/3 animate-float" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 lg:w-72 glass-panel border-r border-border/60 shrink-0 transition-colors duration-300 z-10">
        {/* Brand */}
        <div className="p-6 border-b border-border/60 flex items-center gap-3 select-none">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white text-sm font-bold shadow-md shadow-accent/20">
            HF
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none tracking-tight text-foreground font-outfit">Helo Finanças</h1>
            <span className="text-[10px] text-muted-foreground font-medium">Gestão Pessoal</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? 'glass-card text-foreground shadow-sm font-semibold border-white/20 dark:border-white/10 scale-102' 
                    : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                }`}
              >
                {isActive && <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-accent rounded-r-full" />}
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-accent' : 'text-muted-foreground'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile Footer */}
        <div 
          onClick={() => setShowProfileSettings(true)}
          className="p-4 border-t border-border/60 bg-muted/20 flex items-center justify-between gap-2 cursor-pointer hover:bg-muted/30 transition-colors"
          title="Configurar Perfil"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent shrink-0 shadow-inner">
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold truncate text-foreground">{profile.name || 'Usuário'}</p>
              <p className="text-xs text-muted-foreground">Premium</p>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); toggleTheme(); }} 
            className="p-2 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors"
            title="Alternar Tema"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Main Work Area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden relative z-10">
        
        {/* Top Header */}
        <header className="h-16 border-b border-border/60 glass-panel flex items-center justify-between px-6 shrink-0 z-30 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-muted/30 text-muted-foreground"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="hidden md:block font-bold text-lg text-foreground font-outfit">
              {menuItems.find(item => item.href === pathname)?.name || 'Controle Financeiro'}
            </h2>
            <div className="md:hidden flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center text-white text-[10px] font-extrabold shadow-sm">HF</span>
              <span className="font-bold text-xs font-outfit">Helo Finanças</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle show/hide values */}
            <button 
              onClick={toggleShowValues} 
              className="p-2.5 rounded-full hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-all"
              title={showValues ? "Ocultar Valores" : "Exibir Valores"}
            >
              {showValues ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-full hover:bg-muted/30 relative text-muted-foreground hover:text-foreground transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-accent border-2 border-background flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel border border-border/60 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="p-4 border-b border-border/60 flex items-center justify-between bg-muted/20">
                    <span className="font-bold text-sm font-outfit">Notificações</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={clearNotifications}
                        className="text-xs text-accent hover:underline font-semibold"
                      >
                        Limpar todas
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground text-xs">
                        Nenhuma notificação por aqui.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-4 transition-colors ${notif.read ? 'bg-transparent' : 'bg-accent/5 hover:bg-accent/10'}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 font-outfit">
                              {notif.title}
                            </h4>
                            {!notif.read && (
                              <button 
                                onClick={() => markNotificationRead(notif.id)}
                                className="p-1 rounded-md hover:bg-muted/30 text-accent"
                                title="Marcar como lida"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notif.content}</p>
                          <span className="text-[10px] text-muted-foreground/60 block mt-2">{notif.date}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile-Only Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="md:hidden p-2.5 rounded-full hover:bg-muted/30 text-muted-foreground hover:text-foreground"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 bg-transparent">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation (acting like PWA) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-2 z-40 transition-colors duration-300">
          {menuItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-accent scale-105' : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] mt-1 font-semibold truncate max-w-full">
                  {item.name.split(' ')[0]}
                </span>
              </Link>
            );
          })}
          {/* Calendar link in mobile navigation too (replacing Open Finance on main bottom-bar for space) */}
          <Link
            href="/calendar"
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200 ${
              pathname === '/calendar' ? 'text-accent scale-105' : 'text-muted-foreground'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-semibold">Agenda</span>
          </Link>
        </nav>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        >
          {/* Drawer Menu */}
          <div 
            className="w-72 max-w-[80vw] h-full bg-card border-r border-border p-6 flex flex-col justify-between transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 select-none">
                  <span className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white text-xs font-bold shadow-sm">HF</span>
                  <span className="font-bold text-sm text-foreground">Menu</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div 
              onClick={() => { setShowProfileSettings(true); setMobileMenuOpen(false); }}
              className="border-t border-border pt-4 flex items-center justify-between cursor-pointer hover:bg-muted/20 p-2 rounded-xl transition-colors"
              title="Configurar Perfil"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent shrink-0">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-xs font-semibold">{profile.name || 'Usuário'}</p>
                  <p className="text-[10px] text-muted-foreground">Premium</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Profile Settings and Backup Modal */}
      {showProfileSettings && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="modal-sheet w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-3 duration-300 relative flex flex-col max-h-[90vh]">
            {/* iOS handle pill */}
            <div className="w-12 h-1.5 bg-muted-foreground/20 dark:bg-muted-foreground/30 rounded-full mx-auto mt-3 -mb-2 shrink-0" />
            <div className="p-5 border-b border-border/40 flex justify-between items-center bg-muted/20 select-none">
              <h3 className="font-extrabold text-base flex items-center gap-1.5 text-accent font-outfit">
                Configurações do Perfil
              </h3>
              <button 
                onClick={() => setShowProfileSettings(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {profileError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-500 font-bold flex items-center gap-1.5">
                  <span>⚠️ {profileError}</span>
                </div>
              )}

              {/* Profile Config Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const amount = parseFloat(salaryAmount);
                  const day = parseInt(salaryDay);
                  
                  if (!profileName.trim()) {
                    setProfileError('O nome do usuário é obrigatório.');
                    return;
                  }

                  updateProfile({
                    ...profile,
                    name: profileName,
                    salaryAmount: isNaN(amount) ? undefined : amount,
                    salaryDay: isNaN(day) || day < 1 || day > 31 ? undefined : day
                  });
                  
                  confetti({
                    particleCount: 50,
                    spread: 40,
                    colors: ['#FFB7C5', '#FF4D6D']
                  });
                  
                  setShowProfileSettings(false);
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground">Seu Nome</label>
                  <input 
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-accent text-sm text-foreground"
                    placeholder="Digite seu nome"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-muted-foreground">Salário Mensal (R$)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={salaryAmount}
                      onChange={(e) => setSalaryAmount(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-accent text-sm text-foreground"
                      placeholder="Ex: 5000.00"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-muted-foreground">Dia do Pagamento</label>
                    <input 
                      type="number"
                      min="1"
                      max="31"
                      value={salaryDay}
                      onChange={(e) => setSalaryDay(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-accent text-sm text-foreground"
                      placeholder="Ex: 5"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>

              <div className="border-t border-border pt-5 space-y-4">
                <h4 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                  Backup & Transferência de Dados
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Exporte todo o seu histórico financeiro (contas, caixinhas, dívidas, metas e transações) em um arquivo JSON para transferir de dispositivo sem perder nenhum dado.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button 
                    type="button"
                    onClick={() => {
                      const jsonStr = exportState();
                      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(jsonStr);
                      const exportFileDefaultName = `helo_financ_backup_${new Date().toISOString().split('T')[0]}.json`;
                      const linkElement = document.createElement('a');
                      linkElement.setAttribute('href', dataUri);
                      linkElement.setAttribute('download', exportFileDefaultName);
                      linkElement.click();
                    }}
                    className="py-3 px-4 border border-border hover:bg-muted font-bold rounded-xl transition-all text-center flex flex-col items-center justify-center gap-1 hover:border-primary/50 text-foreground"
                  >
                    <span>Exportar Backup</span>
                  </button>
 
                  <label 
                    className="py-3 px-4 border border-border hover:bg-muted font-bold rounded-xl transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 text-foreground"
                  >
                    <span>Importar Backup</span>
                    <input 
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        if (!e.target.files || !e.target.files[0]) return;
                        const fileReader = new FileReader();
                        fileReader.onload = (event) => {
                          const text = event.target?.result as string;
                          const success = importState(text);
                          if (success) {
                            confetti({
                              particleCount: 100,
                              spread: 70,
                              origin: { y: 0.6 },
                              colors: ['#FFB7C5', '#FF4D6D']
                            });
                            setShowProfileSettings(false);
                          } else {
                            setProfileError('Arquivo inválido ou corrompido. Certifique-se de que é um arquivo JSON exportado por este aplicativo.');
                          }
                        };
                        fileReader.readAsText(e.target.files[0]);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
