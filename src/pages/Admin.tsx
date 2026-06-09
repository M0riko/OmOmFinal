import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Trash, 
  Music, 
  Calendar, 
  Check, 
  X, 
  Sparkles, 
  ShieldAlert, 
  Database,
  ExternalLink,
  ShieldCheck,
  UserCheck
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  premiumCount: number;
  bookingsCount: number;
  musicCount: number;
  income: number;
  dbStatus: string;
}

interface UserListItem {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  isPremium: boolean;
  createdAt?: string;
}

interface BookingListItem {
  _id: string;
  trainerName: string;
  trainerSpecialty: string;
  date: string;
  timeSlot: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface MusicListItem {
  _id: string;
  title: string;
  artist: string;
  url: string;
}

const API_BASE = import.meta.env.PROD
  ? (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes('localhost') ? import.meta.env.VITE_API_BASE_URL : '')
  : (import.meta.env.VITE_API_BASE_URL || '');

export default function AdminPage() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const [activeTab, setActiveTab] = useState("stats");
  
  // Dashboard data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [music, setMusic] = useState<MusicListItem[]>([]);
  const [pendingArticles, setPendingArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("omomo_auth_token");
      const res = await fetch(`${API_BASE}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (e) {
      console.error("Failed to fetch admin stats:", e);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("omomo_auth_token");
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error("Failed to fetch admin users:", e);
    }
  };

  // Fetch Bookings
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("omomo_auth_token");
      const res = await fetch(`${API_BASE}/api/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (e) {
      console.error("Failed to fetch admin bookings:", e);
    }
  };

  // Fetch Music
  const fetchMusic = async () => {
    try {
      const token = localStorage.getItem("omomo_auth_token");
      const res = await fetch(`${API_BASE}/api/admin/music`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMusic(data.tracks || []);
      }
    } catch (e) {
      console.error("Failed to fetch admin music:", e);
    }
  };

  // Fetch Pending Articles
  const fetchPendingArticles = async () => {
    try {
      const token = localStorage.getItem("omomo_auth_token");
      const res = await fetch(`${API_BASE}/api/admin/articles/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingArticles(data.articles || []);
      }
    } catch (e) {
      console.error("Failed to fetch pending articles:", e);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchUsers(), fetchBookings(), fetchMusic(), fetchPendingArticles()]);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAllData();
    }
  }, [user]);

  // User Actions
  const handleUpdateUser = async (id: string, updates: Partial<UserListItem>) => {
    try {
      const token = localStorage.getItem("omomo_auth_token");
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        toast.success(locale === "uk" ? "Користувача оновлено" : "User updated successfully");
        fetchUsers();
        fetchStats();
      }
    } catch (e) {
      toast.error("Failed to update user");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === user?.id) {
      toast.error(locale === "uk" ? "Ви не можете видалити самого себе!" : "You cannot delete yourself!");
      return;
    }
    if (!confirm(locale === "uk" ? "Ви впевнені, що хочете видалити цього користувача?" : "Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("omomo_auth_token");
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(locale === "uk" ? "Користувача видалено" : "User deleted successfully");
        fetchUsers();
        fetchStats();
      }
    } catch (e) {
      toast.error("Failed to delete user");
    }
  };

  // Booking Actions
  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem("omomo_auth_token");
      const res = await fetch(`${API_BASE}/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(locale === "uk" ? "Статус бронювання оновлено" : "Booking status updated");
        fetchBookings();
        fetchStats();
      }
    } catch (e) {
      toast.error("Failed to update booking");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm(locale === "uk" ? "Ви впевнені, що хочете видалити це бронювання?" : "Are you sure you want to delete this booking?")) return;

    try {
      const token = localStorage.getItem("omomo_auth_token");
      const res = await fetch(`${API_BASE}/api/admin/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(locale === "uk" ? "Бронювання видалено" : "Booking deleted successfully");
        fetchBookings();
        fetchStats();
      }
    } catch (e) {
      toast.error("Failed to delete booking");
    }
  };

  // Music Actions
  const handleDeleteTrack = async (id: string) => {
    if (!confirm(locale === "uk" ? "Ви впевнені, що хочете видалити цей трек?" : "Are you sure you want to delete this track?")) return;

    try {
      const token = localStorage.getItem("omomo_auth_token");
      const res = await fetch(`${API_BASE}/api/admin/music/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(locale === "uk" ? "Трек видалено з системи" : "Track deleted successfully");
        fetchMusic();
        fetchStats();
      }
    } catch (e) {
      toast.error("Failed to delete track");
    }
  };

  // Article Actions
  const handleUpdateArticleStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem("omomo_auth_token");
      const res = await fetch(`${API_BASE}/api/admin/articles/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(locale === "uk" ? "Статус статті оновлено" : "Article status updated");
        fetchPendingArticles();
        fetchStats();
      }
    } catch (e) {
      toast.error("Failed to update article");
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm(locale === "uk" ? "Ви впевнені, що хочете видалити цю статтю?" : "Are you sure you want to delete this article?")) return;

    try {
      const token = localStorage.getItem("omomo_auth_token");
      const res = await fetch(`${API_BASE}/api/admin/articles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(locale === "uk" ? "Статтю видалено" : "Article deleted");
        fetchPendingArticles();
        fetchStats();
      }
    } catch (e) {
      toast.error("Failed to delete article");
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground p-6">
        <Card className="max-w-md p-8 text-center border-2 border-red-500/20 bg-card">
          <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-black mb-2 text-foreground">
            {locale === "uk" ? "ДОСТУП ЗАБОРОНЕНО" : "ACCESS DENIED"}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {locale === "uk" 
              ? "Ця сторінка доступна виключно адміністраторам системи. Поверніться до профілю." 
              : "This page is strictly reserved for system administrators. Please return to your profile."}
          </p>
          <Button onClick={() => window.location.href = "/profile"} className="rounded-xl w-full">
            {locale === "uk" ? "Повернутись до Профілю" : "Return to Profile"}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground overflow-x-hidden">
      <DashboardSidebar />
      <div className="flex-1 min-w-0 pb-20 md:pb-8">
        <MobileHeader />

        <main className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
                <ShieldCheck className="w-8 h-8 text-purple-400" />
                {locale === "uk" ? "Панель Адміністратора" : "Admin Dashboard"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {locale === "uk" 
                  ? "Керування користувачами, перегляд аналітики та моніторинг сервісів" 
                  : "Manage users, track statistics, and control bookings or library tracks"}
              </p>
            </div>
            <Button onClick={loadAllData} variant="outline" className="rounded-xl h-10 border-border/50 text-xs font-bold">
              {locale === "uk" ? "Оновити дані" : "Refresh Data"}
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-3xl grid-cols-5 bg-muted/30 p-1 mb-6 rounded-xl border border-border/20">
              <TabsTrigger value="stats" className="rounded-lg text-xs font-bold">
                {locale === "uk" ? "Аналітика" : "Analytics"}
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-lg text-xs font-bold">
                {locale === "uk" ? "Користувачі" : "Users"}
              </TabsTrigger>
              <TabsTrigger value="bookings" className="rounded-lg text-xs font-bold">
                {locale === "uk" ? "Бронювання" : "Bookings"}
              </TabsTrigger>
              <TabsTrigger value="music" className="rounded-lg text-xs font-bold">
                {locale === "uk" ? "Медіатека" : "Media"}
              </TabsTrigger>
              <TabsTrigger value="articles" className="rounded-lg text-xs font-bold relative">
                {locale === "uk" ? "Статті" : "Articles"}
                {pendingArticles.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* STATS CONTENT */}
            <TabsContent value="stats" className="space-y-6">
              {loading ? (
                <div className="text-center py-20 text-muted-foreground">
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                  Завантаження статистики...
                </div>
              ) : (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6 bg-gradient-to-br from-card to-card/90 border-border/40 rounded-2xl flex items-center justify-between shadow-md">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {locale === "uk" ? "Всього користувачів" : "Total Users"}
                        </p>
                        <h3 className="text-3xl font-black mt-2 text-foreground">{stats?.totalUsers || 0}</h3>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-card to-card/90 border-border/40 rounded-2xl flex items-center justify-between shadow-md">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {locale === "uk" ? "Преміум підписки" : "Premium Members"}
                        </p>
                        <h3 className="text-3xl font-black mt-2 text-green-400">{stats?.premiumCount || 0}</h3>
                      </div>
                      <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 fill-green-400/15" />
                      </div>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-card to-card/90 border-border/40 rounded-2xl flex items-center justify-between shadow-md">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {locale === "uk" ? "Замовлення тренерів" : "Bookings Done"}
                        </p>
                        <h3 className="text-3xl font-black mt-2 text-purple-400">{stats?.bookingsCount || 0}</h3>
                      </div>
                      <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6" />
                      </div>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-card to-card/90 border-border/40 rounded-2xl flex items-center justify-between shadow-md">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {locale === "uk" ? "Розрахунковий дохід" : "Mock Income"}
                        </p>
                        <h3 className="text-3xl font-black mt-2 text-yellow-500">${stats?.income?.toFixed(2) || "0.00"}</h3>
                      </div>
                      <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                    </Card>
                  </div>

                  {/* System Health */}
                  <Card className="p-6 bg-card border-border/40 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                        <Database className="w-4 h-4 text-green-400" />
                      </div>
                      <h4 className="font-bold text-base">{locale === "uk" ? "Статус Бази Даних" : "Database Engine Status"}</h4>
                    </div>

                    <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-xl border border-border/30">
                      <div className={`w-3.5 h-3.5 rounded-full ${stats?.dbStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          MongoDB Atlas: {stats?.dbStatus === 'online' ? (locale === "uk" ? "З'єднано" : "Connected") : (locale === "uk" ? "Помилка" : "Error")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {locale === "uk" 
                            ? "Всі запити обробляються успішно в кластері MongoDB" 
                            : "Server is fully connected to the remote Atlas database instance."}
                        </p>
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* USERS LIST CONTENT */}
            <TabsContent value="users" className="space-y-4">
              <Card className="bg-card border-border/40 p-4 rounded-2xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground font-semibold">
                        <th className="pb-3 px-3">{locale === "uk" ? "Користувач" : "Username"}</th>
                        <th className="pb-3 px-3">Email</th>
                        <th className="pb-3 px-3">{locale === "uk" ? "Роль" : "Role"}</th>
                        <th className="pb-3 px-3">Premium</th>
                        <th className="pb-3 px-3 text-right">{locale === "uk" ? "Дії" : "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-muted/10 transition-colors">
                          <td className="py-4 px-3 font-bold text-foreground">{u.username}</td>
                          <td className="py-4 px-3 text-muted-foreground">{u.email}</td>
                          <td className="py-4 px-3">
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateUser(u._id, { role: e.target.value as any })}
                              className="bg-background border border-border/50 text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none"
                            >
                              <option value="user">USER</option>
                              <option value="admin">ADMIN</option>
                            </select>
                          </td>
                          <td className="py-4 px-3">
                            <Button
                              onClick={() => handleUpdateUser(u._id, { isPremium: !u.isPremium })}
                              size="sm"
                              variant="ghost"
                              className={`rounded-lg text-xs font-black h-7 px-2.5 flex items-center gap-1.5 ${
                                u.isPremium 
                                  ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' 
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }`}
                            >
                              <Sparkles className="w-3 h-3" />
                              {u.isPremium ? 'YES' : 'NO'}
                            </Button>
                          </td>
                          <td className="py-4 px-3 text-right">
                            <Button
                              onClick={() => handleDeleteUser(u._id)}
                              size="icon"
                              variant="ghost"
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg w-8 h-8"
                              disabled={u._id === user?.id}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* BOOKINGS LIST CONTENT */}
            <TabsContent value="bookings" className="space-y-4">
              <Card className="bg-card border-border/40 p-4 rounded-2xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground font-semibold">
                        <th className="pb-3 px-3">{locale === "uk" ? "Тренер" : "Trainer"}</th>
                        <th className="pb-3 px-3">{locale === "uk" ? "Напрямок" : "Specialty"}</th>
                        <th className="pb-3 px-3">{locale === "uk" ? "Дата / Час" : "Date / Slot"}</th>
                        <th className="pb-3 px-3">{locale === "uk" ? "Статус" : "Status"}</th>
                        <th className="pb-3 px-3 text-right">{locale === "uk" ? "Дії" : "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            {locale === "uk" ? "Бронювань немає" : "No bookings scheduled yet"}
                          </td>
                        </tr>
                      ) : (
                        bookings.map((b) => (
                          <tr key={b._id} className="hover:bg-muted/10 transition-colors">
                            <td className="py-4 px-3 font-bold text-foreground">{b.trainerName}</td>
                            <td className="py-4 px-3 text-xs text-primary font-semibold">{b.trainerSpecialty}</td>
                            <td className="py-4 px-3 text-muted-foreground font-mono text-xs">{b.date} • {b.timeSlot}</td>
                            <td className="py-4 px-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                b.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                b.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                                'bg-purple-500/10 text-purple-400'
                              }`}>
                                {b.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-4 px-3 text-right flex justify-end gap-1">
                              {b.status === 'scheduled' && (
                                <>
                                  <Button
                                    onClick={() => handleUpdateBookingStatus(b._id, 'completed')}
                                    size="icon"
                                    variant="ghost"
                                    className="text-green-400 hover:bg-green-500/10 rounded-lg w-8 h-8"
                                    title={locale === "uk" ? "Завершити" : "Complete"}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handleUpdateBookingStatus(b._id, 'cancelled')}
                                    size="icon"
                                    variant="ghost"
                                    className="text-red-400 hover:bg-red-500/10 rounded-lg w-8 h-8"
                                    title={locale === "uk" ? "Скасувати" : "Cancel"}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                onClick={() => handleDeleteBooking(b._id)}
                                size="icon"
                                variant="ghost"
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg w-8 h-8"
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* MUSIC CONTENT */}
            <TabsContent value="music" className="space-y-4">
              <Card className="bg-card border-border/40 p-4 rounded-2xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground font-semibold">
                        <th className="pb-3 px-3">{locale === "uk" ? "Назва" : "Track Title"}</th>
                        <th className="pb-3 px-3">{locale === "uk" ? "Виконавець" : "Artist"}</th>
                        <th className="pb-3 px-3">URL</th>
                        <th className="pb-3 px-3 text-right">{locale === "uk" ? "Дії" : "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {music.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-muted-foreground">
                            {locale === "uk" ? "Жодного завантаженого треку" : "No custom tracks uploaded"}
                          </td>
                        </tr>
                      ) : (
                        music.map((m) => (
                          <tr key={m._id} className="hover:bg-muted/10 transition-colors">
                            <td className="py-4 px-3 font-bold text-foreground flex items-center gap-2">
                              <Music className="w-4 h-4 text-purple-400" />
                              {m.title}
                            </td>
                            <td className="py-4 px-3 text-muted-foreground">{m.artist}</td>
                            <td className="py-4 px-3 max-w-[200px] truncate text-xs text-blue-400 font-mono">
                              <a href={m.url} target="_blank" rel="noreferrer" className="hover:underline inline-flex items-center gap-1">
                                {m.url}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                            <td className="py-4 px-3 text-right">
                              <Button
                                onClick={() => handleDeleteTrack(m._id)}
                                size="icon"
                                variant="ghost"
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg w-8 h-8"
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
            {/* ARTICLES CONTENT */}
            <TabsContent value="articles" className="space-y-4">
              <Card className="bg-card border-border/40 p-4 rounded-2xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground font-semibold">
                        <th className="pb-3 px-3">{locale === "uk" ? "Назва" : "Title"}</th>
                        <th className="pb-3 px-3">{locale === "uk" ? "Автор" : "Author"}</th>
                        <th className="pb-3 px-3">{locale === "uk" ? "Категорія" : "Category"}</th>
                        <th className="pb-3 px-3">{locale === "uk" ? "Статус" : "Status"}</th>
                        <th className="pb-3 px-3 text-right">{locale === "uk" ? "Дії" : "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {pendingArticles.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            {locale === "uk" ? "Немає статей на перевірку" : "No pending articles"}
                          </td>
                        </tr>
                      ) : (
                        pendingArticles.map((a) => (
                          <tr key={a._id} className="hover:bg-muted/10 transition-colors">
                            <td className="py-4 px-3 font-bold text-foreground flex items-center gap-2">
                              <span className="truncate max-w-[200px]">{a.titleUk || a.title}</span>
                            </td>
                            <td className="py-4 px-3 text-muted-foreground">{a.authorNameUk || a.authorName}</td>
                            <td className="py-4 px-3 text-xs text-primary font-semibold">{a.categoryId}</td>
                            <td className="py-4 px-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-500">
                                PENDING
                              </span>
                            </td>
                            <td className="py-4 px-3 text-right flex justify-end gap-1">
                              <Button
                                onClick={() => handleUpdateArticleStatus(a._id, 'approved')}
                                size="icon"
                                variant="ghost"
                                className="text-green-400 hover:bg-green-500/10 rounded-lg w-8 h-8"
                                title={locale === "uk" ? "Схвалити" : "Approve"}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteArticle(a._id)}
                                size="icon"
                                variant="ghost"
                                className="text-red-400 hover:bg-red-500/10 rounded-lg w-8 h-8"
                                title={locale === "uk" ? "Відхилити/Видалити" : "Reject"}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        <MobileBottomNav />
      </div>
    </div>
  );
}
