import React from 'react';
import { ArrowLeft, KeyRound, MessageCircle } from 'lucide-react';

interface ForgotPasswordPageProps {
  onBack: () => void;
  onNavigateToLogin?: () => void;
}

export function ForgotPasswordPage({ onBack, onNavigateToLogin }: ForgotPasswordPageProps) {
  return (
    <div className="min-h-screen bg-background">
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
                  <KeyRound className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-white font-black tracking-tight" style={{ fontSize: '24px' }}>
                    Esqueci minha senha
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white border-2 border-gray-200 rounded-[20px] p-6 sm:p-8 shadow-md">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-primary" />
              </div>
            </div>
            <h3 className="mb-2 text-primary font-extrabold text-center">Redefinir senha</h3>
            <p className="mb-6 text-sm text-muted-foreground text-center">
              Para redefinir sua senha, entre em contato com o <strong>administrador do sistema</strong>.
            </p>
            {onNavigateToLogin && (
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="w-full px-5 py-3 rounded-[20px] bg-primary text-white font-semibold shadow-md hover:bg-[#013668] transition-all"
              >
                Voltar ao login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
