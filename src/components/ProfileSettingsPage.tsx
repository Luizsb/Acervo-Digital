import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Briefcase, Lock, Settings, Heart, LogOut } from 'lucide-react';

interface ProfileSettingsPageProps {
  onBack: () => void;
  onNavigateToFavorites?: () => void;
}

export function ProfileSettingsPage({ onBack, onNavigateToFavorites }: ProfileSettingsPageProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-primary border-b border-primary-foreground/10">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo and Back Button - aligned left */}
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-white hover:bg-white/20 backdrop-blur-sm px-3 py-2 rounded-[20px] transition-all duration-300 border border-white/40 hover:border-white/60 font-semibold text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
              
              <div className="h-8 w-px bg-white/30 hidden sm:block"></div>
              
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-white font-black tracking-tight" style={{ fontSize: '24px' }}>
                    Minha Conta
                  </h2>
                </div>
              </div>
            </div>

            {/* User button with dropdown - right side */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 group"
                >
                  <User className="w-5 h-5 text-gray-700 group-hover:text-primary transition-colors" />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <>
                    {/* Backdrop to close menu */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsProfileOpen(false)}
                    ></div>
                    
                    <div className="absolute right-0 top-full mt-3 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                      <div className="p-5 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">Usuário</p>
                            <p className="text-sm text-gray-500">Consultor Pedagógico</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <button 
                          onClick={() => {
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl transition-all duration-200 group"
                        >
                          <Settings className="w-5 h-5 text-primary transition-colors" />
                          <span className="font-semibold text-primary">Minha Conta</span>
                        </button>
                        
                        <button 
                          onClick={() => {
                            setIsProfileOpen(false);
                            onNavigateToFavorites?.();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                        >
                          <Heart className="w-5 h-5 text-gray-600 group-hover:text-secondary transition-colors" />
                          <span className="font-semibold text-gray-700 group-hover:text-secondary">Meus Favoritos</span>
                        </button>

                        <div className="h-px bg-gray-100 my-2"></div>

                        <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl transition-all duration-200 group">
                          <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
                          <span className="font-semibold text-gray-700 group-hover:text-red-600">Sair</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white border-2 border-gray-200 rounded-[20px] p-6 sm:p-8 shadow-md">
            <h3 className="mb-6 text-primary font-extrabold">Informações Pessoais</h3>
            
            <div className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-foreground text-sm font-semibold">
                  <User className="w-4 h-4 text-primary" />
                  Nome Completo
                </label>
                <input
                  type="text"
                  defaultValue="Maria Silva Santos"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-[20px] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-foreground text-sm font-semibold">
                  <Mail className="w-4 h-4 text-primary" />
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="maria.santos@escola.edu.br"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-[20px] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm"
                />
              </div>

              {/* Role Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-foreground text-sm font-semibold">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Cargo
                </label>
                <input
                  type="text"
                  defaultValue="Consultora Pedagógica"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-[20px] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              <button className="px-5 py-2.5 bg-primary text-white rounded-[20px] hover:bg-[#013668] hover:shadow-md transition-all font-semibold text-sm shadow-sm">
                Salvar Alterações
              </button>
              <button className="px-5 py-2.5 border-2 border-gray-300 rounded-[20px] hover:bg-gray-50 transition-all font-semibold text-foreground text-sm">
                Cancelar
              </button>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white border-2 border-gray-200 rounded-[20px] p-6 sm:p-8 shadow-md">
            <h3 className="mb-6 text-primary font-extrabold">Segurança</h3>
            
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-[20px] border-2 border-gray-200 hover:border-primary transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary rounded-full">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-foreground">Alterar Senha</p>
                    <p className="text-xs text-muted-foreground">Atualizar senha de acesso</p>
                  </div>
                </div>
                <ArrowLeft className="w-5 h-5 text-primary rotate-180 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}