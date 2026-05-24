import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Bell, 
  Smartphone, 
  Globe, 
  Shield, 
  Download, 
  Trash2, 
  Save, 
  LogOut,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Apple,
  Smartphone as Android
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface EnhancedSettingsProps {
  user: any;
  onUpdateUser: (data: any) => void;
  onLogout: () => void;
}

export function EnhancedSettings({ user, onUpdateUser, onLogout }: EnhancedSettingsProps) {
  // Личные данные
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(170);
  
  // Настройки уведомлений
  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    mealReminders: true,
    waterReminders: true,
    weeklyReports: true,
    achievements: true,
    socialUpdates: false
  });
  
  // Общие настройки
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [language, setLanguage] = useState("uk");
  const [units, setUnits] = useState({
    weight: "kg",
    height: "cm",
    temperature: "celsius"
  });
  
  // Интеграции
  const [integrations, setIntegrations] = useState({
    appleHealth: false,
    googleFit: false,
    strava: false,
    myFitnessPal: false
  });

  useEffect(() => {
    // Загрузка настроек из localStorage
    try {
      const savedSettings = localStorage.getItem('omomo_user_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setNotifications(settings.notifications || notifications);
        setTheme(settings.theme || "system");
        setLanguage(settings.language || "uk");
        setUnits(settings.units || units);
        setIntegrations(settings.integrations || integrations);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  const saveSettings = () => {
    const settingsData = {
      notifications,
      theme,
      language,
      units,
      integrations
    };
    
    try {
      localStorage.setItem('omomo_user_settings', JSON.stringify(settingsData));
      toast.success("Налаштування збережено!");
    } catch (error) {
      toast.error("Помилка збереження налаштувань");
    }
  };

  const saveProfile = () => {
    onUpdateUser({ name, email });
    toast.success("Профіль оновлено!");
  };

  const exportData = () => {
    // В реальном приложении здесь будет экспорт всех данных пользователя
    const userData = {
      profile: { name, email, age, height },
      settings: { notifications, theme, language, units, integrations },
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `omomo-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success("Дані експортовано!");
  };

  const deleteAccount = () => {
    if (confirm("Ви впевнені, що хочете видалити акаунт? Цю дію неможливо скасувати.")) {
      // В реальном приложении здесь будет удаление аккаунта
      toast.success("Акаунт буде видалено протягом 24 годин");
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">Акаунт</TabsTrigger>
          <TabsTrigger value="notifications">Сповіщення</TabsTrigger>
          <TabsTrigger value="general">Загальні</TabsTrigger>
          <TabsTrigger value="privacy">Приватність</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          {/* Личные данные */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Особисті дані</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Ім'я</Label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Як до вас звертатися"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <Input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="you@example.com"
                  type="email"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Вік</Label>
                <Input 
                  value={age} 
                  onChange={(e) => setAge(Number(e.target.value) || 0)} 
                  placeholder="25"
                  type="number"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Зріст (см)</Label>
                <Input 
                  value={height} 
                  onChange={(e) => setHeight(Number(e.target.value) || 0)} 
                  placeholder="170"
                  type="number"
                  className="mt-1"
                />
              </div>
            </div>
            <Button onClick={saveProfile} className="mt-4 gap-2">
              <Save className="w-4 h-4" />
              Оновити профіль
            </Button>
          </Card>

          {/* Интеграции */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Інтеграції</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Apple className="w-6 h-6 text-gray-600" />
                  <div>
                    <h4 className="font-medium">Apple Health</h4>
                    <p className="text-sm text-muted-foreground">Синхронізація з Apple Health</p>
                  </div>
                </div>
                <Switch 
                  checked={integrations.appleHealth}
                  onCheckedChange={(checked) => setIntegrations(prev => ({ ...prev, appleHealth: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Android className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-medium">Google Fit</h4>
                    <p className="text-sm text-muted-foreground">Синхронізація з Google Fit</p>
                  </div>
                </div>
                <Switch 
                  checked={integrations.googleFit}
                  onCheckedChange={(checked) => setIntegrations(prev => ({ ...prev, googleFit: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">S</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Strava</h4>
                    <p className="text-sm text-muted-foreground">Синхронізація з Strava</p>
                  </div>
                </div>
                <Switch 
                  checked={integrations.strava}
                  onCheckedChange={(checked) => setIntegrations(prev => ({ ...prev, strava: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <div>
                    <h4 className="font-medium">MyFitnessPal</h4>
                    <p className="text-sm text-muted-foreground">Синхронізація з MyFitnessPal</p>
                  </div>
                </div>
                <Switch 
                  checked={integrations.myFitnessPal}
                  onCheckedChange={(checked) => setIntegrations(prev => ({ ...prev, myFitnessPal: checked }))}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Налаштування сповіщень</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Нагадування про тренування</h4>
                  <p className="text-sm text-muted-foreground">Отримувати нагадування про заплановані тренування</p>
                </div>
                <Switch 
                  checked={notifications.workoutReminders}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, workoutReminders: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Нагадування про їжу</h4>
                  <p className="text-sm text-muted-foreground">Нагадування записати прийоми їжі</p>
                </div>
                <Switch 
                  checked={notifications.mealReminders}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, mealReminders: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Нагадування про воду</h4>
                  <p className="text-sm text-muted-foreground">Нагадування випити воду</p>
                </div>
                <Switch 
                  checked={notifications.waterReminders}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, waterReminders: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Тижневі звіти</h4>
                  <p className="text-sm text-muted-foreground">Отримувати щотижневі звіти про прогрес</p>
                </div>
                <Switch 
                  checked={notifications.weeklyReports}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReports: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Досягнення</h4>
                  <p className="text-sm text-muted-foreground">Сповіщення про нові досягнення</p>
                </div>
                <Switch 
                  checked={notifications.achievements}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, achievements: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Соціальні оновлення</h4>
                  <p className="text-sm text-muted-foreground">Оновлення від друзів та спільноти</p>
                </div>
                <Switch 
                  checked={notifications.socialUpdates}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, socialUpdates: checked }))}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Загальні налаштування</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Тема</Label>
                <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        Світла
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        Темна
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Системна
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Мова</Label>
                <Select value={language} onValueChange={(value) => setLanguage(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uk">Українська</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ru">Русский</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Одиниці виміру</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <Select value={units.weight} onValueChange={(value) => setUnits(prev => ({ ...prev, weight: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">кг</SelectItem>
                      <SelectItem value="lbs">фунти</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={units.height} onValueChange={(value) => setUnits(prev => ({ ...prev, height: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">см</SelectItem>
                      <SelectItem value="ft">фути</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={units.temperature} onValueChange={(value) => setUnits(prev => ({ ...prev, temperature: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="celsius">°C</SelectItem>
                      <SelectItem value="fahrenheit">°F</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Приватність та дані</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Експорт даних</h4>
                  <p className="text-sm text-muted-foreground">Завантажити всі ваші дані</p>
                </div>
                <Button variant="outline" onClick={exportData} className="gap-2">
                  <Download className="w-4 h-4" />
                  Експорт
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Видалити акаунт</h4>
                  <p className="text-sm text-muted-foreground">Назавжди видалити ваш акаунт та всі дані</p>
                </div>
                <Button variant="destructive" onClick={deleteAccount} className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Видалити
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Кнопки действий */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onLogout} className="gap-2">
          <LogOut className="w-4 h-4" />
          Вийти
        </Button>
        <Button onClick={saveSettings} className="gap-2">
          <Save className="w-4 h-4" />
          Зберегти налаштування
        </Button>
      </div>
    </div>
  );
}
