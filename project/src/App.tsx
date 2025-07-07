import React, { useState, useEffect } from 'react';
import { FileText, Search, Plus, Upload, Battery, Settings, ArrowRight, Zap, BarChart3, Home, Users, Cloud } from 'lucide-react';
import DataInput from './components/DataInput';
import QuotesDashboard from './components/QuotesDashboard';
import { QuotePreview } from './components/QuotePreview';
import QuoteWizard from './components/QuoteWizard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import LoginForm from './components/LoginForm';
import UserProfile from './components/UserProfile';
import UserManagement from './components/UserManagement';
import GoogleDriveConfig from './components/GoogleDriveConfig';
import { Quote, User } from './types';
import { authService } from './services/authService';
import { googleDriveService } from './services/googleDriveService';

export default function App() {
  const [activeTab, setActiveTab] = useState<'input' | 'dashboard' | 'preview' | 'wizard' | 'analytics' | 'users' | 'cloud'>('input');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCloudConfig, setShowCloudConfig] = useState(false);

  // Verifica autenticazione all'avvio
  useEffect(() => {
    const checkAuth = async () => {
      const user = authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        // Carica preventivi da localStorage
        await loadQuotes(user);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Carica preventivi da localStorage in base ai permessi utente
  const loadQuotes = async (user: User) => {
    try {
      const stored = localStorage.getItem('ffd_all_quotes');
      if (stored) {
        const allQuotes = JSON.parse(stored).map((quote: any) => ({
          ...quote,
          createdAt: new Date(quote.createdAt),
          lastModifiedAt: quote.lastModifiedAt ? new Date(quote.lastModifiedAt) : undefined
        }));

        if (authService.hasPermission('view_all_quotes')) {
          // Admin/Manager: vede tutti i preventivi
          setQuotes(allQuotes);
        } else {
          // Commerciale: vede solo i propri preventivi
          const userQuotes = allQuotes.filter((quote: Quote) => quote.createdBy.id === user.id);
          setQuotes(userQuotes);
        }
      }
    } catch (error) {
      console.error('Errore caricamento preventivi:', error);
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    authService.logActivity(user.id, 'login', `Login effettuato da ${user.fullName}`);
    // Carica preventivi dopo il login
    loadQuotes(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setQuotes([]);
    setCurrentQuote(null);
    setActiveTab('input');
  };

  // Navigation items - sempre 4 pagine principali
  const mainNavigation = [
    { 
      id: 'input', 
      label: 'Home', 
      icon: Home, 
      disabled: false,
      color: 'from-gray-500 to-slate-600',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-500'
    },
    { 
      id: 'wizard', 
      label: 'Nuova Offerta', 
      icon: Plus, 
      disabled: false,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-700',
      borderColor: 'border-cyan-500'
    },
    { 
      id: 'dashboard', 
      label: 'Gestisci Offerte', 
      icon: Search, 
      disabled: false,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-500'
    },
    { 
      id: 'analytics', 
      label: 'Analisi Andamento', 
      icon: BarChart3, 
      disabled: !authService.hasPermission('view_analytics'),
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-500'
    },
    { 
      id: 'users', 
      label: 'Gestione Utenti', 
      icon: Users, 
      disabled: !authService.hasPermission('manage_users'),
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-500'
    }
  ];

  // Aggiungi configurazione cloud solo per admin
  if (authService.hasPermission('manage_users')) {
    mainNavigation.push({
      id: 'cloud', 
      label: 'Cloud Storage', 
      icon: Cloud, 
      disabled: false,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-500'
    });
  }

  // Handler per configurazione Google Drive
  const handleGoogleDriveConfigured = async (config: any) => {
    console.log('Google Drive configurato:', config);
    
    // Inizializza il servizio
    googleDriveService.updateConfig(config);
    await googleDriveService.initialize();
    
    // Esegui primo backup automatico
    try {
      const syncResult = await googleDriveService.autoSync();
      if (syncResult.success) {
        alert('✅ Google Drive configurato con successo!\n\n🔄 Primo backup automatico completato.\n☁️ I tuoi dati sono ora sincronizzati nel cloud.');
      }
    } catch (error) {
      console.error('Errore primo backup:', error);
    }
  };

  const handleQuoteGenerated = (quote: Quote) => {
    if (currentUser) {
      // Aggiungi informazioni utente al preventivo
      const quoteWithUser: Quote = {
        ...quote,
        createdBy: currentUser,
        lastModifiedBy: currentUser,
        lastModifiedAt: new Date()
      };
      
      setCurrentQuote(quoteWithUser);
      setActiveTab('preview');
    }
  };

  const handleQuoteConfirmed = async (quote: Quote) => {
    if (currentUser) {
      const confirmedQuote: Quote = {
        ...quote,
        id: Date.now().toString(),
        status: 'confirmed',
        createdAt: new Date(),
        createdBy: currentUser,
        lastModifiedBy: currentUser,
        lastModifiedAt: new Date()
      };

      try {
        // Salva in localStorage
        const existingQuotes = quotes;
        const updatedQuotes = [...existingQuotes, confirmedQuote];
        
        // Salva tutti i preventivi (per admin/manager) o aggiorna la vista locale
        const allQuotes = JSON.parse(localStorage.getItem('ffd_all_quotes') || '[]');
        const allUpdated = [...allQuotes.filter((q: Quote) => q.id !== confirmedQuote.id), confirmedQuote];
        localStorage.setItem('ffd_all_quotes', JSON.stringify(allUpdated));
        
        // Ricarica preventivi per aggiornare la vista
        await loadQuotes(currentUser);
        
        setCurrentQuote(null);
        setActiveTab('dashboard');

        // Log attività
        authService.logActivity(
          currentUser.id, 
          'create_quote', 
          `Preventivo ${confirmedQuote.quoteNumber} creato per ${confirmedQuote.customerData.company}`,
          { 
            quoteId: confirmedQuote.id,
            quoteNumber: confirmedQuote.quoteNumber,
            totalAmount: confirmedQuote.totalAmount,
            customerCompany: confirmedQuote.customerData.company
          }
        );

        alert('✅ Preventivo salvato con successo!');
      } catch (error) {
        console.error('Errore salvataggio preventivo:', error);
        alert('❌ Errore durante il salvataggio del preventivo.');
      }
    }
  };

  const handleQuoteUpdated = async (updatedQuote: Quote) => {
    if (currentUser) {
      const quoteWithUpdate: Quote = {
        ...updatedQuote,
        lastModifiedBy: currentUser,
        lastModifiedAt: new Date()
      };

      try {
        // Aggiorna in localStorage
        const allQuotes = JSON.parse(localStorage.getItem('ffd_all_quotes') || '[]');
        const allUpdated = allQuotes.map((q: Quote) => q.id === quoteWithUpdate.id ? quoteWithUpdate : q);
        localStorage.setItem('ffd_all_quotes', JSON.stringify(allUpdated));
        
        // Ricarica preventivi per aggiornare la vista
        await loadQuotes(currentUser);

        // Log attività
        authService.logActivity(
          currentUser.id,
          'update_quote',
          `Preventivo ${quoteWithUpdate.quoteNumber} modificato`,
          {
            quoteId: quoteWithUpdate.id,
            quoteNumber: quoteWithUpdate.quoteNumber
          }
        );

        alert('✅ Preventivo aggiornato con successo!');
      } catch (error) {
        console.error('Errore aggiornamento preventivo:', error);
        alert('❌ Errore durante l\'aggiornamento del preventivo.');
      }
    }
  };

  // Mostra loading durante verifica autenticazione
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Background animated elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-128 h-128 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-160 h-160 bg-cyan-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-10 right-10 w-64 h-64 bg-teal-500/8 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }}></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-500/8 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="text-center relative z-10">
          {/* Logo FFD Power */}
          <div className="bg-white rounded-3xl p-12 mb-16 inline-block shadow-2xl border-4 border-cyan-500/40 transform hover:scale-105 transition-all duration-700 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <img 
              src="/LOGO FFD POWER copy copy copy.png"
              alt="FFD Power" 
              className="h-48 w-auto relative z-10 drop-shadow-lg"
              onError={(e) => {
                console.error('Errore caricamento logo:', e);
                // Fallback: mostra testo se immagine non carica
                e.currentTarget.outerHTML = '<div class="text-6xl font-bold text-gray-800 relative z-10 tracking-wider">FFD POWER</div>';
              }}
              onLoad={() => console.log('Logo caricato con successo')}
            />
          </div>
          
          {/* Spinner animato */}
          <div className="relative mb-12">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-cyan-300/30 border-t-cyan-400 mx-auto shadow-lg"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full animate-pulse shadow-xl"></div>
            </div>
          </div>
          
          {/* Testo di caricamento */}
          <div className="space-y-6">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent animate-pulse tracking-wide">
              PowerOffer
            </h1>
            <p className="text-white text-2xl font-medium animate-pulse drop-shadow-lg">
              Caricamento sistema...
            </p>
            <p className="text-cyan-200 text-xl font-medium drop-shadow-md">
              Sistema Automatico Generazione Preventivi BESS
            </p>
            <div className="flex items-center justify-center space-x-4 mt-12">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce shadow-lg"></div>
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
          
          {/* Footer branding */}
          <div className="mt-24 text-center">
            <p className="text-gray-400 text-base font-medium">
              © 2024 FFD Power Italy S.r.l.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Battery Energy Storage Systems
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Mostra form di login se non autenticato
  if (!currentUser) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // Filtra navigazione in base ai permessi
  const navigationToShow = mainNavigation.filter(item => !item.disabled);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-cyan-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              {/* Logo con sfondo bianco */}
              <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-cyan-200 hover:border-cyan-300 transition-all duration-300">
                <img 
                  src="/LOGO FFD POWER copy copy copy.png"
                  alt="FFD Power" 
                  className="h-14 w-auto"
                  onError={(e) => {
                    console.error('Errore caricamento logo header:', e);
                    // Fallback: mostra testo se immagine non carica
                    e.currentTarget.outerHTML = '<div class="text-xl font-bold text-gray-800 px-4 py-2">FFD POWER</div>';
                  }}
                  onLoad={() => console.log('Logo header caricato con successo')}
                />
              </div>
              <div className="border-l border-cyan-300 pl-6">
                <h1 className="text-2xl font-bold text-cyan-600">
                  PowerOffer
                </h1>
                <p className="text-sm text-cyan-500 font-medium">Sistema Automatico Generazione Offerte BESS</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {/* User Profile Component */}
              <UserProfile user={currentUser} onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation - Sempre visibile tranne nella home */}
      {activeTab !== 'input' && (
        <nav className="bg-white/80 backdrop-blur-xl border-b border-cyan-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1">
              {navigationToShow.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center space-x-3 py-4 px-6 border-b-3 font-medium text-sm transition-all duration-300 rounded-t-lg ${
                      isActive
                        ? `border-cyan-500 text-cyan-600 bg-cyan-100 shadow-lg transform -translate-y-1`
                        : 'border-transparent text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 hover:shadow-md'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'animate-pulse' : ''}`} />
                    <span className="font-semibold">{item.label}</span>
                    {isActive && (
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className={activeTab === 'wizard' ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {activeTab === 'wizard' && (
          <QuoteWizard 
            onQuoteGenerated={handleQuoteGenerated}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}
        
        {activeTab === 'analytics' ? (
          <div className="bg-white rounded-2xl p-1 shadow-xl border border-purple-200">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100">
              <AnalyticsDashboard 
                quotes={quotes} 
                currentUser={currentUser}
              />
            </div>
          </div>
        ) : activeTab === 'dashboard' ? (
          <div className="bg-white rounded-2xl p-1 shadow-xl border border-blue-200">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100">
              <QuotesDashboard 
                quotes={quotes} 
                onQuoteUpdate={handleQuoteUpdated}
                currentUser={currentUser}
              />
            </div>
          </div>
        ) : activeTab === 'preview' && currentQuote ? (
          <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-2xl p-1 shadow-2xl border border-emerald-200/60">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-emerald-100/80 shadow-inner">
              <QuotePreview 
                quote={currentQuote} 
                onConfirm={handleQuoteConfirmed}
                onEdit={() => setActiveTab('wizard')}
              />
            </div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="bg-white rounded-2xl p-1 shadow-xl border border-red-200">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-red-100">
              <UserManagement currentUser={currentUser} />
            </div>
          </div>
        ) : activeTab === 'cloud' ? (
          <div className="bg-white rounded-2xl p-1 shadow-xl border border-green-200">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-green-100">
              <GoogleDriveConfig onConfigured={handleGoogleDriveConfigured} />
            </div>
          </div>
        ) : activeTab === 'input' ? (
          /* Homepage con pulsanti centrali */
          <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-3xl shadow-2xl border border-white/50 backdrop-blur-sm">
            <div className="max-w-4xl w-full">
              {/* Welcome Section */}
              <div className="text-center mb-16 px-8">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-slate-800 via-gray-700 to-slate-900 bg-clip-text text-transparent mb-6 tracking-tight">
                  Benvenuto in PowerOffer
                </h1>
                <p className="text-2xl text-slate-600 font-semibold mb-4 tracking-wide">
                  Sistema Automatico Generazione Offerte
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full"></div>
              </div>

              {/* Main Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 px-8 justify-items-center">
                {/* Nuova Offerta */}
                <button
                  onClick={() => setActiveTab('wizard')}
                  className="group relative overflow-hidden bg-gradient-to-br from-white to-cyan-50 rounded-3xl p-8 border-2 border-cyan-300/50 hover:border-cyan-400 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 backdrop-blur-sm w-full max-w-80"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-100/50 to-blue-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 rounded-2xl shadow-xl mb-6 mx-auto w-fit group-hover:scale-110 transition-transform duration-300 ring-4 ring-cyan-100">
                      <Plus className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-cyan-700 transition-colors">
                      Nuova Offerta BESS
                    </h3>
                    <div className="flex items-center justify-center space-x-2 text-cyan-700 font-bold">
                      <span>Crea offerta</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>

                {/* Gestisci Offerte */}
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="group relative overflow-hidden bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 border-2 border-blue-300/50 hover:border-blue-400 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 backdrop-blur-sm w-full max-w-80"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-indigo-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-2xl shadow-xl mb-6 mx-auto w-fit group-hover:scale-110 transition-transform duration-300 ring-4 ring-blue-100">
                      <Search className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-blue-700 transition-colors">
                      Gestisci Offerte BESS
                    </h3>
                    <div className="flex items-center justify-center space-x-2 text-blue-700 font-bold">
                      <span>Visualizza offerte</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>

                {/* Analisi Andamento (solo per admin/manager) */}
                {authService.hasPermission('view_analytics') && (
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="group relative overflow-hidden bg-gradient-to-br from-white to-purple-50 rounded-3xl p-8 border-2 border-purple-300/50 hover:border-purple-400 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 backdrop-blur-sm w-full max-w-80"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-100/50 to-indigo-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-2xl shadow-xl mb-6 mx-auto w-fit group-hover:scale-110 transition-transform duration-300 ring-4 ring-purple-100">
                        <BarChart3 className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-purple-700 transition-colors">
                        Analisi Andamento Offerte
                      </h3>
                      <div className="flex items-center justify-center space-x-2 text-purple-700 font-bold">
                        <span>Visualizza statistiche</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </button>
                )}

                {/* Gestione Utenti (solo per admin) */}
                {authService.hasPermission('manage_users') && (
                  <button
                    onClick={() => setActiveTab('users')}
                    className="group relative overflow-hidden bg-gradient-to-br from-white to-red-50 rounded-3xl p-8 border-2 border-red-300/50 hover:border-red-400 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30 backdrop-blur-sm w-full max-w-80"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-100/50 to-pink-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 rounded-2xl shadow-xl mb-6 mx-auto w-fit group-hover:scale-110 transition-transform duration-300 ring-4 ring-red-100">
                        <Users className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-red-700 transition-colors">
                        Gestione Utenti Sistema
                      </h3>
                      <div className="flex items-center justify-center space-x-2 text-red-700 font-bold">
                        <span>Amministra utenti</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}