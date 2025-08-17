import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface TotalTokensProps {
  inputTokens: number;
  outputTokens: number;
  className?: string;
}

const TotalTokens: React.FC<TotalTokensProps> = ({ inputTokens, outputTokens, className }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>Tokeny</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">{inputTokens + outputTokens}</p>
    </CardContent>
  </Card>
);

export default TotalTokens;
