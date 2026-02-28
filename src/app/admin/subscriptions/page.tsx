
"use client";
import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useContentStore } from '@/hooks/use-content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Plus, Timer, CreditCard, Infinity } from 'lucide-react';
import { SubscriptionPlan, SubscriptionType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function AdminSubscriptionsPage() {
  const { plans, savePlans, isLoaded } = useContentStore();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  
  const [newPlan, setNewPlan] = useState<Partial<SubscriptionPlan>>({
    name: '',
    type: 'paid',
    durationValue: 30,
    durationUnit: 'days',
    price: 0
  });

  if (!isLoaded) return null;

  const handleAdd = () => {
    const finalPlan: SubscriptionPlan = {
      ...newPlan,
      id: Date.now().toString(),
    } as SubscriptionPlan;
    
    savePlans([...plans, finalPlan]);
    setIsAdding(false);
    toast({ title: "Sucesso", description: "Plano criado com sucesso." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-12 px-4 md:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-4xl font-bold font-headline flex items-center gap-3">
            <Users className="text-primary" /> Planos e Acessos
          </h1>
          <Button onClick={() => setIsAdding(true)} className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="w-5 h-5" /> Criar Novo Plano
          </Button>
        </div>

        {isAdding && (
          <Card className="bg-card border-primary/30 animate-fade-in">
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
                <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
                <Button onClick={handleAdd}>Confirmar Criação</Button>
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
      </main>
    </div>
  );
}
