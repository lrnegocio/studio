
"use client";
import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useContentStore } from '@/hooks/use-content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Film, Plus, Trash2, Edit, Wand2, Loader2 } from 'lucide-react';
import { VideoContent, ContentType } from '@/lib/types';
import { generateContentDescription } from '@/ai/flows/admin-content-description-generation';
import { useToast } from '@/hooks/use-toast';

export default function AdminContentPage() {
  const { content, saveContent, isLoaded } = useContentStore();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [newContent, setNewContent] = useState<Partial<VideoContent>>({
    title: '',
    type: 'movie',
    genre: '',
    description: '',
    posterUrl: 'https://picsum.photos/seed/new/400/600',
    sourceUrl: ''
  });

  if (!isLoaded) return null;

  const handleAdd = () => {
    if (!newContent.title || !newContent.genre) return;
    const finalContent: VideoContent = {
      ...newContent,
      id: Date.now().toString(),
    } as VideoContent;
    
    saveContent([...content, finalContent]);
    setIsAdding(false);
    toast({ title: "Sucesso", description: "Conteúdo adicionado com sucesso." });
  };

  const handleDelete = (id: string) => {
    saveContent(content.filter(c => c.id !== id));
    toast({ title: "Removido", description: "Conteúdo excluído do catálogo." });
  };

  const handleGenerateDescription = async () => {
    if (!newContent.title || !newContent.genre) {
      toast({ variant: "destructive", title: "Erro", description: "Preencha título e gênero primeiro." });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateContentDescription({
        title: newContent.title,
        genre: newContent.genre
      });
      setNewContent(prev => ({ ...prev, description: result.description }));
      toast({ title: "AI Ativada", description: "Descrição gerada com inteligência artificial." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao gerar descrição." });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-12 px-4 md:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-4xl font-bold font-headline flex items-center gap-3">
            <Film className="text-primary" /> Gerenciar Catálogo
          </h1>
          <Button onClick={() => setIsAdding(true)} className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="w-5 h-5" /> Adicionar Novo Item
          </Button>
        </div>

        {isAdding && (
          <Card className="bg-card border-primary/30 animate-fade-in">
            <CardHeader>
              <CardTitle>Adicionar Novo Conteúdo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input value={newContent.title} onChange={e => setNewContent({...newContent, title: e.target.value})} placeholder="Ex: Batman" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select onValueChange={(v: ContentType) => setNewContent({...newContent, type: v})} defaultValue="movie">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="movie">Filme</SelectItem>
                        <SelectItem value="series">Série</SelectItem>
                        <SelectItem value="channel">Canal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Gênero</Label>
                    <Input value={newContent.genre} onChange={e => setNewContent({...newContent, genre: e.target.value})} placeholder="Ex: Ação, Aventura" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center justify-between">
                      Descrição
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:text-primary/80 h-auto p-0 gap-1"
                        onClick={handleGenerateDescription}
                        disabled={isGenerating}
                      >
                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                        Gerar com IA
                      </Button>
                    </Label>
                    <Textarea 
                      className="h-32" 
                      value={newContent.description} 
                      onChange={e => setNewContent({...newContent, description: e.target.value})} 
                      placeholder="Fale um pouco sobre a obra..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL da Fonte (Youtube, M3U8, etc)</Label>
                    <Input value={newContent.sourceUrl} onChange={e => setNewContent({...newContent, sourceUrl: e.target.value})} placeholder="https://..." />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
                <Button onClick={handleAdd}>Salvar no Catálogo</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4">
          {content.map(item => (
            <Card key={item.id} className="bg-card border-border hover:border-primary/20 transition-all">
              <CardContent className="p-4 flex items-center gap-6">
                <div className="relative w-16 h-24 rounded-md overflow-hidden flex-shrink-0">
                  <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg truncate">{item.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">{item.type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  <p className="text-xs text-primary font-medium mt-1">{item.genre}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <Edit className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
