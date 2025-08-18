import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface UsageHeaderProps {
  lastUpdated?: string;
  className?: string;
}

const UsageHeader: React.FC<UsageHeaderProps> = ({ lastUpdated, className }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>Statystyki użycia AI</CardTitle>
      {lastUpdated && (
        <CardDescription>Ostatnia aktualizacja: {new Date(lastUpdated).toLocaleString()}</CardDescription>
      )}
    </CardHeader>
  </Card>
);

export default UsageHeader;
