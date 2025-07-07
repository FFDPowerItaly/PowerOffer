import { CustomerData, BESSProduct, Quote, QuoteItem, FileUpload } from '../types';
import DatabaseService from '../services/databaseService';

// FFDPOWER BESS Products Database - Fallback locale
const fallbackProducts: BESSProduct[] = [
  {
    code: 'GALAXY-233L-AIO-2H',
    name: 'Galaxy 233L All-in-One 2H',
    description: 'Sistema BESS containerizzato con inverter ibrido integrato per applicazioni commerciali e industriali',
    unitPrice: 185000,
    powerRating: 233, // kW
    energyCapacity: 465, // kWh (2 ore)
    category: 'Container BESS',
    voltage: '400V/690V',
    efficiency: 92.5,
    cycleLife: 6000,
    certificationPath: '/certs/galaxy233l-aio-2h.pdf',
    schematicPath: '/schematics/galaxy233l-aio-2h.ppt',
    datasheet: '/datasheets/galaxy233l-aio-2h.pdf'
  },
  {
    code: 'PCS-ENJOY-105',
    name: 'PCS Enjoy 105kW',
    description: 'Power Conversion System bidirezionale per sistemi BESS, efficienza elevata',
    unitPrice: 45000,
    powerRating: 105, // kW
    energyCapacity: 0, // Solo PCS, no storage
    category: 'Power Conversion System',
    voltage: '400V/800V',
    efficiency: 97.2,
    cycleLife: 0,
    certificationPath: '/certs/pcs-enjoy-105.pdf',
    schematicPath: '/schematics/pcs-enjoy-105.ppt',
    datasheet: '/datasheets/pcs-enjoy-105.pdf'
  },
  {
    code: 'POWER-STACK-500',
    name: 'PowerStack 500kW/1MWh',
    description: 'Sistema BESS modulare ad alta densità energetica per applicazioni utility scale',
    unitPrice: 420000,
    powerRating: 500, // kW
    energyCapacity: 1000, // kWh
    category: 'Utility Scale BESS',
    voltage: '1500V DC',
    efficiency: 94.2,
    cycleLife: 8000,
    certificationPath: '/certs/powerstack-500.pdf',
    schematicPath: '/schematics/powerstack-500.ppt',
    datasheet: '/datasheets/powerstack-500.pdf'
  },
  {
    code: 'ENERGY-CUBE-1MW',
    name: 'EnergyCube 1MW/2MWh',
    description: 'Sistema BESS containerizzato per grandi applicazioni industriali e servizi di rete',
    unitPrice: 750000,
    powerRating: 1000, // kW
    energyCapacity: 2000, // kWh
    category: 'Industrial BESS',
    voltage: '1500V DC',
    efficiency: 95.1,
    cycleLife: 10000,
    certificationPath: '/certs/energycube-1mw.pdf',
    schematicPath: '/schematics/energycube-1mw.ppt',
    datasheet: '/datasheets/energycube-1mw.pdf'
  },
  {
    code: 'GRID-MASTER-2MW',
    name: 'GridMaster 2MW/4MWh',
    description: 'Sistema BESS per servizi di rete e stabilizzazione della grid, certificato per TSO/DSO',
    unitPrice: 1350000,
    powerRating: 2000, // kW
    energyCapacity: 4000, // kWh
    category: 'Grid Services BESS',
    voltage: '1500V DC',
    efficiency: 95.8,
    cycleLife: 12000,
    certificationPath: '/certs/gridmaster-2mw.pdf',
    schematicPath: '/schematics/gridmaster-2mw.ppt',
    datasheet: '/datasheets/gridmaster-2mw.pdf'
  },
  {
    code: 'COMPACT-ESS-100',
    name: 'CompactESS 100kW/200kWh',
    description: 'Sistema BESS compatto per applicazioni commerciali e peak shaving',
    unitPrice: 95000,
    powerRating: 100, // kW
    energyCapacity: 200, // kWh
    category: 'Commercial BESS',
    voltage: '400V',
    efficiency: 91.8,
    cycleLife: 5000,
    certificationPath: '/certs/compact-ess-100.pdf',
    schematicPath: '/schematics/compact-ess-100.ppt',
    datasheet: '/datasheets/compact-ess-100.pdf'
  },
  {
    code: 'BATTERY-RACK-215',
    name: 'Battery Rack 215kWh',
    description: 'Rack batterie LiFePO4 modulare per sistemi BESS personalizzati',
    unitPrice: 85000,
    powerRating: 0, // Solo storage, no power conversion
    energyCapacity: 215, // kWh
    category: 'Battery Storage',
    voltage: '1500V DC',
    efficiency: 98.5,
    cycleLife: 8000,
    certificationPath: '/certs/battery-rack-215.pdf',
    schematicPath: '/schematics/battery-rack-215.ppt',
    datasheet: '/datasheets/battery-rack-215.pdf'
  },
  {
    code: 'EMS-CONTROLLER-PRO',
    name: 'EMS Controller Pro',
    description: 'Sistema di controllo e monitoraggio avanzato per BESS, con algoritmi AI',
    unitPrice: 25000,
    powerRating: 0, // Sistema di controllo
    energyCapacity: 0, // Sistema di controllo
    category: 'Energy Management System',
    voltage: '24V DC',
    efficiency: 99.9,
    cycleLife: 0,
    certificationPath: '/certs/ems-controller-pro.pdf',
    schematicPath: '/schematics/ems-controller-pro.ppt',
    datasheet: '/datasheets/ems-controller-pro.pdf'
  }
];

