import React from "react";
import type { ModelUsageDto } from "@/types";
import { Progress } from "@/components/ui/progress";

interface ModelBreakdownProps {
  models: Record<string, ModelUsageDto>;
  totalCost: number;
  className?: string;
}

const ModelBreakdown: React.FC<ModelBreakdownProps> = ({ models, totalCost, className }) => (
  <div className={className}>
    {Object.entries(models).map(([model, usage]) => {
      const percent = totalCost > 0 ? ((usage.cost ?? 0) / totalCost) * 100 : 0;
      return (
        <div key={model} className="mb-4">
          <h4 className="font-medium">{model}</h4>
          <Progress value={percent} />
          <p className="text-sm text-gray-500">
            {usage.cost ?? 0} ({percent.toFixed(1)}%)
          </p>
        </div>
      );
    })}
  </div>
);

export default ModelBreakdown;
