import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: "default" | "success" | "warning" | "info";
  className?: string;
}

const variantStyles = {
  default: "bg-gradient-primary",
  success: "bg-gradient-success",
  warning: "bg-gradient-energy",
  info: "bg-info",
};

export function StatsCard({ 
  icon: Icon, 
  label, 
  value, 
  subtitle,
  variant = "default",
  className 
}: StatsCardProps) {
  return (
    <Card className={cn("p-5 shadow-card hover:shadow-elevated transition-shadow duration-300 animate-scale-in", className)}>
      <div className="flex items-start gap-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", variantStyles[variant])}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
    </Card>
  );
}
