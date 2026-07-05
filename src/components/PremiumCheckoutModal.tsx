import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { CreditCard, ShieldCheck, Sparkles, Check, Flame } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface PremiumCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PremiumCheckoutModal({ open, onOpenChange }: PremiumCheckoutModalProps) {
  const { activatePremium, user } = useAuth();
  const { locale } = useI18n();
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState(user?.name || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const formatted = value.match(/.{1,4}/g)?.join(" ") || "";
    setCardNumber(formatted.substring(0, 19));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 2) {
      setExpiry(value);
    } else {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setCvv(value.substring(0, 3));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.length < 19 || expiry.length < 5 || cvv.length < 3) {
      toast.error(locale === "uk" ? "Будь ласка, заповніть коректні реквізити картки" : "Please fill in valid card details");
      return;
    }

    setIsProcessing(true);
    
    // Simulate loading/processing
    setTimeout(async () => {
      try {
        await activatePremium();
        setIsSuccess(true);
        setIsProcessing(false);
        toast.success(locale === "uk" ? "Преміум успішно активовано!" : "Premium activated successfully!");
      } catch (err) {
        setIsProcessing(false);
        toast.error("Payment failed");
      }
    }, 2000);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state on close
    setTimeout(() => {
      setIsSuccess(false);
      setCardNumber("");
      setExpiry("");
      setCvv("");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card/95 border border-purple-500/20 rounded-3xl overflow-hidden shadow-2xl p-0 backdrop-blur-md">
        
        {/* Success State Overlay */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/95 backdrop-blur-lg flex flex-col items-center justify-center text-center p-6 z-50"
            >
              <motion.div
                initial={{ scale: 0.5, rotate: -20 }}
                animate={{ scale: [1, 1.2, 1], rotate: 0 }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20 mb-4 border-2 border-background"
              >
                <Check className="w-10 h-10 text-background stroke-[3]" />
              </motion.div>
              <h2 className="text-2xl font-black text-foreground tracking-tight bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                {locale === "uk" ? "ВІТАЄМО В AMAM PREMIUM!" : "WELCOME TO AMAM PREMIUM!"}
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                {locale === "uk" 
                  ? "Усі преміальні функції, тренери та розширені плейлисти тепер повністю розблоковані!"
                  : "All exclusive trainers, playlists, and advanced tools are now fully unlocked for you!"}
              </p>
              <Button onClick={handleClose} className="mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold px-8 shadow-lg shadow-purple-500/20">
                {locale === "uk" ? "Почати користування" : "Let's Go"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header banner */}
        <div className="bg-gradient-to-br from-purple-900/60 via-pink-900/40 to-card p-6 border-b border-purple-500/10 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -translate-y-6 translate-x-6 blur-2xl"></div>
          <DialogHeader className="text-left relative z-10">
            <DialogTitle className="text-2xl font-black flex items-center gap-2 tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              <Sparkles className="w-6 h-6 text-purple-400 fill-purple-400/20 animate-pulse" />
              AmAm Premium Upgrade
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground font-medium mt-1">
              {locale === "uk" 
                ? "Отримайте безлімітний AI-коучинг, елітні тренування та преміум музику."
                : "Unlock infinite AI chats, premium trainers, and exclusive audio streams."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handlePayment} className="p-6 space-y-6">
          {/* Credit Card Visualizer */}
          <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-purple-800 via-indigo-900 to-pink-900 p-5 text-white flex flex-col justify-between shadow-xl relative border border-white/10 overflow-hidden select-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent)]"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-pink-500/15 rounded-full blur-xl"></div>
            
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-purple-200/70 font-bold uppercase tracking-widest">AmAm Club Card</p>
                <div className="w-10 h-7 rounded bg-amber-400/90 mt-2 flex items-center justify-center overflow-hidden border border-amber-300/40">
                  <div className="w-full h-0.5 bg-neutral-800/20 my-0.5"></div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <Flame className="w-3.5 h-3.5 text-pink-400 fill-pink-400/20" />
                <span className="text-[10px] font-black uppercase tracking-wider text-pink-300">PREMIUM</span>
              </div>
            </div>

            <div>
              <p className="text-lg font-mono tracking-widest font-semibold text-neutral-100">
                {cardNumber || "•••• •••• •••• ••••"}
              </p>
              <div className="flex justify-between items-end mt-4">
                <div>
                  <p className="text-[8px] text-purple-200/50 uppercase font-semibold">Card Holder</p>
                  <p className="text-xs font-mono tracking-wider truncate max-w-[200px] uppercase font-bold text-neutral-200">
                    {cardName || "YOUR NAME"}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-[8px] text-purple-200/50 uppercase font-semibold">Expires</p>
                    <p className="text-xs font-mono font-bold text-neutral-200">{expiry || "MM/YY"}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-purple-200/50 uppercase font-semibold">CVV</p>
                    <p className="text-xs font-mono font-bold text-neutral-200">{cvv || "•••"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="card-name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {locale === "uk" ? "Ім'я на карті" : "Card Holder Name"}
              </Label>
              <Input
                id="card-name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="JOHN DOE"
                className="bg-background border-border/40 rounded-xl"
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="card-number" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {locale === "uk" ? "Номер картки" : "Card Number"}
              </Label>
              <div className="relative">
                <Input
                  id="card-number"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="0000 0000 0000 0000"
                  className="bg-background border-border/40 rounded-xl pl-9"
                  disabled={isProcessing}
                />
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="card-expiry" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {locale === "uk" ? "Термін дії" : "Expiry Date"}
                </Label>
                <Input
                  id="card-expiry"
                  value={expiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  className="bg-background border-border/40 rounded-xl"
                  disabled={isProcessing}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="card-cvv" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  CVV
                </Label>
                <Input
                  id="card-cvv"
                  type="password"
                  value={cvv}
                  onChange={handleCvvChange}
                  placeholder="•••"
                  className="bg-background border-border/40 rounded-xl font-mono"
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>

          {/* Pricing Info & Pay Button */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-sm px-1 border-t border-border/30 pt-4">
              <span className="font-semibold text-muted-foreground">{locale === "uk" ? "Тариф: Пожиттєвий доступ" : "Plan: Lifetime Access"}</span>
              <span className="font-black text-foreground text-lg">$49.99</span>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="ghost" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)} disabled={isProcessing}>
                {locale === "uk" ? "Скасувати" : "Cancel"}
              </Button>
              
              <Button 
                type="submit" 
                className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold shadow-lg shadow-purple-500/20"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {locale === "uk" ? "Оплата..." : "Processing..."}
                  </span>
                ) : (
                  locale === "uk" ? "Сплатити" : "Pay Now"
                )}
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/80">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
              <span>{locale === "uk" ? "Безпечний 256-бітний SSL платіж" : "Secure 256-bit SSL encrypted connection"}</span>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