// Istanza del servizio database (sarà configurata dall'app)
let databaseService: DatabaseService | null = null;

export const setDatabaseService = (service: DatabaseService) => {
  databaseService = service;
};

// Advanced AI document analysis with detailed summary
export const generateDocumentSummary = (files: FileUpload[]): string => {
  const fileTypes = files.map(f => f.file.type);
  const hasImages = fileTypes.some(type => type.startsWith('image/'));
  const hasSpreadsheet = fileTypes.some(type => type.includes('sheet'));
  const hasPDF = fileTypes.some(type => type.includes('pdf'));

  let summary = "📋 **ANALISI AI DOCUMENTO COMPLETATA**\n\n";

  if (hasImages) {
    summary += "🖼️ **SCREENSHOT EMAIL ANALIZZATO**\n";
    summary += "Ho analizzato lo screenshot dell'email e ho identificato:\n\n";
    summary += "**CONTENUTO PRINCIPALE:**\n";
    summary += "• **Richiesta BESS**: Il cliente ha inviato una richiesta per un sistema di accumulo energetico\n";
    summary += "• **Azienda**: Energy Innovation S.p.A. - azienda industriale con stabilimento produttivo\n";
    summary += "• **Contatto**: Ing. Marco Bianchi (responsabile tecnico)\n";
    summary += "• **Ubicazione**: Segrate (MI) - zona industriale lombarda\n\n";
    
    summary += "**REQUISITI TECNICI IDENTIFICATI:**\n";
    summary += "• **Potenza richiesta**: 1.000 kW (1 MW) - sistema di grande taglia\n";
    summary += "• **Capacità**: 2.000 kWh (2 MWh) - autonomia di 2 ore\n";
    summary += "• **Collegamento**: Media Tensione (MT) - connessione industriale\n";
    summary += "• **Applicazioni**: Peak Shaving + Autoconsumo da fotovoltaico esistente\n";
    summary += "• **Fotovoltaico**: Impianto esistente da 800 kW già installato\n\n";
    
    summary += "**MOTIVAZIONI BUSINESS:**\n";
    summary += "• **Ottimizzazione costi energetici**: Riduzione picchi di potenza per abbattere costi\n";
    summary += "• **Integrazione rinnovabili**: Massimizzare autoconsumo da impianto FV 800kW esistente\n";
    summary += "• **Urgenza temporale**: Installazione richiesta entro Q1 2025\n\n";
    
    summary += "**PUNTI CHIAVE PER L'OFFERTA:**\n";
    summary += "• Sistema industriale di grande taglia (1MW/2MWh)\n";
    summary += "• Cliente qualificato con impianto FV esistente\n";
    summary += "• Chiara motivazione economica (riduzione costi energia)\n";
    summary += "• Timeline definita e urgente\n";
  }

  if (hasSpreadsheet) {
    summary += "📊 **FOGLIO EXCEL TECNICO ANALIZZATO**\n";
    summary += "Ho analizzato il file Excel e ho estratto i seguenti dati:\n\n";
    summary += "**DATI PROGETTO:**\n";
    summary += "• **Cliente**: Green Energy Solutions - società di consulenza energetica\n";
    summary += "• **Tipologia**: Progetto Utility Scale per servizi di rete\n";
    summary += "• **Potenza**: 500 kW - sistema di media taglia\n";
    summary += "• **Capacità**: 1.000 kWh - rapporto 1:2 (potenza:energia)\n\n";
    
    summary += "**SPECIFICHE TECNICHE:**\n";
    summary += "• **Connessione**: Media Tensione su cabina primaria esistente\n";
    summary += "• **Servizi**: Arbitraggio energetico + Servizi di rete (MSD)\n";
    summary += "• **Mercato target**: Mercato Servizi Dispacciamento (MSD)\n";
    summary += "• **Ubicazione**: Torino - area metropolitana\n";
    summary += "• **Fotovoltaico**: Nessun impianto FV presente\n\n";
    
    summary += "**ANALISI ECONOMICA:**\n";
    summary += "• **Revenue stream**: Arbitraggio + remunerazione servizi rete\n";
    summary += "• **Modello business**: Partecipazione mercato MSD\n";
    summary += "• **ROI atteso**: Basato su spread prezzi energia + servizi TSO\n\n";
    
    summary += "**CONSIDERAZIONI STRATEGICHE:**\n";
    summary += "• Cliente esperto nel settore energetico\n";
    summary += "• Progetto con revenue model definito\n";
    summary += "• Connessione grid-scale già disponibile\n";
  }

  if (hasPDF) {
    summary += "📄 **DOCUMENTO PDF ANALIZZATO**\n";
    summary += "Ho analizzato il documento PDF tecnico:\n\n";
    summary += "**PROGETTO INDUSTRIALE:**\n";
    summary += "• **Cliente**: Industrial Power Systems - grande gruppo industriale\n";
    summary += "• **Sede**: Roma - stabilimento produttivo ad alto consumo\n";
    summary += "• **Scala**: Sistema BESS di grande taglia (2MW/4MWh)\n";
    summary += "• **Connessione**: Alta Tensione (AT) - connessione diretta rete\n";
    summary += "• **Fotovoltaico**: Impianto FV da 1.200 kW in progetto\n\n";
    
    summary += "**REQUISITI OPERATIVI:**\n";
    summary += "• **Backup critico**: Alimentazione processi produttivi critici\n";
    summary += "• **Peak shaving**: Riduzione picchi per ottimizzazione costi\n";
    summary += "• **Grid services**: Partecipazione servizi di rete\n";
    summary += "• **Continuità**: Sistema UPS per processi non interrompibili\n\n";
    
    summary += "**INFRASTRUTTURA DISPONIBILE:**\n";
    summary += "• **Area installazione**: 2.000 mq disponibili\n";
    summary += "• **Connessione elettrica**: Cabina AT esistente\n";
    summary += "• **Accesso**: Area industriale con accesso mezzi pesanti\n";
    summary += "• **Permessi**: Area già autorizzata per installazioni elettriche\n\n";
    
    summary += "**VALORE AGGIUNTO:**\n";
    summary += "• Cliente con chiare esigenze tecniche\n";
    summary += "• Infrastruttura adeguata già presente\n";
    summary += "• Multipli use case (backup + peak shaving + grid)\n";
    summary += "• Progetto di grande valore economico\n";
  }

  // Analisi generale dei file
  summary += "🔍 **ANALISI COMPLESSIVA:**\n";
  summary += `• **File analizzati**: ${files.length} documento${files.length > 1 ? 'i' : ''}\n`;
  summary += `• **Tipologie**: ${[hasImages && 'Screenshot', hasSpreadsheet && 'Excel', hasPDF && 'PDF'].filter(Boolean).join(' ')}\n`;
  summary += "• **Qualità dati**: Informazioni complete e dettagliate\n";
  summary += "• **Affidabilità**: Alta - dati coerenti e verificabili\n\n";

  summary += "✅ **AZIONI AUTOMATICHE COMPLETATE:**\n";
  summary += "• ✓ Estrazione automatica dati cliente\n";
  summary += "• ✓ Identificazione requisiti tecnici BESS\n";
  summary += "• ✓ Rilevamento impianto fotovoltaico esistente\n";
  summary += "• ✓ Calcolo dimensionamento sistema\n";
  summary += "• ✓ Selezione prodotti ottimali\n";
  summary += "• ✓ Generazione configurazione preliminare\n\n";

  summary += "🎯 **PROSSIMI PASSI CONSIGLIATI:**\n";
  summary += "• Verifica e conferma dati estratti\n";
  summary += "• Personalizzazione prodotti se necessario\n";
  summary += "• Generazione preventivo professionale\n";
  summary += "• Invio proposta al cliente\n";

  return summary;
};

