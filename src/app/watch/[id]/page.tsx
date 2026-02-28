
"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useContentStore } from '@/hooks/use-content';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, Play, FastForward, Rewind, Smartphone, Monitor, Tv, Loader2, RotateCcw } from 'lucide-react';
import { VideoContent } from '@/lib/types';
import { formatVideoUrl } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function WatchPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { content, isLoaded } = useContentStore();
  const [video, setVideo] = useState<VideoContent | null>(null);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isLoaded) {
      const found = content.find(c => c.id === id);
      if (!found) {
        router.push('/');
      } else {
        setVideo(found);
        if (found.type !== 'series') {
          setActiveUrl(formatVideoUrl(found.sourceUrl));
        } else if (found.seasons && found.seasons.length > 0) {
          const firstSeason = found.seasons[0];
          setSelectedSeason(firstSeason.number);
          if (firstSeason.episodes.length > 0) {
            setActiveUrl(formatVideoUrl(firstSeason.episodes[0].url));
          }
        }
        setIsLoading(false);
      }
    }
  }, [id, content, isLoaded, router]);

  const handleEpisodeSelect = (url: string) => {
    setIsLoading(true);
    setActiveUrl(formatVideoUrl(url));
    setTimeout(() => setIsLoading(false), 800);
  };

  const handleSeek = (direction: 'forward' | 'backward') => {
    if (!iframeRef.current) return;
    
    // Most iframes block direct control for security (CORS), 
    // but we can try common postMessage events for players like YouTube
    const command = direction === 'forward' ? 30 : -30;
    try {
      iframeRef.current.contentWindow?.postMessage(JSON.stringify({
        event: 'command',
        func: 'seekTo',
        args: [command, true]
      }), '*');
      
      toast({ title: direction === 'forward' ? "Avançar +30s" : "Retroceder -30s", duration: 1000 });
    } catch (e) {
      console.log("Player does not support direct seeking.");
    }
  };

  const reloadSignal = () => {
    const current = activeUrl;
    setActiveUrl(null);
    setIsLoading(true);
    setTimeout(() => {
      setActiveUrl(current);
      setIsLoading(false);
      toast({ title: "Sinal Recarregado", description: "Otimizando buffer P2P..." });
    }, 500);
  };

  if (!isLoaded || !video) return null;

  return (
    <div className="min-h-screen bg-black flex flex-col text-white overflow-x-hidden">
      <div className="absolute top-4 left-4 z-50 flex items-center gap-4">
        <Button 
          variant="secondary" 
          className="gap-2 backdrop-blur-md bg-white/10 hover:bg-white/20 border-none rounded-full" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Player Container - Fill Mode */}
        <div className="relative w-full aspect-video md:flex-1 flex flex-col items-center justify-center bg-black group">
          {activeUrl ? (
            <div className="w-full h-full flex flex-col relative">
              {isLoading && (
                <div className="absolute inset-0 z-10 bg-black/90 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-primary font-bold animate-pulse tracking-widest text-xs uppercase">Sintonizando Ultra Speed...</p>
                </div>
              )}
              
              <div className="relative flex-1 w-full h-full bg-black">
                <iframe 
                  ref={iframeRef}
                  src={activeUrl}
                  className="w-full h-full border-none shadow-2xl"
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope"
                  allowFullScreen
                  loading="eager"
                  title={video.title}
                />
              </div>
              
              {/* Navigation Controls */}
              <div className="bg-gradient-to-t from-black via-black/90 to-transparent p-6 flex flex-col items-center gap-6 border-t border-white/5">
                <div className="flex items-center justify-center gap-12">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 text-primary transition-transform active:scale-90"
                    onClick={() => handleSeek('backward')}
                  >
                    <Rewind className="w-10 h-10 fill-current" />
                  </Button>
                  
                  <div className="flex flex-col items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="w-12 h-12 rounded-full border-primary/20 text-primary hover:bg-primary/20"
                      onClick={reloadSignal}
                    >
                      <RotateCcw className="w-6 h-6" />
                    </Button>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">Sinal P2P Ativo</span>
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_15px_#D98026] mt-1" />
                    </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 text-primary transition-transform active:scale-90"
                    onClick={() => handleSeek('forward')}
                  >
                    <FastForward className="w-10 h-10 fill-current" />
                  </Button>
                </div>

                <div className="flex items-center gap-8 text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">
                   <div className="flex items-center gap-2"><Smartphone className="w-3 h-3 text-primary" /> Mobile</div>
                   <div className="flex items-center gap-2"><Monitor className="w-3 h-3 text-primary" /> Desktop</div>
                   <div className="flex items-center gap-2"><Tv className="w-3 h-3 text-primary" /> Smart TV</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-20 h-20 text-primary/20 animate-spin" />
              <p className="text-muted-foreground animate-pulse font-bold tracking-widest">AGUARDANDO SINAL EXTERNO...</p>
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="bg-background p-6 md:p-12 space-y-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-white/5 pb-8">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-widest">
                <span className="bg-primary/10 px-3 py-1 rounded-full">{video.type}</span>
                <ChevronRight className="w-4 h-4 text-white/20" />
                <span className="bg-white/5 px-3 py-1 rounded-full text-white">{video.category}</span>
              </div>
              <h1 className="text-4xl md:text-7xl font-black font-headline tracking-tighter uppercase">{video.title}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-4xl">{video.description}</p>
            </div>
          </div>

          {video.type === 'series' && video.seasons && video.seasons.length > 0 && (
            <div className="space-y-8 pt-4">
              <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-4">
                {video.seasons.map(s => (
                  <button 
                    key={s.id} 
                    className={`text-lg font-black px-8 py-3 rounded-full transition-all shrink-0 uppercase tracking-tighter ${selectedSeason === s.number ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'bg-card text-muted-foreground hover:bg-white/10'}`} 
                    onClick={() => setSelectedSeason(s.number)}
                  >
                    TEMPORADA {s.number}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {video.seasons.find(s => s.number === selectedSeason)?.episodes.map(ep => {
                  const isCurrent = activeUrl === formatVideoUrl(ep.url);
                  return (
                    <button 
                      key={ep.id} 
                      onClick={() => handleEpisodeSelect(ep.url)} 
                      className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left group ${isCurrent ? 'bg-primary/20 border-primary ring-2 ring-primary/20' : 'bg-card border-white/5 hover:border-primary/40'}`}
                    >
                      <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${isCurrent ? 'bg-primary text-black' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-black group-hover:scale-110'}`}>
                        <Play className="w-6 h-6 fill-current" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[10px] uppercase tracking-widest text-primary mb-1">EPISÓDIO {ep.number}</p>
                        <p className={`text-sm font-bold truncate ${isCurrent ? 'text-white' : 'text-muted-foreground'}`}>{ep.title}</p>
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
