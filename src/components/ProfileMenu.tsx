import React from 'react';
import { User, Settings, Heart, LogOut, Sparkles } from 'lucide-react';
import type { AuthUser } from '../contexts/AuthContext';
import { resetOnboardingProgress, startOnboardingIfNeeded } from '../utils/onboarding';

interface ProfileMenuProps {
  user: AuthUser;
  onClose: () => void;
  onNavigateToSettings: () => void;
  onNavigateToFavorites: () => void;
  onLogout: () => void;
  /** Classe do container do dropdown (ex.: posicionamento absoluto) */
  className?: string;
}

export function ProfileMenu({
  user,
  onClose,
  onNavigateToSettings,
  onNavigateToFavorites,
  onLogout,
  className = '',
}: ProfileMenuProps) {
  return (
    <div
      className={`w-72 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden ${className}`}
    >
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{user.name || 'Usuário'}</p>
          </div>
        </div>
      </div>
      <div className="p-2">
        <button
          type="button"
          onClick={() => {
            onClose();
            onNavigateToSettings();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
        >
          <Settings className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
          <span className="font-semibold text-gray-700 group-hover:text-primary">Minha Conta</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onClose();
            onNavigateToFavorites();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
        >
          <Heart className="w-5 h-5 text-gray-600 group-hover:text-secondary transition-colors" />
          <span className="font-semibold text-gray-700 group-hover:text-secondary">Meus Favoritos</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onClose();
            resetOnboardingProgress();
            window.location.hash = '#/acervo';
            setTimeout(() => {
              startOnboardingIfNeeded();
            }, 700);
          }}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
        >
          <Sparkles className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
          <span className="font-semibold text-gray-700 group-hover:text-primary">Rever tour do acervo</span>
        </button>
        <div className="h-px bg-gray-100 my-2" />
        <button
          type="button"
          onClick={() => {
            onClose();
            onLogout();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
          <span className="font-semibold text-gray-700 group-hover:text-red-600">Sair</span>
        </button>
      </div>
    </div>
  );
}
