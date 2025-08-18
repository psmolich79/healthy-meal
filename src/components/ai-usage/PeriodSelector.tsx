import React, { useState } from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface PeriodSelectorProps {
  currentPeriod: string;
  onPeriodChange: (period: string) => void;
  onDateRangeChange: (startDate: string, endDate: string) => void;
  disabled?: boolean;
  className?: string;
}

const periods = [
  { value: "day", label: "Dzień" },
  { value: "week", label: "Tydzień" },
  { value: "month", label: "Miesiąc" },
  { value: "year", label: "Rok" },
  { value: "custom", label: "Niestandardowy" },
];

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  currentPeriod,
  onPeriodChange,
  onDateRangeChange,
  disabled,
  className,
}) => {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  return (
    <div className={className}>
      <Select value={currentPeriod} onValueChange={onPeriodChange} disabled={disabled}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Wybierz okres" />
        </SelectTrigger>
        <SelectContent>
          {periods.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {currentPeriod === "custom" && (
        <div className="flex items-center space-x-2 mt-2">
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="border rounded p-1" />
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="border rounded p-1" />
          <Button onClick={() => onDateRangeChange(start, end)}>Zastosuj</Button>
        </div>
      )}
    </div>
  );
};

export default PeriodSelector;
