import { useState, useEffect, useRef } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Calendar, MessageSquare, Clock, Search, Sparkles, Check, X, Send, User, ChevronRight, Lock } from "lucide-react";
import { PremiumCheckoutModal } from "@/components/PremiumCheckoutModal";

interface Trainer {
  id: string;
  name: string;
  nameUk: string;
  specialty: string;
  specialtyUk: string;
  experience: number;
  price: number;
  rating: number;
  bio: string;
  bioUk: string;
  achievements: string[];
  achievementsUk: string[];
  avatar: string;
  imageUrl?: string;
  availableTimeSlots: string[];
  isPremium?: boolean;
}

const TRAINERS_DATA: Trainer[] = [
  {
    id: "alex",
    name: "Alex Kovalenko",
    nameUk: "Олександр Коваленко",
    specialty: "Muscle Gain & Strength",
    specialtyUk: "Набір маси та сила",
    experience: 8,
    price: 25,
    rating: 4.9,
    bio: "Certified bodybuilding coach and nutritionist with over 8 years of experience. Specializes in hypertrophy training and progressive overload strategies.",
    bioUk: "Сертифікований тренер з бодібілдингу та нутриціолог з досвідом понад 8 років. Спеціалізується на гіпертрофії м'язів та стратегіях прогресивного навантаження.",
    achievements: ["Master of Sports in Powerlifting", "Nutritionist Certification", "Coached 100+ clients to their goals"],
    achievementsUk: ["Майстер спорту з пауерліфтингу", "Сертифікований дієтолог-нутриціолог", "Допоміг 100+ клієнтам досягти мети"],
    avatar: "A",
    availableTimeSlots: ["09:00", "11:00", "14:00", "16:00", "18:00"]
  },
  {
    id: "elena",
    name: "Elena Rostova",
    nameUk: "Олена Ростова",
    specialty: "Yoga, Stretch & Core",
    specialtyUk: "Йога, стретчинг та кор",
    experience: 6,
    price: 30,
    rating: 5.0,
    bio: "Hatha and Vinyasa Yoga guide. Focused on mind-body alignment, flexibility, mobility, and posture correction.",
    bioUk: "Інструктор з Хатха та Віньяса йоги. Допомагає знайти баланс тіла та розуму, покращити гнучкість, мобільність суглобів та виправити поставу.",
    achievements: ["RYT-200 Yoga Alliance Certification", "Flexibility Specialist", "Mindfulness Coach"],
    achievementsUk: ["Сертифікат RYT-200 Yoga Alliance", "Спеціаліст зі стретчингу", "Коуч з ментального здоров'я"],
    avatar: "E",
    availableTimeSlots: ["08:00", "10:00", "12:00", "15:00", "17:00"],
    isPremium: true
  },
  {
    id: "dmitry",
    name: "Dmitry Kravchenko",
    nameUk: "Дмитро Кравченко",
    specialty: "Weight Loss & Cardio HIIT",
    specialtyUk: "Схуднення та кардіо HIIT",
    experience: 5,
    price: 22,
    rating: 4.8,
    bio: "High-intensity cardio fitness expert. Energetic trainer dedicated to fat burning, endurance enhancement, and metabolic boosts.",
    bioUk: "Експерт з високоінтенсивного кардіо. Енергійний тренер, націлений на спалювання жиру, розвиток витривалості та прискорення метаболізму.",
    achievements: ["HIIT Training Expert Certificate", "Functional Fitness Specialist", "Marathon Finisher"],
    achievementsUk: ["Сертифікат експерта HIIT тренувань", "Спеціаліст з функціонального тренінгу", "Фінішер марафонів"],
    avatar: "D",
    availableTimeSlots: ["07:00", "10:00", "13:00", "16:00", "19:00"]
  },
  {
    id: "nikita",
    name: "Nikita Gluhikh",
    nameUk: "Нікіта Глухих",
    specialty: "Functional Training & Rehabilitation",
    specialtyUk: "Функціональний тренінг та реабілітація",
    experience: 7,
    price: 35,
    rating: 5.0,
    bio: "Expert in functional movement and injury prevention. Focuses on building a resilient and athletic body.",
    bioUk: "Експерт з функціонального руху та профілактики травм. Фокусується на побудові витривалого та атлетичного тіла.",
    achievements: ["Functional Training Specialist", "Rehab Specialist", "Athletic Conditioning Coach"],
    achievementsUk: ["Спеціаліст з функціонального тренінгу", "Спеціаліст з реабілітації", "Тренер з атлетичної підготовки"],
    avatar: "N",
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
    availableTimeSlots: ["09:00", "11:00", "15:00", "18:00", "20:00"],
    isPremium: true
  }
];

