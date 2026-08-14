import React, { useState } from 'react';
import { ArrowLeft, ClipboardList, Rocket } from 'lucide-react';
import { BrandMark } from './BrandMark';
import './LoginPage.css';

/** Acesso de teste via seed local até o SSO JumpCloud estar ligado. */
const DEMO_EMAIL = 'demo@acervo.local';
const DEMO_PASSWORD = 'demo1234';
const ADMIN_EMAIL = 'admin@acervo.local';
const ADMIN_PASSWORD = 'admin1234';

interface LoginPageProps {
  onBack?: () => void;
  onLoginSuccess: () => void;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
}

export function LoginPage({ onBack, onLoginSuccess, login }: LoginPageProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<'acervo' | 'admin' | null>(null);

  const enter = async (kind: 'acervo' | 'admin') => {
    setError('');
    setLoading(kind);
    const email = kind === 'admin' ? ADMIN_EMAIL : DEMO_EMAIL;
    const password = kind === 'admin' ? ADMIN_PASSWORD : DEMO_PASSWORD;
    try {
      const result = await login(email, password);
      if (result.ok) {
        onLoginSuccess();
      } else {
        setError(result.error || 'Não foi possível entrar. Verifique se o backend está rodando.');
      }
    } catch {
      setError('Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(null);
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
              <BrandMark />
            </span>
            <span className="login-brand-text">
              <span className="login-brand-title">Acervo Digital</span>
              <span className="login-brand-subtitle">Catálogo interno de ODAs e audiovisual</span>
            </span>
          </div>

          <h1 className="login-title">Entrar</h1>
          <p className="login-lead">
            O acesso será via JumpCloud. A integração ainda não está habilitada: por enquanto, é só clicar no botão para entrar.
          </p>

          {error ? (
            <p className="login-error" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            className="login-jumpcloud"
            onClick={() => void enter('acervo')}
            disabled={loading !== null}
          >
            <Rocket size={16} />
            {loading === 'acervo' ? 'Entrando...' : 'Acessar o acervo'}
          </button>

          <button
            type="button"
            className="login-admin"
            onClick={() => void enter('admin')}
            disabled={loading !== null}
          >
            <ClipboardList size={16} />
            {loading === 'admin' ? 'Entrando...' : 'Acesso admin (provisório)'}
          </button>
        </section>
      </div>

      <p className="login-footer">
        Desenvolvido pelo time de Interações Digitais
        <span className="login-footer-version">v1.1</span>
      </p>
    </div>
  );
}
