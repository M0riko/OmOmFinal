import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onBarcodeScanned, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });

      setHasPermission(true);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Start barcode detection (simplified - in real app would use a library like QuaggaJS or ZXing)
      startBarcodeDetection();
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Не вдалося отримати доступ до камери. Перевірте дозволи.");
      setIsScanning(false);
      setHasPermission(false);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const startBarcodeDetection = () => {
    // This is a simplified implementation
    // In a real app, you would use a proper barcode scanning library
    // For now, we'll simulate scanning with a manual input option
    
    // Simulate scanning process
    setTimeout(() => {
      // For demo purposes, we'll show a manual input option
      const manualBarcode = prompt("Введіть штрих-код вручну (для демонстрації):");
      if (manualBarcode) {
        onBarcodeScanned(manualBarcode);
        stopScanning();
        onClose();
      }
    }, 2000);
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="p-6 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">Доступ до камери заборонено</h3>
            <p className="text-muted-foreground mb-4">
              Для сканування штрих-кодів потрібен доступ до камери. 
              Дозвольте доступ у налаштуваннях браузера.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Скасувати
              </Button>
              <Button onClick={startScanning} className="flex-1">
                Спробувати знову
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Сканер штрих-кодів</h3>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!isScanning ? (
          <div className="text-center">
            <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Натисніть кнопку, щоб почати сканування штрих-коду
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Скасувати
              </Button>
              <Button onClick={startScanning} className="flex-1 gap-2">
                <Camera className="w-4 h-4" />
                Почати сканування
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="relative mb-4">
              <video
                ref={videoRef}
                className="w-full h-48 bg-black rounded-md object-cover"
                playsInline
                muted
              />
              <div className="absolute inset-0 border-2 border-primary rounded-md pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-32 h-20 border-2 border-white rounded opacity-50"></div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Наведіть камеру на штрих-код продукту
            </p>
            <Button variant="outline" onClick={stopScanning} className="w-full">
              Зупинити сканування
            </Button>
          </div>
        )}

        <div className="mt-4 p-3 bg-muted rounded-md">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Порада:</strong> Для демонстрації використовується ручний ввід штрих-коду. 
            В реальному додатку буде використовуватися бібліотека для сканування.
          </p>
        </div>
      </Card>
    </div>
  );
}
