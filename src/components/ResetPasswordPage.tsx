import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, KeyRound, Eye, EyeOff } from 'lucide-react';
import { getHashQueryParams } from '../utils/hashRouting';
import { apiResetPassword } from '../utils/api';

const MIN_LEN = 6;
const MAX_LEN = 14;

interface ResetPasswordPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function ResetPasswordPage({ onBack, onSuccess }: ResetPasswordPageProps) {
  const [tokenValue, setTokenValue] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = getHashQueryParams();
    if (params.token) setTokenValue(params.token);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const token = tokenValue.trim();
    if (!token) {
      setError('Cole o token que você recebeu na página Esqueci minha senha.');
      return;
    }
    if (newPassword.length < MIN_LEN) {
      setError(`A senha deve ter pelo menos ${MIN_LEN} caracteres.`);
      return;
    }
    if (newPassword.length > MAX_LEN) {
      setError(`A senha deve ter no máximo ${MAX_LEN} caracteres.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      await apiResetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-primary border-b border-primary-foreground/10">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-white hover:bg-white/20 backdrop-blur-sm px-3 py-2 rounded-[20px] transition-all font-semibold text-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="bg-white border-2 border-gray-200 rounded-[20px] p-6 sm:p-8 shadow-md text-center">
            <h3 className="mb-2 text-primary font-extrabold">Senha alterada</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Sua senha foi redefinida. Faça login com a nova senha.
            </p>
            <button
              type="button"
              onClick={onSuccess}
              className="w-full px-5 py-3 rounded-[20px] bg-primary text-white font-semibold shadow-md hover:bg-[#013668] transition-all"
            >
              Ir para o login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-primary border-b border-primary-foreground/10">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white hover:bg-white/20 backdrop-blur-sm px-3 py-2 rounded-[20px] transition-all font-semibold text-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
                <KeyRound className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-white font-black tracking-tight" style={{ fontSize: '24px' }}>Nova senha</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white border-2 border-gray-200 rounded-[20px] p-6 sm:p-8 shadow-md">
            <h3 className="mb-2 text-primary font-extrabold">Defina sua nova senha</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Cole o token recebido na página Esqueci minha senha e defina a nova senha (mín. {MIN_LEN}, máx. {MAX_LEN} caracteres).
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-[20px] text-sm text-red-800">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-foreground text-sm font-semibold">
                  Token
                </label>
                <input
                  type="text"
                  value={tokenValue}
                  onChange={(e) => setTokenValue(e.target.value)}
                  placeholder="Cole aqui o token recebido"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-[20px] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-foreground text-sm font-semibold">
                  <Lock className="w-4 h-4 text-primary" />
                  Nova senha
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value.slice(0, MAX_LEN))}
                    placeholder={`Mín. ${MIN_LEN}, máx. ${MAX_LEN} caracteres`}
                    autoComplete="new-password"
                    maxLength={MAX_LEN}
                    className="w-full px-4 py-2.5 pr-12 bg-white border-2 border-gray-200 rounded-[20px] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-12 text-gray-500 hover:text-primary rounded-r-[18px] transition-colors"
                    aria-label={showNewPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-foreground text-sm font-semibold">Confirmar nova senha</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value.slice(0, MAX_LEN))}
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    maxLength={MAX_LEN}
                    className="w-full px-4 py-2.5 pr-12 bg-white border-2 border-gray-200 rounded-[20px] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-12 text-gray-500 hover:text-primary rounded-r-[18px] transition-colors"
                    aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-[20px] bg-primary text-white font-semibold shadow-md hover:bg-[#013668] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : 'Redefinir senha'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