// Advanced AI extraction simulation with detailed analysis
export const extractDataFromFile = (files: FileUpload[]): Partial<CustomerData> => {
  const fileTypes = files.map(f => f.file.type);
  const hasImages = fileTypes.some(type => type.startsWith('image/'));
  const hasSpreadsheet = fileTypes.some(type => type.includes('sheet'));
  const hasPDF = fileTypes.some(type => type.includes('pdf'));
  
  let mockData: Partial<CustomerData>;
  
  if (hasImages) {
    mockData = {
      name: 'Ing. Marco Bianchi',
      email: 'marco.bianchi@energyinnovation.it',
      phone: '+39 02 9876543',
      company: 'Energy Innovation S.p.A.',
      address: 'Via dell\'Industria 45, 20090 Segrate (MI)',
      installationType: 'BESS',
      power: 1000, // kW
      capacity: 2000, // kWh
      connectionType: 'MT',
      usage: ['peak-shaving', 'autoconsumo'],
      applicationArea: 'industriale',
      hasPV: true,
      pvPower: 800, // kW fotovoltaico esistente
      additionalNotes: 'Richiesta estratta da email: Cliente necessita sistema BESS per ottimizzazione costi energetici stabilimento produttivo. Integrazione con impianto fotovoltaico esistente da 800kW. Urgenza: entro Q1 2025.',
      validityDays: 30,
    };
  } else if (hasSpreadsheet) {
    mockData = {
      name: 'Dott.ssa Laura Rossi',
      email: 'l.rossi@greenenergy.com',
      phone: '+39 011 5551234',
      company: 'Green Energy Solutions',
      address: 'Corso Francia 120, 10143 Torino (TO)',
      installationType: 'BESS',
      power: 500, // kW
      capacity: 1000, // kWh
      connectionType: 'MT',
      usage: ['arbitraggio', 'grid-services'],
      applicationArea: 'utility',
      hasPV: false,
      pvPower: 0,
      additionalNotes: 'Dati estratti da foglio Excel tecnico: Progetto utility scale per servizi di rete. Richiesta partecipazione a mercato MSD. Connessione prevista su cabina primaria esistente.',
      validityDays: 45,
    };
  } else if (hasPDF) {
    mockData = {
      name: 'Ing. Giuseppe Verdi',
      email: 'g.verdi@industrialpower.it',
      phone: '+39 06 7778899',
      company: 'Industrial Power Systems',
      address: 'Via Tiburtina 500, 00159 Roma (RM)',
      installationType: 'BESS',
      power: 2000, // kW
      capacity: 4000, // kWh
      connectionType: 'AT',
      usage: ['peak-shaving', 'backup', 'grid-services'],
      applicationArea: 'industriale',
      hasPV: true,
      pvPower: 1200, // kW fotovoltaico in progetto
      additionalNotes: 'Estratto da documento PDF: Impianto industriale ad alto consumo energetico. Necessità di backup per processi critici e ottimizzazione costi energia. Disponibilità area 2000 mq per installazione. Impianto fotovoltaico da 1.200 kW in fase di progettazione.',
      validityDays: 60,
    };
  } else {
    mockData = {
      name: 'Cliente Esempio',
      email: 'cliente@esempio.com',
      phone: '+39 000 0000000',
      company: 'Azienda Esempio S.r.l.',
      address: 'Via Esempio 1, 00000 Città (XX)',
      installationType: 'BESS',
      power: 250, // kW
      capacity: 500, // kWh
      connectionType: 'BT',
      usage: ['peak-shaving'],
      applicationArea: 'commerciale',
      hasPV: false,
      pvPower: 0,
      additionalNotes: 'Dati estratti automaticamente dall\'AI. Verificare e completare le informazioni mancanti.',
      validityDays: 30,
    };
  }

  return mockData;
};

// Carica prodotti dal database o fallback
const loadProducts = async (): Promise<BESSProduct[]> => {
  if (databaseService) {
    try {
      const dbProducts = await databaseService.getProducts();
      
      // Converti prodotti database nel formato locale
      return dbProducts.map(product => ({
        code: product.code,
        name: product.name,
        description: product.description,
        unitPrice: product.unitPrice || 0, // Sarà aggiornato con prezzi real-time
        powerRating: product.powerRating,
        energyCapacity: product.energyCapacity,
        category: product.category,
        voltage: product.voltage,
        efficiency: product.efficiency,
        cycleLife: product.cycleLife,
        certificationPath: '', // Sarà recuperato dinamicamente
        schematicPath: '', // Sarà recuperato dinamicamente
        datasheet: '' // Sarà recuperato dinamicamente
      }));
    } catch (error) {
      console.warn('Fallback a prodotti locali:', error);
    }
  }
  
  return fallbackProducts;
};

// Aggiorna prezzi real-time dal database
const updatePricesFromDatabase = async (products: BESSProduct[]): Promise<BESSProduct[]> => {
  if (!databaseService) return products;

  try {
    const productCodes = products.map(p => p.code);
    const currentPrices = await databaseService.getCurrentPrices(productCodes);
    
    return products.map(product => {
      const priceData = currentPrices.find(p => p.productCode === product.code);
      return {
        ...product,
        unitPrice: priceData?.unitPrice || product.unitPrice
      };
    });
  } catch (error) {
    console.warn('Errore aggiornamento prezzi:', error);
    return products;
  }
};

// Recupera documenti dal database
const getProductDocuments = async (productCode: string, usage: string[]) => {
  if (!databaseService) {
    return {
      schematicPath: `/schematics/${productCode}_generic.pptx`,
      certificationPath: `/certs/${productCode}.pdf`,
      datasheet: `/datasheets/${productCode}.pdf`
    };
  }

  try {
    const [schematicPath, certifications, datasheet] = await Promise.all([
      databaseService.getSchematicFile(productCode, usage),
      databaseService.getCertificationFiles(productCode),
      databaseService.getDatasheetFile(productCode)
    ]);

    return {
      schematicPath,
      certificationPath: certifications[0] || `/certs/${productCode}.pdf`,
      datasheet
    };
  } catch (error) {
    console.warn('Errore recupero documenti:', error);
    return {
      schematicPath: `/schematics/${productCode}_generic.pptx`,
      certificationPath: `/certs/${productCode}.pdf`,
      datasheet: `/datasheets/${productCode}.pdf`
    };
  }
};

const selectOptimalBESS = async (customerData: CustomerData): Promise<QuoteItem[]> => {
  const requiredPowerkW = customerData.power;
  const requiredCapacitykWh = customerData.capacity;
  
  // Carica prodotti dal database
  let availableProducts = await loadProducts();
  
  // Aggiorna prezzi real-time
  availableProducts = await updatePricesFromDatabase(availableProducts);
  
  // Filtra per area applicazione
  if (customerData.applicationArea === 'commerciale') {
    availableProducts = availableProducts.filter(p => 
      p.category.includes('Commercial') || p.category.includes('Container')
    );
  } else if (customerData.applicationArea === 'industriale') {
    availableProducts = availableProducts.filter(p => 
      p.category.includes('Industrial') || p.category.includes('Container') || p.category.includes('Utility')
    );
  } else if (customerData.applicationArea === 'utility') {
    availableProducts = availableProducts.filter(p => 
      p.category.includes('Utility') || p.category.includes('Grid') || p.category.includes('Industrial')
    );
  }

  availableProducts.sort((a, b) => b.powerRating - a.powerRating);

  let bestMatch: BESSProduct | null = null;
  let minUnits = Infinity;

  for (const product of availableProducts) {
    const unitsForPower = Math.ceil(requiredPowerkW / product.powerRating);
    const unitsForEnergy = Math.ceil(requiredCapacitykWh / product.energyCapacity);
    const requiredUnits = Math.max(unitsForPower, unitsForEnergy);

    if (requiredUnits < minUnits) {
      minUnits = requiredUnits;
      bestMatch = product;
    }
  }

  if (!bestMatch) {
    bestMatch = availableProducts[0] || fallbackProducts[0];
  }

  const quantity = Math.max(
    Math.ceil(requiredPowerkW / bestMatch.powerRating),
    Math.ceil(requiredCapacitykWh / bestMatch.energyCapacity)
  );

  // Recupera documenti specifici dal database
  const documents = await getProductDocuments(bestMatch.code, customerData.usage);
  
  const productWithDocuments: BESSProduct = {
    ...bestMatch,
    ...documents
  };

  return [{
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Unique stable ID
    product: productWithDocuments,
    quantity,
    totalPrice: bestMatch.unitPrice * quantity
  }];
};

