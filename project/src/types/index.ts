export interface CustomerData {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  installationType: 'BESS' | 'ESS' | 'Storage';
  power: number; // kW
  capacity: number; // kWh
  connectionType: 'BT' | 'MT' | 'AT';
  usage: string[]; // Array di servizi multipli
  applicationArea: 'industriale' | 'utility' | 'commerciale' | 'residenziale';
  additionalNotes: string;
  // Nuovo campo per fotovoltaico
  hasPV: boolean;
  pvPower: number; // kW - potenza fotovoltaico esistente
  // Nuovo campo per validità offerta
  validityDays: number; // Giorni di validità dell'offerta
}

export interface BESSProduct {
  code: string;
  name: string;
  description: string;
  unitPrice: number;
  powerRating: number; // kW
  energyCapacity: number; // kWh
  category: string;
  voltage: string;
  efficiency: number; // %
  cycleLife: number;
  certificationPath: string;
  schematicPath: string;
  datasheet: string;
}

export interface QuoteItem {
  id: string; // Unique identifier for stable React keys
  product: BESSProduct;
  quantity: number;
  totalPrice: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'commerciale' | 'manager';
  department: string;
  phone: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  avatar?: string;
}

export interface Quote {
  id: string;
  customerData: CustomerData;
  items: QuoteItem[];
  totalAmount: number;
  createdAt: Date;
  status: 'draft' | 'confirmed' | 'sent' | 'accepted';
  quoteNumber: string;
  referenceCode: string; // Nuovo campo per codice di riferimento
  // Nuovi campi per tracking utente
  createdBy: User;
  assignedTo?: User;
  lastModifiedBy?: User;
  lastModifiedAt?: Date;
  notes?: string;
  tags?: string[];
}

export interface FileUpload {
  file: File;
  preview?: string;
  extractedData?: Partial<CustomerData>;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: 'login' | 'logout' | 'create_quote' | 'update_quote' | 'send_quote' | 'view_quote' | 'create_user' | 'update_user' | 'delete_user';
  description: string;
  timestamp: Date;
  metadata?: any;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}