const API_BASE = import.meta.env.PROD
  ? (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes('localhost') ? import.meta.env.VITE_API_BASE_URL : '')
  : (import.meta.env.VITE_API_BASE_URL || '');

export default function TrainersPage() {
  const { user, isAuthenticated } = useAuth();
  const { locale } = useI18n();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [activeTab, setActiveTab] = useState("all-trainers");

  // Bookings state
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTimeSlot, setBookingTimeSlot] = useState("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  // Chat state
  const [activeChatTrainer, setActiveChatTrainer] = useState<Trainer | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTrainerTyping, setIsTrainerTyping] = useState(false);

  const { notify } = useNotifications();
  const prevChatsLength = useRef(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingInterval = useRef<any>(null);

  // Fetch Bookings
  const fetchBookings = async () => {
    if (!isAuthenticated) return;
    try {
      const token = localStorage.getItem("omomo_auth_token");
      const res = await fetch(`${API_BASE}/api/trainers/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (e) {
      console.error("Failed to fetch bookings:", e);
    }
  };

  // Fetch Chats
  const fetchChats = async (trainerId: string) => {
    if (!isAuthenticated) return;
    try {
      const token = localStorage.getItem("omomo_auth_token");
      const res = await fetch(`${API_BASE}/api/trainers/chats?trainerId=${trainerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const newChats = data.chats || [];
        
        // Notify if new message from trainer
        if (newChats.length > prevChatsLength.current) {
          const newMessages = newChats.slice(prevChatsLength.current);
          const latestTrainerMsg = newMessages.filter((m: any) => m.sender === 'trainer').pop();
          if (latestTrainerMsg && document.hidden) {
            notify(`Нове повідомлення від ${activeChatTrainer?.name || 'Тренера'}`, { body: latestTrainerMsg.message });
          } else if (latestTrainerMsg) {
             notify(`Нове повідомлення`, { body: latestTrainerMsg.message });
          }
        }
        
        setChatMessages(newChats);
        prevChatsLength.current = newChats.length;
      }
    } catch (e) {
      console.error("Failed to fetch chats:", e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated, activeTab]);

  // Poll chats when open
  useEffect(() => {
    if (isChatOpen && activeChatTrainer) {
      fetchChats(activeChatTrainer.id);
      pollingInterval.current = setInterval(() => {
        fetchChats(activeChatTrainer.id);
      }, 2500);
    } else {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [isChatOpen, activeChatTrainer]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTrainerTyping]);

  // Search/Filter logic
  const filteredTrainers = TRAINERS_DATA.filter((trainer) => {
    const name = locale === "uk" ? trainer.nameUk : trainer.name;
    const specialty = locale === "uk" ? trainer.specialtyUk : trainer.specialty;
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      specialty.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === "all" ||
      trainer.id === selectedSpecialty ||
      (selectedSpecialty === "gain" && trainer.id === "alex") ||
      (selectedSpecialty === "stretch" && trainer.id === "elena") ||
      (selectedSpecialty === "loss" && trainer.id === "dmitry");

    return matchesSearch && matchesSpecialty;
  });

  // Handle Booking Create
  const handleCreateBooking = async () => {
    if (!isAuthenticated) {
      toast.error(locale === "uk" ? "Будь ласка, авторизуйтесь для бронювання!" : "Please login to book a session!");
      return;
    }
    if (!bookingDate || !bookingTimeSlot || !selectedTrainer) {
      toast.error(locale === "uk" ? "Оберіть дату та час тренування" : "Select date and time slot");
      return;
    }

    try {
      const token = localStorage.getItem("omomo_auth_token");
      const res = await fetch(`${API_BASE}/api/trainers/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          trainerId: selectedTrainer.id,
          trainerName: locale === "uk" ? selectedTrainer.nameUk : selectedTrainer.name,
          trainerSpecialty: locale === "uk" ? selectedTrainer.specialtyUk : selectedTrainer.specialty,
          trainerImage: selectedTrainer.avatar,
          date: bookingDate,
          timeSlot: bookingTimeSlot,
          status: "scheduled"
        })
      });

      if (res.ok) {
        toast.success(locale === "uk" ? "Тренування успішно заброньовано!" : "Session successfully scheduled!");
        setIsBookingModalOpen(false);
        setBookingDate("");
        setBookingTimeSlot("");
        fetchBookings();
        setActiveTab("my-bookings");
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Booking failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating booking");
    }
  };

  // Handle Booking Cancel
  const handleCancelBooking = async (id: string) => {
    try {
      const token = localStorage.getItem("omomo_auth_token");
      const res = await fetch(`${API_BASE}/api/trainers/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success(locale === "uk" ? "Бронювання скасовано" : "Booking cancelled");
        fetchBookings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Send Message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChatTrainer) return;

    const userMessage = newMessage;
    setNewMessage("");

    // Optimistically add to UI
    const optimisticMessage = {
      _id: Math.random().toString(),
      sender: "user",
      message: userMessage,
      timestamp: new Date().toISOString()
    };
    setChatMessages((prev) => [...prev, optimisticMessage]);

    try {
      const token = localStorage.getItem("omomo_auth_token");
      const res = await fetch(`${API_BASE}/api/trainers/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          trainerId: activeChatTrainer.id,
          message: userMessage,
          sender: "user"
        })
      });

      if (res.ok) {
        // Trigger simulated typing delay
        setIsTrainerTyping(true);
        setTimeout(() => {
          setIsTrainerTyping(false);
          fetchChats(activeChatTrainer.id);
        }, 1800);
      }
    } catch (e) {
      console.error("Message send failure:", e);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground overflow-x-hidden">
      <DashboardSidebar />
      <div className="flex-1 min-w-0 relative pb-20 md:pb-8">
        <MobileHeader />
        
        <main className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {locale === "uk" ? "Персональні тренери" : "Personal Trainers"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {locale === "uk" 
                  ? "Знайдіть свого ідеального тренера для досягнення цілей" 
                  : "Find your ideal coach to reach your fitness goals"}
              </p>
            </div>
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={locale === "uk" ? "Пошук тренера..." : "Search trainers..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-card border-border/50 text-sm h-10 rounded-xl"
                />
              </div>
              
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="bg-card border border-border/50 rounded-xl px-3 h-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              >
                <option value="all">{locale === "uk" ? "Всі напрямки" : "All specialties"}</option>
                <option value="gain">{locale === "uk" ? "Набір маси" : "Muscle Gain"}</option>
                <option value="stretch">{locale === "uk" ? "Йога та стретчинг" : "Yoga & Stretch"}</option>
                <option value="loss">{locale === "uk" ? "Схуднення & Кардіо" : "Weight Loss & Cardio"}</option>
              </select>
            </div>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/30 p-1 mb-6 rounded-xl">
              <TabsTrigger value="all-trainers" className="rounded-lg text-sm font-medium">
                {locale === "uk" ? "Всі тренери" : "All Trainers"}
              </TabsTrigger>
              <TabsTrigger value="my-bookings" className="rounded-lg text-sm font-medium relative">
                {locale === "uk" ? "Мої бронювання" : "My Bookings"}
                {bookings.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[9px] font-bold text-primary-foreground rounded-full flex items-center justify-center">
                    {bookings.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ALL TRAINERS CONTENT */}
            <TabsContent value="all-trainers" className="space-y-6">
              {filteredTrainers.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {locale === "uk" ? "Тренерів не знайдено" : "No trainers found"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTrainers.map((trainer) => (
                    <motion.div
                      key={trainer.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -4 }}
                    >
                      <Card className="overflow-hidden border border-border/40 bg-gradient-to-br from-card to-card/90 flex flex-col h-full hover:shadow-lg transition-all duration-300 relative group">
                        
                        {/* Rating/Premium Badge */}
                        <div className="absolute top-4 right-4 bg-background/85 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-border/30 flex items-center gap-1.5 z-10">
                          {trainer.isPremium ? (
                            <span className="flex items-center gap-1 text-[10px] font-black tracking-wider text-purple-400 uppercase bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                              {user?.isPremium ? <Check className="w-3 h-3 text-green-400" /> : <Lock className="w-3.5 h-3.5 text-purple-400" />}
                              PREMIUM
                            </span>
                          ) : (
                            <>
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-bold">{trainer.rating.toFixed(1)}</span>
                            </>
                          )}
                        </div>

                        {/* Top Info Banner */}
                        <div className="p-6 pb-4 flex items-start gap-4">
                          {trainer.imageUrl ? (
                            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-primary/20 shadow-inner flex-shrink-0">
                              <img src={trainer.imageUrl} alt={trainer.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center text-xl font-extrabold text-primary shadow-inner flex-shrink-0">
                              {trainer.avatar}
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                              {locale === "uk" ? trainer.nameUk : trainer.name}
                            </h3>
                            <p className="text-xs text-primary font-semibold mt-0.5">
                              {locale === "uk" ? trainer.specialtyUk : trainer.specialty}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {locale === "uk" 
                                ? `Досвід: ${trainer.experience} років` 
                                : `Experience: ${trainer.experience} years`}
                            </p>
                          </div>
                        </div>

                        {/* Bio & Preview */}
                        <div className="px-6 flex-1">
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {locale === "uk" ? trainer.bioUk : trainer.bio}
                          </p>
                        </div>

                        {/* Footer details */}
                        <div className="p-6 pt-4 border-t border-border/30 mt-6 flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-black text-foreground">${trainer.price}</span>
                            <span className="text-xs text-muted-foreground"> / {locale === "uk" ? "год" : "hr"}</span>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl border-border/50 h-9"
                              onClick={() => {
                                if (trainer.isPremium && !user?.isPremium) {
                                  setIsCheckoutOpen(true);
                                  return;
                                }
                                setSelectedTrainer(trainer);
                                setIsBookingModalOpen(true);
                              }}
                            >
                              <Calendar className="w-4 h-4 mr-1.5" />
                              {locale === "uk" ? "Записатись" : "Book"}
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-xl bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary w-9 h-9"
                              onClick={() => {
                                if (trainer.isPremium && !user?.isPremium) {
                                  setIsCheckoutOpen(true);
                                  return;
                                }
                                setActiveChatTrainer(trainer);
                                setIsChatOpen(true);
                              }}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* MY BOOKINGS CONTENT */}
            <TabsContent value="my-bookings" className="space-y-4">
              {!isAuthenticated ? (
                <Card className="p-8 text-center border-border/40 bg-card/60">
                  <User className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2">
                    {locale === "uk" ? "Потрібна авторизація" : "Login Required"}
                  </h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mb-4 text-sm">
                    {locale === "uk" 
                      ? "Авторизуйтесь в AmAm, щоб переглядати та планувати тренування з тренерами." 
                      : "Sign in to your AmAm account to view and book sessions with trainers."}
                  </p>
                  <Button onClick={() => window.location.href = "/auth"} className="rounded-xl">
                    {locale === "uk" ? "Увійти в акаунт" : "Sign In"}
                  </Button>
                </Card>
              ) : bookings.length === 0 ? (
                <div className="text-center py-16 bg-card/25 rounded-2xl border border-dashed border-border/40">
                  <Calendar className="w-12 h-12 text-muted-foreground/45 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    {locale === "uk" ? "У вас немає запланованих тренувань." : "You have no upcoming trainer sessions."}
                  </p>
                  <Button variant="link" onClick={() => setActiveTab("all-trainers")} className="mt-2 text-primary font-bold">
                    {locale === "uk" ? "Забронювати перше тренування" : "Schedule your first session"}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookings.map((booking) => (
                    <motion.div
                      key={booking._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card className="p-5 border border-border/40 bg-card hover:shadow-md transition-all rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                            {booking.trainerImage || "T"}
                          </div>
                          <div>
                            <h4 className="font-bold text-base">{booking.trainerName}</h4>
                            <p className="text-xs text-muted-foreground font-medium">{booking.trainerSpecialty}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-foreground/80">
                              <span className="flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded-md">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                {booking.date}
                              </span>
                              <span className="flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded-md">
                                <Clock className="w-3.5 h-3.5 text-primary" />
                                {booking.timeSlot}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 rounded-xl"
                          onClick={() => handleCancelBooking(booking._id)}
                          title={locale === "uk" ? "Скасувати тренування" : "Cancel session"}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>

        <MobileBottomNav />
      </div>

      {/* BOOKING DIALOG */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="bg-card border border-border/50 max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {locale === "uk" ? "Забронювати тренування" : "Book Trainer Session"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              {locale === "uk" 
                ? "Оберіть зручну дату та час для індивідуального заняття."
                : "Select the most convenient date and time slot for your personal training session."}
            </DialogDescription>
          </DialogHeader>

          {selectedTrainer && (
            <div className="space-y-5 mt-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/20">
                {selectedTrainer.imageUrl ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={selectedTrainer.imageUrl} alt={selectedTrainer.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold flex-shrink-0">
                    {selectedTrainer.avatar}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm">{locale === "uk" ? selectedTrainer.nameUk : selectedTrainer.name}</h4>
                  <p className="text-xs text-primary font-medium">{locale === "uk" ? selectedTrainer.specialtyUk : selectedTrainer.specialty}</p>
                </div>
              </div>

              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {locale === "uk" ? "Оберіть дату" : "Select Date"}
                </label>
                <Input
                  type="date"
                  value={bookingDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="bg-background border-border/40 rounded-xl text-sm"
                />
              </div>

              {/* Time Slots */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {locale === "uk" ? "Доступний час" : "Available Time Slots"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {selectedTrainer.availableTimeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setBookingTimeSlot(slot)}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all text-center ${
                        bookingTimeSlot === slot
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background border-border/50 text-foreground hover:bg-muted"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confirm Action */}
              <div className="flex gap-3 pt-3">
                <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => setIsBookingModalOpen(false)}>
                  {locale === "uk" ? "Скасувати" : "Cancel"}
                </Button>
                <Button className="flex-1 rounded-xl" onClick={handleCreateBooking}>
                  {locale === "uk" ? "Підтвердити" : "Confirm Booking"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CHAT DRAWER (SHEET) */}
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-card border-l border-border/40 p-0 flex flex-col h-full shadow-2xl">
          <SheetHeader className="p-4 border-b border-border/40 flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-lg shadow-inner">
              {activeChatTrainer?.avatar || "T"}
            </div>
            <div className="flex-1 text-left">
              <SheetTitle className="text-base font-bold">
                {activeChatTrainer ? (locale === "uk" ? activeChatTrainer.nameUk : activeChatTrainer.name) : ""}
              </SheetTitle>
              <SheetDescription className="text-xs text-primary font-semibold">
                {activeChatTrainer ? (locale === "uk" ? activeChatTrainer.specialtyUk : activeChatTrainer.specialty) : ""}
              </SheetDescription>
            </div>
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setIsChatOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </SheetHeader>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-muted">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground/60 p-6">
                <MessageSquare className="w-12 h-12 mb-3 text-muted-foreground/30" />
                <p className="text-sm font-medium">
                  {locale === "uk" ? "Напишіть перше повідомлення тренеру!" : "Start conversation with your coach!"}
                </p>
                <p className="text-xs mt-1">
                  {locale === "uk" 
                    ? "Запитайте про харчування, тренування чи призначте сесію."
                    : "Ask about diets, exercises, or coordinate your plans."}
                </p>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div key={msg._id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        isUser
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted/60 text-foreground rounded-bl-none"
                      }`}
                    >
                      <p>{msg.message}</p>
                      <span className="text-[10px] text-muted-foreground/75 block text-right mt-1 font-semibold">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {/* Typing Indicator */}
            {isTrainerTyping && (
              <div className="flex justify-start">
                <div className="bg-muted/40 text-muted-foreground text-xs rounded-2xl px-4 py-2.5 rounded-bl-none flex items-center gap-1.5 shadow-sm">
                  <span className="animate-pulse">{activeChatTrainer?.name} typing</span>
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce delay-100"></span>
                    <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce delay-200"></span>
                    <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce delay-300"></span>
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="p-4 border-t border-border/40 bg-card flex gap-2">
            <Input
              placeholder={locale === "uk" ? "Повідомлення..." : "Write a message..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              className="bg-background border-border/40 rounded-xl"
            />
            <Button size="icon" className="rounded-xl flex-shrink-0" onClick={handleSendMessage}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <PremiumCheckoutModal open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen} />
    </div>
  );
}
