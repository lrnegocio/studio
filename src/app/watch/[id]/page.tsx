
"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useContentStore } from '@/hooks/use-content';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, Play } from 'lucide-react';
import { VideoContent, Episode } from '@/lib/types';

export default function WatchPage() {
  const { id } = useParams();
  const router = useRouter();
  const { content, isLoaded } = useContentStore();
  const [video, setVideo] = useState<VideoContent | null>(null);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);

  useEffect(() => {
    if (isLoaded) {
      const found = content.find(c => c.id === id);
      if (!found) router.push('/');
      else {
        setVideo(found);
        if (found.type !== 'series') setActiveUrl(found.sourceUrl || null);
        else if (found.seasons && found.seasons[0].episodes.length > 0) {
          setActiveUrl(found.seasons[0].episodes[0].url);
        }
      }
    }
  }, [id, content, isLoaded, router]);

  if (!isLoaded || !video) return null;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="absolute top-4 left-4 z-50">
        <Button variant="secondary" className="gap-2 backdrop-blur-md bg-white/10" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
      </div>

      <div className="flex-1 flex flex-col">
        {activeUrl ? (
          <div className="w-full aspect-video md:flex-1 bg-black">
            <iframe 
              src={activeUrl}
              className="w-full h-full border-none"
              allowFullScreen
              allow="autoplay; encrypted-media"
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Vídeo não disponível.</p>
          </div>
        )}

        <div className="bg-background/95 backdrop-blur-sm p-6 md:p-12 space-y-8 max-w-6xl mx-auto w-full">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
              <span>{video.type === 'movie' ? 'Filme' : video.type === 'series' ? 'Série' : 'Canal'}</span>
              <ChevronRight className="w-4 h-4" />
              <span>{video.genre}</span>
            </div>
            <h1 className="text-4xl font-bold font-headline">{video.title}</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">{video.description}</p>
          </div>

          {video.type === 'series' && video.seasons && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-border pb-4">
                {video.seasons.map(s => (
                  <button 
                    key={s.number}
                    className={`text-lg font-bold pb-4 -mb-4 transition-colors ${selectedSeason === s.number ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                    onClick={() => setSelectedSeason(s.number)}
                  >
                    Temporada {s.number}
                  </button>
                ))}
              </div>
              
              <div className="grid gap-4">
                {video.seasons.find(s => s.number === selectedSeason)?.episodes.map(ep => (
                  <button 
                    key={ep.id}
                    onClick={() => setActiveUrl(ep.url)}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${activeUrl === ep.episodes ? 'bg-primary/10 border-primary' : 'bg-card hover:bg-muted'} border border-transparent`}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Play className={`w-5 h-5 ${activeUrl === ep.url ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold">Episódio {ep.number}: {ep.title}</p>
                      {ep.duration && <p className="text-sm text-muted-foreground">{ep.duration}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
