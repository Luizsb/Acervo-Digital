import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onBack: () => void;
  onLoginSuccess: () => void;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  onNavigateToRegister?: () => void;
}

export function LoginPage({ onBack, onLoginSuccess, login, onNavigateToRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.ok) {
        onLoginSuccess();
      } else {
        setError(result.error || 'E-mail ou senha incorretos. Tente novamente.');
      }
    } catch {
      setError('Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - mesmo padrão da Minha Conta */}
      <div className="sticky top-0 z-50 bg-primary border-b border-primary-foreground/10">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-white hover:bg-white/20 backdrop-blur-sm px-3 py-2 rounded-[20px] transition-all duration-300 border border-white/40 hover:border-white/60 font-semibold text-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
              <div className="h-8 w-px bg-white/30 hidden sm:block" />
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                  <LogIn className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-white font-black tracking-tight" style={{ fontSize: '24px' }}>
                    Entrar
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo - card no mesmo estilo da plataforma */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white border-2 border-gray-200 rounded-[20px] p-6 sm:p-8 shadow-md">
            <h3 className="mb-2 text-primary font-extrabold">Entrar na sua conta</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Use seu e-mail e senha para acessar o Acervo Digital.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-[20px] text-sm text-red-800">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-foreground text-sm font-semibold">
                  <Mail className="w-4 h-4 text-primary" />
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-[20px] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-foreground text-sm font-semibold">
                  <Lock className="w-4 h-4 text-primary" />
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full px-4 py-2.5 pr-12 bg-white border-2 border-gray-200 rounded-[20px] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-12 text-gray-500 hover:text-primary rounded-r-[18px] transition-colors"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-[20px] bg-primary text-white font-semibold shadow-md hover:bg-[#013668] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Entrando...</span>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Entrar</span>
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Primeira vez?{' '}
              {onNavigateToRegister ? (
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="font-semibold text-primary hover:underline"
                >
                  Criar conta
                </button>
              ) : (
                'Peça ao administrador um cadastro ou use a opção de criar conta.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
