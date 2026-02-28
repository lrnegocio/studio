
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
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
      toast({ title: "Sinal Recarregado", description: "Otimizando buffer P2P Mestre..." });
    }, 500);
  };

  const openExternal = () => {
    if (originalUrl) {
      window.open(originalUrl, '_blank');
    }
  };

  if (!isLoaded || !video) return null;

  const isBlocked = isPotentiallyBlocked(originalUrl || "");

  return (
    <div className="min-h-screen bg-black flex flex-col text-white overflow-x-hidden">
      {/* Botão Voltar Ajustado para não sobrepor volume */}
      <div className="absolute top-6 left-6 z-50">
        <Button 
          variant="secondary" 
          className="gap-2 backdrop-blur-xl bg-white/10 hover:bg-primary hover:text-black border-none rounded-full shadow-2xl transition-all h-12 px-6" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5" /> <span className="hidden md:inline font-bold">Voltar</span>
        </Button>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Player Container com Ref para Fullscreen */}
        <div 
          ref={playerContainerRef}
          className={`relative w-full ${isFullscreen ? 'h-screen' : 'aspect-video md:flex-1'} flex flex-col items-center justify-center bg-black overflow-hidden`}
        >
          {activeUrl ? (
            <div className="w-full h-full flex flex-col relative">
              {isLoading && (
                <div className="absolute inset-0 z-30 bg-black flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <Loader2 className="w-16 h-16 text-primary animate-spin" />
                    <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse rounded-full" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-primary font-black animate-pulse tracking-[0.3em] text-sm uppercase">
                      SINTONIZANDO P2P MESTRE
                    </p>
                    <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Ultra Speed Delivery v2.0</p>
                  </div>
                </div>
              )}

              {/* Aviso de bloqueio apenas para domínios impossíveis de embutir */}
              {isBlocked && (
                <div className="absolute inset-0 z-20 bg-background/95 flex flex-col items-center justify-center gap-6 p-8 text-center animate-fade-in">
                  <AlertTriangle className="w-20 h-20 text-primary" />
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Sinal com Proteção Externa</h3>
                    <p className="text-muted-foreground text-sm max-w-lg leading-relaxed">
                      Este canal/filme utiliza um player seguro que impede a reprodução interna para garantir a qualidade original. Assista diretamente no player oficial abaixo.
                    </p>
                  </div>
                  <Button size="lg" onClick={openExternal} className="bg-primary hover:bg-primary/90 gap-3 h-14 px-8 text-lg font-black shadow-[0_0_30px_rgba(217,128,38,0.4)]">
                    <ExternalLink className="w-6 h-6" /> ABRIR PLAYER MESTRE
                  </Button>
                </div>
              )}
              
              <div className="relative flex-1 w-full h-full bg-black">
                <iframe 
                  ref={iframeRef}
                  src={activeUrl}
                  className="w-full h-full border-none"
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope; clipboard-write"
                  sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation allow-presentation"
                  allowFullScreen
                />
              </div>
              
              {/* Navigation Controls */}
              {!isFullscreen && (
                <div className="bg-gradient-to-t from-black via-black/90 to-transparent p-6 flex flex-col items-center gap-6 border-t border-white/5">
                  <div className="flex flex-wrap items-center justify-center gap-6 md:gap-16">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-16 h-16 rounded-full bg-white/5 hover:bg-primary hover:text-black transition-all active:scale-90"
                      onClick={() => handleSeek('backward')}
                    >
                      <Rewind className="w-10 h-10 fill-current" />
                    </Button>
                    
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex gap-4">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="w-12 h-12 rounded-full border-primary/40 text-primary hover:bg-primary/20"
                          onClick={reloadSignal}
                        >
                          <RotateCcw className="w-6 h-6" />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="w-12 h-12 rounded-full bg-primary text-black hover:bg-primary/80"
                          onClick={toggleFullscreen}
                          title="Tela Cheia"
                        >
                          <Maximize className="w-6 h-6" />
                        </Button>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">SINAL P2P ATIVO</span>
                        <div className="flex gap-1 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-75" />
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-150" />
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-16 h-16 rounded-full bg-white/5 hover:bg-primary hover:text-black transition-all active:scale-90"
                      onClick={() => handleSeek('forward')}
                    >
                      <FastForward className="w-10 h-10 fill-current" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-8 text-[10px] text-muted-foreground font-black uppercase tracking-[0.25em]">
                     <div className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-primary" /> MOBILE</div>
                     <div className="flex items-center gap-2"><Monitor className="w-4 h-4 text-primary" /> DESKTOP</div>
                     <div className="flex items-center gap-2"><Tv className="w-4 h-4 text-primary" /> SMART TV</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <Loader2 className="w-24 h-24 text-primary/10 animate-spin" />
              <p className="text-muted-foreground animate-pulse font-black tracking-[0.5em] text-xs">BUSCANDO ROTA P2P...</p>
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="bg-background p-6 md:p-12 space-y-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 border-b border-white/5 pb-10">
            <div className="space-y-6 flex-1">
              <div className="flex items-center gap-4 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
                <span className="bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">{video.type}</span>
                <ChevronRight className="w-4 h-4 text-white/20" />
                <span className="bg-white/5 px-4 py-1.5 rounded-full text-white border border-white/10">{video.category}</span>
              </div>
              <h1 className="text-4xl md:text-7xl font-black font-headline tracking-tighter uppercase leading-none">{video.title}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-4xl font-medium">{video.description}</p>
            </div>
          </div>

          {video.type === 'series' && video.seasons && video.seasons.length > 0 && (
            <div className="space-y-10 pt-6">
              <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-6">
                {video.seasons.map(s => (
                  <button 
                    key={s.id} 
                    className={`text-xs font-black px-8 py-3.5 rounded-full transition-all shrink-0 uppercase tracking-widest border ${selectedSeason === s.number ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(217,128,38,0.3)]' : 'bg-card text-muted-foreground border-white/5 hover:border-primary/50'}`} 
                    onClick={() => setSelectedSeason(s.number)}
                  >
                    TEMPORADA {s.number}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {video.seasons.find(s => s.number === selectedSeason)?.episodes.map(ep => {
                  const isCurrent = originalUrl === ep.url;
                  return (
                    <button 
                      key={ep.id} 
                      onClick={() => handleEpisodeSelect(ep.url)} 
                      className={`flex items-center gap-5 p-5 rounded-2xl border transition-all text-left group relative overflow-hidden ${isCurrent ? 'bg-primary/10 border-primary ring-2 ring-primary/20' : 'bg-card border-white/5 hover:border-primary/40 hover:scale-[1.02]'}`}
                    >
                      <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all shadow-lg ${isCurrent ? 'bg-primary text-black' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-black'}`}>
                        <Play className="w-6 h-6 fill-current" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[10px] uppercase tracking-[0.2em] text-primary mb-1">EPISÓDIO {ep.number}</p>
                        <p className={`text-sm font-bold truncate ${isCurrent ? 'text-white' : 'text-muted-foreground'}`}>{ep.title}</p>
                      </div>
                      {isCurrent && <div className="absolute top-0 right-0 w-1 h-full bg-primary" />}
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
