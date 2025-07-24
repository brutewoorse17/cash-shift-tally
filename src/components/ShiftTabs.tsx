import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ShiftTabsProps {
  activeShift: string;
  onShiftChange: (shift: string) => void;
}

export const ShiftTabs = ({ activeShift, onShiftChange }: ShiftTabsProps) => {
  return (
    <Tabs value={activeShift} onValueChange={onShiftChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-muted p-1 rounded-lg">
        <TabsTrigger 
          value="1st" 
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold transition-smooth"
        >
          1st Shift
        </TabsTrigger>
        <TabsTrigger 
          value="2nd" 
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold transition-smooth"
        >
          2nd Shift
        </TabsTrigger>
        <TabsTrigger 
          value="3rd" 
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold transition-smooth"
        >
          3rd Shift
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};