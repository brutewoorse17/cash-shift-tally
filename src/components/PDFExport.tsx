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
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Cash Count Report", pageWidth / 2, yPosition, { align: "center" });
    
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: "center" });
    
    yPosition += 20;

    // Process each shift
    Object.entries(shifts).forEach(([shiftName, shiftData]) => {
      if (Object.keys(shiftData).length === 0) return;

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`${shiftName} Shift`, 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // Table header
      doc.text("Denomination", 20, yPosition);
      doc.text("Quantity", 80, yPosition);
      doc.text("Total", 130, yPosition);
      yPosition += 5;

      // Draw line
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 5;

      let shiftTotal = 0;

      // Denomination details
      DENOMINATIONS.forEach((denomination) => {
        const quantity = shiftData[denomination] || 0;
        if (quantity > 0) {
          const total = denomination * quantity;
          shiftTotal += total;

          doc.text(`₱${denomination}`, 20, yPosition);
          doc.text(quantity.toString(), 80, yPosition);
          doc.text(formatCurrency(total), 130, yPosition);
          yPosition += 5;
        }
      });

      // Shift total
      yPosition += 5;
      doc.setFont("helvetica", "bold");
      doc.text(`${shiftName} Total: ${formatCurrency(shiftTotal)}`, 20, yPosition);
      yPosition += 15;
      doc.setFont("helvetica", "normal");

      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
    });

    // Grand total
    const grandTotal = Object.values(shifts).reduce((total, shift) => {
      return total + calculateShiftTotal(shift);
    }, 0);

    yPosition += 10;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`GRAND TOTAL: ${formatCurrency(grandTotal)}`, pageWidth / 2, yPosition, { align: "center" });

    // Save the PDF
    doc.save(`cash-count-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "PDF Generated",
      description: "Cash count report has been downloaded.",
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