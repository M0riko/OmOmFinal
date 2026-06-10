import { useState, useEffect, useRef } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Music, Disc, Play, Pause, Plus, Trash, Link2, ExternalLink, Headphones, Sparkles, Check, AlertTriangle, Upload, Link as LinkIcon, Volume2, VolumeX } from "lucide-react";
import { PremiumCheckoutModal } from "@/components/PremiumCheckoutModal";

interface CustomTrack {
  _id: string;
  title: string;
  artist: string;
  url: string;
  category?: string;
}

const SPOTIFY_PLAYLISTS = [
  { id: "37i9dQZF1DX76t638V6eg8", name: "Gym Beast Mode", description: "High energy beats to push your limits." },
  { id: "37i9dQZF1DX843m4xh1o4O", name: "Cardio Hit Workout", description: "Fast tempo tracks for fat burning." },
  { id: "37i9dQZF1DX0A5q426CltT", name: "Yoga & Meditation", description: "Deep focus ambient sounds for stretching." },
  { id: "37i9dQZF1DWUSyphfh646B", name: "Power Workout", description: "Intense rock and hip-hop training anthems." }
];

const DEFAULT_TRACKS = [
  { title: "Epic Training Motivation", artist: "Infraction", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "Focus & Chill Beats", artist: "Lofi Fitness", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Energetic Running Anthem", artist: "Rival & Cadmium", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

const API_BASE = import.meta.env.PROD
  ? (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes('localhost') ? import.meta.env.VITE_API_BASE_URL : '')
  : (import.meta.env.VITE_API_BASE_URL || '');

export default function MusicPage() {
  const { user, isAuthenticated } = useAuth();
  const { locale } = useI18n();

  const [activeTab, setActiveTab] = useState("spotify");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Spotify integration
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [spotifyUser, setSpotifyUser] = useState<any>(null);
  const [spotifyTopTracks, setSpotifyTopTracks] = useState<any[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(SPOTIFY_PLAYLISTS[0].id);
  const [isConnectingSpotify, setIsConnectingSpotify] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    const checkSpotifyStatus = async () => {
      try {
        const token = localStorage.getItem("omomo_auth_token");
        const res = await fetch(`${API_BASE}/api/spotify/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setIsSpotifyConnected(data.connected);
          if (data.connected) {
            fetchTopTracks();
            setSpotifyUser({
              display_name: user?.name || "Spotify User",
              avatar: "S"
            });
          }
        }
      } catch (e) {
        console.error("Error checking Spotify status", e);
      }
    };
    checkSpotifyStatus();
  }, [isAuthenticated]);

  const fetchTopTracks = async () => {
    try {
      const token = localStorage.getItem("omomo_auth_token");
      const res = await fetch(`${API_BASE}/api/spotify/top-tracks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSpotifyTopTracks(data.tracks || []);
      }
    } catch (e) {
      console.error("Error fetching top tracks", e);
    }
  };

  // Custom tracks state
  const [customTracks, setCustomTracks] = useState<CustomTrack[]>([]);
  const [isAddTrackOpen, setIsAddTrackOpen] = useState(false);
  const [newTrackTitle, setNewTrackTitle] = useState("");
  const [newTrackArtist, setNewTrackArtist] = useState("");
  const [newTrackUrl, setNewTrackUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // HTML5 audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<CustomTrack | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Load user custom tracks
  const fetchCustomTracks = async () => {
    if (!isAuthenticated) return;
    try {
      const token = localStorage.getItem("omomo_auth_token");
      const res = await fetch(`${API_BASE}/api/music/tracks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomTracks(data.tracks || []);
      }
    } catch (e) {
      console.error("Failed to fetch tracks:", e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomTracks();
    } else {
      // Mock tracks for guests
      setCustomTracks(DEFAULT_TRACKS.map((t, idx) => ({ ...t, _id: `mock_${idx}` })));
    }
  }, [isAuthenticated]);

  // Audio setup
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    
    const handleDuration = () => {
      if (audioRef.current) setAudioDuration(audioRef.current.duration || 0);
    };
    
    const handleTimeUpdate = () => {
      if (audioRef.current) setCurrentTime(audioRef.current.currentTime || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audioRef.current.addEventListener("durationchange", handleDuration);
    audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    audioRef.current.addEventListener("ended", handleEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("durationchange", handleDuration);
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
        audioRef.current.removeEventListener("ended", handleEnded);
      }
    };
  }, []);

  // Visualizer Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    let height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const barCount = 45;
    const bars: number[] = Array(barCount).fill(5);

    const render = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Create glowing gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.offsetWidth, 0);
      gradient.addColorStop(0, "#4f46e5"); // indigo
      gradient.addColorStop(0.5, "#ec4899"); // pink
      gradient.addColorStop(1, "#3b82f6"); // blue

      const spacing = 4;
      const barWidth = (canvas.offsetWidth - spacing * (barCount - 1)) / barCount;

      for (let i = 0; i < barCount; i++) {
        // Procedural music animation logic
        let targetHeight = 5;
        if (isPlaying) {
          const time = Date.now() * 0.003;
          targetHeight = Math.abs(
            Math.sin(i * 0.15 + time) * 35 + 
            Math.cos(i * 0.05 - time * 0.5) * 15 + 
            Math.sin(time * 2 + i * 0.4) * 8
          );
          // Add random pulses
          if (Math.random() > 0.95) targetHeight += 12;
          targetHeight = Math.max(5, Math.min(65, targetHeight));
        }

        // Smooth transition
        bars[i] += (targetHeight - bars[i]) * 0.2;

        const x = i * (barWidth + spacing);
        const y = canvas.offsetHeight / 2 - bars[i] / 2;

        ctx.fillStyle = gradient;
        // Rounded rectangles for beautiful waveform
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, bars[i], 3);
        } else {
          ctx.rect(x, y, barWidth, bars[i]);
        }
        ctx.fill();
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    // Resize handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [isPlaying]);

  // Handle play/pause
  const togglePlay = (track?: CustomTrack) => {
    if (!audioRef.current) return;

    if (track) {
      if (currentTrack?._id !== track._id) {
        audioRef.current.src = track.url;
        setCurrentTrack(track);
        audioRef.current.play().then(() => setIsPlaying(true)).catch(err => {
          toast.error("Failed to stream audio file: Check the URL format.");
          setIsPlaying(false);
        });
      } else {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current.play().then(() => setIsPlaying(true));
        }
      }
    } else if (currentTrack) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true));
      }
    } else if (customTracks.length > 0) {
      // Play first track by default
      togglePlay(customTracks[0]);
    }
  };

  // Seek audio
  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  // Spotify Connect
  const handleConnectSpotify = async () => {
    if (!isAuthenticated) {
      toast.error(locale === "uk" ? "Будь ласка, увійдіть в акаунт" : "Please log in first");
      return;
    }
    setIsConnectingSpotify(true);
    try {
      const token = localStorage.getItem("omomo_auth_token");
      const res = await fetch(`${API_BASE}/api/spotify/auth-url`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        toast.error(locale === "uk" ? "Помилка сервера. Впевніться, що ключі додано." : "Server error. Ensure API keys are set.");
      }
    } catch (e) {
      console.error(e);
      toast.error(locale === "uk" ? "Помилка підключення" : "Connection error");
    } finally {
      setIsConnectingSpotify(false);
    }
  };

  // Add Custom Track
  const handleAddTrack = async () => {
    if (!newTrackTitle || !newTrackUrl) {
      toast.error(locale === "uk" ? "Введіть назву та посилання" : "Title and audio link are required");
      return;
    }

    if (customTracks.length >= 3 && !user?.isPremium) {
      toast.error(locale === "uk" 
        ? "Безкоштовні акаунти обмежені 3 треками! Оновіть до Premium для безлімітного додавання." 
        : "Free accounts are limited to 3 custom tracks! Upgrade to Premium for unlimited uploads.");
      setIsCheckoutOpen(true);
      return;
    }

    const payload = {
      title: newTrackTitle,
      artist: newTrackArtist || (locale === "uk" ? "Невідомий виконавець" : "Unknown Artist"),
      url: newTrackUrl,
      category: "custom"
    };

    if (!isAuthenticated) {
      // Guest local save
      const guestTrack = {
        _id: `guest_${Date.now()}`,
        ...payload
      };
      setCustomTracks((prev) => [guestTrack, ...prev]);
      toast.success(locale === "uk" ? "Трек додано локально (Гість)" : "Track added locally (Guest)");
      resetAddTrackForm();
      return;
    }

    try {
      const token = localStorage.getItem("omomo_auth_token");
      const res = await fetch(`${API_BASE}/api/music/tracks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(locale === "uk" ? "Трек додано у ваш кабінет!" : "Track added to your playlist!");
        fetchCustomTracks();
        resetAddTrackForm();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetAddTrackForm = () => {
    setNewTrackTitle("");
    setNewTrackArtist("");
    setNewTrackUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsAddTrackOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewTrackTitle(file.name.replace(/\.[^/.]+$/, ""));
      const url = URL.createObjectURL(file);
      setNewTrackUrl(url);
    }
  };

  // Delete track
  const handleDeleteTrack = async (id: string) => {
    if (!isAuthenticated) {
      setCustomTracks((prev) => prev.filter((t) => t._id !== id));
      toast.success(locale === "uk" ? "Трек видалено" : "Track deleted");
      return;
    }

    try {
      const token = localStorage.getItem("omomo_auth_token");
      const res = await fetch(`${API_BASE}/api/music/tracks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success(locale === "uk" ? "Трек видалено" : "Track deleted");
        fetchCustomTracks();
        if (currentTrack?._id === id) {
          audioRef.current?.pause();
          setIsPlaying(false);
          setCurrentTrack(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground overflow-x-hidden">
      <DashboardSidebar />
      <div className="flex-1 min-w-0 pb-20 md:pb-8">
        <MobileHeader />

        <main className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {locale === "uk" ? "Музика для тренувань" : "Workout Music"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {locale === "uk" 
                  ? "Слухайте улюблені плейлисти Spotify або додавайте свої аудіофайли" 
                  : "Listen to Spotify playlists or stream your custom audio tracks"}
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/30 p-1 mb-6 rounded-xl">
              <TabsTrigger value="spotify" className="rounded-lg text-sm font-medium">
                Spotify Player
              </TabsTrigger>
              <TabsTrigger value="custom-music" className="rounded-lg text-sm font-medium">
                {locale === "uk" ? "Власна музика" : "My Tracks"}
              </TabsTrigger>
            </TabsList>

            {/* SPOTIFY TAB */}
            <TabsContent value="spotify" className="space-y-6">
              {!isSpotifyConnected ? (
                <Card className="p-8 text-center border-border/40 bg-gradient-to-br from-card to-card/90 max-w-xl mx-auto rounded-2xl relative overflow-hidden shadow-lg border-2 hover:border-green-500/20 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -translate-y-12 translate-x-12 blur-xl"></div>
                  
                  <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-500/20 shadow-inner">
                    <Music className="w-8 h-8 text-green-500 animate-pulse" />
                  </div>
                  
                  <h3 className="font-extrabold text-xl mb-2 text-foreground">
                    {locale === "uk" ? "Підключіть Spotify" : "Connect Spotify Premium"}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6 leading-relaxed">
                    {locale === "uk" 
                      ? "Слухайте улюблені треки прямо в додатку OmOm. Інтегруйте Spotify, щоб синхронізувати темп музики зі своїм кардіо-тренуванням!"
                      : "Stream your playlists directly inside the OmOm app. Sync music tempo with your workout heart rate zone!"}
                  </p>
                  
                  <Button 
                    onClick={handleConnectSpotify} 
                    className="bg-green-600 hover:bg-green-500 text-white rounded-xl px-6 h-11 font-bold shadow-md hover:shadow-xl transition-all"
                    disabled={isConnectingSpotify}
                  >
                    {isConnectingSpotify ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        {locale === "uk" ? "Підключення..." : "Connecting..."}
                      </span>
                    ) : (
                      "Connect Spotify"
                    )}
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Playlist selection */}
                  <div className="space-y-3">
                    <Card className="p-4 bg-muted/20 border-border/40 rounded-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center font-bold text-green-500">
                          {spotifyUser?.avatar}
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{locale === "uk" ? "Акаунт Spotify" : "Spotify Account"}</p>
                          <p className="text-sm font-bold text-foreground flex items-center gap-1">
                            {spotifyUser?.display_name}
                            <Check className="w-3.5 h-3.5 text-green-500 fill-green-500" />
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {locale === "uk" ? "Плейлисти тренувань" : "Workout Playlists"}
                        </p>
                        
                        {SPOTIFY_PLAYLISTS.map((playlist, idx) => {
                          const isLocked = (idx === 2 || idx === 3) && !user?.isPremium;
                          return (
                            <button
                              key={playlist.id}
                              onClick={() => {
                                if (isLocked) {
                                  setIsCheckoutOpen(true);
                                  toast.error(locale === "uk" 
                                    ? "Плейлисти 'Yoga & Meditation' та 'Power Workout' доступні лише для Premium користувачів!" 
                                    : "Playlists 'Yoga & Meditation' and 'Power Workout' are only available for Premium users!");
                                } else {
                                  setSelectedPlaylist(playlist.id);
                                }
                              }}
                              className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 relative overflow-hidden ${
                                selectedPlaylist === playlist.id
                                  ? "bg-green-500/10 border-green-500/30 text-green-500"
                                  : "bg-card border-border/50 text-foreground hover:bg-muted/40"
                              }`}
                            >
                              <div className="flex items-start gap-2.5 w-full">
                                <Disc className={`w-4 h-4 mt-0.5 flex-shrink-0 ${selectedPlaylist === playlist.id && !isLocked ? "animate-spin" : ""}`} />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-bold leading-tight">{playlist.name}</p>
                                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{playlist.description}</p>
                                </div>
                              </div>
                              {isLocked && (
                                <div className="absolute inset-0 bg-black/75 rounded-xl flex items-center justify-between px-3 z-10">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Disc className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
                                    <div className="text-left min-w-0">
                                      <p className="text-sm font-bold leading-tight text-white/70 truncate">{playlist.name}</p>
                                      <p className="text-[10px] text-purple-400 font-extrabold flex items-center gap-1 uppercase tracking-wider">
                                        <Sparkles className="w-2.5 h-2.5 fill-purple-400" />
                                        PREMIUM
                                      </p>
                                    </div>
                                  </div>
                                  <span className="bg-purple-600/90 text-white rounded-lg p-1.5 shadow-md flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                  </span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </Card>

                    {/* Top Tracks display */}
                    {spotifyTopTracks.length > 0 && (
                      <Card className="p-4 bg-muted/20 border-border/40 rounded-2xl mt-4">
                        <div className="space-y-2.5">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {locale === "uk" ? "Ваші Топ Треки" : "Your Top Tracks"}
                          </p>
                          {spotifyTopTracks.map((track) => (
                            <div key={track.id} className="w-full text-left p-3 rounded-xl border bg-card border-border/50 text-foreground hover:bg-muted/40 transition-all flex items-start gap-2.5">
                               {track.album?.images?.[0]?.url ? (
                                 <img src={track.album.images[0].url} alt="album" className="w-10 h-10 rounded-md" />
                               ) : (
                                 <Music className="w-10 h-10 p-2 bg-muted rounded-md text-muted-foreground" />
                               )}
                               <div className="min-w-0 flex-1">
                                 <p className="text-sm font-bold leading-tight truncate">{track.name}</p>
                                 <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                                   {track.artists?.map((a: any) => a.name).join(", ")}
                                 </p>
                               </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* Spotify Player Iframe Embed */}
                  <div className="lg:col-span-2">
                    <Card className="overflow-hidden border border-border/40 rounded-2xl h-[450px] shadow-lg relative bg-black">
                      <iframe
                        src={`https://open.spotify.com/embed/playlist/${selectedPlaylist}`}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="encrypted-media"
                        title="Spotify Player"
                        className="rounded-2xl"
                      ></iframe>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* CUSTOM MUSIC TAB */}
            <TabsContent value="custom-music" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                
                {/* Visualizer & Player controls */}
                <div className="lg:col-span-2 flex flex-col justify-between">
                  <Card className="p-6 bg-gradient-to-br from-card to-card/90 border-border/40 rounded-2xl flex-1 flex flex-col justify-between shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>

                    {/* Canvas visualizer */}
                    <div className="w-full h-24 bg-background/50 rounded-2xl border border-border/30 overflow-hidden flex items-center justify-center relative shadow-inner mb-6">
                      <canvas ref={canvasRef} className="w-full h-full" />
                      {!isPlaying && (
                        <p className="absolute text-xs text-muted-foreground/60 flex items-center gap-1.5 font-medium">
                          <Headphones className="w-4 h-4" />
                          {locale === "uk" ? "Оберіть трек для запуску візуалізатора" : "Select a track to launch visualizer"}
                        </p>
                      )}
                    </div>

                    {/* Track info & Vinyl */}
                    <div className="flex items-center gap-6 mb-6">
                      <motion.div
                        animate={{ rotate: isPlaying ? 360 : 0 }}
                        transition={{ ease: "linear", duration: 6, repeat: Infinity }}
                        className="w-20 h-20 rounded-full bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800 border-4 border-neutral-700/80 flex items-center justify-center shadow-lg relative flex-shrink-0"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-background shadow-inner">
                          <div className="w-1.5 h-1.5 rounded-full bg-background"></div>
                        </div>
                      </motion.div>

                      <div className="min-w-0">
                        <h3 className="font-extrabold text-xl text-foreground truncate leading-snug">
                          {currentTrack?.title || (locale === "uk" ? "Немає активного треку" : "No active track")}
                        </h3>
                        <p className="text-sm text-primary font-bold mt-0.5 truncate">
                          {currentTrack?.artist || (locale === "uk" ? "Оберіть трек нижче" : "Select a track below")}
                        </p>
                      </div>
                    </div>

                    {/* Progress Slider */}
                    <div className="space-y-1.5 mb-4">
                      <input
                        type="range"
                        min="0"
                        max={audioDuration || 100}
                        value={currentTime}
                        onChange={(e) => handleSeek(Number(e.target.value))}
                        className="w-full accent-primary bg-muted rounded-lg appearance-none h-1.5 cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(audioDuration)}</span>
                      </div>
                    </div>

                    {/* Player buttons */}
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        size="icon"
                        onClick={() => togglePlay()}
                        className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
                      >
                        {isPlaying ? <Pause className="w-6 h-6 fill-primary-foreground" /> : <Play className="w-6 h-6 fill-primary-foreground pl-0.5" />}
                      </Button>
                    </div>

                    {/* Volume Slider */}
                    <div className="flex items-center justify-center gap-3 mt-5">
                      <button 
                        onClick={() => {
                          const newVol = volume === 0 ? 1 : 0;
                          setVolume(newVol);
                          if (audioRef.current) audioRef.current.volume = newVol;
                        }} 
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => {
                          const newVol = Number(e.target.value);
                          setVolume(newVol);
                          if (audioRef.current) audioRef.current.volume = newVol;
                        }}
                        className="w-24 accent-primary bg-muted rounded-lg appearance-none h-1.5 cursor-pointer"
                      />
                    </div>
                  </Card>
                </div>

                {/* Track list and Actions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">{locale === "uk" ? "Ваша фонотека" : "Track List"}</h3>
                    <Button
                      size="sm"
                      onClick={() => setIsAddTrackOpen(true)}
                      className="rounded-xl gap-1.5 h-9 bg-primary/10 hover:bg-primary/20 text-primary"
                    >
                      <Plus className="w-4 h-4" />
                      {locale === "uk" ? "Додати трек" : "Add Track"}
                    </Button>
                  </div>

                  <Card className="bg-card border-border/40 p-4 rounded-2xl flex flex-col gap-2 max-h-[360px] overflow-y-auto scrollbar-thin">
                    {customTracks.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground/60 text-sm">
                        <Music className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                        <p>{locale === "uk" ? "У вашому плейлисті немає треків" : "Playlist is empty"}</p>
                      </div>
                    ) : (
                      customTracks.map((track) => {
                        const isCurrent = currentTrack?._id === track._id;
                        return (
                          <div
                            key={track._id}
                            className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                              isCurrent
                                ? "bg-primary/10 border-primary/25 text-primary"
                                : "bg-muted/10 border-border/50 text-foreground hover:bg-muted/40"
                            }`}
                          >
                            <button
                              onClick={() => togglePlay(track)}
                              className="flex items-center gap-3 text-left min-w-0 flex-1"
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isCurrent ? "bg-primary/20 text-primary" : "bg-muted/40 text-muted-foreground"
                              }`}>
                                {isCurrent && isPlaying ? (
                                  <Pause className="w-4 h-4 fill-primary" />
                                ) : (
                                  <Play className={`w-4 h-4 ${isCurrent ? "fill-primary" : ""}`} />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold truncate">{track.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                              </div>
                            </button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTrack(track._id)}
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg w-8 h-8"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        <MobileBottomNav />
      </div>

      {/* ADD TRACK DIALOG */}
      <Dialog open={isAddTrackOpen} onOpenChange={setIsAddTrackOpen}>
        <DialogContent className="bg-card border border-border/50 max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {locale === "uk" ? "Додати свій трек" : "Add Custom Track"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              {locale === "uk" 
                ? "Вставте посилання на прямий MP3 файл або публічний стрім для відтворення."
                : "Provide a direct MP3 stream URL to add a custom song to your fitness workspace."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {locale === "uk" ? "Назва пісні" : "Track Title"}
              </label>
              <Input
                placeholder="E.g. Summer Workout Mix"
                value={newTrackTitle}
                onChange={(e) => setNewTrackTitle(e.target.value)}
                className="bg-background border-border/40 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {locale === "uk" ? "Виконавець" : "Artist / Creator"}
              </label>
              <Input
                placeholder="E.g. Dj Fit"
                value={newTrackArtist}
                onChange={(e) => setNewTrackArtist(e.target.value)}
                className="bg-background border-border/40 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-primary" />
                {locale === "uk" ? "Посилання на MP3 файл" : "Audio stream link (MP3)"}
              </label>
              <Input
                placeholder="https://example.com/song.mp3"
                value={newTrackUrl}
                onChange={(e) => setNewTrackUrl(e.target.value)}
                className="bg-background border-border/40 rounded-xl text-sm"
              />
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-muted"></div>
              <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs">{locale === "uk" ? "або" : "or"}</span>
              <div className="flex-grow border-t border-muted"></div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Music className="w-3.5 h-3.5 text-primary" />
                {locale === "uk" ? "Завантажити локальний файл" : "Upload Local File"}
              </label>
              <Input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="bg-background border-border/40 rounded-xl text-sm cursor-pointer file:cursor-pointer file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:hover:bg-primary/90"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => setIsAddTrackOpen(false)}>
                {locale === "uk" ? "Скасувати" : "Cancel"}
              </Button>
              <Button className="flex-1 rounded-xl" onClick={handleAddTrack}>
                {locale === "uk" ? "Додати" : "Add Track"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <PremiumCheckoutModal open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen} />
    </div>
  );
}
