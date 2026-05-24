import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database, 
  Trash2,
  Download,
  Upload,
  LogOut,
  Save,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { toast } from "sonner";

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const { t, locale, setLocale } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    age: (user as any)?.age || '',
    gender: (user as any)?.gender || '',
    height: (user as any)?.height || '',
    weight: (user as any)?.weight || '',
    targetWeight: (user as any)?.targetWeight || '',
    activityLevel: (user as any)?.activityLevel || 'moderate',
    theme: 'system',
    language: locale || 'uk',
    notifications: {
      workout: true,
      meals: true,
      water: true,
      weekly: true,
      achievements: true
    },
    privacy: {
      profileVisible: true,
      dataSharing: false,
      analytics: true
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      await updateUser(formData);
      setIsEditing(false);
      toast.success("Налаштування збережено!");
    } catch (error) {
      toast.error("Помилка збереження налаштувань");
    }
  };

  const handleExportData = () => {
    // TODO: Implement data export
    toast.info("Експорт даних буде реалізовано незабаром");
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    toast.error("Видалення акаунту тимчасово недоступне");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        <MobileHeader />
        <main className="p-4 pb-24 md:pb-8 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Налаштування</h1>
                <p className="text-muted-foreground">Керуй своїм профілем та налаштуваннями</p>
              </div>
            </div>
          </motion.div>

          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Профіль</h3>
                    <p className="text-sm text-muted-foreground">Особиста інформація</p>
                  </div>
                </div>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => setIsEditing(!isEditing)}
                  className="gap-2"
                >
                  {isEditing ? <Save className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  {isEditing ? "Зберегти" : "Редагувати"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ім'я</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Введіть ваше ім'я"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    placeholder="your@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Новий пароль</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Введіть новий пароль"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Вік</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    disabled={!isEditing}
                    placeholder="25"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Стать</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange('gender', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Оберіть стать" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Чоловік</SelectItem>
                      <SelectItem value="female">Жінка</SelectItem>
                      <SelectItem value="other">Інше</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Зріст (см)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    disabled={!isEditing}
                    placeholder="175"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Вага (кг)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    disabled={!isEditing}
                    placeholder="70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetWeight">Цільова вага (кг)</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    value={formData.targetWeight}
                    onChange={(e) => handleInputChange('targetWeight', e.target.value)}
                    disabled={!isEditing}
                    placeholder="65"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2 mt-6">
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="w-4 h-4" />
                    Зберегти зміни
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Скасувати
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Сповіщення</h3>
                  <p className="text-sm text-muted-foreground">Керуй сповіщеннями</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Нагадування про тренування</p>
                    <p className="text-sm text-muted-foreground">Отримуй нагадування про заплановані тренування</p>
                  </div>
                  <Switch
                    checked={formData.notifications.workout}
                    onCheckedChange={(checked) => handleNestedInputChange('notifications', 'workout', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Нагадування про прийом їжі</p>
                    <p className="text-sm text-muted-foreground">Нагадування про час прийому їжі</p>
                  </div>
                  <Switch
                    checked={formData.notifications.meals}
                    onCheckedChange={(checked) => handleNestedInputChange('notifications', 'meals', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Нагадування про воду</p>
                    <p className="text-sm text-muted-foreground">Нагадування про пиття води</p>
                  </div>
                  <Switch
                    checked={formData.notifications.water}
                    onCheckedChange={(checked) => handleNestedInputChange('notifications', 'water', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Тижневі звіти</p>
                    <p className="text-sm text-muted-foreground">Отримуй щотижневі звіти про прогрес</p>
                  </div>
                  <Switch
                    checked={formData.notifications.weekly}
                    onCheckedChange={(checked) => handleNestedInputChange('notifications', 'weekly', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Досягнення</p>
                    <p className="text-sm text-muted-foreground">Сповіщення про нові досягнення</p>
                  </div>
                  <Switch
                    checked={formData.notifications.achievements}
                    onCheckedChange={(checked) => handleNestedInputChange('notifications', 'achievements', checked)}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Appearance & Language */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Зовнішній вигляд</h3>
                  <p className="text-sm text-muted-foreground">Тема та мова інтерфейсу</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Тема</Label>
                  <Select
                    value={formData.theme}
                    onValueChange={(value) => handleInputChange('theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Оберіть тему" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Світла</SelectItem>
                      <SelectItem value="dark">Темна</SelectItem>
                      <SelectItem value="system">Системна</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Мова</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => {
                      handleInputChange('language', value);
                      setLocale(value as 'uk' | 'en');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Оберіть мову" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uk">Українська</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Privacy & Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Приватність та безпека</h3>
                  <p className="text-sm text-muted-foreground">Керуй своїми даними</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Публічний профіль</p>
                    <p className="text-sm text-muted-foreground">Дозволити іншим бачити ваш профіль</p>
                  </div>
                  <Switch
                    checked={formData.privacy.profileVisible}
                    onCheckedChange={(checked) => handleNestedInputChange('privacy', 'profileVisible', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Обмін даними</p>
                    <p className="text-sm text-muted-foreground">Дозволити анонімний обмін даними для покращення сервісу</p>
                  </div>
                  <Switch
                    checked={formData.privacy.dataSharing}
                    onCheckedChange={(checked) => handleNestedInputChange('privacy', 'dataSharing', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Аналітика</p>
                    <p className="text-sm text-muted-foreground">Збирати дані про використання для покращення досвіду</p>
                  </div>
                  <Switch
                    checked={formData.privacy.analytics}
                    onCheckedChange={(checked) => handleNestedInputChange('privacy', 'analytics', checked)}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Data Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Керування даними</h3>
                  <p className="text-sm text-muted-foreground">Експорт та видалення даних</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Експорт даних</p>
                      <p className="text-sm text-muted-foreground">Завантажте всі свої дані</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleExportData}>
                    Експорт
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium text-red-500">Видалити акаунт</p>
                      <p className="text-sm text-muted-foreground">Назавжди видалити акаунт та всі дані</p>
                    </div>
                  </div>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    Видалити
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium">Вийти з акаунту</p>
                    <p className="text-sm text-muted-foreground">Безпечно вийти з поточного акаунту</p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleLogout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Вийти
                </Button>
              </div>
            </Card>
          </motion.div>

        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
