import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, Plus, Calculator, Euro, Battery, Zap, ShoppingCart, Check, X, Edit3, Trash2 } from 'lucide-react';
import { CustomerData, QuoteItem, BESSProduct } from '../../types';
import { getAllProducts } from '../../utils/quoteGenerator';

interface ProductSelectionStepProps {
  customerData: CustomerData;
  selectedItems: QuoteItem[];
  onItemsChange: (items: QuoteItem[]) => void;
}

const ProductSelectionStep: React.FC<ProductSelectionStepProps> = ({ 
  customerData, 
  selectedItems, 
  onItemsChange 
}) => {
  const [availableProducts, setAvailableProducts] = useState<BESSProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [totalDiscount, setTotalDiscount] = useState<number>(0);

  useEffect(() => {
    loadProducts();
  }, []);

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

  const generateAISuggestion = async () => {
    setIsLoading(true);
    try {
      const { generateQuote } = await import('../../utils/quoteGenerator');
      const tempQuote = await generateQuote(customerData);
      onItemsChange(tempQuote.items);
      setShowAISuggestion(true);
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = availableProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(availableProducts.map(p => p.category))];

  const addProduct = (product: BESSProduct) => {
    const newItem: QuoteItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Unique stable ID
      product,
      quantity: 1,
      totalPrice: product.unitPrice
    };
    onItemsChange([...selectedItems, newItem]);
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }
    const updatedItems = [...selectedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity,
      totalPrice: updatedItems[index].product.unitPrice * quantity
    };
    onItemsChange(updatedItems);
  };

  const updatePrice = (index: number, newPrice: number) => {
    const updatedItems = [...selectedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      product: {
        ...updatedItems[index].product,
        unitPrice: newPrice
      },
      totalPrice: newPrice * updatedItems[index].quantity
    };
    onItemsChange(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = selectedItems.filter((_, i) => i !== index);
    onItemsChange(updatedItems);
  };

  const totalAmount = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalPower = selectedItems.reduce((sum, item) => sum + (item.product.powerRating * item.quantity), 0);
  const totalCapacity = selectedItems.reduce((sum, item) => sum + (item.product.energyCapacity * item.quantity), 0);
  
  // Calcola importo finale con sconto
  const discountAmount = (totalAmount * totalDiscount) / 100;
  const finalAmount = totalAmount - discountAmount;

  return (
    <div className="p-8">
      <div className="flex items-center space-x-4 mb-8">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
          <ShoppingCart className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Configurazione Sistema BESS</h2>
          <p className="text-gray-300">Seleziona e configura i prodotti per l'offerta ottimale</p>
        </div>
      </div>

      {/* Riepilogo Requisiti Cliente */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
        <h3 className="text-lg font-bold text-white mb-4">🎯 Requisiti Cliente</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center bg-white/5 rounded-lg p-3">
            <div className="text-xl font-bold text-cyan-300">{customerData.power} kW</div>
            <div className="text-xs text-gray-400">Potenza Richiesta</div>
          </div>
          <div className="text-center bg-white/5 rounded-lg p-3">
            <div className="text-xl font-bold text-blue-300">{customerData.capacity} kWh</div>
            <div className="text-xs text-gray-400">Capacità Richiesta</div>
          </div>
          <div className="text-center bg-white/5 rounded-lg p-3">
            <div className="text-xl font-bold text-purple-300">{customerData.connectionType}</div>
            <div className="text-xs text-gray-400">Collegamento</div>
          </div>
          <div className="text-center bg-white/5 rounded-lg p-3">
            <div className="text-xl font-bold text-green-300">{customerData.applicationArea}</div>
            <div className="text-xs text-gray-400">Applicazione</div>
          </div>
        </div>
      </div>

      {/* AI Suggestion Button */}
      {selectedItems.length === 0 && (
        <div className="mb-8 text-center">
          <button
            onClick={generateAISuggestion}
            disabled={isLoading}
            className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center space-x-3 mx-auto shadow-lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generando configurazione AI...</span>
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                <span>🤖 Genera Configurazione Ottimale con AI</span>
              </>
            )}
          </button>
          <p className="text-gray-400 text-sm mt-2">
            L'AI analizzerà i requisiti e suggerirà la configurazione BESS ottimale
          </p>
        </div>
      )}

      {/* Selected Products Section */}
      {selectedItems.length > 0 && (
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Check className="h-5 w-5 mr-2 text-green-400" />
                Prodotti Selezionati ({selectedItems.length})
                {showAISuggestion && (
                  <span className="ml-3 text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">
                    Suggerimento AI
                  </span>
                )}
              </h3>
            </div>
            
            <div className="divide-y divide-white/10">
              {selectedItems.map((item, index) => (
                <div key={item.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white">{item.product.name}</h4>
                          <p className="text-sm text-gray-400">{item.product.code}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>{item.product.powerRating} kW</span>
                            <span>{item.product.energyCapacity} kWh</span>
                            <span>{item.product.efficiency}% eff.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Quantity */}
                      <div className="text-center">
                        <label className="block text-xs text-gray-400 mb-1">Quantità</label>
                        {editingItem === `qty_${index}` ? (
                          <input
                            type="number"
                            min="1"
                            value={item.quantity === 1 ? '' : item.quantity}
                            onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                            onBlur={() => setEditingItem(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setEditingItem(null);
                              }
                            }}
                            className="w-16 px-2 py-1 text-center bg-white/10 border border-white/20 rounded text-white text-sm"
                            placeholder="1"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => setEditingItem(`qty_${index}`)}
                            className="w-16 px-2 py-1 text-center bg-white/10 hover:bg-white/20 border border-white/20 rounded text-white text-sm transition-colors"
                            title="Clicca per modificare la quantità"
                          >
                            {item.quantity}
                          </button>
                        )}
                      </div>
                      
                      {/* Unit Price */}
                      <div className="text-center">
                        <label className="block text-xs text-gray-400 mb-1">Prezzo Unit.</label>
                        {editingItem === `price_${index}` ? (
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={item.product.unitPrice === 0 ? '' : item.product.unitPrice}
                            onChange={(e) => updatePrice(index, parseFloat(e.target.value) || 0)}
                            onBlur={() => setEditingItem(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setEditingItem(null);
                              }
                            }}
                            className="w-24 px-2 py-1 text-center bg-white/10 border border-white/20 rounded text-white text-sm"
                            placeholder="0"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => setEditingItem(`price_${index}`)}
                            className="w-24 px-2 py-1 text-center bg-white/10 hover:bg-white/20 border border-white/20 rounded text-green-300 text-sm transition-colors"
                            title="Clicca per modificare il prezzo"
                          >
                            €{item.product.unitPrice === 0 ? '0' : item.product.unitPrice.toLocaleString('it-IT')}
                          </button>
                        )}
                      </div>
                      
                      {/* Total */}
                      <div className="text-center">
                        <label className="block text-xs text-gray-400 mb-1">Totale</label>
                        <div className="text-sm font-bold text-white">
                          €{item.totalPrice.toLocaleString('it-IT')}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Rimuovi"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Summary */}
            <div className="bg-gradient-to-r from-gray-800/50 to-slate-800/50 p-6 border-t border-white/10">
              {/* Riepilogo tecnico */}
              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div>
                  <div className="text-lg font-bold text-green-300">{totalPower} kW</div>
                  <div className="text-xs text-gray-400">Potenza Totale</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-cyan-300">{totalCapacity} kWh</div>
                  <div className="text-xs text-gray-400">Capacità Totale</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-300">
                    {totalPower > 0 ? (totalCapacity / totalPower).toFixed(1) : '0'}h
                  </div>
                  <div className="text-xs text-gray-400">Durata</div>
                </div>
              </div>
              
              {/* Sezione prezzi con sconto */}
              <div className="border-t border-white/20 pt-4">
                <div className="grid grid-cols-3 gap-6 items-end">
                  {/* Subtotale */}
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-2">Subtotale</div>
                    <div className="text-xl font-bold text-white">
                      €{totalAmount.toLocaleString('it-IT')}
                    </div>
                  </div>
                  
                  {/* Sconto */}
                  <div className="text-center">
                    <label className="block text-sm text-gray-400 mb-2">
                      Sconto %
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={totalDiscount || ''}
                        onChange={(e) => setTotalDiscount(parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center font-bold text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all mx-auto"
                        placeholder="0"
                      />
                    </div>
                    {totalDiscount > 0 && (
                      <div className="text-xs text-orange-300 mt-1">
                        -€{discountAmount.toLocaleString('it-IT')}
                      </div>
                    )}
                  </div>
                  
                  {/* Totale finale */}
                <div>
                    <div className="text-sm text-gray-400 mb-2">Totale Finale</div>
                    <div className={`text-2xl font-bold flex items-center justify-center transition-all duration-300 ${
                      totalDiscount > 0 ? 'text-green-300' : 'text-white'
                    }`}>
                    <Euro className="h-5 w-5 mr-1" />
                      {finalAmount.toLocaleString('it-IT')}
                  </div>
                    {totalDiscount > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        (Sconto {totalDiscount}% applicato)
                      </div>
                    )}
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add More Products */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Aggiungi Prodotti BESS
          </h3>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca prodotti per nome o codice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Products List */}
        <div className="max-h-96 overflow-y-auto">
          {availableProducts.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 product.code.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
          }).length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Nessun prodotto trovato</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {availableProducts.filter(product => {
                const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                     product.code.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesSearch;
              }).map((product) => {
                const isSelected = selectedItems.some(item => item.product.code === product.code);
                
                return (
                  <div key={product.code} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-slate-700 rounded-lg flex items-center justify-center">
                          <Battery className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{product.name}</h4>
                          <p className="text-sm text-gray-400">{product.code}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>{product.powerRating} kW</span>
                            <span>{product.energyCapacity} kWh</span>
                            <span className="text-green-400">€{product.unitPrice.toLocaleString('it-IT')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => addProduct(product)}
                          disabled={isSelected}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-green-500/20 text-green-300 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="h-4 w-4 inline mr-1" />
                              Aggiunto
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 inline mr-1" />
                              Aggiungi
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionStep;