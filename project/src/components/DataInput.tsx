import React, { useState } from 'react';
import { Upload, FileText, Mail, Battery, AlertCircle, CheckCircle, Zap, Brain, FileSpreadsheet, FileImage, BookOpen, Sun, Calendar } from 'lucide-react';
import { CustomerData, FileUpload, Quote, QuoteItem } from '../types';
import { extractDataFromFile, generateQuote, getAllProducts, generateDocumentSummary } from '../utils/quoteGenerator';

interface DataInputProps {
  onQuoteGenerated: (quote: Quote) => void;
}

const DataInput: React.FC<DataInputProps> = ({ onQuoteGenerated }) => {
  const [files, setFiles] = useState<FileUpload[]>([]);
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
  const [suggestedItems, setSuggestedItems] = useState<QuoteItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<CustomerData> | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [documentSummary, setDocumentSummary] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);

  const usageOptions = [
    { value: 'peak-shaving', label: 'Peak Shaving', description: 'Riduzione picchi di potenza', color: 'from-red-400 to-pink-500' },
    { value: 'arbitraggio', label: 'Arbitraggio Energetico', description: 'Compra/vendi energia', color: 'from-cyan-400 to-blue-500' },
    { value: 'backup', label: 'Backup/UPS', description: 'Alimentazione di emergenza', color: 'from-orange-400 to-amber-500' },
    { value: 'grid-services', label: 'Servizi di Rete', description: 'Regolazione frequenza/tensione', color: 'from-blue-400 to-cyan-500' },
    { value: 'autoconsumo', label: 'Autoconsumo', description: 'Ottimizzazione energia rinnovabile', color: 'from-purple-400 to-violet-500' },
    { value: 'load-shifting', label: 'Load Shifting', description: 'Spostamento carichi', color: 'from-indigo-400 to-blue-500' }
  ];

  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension || '')) {
      return <FileImage className="h-5 w-5 text-cyan-400" />;
    } else if (['xlsx', 'xls', 'csv'].includes(extension || '')) {
      return <FileSpreadsheet className="h-5 w-5 text-green-400" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getFileTypeLabel = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension || '')) {
      return 'Screenshot/Immagine';
    } else if (['xlsx', 'xls', 'csv'].includes(extension || '')) {
      return 'Foglio di calcolo';
    } else if (['pdf'].includes(extension || '')) {
      return 'Documento PDF';
    } else if (['doc', 'docx'].includes(extension || '')) {
      return 'Documento Word';
    } else if (['txt'].includes(extension || '')) {
      return 'File di testo';
    }
    return 'Documento';
  };

  const handleFileUpload = async (uploadedFiles: File[]) => {
    const newFiles: FileUpload[] = [];

    for (const file of uploadedFiles) {
      const fileUpload: FileUpload = { file };
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileUpload.preview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }

      newFiles.push(fileUpload);
    }

    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    handleFileUpload(uploadedFiles);
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
    }
  };

  const processFiles = async () => {
    setIsProcessing(true);
    setAiAnalysis('🤖 Analisi AI in corso...');
    setDocumentSummary('');
    
    // Phase 1: Document Analysis
    setTimeout(() => {
      setAiAnalysis('📖 Lettura e comprensione documenti...');
    }, 500);

    // Phase 2: Data Extraction
    setTimeout(() => {
      setAiAnalysis('🔍 Estrazione dati tecnici e commerciali...');
    }, 1500);

    // Phase 3: Summary Generation
    setTimeout(() => {
      setAiAnalysis('📝 Generazione sunto dettagliato...');
      const summary = generateDocumentSummary(files);
      setDocumentSummary(summary);
    }, 2500);

    // Phase 4: Complete Analysis
    setTimeout(async () => {
      setAiAnalysis('✅ Analisi completata - Dati estratti con successo');
      const extracted = extractDataFromFile(files);
      setExtractedData(extracted);
      setCustomerData(prev => ({ ...prev, ...extracted }));
      
      // Generate AI suggested products based on extracted data
      if (extracted.power && extracted.capacity) {
        const tempQuote = await generateQuote({ ...customerData, ...extracted } as CustomerData);
        setSuggestedItems(tempQuote.items);
      }
      
      setIsProcessing(false);
    }, 3500);
  };

  const handleUsageChange = (usageValue: string, checked: boolean) => {
    setCustomerData(prev => ({
      ...prev,
      usage: checked 
        ? [...prev.usage, usageValue]
        : prev.usage.filter(u => u !== usageValue)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      let quote: Quote;
      
      if (suggestedItems.length > 0) {
        // Generate quote from suggested/modified items
        const { generateQuoteFromItems } = await import('../utils/quoteGenerator');
        quote = await generateQuoteFromItems(customerData, suggestedItems);
      } else {
        // Auto-generate quote based on customer requirements
        quote = await generateQuote(customerData);
      }
      
      onQuoteGenerated(quote);
    } catch (error) {
      console.error('Error generating quote:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    // Reset analysis if files are removed
    if (files.length === 1) {
      setDocumentSummary('');
      setAiAnalysis('');
      setExtractedData(null);
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* AI Upload Section */}
      <div className="bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 rounded-2xl shadow-xl border border-cyan-500/30 p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 rounded-xl shadow-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              AI Automatico - Estrazione Dati e Suggerimento BESS
            </h2>
            <p className="text-gray-300 font-medium">Carica qualsiasi documento e l'AI estrarrà i dati e suggerirà il BESS ottimale</p>
          </div>
        </div>
        
        <div 
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            isDragOver 
              ? 'border-cyan-400 bg-cyan-400/10 scale-105 shadow-2xl' 
              : 'border-cyan-500/50 hover:border-cyan-400 bg-black/20 backdrop-blur-sm hover:shadow-xl'
          }`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.xlsx,.xls,.csv"
            onChange={handleFileInputChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center space-y-6">
              <div className={`p-6 rounded-full transition-all duration-300 ${
                isDragOver ? 'bg-cyan-400/20 scale-110' : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20'
              }`}>
                <Upload className={`h-12 w-12 transition-all duration-300 ${
                  isDragOver ? 'text-cyan-300 animate-bounce' : 'text-cyan-400'
                }`} />
              </div>
              <div>
                <span className={`text-2xl font-bold transition-colors ${
                  isDragOver ? 'text-cyan-300' : 'text-white'
                }`}>
                  {isDragOver ? 'Rilascia i file qui!' : 'Trascina file qui o clicca per caricare'}
                </span>
                <p className="text-gray-300 mt-3 text-lg">
                  Screenshot email, PDF, Excel, Word - L'AI riconosce tutto automaticamente
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-300">
                <div className="flex items-center space-x-2 bg-black/40 rounded-lg p-3 shadow-sm border border-cyan-500/20">
                  <FileImage className="h-5 w-5 text-cyan-400" />
                  <span className="font-medium">Screenshot Email</span>
                </div>
                <div className="flex items-center space-x-2 bg-black/40 rounded-lg p-3 shadow-sm border border-green-500/20">
                  <FileSpreadsheet className="h-5 w-5 text-green-400" />
                  <span className="font-medium">Excel/CSV</span>
                </div>
                <div className="flex items-center space-x-2 bg-black/40 rounded-lg p-3 shadow-sm border border-red-500/20">
                  <FileText className="h-5 w-5 text-red-400" />
                  <span className="font-medium">PDF/Word</span>
                </div>
                <div className="flex items-center space-x-2 bg-black/40 rounded-lg p-3 shadow-sm border border-purple-500/20">
                  <FileText className="h-5 w-5 text-purple-400" />
                  <span className="font-medium">Qualsiasi formato</span>
                </div>
              </div>
            </div>
          </label>
        </div>

        {files.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              File caricati ({files.length})
            </h3>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-sm border border-gray-600 rounded-xl shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center space-x-4">
                  {getFileIcon(file.file)}
                  <div>
                    <div className="font-semibold text-white">{file.file.name}</div>
                    <div className="text-sm text-gray-400">
                      {getFileTypeLabel(file.file)} • {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-500/10 transition-all"
                >
                  Rimuovi
                </button>
              </div>
            ))}
            
            <button
              onClick={processFiles}
              disabled={isProcessing}
              className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 px-8 rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-3 text-lg font-semibold shadow-lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>AI sta analizzando i documenti...</span>
                </>
              ) : (
                <>
                  <Brain className="h-6 w-6" />
                  <span>Avvia Estrazione AI Automatica</span>
                </>
              )}
            </button>

            {aiAnalysis && (
              <div className="mt-6 p-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl shadow-sm">
                <div className="flex items-center space-x-3">
                  <Brain className="h-5 w-5 text-cyan-400 animate-pulse" />
                  <span className="text-lg font-bold text-cyan-300">Analisi AI</span>
                </div>
                <p className="text-cyan-200 mt-2 font-medium">{aiAnalysis}</p>
              </div>
            )}

            {/* Document Summary Section */}
            {documentSummary && (
              <div className="mt-6 p-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <BookOpen className="h-6 w-6 text-green-400" />
                  <span className="text-xl font-bold text-green-300">Sunto Documento AI</span>
                  <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full font-medium">
                    Analisi Completata
                  </span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed bg-black/20 p-6 rounded-lg">
                    {documentSummary}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {extractedData && (
          <div className="mt-8 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <span className="text-lg font-bold text-green-300">Dati estratti automaticamente dall'AI</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="bg-black/20 p-4 rounded-lg">
                <strong className="text-green-300">Cliente:</strong> <span className="text-white">{extractedData.name}</span><br/>
                <strong className="text-green-300">Azienda:</strong> <span className="text-white">{extractedData.company}</span><br/>
                <strong className="text-green-300">Email:</strong> <span className="text-white">{extractedData.email}</span>
              </div>
              <div className="bg-black/20 p-4 rounded-lg">
                <strong className="text-green-300">Potenza:</strong> <span className="text-white">{extractedData.power} kW</span><br/>
                <strong className="text-green-300">Capacità:</strong> <span className="text-white">{extractedData.capacity} kWh</span><br/>
                <strong className="text-green-300">Collegamento:</strong> <span className="text-white">{extractedData.connectionType}</span>
                {extractedData.hasPV && extractedData.pvPower && (
                  <>
                    <br/><strong className="text-green-300">Fotovoltaico:</strong> <span className="text-white">{extractedData.pvPower} kW</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-xs text-green-300 mt-4 bg-green-500/10 p-3 rounded-lg">
              ✓ Tutti i campi sono stati compilati automaticamente. L'AI ha anche suggerito i prodotti BESS ottimali.
            </div>
          </div>
        )}
      </div>

      {/* Customer Data Form */}
      <div className="bg-gradient-to-br from-slate-500/20 to-gray-500/20 rounded-2xl shadow-xl border border-gray-500/30 p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="bg-gradient-to-r from-slate-500 to-gray-600 p-3 rounded-xl shadow-lg">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Dati Cliente</h2>
          {extractedData && (
            <span className="text-xs bg-green-500/20 text-green-300 px-3 py-2 rounded-full font-medium">
              Compilato automaticamente dall'AI
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-3">
              Nome Contatto
            </label>
            <input
              type="text"
              value={customerData.name}
              onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-black/40 text-white backdrop-blur-sm transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-3">
              Email
            </label>
            <input
              type="email"
              value={customerData.email}
              onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-black/40 text-white backdrop-blur-sm transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-3">
              Azienda
            </label>
            <input
              type="text"
              value={customerData.company}
              onChange={(e) => setCustomerData(prev => ({ ...prev, company: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-black/40 text-white backdrop-blur-sm transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-3">
              Telefono
            </label>
            <input
              type="tel"
              value={customerData.phone}
              onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-black/40 text-white backdrop-blur-sm transition-all"
            />
          </div>
        </div>

        <div className="mt-8">
          <label className="block text-sm font-bold text-gray-300 mb-3">
            Indirizzo
          </label>
          <textarea
            value={customerData.address}
            onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-black/40 text-white backdrop-blur-sm transition-all"
          />
        </div>

        {/* BESS Specifications - REQUISITI DEL CLIENTE */}
        <div className="mt-12 pt-8 border-t border-gray-600">
          <div className="flex items-center space-x-4 mb-8">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-xl shadow-lg">
              <Battery className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">Requisiti Sistema BESS del Cliente</h3>
            {extractedData && (
              <span className="text-xs bg-orange-500/20 text-orange-300 px-3 py-2 rounded-full font-medium">
                Rilevato automaticamente dall'AI
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">
                💡 Potenza Richiesta dal Cliente (kW)
              </label>
              <input
                type="number"
                step="1"
                value={customerData.power}
                onChange={(e) => setCustomerData(prev => ({ ...prev, power: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-orange-500/50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-orange-500/10 text-white backdrop-blur-sm transition-all font-medium"
                required
                placeholder="es. 150"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">
                🔋 Capacità Richiesta dal Cliente (kWh)
              </label>
              <input
                type="number"
                step="1"
                value={customerData.capacity}
                onChange={(e) => setCustomerData(prev => ({ ...prev, capacity: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-orange-500/50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-orange-500/10 text-white backdrop-blur-sm transition-all font-medium"
                required
                placeholder="es. 450"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">
                Collegamento POD
              </label>
              <select
                value={customerData.connectionType}
                onChange={(e) => setCustomerData(prev => ({ ...prev, connectionType: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-black/40 text-white backdrop-blur-sm transition-all"
              >
                <option value="BT">Bassa Tensione (BT)</option>
                <option value="MT">Media Tensione (MT)</option>
                <option value="AT">Alta Tensione (AT)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">
                Area di Applicazione
              </label>
              <select
                value={customerData.applicationArea}
                onChange={(e) => setCustomerData(prev => ({ ...prev, applicationArea: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-black/40 text-white backdrop-blur-sm transition-all"
              >
                <option value="industriale">Industriale</option>
                <option value="commerciale">Commerciale</option>
                <option value="utility">Utility Scale</option>
                <option value="residenziale">Residenziale</option>
              </select>
            </div>

            {/* SEZIONE FOTOVOLTAICO */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">
                È presente o è previsto un impianto Fotovoltaico?
                {extractedData && extractedData.hasPV && (
                  <span className="ml-2 text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                    Rilevato dall'AI
                  </span>
                )}
              </label>
              <select
                value={customerData.hasPV ? 'si' : 'no'}
                onChange={(e) => setCustomerData(prev => ({ 
                  ...prev, 
                  hasPV: e.target.value === 'si',
                  pvPower: e.target.value === 'si' ? prev.pvPower : 0
                }))}
                className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-black/40 text-white backdrop-blur-sm transition-all"
              >
                <option value="no">No</option>
                <option value="si">Sì</option>
              </select>
            </div>

            {/* CASELLA POTENZA FV */}
            {customerData.hasPV && (
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  <Sun className="h-4 w-4 inline mr-1 text-yellow-400" />
                  Potenza Fotovoltaico (kW)
                  {extractedData && extractedData.pvPower && (
                    <span className="ml-2 text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                      Rilevato dall'AI
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={customerData.pvPower}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, pvPower: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-yellow-500/10 text-white backdrop-blur-sm transition-all"
                  placeholder="es. 800"
                />
              </div>
            )}
          </div>

          {/* Servizi BESS - Checkbox Multiple con colori */}
          <div className="mt-10">
            <label className="block text-sm font-bold text-gray-300 mb-6">
              Servizi BESS Richiesti (seleziona tutti quelli applicabili)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usageOptions.map((option) => (
                <div key={option.value} className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                  customerData.usage.includes(option.value)
                    ? 'border-transparent shadow-lg scale-105'
                    : 'border-gray-600 hover:border-gray-500 hover:shadow-md'
                }`}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${option.color} opacity-${
                    customerData.usage.includes(option.value) ? '20' : '0'
                  } transition-opacity duration-300`}></div>
                  <div className="relative flex items-start space-x-4 p-4 bg-black/40 backdrop-blur-sm">
                    <input
                      type="checkbox"
                      id={option.value}
                      checked={customerData.usage.includes(option.value)}
                      onChange={(e) => handleUsageChange(option.value, e.target.checked)}
                      className="mt-1 h-5 w-5 text-cyan-600 focus:ring-cyan-500 border-gray-500 rounded transition-all"
                    />
                    <div className="flex-1">
                      <label htmlFor={option.value} className="text-sm font-bold text-white cursor-pointer">
                        {option.label}
                      </label>
                      <p className="text-xs text-gray-300 mt-1">{option.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {customerData.usage.length === 0 && (
              <p className="text-sm text-red-400 mt-4 font-medium">Seleziona almeno un servizio BESS</p>
            )}
          </div>

          <div className="mt-8">
            <label className="block text-sm font-bold text-gray-300 mb-3">
              Note Aggiuntive
            </label>
            <textarea
              value={customerData.additionalNotes}
              onChange={(e) => setCustomerData(prev => ({ ...prev, additionalNotes: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-black/40 text-white backdrop-blur-sm transition-all"
              placeholder="Inserisci eventuali note o richieste specifiche del cliente..."
            />
          </div>
        </div>

        {/* Validità Offerta */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-300 flex items-center mb-6">
            <Calendar className="h-5 w-5 mr-2" />
            Validità Offerta
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">
                📅 Giorni di Validità dell'Offerta
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={customerData.validityDays || 30}
                onChange={(e) => setCustomerData(prev => ({ ...prev, validityDays: parseInt(e.target.value) || 30 }))}
                className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-black/40 text-white backdrop-blur-sm transition-all font-medium"
                placeholder="30"
              />
              <p className="text-xs text-gray-400 mt-2">
                Numero di giorni dalla data di emissione per cui l'offerta rimane valida
              </p>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 text-center">
                <div className="text-sm text-cyan-300 font-medium mb-2">
                  Data Scadenza Calcolata
                </div>
                <div className="text-lg font-bold text-cyan-200">
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
                <div className="text-xs text-cyan-400 mt-1">
                  ({customerData.validityDays || 30} giorni da oggi)
                </div>
              </div>
            </div>
          </div>
          
          {/* Opzioni predefinite */}
          <div className="mt-6">
            <label className="block text-sm font-bold text-gray-300 mb-3">
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
                  onClick={() => setCustomerData(prev => ({ ...prev, validityDays: option.days }))}
                  className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 text-sm font-medium ${
                    (customerData.validityDays || 30) === option.days
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-md'
                      : 'border-gray-600 bg-black/20 text-gray-300 hover:border-cyan-400 hover:bg-cyan-500/10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PULSANTE GENERA PREVENTIVO */}
      <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl shadow-xl border border-cyan-500/30 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">Genera Offerta BESS</h3>
            <p className="text-gray-300 font-medium mt-2">
              Tutti i dati sono pronti. Clicca per generare l'offerta professionale.
              {customerData.hasPV && customerData.pvPower > 0 && (
                <span className="block text-yellow-400 font-bold mt-2">
                  ☀️ Include integrazione con fotovoltaico {customerData.pvPower} kW
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isProcessing || customerData.usage.length === 0 || !customerData.name || !customerData.email || !customerData.company}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center space-x-3 text-lg font-bold shadow-lg"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generazione in corso...</span>
              </>
            ) : (
              <>
                <FileText className="h-5 w-5" />
                <span>Genera Offerta BESS</span>
              </>
            )}
          </button>
        </div>
        
        {/* Validation Messages */}
        {!customerData.name || !customerData.email || !customerData.company || customerData.usage.length === 0 ? (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <span className="text-sm text-yellow-300">Completa tutti i campi obbligatori per procedere</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DataInput;