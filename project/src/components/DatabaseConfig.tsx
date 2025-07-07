import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertCircle, Settings, Key, Server, Zap, Shield, Cloud } from 'lucide-react';
import { createDatabaseService } from '../services/databaseService';

interface DatabaseConfigProps {
  onConfigured: (service: any) => void;
}

const DatabaseConfig: React.FC<DatabaseConfigProps> = ({ onConfigured }) => {
  const [serverUrl, setServerUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Carica configurazione salvata
  useEffect(() => {
    const savedConfig = localStorage.getItem('ffdpower_db_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setServerUrl(config.serverUrl || '');
      setApiKey(config.apiKey || '');
    }
  }, []);

  const testConnection = async () => {
    if (!serverUrl || !apiKey) {
      setErrorMessage('Inserisci URL server e API Key');
      setConnectionStatus('error');
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('idle');
    setErrorMessage('');

    try {
      const dbService = createDatabaseService(serverUrl, apiKey);
      const isConnected = await dbService.testConnection();

      if (isConnected) {
        setConnectionStatus('success');
        
        // Salva configurazione
        localStorage.setItem('ffdpower_db_config', JSON.stringify({
          serverUrl,
          apiKey
        }));

        // Notifica componente padre
        onConfigured(dbService);
      } else {
        setConnectionStatus('error');
        setErrorMessage('Connessione fallita. Verifica URL e API Key.');
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(`Errore: ${error instanceof Error ? error.message : 'Connessione fallita'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center space-x-4 mb-8">
        <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-4 rounded-2xl shadow-lg">
          <Database className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
            Configurazione Database Aziendale
          </h2>
          <p className="text-gray-600 font-medium mt-1">Connetti al server FFDPOWER per documenti e prezzi aggiornati</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configurazione Connessione
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                <Server className="h-4 w-4 inline mr-2" />
                URL Server Database
              </label>
              <input
                type="url"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="https://database.ffdpower.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/80 backdrop-blur-sm transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">
                URL del server database aziendale FFDPOWER
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                <Key className="h-4 w-4 inline mr-2" />
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Inserisci API Key aziendale"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/80 backdrop-blur-sm transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">
                Chiave API per accesso ai documenti e prezzi
              </p>
            </div>

            <button
              onClick={testConnection}
              disabled={isConnecting || !serverUrl || !apiKey}
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-3 text-lg font-bold shadow-lg"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Test connessione...</span>
                </>
              ) : (
                <>
                  <Database className="h-5 w-5" />
                  <span>Testa Connessione</span>
                  <Zap className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Status Connection */}
            {connectionStatus !== 'idle' && (
              <div className={`p-6 rounded-xl flex items-center space-x-3 ${
                connectionStatus === 'success' 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
                  : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200'
              }`}>
                {connectionStatus === 'success' ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <div className="text-sm font-bold text-green-800">
                        Connessione riuscita!
                      </div>
                      <div className="text-xs text-green-700 mt-1">
                        Database aziendale collegato. Documenti e prezzi aggiornati disponibili.
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-6 w-6 text-red-600" />
                    <div>
                      <div className="text-sm font-bold text-red-800">
                        Errore connessione
                      </div>
                      <div className="text-xs text-red-700 mt-1">
                        {errorMessage}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Features Info */}
        <div className="space-y-6">
          {/* Info Box */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <Cloud className="h-6 w-6 text-blue-600" />
              <h4 className="text-lg font-bold text-blue-900">Documenti Automatici Disponibili</h4>
            </div>
            <ul className="space-y-3 text-sm text-blue-800">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <strong>Schemi Elettrici PowerPoint</strong> - Personalizzati per utilizzo specifico
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <strong>Certificazioni</strong> - CE, IEC, documenti conformità aggiornati
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <strong>Datasheet Prodotti</strong> - Versioni più recenti dal database
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <strong>Prezzi Real-time</strong> - Listini aggiornati automaticamente
                </div>
              </li>
            </ul>
          </div>

          {/* Security Info */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="h-6 w-6 text-green-600" />
              <h4 className="text-lg font-bold text-green-900">Sicurezza e Privacy</h4>
            </div>
            <ul className="space-y-3 text-sm text-green-800">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <strong>Connessione Crittografata</strong> - SSL/TLS per tutti i dati
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <strong>API Key Sicura</strong> - Autenticazione a chiave privata
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <strong>Accesso Controllato</strong> - Solo dati autorizzati
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <strong>Backup Automatico</strong> - Dati sempre protetti
                </div>
              </li>
            </ul>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <Zap className="h-6 w-6 text-purple-600" />
              <h4 className="text-lg font-bold text-purple-900">Vantaggi Connessione Database</h4>
            </div>
            <ul className="space-y-3 text-sm text-purple-800">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <strong>Documenti Sempre Aggiornati</strong> - Ultima versione automatica
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <strong>Prezzi Real-time</strong> - Listini sempre attuali
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <strong>Schemi Personalizzati</strong> - PowerPoint su misura
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <strong>Efficienza Massima</strong> - Tutto automatizzato
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseConfig;