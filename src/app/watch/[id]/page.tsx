
"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useContentStore } from '@/hooks/use-content';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, Play, FastForward, Rewind, Smartphone, Monitor, Tv, Loader2, RotateCcw, ExternalLink, AlertTriangle, Maximize, Minimize } from 'lucide-react';
import { VideoContent } from '@/lib/types';
import { formatVideoUrl, isPotentiallyBlocked, isVideoFile } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function WatchPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { content, isLoaded } = useContentStore();
  const [video, setVideo] = useState<VideoContent | null>(null);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isLoaded) {
      const found = content.find(c => c.id === id);
      if (!found) {
        router.push('/');
      } else {
        setVideo(found);
        if (found.type !== 'series') {
          setOriginalUrl(found.sourceUrl || "");
          setActiveUrl(formatVideoUrl(found.sourceUrl));
        } else if (found.seasons && found.seasons.length > 0) {
          const firstSeason = found.seasons[0];
          setSelectedSeason(firstSeason.number);
          if (firstSeason.episodes.length > 0) {
            setOriginalUrl(firstSeason.episodes[0].url);
            setActiveUrl(formatVideoUrl(firstSeason.episodes[0].url));
          }
        }
        setIsLoading(false);
      }
    }
  }, [id, content, isLoaded, router]);

  const handleEpisodeSelect = (url: string) => {
    setIsLoading(true);
    setOriginalUrl(url);
    setActiveUrl(formatVideoUrl(url));
    setTimeout(() => setIsLoading(false), 800);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível entrar em tela cheia." });
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleSeek = (direction: 'forward' | 'backward') => {
    if (videoRef.current) {
      const skip = 30;
      if (direction === 'forward') {
        videoRef.current.currentTime += skip;
      } else {
        videoRef.current.currentTime -= skip;
      }
    }
    toast({ title: direction === 'forward' ? "Avançar +30s" : "Retroceder -30s", duration: 1000 });
  };

  const reloadSignal = () => {
    const current = activeUrl;
    setActiveUrl(null);
    setIsLoading(true);
    setTimeout(() => {
      setActiveUrl(current);
      setIsLoading(false);
      toast({ title: "Sinal Otimizado", description: "Recarregando rota P2P Mestre..." });
    }, 500);
  };

  const openExternal = () => {
    if (originalUrl) window.open(originalUrl, '_blank');
  };

  if (!isLoaded || !video) return null;

  const isBlocked = isPotentiallyBlocked(originalUrl || "");
  const isDirectVideo = isVideoFile(originalUrl || "");

  return (
    <div className="min-h-screen bg-black flex flex-col text-white overflow-x-hidden">
      <div className="absolute top-6 left-6 z-[60] group">
        <Button 
          variant="secondary" 
          className="gap-2 backdrop-blur-2xl bg-black/60 hover:bg-primary hover:text-black border border-white/10 rounded-full shadow-2xl transition-all h-14 px-8" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-6 h-6" /> <span className="font-black text-xs uppercase tracking-[0.3em]">Voltar</span>
        </Button>
      </div>

      <div className="flex-1 flex flex-col">
        <div 
          ref={playerContainerRef}
          className={`relative w-full ${isFullscreen ? 'h-screen' : 'aspect-video md:flex-1'} flex flex-col items-center justify-center bg-black overflow-hidden group/player`}
        >
          {activeUrl ? (
            <div className="w-full h-full flex flex-col relative">
              {isLoading && (
                <div className="absolute inset-0 z-30 bg-black flex flex-col items-center justify-center gap-8">
                  <div className="relative">
                    <Loader2 className="w-20 h-20 text-primary animate-spin" />
                    <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse rounded-full" />
                  </div>
                  <p className="text-primary font-black animate-pulse tracking-[0.5em] text-lg uppercase">SINTONIZANDO P2P MESTRE</p>
                </div>
              )}

              {isBlocked && (
                <div className="absolute inset-0 z-20 bg-background/98 flex flex-col items-center justify-center gap-8 p-12 text-center">
                  <AlertTriangle className="w-24 h-24 text-primary animate-bounce" />
                  <h3 className="text-3xl font-black uppercase tracking-tighter">Sinal Protegido Externamente</h3>
                  <Button size="lg" onClick={openExternal} className="bg-primary hover:bg-primary/90 gap-4 h-16 px-12 text-xl font-black shadow-[0_0_40px_rgba(217,128,38,0.5)] rounded-full">
                    <ExternalLink className="w-7 h-7" /> ABRIR PLAYER MESTRE
                  </Button>
                </div>
              )}
              
              <div className="relative flex-1 w-full h-full bg-black">
                {isDirectVideo ? (
                  <video 
                    ref={videoRef}
                    src={originalUrl || ""} 
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    playsInline
                  />
                ) : (
                  <iframe 
                    src={activeUrl}
                    className="w-full h-full border-none"
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope; clipboard-write; display-capture"
                    sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation allow-presentation"
                    allowFullScreen
                  />
                )}
              </div>
              
              <div className="bg-gradient-to-t from-black via-black/95 to-transparent p-6 flex flex-col items-center gap-6 border-t border-white/5 opacity-0 group-hover/player:opacity-100 transition-opacity duration-300">
                <div className="flex items-center justify-center gap-12">
                  <Button variant="ghost" size="icon" className="w-16 h-16 rounded-full bg-white/5 hover:bg-primary hover:text-black" onClick={() => handleSeek('backward')}>
                    <Rewind className="w-10 h-10 fill-current" />
                  </Button>
                  
                  <div className="flex gap-6">
                    <Button variant="outline" size="icon" className="w-14 h-14 rounded-full border-primary/40 text-primary hover:bg-primary hover:text-black" onClick={reloadSignal}>
                      <RotateCcw className="w-6 h-6" />
                    </Button>
                    <Button variant="secondary" size="icon" className="w-14 h-14 rounded-full bg-primary text-black hover:bg-primary/80" onClick={toggleFullscreen}>
                      {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                    </Button>
                  </div>

                  <Button variant="ghost" size="icon" className="w-16 h-16 rounded-full bg-white/5 hover:bg-primary hover:text-black" onClick={() => handleSeek('forward')}>
                    <FastForward className="w-10 h-10 fill-current" />
                  </Button>
                </div>

                <div className="flex items-center gap-8 text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-40">
                   <div className="flex items-center gap-2"><Smartphone className="w-4 h-4" /> MOBILE</div>
                   <div className="flex items-center gap-2"><Monitor className="w-4 h-4" /> DESKTOP</div>
                   <div className="flex items-center gap-2"><Tv className="w-4 h-4" /> SMART TV</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-10">
              <Loader2 className="w-24 h-24 text-primary/20 animate-spin" />
              <p className="text-muted-foreground animate-pulse font-black tracking-[0.7em] text-sm uppercase">SINTONIZANDO ROTA P2P MESTRE...</p>
            </div>
          )}
        </div>

        <div className="bg-background p-10 space-y-12 max-w-7xl mx-auto w-full">
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-primary font-black text-[10px] uppercase tracking-[0.5em]">
              <span className="bg-primary/10 px-6 py-2 rounded-full border border-primary/30">{video.type}</span>
              <ChevronRight className="w-4 h-4 text-white/10" />
              <span className="bg-white/5 px-6 py-2 rounded-full text-white border border-white/10">{video.category}</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black font-headline tracking-tighter uppercase leading-tight">{video.title}</h1>
            <p className="text-muted-foreground text-xl leading-relaxed max-w-4xl font-medium opacity-80">{video.description}</p>
          </div>

          {video.type === 'series' && video.seasons && video.seasons.length > 0 && (
            <div className="space-y-8 pt-8">
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-4">
                {video.seasons.map(s => (
                  <button 
                    key={s.id} 
                    className={`text-xs font-black px-8 py-4 rounded-full transition-all shrink-0 uppercase tracking-[0.2em] border-2 ${selectedSeason === s.number ? 'bg-primary text-black border-primary' : 'bg-card text-muted-foreground border-white/5'}`} 
                    onClick={() => setSelectedSeason(s.number)}
                  >
                    TEMPORADA {s.number}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {video.seasons.find(s => s.number === selectedSeason)?.episodes.map(ep => {
                  const isCurrent = originalUrl === ep.url;
                  return (
                    <button 
                      key={ep.id} 
                      onClick={() => handleEpisodeSelect(ep.url)} 
                      className={`flex items-center gap-6 p-6 rounded-3xl border-2 transition-all text-left ${isCurrent ? 'bg-primary/10 border-primary' : 'bg-card border-white/5 hover:border-primary/40'}`}
                    >
                      <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${isCurrent ? 'bg-primary text-black' : 'bg-primary/10 text-primary'}`}>
                        <Play className="w-6 h-6 fill-current" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[10px] uppercase tracking-[0.3em] text-primary">EPISÓDIO {ep.number}</p>
                        <p className={`text-sm font-black truncate ${isCurrent ? 'text-white' : 'text-muted-foreground'}`}>{ep.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
