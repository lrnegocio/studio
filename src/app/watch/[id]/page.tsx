
"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useContentStore } from '@/hooks/use-content';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, Play, FastForward, Rewind, Smartphone, Monitor, Tv, Loader2, RotateCcw, ExternalLink, AlertTriangle, Maximize, Minimize } from 'lucide-react';
import { VideoContent } from '@/lib/types';
import { formatVideoUrl, isPotentiallyBlocked } from '@/lib/utils';
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

  return (
    <div className="min-h-screen bg-black flex flex-col text-white overflow-x-hidden">
      {/* Botão Voltar - Posição Ajustada */}
      <div className="absolute top-4 left-4 z-[60] group">
        <Button 
          variant="secondary" 
          className="gap-2 backdrop-blur-2xl bg-black/60 hover:bg-primary hover:text-black border border-white/10 rounded-full shadow-2xl transition-all h-12 px-6" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5" /> <span className="font-bold text-xs uppercase tracking-widest">Voltar</span>
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
                  <div className="text-center space-y-3">
                    <p className="text-primary font-black animate-pulse tracking-[0.5em] text-lg uppercase">
                      SINTONIZANDO P2P MESTRE
                    </p>
                    <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest opacity-50">CONEXÃO ULTRA SPEED V3.0</p>
                  </div>
                </div>
              )}

              {isBlocked && (
                <div className="absolute inset-0 z-20 bg-background/98 flex flex-col items-center justify-center gap-8 p-12 text-center">
                  <AlertTriangle className="w-24 h-24 text-primary animate-bounce" />
                  <div className="space-y-6">
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Sinal Protegido Externamente</h3>
                    <p className="text-muted-foreground text-lg max-w-xl leading-relaxed font-medium">
                      Este canal utiliza criptografia oficial que impede a incorporação. Assista no Player Mestre para garantir 100% de qualidade sem travamentos.
                    </p>
                  </div>
                  <Button size="lg" onClick={openExternal} className="bg-primary hover:bg-primary/90 gap-4 h-16 px-12 text-xl font-black shadow-[0_0_40px_rgba(217,128,38,0.5)] rounded-full">
                    <ExternalLink className="w-7 h-7" /> ABRIR PLAYER MESTRE
                  </Button>
                </div>
              )}
              
              <div className="relative flex-1 w-full h-full bg-black">
                <iframe 
                  src={activeUrl}
                  className="w-full h-full border-none"
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope; clipboard-write; display-capture"
                  sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation allow-presentation"
                  allowFullScreen
                />
              </div>
              
              {/* Controles do Player Customizados */}
              <div className="bg-gradient-to-t from-black via-black/95 to-transparent p-8 flex flex-col items-center gap-8 border-t border-white/5 opacity-0 group-hover/player:opacity-100 transition-opacity duration-300">
                <div className="flex items-center justify-center gap-12 md:gap-24">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-20 h-20 rounded-full bg-white/5 hover:bg-primary hover:text-black transition-all active:scale-90"
                    onClick={() => handleSeek('backward')}
                  >
                    <Rewind className="w-12 h-12 fill-current" />
                  </Button>
                  
                  <div className="flex flex-col items-center gap-6">
                    <div className="flex gap-6">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="w-14 h-14 rounded-full border-primary/40 text-primary hover:bg-primary hover:text-black transition-all"
                        onClick={reloadSignal}
                        title="Otimizar Sinal"
                      >
                        <RotateCcw className="w-7 h-7" />
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="w-14 h-14 rounded-full bg-primary text-black hover:bg-primary/80 transition-all shadow-[0_0_20px_rgba(217,128,38,0.3)]"
                        onClick={toggleFullscreen}
                        title="Maximizar Tela"
                      >
                        {isFullscreen ? <Minimize className="w-7 h-7" /> : <Maximize className="w-7 h-7" />}
                      </Button>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">STATUS: P2P ATIVO</span>
                      <div className="flex gap-1.5 mt-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                        <div className="w-2 h-2 rounded-full bg-primary animate-ping delay-150" />
                        <div className="w-2 h-2 rounded-full bg-primary animate-ping delay-300" />
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-20 h-20 rounded-full bg-white/5 hover:bg-primary hover:text-black transition-all active:scale-90"
                    onClick={() => handleSeek('forward')}
                  >
                    <FastForward className="w-12 h-12 fill-current" />
                  </Button>
                </div>

                <div className="flex items-center gap-10 text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-40">
                   <div className="flex items-center gap-2"><Smartphone className="w-4 h-4" /> MOBILE</div>
                   <div className="flex items-center gap-2"><Monitor className="w-4 h-4" /> DESKTOP</div>
                   <div className="flex items-center gap-2"><Tv className="w-4 h-4" /> SMART TV</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              <Loader2 className="w-24 h-24 text-primary/20 animate-spin" />
              <p className="text-muted-foreground animate-pulse font-black tracking-[0.6em] text-sm uppercase">BUSCANDO ROTA P2P MESTRE...</p>
            </div>
          )}
        </div>

        <div className="bg-background p-8 md:p-16 space-y-12 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-12 border-b border-white/5 pb-12">
            <div className="space-y-8 flex-1">
              <div className="flex items-center gap-4 text-primary font-black text-[10px] uppercase tracking-[0.4em]">
                <span className="bg-primary/10 px-6 py-2 rounded-full border border-primary/30">{video.type}</span>
                <ChevronRight className="w-5 h-5 text-white/10" />
                <span className="bg-white/5 px-6 py-2 rounded-full text-white border border-white/10">{video.category}</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black font-headline tracking-tighter uppercase leading-[0.9]">{video.title}</h1>
              <p className="text-muted-foreground text-xl leading-relaxed max-w-4xl font-medium opacity-80">{video.description}</p>
            </div>
          </div>

          {video.type === 'series' && video.seasons && video.seasons.length > 0 && (
            <div className="space-y-12">
              <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-6 scroll-smooth">
                {video.seasons.map(s => (
                  <button 
                    key={s.id} 
                    className={`text-xs font-black px-10 py-4 rounded-full transition-all shrink-0 uppercase tracking-widest border-2 ${selectedSeason === s.number ? 'bg-primary text-black border-primary shadow-[0_0_25px_rgba(217,128,38,0.4)]' : 'bg-card text-muted-foreground border-white/5 hover:border-primary/50'}`} 
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
                      className={`flex items-center gap-6 p-6 rounded-3xl border-2 transition-all text-left group relative overflow-hidden ${isCurrent ? 'bg-primary/10 border-primary ring-4 ring-primary/10' : 'bg-card border-white/5 hover:border-primary/40 hover:scale-[1.03] shadow-lg'}`}
                    >
                      <div className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all shadow-xl ${isCurrent ? 'bg-primary text-black' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-black'}`}>
                        <Play className="w-7 h-7 fill-current" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[10px] uppercase tracking-[0.3em] text-primary mb-1.5">EPISÓDIO {ep.number}</p>
                        <p className={`text-sm font-black truncate ${isCurrent ? 'text-white' : 'text-muted-foreground'}`}>{ep.title}</p>
                      </div>
                      {isCurrent && <div className="absolute top-0 right-0 w-1.5 h-full bg-primary" />}
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
