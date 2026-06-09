import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">Помилка</CardTitle>
            <CardDescription>Токен відновлення не знайдено або він недійсний.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate("/auth")}>Повернутися до входу</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const API_BASE = import.meta.env.PROD
    ? (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes('localhost') ? import.meta.env.VITE_API_BASE_URL : '')
    : (import.meta.env.VITE_API_BASE_URL || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Помилка",
        description: "Паролі не співпадають",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Помилка",
        description: "Пароль має містити щонайменше 6 символів",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Сталася помилка при відновленні паролю");
      }
      
      setIsSuccess(true);
      toast({
        title: "Успіх",
        description: "Ваш пароль успішно змінено.",
      });
    } catch (error: any) {
      toast({
        title: "Помилка відновлення",
        description: error.message || "Сталася помилка при відновленні паролю",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-xl border-primary/20 text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-green-500">Пароль змінено!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">Ви можете увійти, використовуючи новий пароль.</p>
            <Button className="w-full" onClick={() => navigate("/auth")}>Увійти</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Створення нового паролю</CardTitle>
          <CardDescription>Введіть новий надійний пароль для вашого акаунту</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 relative">
              <Label htmlFor="password">Новий пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введіть новий пароль"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Підтвердіть пароль</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторіть пароль"
                required
              />
            </div>

            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Зберегти пароль
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
