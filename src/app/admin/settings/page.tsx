
"use client";
import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useContentStore } from '@/hooks/use-content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Settings as SettingsIcon, Save, Lock, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const { settings, saveSettings, isLoaded } = useContentStore();
  const { toast } = useToast();
  const [password, setPassword] = useState(settings.parentalPassword || '');

  if (!isLoaded) return null;

  const handleSave = () => {
    saveSettings({ ...settings, parentalPassword: password });
    toast({ title: "Configurações Salvas", description: "Senha de controle parental atualizada." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-12 px-4 md:px-8 space-y-8">
        <h1 className="text-4xl font-bold font-headline flex items-center gap-3">
          <SettingsIcon className="text-primary" /> Configurações do Sistema
        </h1>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border-border shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-white/5 p-8">
              <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tighter">
                <ShieldCheck className="text-primary w-6 h-6" /> Segurança e Controle
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-muted-foreground">
                  <Lock className="w-4 h-4" /> Senha de Controle Parental
                </div>
                <div className="space-y-2">
                  <Label>Senha Mestre para Conteúdos Bloqueados</Label>
                  <Input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="Digite a senha..."
                    className="h-14 bg-background border-white/10 text-xl font-black tracking-[0.5em] text-center"
                  />
                  <p className="text-xs text-muted-foreground pt-2">
                    Essa senha será solicitada sempre que um usuário tentar acessar um conteúdo marcado como "Proibido/Bloqueado".
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-8 border-t border-white/5">
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 gap-3 px-12 h-14 text-lg font-black shadow-2xl rounded-full">
                  <Save className="w-6 h-6" /> SALVAR CONFIGURAÇÕES
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
