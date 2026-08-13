import React, { useState } from 'react';
import { ArrowLeft, Rocket } from 'lucide-react';
import { BrandMark } from './BrandMark';
import './LoginPage.css';

/** Acesso de teste via seed local até o SSO JumpCloud estar ligado. */
const DEMO_EMAIL = 'demo@acervo.local';
const DEMO_PASSWORD = 'demo1234';

interface LoginPageProps {
  onBack?: () => void;
  onLoginSuccess: () => void;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
}

export function LoginPage({ onBack, onLoginSuccess, login }: LoginPageProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const enterWithJumpCloud = async () => {
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
            onClick={() => void enterWithJumpCloud()}
            disabled={loading}
          >
            <Rocket size={16} />
            {loading ? 'Entrando...' : 'Acessar o acervo'}
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
