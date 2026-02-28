
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
import { Film, Plus, Trash2, Edit, Wand2, Loader2, Play, PlusCircle, Layers, MonitorPlay, Save, X } from 'lucide-react';
import { VideoContent, ContentType, Season, Episode } from '@/lib/types';
import { generateContentDescription } from '@/ai/flows/admin-content-description-generation';
import { useToast } from '@/hooks/use-toast';

export default function AdminContentPage() {
  const { content, saveContent, isLoaded } = useContentStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [testUrl, setTestUrl] = useState('');
  
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

  if (!isLoaded) return null;

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
      // Edit existing
      updatedContentList = content.map(c => c.id === formData.id ? (formData as VideoContent) : c);
    } else {
      // Add new
      const newItem = { ...formData, id: Date.now().toString() } as VideoContent;
      updatedContentList = [...content, newItem];
    }
    
    saveContent(updatedContentList);
    setIsEditing(false);
    toast({ title: "Sucesso", description: "Conteúdo atualizado no catálogo." });
  };

  const handleDelete = (id: string) => {
    saveContent(content.filter(c => c.id !== id));
    toast({ title: "Removido", description: "Conteúdo excluído." });
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
          <h1 className="text-4xl font-bold font-headline flex items-center gap-3 text-primary">
            <Film className="w-10 h-10" /> Gerenciar Catálogo
          </h1>
          {!isEditing && (
            <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90 gap-2 h-12 px-6">
              <Plus className="w-6 h-6" /> Novo Conteúdo
            </Button>
          )}
        </div>

        {isEditing && (
          <Card className="bg-card border-primary/40 animate-fade-in mb-12 shadow-2xl">
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
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Título</Label>
                    <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Nome do filme, série ou canal" className="h-12 text-lg" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Tipo de Mídia</Label>
                      <Select onValueChange={(v: ContentType) => setFormData({...formData, type: v})} value={formData.type}>
                        <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="movie">Filme</SelectItem>
                          <SelectItem value="series">Série</SelectItem>
                          <SelectItem value="channel">Canal (TV)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Categoria</Label>
                      <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Ex: Esportes, HBO, Terror" className="h-12" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center justify-between text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Descrição
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 h-auto p-0 gap-1" onClick={handleGenerateDescription} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                        Gerar com IA
                      </Button>
                    </Label>
                    <Textarea className="min-h-[120px] bg-background/50" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Escreva um resumo cativante..." />
                  </div>

                  {formData.type !== 'series' && (
                    <div className="space-y-2">
                      <Label className="flex items-center justify-between text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        URL da Transmissão (M3U8 / MP4 / Youtube)
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 text-xs gap-2" onClick={() => setTestUrl(formData.sourceUrl || '')}>
                              <MonitorPlay className="w-4 h-4" /> Testar Sinal Agora
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl bg-black border-primary/50">
                            <DialogHeader><DialogTitle className="text-white">Player de Verificação</DialogTitle></DialogHeader>
                            <div className="aspect-video w-full bg-muted flex items-center justify-center rounded-lg overflow-hidden border border-white/10">
                              {testUrl ? (
                                <iframe src={testUrl} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" />
                              ) : (
                                <p className="text-muted-foreground">Insira uma URL acima para testar o funcionamento.</p>
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
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">URL da Capa (Vertical)</Label>
                    <Input value={formData.posterUrl} onChange={e => setFormData({...formData, posterUrl: e.target.value})} className="h-12" />
                    <div className="mt-4 w-full aspect-[2/3] max-w-[240px] mx-auto border-2 border-dashed border-border rounded-xl overflow-hidden bg-muted flex items-center justify-center group relative">
                      {formData.posterUrl ? (
                        <img src={formData.posterUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Preview" />
                      ) : (
                        <Film className="w-12 h-12 text-muted-foreground opacity-20" />
                      )}
                      <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold">PREVIEW CAPA</div>
                    </div>
                  </div>
                </div>
              </div>

              {formData.type === 'series' && (
                <div className="pt-8 border-t border-border space-y-6 bg-primary/5 p-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold flex items-center gap-2"><Layers className="w-6 h-6 text-primary" /> Estrutura de Temporadas</h3>
                      <p className="text-xs text-muted-foreground">Adicione temporadas e cole os links dos episódios abaixo.</p>
                    </div>
                    <Button variant="outline" onClick={handleAddSeason} className="gap-2 border-primary/50 text-primary hover:bg-primary/10 h-10">
                      <PlusCircle className="w-5 h-5" /> Nova Temporada
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {formData.seasons?.map((season) => (
                      <Card key={season.id} className="bg-background border-border shadow-md overflow-hidden">
                        <CardHeader className="py-4 px-6 flex flex-row items-center justify-between bg-muted/30 border-b border-border">
                          <CardTitle className="text-md font-black">TEMPORADA {season.number}</CardTitle>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleAddEpisode(season.id)} className="text-primary gap-1 h-9 border-primary/20">
                              <Plus className="w-4 h-4" /> Adicionar Episódio
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setFormData({...formData, seasons: formData.seasons?.filter(s => s.id !== season.id)})} className="text-destructive hover:bg-destructive/10 h-9">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                          {season.episodes.length === 0 && <p className="text-center py-4 text-xs text-muted-foreground">Nenhum episódio adicionado.</p>}
                          {season.episodes.map((ep) => (
                            <div key={ep.id} className="grid grid-cols-12 gap-3 items-center bg-card p-3 rounded-xl border border-border group hover:border-primary/30 transition-colors">
                              <div className="col-span-1 text-xs text-center font-black text-primary bg-primary/10 rounded-md py-1">#{ep.number}</div>
                              <div className="col-span-3">
                                <Input placeholder="Nome do Ep" value={ep.title} onChange={(e) => updateEpisode(season.id, ep.id, 'title', e.target.value)} className="h-9 text-xs bg-transparent" />
                              </div>
                              <div className="col-span-7">
                                <Input placeholder="Link do vídeo (.mp4, .m3u8, youtube...)" value={ep.url} onChange={(e) => updateEpisode(season.id, ep.id, 'url', e.target.value)} className="h-9 text-xs bg-transparent font-mono" />
                              </div>
                              <div className="col-span-1 flex justify-end">
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => deleteEpisode(season.id, ep.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-8 border-t border-border">
                <Button variant="ghost" size="lg" onClick={() => setIsEditing(false)} className="gap-2">
                  <X className="w-5 h-5" /> Cancelar
                </Button>
                <Button size="lg" onClick={handleSave} className="bg-primary hover:bg-primary/90 gap-2 px-10 shadow-lg shadow-primary/20">
                  <Save className="w-5 h-5" /> Salvar Conteúdo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {content.length === 0 && !isEditing && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-3xl">
              <Film className="w-16 h-16 text-muted-foreground mx-auto opacity-20 mb-4" />
              <p className="text-muted-foreground text-lg">Seu catálogo está vazio. Comece adicionando um canal ou filme!</p>
            </div>
          )}
          {content.map(item => (
            <Card key={item.id} className="bg-card border-border overflow-hidden hover:border-primary/50 transition-all group">
              <CardContent className="p-0 flex h-32">
                <div className="relative w-24 h-full flex-shrink-0 border-r border-border">
                  <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary fill-primary" />
                  </div>
                </div>
                <div className="flex-1 p-4 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-md truncate flex-1">{item.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-black uppercase">{item.type}</span>
                       <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-bold truncate">Cat: {item.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 text-primary border-primary/20 hover:bg-primary/10" onClick={() => handleOpenEdit(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => handleDelete(item.id)}>
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
