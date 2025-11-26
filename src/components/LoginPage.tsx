import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { BookOpen, Mail, Lock, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export function LoginPage({ onSwitchToRegister }: LoginPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      let errorMessage = err.message || 'Erro ao fazer login. Verifique suas credenciais.';
      // Traduzir mensagens de erro comuns
      if (errorMessage.includes('Invalid credentials') || errorMessage.includes('invalid credentials')) {
        errorMessage = 'Credenciais inválidas. Verifique seu e-mail e senha.';
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="mx-auto w-20 h-20 bg-white rounded-3xl border-2 border-primary/10 shadow-2xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-primary mb-2">Acervo Digital</h1>
          <h2 className="text-xl font-bold text-foreground">Bem-vindo de volta!</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Entre na sua conta para acessar o acervo digital
          </p>
        </div>

        {/* Formulário */}
        <div className="w-full bg-white rounded-[32px] border-2 border-gray-200 shadow-2xl px-8 py-8">
          <form id="login-form" onSubmit={handleSubmit} className="space-y-0">
            {error && (
              <Alert variant="destructive" className="border-2 mb-5 flex items-center gap-3">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <AlertDescription className="font-semibold flex-1">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-foreground font-semibold">
                <Mail className="w-4 h-4 text-primary" />
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 px-4"
              />
            </div>

            <div className="space-y-2" style={{ marginTop: '24px', marginBottom: '24px' }}>
              <Label htmlFor="password" className="flex items-center gap-2 text-foreground font-semibold">
                <Lock className="w-4 h-4 text-primary" />
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 px-4"
              />
            </div>

            <div style={{ marginTop: '24px' }}>
              <Button
                type="submit"
                className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </div>

            <div className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-secondary hover:text-secondary/80 font-bold underline underline-offset-2 transition-colors"
                >
                  Criar conta
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
