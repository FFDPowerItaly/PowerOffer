import React from 'react';
import { FileText, Check, Edit, Download, Send, Euro, Calendar, Building, Battery, Zap } from 'lucide-react';
import { Quote } from '../types';
import { generateQuotePDF, generateQuoteEmail } from '../utils/pdfGenerator';

interface QuotePreviewProps {
  quote: Quote;
  onConfirm: (quote: Quote) => void;
  onEdit: () => void;
}

export const QuotePreview: React.FC<QuotePreviewProps> = ({ quote, onConfirm, onEdit }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);

  const handleConfirm = () => {
    onConfirm({
      ...quote,
      status: 'confirmed',
      createdAt: new Date()
    });
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generateQuotePDF(quote);
    } catch (error) {
      console.error('Errore download PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      await generateQuoteEmail(quote);
    } catch (error) {
      console.error('Errore invio email:', error);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const totalPower = quote.items.reduce((sum, item) => sum + (item.product.powerRating * item.quantity), 0);
  const totalCapacity = quote.items.reduce((sum, item) => sum + (item.product.energyCapacity * item.quantity), 0);

  const getUsageLabels = (usageArray: string[]) => {
    const usageMap: { [key: string]: string } = {
      'peak-shaving': 'Peak Shaving',
      'arbitraggio': 'Arbitraggio Energetico',
      'backup': 'Backup/UPS',
      'grid-services': 'Servizi di Rete',
      'autoconsumo': 'Autoconsumo',
      'load-shifting': 'Load Shifting'
    };
    
    return usageArray.map(usage => usageMap[usage] || usage).join(', ');
  };

  // Generate composition text for each product
  const getProductComposition = (item: any) => {
    const product = item.product;
    const quantity = item.quantity;
    
    if (product.category.includes('Container') || product.category.includes('All-in-One')) {
      return `${product.name} (${product.powerRating} kW):
• ${quantity}x LFP battery pack ${product.energyCapacity} kWh;
• ${quantity}x PCS ${product.powerRating} kW;
• ${quantity}x UPS in the event of grid failure;
• ${quantity}x Full-optional cabinet.`;
    } else if (product.category.includes('PCS') || product.category.includes('Power Conversion')) {
      return `${product.name}:
• ${quantity}x Power Conversion System ${product.powerRating} kW;
• ${quantity}x Bidirectional inverter;
• ${quantity}x Control system included.`;
    } else if (product.category.includes('EMS') || product.category.includes('Energy Management')) {
      return `${product.name}:
• ${quantity}x Energy Management System;
• ${quantity}x Advanced monitoring platform;
• ${quantity}x AI algorithms included.`;
    } else {
      return `${product.name}:
• ${quantity}x ${product.category};
• ${quantity}x Complete system included.`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Anteprima Offerta BESS</h1>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onEdit}
            className="flex items-center space-x-2 px-6 py-3 border-2 border-slate-700 bg-slate-800 rounded-xl hover:bg-slate-700 hover:border-slate-600 transition-all duration-300 text-white font-semibold shadow-lg hover:shadow-xl"
          >
            <Edit className="h-4 w-4" />
            <span>Modifica</span>
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl border-2 border-emerald-500 hover:border-emerald-400"
          >
            <Check className="h-4 w-4" />
            <span>Conferma</span>
          </button>
        </div>
      </div>

      {/* Quote Document - Formato FFD Power */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200" id="quote-content">
        
        {/* Header con Logo FFD POWER */}
        <div className="border-b border-gray-200 p-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="mb-2">
                <img 
                  src="/LOGO FFD POWER copy copy copy copy.png"
                  alt="FFD Power" 
                  className="h-16 w-auto"
                  onError={(e) => {
                    console.error('Errore caricamento logo:', e);
                    // Fallback: mostra testo se immagine non carica
                    e.currentTarget.outerHTML = '<div class="text-4xl font-bold text-black" style="letter-spacing: 2px;">FFD<br><span class="text-3xl">POWER</span></div>';
                  }}
                />
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">OFFERTA BESS</div>
              <div className="text-gray-600 mt-1">
                <div className="font-mono font-bold text-lg text-cyan-600">
                  Codice: {quote.referenceCode}
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date().toLocaleDateString('it-IT')}
              </div>
            </div>
          </div>
        </div>

        {/* Sezione 3.6. Component list and prices */}
        <div className="p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">3.6. Component list and prices</h2>
          
          {/* Tabella Prodotti in stile FFD Power */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr style={{ backgroundColor: '#B8E6E1' }}>
                  <th className="border border-black p-3 text-left font-bold text-black">Description and model</th>
                  <th className="border border-black p-3 text-center font-bold text-black">Unit Price (€)</th>
                  <th className="border border-black p-3 text-center font-bold text-black">Quantity (#)</th>
                  <th className="border border-black p-3 text-center font-bold text-black">Sconto %</th>
                  <th className="border border-black p-3 text-center font-bold text-black">Total Price (€)</th>
                  <th className="border border-black p-3 text-left font-bold text-black">Composition</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-black p-3 align-top">
                      <div className="font-bold mb-1">{item.product.name}</div>
                      <div className="text-xs text-gray-600 italic mb-2">
                        {item.product.category.includes('Container') ? 'Liquid cooled' : item.product.category}
                      </div>
                      <div className="text-xs text-gray-600 italic">
                        <em>Incoterms</em>
                      </div>
                    </td>
                    <td className="border border-black p-3 text-center align-top">
                      {item.product.unitPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="border border-black p-3 text-center align-top">
                      {item.quantity.toFixed(2)}
                    </td>
                    <td className="border border-black p-3 text-center align-top">
                      0,00
                    </td>
                    <td className="border border-black p-3 text-center align-top">
                      {item.totalPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <div className="text-xs text-gray-600 italic mt-1">
                        EXW Cremona, Italy
                      </div>
                    </td>
                    <td className="border border-black p-3 align-top text-xs leading-tight">
                      <div className="whitespace-pre-line">
                        {getProductComposition(item)}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {/* EMS (Energy Management System) Row */}
                <tr className="bg-gray-50">
                  <td className="border border-black p-3 align-top">
                    <div className="font-bold mb-1">EMS (Energy Management System)</div>
                    <div className="text-xs text-gray-600 italic mt-2">
                      <em>Incoterms</em>
                    </div>
                  </td>
                  <td className="border border-black p-3 text-center align-top">0,00</td>
                  <td className="border border-black p-3 text-center align-top">1,00</td>
                  <td className="border border-black p-3 text-center align-top">0,00</td>
                  <td className="border border-black p-3 text-center align-top">
                    0,00
                    <div className="text-xs text-gray-600 italic mt-1">
                      EXW Cremona, Italy
                    </div>
                  </td>
                  <td className="border border-black p-3 align-top text-xs">EMS included</td>
                </tr>
                
                {/* DDP Package Row */}
                <tr className="bg-white">
                  <td className="border border-black p-3 align-top">
                    <div className="font-bold mb-1">DDP Package</div>
                    <div className="text-xs text-gray-600 italic mt-2">
                      <em>Incoterms</em>
                    </div>
                  </td>
                  <td className="border border-black p-3 text-center align-top">0,00</td>
                  <td className="border border-black p-3 text-center align-top">1,00</td>
                  <td className="border border-black p-3 text-center align-top">0,00</td>
                  <td className="border border-black p-3 text-center align-top">
                    0,00
                    <div className="text-xs text-gray-600 italic mt-1">
                      EXW Cremona, Italy
                    </div>
                  </td>
                  <td className="border border-black p-3 align-top text-xs">Transport TBD</td>
                </tr>
                
                {/* TOTAL Row */}
                <tr style={{ backgroundColor: '#B8E6E1' }}>
                  <td className="border border-black p-4 font-bold align-top">
                    TOTAL
                    <div className="text-xs text-gray-600 italic mt-2 font-normal">
                      <em>Incoterms</em>
                    </div>
                  </td>
                  <td className="border border-black p-4 text-center align-top"></td>
                  <td className="border border-black p-4 text-center align-top"></td>
                  <td className="border border-black p-4 text-center align-top"></td>
                  <td className="border border-black p-4 text-center align-top font-bold">
                    {quote.totalAmount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <div className="text-xs text-gray-600 italic mt-1 font-normal">
                      EXW Cremona, Italy
                    </div>
                  </td>
                  <td className="border border-black p-4 align-top"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sezione 3.6. Offer details */}
        <div className="p-8 border-t border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-6">3.6. Offer details</h2>
          
          <div className="text-sm text-gray-700 space-y-4">
            <p className="text-justify leading-relaxed">
              Supply and commissioning of a plug & play OUTDOOR storage system complete with bi-directional inverter, BMS (HV Box), EMS, battery module, measuring system, DC connection cables between the various cabinets and commissioning of the system. Service life 8,000 cycles, operating temperature -30°C to + 55°C with humidity 0 to 95% and corrosion level C3. Complete with automatic fire extinguishing system using liquid and smoke detector.
            </p>

            <div>
              <p className="font-bold mb-2">The BESS offer includes:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Battery cabinet body;</li>
                <li>Distribution and uninterruptible power supply (UPS) systems;</li>
                <li>Automatic fire suppression system;</li>
                <li>Liquid cooling temperature control system;</li>
                <li>Submerged fire extinguishing system;</li>
                <li>Control cabinet;</li>
                <li>Lightning protection system.</li>
              </ul>
            </div>

            <div>
              <p className="font-bold mb-2">The PCS offer includes:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Enjoy Power EPCS 125-AM;</li>
                <li>EMS Kit.</li>
              </ul>
            </div>

            <div>
              <p className="font-bold mb-2">The offer includes:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Supply of the components listed above;</li>
                <li>Assistance during installation;</li>
                <li>Commissioning of the installation;</li>
                <li>Remote supervision and monitoring.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="p-8 border-t border-gray-200 bg-blue-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Informazioni Cliente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-2 text-gray-700">
                <div><strong>Azienda:</strong> {quote.customerData.company}</div>
                <div><strong>Contatto:</strong> {quote.customerData.name}</div>
                <div><strong>Email:</strong> {quote.customerData.email}</div>
                <div><strong>Telefono:</strong> {quote.customerData.phone}</div>
                {quote.customerData.address && (
                  <div><strong>Indirizzo:</strong> {quote.customerData.address}</div>
                )}
              </div>
            </div>
            <div>
              <div className="space-y-2 text-gray-700">
                <div><strong>Potenza Richiesta:</strong> {quote.customerData.power} kW</div>
                <div><strong>Capacità Richiesta:</strong> {quote.customerData.capacity} kWh</div>
                <div><strong>Collegamento:</strong> {quote.customerData.connectionType}</div>
                <div><strong>Applicazione:</strong> {quote.customerData.applicationArea}</div>
                {quote.customerData.hasPV && quote.customerData.pvPower > 0 && (
                  <div><strong>Fotovoltaico:</strong> {quote.customerData.pvPower} kW</div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <strong>Servizi BESS:</strong> {getUsageLabels(quote.customerData.usage)}
          </div>
          {quote.customerData.additionalNotes && (
            <div className="mt-4">
              <strong>Note Aggiuntive:</strong><br />
              <div className="italic mt-2 text-gray-600">{quote.customerData.additionalNotes}</div>
            </div>
          )}
        </div>

        {/* System Summary */}
        <div className="p-8 border-t border-gray-200 bg-green-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-blue-600" />
            Riepilogo Sistema Proposto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalPower.toLocaleString()} kW</div>
              <div className="text-sm text-gray-600">Potenza Totale Sistema</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalCapacity.toLocaleString()} kWh</div>
              <div className="text-sm text-gray-600">Capacità Totale Sistema</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalPower > 0 ? (totalCapacity / totalPower).toFixed(1) : '0'}h</div>
              <div className="text-sm text-gray-600">Durata Scarica</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-200 bg-gray-50">
          <div className="text-center text-sm text-gray-600">
            <div className="font-bold mb-2">8</div>
            <p className="leading-relaxed">
              FFD Power Italy S.r.l., with registered office in Brescia (BS), Via Matto no. 10, enrolled in the Brescia Register of Companies R.E.A. no. 621413, tax code and VAT no. 04528390984, certified electronic mail (PEC) address ffdpoweritaly@pec.buffetti.it, share capital €680,400.00 fully paid up.
            </p>
            <p className="mt-4 font-medium">
              Offerta valida {quote.customerData.validityDays || 30} giorni dalla data di emissione
              {quote.customerData.validityDays && (
                <span className="block text-xs text-gray-500 mt-1">
                  Scadenza: {(() => {
                    const expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() + quote.customerData.validityDays);
                    return expiryDate.toLocaleDateString('it-IT', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    });
                  })()}
                </span>
              )}
            </p>
            <p className="mt-2">
              Include: Fornitura, installazione, commissioning e garanzia prodotto
            </p>
            <p className="mt-2">
              Per ulteriori informazioni: info@ffdpower.com | Tel: +39 000 000 0000
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button 
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="flex items-center space-x-2 px-6 py-3 border-2 border-slate-700 bg-slate-800 rounded-xl hover:bg-slate-700 hover:border-slate-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg hover:shadow-xl"
        >
          {isGeneratingPDF ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300"></div>
              <span>Generando PDF...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Scarica PDF</span>
            </>
          )}
        </button>
        <button 
          onClick={handleSendEmail}
          disabled={isSendingEmail}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl border-2 border-emerald-500 hover:border-emerald-400"
        >
          {isSendingEmail ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Preparando email...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Invia al Cliente</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};