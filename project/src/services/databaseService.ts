// Database Service per connessione al server aziendale FFDPOWER
export interface DatabaseConfig {
  serverUrl: string;
  apiKey: string;
  endpoints: {
    products: string;
    schematics: string;
    certifications: string;
    datasheets: string;
    prices: string;
  };
}

export interface ProductDocument {
  productCode: string;
  schematicPath: string;
  certificationPath: string;
  datasheetPath: string;
  lastUpdated: Date;
  version: string;
}

export interface PriceData {
  productCode: string;
  unitPrice: number;
  currency: string;
  validFrom: Date;
  validTo: Date;
  priceList: string;
}

class DatabaseService {
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  // Recupera tutti i prodotti BESS dal database aziendale
  async getProducts(): Promise<any[]> {
    try {
      const response = await fetch(`${this.config.serverUrl}${this.config.endpoints.products}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Errore database: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Errore recupero prodotti:', error);
      // Fallback ai prodotti locali se il database non è raggiungibile
      return this.getFallbackProducts();
    }
  }

  // Recupera prezzi aggiornati dal database
  async getCurrentPrices(productCodes: string[]): Promise<PriceData[]> {
    try {
      const response = await fetch(`${this.config.serverUrl}${this.config.endpoints.prices}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productCodes })
      });

      if (!response.ok) {
        throw new Error(`Errore prezzi: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Errore recupero prezzi:', error);
      return [];
    }
  }

  // Recupera schema elettrico PowerPoint per prodotto specifico
  async getSchematicFile(productCode: string, usage: string[]): Promise<string> {
    try {
      // Genera nome file schema basato su prodotto e utilizzo
      const usageKey = usage.sort().join('-');
      const schematicName = `${productCode}_${usageKey}_schema.pptx`;
      
      const response = await fetch(`${this.config.serverUrl}${this.config.endpoints.schematics}/${schematicName}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      if (!response.ok) {
        // Fallback a schema generico se specifico non trovato
        return `${this.config.serverUrl}${this.config.endpoints.schematics}/${productCode}_generic_schema.pptx`;
      }

      return response.url;
    } catch (error) {
      console.error('Errore recupero schema:', error);
      return `/schematics/${productCode}_generic.pptx`;
    }
  }

  // Recupera certificazioni dal database
  async getCertificationFiles(productCode: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.serverUrl}${this.config.endpoints.certifications}/${productCode}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Errore certificazioni: ${response.status}`);
      }

      const certData = await response.json();
      return certData.files || [];
    } catch (error) {
      console.error('Errore recupero certificazioni:', error);
      return [`/certs/${productCode}_ce.pdf`, `/certs/${productCode}_iec.pdf`];
    }
  }

  // Recupera datasheet aggiornato
  async getDatasheetFile(productCode: string): Promise<string> {
    try {
      const response = await fetch(`${this.config.serverUrl}${this.config.endpoints.datasheets}/${productCode}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Errore datasheet: ${response.status}`);
      }

      const datasheetData = await response.json();
      return datasheetData.latestVersion || `/datasheets/${productCode}.pdf`;
    } catch (error) {
      console.error('Errore recupero datasheet:', error);
      return `/datasheets/${productCode}.pdf`;
    }
  }

  // Prodotti di fallback se database non raggiungibile
  private getFallbackProducts() {
    return [
      {
        code: 'GALAXY-233L-AIO-2H',
        name: 'Galaxy 233L All-in-One 2H',
        description: 'Sistema BESS containerizzato con inverter ibrido integrato',
        powerRating: 233,
        energyCapacity: 465,
        category: 'Container BESS',
        voltage: '400V/690V',
        efficiency: 92.5,
        cycleLife: 6000
      },
      {
        code: 'POWER-STACK-500',
        name: 'PowerStack 500kW/1MWh',
        description: 'Sistema BESS modulare ad alta densità energetica',
        powerRating: 500,
        energyCapacity: 1000,
        category: 'Utility Scale BESS',
        voltage: '1500V DC',
        efficiency: 94.2,
        cycleLife: 8000
      }
    ];
  }

  // Test connessione database
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.serverUrl}/health`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Configurazione database FFDPOWER
export const createDatabaseService = (serverUrl: string, apiKey: string): DatabaseService => {
  const config: DatabaseConfig = {
    serverUrl,
    apiKey,
    endpoints: {
      products: '/api/v1/bess/products',
      schematics: '/api/v1/documents/schematics',
      certifications: '/api/v1/documents/certifications',
      datasheets: '/api/v1/documents/datasheets',
      prices: '/api/v1/pricing/current'
    }
  };

  return new DatabaseService(config);
};

export default DatabaseService;