import React, { useState } from 'react';
import { BookOpen, Copy, Check, Clock, ChefHat } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface InstructionsSectionProps {
  instructions: string[];
  className?: string;
}

export const InstructionsSection: React.FC<InstructionsSectionProps> = ({
  instructions,
  className = ''
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleCopyInstructions = async () => {
    try {
      const instructionsText = instructions.join('\n');
      await navigator.clipboard.writeText(instructionsText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy instructions:', error);
    }
  };

  const toggleStepCompletion = (stepIndex: number) => {
    const newCompletedSteps = new Set(completedSteps);
    if (newCompletedSteps.has(stepIndex)) {
      newCompletedSteps.delete(stepIndex);
    } else {
      newCompletedSteps.add(stepIndex);
    }
    setCompletedSteps(newCompletedSteps);
  };

  const resetProgress = () => {
    setCompletedSteps(new Set());
  };

  // Parse instructions into steps
  const parseInstructions = (text: string[]) => {
    const lines = text.filter(line => line.trim().length > 0);
    const steps: Array<{
      number?: number;
      text: string;
      isStep: boolean;
      estimatedTime?: string;
    }> = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check if line starts with a number (step)
      const stepMatch = trimmedLine.match(/^(\d+)\.?\s*(.+)/);
      if (stepMatch) {
        const stepNumber = parseInt(stepMatch[1]);
        const stepText = stepMatch[2];
        
        // Try to extract time estimates (e.g., "10 min", "2 hours")
        const timeMatch = stepText.match(/(\d+)\s*(min|minut|godzin|godz)/i);
        const estimatedTime = timeMatch ? timeMatch[0] : undefined;
        
        steps.push({
          number: stepNumber,
          text: stepText,
          isStep: true,
          estimatedTime
        });
      } else {
        // It's a regular instruction or note
        steps.push({
          text: trimmedLine,
          isStep: false
        });
      }
    });

    return steps;
  };

  const parsedSteps = parseInstructions(instructions);
  const actualSteps = parsedSteps.filter(step => step.isStep);
  const completedCount = completedSteps.size;
  const totalSteps = actualSteps.length;

  // Estimate total cooking time
  const estimateTotalTime = () => {
    let totalMinutes = 0;
    actualSteps.forEach(step => {
      if (step.estimatedTime) {
        const timeMatch = step.estimatedTime.match(/(\d+)/);
        if (timeMatch) {
          const time = parseInt(timeMatch[1]);
          if (step.estimatedTime.includes('godz') || step.estimatedTime.includes('hour')) {
            totalMinutes += time * 60;
          } else {
            totalMinutes += time;
          }
        }
      }
    });
    
    if (totalMinutes === 0) return null;
    
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
    }
    return `${totalMinutes}min`;
  };

  const totalTime = estimateTotalTime();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold">Instrukcje przygotowania</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            {completedCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetProgress}
                className="text-xs"
              >
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyInstructions}
              className="text-xs"
            >
              {isCopied ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Skopiowano
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Kopiuj
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Progress and Time Info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-muted-foreground">
              <span>Postęp: {completedCount}/{totalSteps} kroków</span>
              {totalTime && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>~{totalTime}</span>
                </div>
              )}
            </div>
            
            {totalSteps > 0 && (
              <div className="text-right">
                <div className="text-xs text-muted-foreground">
                  {Math.round((completedCount / totalSteps) * 100)}% ukończone
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            {parsedSteps.map((step, index) => {
              if (step.isStep && step.number) {
                const isCompleted = completedSteps.has(index);
                
                return (
                  <div
                    key={index}
                    className={`flex items-start space-x-4 p-4 rounded-lg border transition-all cursor-pointer ${
                      isCompleted 
                        ? 'bg-muted/50 opacity-75 border-primary/30' 
                        : 'hover:bg-muted/30 border-border'
                    }`}
                    onClick={() => toggleStepCompletion(index)}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      isCompleted 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? '✓' : step.number}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <p className={`leading-relaxed ${isCompleted ? 'line-through' : ''}`}>
                        {step.text}
                      </p>
                      
                      {step.estimatedTime && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {step.estimatedTime}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              } else {
                // Non-step instruction (note, tip, etc.)
                return (
                  <div key={index} className="pl-12 text-sm text-muted-foreground italic">
                    {step.text}
                  </div>
                );
              }
            })}
          </div>

          {/* Summary */}
          <div className="pt-3 border-t text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>
                👨‍🍳 <strong>Kroki:</strong> {totalSteps} do wykonania
              </span>
              {totalTime && (
                <span>
                  ⏱️ <strong>Czas:</strong> około {totalTime}
                </span>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground">
            <p>
              💡 <strong>Wskazówka:</strong> Kliknij w kroki, aby oznaczyć je jako wykonane. 
              Przygotuj wszystkie składniki przed rozpoczęciem gotowania.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};