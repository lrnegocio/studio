
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
import { Users, Plus, UserPlus, ShieldCheck, Trash2, KeyRound, MonitorPlay } from 'lucide-react';
import { SubscriptionPlan, SubscriptionType, UserAccount } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function AdminSubscriptionsPage() {
  const { plans, savePlans, userAccounts, saveUserAccounts, isLoaded } = useContentStore();
  const { toast } = useToast();
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  
  const [newUser, setNewUser] = useState<Partial<UserAccount>>({
    username: '',
    password: '',
    planId: ''
  });

  const [newPlan, setNewPlan] = useState<Partial<SubscriptionPlan>>({
    name: '',
    type: 'paid',
    durationValue: 30,
    durationUnit: 'days'
  });

  if (!isLoaded) return null;

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password || !newUser.planId) {
      toast({ variant: "destructive", title: "Erro", description: "Preencha todos os campos do usuário." });
      return;
    }
    const finalUser: UserAccount = {
      ...newUser,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'active'
    } as UserAccount;
    
    saveUserAccounts([finalUser, ...userAccounts]);
    setIsAddingUser(false);
    setNewUser({ username: '', password: '', planId: '' });
    toast({ title: "Usuário Criado", description: "Acesso liberado para o cliente." });
  };

  const handleAddPlan = () => {
    if (!newPlan.name) return;
    const finalPlan: SubscriptionPlan = {
      ...newPlan,
      id: Date.now().toString(),
    } as SubscriptionPlan;
    
    savePlans([...plans, finalPlan]);
    setIsAddingPlan(false);
    toast({ title: "Plano Criado", description: "Novo tipo de plano disponível." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-12 px-4 md:px-8 space-y-8">
        <h1 className="text-4xl font-bold font-headline flex items-center gap-3">
          <Users className="text-primary" /> Controle de Clientes
        </h1>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="bg-card border border-border mb-8">
            <TabsTrigger value="users" className="gap-2">
              <UserPlus className="w-4 h-4" /> Usuários Ativos
            </TabsTrigger>
            <TabsTrigger value="plans" className="gap-2">
              <ShieldCheck className="w-4 h-4" /> Tipos de Planos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => setIsAddingUser(true)} className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="w-5 h-5" /> Novo Cliente
              </Button>
            </div>

            {isAddingUser && (
              <Card className="bg-card border-primary/30">
                <CardHeader><CardTitle>Criar Novo Acesso</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Usuário (Login)</Label>
                      <Input value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} placeholder="Ex: joaosilva" />
                    </div>
                    <div className="space-y-2">
                      <Label>Senha</Label>
                      <Input type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="Senha do cliente" />
                    </div>
                    <div className="space-y-2">
                      <Label>Plano de Acesso</Label>
                      <Select onValueChange={(v) => setNewUser({...newUser, planId: v})}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                          {plans.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="ghost" onClick={() => setIsAddingUser(false)}>Cancelar</Button>
                    <Button onClick={handleAddUser}>Criar Acesso</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
              {userAccounts.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">Nenhum cliente cadastrado ainda.</p>
              ) : (
                userAccounts.map(user => {
                  const plan = plans.find(p => p.id === user.planId);
                  return (
                    <Card key={user.id} className="bg-card border-border">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded-full text-primary"><MonitorPlay /></div>
                          <div>
                            <p className="font-bold text-lg">{user.username}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                              Senha: <span className="font-mono text-primary">{user.password}</span> | Plano: {plan?.name}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => saveUserAccounts(userAccounts.filter(u => u.id !== user.id))}>
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => setIsAddingPlan(true)} className="bg-secondary hover:bg-secondary/90 gap-2">
                <Plus className="w-5 h-5" /> Novo Plano
              </Button>
            </div>

            {isAddingPlan && (
              <Card className="bg-card border-border">
                <CardHeader><CardTitle>Configurar Plano</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do Plano</Label>
                      <Input value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} placeholder="Ex: VIP 30 Dias" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select onValueChange={(v: SubscriptionType) => setNewPlan({...newPlan, type: v})} defaultValue="paid">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trial">Teste</SelectItem>
                          <SelectItem value="paid">Pago</SelectItem>
                          <SelectItem value="personalized">Personalizado</SelectItem>
                          <SelectItem value="lifetime">Vitalício</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="ghost" onClick={() => setIsAddingPlan(false)}>Cancelar</Button>
                    <Button onClick={handleAddPlan}>Salvar Plano</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map(plan => (
                <Card key={plan.id} className="bg-card border-border">
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <span className="text-[10px] uppercase font-bold text-primary">{plan.type}</span>
                  </CardHeader>
                  <CardContent className="flex justify-end">
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => savePlans(plans.filter(p => p.id !== plan.id))}>Excluir</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
