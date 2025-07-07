import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, FileText, Calendar, Euro, Download, Send, User, Clock, RefreshCw } from 'lucide-react';
import { Quote, User as UserType } from '../types';
import { QuotePreview } from './QuotePreview';
import { generateQuotePDF, generateQuoteEmail } from '../utils/pdfGenerator';
import { authService } from '../services/authService';
import QuoteStatusManager from './QuoteStatusManager';

interface QuotesDashboardProps {
  quotes: Quote[];
  currentUser: UserType;
  onQuoteUpdate?: (quote: Quote) => void;
}

const QuotesDashboard: React.FC<QuotesDashboardProps> = ({ quotes, currentUser, onQuoteUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [usageFilter, setUsageFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [loadingActions, setLoadingActions] = useState<{[key: string]: boolean}>({});
  const [quotesStats, setQuotesStats] = useState<any>(null);

  // Load quotes stats on component mount and when quotes change
  useEffect(() => {
    try {
      const allQuotes = JSON.parse(localStorage.getItem('ffd_all_quotes') || '[]');
      const stats = {
        total: allQuotes.length,
        totalValue: allQuotes.reduce((sum: number, q: Quote) => sum + q.totalAmount, 0),
        byStatus: {} as { [key: string]: number }
      };

      allQuotes.forEach((quote: Quote) => {
        stats.byStatus[quote.status] = (stats.byStatus[quote.status] || 0) + 1;
      });

      setQuotesStats(stats);
    } catch (error) {
      console.error('Error loading quotes stats:', error);
      setQuotesStats({
        total: 0,
        totalValue: 0,
        byStatus: {}
      });
    }
  }, [quotes]);

  // Filtra preventivi in base ai permessi utente
  const getFilteredQuotes = () => {
    let filteredQuotes = quotes;

    // Se non è admin/manager, mostra solo i propri preventivi
    if (!authService.hasPermission('view_all_quotes')) {
      filteredQuotes = quotes.filter(quote => quote.createdBy.id === currentUser.id);
    }

    // Applica filtri di ricerca
    return filteredQuotes.filter(quote => {
      const matchesSearch = 
        quote.customerData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.customerData.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
      const matchesUsage = usageFilter === 'all' || quote.customerData.usage.includes(usageFilter);
      const matchesUser = userFilter === 'all' || quote.createdBy.id === userFilter;
      
      return matchesSearch && matchesStatus && matchesUsage && matchesUser;
    });
  };

  const filteredQuotes = getFilteredQuotes();

  // Ottieni lista utenti per filtro (solo per admin/manager)
  const availableUsers = authService.hasPermission('view_all_quotes') ? authService.getAllUsers() : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'confirmed': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'sent': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'accepted': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Bozza';
      case 'confirmed': return 'Confermato';
      case 'sent': return 'Inviato';
      case 'accepted': return 'Accettato';
      default: return status;
    }
  };

  const getUsageLabels = (usageArray: string[]) => {
    const usageMap: { [key: string]: string } = {
      'peak-shaving': 'Peak Shaving',
      'arbitraggio': 'Arbitraggio',
      'backup': 'Backup',
      'grid-services': 'Servizi Rete',
      'autoconsumo': 'Autoconsumo',
      'load-shifting': 'Load Shifting'
    };
    
    return usageArray.map(usage => usageMap[usage] || usage).join(', ');
  };

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setViewMode('detail');

    // Log attività visualizzazione
    authService.logActivity(
      currentUser.id,
      'view_quote',
      `Visualizzato preventivo ${quote.quoteNumber}`,
      { quoteId: quote.id, quoteNumber: quote.quoteNumber }
    );
  };

  const handleBackToList = () => {
    setSelectedQuote(null);
    setViewMode('list');
  };

  const handleQuoteUpdate = (updatedQuote: Quote) => {
    if (onQuoteUpdate) {
      onQuoteUpdate(updatedQuote);
    }
    handleBackToList();
  };

  const handleDownloadPDF = async (quote: Quote) => {
    const actionKey = `pdf-${quote.id}`;
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
    
    try {
      await generateQuotePDF(quote);
    } catch (error) {
      console.error('Errore download PDF:', error);
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleSendEmail = async (quote: Quote) => {
    const actionKey = `email-${quote.id}`;
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
    
    try {
      await generateQuoteEmail(quote);
      
      // Update quote status to 'sent' after email
      if (onQuoteUpdate) {
        const updatedQuote = { ...quote, status: 'sent' as const };
        onQuoteUpdate(updatedQuote);

        // Log attività invio
        authService.logActivity(
          currentUser.id,
          'send_quote',
          `Preventivo ${quote.quoteNumber} inviato a ${quote.customerData.email}`,
          { 
            quoteId: quote.id, 
            quoteNumber: quote.quoteNumber,
            customerEmail: quote.customerData.email
          }
        );
      }
    } catch (error) {
      console.error('Errore invio email:', error);
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleStatusChange = (quote: Quote, newStatus: Quote['status']) => {
    if (onQuoteUpdate) {
      const updatedQuote = { 
        ...quote, 
        status: newStatus,
        lastModifiedBy: currentUser,
        lastModifiedAt: new Date()
      };
      onQuoteUpdate(updatedQuote);

      // Log attività cambio stato
      authService.logActivity(
        currentUser.id,
        'update_quote',
        `Stato preventivo ${quote.quoteNumber} cambiato in: ${getStatusLabel(newStatus)}`,
        { 
          quoteId: quote.id, 
          quoteNumber: quote.quoteNumber,
          oldStatus: quote.status,
          newStatus: newStatus
        }
      );

      // Refresh automatico dei dati
    }
  };

  const totalValue = filteredQuotes.reduce((sum, quote) => sum + quote.totalAmount, 0);
  const totalPower = filteredQuotes.reduce((sum, quote) => sum + quote.customerData.power, 0);

  // Show quote detail view
  if (viewMode === 'detail' && selectedQuote) {
    return (
      <div className="space-y-6 p-6 bg-white rounded-xl shadow-lg">
        {/* Back Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToList}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg"
          >
            <span>← Torna alla Lista</span>
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">Offerta {selectedQuote.referenceCode}</h1>
            <div className="flex items-center space-x-6 text-sm text-gray-600 mt-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Creato da: {selectedQuote.createdBy.fullName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{selectedQuote.createdAt.toLocaleDateString('it-IT')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4" />
                <span>{selectedQuote.customerData.company}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Actions */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => handleDownloadPDF(selectedQuote)}
            disabled={loadingActions[`pdf-${selectedQuote.id}`]}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 shadow-lg"
          >
            {loadingActions[`pdf-${selectedQuote.id}`] ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generando...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Scarica PDF</span>
              </>
            )}
          </button>
          <button
            onClick={() => handleSendEmail(selectedQuote)}
            disabled={loadingActions[`email-${selectedQuote.id}`]}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50 shadow-lg"
          >
            {loadingActions[`email-${selectedQuote.id}`] ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Inviando...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Invia al Cliente</span>
              </>
            )}
          </button>
        </div>

        {/* Quote Preview Component */}
        <QuotePreview
          quote={selectedQuote}
          onConfirm={handleQuoteUpdate}
          onEdit={handleBackToList}
        />
      </div>
    );
  }

  // Show list view
  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-xl">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="group bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-cyan-200/50 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 rounded-xl shadow-md">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-800">{filteredQuotes.length}</div>
                <div className="text-sm text-gray-600 font-medium">
                  {authService.hasPermission('view_all_quotes') ? 'Offerte Totali' : 'Le Mie Offerte'}
                </div>
              </div>
            </div>
            {authService.hasPermission('view_all_quotes') && quotesStats && (
              <div className="text-xs text-cyan-600 font-medium bg-cyan-50 px-2 py-1 rounded-full">
                {quotesStats.total || 0} totali nel sistema
              </div>
            )}
          </div>
        </div>
        
        <div className="group bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-200/50 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-3 rounded-xl shadow-md">
                <Euro className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-800">€{totalValue.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-gray-600 font-medium">Valore Totale</div>
              </div>
            </div>
            {authService.hasPermission('view_all_quotes') && quotesStats && (
              <div className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
                €{(quotesStats.totalValue || 0).toLocaleString('it-IT')} sistema
              </div>
            )}
          </div>
        </div>

        <div className="group bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-200/50 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-3 rounded-xl shadow-md">
                <Battery className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">{totalPower.toLocaleString()} kW</div>
                <div className="text-xl font-bold text-purple-600">{filteredQuotes.reduce((sum, quote) => sum + quote.customerData.capacity, 0).toLocaleString()} kWh</div>
                <div className="text-sm text-gray-600 font-medium">Potenza / Capacità</div>
              </div>
            </div>
          </div>
        </div>

        <div className="group bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200/50 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-3 rounded-xl shadow-md">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-800">{filteredQuotes.filter(q => q.status === 'accepted').length}</div>
                <div className="text-sm text-gray-600 font-medium">Accettati</div>
              </div>
            </div>
            {authService.hasPermission('view_all_quotes') && quotesStats && (
              <div className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full">
                {quotesStats.byStatus?.['accepted'] || 0} totali
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {authService.hasPermission('view_all_quotes') ? 'Gestione Offerte BESS' : 'Le Mie Offerte BESS'}
          </h1>
          <p className="text-gray-300 mt-2 font-medium">
            {filteredQuotes.length} di {quotes.length} offert{quotes.length !== 1 ? 'e' : 'a'}
            {!authService.hasPermission('view_all_quotes') && (
              <span className="ml-2 text-cyan-300 font-bold">
                (Solo le tue offerte)
              </span>
            )}
          </p>
        </div>
        
      </div>

      {/* Filters */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca per cliente, azienda o numero offerta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-gray-800 transition-all placeholder-gray-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-gray-800 transition-all"
              >
                <option value="all">Tutti gli stati</option>
                <option value="draft">Bozza</option>
                <option value="confirmed">Confermato</option>
                <option value="sent">Inviato</option>
                <option value="accepted">Accettato</option>
              </select>
            </div>

            <select
              value={usageFilter}
              onChange={(e) => setUsageFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-gray-800 transition-all"
            >
              <option value="all">Tutti i servizi</option>
              <option value="peak-shaving">Peak Shaving</option>
              <option value="arbitraggio">Arbitraggio</option>
              <option value="backup">Backup</option>
              <option value="grid-services">Servizi Rete</option>
              <option value="autoconsumo">Autoconsumo</option>
              <option value="load-shifting">Load Shifting</option>
            </select>

            {/* Filtro per utente (solo per admin/manager) */}
            {authService.hasPermission('view_all_quotes') && (
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-gray-800 transition-all"
              >
                <option value="all">Tutti i commerciali</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.fullName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {filteredQuotes.length === 0 ? (
          <div className="text-center py-16">
            <Battery className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <p className="text-gray-800 text-xl font-medium">
              {quotes.length === 0 ? 'Nessuna offerta BESS creata' : 'Nessuna offerta trovata'}
            </p>
            <p className="text-gray-600 text-sm mt-2">
              {quotes.length === 0 
                ? 'Inizia creando la tua prima offerta BESS' 
                : 'Modifica i filtri di ricerca'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Codice / Offerta
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Importo
                  </th>
                  {authService.hasPermission('view_all_quotes') && (
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Commerciale
                    </th>
                  )}
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50 transition-all duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-bold text-cyan-600 font-mono">
                          {quote.referenceCode || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {quote.customerData.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {quote.customerData.company}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-bold text-gray-900">
                        <Euro className="h-4 w-4 mr-1 text-emerald-400" />
                        {quote.totalAmount.toLocaleString('it-IT')}
                      </div>
                    </td>
                    {authService.hasPermission('view_all_quotes') && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 shadow-lg">
                            {quote.createdBy.avatar || quote.createdBy.fullName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              {quote.createdBy.fullName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {quote.createdBy.department}
                            </div>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {quote.createdAt.toLocaleDateString('it-IT')}
                      </div>
                      {quote.lastModifiedAt && quote.lastModifiedBy && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1 text-gray-400" />
                          Mod. da {quote.lastModifiedBy.fullName.split(' ')[0]}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <QuoteStatusManager
                        quote={quote}
                        onStatusChange={(newStatus) => handleStatusChange(quote, newStatus)}
                        currentUser={currentUser}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleViewQuote(quote)}
                          className="text-cyan-600 hover:text-cyan-700 transition-colors p-2 hover:bg-cyan-50 rounded-lg"
                          title="Visualizza offerta"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDownloadPDF(quote)}
                          disabled={loadingActions[`pdf-${quote.id}`]}
                          className="text-emerald-600 hover:text-emerald-700 transition-colors p-2 hover:bg-emerald-50 rounded-lg disabled:opacity-50"
                          title="Scarica PDF"
                        >
                          {loadingActions[`pdf-${quote.id}`] ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                          ) : (
                            <Download className="h-5 w-5" />
                          )}
                        </button>
                        <button 
                          onClick={() => handleSendEmail(quote)}
                          disabled={loadingActions[`email-${quote.id}`]}
                          className="text-purple-600 hover:text-purple-700 transition-colors p-2 hover:bg-purple-50 rounded-lg disabled:opacity-50"
                          title="Invia email"
                        >
                          {loadingActions[`email-${quote.id}`] ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                          ) : (
                            <Send className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotesDashboard;