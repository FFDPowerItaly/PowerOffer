import React, { useState } from 'react';
import { Check, Clock, Send, Award, ChevronDown, Calendar, User } from 'lucide-react';
import { Quote, User as UserType } from '../types';

interface QuoteStatusManagerProps {
  quote: Quote;
  onStatusChange: (newStatus: Quote['status']) => void;
  currentUser: UserType;
}

const QuoteStatusManager: React.FC<QuoteStatusManagerProps> = ({ 
  quote, 
  onStatusChange, 
  currentUser 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const statusOptions = [
    {
      value: 'draft' as const,
      label: 'Bozza',
      icon: Clock,
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      bgColor: 'bg-gray-500',
      description: 'Offerta in preparazione'
    },
    {
      value: 'confirmed' as const,
      label: 'Confermato',
      icon: Check,
      color: 'bg-cyan-100 text-cyan-700 border-cyan-300',
      bgColor: 'bg-cyan-500',
      description: 'Offerta finalizzata e pronta'
    },
    {
      value: 'sent' as const,
      label: 'Inviato',
      icon: Send,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      bgColor: 'bg-yellow-500',
      description: 'Offerta inviata al cliente'
    },
    {
      value: 'accepted' as const,
      label: 'Accettato',
      icon: Award,
      color: 'bg-green-100 text-green-700 border-green-300',
      bgColor: 'bg-green-500',
      description: 'Cliente ha accettato l\'offerta'
    }
  ];

  const currentStatus = statusOptions.find(s => s.value === quote.status);
  const CurrentIcon = currentStatus?.icon || Clock;

  const handleStatusChange = (newStatus: Quote['status']) => {
    onStatusChange(newStatus);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 hover:shadow-md text-sm font-medium ${currentStatus?.color || 'bg-gray-100 text-gray-700 border-gray-300'}`}
      >
        <CurrentIcon className="h-4 w-4" />
        <span>{currentStatus?.label || 'Sconosciuto'}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-bold text-gray-800">Cambia Stato Offerta</h3>
              <p className="text-sm text-gray-600 mt-1">
                Offerta: {quote.quoteNumber} - {quote.customerData.company}
              </p>
            </div>
            
            <div className="p-2">
              {statusOptions.map((status) => {
                const Icon = status.icon;
                const isSelected = status.value === quote.status;
                
                return (
                  <button
                    key={status.value}
                    onClick={() => handleStatusChange(status.value)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                      isSelected 
                        ? 'bg-cyan-50 border-2 border-cyan-200' 
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${status.bgColor}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-800">{status.label}</div>
                      <div className="text-sm text-gray-500">{status.description}</div>
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 text-cyan-600" />
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <User className="h-3 w-3" />
                <span>Ultima modifica: {currentUser.fullName}</span>
                <Calendar className="h-3 w-3 ml-2" />
                <span>{new Date().toLocaleDateString('it-IT')}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuoteStatusManager;