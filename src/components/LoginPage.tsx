import React, { useState } from 'react';
import { BookOpen, Eye, EyeOff, Rocket } from 'lucide-react';
import './LoginPage.css';

/** Credenciais do usuário demo (seed local). Substituir por JumpCloud SSO. */
const DEMO_EMAIL = 'demo@acervo.local';
const DEMO_PASSWORD = 'demo1234';

interface LoginPageProps {
  onBack?: () => void;
  onLoginSuccess: () => void;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
}

export function LoginPage({ onBack, onLoginSuccess, login }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const enterAsDemo = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await login(DEMO_EMAIL, DEMO_PASSWORD);
      if (result.ok) {
        onLoginSuccess();
      } else {
        setError(result.error || 'Não foi possível entrar. Verifique se o backend está rodando.');
      }
    } catch {
      setError('Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {onBack ? (
        <button type="button" className="login-back" onClick={onBack}>
          <ArrowLeft size={16} />
          Voltar
        </button>
      ) : null}

      <div className="login-stack">
        <section className="login-card">
          <div className="login-brand">
            <span className="login-brand-mark" aria-hidden="true">
              <BookOpen size={24} color="#fff" />
            </span>
            <span className="login-brand-text">
              <span className="login-brand-title">Acervo Digital</span>
              <span className="login-brand-subtitle">Objetos digitais de aprendizagem</span>
            </span>
          </div>

          <h1 className="login-title">Entrar</h1>

          <form
            className="login-form"
            onSubmit={(e) => {
              e.preventDefault();
              void enterAsDemo();
            }}
          >
            <label className="login-label" htmlFor="login-email">
              E-mail
            </label>
            <input
              id="login-email"
              className="login-field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="someone@example.com"
              autoComplete="username"
            />

            <label className="login-label login-label-spaced" htmlFor="login-password">
              Senha
            </label>
            <div className="login-password-wrap">
              <input
                id="login-password"
                className="login-field login-field-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value.slice(0, 14))}
                placeholder="••••••••"
                autoComplete="current-password"
                maxLength={14}
              />
              <button
                type="button"
                className="login-eye"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="button"
              className="login-help"
              onClick={() =>
                setError('SSO em preparação. Use Entrar com JumpCloud Go para acessar o ambiente de teste.')
              }
            >
              Não consegue acessar sua conta?
            </button>

            {error ? (
              <p className="login-error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="login-actions">
              <button
                type="button"
                className="login-jumpcloud"
                onClick={() => void enterAsDemo()}
                disabled={loading}
              >
                <Rocket size={16} />
                {loading ? 'Entrando...' : 'Entrar com JumpCloud Go'}
              </button>
              <button type="submit" className="login-advance" disabled={loading}>
                {loading ? 'Entrando...' : 'Avançar'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
