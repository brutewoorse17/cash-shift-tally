import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CashTotalProps {
  total: number;
  title?: string;
}

export const CashTotal = ({ total, title = "Total Cash" }: CashTotalProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card className="bg-gradient-cash text-cash-total-foreground shadow-total border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold opacity-90">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl md:text-5xl font-bold font-mono tracking-tight animate-pulse-slow">
          {formatCurrency(total)}
        </div>
        <div className="mt-2 text-sm opacity-75">
          Total amount for current shift
        </div>
      </CardContent>
    </Card>
  );
};