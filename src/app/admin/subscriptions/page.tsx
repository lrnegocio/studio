
"use client";
import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useContentStore } from '@/hooks/use-content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, Timer, CreditCard, Infinity, Key, Trash2, Copy, CheckCircle2 } from 'lucide-react';
import { SubscriptionPlan, SubscriptionType, AccessKey } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function AdminSubscriptionsPage() {
  const { plans, savePlans, keys, saveKeys, isLoaded } = useContentStore();
  const { toast } = useToast();
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [selectedPlanForKey, setSelectedPlanForKey] = useState<string>("");
  
  const [newPlan, setNewPlan] = useState<Partial<SubscriptionPlan>>({
    name: '',
    type: 'paid',
    durationValue: 30,
    durationUnit: 'days',
    price: 0
  });

  if (!isLoaded) return null;

  const handleAddPlan = () => {
    if (!newPlan.name) return;
    const finalPlan: SubscriptionPlan = {
      ...newPlan,
      id: Date.now().toString(),
    } as SubscriptionPlan;
    
    savePlans([...plans, finalPlan]);
    setIsAddingPlan(false);
    toast({ title: "Sucesso", description: "Plano criado com sucesso." });
  };

  const generateKey = () => {
    if (!selectedPlanForKey) {
      toast({ variant: "destructive", title: "Erro", description: "Selecione um plano primeiro." });
      return;
    }
    
    const newKey: AccessKey = {
      id: Date.now().toString(),
      key: `LEO-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      planId: selectedPlanForKey,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    saveKeys([newKey, ...keys]);
    toast({ title: "Chave Gerada", description: "Uma nova API Key foi criada." });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "Chave copiada para a área de transferência." });
  };

  const deleteKey = (id: string) => {
    saveKeys(keys.filter(k => k.id !== id));
    toast({ title: "Removido", description: "Chave excluída." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-12 px-4 md:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-4xl font-bold font-headline flex items-center gap-3">
            <Users className="text-primary" /> Gestão de Acessos
          </h1>
        </div>

        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="bg-card border border-border mb-8">
            <TabsTrigger value="plans" className="gap-2">
              <CreditCard className="w-4 h-4" /> Planos de Assinatura
            </TabsTrigger>
            <TabsTrigger value="keys" className="gap-2">
              <Key className="w-4 h-4" /> Gerador de Chaves (API)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-8 animate-fade-in">
            <div className="flex justify-end">
              <Button onClick={() => setIsAddingPlan(true)} className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="w-5 h-5" /> Criar Novo Plano
              </Button>
            </div>

            {isAddingPlan && (
              <Card className="bg-card border-primary/30">
                <CardHeader>
                  <CardTitle>Configurar Novo Plano</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nome do Plano</Label>
                        <Input value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} placeholder="Ex: Acesso Premium 30 Dias" />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo de Acesso</Label>
                        <Select onValueChange={(v: SubscriptionType) => setNewPlan({...newPlan, type: v})} defaultValue="paid">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="trial">Teste Grátis</SelectItem>
                            <SelectItem value="paid">Plano Pago</SelectItem>
                            <SelectItem value="lifetime">Vitalício</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Duração</Label>
                          <Input type="number" value={newPlan.durationValue} onChange={e => setNewPlan({...newPlan, durationValue: parseInt(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Unidade</Label>
                          <Select onValueChange={(v: any) => setNewPlan({...newPlan, durationUnit: v})} defaultValue="days">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hours">Horas</SelectItem>
                              <SelectItem value="days">Dias</SelectItem>
                              <SelectItem value="lifetime">Eterno</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Preço (R$)</Label>
                        <Input type="number" step="0.01" value={newPlan.price} onChange={e => setNewPlan({...newPlan, price: parseFloat(e.target.value)})} />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-6 border-t border-border">
                    <Button variant="ghost" onClick={() => setIsAddingPlan(false)}>Cancelar</Button>
                    <Button onClick={handleAddPlan}>Confirmar Criação</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map(plan => (
                <Card key={plan.id} className={`bg-card border-border hover:border-primary/40 transition-all ${plan.type === 'lifetime' ? 'border-primary/50 bg-primary/5' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="p-2 rounded-lg bg-background border border-border">
                        {plan.type === 'trial' ? <Timer className="text-blue-500" /> : plan.type === 'lifetime' ? <Infinity className="text-primary" /> : <CreditCard className="text-green-500" />}
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${plan.type === 'trial' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                        {plan.type}
                      </span>
                    </div>
                    <CardTitle className="mt-4 font-headline">{plan.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold font-headline">
                        {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toFixed(2)}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Duração: {plan.type === 'lifetime' ? 'Para sempre' : `${plan.durationValue} ${plan.durationUnit}`}
                      </p>
                    </div>
                    <div className="mt-6 pt-6 border-t border-border flex gap-2">
                      <Button variant="outline" className="w-full">Editar</Button>
                      <Button variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => savePlans(plans.filter(p => p.id !== plan.id))}>Excluir</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="keys" className="space-y-8 animate-fade-in">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="text-primary" /> Gerar Nova Chave de Acesso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-end gap-4">
                  <div className="flex-1 space-y-2 w-full">
                    <Label>Selecione o Plano Destino</Label>
                    <Select onValueChange={setSelectedPlanForKey}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um plano..." />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name} (R$ {p.price.toFixed(2)})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={generateKey} className="bg-primary hover:bg-primary/90 gap-2 h-10 w-full md:w-auto">
                    <CheckCircle2 className="w-4 h-4" /> Gerar Chave Agora
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-xl font-bold font-headline">Chaves Geradas Recentemente</h3>
              <div className="grid grid-cols-1 gap-4">
                {keys.length === 0 ? (
                  <p className="text-muted-foreground text-center py-12 bg-card/30 rounded-lg border border-dashed border-border">
                    Nenhuma chave gerada ainda. Selecione um plano e clique em gerar.
                  </p>
                ) : (
                  keys.map(key => {
                    const plan = plans.find(p => p.id === key.planId);
                    return (
                      <Card key={key.id} className="bg-card border-border hover:border-primary/20 transition-all">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Key className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-mono font-bold text-lg">{key.key}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">Plano: {plan?.name || 'N/A'}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-bold uppercase">{key.status}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(key.key)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteKey(key.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
