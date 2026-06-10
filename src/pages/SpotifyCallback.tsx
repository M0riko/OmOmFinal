import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const API_BASE = import.meta.env.PROD
  ? (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes('localhost') ? import.meta.env.VITE_API_BASE_URL : '')
  : (import.meta.env.VITE_API_BASE_URL || '');

export default function SpotifyCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Підключення до Spotify...");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    
    if (error) {
      toast.error(`Помилка підключення: ${error}`);
      navigate("/music", { replace: true });
      return;
    }
    
    if (!code) {
      navigate("/music", { replace: true });
      return;
    }

    const exchangeToken = async () => {
      try {
        const token = localStorage.getItem('omomo_auth_token');
        if (!token) throw new Error("Ви не авторизовані");

        const response = await fetch(`${API_BASE}/api/spotify/callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ code })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Не вдалося підключити Spotify");
        }

        toast.success("Spotify успішно підключено!");
        navigate("/music", { replace: true });
      } catch (err: any) {
        toast.error(err.message);
        navigate("/music", { replace: true });
      }
    };

    exchangeToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <h2 className="text-xl font-medium">{status}</h2>
      </div>
    </div>
  );
}
