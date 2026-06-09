import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Перевірка токена...");

  const API_BASE = import.meta.env.PROD
    ? (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes('localhost') ? import.meta.env.VITE_API_BASE_URL : '')
    : (import.meta.env.VITE_API_BASE_URL || '');

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Токен не знайдено.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Не вдалося підтвердити email.");
        }
        
        setStatus("success");
        setMessage("Ваш email успішно підтверджено!");
        toast({
          title: "Успіх",
          description: "Ваш email підтверджено.",
        });
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Не вдалося підтвердити email.");
      }
    };

    verifyToken();
  }, [token, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border-primary/20">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">Підтвердження Email</CardTitle>
          <CardDescription>Завершення реєстрації</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center text-center space-y-6 pt-4">
          
          {status === "loading" && (
            <div className="flex flex-col items-center">
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-lg font-medium text-green-600 mb-6">{message}</p>
              <Button onClick={() => navigate("/auth")} className="w-full">
                Увійти
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center">
              <XCircle className="h-16 w-16 text-destructive mb-4" />
              <p className="text-lg font-medium text-destructive mb-6">{message}</p>
              <Button onClick={() => navigate("/auth")} variant="outline" className="w-full">
                Повернутися до входу
              </Button>
            </div>
          )}
          
        </CardContent>
      </Card>
    </div>
  );
}
