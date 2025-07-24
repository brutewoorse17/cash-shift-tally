import { useState } from "react";
import { DenominationInput } from "./DenominationInput";
import { ShiftTabs } from "./ShiftTabs";
import { CashTotal } from "./CashTotal";
import { Button } from "@/components/ui/button";
import { RotateCcw, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10, 5, 1];

type ShiftData = {
  [denomination: number]: number;
};

type AllShiftsData = {
  [shift: string]: ShiftData;
};

export const CashCounter = () => {
  const [activeShift, setActiveShift] = useState("1st");
  const [shifts, setShifts] = useState<AllShiftsData>({
    "1st": {},
    "2nd": {},
    "3rd": {},
  });
  const { toast } = useToast();

  const updateQuantity = (denomination: number, quantity: number) => {
    setShifts(prev => ({
      ...prev,
      [activeShift]: {
        ...prev[activeShift],
        [denomination]: quantity,
      },
    }));
  };

  const getCurrentShiftTotal = () => {
    const currentShift = shifts[activeShift] || {};
    return DENOMINATIONS.reduce((total, denomination) => {
      return total + (denomination * (currentShift[denomination] || 0));
    }, 0);
  };

  const getAllShiftsTotal = () => {
    return Object.values(shifts).reduce((grandTotal, shift) => {
      return grandTotal + DENOMINATIONS.reduce((shiftTotal, denomination) => {
        return shiftTotal + (denomination * (shift[denomination] || 0));
      }, 0);
    }, 0);
  };

  const clearCurrentShift = () => {
    setShifts(prev => ({
      ...prev,
      [activeShift]: {},
    }));
    toast({
      title: "Shift Cleared",
      description: `${activeShift} shift has been reset to zero.`,
    });
  };

  const currentShiftData = shifts[activeShift] || {};

  return (
    <div className="min-h-screen bg-gradient-subtle p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Cash Counter
          </h1>
          <p className="text-muted-foreground">
            Philippine Peso Denomination Calculator
          </p>
        </div>

        {/* Shift Tabs */}
        <div className="mb-6">
          <ShiftTabs activeShift={activeShift} onShiftChange={setActiveShift} />
        </div>

        {/* Current Shift Total */}
        <div className="mb-8">
          <CashTotal 
            total={getCurrentShiftTotal()} 
            title={`${activeShift} Shift Total`}
          />
        </div>

        {/* Denominations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {DENOMINATIONS.map((denomination) => (
            <DenominationInput
              key={denomination}
              denomination={denomination}
              quantity={currentShiftData[denomination] || 0}
              onChange={(quantity) => updateQuantity(denomination, quantity)}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={clearCurrentShift}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Clear {activeShift} Shift
          </Button>
        </div>

        {/* All Shifts Total */}
        <div className="border-t pt-8">
          <CashTotal 
            total={getAllShiftsTotal()} 
            title="Total Cash Domination"
          />
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Combined total across all shifts
          </div>
        </div>
      </div>
    </div>
  );
};