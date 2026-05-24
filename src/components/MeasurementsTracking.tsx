import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Scale, 
  Ruler, 
  Camera, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Plus,
  Save,
  Upload,
  Eye,
  Trash2
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Measurement {
  id: string;
  date: string;
  weight?: number;
  neck?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  thigh?: number;
}

interface ProgressPhoto {
  id: string;
  date: string;
  type: "front" | "side" | "back";
  imageUrl: string;
  notes?: string;
}

export function MeasurementsTracking() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const [newMeasurement, setNewMeasurement] = useState<Partial<Measurement>>({
    date: new Date().toISOString().split('T')[0]
  });
  const [newPhoto, setNewPhoto] = useState<Partial<ProgressPhoto>>({
    date: new Date().toISOString().split('T')[0],
    type: "front"
  });

  // Загрузка данных из localStorage
  useEffect(() => {
    try {
      const savedMeasurements = localStorage.getItem('omomo_measurements');
      if (savedMeasurements) {
        setMeasurements(JSON.parse(savedMeasurements));
      }
      
      const savedPhotos = localStorage.getItem('omomo_progress_photos');
      if (savedPhotos) {
        setProgressPhotos(JSON.parse(savedPhotos));
      }
    } catch (error) {
      console.error('Error loading measurements:', error);
    }
  }, []);

  // Сохранение измерений
  const saveMeasurements = () => {
    try {
      localStorage.setItem('omomo_measurements', JSON.stringify(measurements));
    } catch (error) {
      console.error('Error saving measurements:', error);
    }
  };

  // Сохранение фотографий
  const savePhotos = () => {
    try {
      localStorage.setItem('omomo_progress_photos', JSON.stringify(progressPhotos));
    } catch (error) {
      console.error('Error saving photos:', error);
    }
  };

  // Добавление нового измерения
  const addMeasurement = () => {
    if (!newMeasurement.date) {
      toast.error("Виберіть дату");
      return;
    }

    const measurement: Measurement = {
      id: crypto.randomUUID(),
      date: newMeasurement.date,
      weight: newMeasurement.weight,
      neck: newMeasurement.neck,
      chest: newMeasurement.chest,
      waist: newMeasurement.waist,
      hips: newMeasurement.hips,
      biceps: newMeasurement.biceps,
      thigh: newMeasurement.thigh
    };

    setMeasurements(prev => [measurement, ...prev]);
    setNewMeasurement({
      date: new Date().toISOString().split('T')[0]
    });
    
    toast.success("Вимір додано!");
  };

  // Добавление фотографии прогресса
  const addProgressPhoto = () => {
    if (!newPhoto.date || !newPhoto.type) {
      toast.error("Заповніть всі поля");
      return;
    }

    // В реальном приложении здесь будет загрузка файла
    const photo: ProgressPhoto = {
      id: crypto.randomUUID(),
      date: newPhoto.date,
      type: newPhoto.type,
      imageUrl: `https://via.placeholder.com/300x400?text=${newPhoto.type}`,
      notes: newPhoto.notes
    };

    setProgressPhotos(prev => [photo, ...prev]);
    setNewPhoto({
      date: new Date().toISOString().split('T')[0],
      type: "front"
    });
    
    toast.success("Фото додано!");
  };

  // Удаление измерения
  const deleteMeasurement = (id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
    toast.success("Вимір видалено!");
  };

  // Удаление фотографии
  const deletePhoto = (id: string) => {
    setProgressPhotos(prev => prev.filter(p => p.id !== id));
    toast.success("Фото видалено!");
  };

  // Получение изменения веса
  const getWeightChange = (current: number, previous: number) => {
    const change = current - previous;
    if (change > 0) return { value: `+${change.toFixed(1)}`, icon: TrendingUp, color: "text-red-500" };
    if (change < 0) return { value: `${change.toFixed(1)}`, icon: TrendingDown, color: "text-green-500" };
    return { value: "0", icon: Minus, color: "text-gray-500" };
  };

  // Сохранение при изменении данных
  useEffect(() => {
    saveMeasurements();
  }, [measurements]);

  useEffect(() => {
    savePhotos();
  }, [progressPhotos]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="measurements" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="measurements">Виміри тіла</TabsTrigger>
          <TabsTrigger value="photos">Фото прогресу</TabsTrigger>
        </TabsList>

        <TabsContent value="measurements" className="space-y-6">
          {/* Форма добавления измерений */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Додати нові виміри</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium">Дата</Label>
                <Input 
                  type="date"
                  value={newMeasurement.date}
                  onChange={(e) => setNewMeasurement(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Вага (кг)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  value={newMeasurement.weight || ""}
                  onChange={(e) => setNewMeasurement(prev => ({ ...prev, weight: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Шия (см)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  value={newMeasurement.neck || ""}
                  onChange={(e) => setNewMeasurement(prev => ({ ...prev, neck: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Груди (см)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  value={newMeasurement.chest || ""}
                  onChange={(e) => setNewMeasurement(prev => ({ ...prev, chest: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Талія (см)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  value={newMeasurement.waist || ""}
                  onChange={(e) => setNewMeasurement(prev => ({ ...prev, waist: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Стегна (см)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  value={newMeasurement.hips || ""}
                  onChange={(e) => setNewMeasurement(prev => ({ ...prev, hips: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Біцепс (см)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  value={newMeasurement.biceps || ""}
                  onChange={(e) => setNewMeasurement(prev => ({ ...prev, biceps: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Стегно (см)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  value={newMeasurement.thigh || ""}
                  onChange={(e) => setNewMeasurement(prev => ({ ...prev, thigh: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
            </div>
            <Button onClick={addMeasurement} className="mt-4 gap-2">
              <Plus className="w-4 h-4" />
              Додати вимір
            </Button>
          </Card>

          {/* История измерений */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Історія вимірів</h3>
            {measurements.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Поки що немає вимірів. Додайте перший вимір!
              </p>
            ) : (
              <div className="space-y-4">
                {measurements.map((measurement, index) => {
                  const previousMeasurement = measurements[index + 1];
                  const weightChange = measurement.weight && previousMeasurement?.weight 
                    ? getWeightChange(measurement.weight, previousMeasurement.weight)
                    : null;

                  return (
                    <div key={measurement.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">
                          {new Date(measurement.date).toLocaleDateString('uk-UA')}
                        </h4>
                        <div className="flex items-center gap-2">
                          {weightChange && (
                            <Badge variant="outline" className={weightChange.color}>
                              <weightChange.icon className="w-3 h-3 mr-1" />
                              {weightChange.value} кг
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMeasurement(measurement.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {measurement.weight && (
                          <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4 text-muted-foreground" />
                            <span>Вага: {measurement.weight} кг</span>
                          </div>
                        )}
                        {measurement.neck && (
                          <div className="flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-muted-foreground" />
                            <span>Шия: {measurement.neck} см</span>
                          </div>
                        )}
                        {measurement.chest && (
                          <div className="flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-muted-foreground" />
                            <span>Груди: {measurement.chest} см</span>
                          </div>
                        )}
                        {measurement.waist && (
                          <div className="flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-muted-foreground" />
                            <span>Талія: {measurement.waist} см</span>
                          </div>
                        )}
                        {measurement.hips && (
                          <div className="flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-muted-foreground" />
                            <span>Стегна: {measurement.hips} см</span>
                          </div>
                        )}
                        {measurement.biceps && (
                          <div className="flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-muted-foreground" />
                            <span>Біцепс: {measurement.biceps} см</span>
                          </div>
                        )}
                        {measurement.thigh && (
                          <div className="flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-muted-foreground" />
                            <span>Стегно: {measurement.thigh} см</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="space-y-6">
          {/* Форма добавления фотографий */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Додати фото прогресу</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Дата</Label>
                <Input 
                  type="date"
                  value={newPhoto.date}
                  onChange={(e) => setNewPhoto(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Тип фото</Label>
                <select 
                  value={newPhoto.type}
                  onChange={(e) => setNewPhoto(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-2 border rounded-md mt-1"
                >
                  <option value="front">Спереду</option>
                  <option value="side">Збоку</option>
                  <option value="back">Ззаду</option>
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium">Примітки</Label>
                <Input 
                  value={newPhoto.notes || ""}
                  onChange={(e) => setNewPhoto(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Додаткові нотатки"
                  className="mt-1"
                />
              </div>
            </div>
            <Button onClick={addProgressPhoto} className="mt-4 gap-2">
              <Camera className="w-4 h-4" />
              Додати фото
            </Button>
          </Card>

          {/* Галерея фотографий */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Галерея прогресу</h3>
            {progressPhotos.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Поки що немає фотографій. Додайте перше фото!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {progressPhotos.map((photo) => (
                  <div key={photo.id} className="border rounded-lg overflow-hidden">
                    <div className="aspect-[3/4] bg-muted flex items-center justify-center">
                      <img 
                        src={photo.imageUrl} 
                        alt={`${photo.type} - ${photo.date}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">
                          {photo.type === "front" && "Спереду"}
                          {photo.type === "side" && "Збоку"}
                          {photo.type === "back" && "Ззаду"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePhoto(photo.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(photo.date).toLocaleDateString('uk-UA')}
                      </p>
                      {photo.notes && (
                        <p className="text-sm mt-1">{photo.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
