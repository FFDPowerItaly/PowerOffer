import React, { useState } from 'react';
import { ArrowRight, Users, Settings, Package, FileText } from 'lucide-react';
import { CustomerData, QuoteItem, Quote } from '../types';
import { generateQuote, generateQuoteFromItems } from '../utils/quoteGenerator';
import CustomerDataStep from './wizard/CustomerDataStep';
import TechnicalDataStep from './wizard/TechnicalDataStep';
import ProductSelectionStep from './wizard/ProductSelectionStep';

interface QuoteWizardProps {
  onQuoteGenerated: (quote: Quote) => void;
  onCancel: () => void;
}

const QuoteWizard: React.FC<QuoteWizardProps> = ({ onQuoteGenerated, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    installationType: 'BESS',
    power: 0,
    capacity: 0,
    connectionType: 'BT',
    usage: [],
    applicationArea: 'industriale',
    additionalNotes: '',
    hasPV: false,
    pvPower: 0,
    validityDays: 30
  });

  const [selectedItems, setSelectedItems] = useState<QuoteItem[]>([]);

  const steps = [
    {
      id: 1,
      title: 'Dati Cliente',
      description: 'Informazioni cliente e caricamento documenti',
      icon: Users,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 2,
      title: 'Specifiche Tecniche',
      description: 'Requisiti sistema e utilizzo',
      icon: Settings,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 3,
      title: 'Selezione Prodotti',
      description: 'Configurazione sistema ottimale',
      icon: Package,
      color: 'from-indigo-500 to-purple-600'
    }
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setIsGenerating(true);
    try {
      let quote: Quote;
      
      if (selectedItems.length > 0) {
        quote = await generateQuoteFromItems(customerData, selectedItems);
      } else {
        quote = await generateQuote(customerData);
      }
      
      onQuoteGenerated(quote);
    } catch (error) {
      console.error('Error generating quote:', error);
      alert('Errore durante la generazione del preventivo. Riprova.');
    } finally {
      setIsGenerating(false);
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(customerData.name && customerData.email && customerData.company);
      case 2:
        return !!(customerData.power > 0 && customerData.capacity > 0 && customerData.usage.length > 0);
      case 3:
        return true; // Step 3 is always valid (can proceed with AI suggestion)
      default:
        return false;
    }
  };

  const canProceed = isStepValid(currentStep);

  // Calculate data completion percentage
  const getDataCompletionPercentage = (): number => {
    let totalFields = 0;
    let completedFields = 0;

    // Step 1: Customer Data (8 fields)
    totalFields += 8;
    if (customerData.name) completedFields++;
    if (customerData.email) completedFields++;
    if (customerData.phone) completedFields++;
    if (customerData.company) completedFields++;
    if (customerData.address) completedFields++;
    if (customerData.additionalNotes) completedFields++;
    if (customerData.hasPV !== undefined) completedFields++;
    if (customerData.hasPV && customerData.pvPower > 0) completedFields++;

    // Step 2: Technical Data (5 fields)
    totalFields += 5;
    if (customerData.power > 0) completedFields++;
    if (customerData.capacity > 0) completedFields++;
    if (customerData.connectionType && customerData.connectionType !== 'BT') completedFields++;
    if (customerData.usage.length > 0) completedFields++;
    if (customerData.applicationArea) completedFields++;

    // Step 3: Product Selection (1 field)
    totalFields += 1;
    if (selectedItems.length > 0) completedFields++;

    return Math.min((completedFields / totalFields) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div>
              <h1 className="text-2xl font-bold text-white">Nuova Offerta Guidata</h1>
              <p className="text-white/60">Creazione offerta in 3 semplici passaggi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const isValid = isStepValid(step.id);
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <button 
                    onClick={() => setCurrentStep(step.id)}
                    className="flex items-center group hover:scale-105 transition-all duration-300"
                  >
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-r ${step.color} border-transparent text-white shadow-lg`
                          : 'border-gray-500 text-gray-500 bg-gray-500/10 group-hover:bg-gray-400/20 group-hover:border-gray-400'
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <div
                        className={`text-sm font-bold transition-colors ${
                          isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                        }`}
                      >
                        Step {step.id}: {step.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-400 transition-colors">{step.description}</div>
                    </div>
                  </button>
                  
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-8">
                      <div
                        className={`h-1 rounded-full transition-all duration-300 ${
                          'bg-gray-600'
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Data Completion Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Completamento Dati</span>
              <span className="text-sm font-bold text-cyan-400">{Math.round(getDataCompletionPercentage())}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${getDataCompletionPercentage()}%` }}
              >
                <div className="h-full bg-white/20 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1">
        {currentStep === 1 && (
          <CustomerDataStep
            customerData={customerData}
            onDataChange={setCustomerData}
          />
        )}
        
        {currentStep === 2 && (
          <TechnicalDataStep
            customerData={customerData}
            onDataChange={setCustomerData}
          />
        )}
        
        {currentStep === 3 && (
          <ProductSelectionStep
            customerData={customerData}
            selectedItems={selectedItems}
            onItemsChange={setSelectedItems}
          />
        )}
      </div>

      {/* Navigation Footer */}
      <div className="bg-white/10 backdrop-blur-xl border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all shadow-lg"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Indietro</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Validation Messages */}
              {!canProceed && (
                <div className="text-sm text-yellow-300 bg-yellow-500/20 px-4 py-2 rounded-lg border border-yellow-500/30">
                  {currentStep === 1 && 'Completa: Nome, Email e Azienda'}
                  {currentStep === 2 && 'Completa: Potenza, Capacità e almeno un servizio'}
                </div>
              )}

              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <span>Avanti</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={isGenerating}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 shadow-lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generazione in corso...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5" />
                     <span>Genera Offerta</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteWizard;