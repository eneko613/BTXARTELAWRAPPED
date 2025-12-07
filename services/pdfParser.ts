
import { Transaction } from '../types';

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

// Helper to normalize strings for comparison
const normalizeStr = (str: string) => str.trim().toLowerCase();

export const parsePDF = async (file: File): Promise<Transaction[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const transactions: Transaction[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Group text items by Y coordinate to form rows
    const items = textContent.items.map((item: any) => ({
      str: item.str,
      y: item.transform[5], // Y position
      x: item.transform[4]  // X position
    }));

    // Sort by Y descending (top to bottom)
    items.sort((a: any, b: any) => b.y - a.y);

    // Group items into lines based on Y proximity
    const rows: { str: string, x: number }[][] = [];
    if (items.length > 0) {
      let currentRow = [items[0]];
      for (let j = 1; j < items.length; j++) {
        // If Y difference is small, same row
        if (Math.abs(items[j].y - items[j-1].y) < 8) {
          currentRow.push(items[j]);
        } else {
          rows.push(currentRow);
          currentRow = [items[j]];
        }
      }
      rows.push(currentRow);
    }

    // Sort items within each row by X ascending (left to right)
    rows.forEach(row => row.sort((a, b) => a.x - b.x));

    let lastTransaction: Transaction | null = null;

    // Convert rows to strings for parsing
    for (const row of rows) {
      const fullLine = row.map(item => item.str).join(' ').trim();
      
      const dateRegex = /(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/;
      const dateMatch = fullLine.match(dateRegex);

      if (dateMatch && dateMatch.index !== undefined) {
        // Extract ID (everything before date)
        const preDate = fullLine.substring(0, dateMatch.index).trim();
        const idMatch = preDate.match(/(\d+)$/);
        
        if (idMatch) {
          const id = parseInt(idMatch[1]);
          const dateStr = dateMatch[1]; 
          
          const [dPart, tPart] = dateStr.split(' ');
          const [day, month, year] = dPart.split('/').map(Number);
          const [hour, min, sec] = tPart.split(':').map(Number);
          const dateObj = new Date(year, month - 1, day, hour, min, sec);

          // Everything after date
          const postDate = fullLine.substring(dateMatch.index + dateStr.length).trim();
          
          // Look for amounts at the end. (IMPORTE SALDO)
          const allAmountMatches = [...postDate.matchAll(/(-?\d+,\d{2})/g)];
          
          if (allAmountMatches.length >= 2) {
             const amountMatch = allAmountMatches[allAmountMatches.length - 2];
             const balanceMatch = allAmountMatches[allAmountMatches.length - 1];
             
             if (amountMatch && balanceMatch && amountMatch.index !== undefined) {
                const amountStr = amountMatch[0].replace(',', '.');
                const balanceStr = balanceMatch[0].replace(',', '.');
                
                // Content between Date and Amount
                let middleContent = postDate.substring(0, amountMatch.index).trim();
                
                // Extract Transaction Type. It's usually the first word(s).
                let type = "";
                let rest = "";

                // Attempt to identify start of operator
                const knownOperators = [
                    "MB Metro", "Renfe FFCC", "EuskoTren-EuskoTran", "Euskotren Ferrocarril", 
                    "Euskotren-Bus", "Bilbobus", "Funicular Artxanda", "Bizkaiko Zubia", 
                    "Donosti Bus", "Boteros Portugalete", "MB GENERAL", "Bizkaibus", "Nerbioi-Arratia", "Euskotren-Bus-",
                    "EuskoTren-Funicular"
                ];

                let opIndex = -1;
                let foundOp = "";

                for (const op of knownOperators) {
                    const idx = middleContent.indexOf(op);
                    if (idx !== -1) {
                        // We want the earliest occurrence if multiple match (unlikely)
                        if (opIndex === -1 || idx < opIndex) {
                            opIndex = idx;
                            foundOp = op;
                        }
                    }
                }

                if (opIndex !== -1) {
                    type = middleContent.substring(0, opIndex).trim();
                    rest = middleContent.substring(opIndex).trim();
                } else {
                    const space = middleContent.indexOf(' ');
                    if (space > 0) {
                        type = middleContent.substring(0, space);
                        rest = middleContent.substring(space).trim();
                    } else {
                        type = middleContent;
                        rest = "Unknown";
                    }
                }

                // Parse Operator and Location from 'rest'
                let operator = "Unknown";
                let location = "";

                if (foundOp) {
                     // Mapping
                     const opMap: Record<string, string> = {
                        "MB Metro": "Metro Bilbao",
                        "Renfe FFCC": "Renfe",
                        "EuskoTren-EuskoTran": "Euskotren Tranbia",
                        "EuskoTren Ferrocarril": "Euskotren",
                        "Euskotren Ferrocarril": "Euskotren",
                        "Euskotren-Bus": "Bizkaibus",
                        "Euskotren-Bus-": "Bizkaibus",
                        "Bilbobus": "Bilbobus",
                        "Funicular Artxanda": "Funicular Artxanda",
                        "EuskoTren-Funicular": "Funicular Larreineta",
                        "Bizkaiko Zubia": "Bizkaiko Zubia",
                        "Donosti Bus": "Donosti Bus",
                        "Boteros Portugalete": "Boteros Portugalete",
                        "MB GENERAL": "Metro Bilbao",
                        "Nerbioi-Arratia": "Bizkaibus"
                     };
                     
                     operator = opMap[foundOp] || foundOp;
                     location = rest.substring(foundOp.length).trim();
                } else {
                    location = rest;
                }

                // Strict filtering as requested
                const typeLower = normalizeStr(type);
                if (typeLower.includes('venta') || typeLower.includes('recarga')) {
                    // Reset lastTransaction because this row is valid but ignored, 
                    // and subsequent lines shouldn't append to a previous valid trip.
                    lastTransaction = null;
                    continue;
                }

                const transaction: Transaction = {
                    id,
                    date: dateObj,
                    type,
                    operator,
                    location: location.replace(/[\n\r]+/g, " ").trim(), 
                    amount: parseFloat(amountStr),
                    balance: parseFloat(balanceStr),
                    originalType: type
                };
                
                transactions.push(transaction);
                lastTransaction = transaction;
             }
          }
        }
      } else if (lastTransaction) {
        // If it's not a new transaction line, but we have a previous transaction,
        // it might be a continuation of the location/equipment column.
        // We need to filter out page headers/footers.
        const line = fullLine.trim();
        const lowerLine = line.toLowerCase();
        
        // Fix for "radaMonedero" artifact
        if (lowerLine.includes('radamonedero')) {
            continue;
        }
        
        // Basic heuristic to ignore headers
        const isHeader = lowerLine.includes('tarjeta:') || lowerLine.includes('fecha transaccion') || lowerLine.match(/^\d{2}\/\d{2}\/\d{4}$/) || lowerLine.includes('dic 07, 2025');
        
        if (!isHeader && line.length > 0) {
            // Append to the last transaction's location
            // Ensure we add a space
            lastTransaction.location = (lastTransaction.location + " " + line).trim();
        }
      }
    }
  }

  return transactions;
};