
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { useContentStore } from '@/hooks/use-content';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Info, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { content, isLoaded } = useContentStore();
  const [featured, setFeatured] = useState<any>(null);

  useEffect(() => {
    const session = localStorage.getItem('leo_tv_session');
    if (!session) router.push('/login');
    
    if (content.length > 0) {
      setFeatured(content.find(c => c.isFeatured) || content[0]);
    }
  }, [content, router]);

  if (!isLoaded) return null;

  const movies = content.filter(c => c.type === 'movie');
  const series = content.filter(c => c.type === 'series');
  const channels = content.filter(c => c.type === 'channel');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      {featured && (
        <section className="relative h-[70vh] w-full overflow-hidden">
          <div className="absolute inset-0">
            <Image 
              src={featured.bannerUrl || featured.posterUrl} 
              alt={featured.title}
              fill
              className="object-cover"
              priority
              data-ai-hint="hero banner"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
          </div>
          
          <div className="relative h-full container mx-auto flex flex-col justify-end pb-12 px-4 md:px-8 space-y-6">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-primary font-bold tracking-widest text-xs uppercase">Destaque de Hoje</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter max-w-2xl">{featured.title}</h2>
            <p className="text-lg text-muted-foreground max-w-xl line-clamp-3">{featured.description}</p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href={`/watch/${featured.id}`}>
                <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2 h-14 px-8 text-lg font-bold">
                  <Play className="fill-current" /> Assistir Agora
                </Button>
              </Link>
              <Button size="lg" variant="secondary" className="gap-2 h-14 px-8 text-lg">
                <Info /> Mais Detalhes
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Content Rows */}
      <main className="container mx-auto py-12 px-4 md:px-8 space-y-12">
        {channels.length > 0 && (
          <ContentRow title="Canais Ao Vivo" items={channels} type="channel" />
        )}
        
        {movies.length > 0 && (
          <ContentRow title="Filmes de Sucesso" items={movies} type="movie" />
        )}

        {series.length > 0 && (
          <ContentRow title="Séries Imperdíveis" items={series} type="series" />
        )}
      </main>

      <footer className="border-t border-border py-12 text-center text-muted-foreground">
        <p>&copy; 2024 Léo Tv & Stream. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

function ContentRow({ title, items, type }: { title: string, items: any[], type: string }) {
  return (
    <section className="space-y-4">
      <h3 className="text-2xl font-bold font-headline">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item) => (
          <Link key={item.id} href={`/watch/${item.id}`} className="group">
            <Card className="bg-card border-none overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:ring-2 ring-primary">
              <CardContent className="p-0 aspect-[2/3] relative">
                <Image 
                  src={item.posterUrl} 
                  alt={item.title}
                  fill
                  className="object-cover"
                  data-ai-hint="content poster"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-12 h-12 text-primary fill-primary" />
                </div>
              </CardContent>
            </Card>
            <p className="mt-2 font-medium truncate group-hover:text-primary transition-colors">{item.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
