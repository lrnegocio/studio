
"use client";
import { useState, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useContentStore } from '@/hooks/use-content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Film, Plus, Trash2, Edit, Wand2, Loader2, Play, PlusCircle, Layers, MonitorPlay, Save, X, Search, Mic, MicOff } from 'lucide-react';
import { VideoContent, ContentType, Season, Episode } from '@/lib/types';
import { generateContentDescription } from '@/ai/flows/admin-content-description-generation';
import { useToast } from '@/hooks/use-toast';
import { formatVideoUrl } from '@/lib/utils';

export default function AdminContentPage() {
  const { content, saveContent, isLoaded } = useContentStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [testUrl, setTestUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  const [formData, setFormData] = useState<Partial<VideoContent>>({
    id: '',
    title: '',
    type: 'movie',
    category: '',
    description: '',
    posterUrl: 'https://picsum.photos/seed/new/400/600',
    sourceUrl: '',
    seasons: []
  });

  const startVoiceSearch = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: "destructive", title: "Erro", description: "Busca por voz não suportada." });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      setSearchTerm(event.results[0][0].transcript);
    };
    recognition.start();
  }, [toast]);

  if (!isLoaded) return null;

  const filteredContent = content.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setFormData({
      id: '',
      title: '',
      type: 'movie',
      category: '',
      description: '',
      posterUrl: 'https://picsum.photos/seed/new/400/600',
      sourceUrl: '',
      seasons: []
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (item: VideoContent) => {
    setFormData(item);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddSeason = () => {
    const nextNumber = (formData.seasons?.length || 0) + 1;
    const newSeason: Season = {
      id: Date.now().toString(),
      number: nextNumber,
      episodes: []
    };
    setFormData({
      ...formData,
      seasons: [...(formData.seasons || []), newSeason]
    });
  };

  const handleAddEpisode = (seasonId: string) => {
    setFormData({
      ...formData,
      seasons: formData.seasons?.map(s => {
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
    setFormData({
      ...formData,
      seasons: formData.seasons?.map(s => {
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
    setFormData({
      ...formData,
      seasons: formData.seasons?.map(s => {
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
    if (!formData.title || !formData.category) {
      toast({ variant: "destructive", title: "Erro", description: "Preencha título e categoria." });
      return;
    }
    let updatedContentList: VideoContent[];
    if (formData.id) {
      updatedContentList = content.map(c => c.id === formData.id ? (formData as VideoContent) : c);
    } else {
      const newItem = { ...formData, id: Date.now().toString() } as VideoContent;
      updatedContentList = [...content, newItem];
    }
    saveContent(updatedContentList);
    setIsEditing(false);
    toast({ title: "Sucesso", description: "Conteúdo atualizado." });
  };

  const handleDelete = (id: string) => {
    saveContent(content.filter(c => c.id !== id));
    toast({ title: "Removido", description: "Conteúdo excluído." });
  };

  const handleGenerateDescription = async () => {
    if (!formData.title || !formData.category) {
      toast({ variant: "destructive", title: "Erro", description: "Preencha título e categoria." });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateContentDescription({
        title: formData.title,
        genre: formData.category || ''
      });
      setFormData(prev => ({ ...prev, description: result.description }));
    } catch (error) {
      toast({ variant: "destructive", title: "Erro na IA" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-12 px-4 md:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h1 className="text-4xl font-bold font-headline flex items-center gap-3 text-primary">
            <Film className="w-10 h-10" /> Gerenciar Catálogo
          </h1>
          <div className="flex gap-2">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <Input 
                placeholder="Buscar no catálogo..." 
                className="pl-9 h-11 w-64 bg-card"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             <Button variant="outline" size="icon" onClick={startVoiceSearch} className={isListening ? "border-primary text-primary" : ""}>
               <Mic className={isListening ? "animate-pulse" : ""} />
             </Button>
          </div>
          {!isEditing && (
            <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90 gap-2 h-12 px-6">
              <Plus className="w-6 h-6" /> Novo Conteúdo
            </Button>
          )}
        </div>

        {isEditing && (
          <Card className="bg-card border-primary/40 animate-fade-in shadow-2xl">
            <CardHeader className="border-b border-border pb-4 mb-6">
              <CardTitle className="flex items-center gap-2">
                {formData.id ? <Edit className="text-primary" /> : <PlusCircle className="text-primary" />}
                {formData.id ? 'Editar Conteúdo' : 'Cadastrar Novo Conteúdo'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Título</Label>
                    <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Nome do canal ou filme" className="h-12" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tipo</Label>
                      <Select onValueChange={(v: ContentType) => setFormData({...formData, type: v})} value={formData.type}>
                        <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="movie">Filme / Canal</SelectItem>
                          <SelectItem value="series">Série (Episódios)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categoria</Label>
                      <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Ex: Esportes, Filmes, HBO" className="h-12" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Descrição
                      <Button variant="ghost" size="sm" className="text-primary h-auto p-0 gap-1" onClick={handleGenerateDescription} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                        IA
                      </Button>
                    </Label>
                    <Textarea className="min-h-[100px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>

                  {formData.type !== 'series' && (
                    <div className="space-y-2">
                      <Label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Link do Vídeo (M3U8 / MP4 / Youtube / Web)
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="secondary" size="sm" onClick={() => setTestUrl(formatVideoUrl(formData.sourceUrl))}>
                              <MonitorPlay className="w-4 h-4 mr-2" /> Testar Sinal
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl bg-black border-primary/50">
                            <DialogHeader><DialogTitle className="text-white">Teste de Transmissão</DialogTitle></DialogHeader>
                            <div className="aspect-video w-full bg-muted flex items-center justify-center rounded-lg overflow-hidden">
                              {testUrl ? (
                                <iframe src={testUrl} className="w-full h-full" allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
                              ) : (
                                <p className="text-muted-foreground text-center">Cole o link acima para testar o sinal.</p>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </Label>
                      <Input value={formData.sourceUrl} onChange={e => setFormData({...formData, sourceUrl: e.target.value})} placeholder="https://..." className="h-12 font-mono text-xs" />
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">URL da Capa</Label>
                    <Input value={formData.posterUrl} onChange={e => setFormData({...formData, posterUrl: e.target.value})} className="h-12" />
                    <div className="mt-4 w-full aspect-[2/3] max-w-[200px] mx-auto border-2 border-dashed rounded-xl overflow-hidden bg-muted flex items-center justify-center group relative">
                      {formData.posterUrl ? (
                        <img src={formData.posterUrl} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <Film className="w-12 h-12 text-muted-foreground opacity-20" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {formData.type === 'series' && (
                <div className="pt-8 border-t border-border space-y-6 bg-primary/5 p-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2"><Layers className="w-6 h-6 text-primary" /> Episódios</h3>
                    <Button variant="outline" onClick={handleAddSeason} className="gap-2 border-primary/50 text-primary">
                      <PlusCircle className="w-5 h-5" /> Nova Temporada
                    </Button>
                  </div>
                  {formData.seasons?.map((season) => (
                    <Card key={season.id} className="bg-background border-border shadow-md">
                      <CardHeader className="py-4 px-6 flex flex-row items-center justify-between bg-muted/30">
                        <CardTitle className="text-md font-black">TEMPORADA {season.number}</CardTitle>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleAddEpisode(season.id)} className="text-primary">
                            <Plus className="w-4 h-4 mr-1" /> Add Ep
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setFormData({...formData, seasons: formData.seasons?.filter(s => s.id !== season.id)})} className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        {season.episodes.map((ep) => (
                          <div key={ep.id} className="flex gap-3 items-center bg-card p-2 rounded-lg border border-border">
                            <span className="text-xs font-black text-primary px-2">#{ep.number}</span>
                            <Input placeholder="Título do Ep" value={ep.title} onChange={(e) => updateEpisode(season.id, ep.id, 'title', e.target.value)} className="h-9 text-xs" />
                            <Input placeholder="URL do Vídeo" value={ep.url} onChange={(e) => updateEpisode(season.id, ep.id, 'url', e.target.value)} className="h-9 text-xs font-mono" />
                            <Button variant="ghost" size="icon" onClick={() => deleteEpisode(season.id, ep.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-4 pt-8">
                <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                <Button size="lg" onClick={handleSave} className="bg-primary hover:bg-primary/90 gap-2 px-10 shadow-lg">
                  <Save className="w-5 h-5" /> Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredContent.map(item => (
            <Card key={item.id} className="bg-card border-border overflow-hidden hover:border-primary/50 transition-all group">
              <CardContent className="p-0 flex h-32">
                <div className="relative w-24 h-full flex-shrink-0">
                  <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 p-4 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-md truncate mb-1 uppercase tracking-tight">{item.title}</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-black uppercase">{item.type}</span>
                       <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-bold">{item.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 text-primary border-primary/20" onClick={() => handleOpenEdit(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-destructive border-destructive/20" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
