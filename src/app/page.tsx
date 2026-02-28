
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
      toast({ title: "Pesquisando por:", description: transcript });
    };
    recognition.start();
  }, [toast]);

  if (!isLoaded) return null;

  const filteredContent = content.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(filteredContent.map(c => c.category))).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-8 pt-8">
        <div className="relative max-w-2xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar canal, filme ou categoria..." 
              className="pl-12 h-14 bg-card border-primary/20 focus:border-primary text-lg rounded-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant={isListening ? "destructive" : "secondary"} 
            size="icon" 
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={startVoiceSearch}
          >
            {isListening ? <MicOff className="animate-pulse w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {!searchTerm && featured && (
        <section className="relative h-[65vh] w-full overflow-hidden mt-8">
          <div className="absolute inset-0">
            <Image 
              src={featured.posterUrl} 
              alt={featured.title}
              fill
              className="object-cover opacity-40 blur-sm scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          </div>
          
          <div className="relative h-full container mx-auto flex flex-col justify-end pb-16 px-4 md:px-8 space-y-6">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary fill-primary" />
              <span className="text-primary font-black tracking-[0.3em] text-xs uppercase">Destaque Premium</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-black font-headline tracking-tighter max-w-3xl leading-none uppercase">{featured.title}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl line-clamp-3 font-medium">{featured.description}</p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href={`/watch/${featured.id}`}>
                <Button size="lg" className="bg-primary hover:bg-primary/90 gap-3 h-16 px-10 text-xl font-black rounded-full shadow-[0_0_30px_rgba(217,128,38,0.4)]">
                  <Play className="fill-current w-6 h-6" /> ASSISTIR AGORA
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <main className="container mx-auto py-12 px-4 md:px-8 space-y-16">
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
            <Clapperboard className="w-20 h-20 text-primary mb-6 opacity-10" />
            <h2 className="text-4xl font-black font-headline uppercase tracking-tighter">Nenhum canal encontrado</h2>
            <p className="text-muted-foreground mt-3 text-lg">Use a busca por voz ou digite o nome do canal acima.</p>
          </section>
        )}
      </main>

      <footer className="border-t border-white/5 py-16 text-center text-muted-foreground">
        <p className="font-bold tracking-widest text-xs uppercase">© 2024 Léo Tv & Stream • Ultra Speed P2P Delivery</p>
      </footer>
    </div>
  );
}

function ContentRow({ title, items }: { title: string, items: any[] }) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-2 h-8 bg-primary rounded-full shadow-[0_0_10px_rgba(217,128,38,0.5)]" />
        <h3 className="text-3xl font-black font-headline uppercase tracking-tighter">{title}</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
        {items.map((item) => (
          <Link key={item.id} href={`/watch/${item.id}`} className="group">
            <Card className="bg-card border-none overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(217,128,38,0.4)] ring-offset-background group-hover:ring-2 ring-primary relative">
              <CardContent className="p-0 aspect-[2/3] relative">
                <Image 
                  src={item.posterUrl} 
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                  <div className="bg-primary p-5 rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                    <Play className="w-10 h-10 text-black fill-current" />
                  </div>
                </div>
                {item.type === 'series' && (
                  <div className="absolute top-2 right-2 bg-primary text-black text-[10px] font-black px-2 py-1 rounded">SÉRIE</div>
                )}
              </CardContent>
            </Card>
            <p className="mt-4 font-black text-xs text-center truncate group-hover:text-primary transition-colors uppercase tracking-widest">{item.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
