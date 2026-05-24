import { Flame, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ModalFooterProps {
  totalCalories: number;
  onCancel: () => void;
  onSubmit: () => void;
  isDisabled: boolean;
  productName?: string;
}

export function ModalFooter({ 
  totalCalories, 
  onCancel, 
  onSubmit, 
  isDisabled,
  productName 
}: ModalFooterProps) {
  return (
    <Card className="sticky bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-muted/30 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        {/* Left side - Total calories */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-xl">
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              {Math.round(totalCalories)} ккал
            </span>
          </div>
          {productName && (
            <div className="text-sm text-muted-foreground max-w-32 truncate">
              {productName}
            </div>
          )}
        </div>

        {/* Right side - Action buttons */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onCancel} 
            className="h-12 px-6 font-medium border-2 hover:bg-muted/50 transition-all duration-300"
          >
            <X className="w-4 h-4 mr-2" />
            Скасувати
          </Button>
          
          <Button 
            onClick={onSubmit} 
            disabled={isDisabled}
            className={cn(
              "h-12 px-6 font-medium gap-2 transition-all duration-300",
              "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
              "shadow-lg hover:shadow-xl",
              isDisabled 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:scale-105"
            )}
          >
            <Plus className="w-4 h-4" />
            Додати до раціону
          </Button>
        </div>
      </div>
    </Card>
  );
}
