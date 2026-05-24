import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  X, 
  Eye, 
  Save, 
  Upload,
  Apple,
  Dumbbell,
  Moon,
  Zap,
  ChefHat,
  Brain,
  Shield,
  Pill,
  Microscope,
  Target
} from "lucide-react";
import { useArticles } from "@/hooks/useArticles";
import { Article, ArticleCategory } from "@/lib/article-types";
import { DEFAULT_ARTICLE_CATEGORIES } from "@/lib/articles-database";
import { toast } from "sonner";

interface CreateArticleModalProps {
  onArticleCreated?: (article: Article) => void;
}

export function CreateArticleModal({ onArticleCreated }: CreateArticleModalProps) {
  const { allCategories, createUserArticle } = useArticles();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  
  // Состояние формы
  const [formData, setFormData] = useState({
    title: "",
    titleUk: "",
    excerpt: "",
    excerptUk: "",
    content: "",
    contentUk: "",
    author: "",
    authorUk: "",
    category: "",
    tags: [] as string[],
    difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
    readingTime: 5,
    imageUrl: "",
    imageAlt: "",
    imageAltUk: ""
  });
  
  const [newTag, setNewTag] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'nutrition': return <Apple className="w-4 h-4" />;
      case 'training': return <Dumbbell className="w-4 h-4" />;
      case 'recovery': return <Moon className="w-4 h-4" />;
      case 'motivation': return <Zap className="w-4 h-4" />;
      case 'recipes': return <ChefHat className="w-4 h-4" />;
      case 'science': return <Microscope className="w-4 h-4" />;
      case 'supplements': return <Pill className="w-4 h-4" />;
      case 'mental_health': return <Brain className="w-4 h-4" />;
      case 'injury_prevention': return <Shield className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content,
      readingTime: calculateReadingTime(content)
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Заголовок обязателен");
      return false;
    }
    if (!formData.content.trim()) {
      toast.error("Содержимое статьи обязательно");
      return false;
    }
    if (!formData.category) {
      toast.error("Выберите категорию");
      return false;
    }
    if (formData.tags.length === 0) {
      toast.error("Добавьте хотя бы один тег");
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const selectedCategory = allCategories.find(cat => cat.id === formData.category);
    if (!selectedCategory) {
      toast.error("Выбранная категория не найдена");
      return;
    }

    const newArticle: Article = {
      id: crypto.randomUUID(),
      title: formData.title,
      titleUk: formData.titleUk || formData.title,
      excerpt: formData.excerpt,
      excerptUk: formData.excerptUk || formData.excerpt,
      content: formData.content,
      contentUk: formData.contentUk || formData.content,
      author: formData.author || "Пользователь",
      authorUk: formData.authorUk || formData.author || "Користувач",
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: selectedCategory,
      tags: formData.tags,
      readingTime: formData.readingTime,
      difficulty: formData.difficulty,
      featured: false,
      imageUrl: formData.imageUrl || undefined,
      imageAlt: formData.imageAlt,
      imageAltUk: formData.imageAltUk || formData.imageAlt,
      isCurated: false,
      views: 0,
      likes: 0,
      saves: 0,
      comments: [],
      callToActions: [],
      relatedArticles: [],
      isPublished: true,
      isCustom: true,
      createdBy: "user"
    };

    // Сохраняем статью
    createUserArticle(newArticle);
    onArticleCreated?.(newArticle);
    
    // Сброс формы
    setFormData({
      title: "",
      titleUk: "",
      excerpt: "",
      excerptUk: "",
      content: "",
      contentUk: "",
      author: "",
      authorUk: "",
      category: "",
      tags: [],
      difficulty: "beginner",
      readingTime: 5,
      imageUrl: "",
      imageAlt: "",
      imageAltUk: ""
    });
    setIsOpen(false);
  };

  const renderPreview = () => {
    const selectedCategory = allCategories.find(cat => cat.id === formData.category);
    
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {/* Заголовок */}
          <h1 className="text-2xl font-bold">{formData.titleUk || formData.title}</h1>
          
          {/* Метаинформация */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {selectedCategory && (
              <div className="flex items-center gap-1">
                {getCategoryIcon(selectedCategory.id)}
                <span>{selectedCategory.nameUk}</span>
              </div>
            )}
            <span>{formData.readingTime} хв</span>
            <span>{formData.authorUk || formData.author || "Користувач"}</span>
          </div>
          
          {/* Краткое описание */}
          {formData.excerptUk || formData.excerpt ? (
            <p className="text-muted-foreground">
              {formData.excerptUk || formData.excerpt}
            </p>
          ) : null}
          
          {/* Теги */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Изображение */}
          {formData.imageUrl && (
            <img 
              src={formData.imageUrl} 
              alt={formData.imageAltUk || formData.imageAlt}
              className="w-full h-48 object-cover rounded-lg"
            />
          )}
          
          {/* Содержимое */}
          <div 
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ 
              __html: (formData.contentUk || formData.content).replace(/\n/g, '<br>') 
            }}
          />
        </div>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Створити статтю
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Створити нову статтю</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="create">Створення</TabsTrigger>
            <TabsTrigger value="preview">Попередній перегляд</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Основная информация */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Основна інформація</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Заголовок *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Введіть заголовок статті"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="titleUk">Заголовок (українською)</Label>
                    <Input
                      id="titleUk"
                      value={formData.titleUk}
                      onChange={(e) => handleInputChange("titleUk", e.target.value)}
                      placeholder="Заголовок українською мовою"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="excerpt">Короткий опис</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange("excerpt", e.target.value)}
                      placeholder="Короткий опис статті"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="excerptUk">Короткий опис (українською)</Label>
                    <Textarea
                      id="excerptUk"
                      value={formData.excerptUk}
                      onChange={(e) => handleInputChange("excerptUk", e.target.value)}
                      placeholder="Короткий опис українською мовою"
                      rows={3}
                    />
                  </div>
                </div>
              </Card>
              
              {/* Категория и настройки */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Категорія та налаштування</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category">Категорія *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Оберіть категорію" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(category.id)}
                              {category.nameUk}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="difficulty">Складність</Label>
                    <Select value={formData.difficulty} onValueChange={(value: any) => handleInputChange("difficulty", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Початківець</SelectItem>
                        <SelectItem value="intermediate">Середній</SelectItem>
                        <SelectItem value="advanced">Просунутий</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="author">Автор</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => handleInputChange("author", e.target.value)}
                      placeholder="Ваше ім'я"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="imageUrl">URL зображення</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Теги */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Теги *</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Додати тег"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button onClick={handleAddTag} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
            
            {/* Содержимое */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Зміст статті *</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="content">Зміст (англійською)</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Введіть зміст статті..."
                    rows={10}
                  />
                </div>
                <div>
                  <Label htmlFor="contentUk">Зміст (українською)</Label>
                  <Textarea
                    id="contentUk"
                    value={formData.contentUk}
                    onChange={(e) => handleInputChange("contentUk", e.target.value)}
                    placeholder="Введіть зміст статті українською мовою..."
                    rows={10}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Час читання: {formData.readingTime} хвилин
                </div>
              </div>
            </Card>
            
            {/* Кнопки действий */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Скасувати
              </Button>
              <Button onClick={() => setActiveTab("preview")} variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Попередній перегляд
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Зберегти статтю
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="preview">
            {renderPreview()}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setActiveTab("create")}>
                Редагувати
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Зберегти статтю
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
