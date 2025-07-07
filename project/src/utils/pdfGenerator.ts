import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Quote } from '../types';

export const generateQuotePDF = async (quote: Quote): Promise<void> => {
  try {
    // Create a temporary container for the PDF content
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '210mm'; // A4 width
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.padding = '20mm';
    tempContainer.style.fontFamily = 'Arial, sans-serif';
    
    // Generate HTML content for PDF
    tempContainer.innerHTML = generateFFDPowerPDFHTML(quote);
    
    // Add to DOM temporarily
    document.body.appendChild(tempContainer);
    
    // Generate canvas from HTML
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Remove temporary container
    document.body.removeChild(tempContainer);
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;
    
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    // Download PDF
    pdf.save(`FFD_Power_Offerta_BESS_${quote.quoteNumber}_${quote.customerData.company.replace(/\s+/g, '_')}.pdf`);
    
  } catch (error) {
    console.error('Errore generazione PDF:', error);
    alert('Errore durante la generazione del PDF. Riprova.');
  }
};

const generateFFDPowerPDFHTML = (quote: Quote): string => {
  const totalPower = quote.items.reduce((sum, item) => sum + (item.product.powerRating * item.quantity), 0);
  const totalCapacity = quote.items.reduce((sum, item) => sum + (item.product.energyCapacity * item.quantity), 0);
  const currentDate = new Date().toLocaleDateString('it-IT', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  
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
      return `${product.name} (${product.powerRating} kW):<br>
• ${quantity}x LFP battery pack ${product.energyCapacity} kWh;<br>
• ${quantity}x PCS ${product.powerRating} kW;<br>
• ${quantity}x UPS in the event of grid failure;<br>
• ${quantity}x Full-optional cabinet.`;
    } else if (product.category.includes('PCS') || product.category.includes('Power Conversion')) {
      return `${product.name}:<br>
• ${quantity}x Power Conversion System ${product.powerRating} kW;<br>
• ${quantity}x Bidirectional inverter;<br>
• ${quantity}x Control system included.`;
    } else if (product.category.includes('EMS') || product.category.includes('Energy Management')) {
      return `${product.name}:<br>
• ${quantity}x Energy Management System;<br>
• ${quantity}x Advanced monitoring platform;<br>
• ${quantity}x AI algorithms included.`;
    } else {
      return `${product.name}:<br>
• ${quantity}x ${product.category};<br>
• ${quantity}x Complete system included.`;
    }
  };

  return `
    <div style="max-width: 170mm; margin: 0 auto; font-size: 10px; line-height: 1.3; color: #000; font-family: Arial, sans-serif;">
      
      <!-- Header con Logo FFD POWER -->
      <div style="margin-bottom: 30px;">
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <div style="font-size: 32px; font-weight: bold; color: #000; letter-spacing: 2px;">
            FFD<br>
            <span style="font-size: 24px;">POWER</span>
          </div>
        </div>
      </div>

      <!-- Sezione 3.6. Component list and prices -->
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 14px; font-weight: bold; color: #000; margin: 0 0 15px 0;">3.6. Component list and prices</h2>
        
        <!-- Tabella Prodotti -->
        <table style="width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 15px;">
          <thead>
            <tr style="background: #B8E6E1;">
              <th style="border: 1px solid #000; padding: 6px; text-align: left; font-weight: bold; color: #000;">Description and model</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; color: #000;">Unit Price (€)</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; color: #000;">Quantity (#)</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; color: #000;">Total Price (€)</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: left; font-weight: bold; color: #000;">Composition</th>
            </tr>
          </thead>
          <tbody>
            ${quote.items.map((item, index) => `
              <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                <td style="border: 1px solid #000; padding: 6px; vertical-align: top;">
                  <div style="font-weight: bold; margin-bottom: 2px;">${item.product.name}</div>
                  <div style="font-style: italic; color: #666; font-size: 8px; margin-bottom: 4px;">
                    ${item.product.category.includes('Container') ? 'Liquid cooled' : item.product.category}
                  </div>
                  <div style="font-style: italic; color: #666; font-size: 8px; margin-top: 6px;">
                    <em>Incoterms</em>
                  </div>
                </td>
                <td style="border: 1px solid #000; padding: 6px; text-align: center; vertical-align: top;">
                  ${item.product.unitPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style="border: 1px solid #000; padding: 6px; text-align: center; vertical-align: top;">
                  ${item.quantity.toFixed(2)}
                </td>
                <td style="border: 1px solid #000; padding: 6px; text-align: center; vertical-align: top;">
                  ${item.totalPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <div style="font-style: italic; color: #666; font-size: 8px; margin-top: 2px;">
                    EXW Cremona, Italy
                  </div>
                </td>
                <td style="border: 1px solid #000; padding: 6px; vertical-align: top; font-size: 8px; line-height: 1.2;">
                  ${getProductComposition(item)}
                </td>
              </tr>
            `).join('')}
            
            <!-- EMS (Energy Management System) Row -->
            <tr style="background: #f8f9fa;">
              <td style="border: 1px solid #000; padding: 6px; vertical-align: top;">
                <div style="font-weight: bold; margin-bottom: 2px;">EMS (Energy Management System)</div>
                <div style="font-style: italic; color: #666; font-size: 8px; margin-top: 6px;">
                  <em>Incoterms</em>
                </div>
              </td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; vertical-align: top;">
                0,00
              </td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; vertical-align: top;">
                1,00
              </td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; vertical-align: top;">
                0,00
                <div style="font-style: italic; color: #666; font-size: 8px; margin-top: 2px;">
                  EXW Cremona, Italy
                </div>
              </td>
              <td style="border: 1px solid #000; padding: 6px; vertical-align: top; font-size: 8px;">
                EMS included
              </td>
            </tr>
            
            <!-- DDP Package Row -->
            <tr style="background: #ffffff;">
              <td style="border: 1px solid #000; padding: 6px; vertical-align: top;">
                <div style="font-weight: bold; margin-bottom: 2px;">DDP Package</div>
                <div style="font-style: italic; color: #666; font-size: 8px; margin-top: 6px;">
                  <em>Incoterms</em>
                </div>
              </td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; vertical-align: top;">
                0,00
              </td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; vertical-align: top;">
                1,00
              </td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; vertical-align: top;">
                0,00
                <div style="font-style: italic; color: #666; font-size: 8px; margin-top: 2px;">
                  EXW Cremona, Italy
                </div>
              </td>
              <td style="border: 1px solid #000; padding: 6px; vertical-align: top; font-size: 8px;">
                Transport TBD
              </td>
            </tr>
            
            <!-- TOTAL Row -->
            <tr style="background: #B8E6E1;">
              <td style="border: 1px solid #000; padding: 8px; font-weight: bold; vertical-align: top;">
                TOTAL
                <div style="font-style: italic; color: #666; font-size: 8px; margin-top: 6px; font-weight: normal;">
                  <em>Incoterms</em>
                </div>
              </td>
              <td style="border: 1px solid #000; padding: 8px; text-align: center; vertical-align: top;"></td>
              <td style="border: 1px solid #000; padding: 8px; text-align: center; vertical-align: top;"></td>
              <td style="border: 1px solid #000; padding: 8px; text-align: center; vertical-align: top; font-weight: bold;">
                ${quote.totalAmount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <div style="font-style: italic; color: #666; font-size: 8px; margin-top: 2px; font-weight: normal;">
                  EXW Cremona, Italy
                </div>
              </td>
              <td style="border: 1px solid #000; padding: 8px; vertical-align: top;"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Sezione 3.6. Offer details -->
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 14px; font-weight: bold; color: #000; margin: 0 0 15px 0;">3.6. Offer details</h2>
        
        <p style="font-size: 9px; line-height: 1.4; margin-bottom: 15px; text-align: justify;">
          Supply and commissioning of a plug & play OUTDOOR storage system complete with bi-directional inverter, BMS (HV Box), EMS, battery module, measuring system, DC connection cables between the various cabinets and commissioning of the system. Service life 8,000 cycles, operating temperature -30°C to + 55°C with humidity 0 to 95% and corrosion level C3. Complete with automatic fire extinguishing system using liquid and smoke detector.
        </p>

        <p style="font-size: 9px; font-weight: bold; margin-bottom: 10px;">
          The BESS offer includes:
        </p>

        <ul style="font-size: 9px; line-height: 1.4; margin: 0; padding-left: 15px;">
          <li>Battery cabinet body;</li>
          <li>Distribution and uninterruptible power supply (UPS) systems;</li>
          <li>Automatic fire suppression system;</li>
          <li>Liquid cooling temperature control system;</li>
          <li>Submerged fire extinguishing system;</li>
          <li>Control cabinet;</li>
          <li>Lightning protection system.</li>
        </ul>

        <p style="font-size: 9px; font-weight: bold; margin: 15px 0 10px 0;">
          The PCS offer includes:
        </p>

        <ul style="font-size: 9px; line-height: 1.4; margin: 0; padding-left: 15px;">
          <li>Enjoy Power EPCS 125-AM;</li>
          <li>EMS Kit.</li>
        </ul>

        <p style="font-size: 9px; font-weight: bold; margin: 15px 0 10px 0;">
          The offer includes:
        </p>

        <ul style="font-size: 9px; line-height: 1.4; margin: 0; padding-left: 15px;">
          <li>Supply of the components listed above;</li>
          <li>Assistance during installation;</li>
          <li>Commissioning of the installation;</li>
          <li>Remote supervision and monitoring.</li>
        </ul>
      </div>

      <!-- Footer -->
      <div style="position: fixed; bottom: 10mm; left: 20mm; right: 20mm; text-align: center; font-size: 7px; color: #666; border-top: 1px solid #ccc; padding-top: 5px;">
        <div style="margin-bottom: 5px; font-weight: bold;">8</div>
        <div style="line-height: 1.2;">
          FFD Power Italy S.r.l., with registered office in Brescia (BS), Via Matto no. 10, enrolled in the Brescia Register of Companies R.E.A. no. 621413, tax code and VAT no. 04528390984, certified electronic mail (PEC) address ffdpoweritaly@pec.buffetti.it, share capital €680,400.00 fully paid up.
        </div>
      </div>
    </div>
  `;
};

export const generateQuoteEmail = async (quote: Quote): Promise<void> => {
  const subject = `FFD Power Offerta BESS ${quote.quoteNumber} - ${quote.customerData.company}`;
  const body = `Gentile ${quote.customerData.name},

In allegato trova la nostra offerta per il sistema BESS come richiesto.

Dettagli Offerta:
- Riferimento: ${quote.quoteNumber}
- Codice: ${quote.referenceCode}
- Potenza Sistema: ${quote.customerData.power} kW
- Capacità Sistema: ${quote.customerData.capacity} kWh
- Importo Totale: € ${quote.totalAmount.toLocaleString('it-IT')}

Questa offerta è valida per 30 giorni dalla data di emissione.

Per qualsiasi domanda o per richiedere informazioni aggiuntive, non esiti a contattarci.

Cordiali saluti,
Team FFD Power Italy
info@ffdpower.com
Tel: +39 000 000 0000`;

  const mailtoLink = `mailto:${quote.customerData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoLink);
};