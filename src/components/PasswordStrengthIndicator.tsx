import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const calculateStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    // Подсчет очков
    if (checks.length) score += 20;
    if (checks.lowercase) score += 20;
    if (checks.uppercase) score += 20;
    if (checks.numbers) score += 20;
    if (checks.symbols) score += 20;

    return { score, checks };
  };

  const { score, checks } = calculateStrength(password);

  const getStrengthLevel = (score: number) => {
    if (score < 40) return { level: "weak", color: "bg-red-500", text: "Слабкий", textColor: "text-red-600" };
    if (score < 80) return { level: "medium", color: "bg-yellow-500", text: "Середній", textColor: "text-yellow-600" };
    return { level: "strong", color: "bg-green-500", text: "Надійний", textColor: "text-green-600" };
  };

  const strength = getStrengthLevel(score);

  if (!password) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Надійність пароля</span>
        <Badge variant="outline" className={`${strength.textColor} text-sm px-2 py-1`}>
          {strength.text}
        </Badge>
      </div>
      
      <Progress value={score} className="h-2" />
      
      <div className="space-y-2">
        <div className={`flex items-center gap-2 ${checks.length ? 'text-green-600' : 'text-muted-foreground'}`}>
          {checks.length ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
          <span className="text-sm">Мінімум 8 символів</span>
        </div>
        <div className={`flex items-center gap-2 ${checks.lowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
          {checks.lowercase ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
          <span className="text-sm">Малі літери</span>
        </div>
        <div className={`flex items-center gap-2 ${checks.uppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
          {checks.uppercase ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
          <span className="text-sm">Великі літери</span>
        </div>
        <div className={`flex items-center gap-2 ${checks.numbers ? 'text-green-600' : 'text-muted-foreground'}`}>
          {checks.numbers ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
          <span className="text-sm">Цифри</span>
        </div>
      </div>
    </div>
  );
}
