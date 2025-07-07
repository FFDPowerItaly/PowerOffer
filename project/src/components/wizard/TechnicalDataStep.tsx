import React from 'react';
import { Settings, Battery, Zap, Sun, Grid, Factory, Building, Home, Truck, Cog, Calendar } from 'lucide-react';
import { CustomerData } from '../../types';

interface TechnicalDataStepProps {
  customerData: CustomerData;
  onDataChange: (data: CustomerData) => void;
}

const TechnicalDataStep: React.FC<TechnicalDataStepProps> = ({ customerData, onDataChange }) => {
  const updateField = (field: keyof CustomerData, value: any) => {
    onDataChange({ ...customerData, [field]: value });
  };

  const handleUsageChange = (usageValue: string, checked: boolean) => {
    const newUsage = checked 
      ? [...customerData.usage, usageValue]
      : customerData.usage.filter(u => u !== usageValue);
    updateField('usage', newUsage);
  };

  const usageOptions = [
    { 
      value: 'peak-shaving', 
      label: 'Peak Shaving', 
      description: 'Riduzione picchi di potenza per ottimizzare i costi energetici',
      icon: Zap,
      color: 'from-red-400 to-pink-500' 
    },
    { 
      value: 'arbitraggio', 
      label: 'Arbitraggio Energetico', 
      description: 'Compra/vendi energia sfruttando le variazioni di prezzo',
      icon: Grid,
      color: 'from-cyan-400 to-blue-500' 
    },
    { 
      value: 'backup', 
      label: 'Backup/UPS', 
      description: 'Alimentazione di emergenza per continuità operativa',
      icon: Battery,
      color: 'from-orange-400 to-amber-500' 
    },
    { 
      value: 'grid-services', 
      label: 'Servizi di Rete', 
      description: 'Regolazione frequenza/tensione per stabilità della rete',
      icon: Grid,
      color: 'from-blue-400 to-cyan-500' 
    },
    { 
      value: 'autoconsumo', 
      label: 'Autoconsumo', 
      description: 'Ottimizzazione energia rinnovabile da fotovoltaico',
      icon: Sun,
      color: 'from-purple-400 to-violet-500' 
    },
    { 
      value: 'load-shifting', 
      label: 'Load Shifting', 
      description: 'Spostamento carichi nelle ore più convenienti',
      icon: Zap,
      color: 'from-indigo-400 to-blue-500' 
    }
  ];

  const applicationAreas = [
    { value: 'industriale', label: 'Industriale', icon: Factory, description: 'Stabilimenti produttivi, industrie manifatturiere' },
    { value: 'commerciale', label: 'Commerciale', icon: Building, description: 'Centri commerciali, uffici, hotel' },
    { value: 'utility', label: 'Utility Scale', icon: Grid, description: 'Grandi impianti per servizi di rete' },
    { value: 'residenziale', label: 'Residenziale', icon: Home, description: 'Condomini, complessi residenziali' }
  ];

  const connectionTypes = [
    { value: 'BT', label: 'Bassa Tensione (BT)', description: 'Fino a 1 kV - Tipico per piccole/medie utenze' },
    { value: 'MT', label: 'Media Tensione (MT)', description: '1-35 kV - Utenze industriali e commerciali' },
    { value: 'AT', label: 'Alta Tensione (AT)', description: 'Oltre 35 kV - Grandi utenze e utility' }
  ];

  return (
    <div className="p-8">
      <div className="flex items-center space-x-4 mb-8">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 rounded-xl shadow-lg">
          <Cog className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dati Tecnici e Utilizzo</h2>
          <p className="text-gray-600">Definisci le specifiche tecniche e l'utilizzo previsto del sistema BESS</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Specifiche Sistema BESS */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-cyan-200">
          <h3 className="text-lg font-bold text-gray-800 flex items-center mb-6">
            <Battery className="h-5 w-5 mr-2" />
            Specifiche Sistema BESS Richieste
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                💡 Potenza Richiesta (kW) *
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={customerData.power || ''}
                onChange={(e) => updateField('power', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-cyan-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-cyan-50 text-gray-800 transition-all font-medium"
                placeholder=""
              />
              <p className="text-xs text-gray-400 mt-2">Potenza massima richiesta dal sistema</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                🔋 Capacità Richiesta (kWh) *
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={customerData.capacity || ''}
                onChange={(e) => updateField('capacity', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-cyan-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-cyan-50 text-gray-800 transition-all font-medium"
                placeholder=""
              />
              <p className="text-xs text-gray-400 mt-2">Energia totale da immagazzinare</p>
            </div>
          </div>

          {/* Durata calcolata */}
          {customerData.power > 0 && customerData.capacity > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-600">
                <strong>Durata di scarica calcolata:</strong> {(customerData.capacity / customerData.power).toFixed(1)} ore
              </div>
            </div>
          )}
        </div>

        {/* Collegamento POD */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center mb-6">
            <Grid className="h-5 w-5 mr-2" />
            Collegamento alla Rete
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {connectionTypes.map((connection) => {
              const isSelected = customerData.connectionType === connection.value;
              
              return (
                <button
                  key={connection.value}
                  onClick={() => updateField('connectionType', connection.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-50 shadow-lg scale-105'
                      : 'border-gray-300 bg-white hover:border-cyan-400 hover:bg-cyan-50'
                  }`}
                >
                  <div className={`font-bold text-sm ${isSelected ? 'text-cyan-600' : 'text-gray-800'}`}>
                    {connection.label}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {connection.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fotovoltaico */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-yellow-200">
          <h3 className="text-lg font-bold text-gray-800 flex items-center mb-6">
            <Sun className="h-5 w-5 mr-2" />
            Impianto Fotovoltaico
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                È presente o previsto un impianto fotovoltaico?
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => updateField('hasPV', false)}
                  className={`px-6 py-3 rounded-xl border-2 transition-all ${
                    !customerData.hasPV
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-600'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-yellow-400'
                  }`}
                >
                  No
                </button>
                <button
                  onClick={() => updateField('hasPV', true)}
                  className={`px-6 py-3 rounded-xl border-2 transition-all ${
                    customerData.hasPV
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-600'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-yellow-400'
                  }`}
                >
                  Sì
                </button>
              </div>
            </div>

            {customerData.hasPV && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Potenza Fotovoltaico (kW)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={customerData.pvPower || ''}
                  onChange={(e) => updateField('pvPower', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-yellow-50 text-gray-800 transition-all"
                  placeholder="es. 800"
                />
              </div>
            )}
          </div>
        </div>

        {/* Servizi BESS */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center mb-6">
            <Zap className="h-5 w-5 mr-2" />
            Servizi BESS Richiesti *
          </h3>
          <p className="text-gray-400 text-sm mb-6">Seleziona tutti i servizi che il sistema BESS dovrà fornire</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usageOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = customerData.usage.includes(option.value);
              
              return (
                <div
                  key={option.value}
                  className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'border-transparent shadow-lg scale-105'
                      : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                  }`}
                  onClick={() => handleUsageChange(option.value, !isSelected)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${option.color} opacity-${
                    isSelected ? '20' : '0'
                  } transition-opacity duration-300`}></div>
                  <div className="relative flex items-start space-x-4 p-4 bg-white/90 backdrop-blur-sm">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleUsageChange(option.value, e.target.checked)}
                      className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-500 rounded transition-all"
                    />
                    <Icon className={`h-6 w-6 mt-1 ${isSelected ? 'text-cyan-500' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <div className={`text-sm font-bold cursor-pointer ${isSelected ? 'text-gray-800' : 'text-gray-600'}`}>
                        {option.label}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{option.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {customerData.usage.length === 0 && (
            <p className="text-sm text-red-400 mt-4 font-medium">Seleziona almeno un servizio BESS per procedere</p>
          )}
        </div>

        {/* Area di Applicazione */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center mb-6">
            <Building className="h-5 w-5 mr-2" />
            Area di Applicazione
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {applicationAreas.map((area) => {
              const Icon = area.icon;
              const isSelected = customerData.applicationArea === area.value;
              
              return (
                <button
                  key={area.value}
                  onClick={() => updateField('applicationArea', area.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-50 shadow-lg scale-105'
                      : 'border-gray-300 bg-white hover:border-cyan-400 hover:bg-cyan-50'
                  }`}
                >
                  <Icon className={`h-6 w-6 mb-3 ${isSelected ? 'text-cyan-500' : 'text-gray-400'}`} />
                  <div className={`font-bold text-sm ${isSelected ? 'text-cyan-600' : 'text-gray-800'}`}>
                    {area.label}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {area.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Descrizione Utilizzo */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center mb-6">
            <Settings className="h-5 w-5 mr-2" />
            Descrizione Dettagliata dell'Utilizzo
          </h3>
          
          <textarea
            value={customerData.additionalNotes}
            onChange={(e) => updateField('additionalNotes', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-gray-800 transition-all"
            placeholder="Descrivi in dettaglio come verrà utilizzato il sistema BESS, eventuali vincoli operativi, orari di funzionamento, obiettivi specifici..."
          />
        </div>

        {/* Validità Offerta */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-amber-200">
          <h3 className="text-lg font-bold text-gray-800 flex items-center mb-6">
            <Calendar className="h-5 w-5 mr-2" />
            Validità Offerta
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                📅 Giorni di Validità dell'Offerta
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={customerData.validityDays || 30}
                onChange={(e) => updateField('validityDays', parseInt(e.target.value) || 30)}
                className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 text-gray-800 transition-all font-medium"
                placeholder="30"
              />
              <p className="text-xs text-gray-400 mt-2">
                Numero di giorni dalla data di emissione per cui l'offerta rimane valida
              </p>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="bg-amber-100 border border-amber-300 rounded-xl p-4 text-center">
                <div className="text-sm text-amber-700 font-medium mb-2">
                  Data Scadenza Calcolata
                </div>
                <div className="text-lg font-bold text-amber-800">
                  {(() => {
                    const expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() + (customerData.validityDays || 30));
                    return expiryDate.toLocaleDateString('it-IT', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    });
                  })()}
                </div>
                <div className="text-xs text-amber-600 mt-1">
                  ({customerData.validityDays || 30} giorni da oggi)
                </div>
              </div>
            </div>
          </div>
          
          {/* Opzioni predefinite */}
          <div className="mt-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Opzioni Rapide
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { days: 15, label: '15 giorni' },
                { days: 30, label: '30 giorni (Standard)' },
                { days: 45, label: '45 giorni' },
                { days: 60, label: '60 giorni' },
                { days: 90, label: '90 giorni' }
              ].map((option) => (
                <button
                  key={option.days}
                  type="button"
                  onClick={() => updateField('validityDays', option.days)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 text-sm font-medium ${
                    (customerData.validityDays || 30) === option.days
                      ? 'border-amber-500 bg-amber-100 text-amber-700 shadow-md'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-amber-400 hover:bg-amber-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalDataStep;