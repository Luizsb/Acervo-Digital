import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { BookOpen, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (!name || name.trim() === '') {
      setError('O nome é obrigatório');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, name);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar conta. Tente novamente.';
      setError(errorMessage);
      console.error('Registration error:', err);
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
          <h2 className="text-xl font-bold text-foreground">Criar conta</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Cadastre-se para acessar o acervo digital
          </p>
        </div>

        {/* Formulário */}
        <div className="w-full bg-white rounded-[32px] border-2 border-gray-200 shadow-2xl px-8 py-8">
          <form id="register-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-2 flex items-center gap-3">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <AlertDescription className="font-semibold flex-1">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-foreground font-semibold">
                <User className="w-4 h-4 text-primary" />
                Nome
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 px-4 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

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
                className="h-12 px-4 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
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
                className="h-12 px-4 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {password.length > 0 && password.length < 6 && (
                <p className="text-xs text-muted-foreground">
                  A senha deve ter pelo menos 6 caracteres
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-foreground font-semibold">
                <Lock className="w-4 h-4 text-primary" />
                Confirmar senha
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 px-4 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {confirmPassword.length > 0 && password === confirmPassword && (
                <p className="text-xs text-green-600 flex items-center gap-2 mt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Senhas coincidem
                </p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </div>

            <div className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-secondary hover:text-secondary/80 font-bold underline underline-offset-2 transition-colors"
                >
                  Fazer login
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

