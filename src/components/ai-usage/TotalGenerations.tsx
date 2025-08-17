import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface TotalGenerationsProps {
  count: number;
  className?: string;
}

const TotalGenerations: React.FC<TotalGenerationsProps> = ({ count, className }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>Generacje</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">{count}</p>
    </CardContent>
  </Card>
);

export default TotalGenerations;
