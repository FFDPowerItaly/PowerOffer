import React, { useState } from 'react';
import { User, Users, Building, Mail, Phone, MapPin, FileText, Upload, Brain, Sparkles, Eye, FileSpreadsheet, FileImage, Package, BookOpen, CheckCircle } from 'lucide-react';
import { CustomerData, FileUpload } from '../../types';
import { extractDataFromFile, generateDocumentSummary } from '../../utils/quoteGenerator';

interface CustomerDataStepProps {
  customerData: CustomerData;
  onDataChange: (data: CustomerData) => void;
}

const CustomerDataStep: React.FC<CustomerDataStepProps> = ({ customerData, onDataChange }) => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<CustomerData> | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [documentSummary, setDocumentSummary] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);

  const updateField = (field: keyof CustomerData, value: any) => {
    onDataChange({ ...customerData, [field]: value });
  };

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
    console.log('Caricamento file:', uploadedFiles.length, 'file');
    
    const newFiles: FileUpload[] = [];

    for (const file of uploadedFiles) {
      console.log('Processando file:', file.name, file.type, file.size);
      
      const fileUpload: FileUpload = { file };
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        try {
          const reader = new FileReader();
          reader.onload = (e) => {
            fileUpload.preview = e.target?.result as string;
            console.log('Preview creata per:', file.name);
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Errore creazione preview:', error);
        }
      }

      newFiles.push(fileUpload);
    }

    console.log('File aggiunti:', newFiles.length);
    setFiles(prev => {
      const updated = [...prev, ...newFiles];
      console.log('Totale file dopo aggiunta:', updated.length);
      return updated;
    });
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input file change triggered');
    const uploadedFiles = Array.from(event.target.files || []);
    console.log('File selezionati:', uploadedFiles.length);
    
    if (uploadedFiles.length > 0) {
      handleFileUpload(uploadedFiles);
    } else {
      console.log('Nessun file selezionato');
    }
    
    // Reset input per permettere di selezionare lo stesso file di nuovo
    event.target.value = '';
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
    // Solo se stiamo uscendo dal container principale
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    console.log('File droppati');
    const droppedFiles = Array.from(e.dataTransfer.files);
    console.log('File nel drop:', droppedFiles.length);
    
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
    }
  };

  const processFiles = async () => {
    if (files.length === 0) {
      alert('Carica almeno un file prima di avviare l\'analisi AI');
      return;
    }

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
      onDataChange({ ...customerData, ...extracted });
      setIsProcessing(false);
    }, 3500);
  };

  const removeFile = (index: number) => {
    console.log('Rimozione file:', index);
    setFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      console.log('File rimanenti:', updated.length);
      return updated;
    });
    
    // Reset analysis if no files remain
    if (files.length === 1) {
      setDocumentSummary('');
      setAiAnalysis('');
      setExtractedData(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center space-x-4 mb-8">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-3 rounded-xl shadow-lg">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Dati Cliente</h2>
          <p className="text-gray-300">Carica documenti per estrazione automatica o inserisci manualmente</p>
        </div>
      </div>

      {/* AI Upload Section */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-200 p-8 mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-3 rounded-xl shadow-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              AI Automatico - Estrazione Dati e Suggerimento BESS
            </h3>
            <p className="text-gray-600 font-medium">Carica qualsiasi documento e l'AI estrarrà i dati e suggerirà il BESS ottimale</p>
          </div>
          <Sparkles className="h-8 w-8 text-cyan-400 animate-pulse" />
        </div>
        
        <div 
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            isDragOver 
              ? 'border-orange-400 bg-orange-50 scale-105 shadow-2xl' 
              : 'border-orange-200 hover:border-orange-400 bg-orange-50/30 hover:shadow-xl'
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
            id="file-upload-wizard"
          />
          <label htmlFor="file-upload-wizard" className="cursor-pointer block">
            <div className="flex flex-col items-center space-y-6">
              <div className={`p-6 rounded-full transition-all duration-300 ${
                isDragOver ? 'bg-orange-100 scale-110' : 'bg-gradient-to-r from-orange-100 to-amber-100'
              }`}>
                <Upload className={`h-12 w-12 transition-all duration-300 ${
                  isDragOver ? 'text-orange-500 animate-bounce' : 'text-orange-500'
                }`} />
              </div>
              <div>
                <span className={`text-2xl font-bold transition-colors ${
                  isDragOver ? 'text-orange-600' : 'text-gray-800'
                }`}>
                  {isDragOver ? 'Rilascia i file qui!' : 'Trascina file qui o clicca per caricare'}
                </span>
                <p className="text-gray-600 mt-3 text-lg">
                  Screenshot email, PDF, Excel, Word - L'AI riconosce tutto automaticamente
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2 bg-white rounded-lg p-3 shadow-sm border border-orange-200">
                  <FileImage className="h-5 w-5 text-orange-400" />
                  <span className="font-medium">Screenshot Email</span>
                </div>
                <div className="flex items-center space-x-2 bg-white rounded-lg p-3 shadow-sm border border-emerald-200">
                  <FileSpreadsheet className="h-5 w-5 text-green-400" />
                  <span className="font-medium">Excel/CSV</span>
                </div>
                <div className="flex items-center space-x-2 bg-white rounded-lg p-3 shadow-sm border border-blue-200">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <span className="font-medium">PDF/Word</span>
                </div>
                <div className="flex items-center space-x-2 bg-white rounded-lg p-3 shadow-sm border border-purple-200">
                  <Eye className="h-5 w-5 text-purple-400" />
                  <span className="font-medium">Qualsiasi formato</span>
                </div>
              </div>
            </div>
          </label>
        </div>

        {files.length > 0 && (
          <div className="mt-8 space-y-4">
            <h4 className="text-lg font-bold text-gray-800 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              File caricati ({files.length})
            </h4>
            {files.map((file, index) => (
              <div key={`${file.file.name}-${index}`} className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center space-x-4">
                  {getFileIcon(file.file)}
                  <div>
                    <div className="font-semibold text-gray-800">{file.file.name}</div>
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
              disabled={isProcessing || files.length === 0}
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
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </>
              )}
            </button>

            {aiAnalysis && (
              <div className="mt-6 p-6 bg-cyan-50 border border-cyan-200 rounded-xl shadow-sm">
                <div className="flex items-center space-x-3">
                  <Brain className="h-5 w-5 text-cyan-400 animate-pulse" />
                  <span className="text-lg font-bold text-cyan-600">Analisi AI</span>
                </div>
                <p className="text-cyan-700 mt-2 font-medium">{aiAnalysis}</p>
              </div>
            )}

            {/* Document Summary Section */}
            {documentSummary && (
              <div className="mt-6 p-8 bg-green-50 border border-green-200 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <BookOpen className="h-6 w-6 text-green-400" />
                  <span className="text-xl font-bold text-green-600">Sunto Documento AI</span>
                  <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full font-medium">
                    Analisi Completata
                  </span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed bg-white/80 p-6 rounded-lg">
                    {documentSummary}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {extractedData && (
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <span className="text-lg font-bold text-green-600">Dati estratti automaticamente dall'AI</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="bg-white/80 p-4 rounded-lg">
                <strong className="text-green-600">Cliente:</strong> <span className="text-gray-800">{extractedData.name}</span><br/>
                <strong className="text-green-600">Azienda:</strong> <span className="text-gray-800">{extractedData.company}</span><br/>
                <strong className="text-green-600">Email:</strong> <span className="text-gray-800">{extractedData.email}</span>
              </div>
              <div className="bg-white/80 p-4 rounded-lg">
                <strong className="text-green-600">Potenza:</strong> <span className="text-gray-800">{extractedData.power} kW</span><br/>
                <strong className="text-green-600">Capacità:</strong> <span className="text-gray-800">{extractedData.capacity} kWh</span><br/>
                <strong className="text-green-600">Collegamento:</strong> <span className="text-gray-800">{extractedData.connectionType}</span>
                {extractedData.hasPV && extractedData.pvPower && (
                  <>
                    <br/><strong className="text-green-600">Fotovoltaico:</strong> <span className="text-gray-800">{extractedData.pvPower} kW</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-xs text-green-600 mt-4 bg-green-100 p-3 rounded-lg">
              ✓ Tutti i campi sono stati compilati automaticamente. Puoi modificarli qui sotto se necessario.
            </div>
          </div>
        )}
      </div>

      {/* Manual Data Entry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dati Azienda */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Dati Azienda
            {extractedData && (
              <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                Compilato dall'AI
              </span>
            )}
          </h3>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Ragione Sociale *
            </label>
            <input
              type="text"
              value={customerData.company}
              onChange={(e) => updateField('company', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-gray-800 transition-all"
              placeholder="es. Energy Solutions S.r.l."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Indirizzo Completo
            </label>
            <textarea
              value={customerData.address}
              onChange={(e) => updateField('address', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-gray-800 transition-all"
              placeholder="Via, Numero Civico, CAP, Città, Provincia"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              P.IVA / Codice Fiscale
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-gray-800 transition-all"
              placeholder="IT12345678901"
            />
          </div>
        </div>

        {/* Dati Contatto */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Persona di Contatto
            {extractedData && (
              <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                Compilato dall'AI
              </span>
            )}
          </h3>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Nome e Cognome *
            </label>
            <input
              type="text"
              value={customerData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-gray-800 transition-all"
              placeholder="es. Mario Rossi"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={customerData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-gray-800 transition-all"
                placeholder="mario.rossi@azienda.it"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Telefono
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={customerData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-gray-800 transition-all"
                placeholder="+39 123 456 7890"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Ruolo/Posizione
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-gray-800 transition-all"
              placeholder="es. Responsabile Tecnico"
            />
          </div>
        </div>
      </div>

      {/* Note Aggiuntive */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-800 flex items-center mb-6">
          <FileText className="h-5 w-5 mr-2" />
          Note Aggiuntive
          {extractedData && extractedData.additionalNotes && (
            <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
              Estratte dall'AI
            </span>
          )}
        </h3>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Informazioni aggiuntive sul cliente o progetto
          </label>
          <textarea
            value={customerData.additionalNotes}
            onChange={(e) => updateField('additionalNotes', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-gray-800 transition-all"
            placeholder="Inserisci eventuali note, richieste specifiche o informazioni utili per il preventivo..."
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerDataStep;