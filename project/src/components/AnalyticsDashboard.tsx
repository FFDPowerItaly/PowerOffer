import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Battery, Calendar, Users, Award, Zap, Euro, FileText, Target } from 'lucide-react';
import { Quote, User } from '../types';
import { authService } from '../services/authService';

interface AnalyticsDashboardProps {
  quotes: Quote[];
  currentUser: User;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ quotes, currentUser }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    calculateAnalytics();
  }, [quotes, timeRange]);

  const calculateAnalytics = () => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Filtra preventivi per periodo
    const filteredQuotes = quotes.filter(quote => 
      new Date(quote.createdAt) >= cutoffDate
    );

    // Calcola metriche
    const totalQuotes = filteredQuotes.length;
    const totalValue = filteredQuotes.reduce((sum, q) => sum + q.totalAmount, 0);
    const totalPower = filteredQuotes.reduce((sum, q) => sum + q.customerData.power, 0);

    // Statistiche per stato
    const byStatus = {
      draft: filteredQuotes.filter(q => q.status === 'draft').length,
      confirmed: filteredQuotes.filter(q => q.status === 'confirmed').length,
      sent: filteredQuotes.filter(q => q.status === 'sent').length,
      accepted: filteredQuotes.filter(q => q.status === 'accepted').length
    };

    // Valore per stato
    const valueByStatus = {
      draft: filteredQuotes.filter(q => q.status === 'draft').reduce((sum, q) => sum + q.totalAmount, 0),
      confirmed: filteredQuotes.filter(q => q.status === 'confirmed').reduce((sum, q) => sum + q.totalAmount, 0),
      sent: filteredQuotes.filter(q => q.status === 'sent').reduce((sum, q) => sum + q.totalAmount, 0),
      accepted: filteredQuotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.totalAmount, 0)
    };

    // Tasso di conversione
    const conversionRate = totalQuotes > 0 ? (byStatus.accepted / totalQuotes) * 100 : 0;

    // Trend mensile (ultimi 6 mesi)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      const monthQuotes = quotes.filter(q => {
        const qDate = new Date(q.createdAt);
        return qDate >= monthStart && qDate <= monthEnd;
      });

      monthlyTrend.push({
        month: monthDate.toLocaleDateString('it-IT', { month: 'short' }),
        quotes: monthQuotes.length,
        value: monthQuotes.reduce((sum, q) => sum + q.totalAmount, 0),
        accepted: monthQuotes.filter(q => q.status === 'accepted').length
      });
    }

    // Top clienti
    const customerStats = {};
    filteredQuotes.forEach(quote => {
      const company = quote.customerData.company;
      if (!customerStats[company]) {
        customerStats[company] = {
          company,
          quotes: 0,
          totalValue: 0,
          accepted: 0
        };
      }
      customerStats[company].quotes++;
      customerStats[company].totalValue += quote.totalAmount;
      if (quote.status === 'accepted') {
        customerStats[company].accepted++;
      }
    });

    const topCustomers = Object.values(customerStats)
      .sort((a: any, b: any) => b.totalValue - a.totalValue)
      .slice(0, 5);

    // Performance commerciali (se admin/manager)
    let salesPerformance = [];
    if (authService.hasPermission('view_all_quotes')) {
      const salesStats = {};
      filteredQuotes.forEach(quote => {
        const salesId = quote.createdBy.id;
        if (!salesStats[salesId]) {
          salesStats[salesId] = {
            user: quote.createdBy,
            quotes: 0,
            totalValue: 0,
            accepted: 0
          };
        }
        salesStats[salesId].quotes++;
        salesStats[salesId].totalValue += quote.totalAmount;
        if (quote.status === 'accepted') {
          salesStats[salesId].accepted++;
        }
      });

      salesPerformance = Object.values(salesStats)
        .sort((a: any, b: any) => b.totalValue - a.totalValue);
    }

    setAnalytics({
      totalQuotes,
      totalValue,
      totalPower,
      byStatus,
      valueByStatus,
      conversionRate,
      monthlyTrend,
      topCustomers,
      salesPerformance
    });
  };

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'confirmed': return 'text-cyan-600 bg-cyan-100';
      case 'sent': return 'text-yellow-600 bg-yellow-100';
      case 'accepted': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Bozze';
      case 'confirmed': return 'Confermati';
      case 'sent': return 'Inviati';
      case 'accepted': return 'Accettati';
      default: return status;
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analisi Andamento Offerte</h1>
          <p className="text-gray-600 mt-2">Analisi dettagliata delle performance commerciali e offerte</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
          {[
            { value: '7d', label: '7 giorni' },
            { value: '30d', label: '30 giorni' },
            { value: '90d', label: '90 giorni' },
            { value: '1y', label: '1 anno' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeRange === option.value
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Quotes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-cyan-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-cyan-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{analytics.totalQuotes}</div>
              <div className="text-sm text-gray-600">Offerte Totali</div>
            </div>
          </div>
        </div>

        {/* Total Value */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Euro className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                €{(analytics.totalValue / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-gray-600">Valore Totale</div>
            </div>
          </div>
        </div>

        {/* Total Power */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {(analytics.totalPower / 1000).toFixed(1)} MW
              </div>
              <div className="text-sm text-gray-600">Potenza Totale</div>
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {analytics.conversionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Tasso Conversione</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Distribuzione Offerte per Stato
          </h3>
          
          <div className="space-y-4">
            {Object.entries(analytics.byStatus).map(([status, count]) => {
              const percentage = analytics.totalQuotes > 0 ? (count as number / analytics.totalQuotes) * 100 : 0;
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {getStatusLabel(status)}
                    </span>
                    <span className="text-sm text-gray-600">{count as number}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-cyan-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Trend Mensile
          </h3>
          
          <div className="space-y-4">
            {analytics.monthlyTrend.map((month: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900 w-8">{month.month}</span>
                  <span className="text-sm text-gray-600">{month.quotes} preventivi</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-green-600">
                    €{(month.value / 1000).toFixed(0)}k
                  </span>
                  <span className="text-xs text-gray-500">
                    {month.accepted} accettati
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Value by Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Valore per Stato Offerta
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(analytics.valueByStatus).map(([status, value]) => (
            <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                €{((value as number) / 1000).toFixed(0)}k
              </div>
              <div className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(status)}`}>
                {getStatusLabel(status)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Customers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Top Clienti per Valore
          </h3>
          
          <div className="space-y-4">
            {analytics.topCustomers.map((customer: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{customer.company}</div>
                    <div className="text-sm text-gray-600">{customer.quotes} preventivi</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    €{(customer.totalValue / 1000).toFixed(0)}k
                  </div>
                  <div className="text-sm text-green-600">
                    {customer.accepted} accettati
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Performance (only for admin/manager) */}
        {authService.hasPermission('view_all_quotes') && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Performance Commerciali
            </h3>
            
            <div className="space-y-4">
              {analytics.salesPerformance.slice(0, 5).map((sales: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {sales.user.avatar || sales.user.fullName.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{sales.user.fullName}</div>
                      <div className="text-sm text-gray-600">{sales.quotes} preventivi</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      €{(sales.totalValue / 1000).toFixed(0)}k
                    </div>
                    <div className="text-sm text-green-600">
                      {sales.accepted} accettati
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* System Stats */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Battery className="h-5 w-5 mr-2" />
          Statistiche Sistema BESS
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-600 mb-2">
              {(analytics.totalCapacity / 1000).toFixed(1)} MWh
            </div>
            <div className="text-sm text-gray-600">Capacità Totale Offerta</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 flex items-center justify-center">
              <Euro className="h-6 w-6 mr-1" />
              {analytics.totalValue > 0 ? (analytics.totalValue / analytics.totalPower).toFixed(0) : '0'}
            </div>
            <div className="text-sm text-gray-600">€/kW Medio</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;