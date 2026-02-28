
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
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      toast({ title: "Pesquisando por voz:", description: transcript });
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
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
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
    toast({ title: "Sucesso", description: "Conteúdo salvo no catálogo." });
  };

  const handleDelete = (id: string) => {
    saveContent(content.filter(c => c.id !== id));
    toast({ title: "Removido", description: "Conteúdo excluído com sucesso." });
  };

  const handleGenerateDescription = async () => {
    if (!formData.title || !formData.category) {
      toast({ variant: "destructive", title: "Erro", description: "Preencha título e categoria primeiro." });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateContentDescription({
        title: formData.title,
        genre: formData.category || ''
      });
      setFormData(prev => ({ ...prev, description: result.description }));
      toast({ title: "IA Pronta", description: "Descrição gerada com sucesso!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro na IA", description: "Não foi possível gerar a descrição agora." });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-12 px-4 md:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <h1 className="text-5xl font-black font-headline flex items-center gap-4 text-primary tracking-tighter uppercase">
            <Film className="w-12 h-12" /> Catálogo Master
          </h1>
          <div className="flex flex-wrap gap-4 items-center">
             <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input 
                placeholder="Buscar no catálogo..." 
                className="pl-12 h-14 w-full md:w-80 bg-card border-white/5 rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             <Button variant="outline" size="icon" onClick={startVoiceSearch} className={`h-14 w-14 rounded-full border-2 ${isListening ? "border-primary text-primary shadow-[0_0_15px_rgba(217,128,38,0.5)]" : "border-white/5"}`}>
               <Mic className={isListening ? "animate-pulse" : ""} />
             </Button>
            {!isEditing && (
              <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90 gap-3 h-14 px-8 text-lg font-black rounded-full shadow-lg">
                <Plus className="w-6 h-6" /> ADICIONAR CONTEÚDO
              </Button>
            )}
          </div>
        </div>

        {isEditing && (
          <Card className="bg-card border-primary/40 animate-fade-in shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-white/5 pb-6 mb-8 bg-muted/20">
              <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight">
                {formData.id ? <Edit className="text-primary w-8 h-8" /> : <PlusCircle className="text-primary w-8 h-8" />}
                {formData.id ? 'Editar Transmissão' : 'Nova Transmissão'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-10 p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Título do Canal / Filme</Label>
                    <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ex: HBO MAX HD" className="h-14 bg-background border-white/5 text-lg font-bold" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Tipo de Conteúdo</Label>
                      <Select onValueChange={(v: ContentType) => setFormData({...formData, type: v})} value={formData.type}>
                        <SelectTrigger className="h-14 bg-background border-white/5"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="movie">Canais / Filmes</SelectItem>
                          <SelectItem value="series">Séries (Episódios)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Categoria Personalizada</Label>
                      <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Ex: Esportes, Filmes 4K..." className="h-14 bg-background border-white/5" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">
                      Descrição da IA
                      <Button variant="ghost" size="sm" className="text-primary h-auto p-0 gap-2 hover:bg-transparent" onClick={handleGenerateDescription} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        GERAR POR IA
                      </Button>
                    </Label>
                    <Textarea className="min-h-[120px] bg-background border-white/5 text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>

                  {formData.type !== 'series' && (
                    <div className="space-y-4">
                      <Label className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">
                        URL da Transmissão (M3U8 / MP4 / Youtube / Web)
                      </Label>
                      <div className="flex gap-4">
                        <Input value={formData.sourceUrl} onChange={e => setFormData({...formData, sourceUrl: e.target.value})} placeholder="https://..." className="h-14 bg-background border-white/5 font-mono text-xs flex-1" />
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="secondary" className="h-14 px-6 gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-black font-black" onClick={() => setTestUrl(formatVideoUrl(formData.sourceUrl))}>
                              <MonitorPlay className="w-5 h-5" /> TESTAR
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-5xl bg-black border-primary/50 rounded-3xl overflow-hidden">
                            <DialogHeader><DialogTitle className="text-primary font-black uppercase tracking-widest text-center">Teste de Sinal P2P Mestre</DialogTitle></DialogHeader>
                            <div className="aspect-video w-full bg-muted flex items-center justify-center rounded-2xl overflow-hidden relative group">
                              {testUrl ? (
                                <iframe src={testUrl} className="w-full h-full" allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
                              ) : (
                                <div className="text-center space-y-4">
                                  <AlertTriangle className="w-16 h-16 text-primary mx-auto opacity-20" />
                                  <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Insira um link para testar</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">URL da Capa (Poster)</Label>
                    <Input value={formData.posterUrl} onChange={e => setFormData({...formData, posterUrl: e.target.value})} className="h-14 bg-background border-white/5" />
                    <div className="mt-8 w-full aspect-[2/3] max-w-[280px] mx-auto border-4 border-dashed border-white/5 rounded-3xl overflow-hidden bg-muted/10 flex items-center justify-center relative group shadow-2xl">
                      {formData.posterUrl ? (
                        <img src={formData.posterUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Preview" />
                      ) : (
                        <Film className="w-16 h-16 text-muted-foreground opacity-10" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-primary text-black px-4 py-2 rounded-full font-black text-[10px]">PREVIEW DA CAPA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {formData.type === 'series' && (
                <div className="pt-12 border-t border-white/5 space-y-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter"><Layers className="w-8 h-8 text-primary" /> Gerenciar Temporadas</h3>
                    <Button variant="outline" onClick={handleAddSeason} className="gap-2 border-primary/30 text-primary hover:bg-primary hover:text-black h-12 px-6 rounded-full font-black">
                      <PlusCircle className="w-6 h-6" /> NOVA TEMPORADA
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-10">
                    {formData.seasons?.map((season) => (
                      <Card key={season.id} className="bg-background border-white/5 shadow-2xl rounded-3xl overflow-hidden">
                        <CardHeader className="py-6 px-8 flex flex-row items-center justify-between bg-muted/10">
                          <CardTitle className="text-lg font-black uppercase tracking-widest text-primary">TEMPORADA {season.number}</CardTitle>
                          <div className="flex gap-4">
                            <Button variant="outline" size="sm" onClick={() => handleAddEpisode(season.id)} className="text-primary border-primary/30 h-10 px-4 rounded-full font-black text-[10px]">
                              <Plus className="w-4 h-4 mr-2" /> ADD EPISÓDIO
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setFormData({...formData, seasons: formData.seasons?.filter(s => s.id !== season.id)})} className="text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                          {season.episodes.length === 0 && <p className="text-center text-muted-foreground py-4 text-xs font-bold uppercase opacity-30">Nenhum episódio nesta temporada</p>}
                          {season.episodes.map((ep) => (
                            <div key={ep.id} className="flex gap-4 items-center bg-card p-4 rounded-2xl border border-white/5 group hover:border-primary/30 transition-all">
                              <span className="text-xs font-black text-primary w-10 text-center">#{ep.number}</span>
                              <Input placeholder="Título (Ex: Ep 01)" value={ep.title} onChange={(e) => updateEpisode(season.id, ep.id, 'title', e.target.value)} className="h-12 bg-background border-none font-bold text-sm" />
                              <Input placeholder="URL do Sinal (M3U8 / MP4)" value={ep.url} onChange={(e) => updateEpisode(season.id, ep.id, 'url', e.target.value)} className="h-12 bg-background border-none font-mono text-[10px] flex-[2]" />
                              <Button variant="ghost" size="icon" onClick={() => deleteEpisode(season.id, ep.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="w-5 h-5" /></Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-6 pt-12 border-t border-white/5">
                <Button variant="ghost" onClick={() => setIsEditing(false)} className="h-14 px-8 font-black uppercase tracking-widest">Descartar</Button>
                <Button size="lg" onClick={handleSave} className="bg-primary hover:bg-primary/90 gap-3 px-12 h-14 text-lg font-black shadow-2xl rounded-full">
                  <Save className="w-6 h-6" /> SALVAR ALTERAÇÕES
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredContent.map(item => (
            <Card key={item.id} className="bg-card border-white/5 overflow-hidden hover:border-primary/50 transition-all group rounded-3xl shadow-xl">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="relative w-full aspect-video overflow-hidden">
                  <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="text-[10px] px-3 py-1 rounded-full bg-primary text-black font-black uppercase tracking-widest">{item.type}</span>
                  </div>
                </div>
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div className="space-y-2">
                    <h3 className="font-black text-xl truncate uppercase tracking-tighter group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{item.category}</p>
                  </div>
                  <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-white/5">
                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-full text-primary border-primary/20 hover:bg-primary hover:text-black transition-all" onClick={() => handleOpenEdit(item)}>
                      <Edit className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-full text-destructive border-destructive/20 hover:bg-destructive hover:text-white transition-all" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-5 h-5" />
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
