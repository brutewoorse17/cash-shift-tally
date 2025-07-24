import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DenominationInputProps {
  denomination: number;
  quantity: number;
  onChange: (quantity: number) => void;
}

export const DenominationInput = ({ denomination, quantity, onChange }: DenominationInputProps) => {
  const total = denomination * quantity;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDenomination = (amount: number) => {
    if (amount >= 1000) {
      return `₱${(amount / 1000)}k`;
    }
    return `₱${amount}`;
  };

  return (
    <div className="bg-denomination border border-border rounded-lg p-4 shadow-card transition-smooth hover:shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <Label 
          htmlFor={`denomination-${denomination}`}
          className="text-lg font-semibold text-denomination-foreground"
        >
          {formatDenomination(denomination)}
        </Label>
        <div className="text-sm text-muted-foreground font-mono">
          {formatCurrency(total)}
        </div>
      </div>
      
      <Input
        id={`denomination-${denomination}`}
        type="number"
        min="0"
        value={quantity || ''}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        placeholder="0"
        className="text-center text-lg font-mono bg-background border-2 focus:border-primary transition-smooth"
      />
      
      <div className="mt-2 text-xs text-muted-foreground text-center">
        Qty: {quantity}
      </div>
    </div>
  );
};