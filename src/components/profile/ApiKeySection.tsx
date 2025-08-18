import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Key, Save, Trash2, AlertCircle, CheckCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface ApiKeySectionProps {
  currentApiKey?: string;
  isActive?: boolean;
  lastUsedAt?: string;
  usageCount?: number;
  onApiKeyUpdate: (apiKey: string) => Promise<void>;
  onApiKeyDelete: () => Promise<void>;
  isLoading?: boolean;
}

export const ApiKeySection: React.FC<ApiKeySectionProps> = ({
  currentApiKey,
  isActive = false,
  lastUsedAt,
  usageCount = 0,
  onApiKeyUpdate,
  onApiKeyDelete,
  isLoading = false,
}) => {
  const [apiKey, setApiKey] = useState(currentApiKey || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isEditing, setIsEditing] = useState(!currentApiKey);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error("Klucz API nie może być pusty");
      return;
    }

    if (apiKey.trim().length < 20) {
      toast.error("Klucz API wydaje się być nieprawidłowy");
      return;
    }

    setIsSaving(true);
    try {
      await onApiKeyUpdate(apiKey.trim());
      setIsEditing(false);
      toast.success("Klucz API został zaktualizowany");
    } catch (error) {
      toast.error("Nie udało się zaktualizować klucza API");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Czy na pewno chcesz usunąć swój klucz API? Przepisy będą generowane z użyciem domyślnego klucza aplikacji.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await onApiKeyDelete();
      setApiKey("");
      setIsEditing(true);
      toast.success("Klucz API został usunięty");
    } catch (error) {
      toast.error("Nie udało się usunąć klucza API");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setApiKey(currentApiKey || "");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setApiKey(currentApiKey || "");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Nigdy";
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Klucz API OpenAI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Użyj własnego klucza API OpenAI, aby generować przepisy bez ograniczeń. 
            Twój klucz jest szyfrowany i używany tylko do generowania przepisów.
          </AlertDescription>
        </Alert>

        {/* Current Status */}
        {currentApiKey && (
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Badge variant={isActive ? "default" : "secondary"}>
                  {isActive ? "Aktywny" : "Nieaktywny"}
                </Badge>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Użyto {usageCount} razy
                </span>
              </div>
            </div>
            <div className="text-right text-sm text-slate-600 dark:text-slate-400">
              <div>Ostatnio użyty: {formatDate(lastUsedAt)}</div>
            </div>
          </div>
        )}

        {/* API Key Input */}
        {isEditing ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="api-key">Klucz API OpenAI</Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Klucz zaczyna się od "sk-" i ma około 51 znaków
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving || !apiKey.trim()}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Zapisywanie..." : "Zapisz"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Anuluj
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Klucz API: {currentApiKey ? "••••••••" + currentApiKey.slice(-4) : "Brak"}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                disabled={isLoading}
              >
                Edytuj
              </Button>
              {currentApiKey && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting || isLoading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Security Note */}
        <Alert variant="secondary">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Bezpieczeństwo:</strong> Twój klucz API jest szyfrowany w bazie danych 
            i używany tylko do generowania przepisów. Nie ma dostępu do innych funkcji OpenAI.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
