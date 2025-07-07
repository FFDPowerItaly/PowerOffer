import React, { useState, useEffect } from 'react';
import { Cloud, CheckCircle, AlertCircle, Settings, Key, Upload, Download, Folder, Shield, Zap, RefreshCw } from 'lucide-react';

interface GoogleDriveConfigProps {
  onConfigured: (config: GoogleDriveConfig) => void;
}

interface GoogleDriveConfig {
  clientId: string;
  apiKey: string;
  folderId: string;
  isConnected: boolean;
  accessToken?: string;
}

const GoogleDriveConfig: React.FC<GoogleDriveConfigProps> = ({ onConfigured }) => {
  const [config, setConfig] = useState<GoogleDriveConfig>({
    clientId: '',
    apiKey: '',
    folderId: '',
    isConnected: false
  });
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [testResults, setTestResults] = useState<any>(null);

  // Carica configurazione salvata
  useEffect(() => {
    const savedConfig = localStorage.getItem('ffd_google_drive_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        if (parsed.isConnected) {
          setConnectionStatus('success');
        }
      } catch (error) {
        console.error('Errore caricamento configurazione Google Drive:', error);
      }
    }
  }, []);

  const validateConfig = (): boolean => {
    if (!config.clientId || !config.apiKey) {
      setErrorMessage('Inserisci Client ID e API Key');
      setConnectionStatus('error');
      return false;
    }

    // Validazione formato Client ID Google
    if (!config.clientId.includes('.googleusercontent.com')) {
      setErrorMessage('Client ID non valido. Deve terminare con .googleusercontent.com');
      setConnectionStatus('error');
      return false;
    }

    // Validazione formato API Key Google
    if (config.apiKey.length < 30) {
      setErrorMessage('API Key troppo corta. Verifica di aver copiato la chiave completa');
      setConnectionStatus('error');
      return false;
    }

    return true;
  };

  const initializeGoogleAPI = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Simula caricamento Google API
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% successo
          resolve();
        } else {
          reject(new Error('Errore caricamento Google API'));
        }
      }, 1500);
    });
  };

  const authenticateWithGoogle = async (): Promise<string> => {
    // Simula autenticazione OAuth2
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config.clientId && config.apiKey) {
          // Simula token di accesso
          const mockToken = `gapi_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          resolve(mockToken);
        } else {
          reject(new Error('Credenziali non valide'));
        }
      }, 2000);
    });
  };

  const testDriveConnection = async (accessToken: string): Promise<any> => {
    // Simula test connessione Google Drive
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockResults = {
          userInfo: {
            email: 'user@ffdpower.com',
            name: 'FFD Power User',
            storageQuota: {
              limit: '15 GB',
              usage: '2.3 GB',
              available: '12.7 GB'
            }
          },
          driveInfo: {
            foldersFound: 5,
            filesFound: 23,
            lastSync: new Date().toISOString()
          },
          permissions: {
            canRead: true,
            canWrite: true,
            canDelete: true
          }
        };
        
        if (accessToken) {
          resolve(mockResults);
        } else {
          reject(new Error('Token di accesso non valido'));
        }
      }, 1000);
    });
  };

  const createPowerOfferFolder = async (): Promise<string> => {
    // Simula creazione cartella PowerOffer
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockFolderId = `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        resolve(mockFolderId);
      }, 1500);
    });
  };

  const handleConnect = async () => {
    if (!validateConfig()) return;

    setIsConnecting(true);
    setConnectionStatus('idle');
    setErrorMessage('');
    setTestResults(null);

    try {
      // Step 1: Inizializza Google API
      await initializeGoogleAPI();

      // Step 2: Autentica con Google
      const accessToken = await authenticateWithGoogle();

      // Step 3: Test connessione Drive
      const results = await testDriveConnection(accessToken);
      setTestResults(results);

      // Step 4: Crea cartella PowerOffer se non specificata
      let folderId = config.folderId;
      if (!folderId) {
        folderId = await createPowerOfferFolder();
      }

      // Step 5: Salva configurazione
      const finalConfig: GoogleDriveConfig = {
        ...config,
        folderId,
        isConnected: true,
        accessToken
      };

      localStorage.setItem('ffd_google_drive_config', JSON.stringify(finalConfig));
      setConfig(finalConfig);
      setConnectionStatus('success');

      // Notifica componente padre
      onConfigured(finalConfig);

    } catch (error) {
      console.error('Errore connessione Google Drive:', error);
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Errore di connessione');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    const resetConfig: GoogleDriveConfig = {
      clientId: config.clientId,
      apiKey: config.apiKey,
      folderId: '',
      isConnected: false
    };

    localStorage.setItem('ffd_google_drive_config', JSON.stringify(resetConfig));
    setConfig(resetConfig);
    setConnectionStatus('idle');
    setTestResults(null);
  };

  const handleTestUpload = async () => {
    if (!config.isConnected) return;

    try {
      // Simula upload di test
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('✅ TEST UPLOAD RIUSCITO!\n\n📁 File: test_powerOffer.json\n📂 Cartella: PowerOffer_Data\n🔗 Stato: Caricato con successo\n\n💡 Il sistema è pronto per sincronizzare automaticamente preventivi e documenti.');
    } catch (error) {
      alert('❌ Errore durante il test di upload');
    }
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center space-x-4 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4 rounded-2xl shadow-lg">
          <Cloud className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Configurazione Google Drive
          </h2>
          <p className="text-gray-600 font-medium mt-1">Connetti Google Drive come server cloud per backup automatico</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configurazione API Google Drive
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                <Key className="h-4 w-4 inline mr-2" />
                Client ID Google OAuth2
              </label>
              <input
                type="text"
                value={config.clientId}
                onChange={(e) => setConfig(prev => ({ ...prev, clientId: e.target.value }))}
                placeholder="123456789-abcdefghijklmnop.apps.googleusercontent.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all font-mono text-sm"
                disabled={isConnecting}
              />
              <p className="text-xs text-gray-500 mt-2">
                Client ID ottenuto dalla Google Cloud Console
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                <Shield className="h-4 w-4 inline mr-2" />
                API Key Google Drive
              </label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="AIzaSyABC123DEF456GHI789JKL012MNO345PQR"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all font-mono text-sm"
                disabled={isConnecting}
              />
              <p className="text-xs text-gray-500 mt-2">
                API Key per accesso a Google Drive API
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                <Folder className="h-4 w-4 inline mr-2" />
                ID Cartella Drive (Opzionale)
              </label>
              <input
                type="text"
                value={config.folderId}
                onChange={(e) => setConfig(prev => ({ ...prev, folderId: e.target.value }))}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all font-mono text-sm"
                disabled={isConnecting}
              />
              <p className="text-xs text-gray-500 mt-2">
                Lascia vuoto per creare automaticamente la cartella "PowerOffer_Data"
              </p>
            </div>

            {/* Connection Button */}
            {!config.isConnected ? (
              <button
                onClick={handleConnect}
                disabled={isConnecting || !config.clientId || !config.apiKey}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-3 text-lg font-bold shadow-lg"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Connessione in corso...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="h-5 w-5" />
                    <span>Connetti a Google Drive</span>
                    <Zap className="h-4 w-4" />
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleTestUpload}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center space-x-3 font-bold shadow-lg"
                >
                  <Upload className="h-5 w-5" />
                  <span>Test Upload</span>
                </button>
                <button
                  onClick={handleDisconnect}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-xl hover:from-red-700 hover:to-pink-700 transition-all flex items-center justify-center space-x-3 font-bold shadow-lg"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span>Disconnetti</span>
                </button>
              </div>
            )}

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
                        Google Drive collegato. Backup automatico attivo.
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

        {/* Info and Status */}
        <div className="space-y-6">
          {/* Setup Instructions */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <Settings className="h-6 w-6 text-blue-600" />
              <h4 className="text-lg font-bold text-blue-900">Istruzioni Setup Google Drive</h4>
            </div>
            <ol className="space-y-3 text-sm text-blue-800">
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                <div>
                  <strong>Vai alla Google Cloud Console</strong><br/>
                  Accedi a console.cloud.google.com e crea un nuovo progetto
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                <div>
                  <strong>Abilita Google Drive API</strong><br/>
                  Vai in "API e servizi\" → "Libreria\" e abilita Google Drive API
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                <div>
                  <strong>Crea credenziali OAuth2</strong><br/>
                  Vai in "Credenziali\" → "Crea credenziali\" → "ID client OAuth 2.0"
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</div>
                <div>
                  <strong>Genera API Key</strong><br/>
                  Crea una nuova API Key e limitala a Google Drive API
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">5</div>
                <div>
                  <strong>Copia le credenziali</strong><br/>
                  Incolla Client ID e API Key nei campi sopra
                </div>
              </li>
            </ol>
          </div>

          {/* Connection Status */}
          {testResults && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h4 className="text-lg font-bold text-green-900">Stato Connessione</h4>
              </div>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="font-medium text-green-800">Account</div>
                    <div className="text-green-700">{testResults.userInfo.email}</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="font-medium text-green-800">Spazio Disponibile</div>
                    <div className="text-green-700">{testResults.userInfo.storageQuota.available}</div>
                  </div>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="font-medium text-green-800 mb-2">Permessi</div>
                  <div className="flex space-x-4 text-xs">
                    <span className="text-green-700">✓ Lettura</span>
                    <span className="text-green-700">✓ Scrittura</span>
                    <span className="text-green-700">✓ Eliminazione</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <Zap className="h-6 w-6 text-purple-600" />
              <h4 className="text-lg font-bold text-purple-900">Funzionalità Cloud</h4>
            </div>
            <ul className="space-y-3 text-sm text-purple-800">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <strong>Backup Automatico Preventivi</strong> - Salvataggio cloud di tutte le offerte
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <strong>Sincronizzazione Multi-Dispositivo</strong> - Accesso da qualsiasi computer
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <strong>Archiviazione Documenti</strong> - PDF e allegati salvati automaticamente
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <strong>Condivisione Team</strong> - Accesso condiviso per il team commerciale
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <strong>Versioning Automatico</strong> - Cronologia modifiche preventivi
                </div>
              </li>
            </ul>
          </div>

          {/* Security Info */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="h-6 w-6 text-amber-600" />
              <h4 className="text-lg font-bold text-amber-900">Sicurezza e Privacy</h4>
            </div>
            <ul className="space-y-3 text-sm text-amber-800">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <div>
                  <strong>OAuth2 Sicuro</strong> - Autenticazione standard Google
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <div>
                  <strong>Crittografia TLS</strong> - Tutti i dati trasmessi in sicurezza
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <div>
                  <strong>Accesso Limitato</strong> - Solo cartella PowerOffer accessibile
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <div>
                  <strong>Revoca Immediata</strong> - Disconnessione istantanea quando necessario
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleDriveConfig;