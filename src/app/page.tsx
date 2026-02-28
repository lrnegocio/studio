
"use client";
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { useContentStore } from '@/hooks/use-content';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Play, Star, Clapperboard, Search, Mic, MicOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { content, isLoaded } = useContentStore();
  const [featured, setFeatured] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('leo_tv_session');
    if (!session) router.push('/login');
    
    if (content.length > 0) {
      setFeatured(content.find(c => c.isFeatured) || content[0]);
    }
  }, [content, router]);

  const startVoiceSearch = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: "destructive", title: "Erro", description: "Busca por voz não suportada neste navegador." });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
    };
    recognition.start();
  }, [toast]);

  if (!isLoaded) return null;

  // Filter content based on search
  const filteredContent = content.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(filteredContent.map(c => c.category))).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Search Bar Section */}
      <div className="container mx-auto px-4 md:px-8 pt-8">
        <div className="relative max-w-2xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar canal, filme ou categoria..." 
              className="pl-10 h-12 bg-card border-primary/20 focus:border-primary text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant={isListening ? "destructive" : "secondary"} 
            size="icon" 
            className="h-12 w-12 rounded-full"
            onClick={startVoiceSearch}
          >
            {isListening ? <MicOff className="animate-pulse" /> : <Mic />}
          </Button>
        </div>
      </div>

      {/* Hero Section (only if no search) */}
      {!searchTerm && featured && (
        <section className="relative h-[60vh] w-full overflow-hidden mt-8">
          <div className="absolute inset-0">
            <Image 
              src={featured.posterUrl} 
              alt={featured.title}
              fill
              className="object-cover opacity-40 blur-sm scale-110"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          </div>
          
          <div className="relative h-full container mx-auto flex flex-col justify-end pb-12 px-4 md:px-8 space-y-6">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-primary font-bold tracking-widest text-xs uppercase">Destaque da Semana</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter max-w-2xl">{featured.title}</h2>
            <p className="text-lg text-muted-foreground max-w-xl line-clamp-3">{featured.description}</p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href={`/watch/${featured.id}`}>
                <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2 h-14 px-8 text-lg font-bold">
                  <Play className="fill-current" /> Assistir Agora
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Dynamic Content Rows by Category */}
      <main className="container mx-auto py-12 px-4 md:px-8 space-y-12">
        {categories.length > 0 ? (
          categories.map((category) => (
            <ContentRow 
              key={category} 
              title={category} 
              items={filteredContent.filter(c => c.category === category)} 
            />
          ))
        ) : (
          <section className="h-[40vh] flex flex-col items-center justify-center text-center px-4">
            <Clapperboard className="w-16 h-16 text-primary mb-4 opacity-20" />
            <h2 className="text-3xl font-bold font-headline">Nenhum resultado encontrado</h2>
            <p className="text-muted-foreground mt-2">Tente buscar por outro nome ou categoria.</p>
          </section>
        )}
      </main>

      <footer className="border-t border-border py-12 text-center text-muted-foreground">
        <p>&copy; 2024 Léo Tv & Stream. Ultra Speed P2P Delivery.</p>
      </footer>
    </div>
  );
}

function ContentRow({ title, items }: { title: string, items: any[] }) {
  return (
    <section className="space-y-4">
      <h3 className="text-2xl font-bold font-headline border-l-4 border-primary pl-4 uppercase tracking-tighter">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {items.map((item) => (
          <Link key={item.id} href={`/watch/${item.id}`} className="group">
            <Card className="bg-card border-none overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(217,128,38,0.3)] ring-offset-background group-hover:ring-2 ring-primary">
              <CardContent className="p-0 aspect-[2/3] relative">
                <Image 
                  src={item.posterUrl} 
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-primary p-4 rounded-full shadow-lg">
                    <Play className="w-8 h-8 text-black fill-current" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <p className="mt-3 font-bold text-sm text-center truncate group-hover:text-primary transition-colors uppercase tracking-tight">{item.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
