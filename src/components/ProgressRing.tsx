import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning";
  children?: React.ReactNode;
  className?: string;
}

const sizeMap = {
  sm: { circle: 60, stroke: 6 },
  md: { circle: 100, stroke: 8 },
  lg: { circle: 140, stroke: 10 },
};

const colorMap = {
  primary: "hsl(var(--primary))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
};

export function ProgressRing({ 
  progress, 
  size = "md", 
  color = "primary",
  children,
  className 
}: ProgressRingProps) {
  const { circle, stroke } = sizeMap[size];
  const radius = (circle - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={circle} height={circle} className="transform -rotate-90">
        <circle
          cx={circle / 2}
          cy={circle / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={circle / 2}
          cy={circle / 2}
          r={radius}
          stroke={colorMap[color]}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
