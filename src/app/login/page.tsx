
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tv, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [mode, setMode] = useState<'selection' | 'admin' | 'user'>('selection');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'admin') {
      if (email === 'lrnegocio007@gmail.com' && password === '135796lR@') {
        localStorage.setItem('leo_tv_session', 'admin');
        router.push('/admin');
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro de Autenticação',
          description: 'Credenciais de administrador inválidas.',
        });
      }
    } else {
      // Mock user login
      localStorage.setItem('leo_tv_session', 'user');
      router.push('/');
    }
  };

  if (mode === 'selection') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Tv className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-bold font-headline tracking-tighter">Léo Tv & Stream</h1>
          </div>
          <p className="text-muted-foreground text-lg">Escolha como deseja acessar a plataforma</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <Card 
            className="cursor-pointer hover:border-primary transition-all duration-300 group bg-card border-border"
            onClick={() => setMode('admin')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-full group-hover:bg-primary/20 transition-colors mb-4">
                <ShieldCheck className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="font-headline">Administrador</CardTitle>
              <CardDescription>Gerencie conteúdos, usuários e planos.</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:border-accent transition-all duration-300 group bg-card border-border"
            onClick={() => setMode('user')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto bg-accent/10 p-4 rounded-full group-hover:bg-accent/20 transition-colors mb-4">
                <UserIcon className="w-10 h-10 text-accent" />
              </div>
              <CardTitle className="font-headline">Usuário</CardTitle>
              <CardDescription>Assista a seus conteúdos favoritos agora.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => setMode('selection')}>Voltar</Button>
          </div>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            {mode === 'admin' ? <ShieldCheck className="text-primary" /> : <UserIcon className="text-accent" />}
            Entrar como {mode === 'admin' ? 'Administrador' : 'Usuário'}
          </CardTitle>
          <CardDescription>
            Insira suas credenciais para acessar o painel de {mode === 'admin' ? 'controle' : 'streaming'}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <Button 
              type="submit" 
              className={`w-full ${mode === 'admin' ? 'bg-primary' : 'bg-accent'}`}
            >
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
