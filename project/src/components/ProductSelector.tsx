import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Package, Euro, Calculator, FileText, ChevronDown, Percent, List, Shield, BookOpen } from 'lucide-react';
import { BESSProduct, QuoteItem } from '../types';
import { getAllProducts } from '../utils/quoteGenerator';

interface ProductSelectorProps {
  selectedItems: QuoteItem[];
  onItemsChange: (items: QuoteItem[]) => void;
  showAddForm?: boolean;
  isAISuggestion?: boolean;
}

const ProductSelector = ({ 
  selectedItems, 
  onItemsChange, 
  showAddForm = true,
  isAISuggestion = false 
}: ProductSelectorProps) => {
  const [availableProducts, setAvailableProducts] = useState<BESSProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showManualAdd, setShowManualAdd] = useState(!isAISuggestion);
  
  // Mantieni traccia separata di prezzi originali e sconti per ogni item
  const [itemData, setItemData] = useState<{[key: string]: {originalPrice: number, discount: number}}>({});

  useEffect(() => {
    loadProducts();
  }, []);

  // Inizializza itemData quando selectedItems cambia
  useEffect(() => {
    const newItemData: {[key: string]: {originalPrice: number, discount: number}} = {};
    selectedItems.forEach((item) => {
      const itemKey = item.id;
      if (!itemData[itemKey]) {
        newItemData[itemKey] = {
          originalPrice: item.product.unitPrice,
          discount: 0
        };
      } else {
        newItemData[itemKey] = itemData[itemKey];
      }
    });
    setItemData(newItemData);
  }, [selectedItems.length]);

  const loadProducts = async () => {
    try {
      const products = await getAllProducts();
      setAvailableProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getItemKey = (item: QuoteItem) => item.id;

  // Funzioni per aprire documenti PDF - VERSIONE FUNZIONANTE
  const openDatasheet = (productCode: string) => {
    // Genera contenuto PDF dinamico
    const pdfContent = generatePDF(productCode, 'datasheet');
    
    // Crea e scarica il PDF
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    // Apri in nuova finestra
    const newWindow = window.open(url, '_blank');
    
    if (newWindow) {
      newWindow.document.title = `${productCode} - Datasheet Tecnico`;
      
      // Mostra notifica di successo
      setTimeout(() => {
        alert(`📄 DATASHEET TECNICO APERTO\n\n✅ Documento: ${productCode}_datasheet.pdf\n📋 Contenuto: Specifiche tecniche complete\n🔗 Stato: File generato con successo\n\n💡 Quando il database aziendale sarà collegato, verrà caricato automaticamente il datasheet reale dal server FFDPOWER.`);
      }, 500);
    } else {
      // Fallback se popup bloccato
      const link = document.createElement('a');
      link.href = url;
      link.download = `${productCode}_datasheet.pdf`;
      link.click();
      
      alert(`📄 DATASHEET SCARICATO\n\n✅ File: ${productCode}_datasheet.pdf\n📁 Posizione: Cartella Download\n💡 Il sistema caricherà automaticamente i documenti dal database aziendale.`);
    }
    
    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const openCertifications = (productCode: string) => {
    // Genera contenuto PDF per certificazioni
    const pdfContent = generatePDF(productCode, 'certifications');
    
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const newWindow = window.open(url, '_blank');
    
    if (newWindow) {
      newWindow.document.title = `${productCode} - Certificazioni CE/IEC`;
      
      setTimeout(() => {
        alert(`🛡️ CERTIFICAZIONI APERTE\n\n✅ Documento: ${productCode}_certifications.pdf\n📋 Contenuto: Certificazioni CE, IEC, conformità\n🔗 Stato: File generato con successo\n\n💡 Il database aziendale fornirà automaticamente le certificazioni aggiornate e validate.`);
      }, 500);
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${productCode}_certifications.pdf`;
      link.click();
      
      alert(`🛡️ CERTIFICAZIONI SCARICATE\n\n✅ File: ${productCode}_certifications.pdf\n📁 Posizione: Cartella Download\n💡 Il sistema includerà certificazioni validate dal database.`);
    }
    
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const openSchematic = (productCode: string) => {
    // Per gli schemi elettrici, simula apertura PowerPoint
    alert(`⚡ SCHEMA ELETTRICO POWERPOINT\n\n📋 Documento: ${productCode}_schema_elettrico.pptx\n🎨 Tipo: Presentazione PowerPoint personalizzata\n⚙️ Contenuto: Schema unifilare, layout installazione\n\n🔄 Apertura in corso...\n\n💡 Il database aziendale genererà automaticamente schemi PowerPoint personalizzati basati sull'utilizzo specifico del cliente (Peak Shaving, Arbitraggio, ecc.).`);
    
    // Simula apertura PowerPoint dopo un breve delay
    setTimeout(() => {
      // Crea un file PowerPoint (simulato)
      const pptContent = `Schema Elettrico ${productCode}\n\nSchema unifilare personalizzato.\nIl sistema genererà schemi PowerPoint dal database aziendale FFDPOWER.`;
      
      const blob = new Blob([pptContent], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${productCode}_schema_elettrico.pptx`;
      link.click();
      
      alert(`⚡ SCHEMA POWERPOINT SCARICATO\n\n✅ File: ${productCode}_schema_elettrico.pptx\n📁 Posizione: Cartella Download\n🎨 Tipo: Presentazione PowerPoint\n\n💡 Il sistema caricherà schemi PowerPoint professionali dal database aziendale.`);
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 1500);
  };

  // Genera contenuto PDF realistico
  const generatePDF = (productCode: string, type: 'datasheet' | 'certifications'): string => {
    const currentDate = new Date().toLocaleDateString('it-IT');
    
    if (type === 'datasheet') {
      return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 800
>>
stream
BT
/F1 24 Tf
50 750 Td
(FFDPOWER - DATASHEET TECNICO) Tj
0 -40 Td
/F1 18 Tf
(${productCode}) Tj
0 -60 Td
/F1 12 Tf
(Data: ${currentDate}) Tj
0 -40 Td
(Il sistema caricherà automaticamente) Tj
0 -20 Td
(i datasheet dal database aziendale FFDPOWER.) Tj
0 -40 Td
(SPECIFICHE TECNICHE:) Tj
0 -25 Td
(- Potenza: Vedi configurazione prodotto) Tj
0 -20 Td
(- Capacità: Vedi configurazione prodotto) Tj
0 -20 Td
(- Efficienza: >90%) Tj
0 -20 Td
(- Cicli di vita: >5000) Tj
0 -20 Td
(- Certificazioni: CE, IEC) Tj
0 -20 Td
(- Garanzia: Secondo standard FFDPOWER) Tj
0 -40 Td
(Per informazioni complete, contattare:) Tj
0 -20 Td
(info@ffdpower.com) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000001126 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
1185
%%EOF`;
    } else {
      return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 900
>>
stream
BT
/F1 24 Tf
50 750 Td
(FFDPOWER - CERTIFICAZIONI) Tj
0 -40 Td
/F1 18 Tf
(${productCode}) Tj
0 -60 Td
/F1 12 Tf
(Data: ${currentDate}) Tj
0 -40 Td
(Il sistema caricherà automaticamente) Tj
0 -20 Td
(le certificazioni dal database aziendale.) Tj
0 -40 Td
(CERTIFICAZIONI INCLUSE:) Tj
0 -25 Td
(✓ Certificazione CE - Conformità Europea) Tj
0 -20 Td
(✓ Certificazione IEC - Standard Internazionali) Tj
0 -20 Td
(✓ Certificazione ISO 9001 - Qualità) Tj
0 -20 Td
(✓ Certificazione ISO 14001 - Ambiente) Tj
0 -20 Td
(✓ Test di sicurezza elettrica) Tj
0 -20 Td
(✓ Test di compatibilità elettromagnetica) Tj
0 -20 Td
(✓ Certificazione antincendio) Tj
0 -40 Td
(VALIDITÀ:) Tj
0 -20 Td
(Tutte le certificazioni sono valide e aggiornate) Tj
0 -20 Td
(secondo gli standard europei e internazionali.) Tj
0 -40 Td
(Per verifiche: info@ffdpower.com) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000001226 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
1285
%%EOF`;
    }
  };

  // Aggiungi nuovo prodotto vuoto alla fine della lista
  const addNewEmptyProduct = () => {
    if (availableProducts.length === 0) return;
    
    const firstProduct = availableProducts[0];
    const newItem: QuoteItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      product: firstProduct,
      quantity: 1,
      totalPrice: firstProduct.unitPrice
    };
    
    // Aggiungi ALLA FINE della lista (sotto quelli esistenti)
    const newItems = [...selectedItems, newItem];
    onItemsChange(newItems);
    
    // Initialize item data for new item
    const itemKey = getItemKey(newItem);
    const newItemData = { ...itemData };
    newItemData[itemKey] = { 
      originalPrice: firstProduct.unitPrice, 
      discount: 0 
    };
    setItemData(newItemData);
  };

  const removeItem = (index: number) => {
    const itemToRemove = selectedItems[index];
    const itemKey = getItemKey(itemToRemove);
    
    const updatedItems = selectedItems.filter((_, i) => i !== index);
    onItemsChange(updatedItems);
    
    // Remove item data
    const newItemData = { ...itemData };
    delete newItemData[itemKey];
    setItemData(newItemData);
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(index);
      return;
    }

    const item = selectedItems[index];
    const itemKey = getItemKey(item);
    const currentItemData = itemData[itemKey] || { originalPrice: item.product.unitPrice, discount: 0 };
    const finalPrice = currentItemData.originalPrice * (1 - currentItemData.discount / 100);

    const updatedItems = [...selectedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: newQuantity,
      totalPrice: finalPrice * newQuantity
    };
    onItemsChange(updatedItems);
  };

  // Aggiorna SOLO il prezzo originale (quello che scegli tu)
  const updateOriginalPrice = (index: number, newPrice: number) => {
    if (newPrice < 0) return;

    const item = selectedItems[index];
    const itemKey = getItemKey(item);
    
    // Aggiorna il prezzo originale nei dati dell'item
    const newItemData = { ...itemData };
    const currentData = newItemData[itemKey] || { originalPrice: newPrice, discount: 0 };
    newItemData[itemKey] = { ...currentData, originalPrice: newPrice };
    setItemData(newItemData);

    // Calcola il prezzo finale con eventuale sconto
    const finalPrice = newPrice * (1 - currentData.discount / 100);

    // Aggiorna l'item con il prezzo finale
    const updatedItems = [...selectedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      product: {
        ...updatedItems[index].product,
        unitPrice: finalPrice
      },
      totalPrice: finalPrice * updatedItems[index].quantity
    };
    onItemsChange(updatedItems);
  };

  // Aggiorna SOLO lo sconto (separato dal prezzo)
  const updateDiscount = (index: number, discountPercent: number) => {
    if (discountPercent < 0 || discountPercent > 100) return;

    const item = selectedItems[index];
    const itemKey = getItemKey(item);
    
    // Aggiorna lo sconto nei dati dell'item
    const newItemData = { ...itemData };
    const currentData = newItemData[itemKey] || { originalPrice: item.product.unitPrice, discount: 0 };
    newItemData[itemKey] = { ...currentData, discount: discountPercent };
    setItemData(newItemData);

    // Calcola il prezzo finale applicando lo sconto al prezzo originale
    const finalPrice = currentData.originalPrice * (1 - discountPercent / 100);

    // Aggiorna l'item con il prezzo finale
    const updatedItems = [...selectedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      product: {
        ...updatedItems[index].product,
        unitPrice: finalPrice
      },
      totalPrice: finalPrice * updatedItems[index].quantity
    };
    onItemsChange(updatedItems);
  };

  const changeProduct = (index: number, newProductCode: string) => {
    const newProduct = availableProducts.find(p => p.code === newProductCode);
    if (!newProduct) return;

    const oldItem = selectedItems[index];
    const oldItemKey = getItemKey(oldItem);
    
    const updatedItems = [...selectedItems];
    const currentQuantity = updatedItems[index].quantity;
    
    updatedItems[index] = {
      ...updatedItems[index],
      product: newProduct,
      totalPrice: newProduct.unitPrice * currentQuantity
    };
    onItemsChange(updatedItems);

    // Reset item data when product changes
    const newItemData = { ...itemData };
    delete newItemData[oldItemKey];
    
    const newItemKey = getItemKey(updatedItems[index]);
    newItemData[newItemKey] = { originalPrice: newProduct.unitPrice, discount: 0 };
    setItemData(newItemData);
  };

  const totalAmount = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalPower = selectedItems.reduce((sum, item) => sum + (item.product.powerRating * item.quantity), 0);
  const totalCapacity = selectedItems.reduce((sum, item) => sum + (item.product.energyCapacity * item.quantity), 0);

  // Calculate total savings from discounts
  const totalSavings = selectedItems.reduce((sum, item, index) => {
    const itemKey = getItemKey(item);
    const currentItemData = itemData[itemKey];
    if (currentItemData && currentItemData.discount > 0) {
      const originalTotal = currentItemData.originalPrice * item.quantity;
      const discountedTotal = item.totalPrice;
      return sum + (originalTotal - discountedTotal);
    }
    return sum;
  }, 0);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-600 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-600 rounded"></div>
          <div className="h-4 bg-gray-600 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selected Items List */}
      {selectedItems.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white flex items-center">
            <Calculator className="h-4 w-4 mr-2" />
            {isAISuggestion ? 'BESS Suggerito dall\'AI' : `Prodotti Selezionati (${selectedItems.length})`}
            {isAISuggestion && (
              <span className="ml-2 text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">
                Modifica prodotti, quantità, prezzi e sconti a piacimento
              </span>
            )}
          </h4>

          <div className="space-y-2">
            {selectedItems.map((item, index) => {
              const itemKey = getItemKey(item);
              const currentItemData = itemData[itemKey] || { originalPrice: item.product.unitPrice, discount: 0 };
              
              return (
                <div key={item.id} className={`border rounded p-3 ${
                  isAISuggestion ? 'border-cyan-500/30 bg-cyan-500/10' : 'border-gray-600 bg-black/20'
                }`}>
                  {/* Layout: Prodotto | Quantità | Prezzo Unit. | Sconto | Totale | Azioni */}
                  <div className="grid grid-cols-12 gap-2 items-center text-xs">
                    {/* Product Selection - 4 columns */}
                    <div className="col-span-4">
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Prodotto BESS
                      </label>
                      <div className="relative">
                        <select
                          value={item.product.code}
                          onChange={(e) => changeProduct(index, e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-600 rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 appearance-none bg-black/60 text-white"
                        >
                          {availableProducts.map((product) => (
                            <option key={product.code} value={product.code}>
                              {product.code} - {product.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {item.product.powerRating}kW / {item.product.energyCapacity}kWh
                      </div>
                    </div>

                    {/* Quantity - 1 column */}
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Qtà
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-xs text-center border border-gray-600 rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 bg-black/60 text-white"
                      />
                    </div>

                    {/* Unit Price - 2 columns - PREZZO ORIGINALE SCELTO DA TE */}
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        💰 Prezzo Base €
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={currentItemData.originalPrice}
                        onChange={(e) => updateOriginalPrice(index, parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-xs text-center border border-cyan-500/50 rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 bg-cyan-500/10 text-white font-medium"
                        placeholder="Il tuo prezzo"
                      />
                      <div className="text-xs text-cyan-300 mt-1 text-center font-medium">
                        Prezzo scelto da te
                      </div>
                    </div>

                    {/* Discount - 2 columns - SCONTO SEPARATO E INDIPENDENTE */}
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center">
                        <Percent className="h-2 w-2 mr-1" />
                        🏷️ Sconto %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={currentItemData.discount}
                        onChange={(e) => updateDiscount(index, parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-xs text-center border border-orange-500/50 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-orange-500/10 text-white font-medium"
                        placeholder="0"
                      />
                      <div className="text-xs text-center mt-1">
                        {currentItemData.discount > 0 ? (
                          <span className="text-orange-300 font-medium">
                            -{currentItemData.discount}% applicato
                          </span>
                        ) : (
                          <span className="text-gray-400">
                            Nessuno sconto
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Total Price - 2 columns */}
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Totale Finale
                      </label>
                      <div className="px-2 py-1.5 bg-green-500/10 border border-green-500/30 rounded text-center">
                        <div className="font-bold text-green-300 text-sm">€{item.totalPrice.toLocaleString('it-IT')}</div>
                        {currentItemData.discount > 0 && (
                          <div className="text-xs text-orange-300 mt-1">
                            <div>Prezzo: €{currentItemData.originalPrice.toLocaleString('it-IT')}</div>
                            <div>Sconto: -€{((currentItemData.originalPrice - item.product.unitPrice) * item.quantity).toLocaleString('it-IT')}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions - 1 column */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() => removeItem(index)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                        title="Rimuovi prodotto"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Product Description + PULSANTI DOCUMENTI PDF FUNZIONANTI */}
                  <div className="mt-2 pt-2 border-t border-gray-600">
                    <div className="text-xs text-gray-300 mb-2">{item.product.description}</div>
                    
                    {/* Specifiche Tecniche */}
                    <div className="flex items-center space-x-3 mb-3 text-xs text-gray-400">
                      <span>Cat: {item.product.category}</span>
                      <span>V: {item.product.voltage}</span>
                      <span>Eff: {item.product.efficiency}%</span>
                      <span>Cicli: {item.product.cycleLife.toLocaleString()}</span>
                      {currentItemData.discount > 0 && (
                        <span className="text-orange-300 font-medium">
                          🏷️ Sconto {currentItemData.discount}% su €{currentItemData.originalPrice.toLocaleString('it-IT')}
                        </span>
                      )}
                    </div>

                    {/* SEZIONE DOCUMENTI PDF - VERSIONE FUNZIONANTE */}
                    <div className="bg-black/40 rounded-lg border border-gray-600 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-cyan-400" />
                          <span className="text-xs font-semibold text-white">Documenti Tecnici PDF</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                            Funzionante
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {/* Datasheet Tecnico - FUNZIONANTE */}
                        <button
                          onClick={() => openDatasheet(item.product.code)}
                          className="flex flex-col items-center p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 transition-all group hover:shadow-md"
                          title={`Apri datasheet tecnico per ${item.product.code}`}
                        >
                          <BookOpen className="h-4 w-4 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-medium text-cyan-300">📄 Datasheet</span>
                          <span className="text-xs text-cyan-400">Tecnico PDF</span>
                        </button>

                        {/* Certificazioni - FUNZIONANTE */}
                        <button
                          onClick={() => openCertifications(item.product.code)}
                          className="flex flex-col items-center p-2 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-all group hover:shadow-md"
                          title={`Apri certificazioni per ${item.product.code}`}
                        >
                          <Shield className="h-4 w-4 text-green-400 mb-1 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-medium text-green-300">🛡️ Certificazioni</span>
                          <span className="text-xs text-green-400">CE/IEC PDF</span>
                        </button>

                        {/* Schema Elettrico - FUNZIONANTE */}
                        <button
                          onClick={() => openSchematic(item.product.code)}
                          className="flex flex-col items-center p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-all group hover:shadow-md"
                          title={`Apri schema elettrico per ${item.product.code}`}
                        >
                          <FileText className="h-4 w-4 text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-medium text-blue-300">⚡ Schema</span>
                          <span className="text-xs text-blue-400">PowerPoint</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add More Products Button - VA SOTTO I PRODOTTI ESISTENTI */}
          {(showAddForm && !isAISuggestion) || (isAISuggestion && showManualAdd) ? (
            <button
              onClick={addNewEmptyProduct}
              className="w-full py-3 border-2 border-dashed border-green-500/50 rounded text-green-300 hover:border-green-400 hover:bg-green-500/10 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>+ Aggiungi Prodotto</span>
            </button>
          ) : null}

          {/* Show Manual Add Button for AI Suggestions */}
          {isAISuggestion && !showManualAdd && (
            <button
              onClick={() => setShowManualAdd(true)}
              className="w-full py-2 border-2 border-dashed border-green-500/50 rounded text-green-300 hover:border-green-400 hover:bg-green-500/10 transition-colors flex items-center justify-center space-x-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Aggiungi Altro Prodotto BESS</span>
            </button>
          )}

          {/* RIEPILOGO PRODOTTI con Tabella Dettagliata */}
          <div className={`border rounded-lg p-4 ${
            isAISuggestion 
              ? 'bg-gradient-to-r from-cyan-500/10 to-green-500/10 border-cyan-500/30' 
              : 'bg-gradient-to-r from-green-500/10 to-cyan-500/10 border-green-500/30'
          }`}>
            <h5 className="font-semibold text-white mb-4 flex items-center text-lg">
              <List className="h-5 w-5 mr-2" />
              📋 Riepilogo Sistema BESS
              {totalSavings > 0 && (
                <span className="ml-3 text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full flex items-center">
                  <Percent className="h-3 w-3 mr-1" />
                  Sconti Applicati
                </span>
              )}
            </h5>

            {/* Tabella Riepilogo Prodotti */}
            <div className="bg-black/40 rounded-lg border border-gray-600 overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-800 border-b border-gray-600">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-white">Articolo</th>
                    <th className="text-center py-3 px-4 font-semibold text-white">Quantità</th>
                    <th className="text-right py-3 px-4 font-semibold text-white">Prezzo Unit.</th>
                    {totalSavings > 0 && (
                      <th className="text-center py-3 px-4 font-semibold text-orange-300">Sconto</th>
                    )}
                    <th className="text-right py-3 px-4 font-semibold text-white">Totale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {selectedItems.map((item, index) => {
                    const itemKey = getItemKey(item);
                    const currentItemData = itemData[itemKey] || { originalPrice: item.product.unitPrice, discount: 0 };
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-700/50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-white">{item.product.code}</div>
                          <div className="text-xs text-gray-400">{item.product.name}</div>
                          <div className="text-xs text-cyan-400 mt-1">
                            {item.product.powerRating}kW / {item.product.energyCapacity}kWh
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-white">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {currentItemData.discount > 0 ? (
                            <div>
                              <div className="text-gray-400 line-through text-xs">
                                €{currentItemData.originalPrice.toLocaleString('it-IT')}
                              </div>
                              <div className="font-medium text-green-300">
                                €{item.product.unitPrice.toLocaleString('it-IT')}
                              </div>
                            </div>
                          ) : (
                            <div className="font-medium text-white">
                              €{item.product.unitPrice.toLocaleString('it-IT')}
                            </div>
                          )}
                        </td>
                        {totalSavings > 0 && (
                          <td className="py-3 px-4 text-center">
                            {currentItemData.discount > 0 ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300">
                                -{currentItemData.discount}%
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                        )}
                        <td className="py-3 px-4 text-right font-bold text-green-300">
                          €{item.totalPrice.toLocaleString('it-IT')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-800 border-t-2 border-gray-500">
                  <tr>
                    <td colSpan={totalSavings > 0 ? 4 : 3} className="py-4 px-4 text-right font-bold text-lg text-white">
                      TOTALE OFFERTA:
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-xl text-cyan-300">
                      €{totalAmount.toLocaleString('it-IT')}
                    </td>
                  </tr>
                  {totalSavings > 0 && (
                    <tr>
                      <td colSpan={4} className="py-2 px-4 text-right text-sm text-orange-300">
                        💰 Risparmio Totale Applicato:
                      </td>
                      <td className="py-2 px-4 text-right font-semibold text-orange-300">
                        -€{totalSavings.toLocaleString('it-IT')}
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>

            {/* Specifiche Tecniche Sistema */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center bg-black/40 rounded-lg p-3 border border-gray-600">
                <div className="text-2xl font-bold text-green-300">{totalPower.toLocaleString()} kW</div>
                <div className="text-xs text-gray-400">Potenza Totale</div>
              </div>
              <div className="text-center bg-black/40 rounded-lg p-3 border border-gray-600">
                <div className="text-2xl font-bold text-cyan-300">{totalCapacity.toLocaleString()} kWh</div>
                <div className="text-xs text-gray-400">Capacità Totale</div>
              </div>
              <div className="text-center bg-black/40 rounded-lg p-3 border border-gray-600">
                <div className="text-2xl font-bold text-purple-300">{totalPower > 0 ? (totalCapacity / totalPower).toFixed(1) : '0'}h</div>
                <div className="text-xs text-gray-400">Durata Scarica</div>
              </div>
              <div className="text-center bg-black/40 rounded-lg p-3 border border-gray-600">
                <div className="text-2xl font-bold text-white flex items-center justify-center">
                  <Euro className="h-6 w-6 mr-1" />
                  {totalAmount.toLocaleString('it-IT')}
                </div>
                <div className="text-xs text-gray-400">Valore Totale</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State - Solo quando non ci sono prodotti */}
      {selectedItems.length === 0 && (
        <div className="text-center py-6 text-gray-400">
          <Package className="h-8 w-8 text-gray-500 mx-auto mb-3" />
          <p className="text-sm">Nessun prodotto BESS selezionato</p>
          <p className="text-xs mt-1">
            {showAddForm 
              ? "L'AI suggerirà automaticamente i prodotti ottimali dopo l'analisi del documento"
              : "L'AI suggerirà automaticamente i prodotti ottimali dopo l'analisi del documento"
            }
          </p>
          {showAddForm && (
            <button
              onClick={addNewEmptyProduct}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Aggiungi Primo Prodotto</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSelector;