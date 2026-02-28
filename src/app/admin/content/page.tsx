
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Film, Plus, Trash2, Edit, Wand2, Loader2, Play, PlusCircle, Layers, Clapperboard, MonitorPlay } from 'lucide-react';
import { VideoContent, ContentType, Season, Episode } from '@/lib/types';
import { generateContentDescription } from '@/ai/flows/admin-content-description-generation';
import { useToast } from '@/hooks/use-toast';

export default function AdminContentPage() {
  const { content, saveContent, isLoaded } = useContentStore();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [testUrl, setTestUrl] = useState('');
  
  const [newContent, setNewContent] = useState<Partial<VideoContent>>({
    title: '',
    type: 'movie',
    category: '',
    description: '',
    posterUrl: 'https://picsum.photos/seed/new/400/600',
    sourceUrl: '',
    seasons: []
  });

  if (!isLoaded) return null;

  const handleAddSeason = () => {
    const nextNumber = (newContent.seasons?.length || 0) + 1;
    const newSeason: Season = {
      id: Date.now().toString(),
      number: nextNumber,
      episodes: []
    };
    setNewContent({
      ...newContent,
      seasons: [...(newContent.seasons || []), newSeason]
    });
  };

  const handleAddEpisode = (seasonId: string) => {
    setNewContent({
      ...newContent,
      seasons: newContent.seasons?.map(s => {
        if (s.id === seasonId) {
          const nextEpNumber = s.episodes.length + 1;
          const newEp: Episode = {
            id: Math.random().toString(36).substr(2, 9),
            title: `Episódio ${nextEpNumber}`,
            number: nextEpNumber,
            url: ''
          };
          return { ...s, episodes: [...s.episodes, newEp] };
        }
        return s;
      })
    });
  };

  const updateEpisode = (seasonId: string, epId: string, field: keyof Episode, value: any) => {
    setNewContent({
      ...newContent,
      seasons: newContent.seasons?.map(s => {
        if (s.id === seasonId) {
          return {
            ...s,
            episodes: s.episodes.map(ep => ep.id === epId ? { ...ep, [field]: value } : ep)
          };
        }
        return s;
      })
    });
  };

  const deleteEpisode = (seasonId: string, epId: string) => {
    setNewContent({
      ...newContent,
      seasons: newContent.seasons?.map(s => {
        if (s.id === seasonId) {
          return {
            ...s,
            episodes: s.episodes.filter(ep => ep.id !== epId)
          };
        }
        return s;
      })
    });
  };

  const handleSave = () => {
    if (!newContent.title || !newContent.category) {
      toast({ variant: "destructive", title: "Erro", description: "Preencha título e categoria." });
      return;
    }
    const finalContent: VideoContent = {
      ...newContent,
      id: Date.now().toString(),
    } as VideoContent;
    
    saveContent([...content, finalContent]);
    setIsAdding(false);
    setNewContent({ title: '', type: 'movie', category: '', description: '', posterUrl: 'https://picsum.photos/seed/new/400/600', sourceUrl: '', seasons: [] });
    toast({ title: "Sucesso", description: "Conteúdo salvo no catálogo." });
  };

  const handleDelete = (id: string) => {
    saveContent(content.filter(c => c.id !== id));
    toast({ title: "Removido", description: "Conteúdo excluído." });
  };

  const handleGenerateDescription = async () => {
    if (!newContent.title || !newContent.category) {
      toast({ variant: "destructive", title: "Erro", description: "Preencha título e categoria primeiro." });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateContentDescription({
        title: newContent.title,
        genre: newContent.category || ''
      });
      setNewContent(prev => ({ ...prev, description: result.description }));
      toast({ title: "IA Ativada", description: "Descrição gerada com sucesso." });
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
            <Film className="text-primary" /> Catálogo de Transmissão
          </h1>
          <Button onClick={() => setIsAdding(true)} className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="w-5 h-5" /> Novo Conteúdo
          </Button>
        </div>

        {isAdding && (
          <Card className="bg-card border-primary/30 animate-fade-in mb-12">
            <CardHeader>
              <CardTitle>Configurar Novo Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título do Conteúdo</Label>
                    <Input value={newContent.title} onChange={e => setNewContent({...newContent, title: e.target.value})} placeholder="Ex: Canal 24 Horas ou Filme X" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label>Categoria</Label>
                      <Input value={newContent.category} onChange={e => setNewContent({...newContent, category: e.target.value})} placeholder="Ex: Esportes, Filmes, HBO" />
                    </div>
                  </div>
                  
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
                      className="h-24" 
                      value={newContent.description} 
                      onChange={e => setNewContent({...newContent, description: e.target.value})} 
                      placeholder="Breve resumo..."
                    />
                  </div>

                  {newContent.type !== 'series' && (
                    <div className="space-y-2">
                      <Label className="flex items-center justify-between">
                        URL da Fonte (M3U8 / MP4 / Youtube)
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-2" onClick={() => setTestUrl(newContent.sourceUrl || '')}>
                              <MonitorPlay className="w-3 h-3" /> Testar Transmissão
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl bg-black border-primary/50">
                            <DialogHeader>
                              <DialogTitle className="text-white">Player de Teste</DialogTitle>
                            </DialogHeader>
                            <div className="aspect-video w-full bg-muted flex items-center justify-center rounded-lg overflow-hidden">
                              {testUrl ? (
                                <iframe 
                                  src={testUrl} 
                                  className="w-full h-full" 
                                  allowFullScreen 
                                  allow="autoplay; encrypted-media"
                                />
                              ) : (
                                <p className="text-muted-foreground">Insira uma URL válida para testar o sinal.</p>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </Label>
                      <Input value={newContent.sourceUrl} onChange={e => setNewContent({...newContent, sourceUrl: e.target.value})} placeholder="https://..." />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>URL do Poster (Capa)</Label>
                    <Input value={newContent.posterUrl} onChange={e => setNewContent({...newContent, posterUrl: e.target.value})} />
                    <div className="mt-2 w-32 h-48 border border-border rounded-md overflow-hidden bg-muted flex items-center justify-center">
                      {newContent.posterUrl ? (
                         <img src={newContent.posterUrl} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                         <Film className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {newContent.type === 'series' && (
                <div className="pt-6 border-t border-border space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2"><Layers className="w-5 h-5" /> Temporadas e Episódios</h3>
                    <Button variant="outline" onClick={handleAddSeason} className="gap-2 border-primary/50 text-primary">
                      <PlusCircle className="w-4 h-4" /> Adicionar Temporada
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {newContent.seasons?.map((season) => (
                      <Card key={season.id} className="bg-background/50 border-border">
                        <CardHeader className="py-3 flex flex-row items-center justify-between border-b border-border mb-4">
                          <CardTitle className="text-sm">Temporada {season.number}</CardTitle>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleAddEpisode(season.id)} className="text-primary gap-1 h-8">
                              <Plus className="w-3 h-3" /> Add Episódio
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setNewContent({...newContent, seasons: newContent.seasons?.filter(s => s.id !== season.id)})} className="text-destructive h-8">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {season.episodes.map((ep) => (
                            <div key={ep.id} className="grid grid-cols-12 gap-2 items-center bg-card/30 p-2 rounded-lg border border-border">
                              <div className="col-span-1 text-xs text-center font-bold text-primary">#{ep.number}</div>
                              <div className="col-span-3">
                                <Input 
                                  placeholder="Título" 
                                  value={ep.title} 
                                  onChange={(e) => updateEpisode(season.id, ep.id, 'title', e.target.value)}
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div className="col-span-7">
                                <Input 
                                  placeholder="URL do vídeo (M3U8 / MP4)" 
                                  value={ep.url} 
                                  onChange={(e) => updateEpisode(season.id, ep.id, 'url', e.target.value)}
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div className="col-span-1 flex justify-end">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                  onClick={() => deleteEpisode(season.id, ep.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {season.episodes.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-2 italic">Nenhum episódio nesta temporada. Clique em "Add Episódio".</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {newContent.seasons?.length === 0 && (
                      <div className="text-center py-8 border border-dashed border-border rounded-lg">
                        <p className="text-muted-foreground text-sm">Nenhuma temporada criada ainda.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 px-8">Salvar no Catálogo</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4">
          {content.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-card/20 rounded-xl border border-dashed border-border">
              <Clapperboard className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Seu catálogo está vazio. Comece adicionando canais, filmes ou séries!</p>
            </div>
          ) : (
            content.map(item => (
              <Card key={item.id} className="bg-card border-border hover:border-primary/20 transition-all">
                <CardContent className="p-4 flex items-center gap-6">
                  <div className="relative w-16 h-24 rounded-md overflow-hidden flex-shrink-0 border border-border">
                    <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg truncate">{item.title}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">{item.type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{item.description || 'Sem descrição'}</p>
                    <p className="text-xs text-primary font-medium mt-1">Categoria: {item.category}</p>
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
            ))
          )}
        </div>
      </main>
    </div>
  );
}
