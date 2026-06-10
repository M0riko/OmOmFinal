import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // With response_type=token, the access_token is returned in the URL fragment (hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const state = hashParams.get("state") || searchParams.get("state");
        const error = hashParams.get("error") || searchParams.get("error");

        if (error) {
          console.error("Google OAuth error:", error);
          setError(`Ошибка авторизации: ${error}`);
          return;
        }

        if (!accessToken || !state) {
          console.error("Missing required parameters:", { accessToken: !!accessToken, state: !!state });
          setError("Відсутні необхідні параметри авторизації");
          return;
        }

        // Проверяем state
        const savedState = sessionStorage.getItem("google_oauth_state");
        if (state !== savedState) {
          setError("Невірний параметр state");
          return;
        }

        // Очищаем state
        sessionStorage.removeItem("google_oauth_state");

        // Получаем данные пользователя от Google
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!userResponse.ok) {
          const errorText = await userResponse.text();
          console.error('User info request failed:', errorText);
          throw new Error('Не вдалося отримати дані користувача');
        }

        const userData = await userResponse.json();

        // Send to backend
        const API_BASE = import.meta.env.PROD
          ? (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes('localhost') ? import.meta.env.VITE_API_BASE_URL : '')
          : (import.meta.env.VITE_API_BASE_URL || '');

        const backendAuthRes = await fetch(`${API_BASE}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userData.email,
            name: userData.name,
            googleId: userData.id
          })
        });

        if (!backendAuthRes.ok) {
          throw new Error('Не удалось авторизоваться на сервере');
        }

        const backendData = await backendAuthRes.json();
        
        // Save the JWT token
        localStorage.setItem('omomo_auth_token', backendData.token);

        // Обновляем пользователя с данными от сервера
        updateUser({
          ...backendData.user,
          name: backendData.user.username
        });

        if (backendData.isNewUser || !backendData.user.onboardingCompleted) {
          navigate("/auth");
        } else {
          navigate("/");
        }
      } catch (err) {
        console.error("Ошибка при обработке Google callback:", err);
        setError(`Произошла ошибка при авторизации: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, updateUser]);

  if (error) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive mb-4">Ошибка авторизации</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => navigate("/auth")}
              className="text-primary hover:underline"
            >
              Вернуться к авторизации
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <Card className="p-6 max-w-md w-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Обработка авторизации</h2>
          <p className="text-muted-foreground">Пожалуйста, подождите...</p>
        </div>
      </Card>
    </div>
  );
}