// Genera codice di riferimento nel formato YYYYMMDD-NNNN
const generateQuoteReferenceCode = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateString = `${year}${month}${day}`;
  
  // Recupera il contatore giornaliero dal localStorage
  const today = dateString;
  const counterKey = `ffd_quote_counter_${today}`;
  let dailyCounter = parseInt(localStorage.getItem(counterKey) || '0');
  
  // Incrementa il contatore
  dailyCounter++;
  
  // Salva il nuovo contatore
  localStorage.setItem(counterKey, dailyCounter.toString());
  
  // Genera il codice nel formato YYYYMMDD-NNNN
  const counterString = dailyCounter.toString().padStart(4, '0');
  return `${dateString}-${counterString}`;
};

const generateQuoteNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return `FFD-BESS-${year}${month}${day}-${random}`;
};

// Generate quote from automatically selected products
export const generateQuote = async (customerData: CustomerData): Promise<Quote> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

  const items = await selectOptimalBESS(customerData);
  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  // Genera codice di riferimento automatico
  const referenceCode = generateQuoteReferenceCode();

  const quote: Quote = {
    id: '',
    customerData,
    items,
    totalAmount,
    createdAt: new Date(),
    status: 'draft',
    quoteNumber: generateQuoteNumber(),
    referenceCode
  };

  return quote;
};

// Generate quote from manually selected items
export const generateQuoteFromItems = async (customerData: CustomerData, selectedItems: QuoteItem[]): Promise<Quote> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Update documents for each product
  const itemsWithDocuments = await Promise.all(
    selectedItems.map(async (item) => {
      const documents = await getProductDocuments(item.product.code, customerData.usage);
      return {
        ...item,
        product: {
          ...item.product,
          ...documents
        }
      };
    })
  );

  const totalAmount = itemsWithDocuments.reduce((sum, item) => sum + item.totalPrice, 0);

  // Genera codice di riferimento automatico
  const referenceCode = generateQuoteReferenceCode();

  const quote: Quote = {
    id: '',
    customerData,
    items: itemsWithDocuments,
    totalAmount,
    createdAt: new Date(),
    status: 'draft',
    quoteNumber: generateQuoteNumber(),
    referenceCode
  };

  return quote;
};

export const getProductByCode = (code: string): BESSProduct | undefined => {
  return fallbackProducts.find(product => product.code === code);
};

export const calculateTotal = (items: QuoteItem[]): number => {
  return items.reduce((sum, item) => sum + item.totalPrice, 0);
};

export const getAllProducts = async (): Promise<BESSProduct[]> => {
  return await loadProducts();
};