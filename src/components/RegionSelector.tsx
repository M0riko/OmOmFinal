import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Globe, Check, Star } from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

export function RegionSelector() {
  const [currentLocalization, setCurrentLocalization] = useState<any>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");

  useEffect(() => {
    const localization = apiService.getLocalization();
    setCurrentLocalization(localization);
    setSelectedRegion(localization.region);
    setSelectedLanguage(localization.language);
  }, []);

  const supportedRegions = apiService.getSupportedRegions();
  const supportedLanguages = apiService.getSupportedLanguages();

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    const defaultLanguage = supportedRegions[region as keyof typeof supportedRegions]?.defaultLanguage;
    if (defaultLanguage) {
      setSelectedLanguage(defaultLanguage);
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  const applyChanges = () => {
    apiService.setRegion(selectedRegion, selectedLanguage);
    const newLocalization = apiService.getLocalization();
    setCurrentLocalization(newLocalization);
    toast.success(`Регіон змінено на ${newLocalization.regionName} (${newLocalization.languageName})`);
  };

  const isChanged = selectedRegion !== currentLocalization?.region || selectedLanguage !== currentLocalization?.language;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Налаштування регіону</h3>
        <Badge variant="secondary" className="gap-1">
          <Star className="w-3 h-3" />
          Premier
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Регіон</label>
            <Select value={selectedRegion} onValueChange={handleRegionChange}>
              <SelectTrigger>
                <SelectValue placeholder="Оберіть регіон" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(supportedRegions).map(([code, region]) => (
                  <SelectItem key={code} value={code}>
                    <div className="flex items-center gap-2">
                      <span>{region.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {code}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Мова</label>
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger>
                <SelectValue placeholder="Оберіть мову" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(supportedLanguages).map(([code, language]) => (
                  <SelectItem key={code} value={code}>
                    {language}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {currentLocalization && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Поточні налаштування:</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <div>Регіон: <span className="font-medium">{currentLocalization.regionName}</span> ({currentLocalization.region})</div>
              <div>Мова: <span className="font-medium">{currentLocalization.languageName}</span> ({currentLocalization.language})</div>
            </div>
          </div>
        )}

        <Button 
          onClick={applyChanges} 
          disabled={!isChanged}
          className="w-full gap-2"
        >
          <Globe className="w-4 h-4" />
          Застосувати зміни
        </Button>

        <div className="text-xs text-muted-foreground">
          <p>• Зміна регіону впливає на пошук продуктів та рецептів</p>
          <p>• Доступні локалізовані дані для кожного регіону</p>
          <p>• Premier функції підтримують всі регіони</p>
        </div>
      </div>
    </Card>
  );
}
