import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TotalCostProps {
  cost: number;
  className?: string;
}

const TotalCost: React.FC<TotalCostProps> = ({ cost, className }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>Koszt</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">{cost.toFixed(2)} PLN</p>
    </CardContent>
  </Card>
);

export default TotalCost;
