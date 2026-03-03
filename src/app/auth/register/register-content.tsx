"use client"

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, User, Store, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/use-auth-store';

export default function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'cliente';
  const { toast } = useToast();
  const setUser = useAuthStore((state) => state.setUser);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    cpf: '',
    pixKey: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userProfile = {
        id: Date.now().toString(),
        nome: formData.nome,
        email: formData.email,
        role: role as any,
        balance: 0,
        status: role === 'cambista' ? 'pending' : 'approved',
        cpf: formData.cpf,
        pixKey: formData.pixKey,
        phone: formData.phone,
        createdAt: new Date().toISOString(),
      };

      setUser(userProfile);

      toast({
        title: "Cadastro Realizado",
        description: "Sua conta foi criada com sucesso!",
      });

      router.push(`/login?role=${role}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-12">
      <Link href={`/login?role=${role}`} className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <Card className="w-full max-w-2xl shadow-2xl border-t-4 border-t-accent">
        <CardHeader className="text-center">
          <div className="mx-auto bg-accent/10 p-4 rounded-full w-fit mb-4">
            {role === 'cambista' ? <Store className="w-8 h-8 text-accent" /> : <User className="w-8 h-8 text-accent" />}
          </div>
          <CardTitle className="text-2xl font-bold">Cadastro</CardTitle>
          <CardDescription>Crie sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" placeholder="Seu nome" required onChange={handleChange} disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" required onChange={handleChange} disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" placeholder="000.000.000-00" required onChange={handleChange} disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" placeholder="(00) 00000-0000" required onChange={handleChange} disabled={loading} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="pixKey">Chave PIX</Label>
                <Input id="pixKey" placeholder="CPF ou Email" required onChange={handleChange} disabled={loading} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" required onChange={handleChange} disabled={loading} />
              </div>
            </div>
            
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 h-12" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : null}
              Cadastrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
