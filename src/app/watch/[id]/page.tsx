"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useContentStore } from '@/hooks/use-content';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, Play, FastForward, Rewind, Maximize, Smartphone, Monitor, Tv, Loader2 } from 'lucide-react';
import { VideoContent, Episode } from '@/lib/types';
import { formatVideoUrl } from '@/lib/utils';

export default function WatchPage() {
  const { id } = useParams();
  const router = useRouter();
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
    // Simula tempo de carregamento para efeito visual de performance
    setTimeout(() => setIsLoading(false), 800);
  };

  if (!isLoaded || !video) return null;

  return (
    <div className="min-h-screen bg-black flex flex-col text-white">
      {/* Header Overlay */}
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
        {/* Optimized Player Container */}
        <div className="relative w-full flex-1 flex flex-col items-center justify-center bg-black overflow-hidden group">
          {activeUrl ? (
            <div className="w-full h-full flex flex-col relative">
              {isLoading && (
                <div className="absolute inset-0 z-10 bg-black/80 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-primary font-bold animate-pulse">Sintonizando sinal ultra-rápido...</p>
                </div>
              )}
              
              <div className="relative flex-1 w-full bg-black">
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
              
              {/* Custom Navigation Controls */}
              <div className="bg-gradient-to-t from-black via-black/90 to-transparent p-6 flex flex-col items-center gap-4 border-t border-white/5">
                <div className="flex items-center justify-center gap-8">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-14 h-14 rounded-full bg-white/5 hover:bg-white/20 text-primary transition-all active:scale-95"
                    onClick={() => {
                      if (iframeRef.current) {
                        // Tenta retroceder 10s se for um player compatível
                        iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"seekTo","args":[0,true]}', '*');
                      }
                    }}
                  >
                    <Rewind className="w-8 h-8 fill-current" />
                  </Button>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Executando Sinal</span>
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#D98026]" />
                  </div>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-14 h-14 rounded-full bg-white/5 hover:bg-white/20 text-primary transition-all active:scale-95"
                  >
                    <FastForward className="w-8 h-8 fill-current" />
                  </Button>
                </div>

                <div className="flex items-center gap-6 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                   <div className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> Mobile</div>
                   <div className="flex items-center gap-1"><Monitor className="w-3 h-3" /> PC</div>
                   <div className="flex items-center gap-1"><Tv className="w-3 h-3" /> Smart TV</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-20 h-20 text-primary/20 animate-spin" />
              <p className="text-muted-foreground animate-pulse font-bold">Aguardando sinal...</p>
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="bg-background/95 p-6 md:p-12 space-y-8 max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.2em]">
                <span className="bg-primary/10 px-2 py-0.5 rounded">{video.type}</span>
                <ChevronRight className="w-4 h-4 text-white/40" />
                <span className="bg-white/5 px-2 py-0.5 rounded text-white">{video.category}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter">{video.title}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">{video.description}</p>
            </div>
          </div>

          {video.type === 'series' && video.seasons && video.seasons.length > 0 && (
            <div className="space-y-8 pt-8 border-t border-white/10">
              <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
                {video.seasons.map(s => (
                  <button 
                    key={s.id} 
                    className={`text-xl font-black px-6 py-2 rounded-full transition-all shrink-0 ${selectedSeason === s.number ? 'bg-primary text-black' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`} 
                    onClick={() => setSelectedSeason(s.number)}
                  >
                    TEMPORADA {s.number}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {video.seasons.find(s => s.number === selectedSeason)?.episodes.map(ep => {
                  const isCurrent = activeUrl === formatVideoUrl(ep.url);
                  return (
                    <button 
                      key={ep.id} 
                      onClick={() => handleEpisodeSelect(ep.url)} 
                      className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left group ${isCurrent ? 'bg-primary/20 border-primary ring-1 ring-primary/50' : 'bg-card border-white/5 hover:border-primary/40'}`}
                    >
                      <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${isCurrent ? 'bg-primary text-black' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-black'}`}>
                        <Play className="w-6 h-6 fill-current" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm truncate uppercase tracking-tight">Episódio {ep.number}</p>
                        <p className={`text-xs truncate ${isCurrent ? 'text-white' : 'text-muted-foreground'}`}>{ep.title}</p>
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
