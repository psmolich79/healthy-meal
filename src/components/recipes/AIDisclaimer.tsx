import React from 'react';
import { AlertTriangle, Brain, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AIDisclaimerProps {
  className?: string;
}

export const AIDisclaimer: React.FC<AIDisclaimerProps> = ({
  className = ''
}) => {
  return (
    <Alert variant="destructive" className={`border-amber-200 bg-amber-50 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <div className="space-y-3">
          {/* Main Warning */}
          <div className="flex items-start space-x-2">
            <Brain className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">
                Ten przepis został wygenerowany przez sztuczną inteligencję po polsku
              </p>
              <p className="text-xs mt-1">
                AI stara się tworzyć bezpieczne i smaczne przepisy w języku polskim, ale zawsze sprawdź składniki 
                i instrukcje przed przygotowaniem posiłku.
              </p>
            </div>
          </div>

          {/* Safety Guidelines */}
          <div className="border-t border-amber-200 pt-3">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-xs">
                <p className="font-medium">Zalecenia bezpieczeństwa:</p>
                <ul className="space-y-1 list-disc list-inside ml-2">
                  <li>Sprawdź, czy nie jesteś uczulony na żaden składnik</li>
                  <li>Upewnij się, że wszystkie składniki są świeże i bezpieczne</li>
                  <li>Przestrzegaj podstawowych zasad higieny w kuchni</li>
                  <li>W razie wątpliwości skonsultuj się z dietetykiem</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-xs text-amber-700 bg-amber-100 rounded p-2">
            <p>
              💡 <strong>Pamiętaj:</strong> AI uwzględnia Twoje preferencje żywieniowe, 
              ale nie zastępuje profesjonalnej porady dietetycznej lub medycznej.
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};