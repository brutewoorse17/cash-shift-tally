import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { FileText, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10, 5, 1];

type ShiftData = {
  [denomination: number]: number;
};

type AllShiftsData = {
  [shift: string]: ShiftData;
};

interface PDFExportProps {
  shifts: AllShiftsData;
  activeShift: string;
}

export const PDFExport = ({ shifts, activeShift }: PDFExportProps) => {
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const calculateShiftTotal = (shiftData: ShiftData) => {
    return DENOMINATIONS.reduce((total, denomination) => {
      return total + (denomination * (shiftData[denomination] || 0));
    }, 0);
  };

  const generatePDFReport = () => {
    const doc = new jsPDF('landscape'); // Use landscape for better table layout
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("CASH BREAKDOWN", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`DATE: ${new Date().toLocaleDateString('en-GB')}`, pageWidth / 2, 30, { align: "center" });

    // Table dimensions
    const tableWidth = 85;
    const tableHeight = 90;
    const startX1 = 20; // Left tables
    const startX2 = pageWidth / 2 + 10; // Right tables
    const startY1 = 45; // Top tables
    const startY2 = startY1 + tableHeight + 15; // Bottom tables

    // Helper function to draw a shift table
    const drawShiftTable = (x: number, y: number, shiftName: string, shiftData: ShiftData, personName?: string) => {
      const cellHeight = 8;
      const total = calculateShiftTotal(shiftData);
      
      // Header
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      const headerText = personName ? `${shiftName} SHIFT(${personName})` : `${shiftName} SHIFT`;
      doc.text(headerText, x + tableWidth/2, y - 3, { align: "center" });
      
      // Table border
      doc.rect(x, y, tableWidth, tableHeight);
      
      let currentY = y + cellHeight;
      
      // Draw each denomination row
      DENOMINATIONS.forEach((denomination, index) => {
        const quantity = shiftData[denomination] || 0;
        const rowTotal = denomination * quantity;
        
        // Row lines
        if (index < DENOMINATIONS.length - 1) {
          doc.line(x, currentY, x + tableWidth, currentY);
        }
        
        // Vertical lines
        doc.line(x + 20, y, x + 20, y + tableHeight - cellHeight); // After denomination
        doc.line(x + 30, y, x + 30, y + tableHeight - cellHeight); // After X
        doc.line(x + 45, y, x + 45, y + tableHeight - cellHeight); // After quantity
        doc.line(x + 55, y, x + 55, y + tableHeight - cellHeight); // After =
        
        // Cell content
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        
        // Denomination
        doc.text(denomination.toString(), x + 10, currentY - 2, { align: "center" });
        // X
        doc.text("X", x + 25, currentY - 2, { align: "center" });
        // Quantity
        if (quantity > 0) {
          doc.text(quantity.toString(), x + 37.5, currentY - 2, { align: "center" });
        }
        // =
        doc.text("=", x + 50, currentY - 2, { align: "center" });
        // Total
        if (rowTotal > 0) {
          doc.text(rowTotal.toString(), x + 70, currentY - 2, { align: "center" });
        }
        
        currentY += cellHeight;
      });
      
      // Total row
      doc.line(x, y + tableHeight - cellHeight, x + tableWidth, y + tableHeight - cellHeight);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("TOTAL", x + 10, y + tableHeight - 2, { align: "left" });
      doc.text(`₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, x + 70, y + tableHeight - 2, { align: "center" });
    };

    // Get shift names and person names (you can customize these)
    const shiftPersons = {
      "1st": "STAFF1",
      "2nd": "STAFF2", 
      "3rd": "STAFF3"
    };

    // Draw the four tables in 2x2 layout
    const shiftNames = ["1st", "2nd", "3rd"];
    
    // Top row
    if (shifts["1st"] && Object.keys(shifts["1st"]).length > 0) {
      drawShiftTable(startX1, startY1, "1ST", shifts["1st"], shiftPersons["1st"]);
    }
    if (shifts["2nd"] && Object.keys(shifts["2nd"]).length > 0) {
      drawShiftTable(startX2, startY1, "2ND", shifts["2nd"], shiftPersons["2nd"]);
    }

    // Bottom left - 3rd shift
    if (shifts["3rd"] && Object.keys(shifts["3rd"]).length > 0) {
      drawShiftTable(startX1, startY2, "3RD", shifts["3rd"], shiftPersons["3rd"]);
    }

    // Bottom right - Total Cash Domination
    const totalCashData: ShiftData = {};
    DENOMINATIONS.forEach(denomination => {
      let totalQty = 0;
      Object.values(shifts).forEach(shift => {
        totalQty += shift[denomination] || 0;
      });
      if (totalQty > 0) {
        totalCashData[denomination] = totalQty;
      }
    });

    // Draw total table
    const totalX = startX2;
    const totalY = startY2;
    const totalAmount = calculateShiftTotal(totalCashData);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL CASH DOMINATION", totalX + tableWidth/2, totalY - 3, { align: "center" });
    
    // Table border
    doc.rect(totalX, totalY, tableWidth, tableHeight);
    
    let currentY = totalY + 8;
    
    DENOMINATIONS.forEach((denomination, index) => {
      const quantity = totalCashData[denomination] || 0;
      const rowTotal = denomination * quantity;
      
      if (index < DENOMINATIONS.length - 1) {
        doc.line(totalX, currentY, totalX + tableWidth, currentY);
      }
      
      // Vertical lines
      doc.line(totalX + 20, totalY, totalX + 20, totalY + tableHeight - 8);
      doc.line(totalX + 30, totalY, totalX + 30, totalY + tableHeight - 8);
      doc.line(totalX + 45, totalY, totalX + 45, totalY + tableHeight - 8);
      doc.line(totalX + 55, totalY, totalX + 55, totalY + tableHeight - 8);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      
      doc.text(denomination.toString(), totalX + 10, currentY - 2, { align: "center" });
      doc.text("X", totalX + 25, currentY - 2, { align: "center" });
      if (quantity > 0) {
        doc.text(quantity.toString(), totalX + 37.5, currentY - 2, { align: "center" });
      }
      doc.text("=", totalX + 50, currentY - 2, { align: "center" });
      if (rowTotal > 0) {
        doc.text(rowTotal.toString(), totalX + 70, currentY - 2, { align: "center" });
      }
      
      currentY += 8;
    });
    
    // Total row for cash domination
    doc.line(totalX, totalY + tableHeight - 8, totalX + tableWidth, totalY + tableHeight - 8);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL", totalX + 10, totalY + tableHeight - 2, { align: "left" });
    doc.text(`₱${totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, totalX + 70, totalY + tableHeight - 2, { align: "center" });

    // Save the PDF
    doc.save(`cash-breakdown-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "PDF Generated",
      description: "Professional cash breakdown report downloaded.",
    });
  };

  const printCurrentView = async () => {
    try {
      // Create a printable version
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const currentShiftData = shifts[activeShift] || {};
      const currentTotal = calculateShiftTotal(currentShiftData);
      const grandTotal = Object.values(shifts).reduce((total, shift) => {
        return total + calculateShiftTotal(shift);
      }, 0);

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cash Count - ${activeShift} Shift</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .denomination-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .total-section { margin-top: 20px; padding-top: 20px; border-top: 2px solid #333; }
            .grand-total { font-size: 24px; font-weight: bold; text-align: center; margin-top: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Cash Count Report</h1>
            <h2>${activeShift} Shift</h2>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="denomination-list">
            ${DENOMINATIONS.map(denomination => {
              const quantity = currentShiftData[denomination] || 0;
              const total = denomination * quantity;
              return quantity > 0 ? `
                <div class="denomination-row">
                  <span>₱${denomination}</span>
                  <span>Qty: ${quantity}</span>
                  <span>${formatCurrency(total)}</span>
                </div>
              ` : '';
            }).join('')}
          </div>
          
          <div class="total-section">
            <div class="denomination-row" style="font-weight: bold; font-size: 18px;">
              <span>${activeShift} Shift Total:</span>
              <span></span>
              <span>${formatCurrency(currentTotal)}</span>
            </div>
          </div>
          
          <div class="grand-total">
            Total Cash Domination: ${formatCurrency(grandTotal)}
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      
      toast({
        title: "Print Ready",
        description: "Print dialog opened for current shift.",
      });
    } catch (error) {
      toast({
        title: "Print Error",
        description: "Unable to open print dialog.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button
        onClick={generatePDFReport}
        className="flex items-center gap-2 bg-gradient-primary hover:opacity-90"
      >
        <FileText className="w-4 h-4" />
        Export PDF Report
      </Button>
      
      <Button
        onClick={printCurrentView}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Printer className="w-4 h-4" />
        Print Current Shift
      </Button>
    </div>
  );
};