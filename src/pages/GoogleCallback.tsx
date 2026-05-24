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
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");

        console.log("Google Callback - URL params:", { code: code ? "present" : "missing", state: state ? "present" : "missing", error });

        if (error) {
          console.error("Google OAuth error:", error);
          setError(`Ошибка авторизации: ${error}`);
          return;
        }

        if (!code || !state) {
          console.error("Missing required parameters:", { code: !!code, state: !!state });
          setError("Отсутствуют необходимые параметры авторизации");
          return;
        }

        // Проверяем state
        const savedState = sessionStorage.getItem("google_oauth_state");
        if (state !== savedState) {
          setError("Неверный state параметр");
          return;
        }

        // Очищаем state
        sessionStorage.removeItem("google_oauth_state");

        // Получаем реальные данные пользователя от Google
        console.log("Google Callback - Getting real user data from Google");
        
        // Обмениваем authorization code на access token
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
        const redirectUri = `${window.location.origin}/auth/google/callback`;

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('Token exchange failed:', errorText);
          throw new Error('Не удалось получить access token');
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        console.log("Google Callback - Access token received");

        // Получаем данные пользователя от Google
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!userResponse.ok) {
          const errorText = await userResponse.text();
          console.error('User info request failed:', errorText);
          throw new Error('Не удалось получить данные пользователя');
        }

        const userData = await userResponse.json();
        console.log("Google Callback - Real user data received:", userData);

        // Проверяем, есть ли уже данные профиля (завершен ли онбординг)
        const existingProfile = localStorage.getItem("omom_profile_extra");
        const existingUser = localStorage.getItem("omomo_auth_user");
        
        // Новый пользователь = нет профиля ИЛИ нет пользователя в localStorage
        const isNewUser = !existingProfile || !existingUser;
        
        console.log("Google Callback - Checking if new user:", isNewUser);
        console.log("Google Callback - Existing profile:", !!existingProfile);
        console.log("Google Callback - Existing user:", !!existingUser);
        console.log("Google Callback - Profile data:", existingProfile);
        console.log("Google Callback - User data:", existingUser);

        if (isNewUser) {
          console.log("Google Callback - New user detected, storing data for onboarding");
          
          // Очищаем старые данные для чистого теста
          localStorage.removeItem("omom_profile_extra");
          localStorage.removeItem("omom_google_user_data");
          
          // Сохраняем данные Google для онбординга
          localStorage.setItem("omom_google_user_data", JSON.stringify({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            avatarUrl: userData.picture
          }));

          // Создаем временного пользователя для авторизации
          updateUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            avatarUrl: userData.picture,
            targets: { calories: 2000, protein: 120, fats: 65, carbs: 250 },
          });

          // Перенаправляем на страницу авторизации для онбординга
          navigate("/auth");
        } else {
          console.log("Google Callback - Existing user, updating profile");
          
          // Обновляем пользователя с данными от Google
          updateUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            avatarUrl: userData.picture,
            targets: { calories: 2000, protein: 120, fats: 65, carbs: 250 },
          });

          // Перенаправляем на главную страницу
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
