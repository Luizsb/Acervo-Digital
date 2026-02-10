import React, { useState } from 'react';
import { Search, X, BookOpen, User, LogIn } from 'lucide-react';
import type { AuthUser } from '../contexts/AuthContext';
import { ProfileMenu } from './ProfileMenu';

interface NavigationProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigateToSettings?: () => void;
  onNavigateToFavorites?: () => void;
  onNavigateToGallery?: () => void;
  onNavigateToLogin?: () => void;
  contentTypeFilter: 'Todos' | 'Audiovisual' | 'OED';
  onContentTypeChange: (type: 'Todos' | 'Audiovisual' | 'OED') => void;
  hideSearch?: boolean;
  user?: AuthUser | null;
  onLogout?: () => void;
}

export function Navigation({ searchQuery, onSearchChange, onNavigateToSettings, onNavigateToFavorites, onNavigateToGallery, onNavigateToLogin, contentTypeFilter, onContentTypeChange, hideSearch = false, user = null, onLogout }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <nav className="sticky top-0 z-50 bg-primary border-b border-primary-foreground/10">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo and brand - aligned left */}
          <div 
            onClick={() => onNavigateToGallery?.()}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h1 className="text-white font-black tracking-tight" style={{ fontSize: '24px' }}>
              Acervo Digital
            </h1>
          </div>

          {/* Right side - Search and Profile (Desktop) */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Desktop Search */}
            {!hideSearch && (
              <div id="acervo-search" className="relative">
                <div className={`flex items-center gap-3 px-5 py-3 bg-white rounded-xl border-2 transition-all duration-300 shadow-md ${
                  isSearchFocused ? 'border-primary shadow-lg shadow-primary/20 scale-105' : 'border-gray-300 shadow-md'
                }`}>
                  <Search className="w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Buscar ODAs..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="bg-transparent text-gray-900 placeholder-gray-500 outline-none w-72 font-semibold"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Limpar pesquisa"
                    >
                      <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Entrar (sem login) ou Menu do usuário (logado) */}
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 group"
                  >
                    <User className="w-5 h-5 text-gray-700 group-hover:text-primary transition-colors" />
                  </button>
                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                      <div className="absolute right-0 top-full mt-3 z-50">
                        <ProfileMenu
                          user={user}
                          onClose={() => setIsProfileOpen(false)}
                          onNavigateToSettings={() => onNavigateToSettings?.()}
                          onNavigateToFavorites={() => onNavigateToFavorites?.()}
                          onLogout={() => onLogout?.()}
                        />
                      </div>
                    </>
                  )}
                </>
              ) : (
                <button
                  onClick={onNavigateToLogin}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-primary border-2 border-white/60 hover:bg-white/90 rounded-xl font-semibold text-sm transition-all shadow-md"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Entrar</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile - Search Icon and Profile */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Mobile Menu Button */}
            {!hideSearch && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300"
              >
                {isMenuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Search className="w-5 h-5 text-gray-700" />}
              </button>
            )}
            
            {/* Mobile: Entrar ou Profile */}
            {user ? (
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300">
                <User className="w-5 h-5 text-gray-700" />
              </button>
            ) : (
              <button onClick={onNavigateToLogin} className="flex items-center gap-2 px-3 py-2.5 bg-white text-primary border border-white/60 rounded-xl font-semibold text-sm">
                <LogIn className="w-5 h-5" />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu - Search */}
      {!hideSearch && isMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg">
          <div className="px-4 py-4">
            {/* Mobile Search */}
            <div className="relative">
              <div className="bg-white border-2 border-gray-300 rounded-xl px-4 py-3 flex items-center gap-3 shadow-md">
                <Search className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar ODAs..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-500 font-semibold"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Limpar pesquisa"
                  >
                    <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Profile Menu */}
      {isProfileOpen && (
        <>
          {/* Backdrop to close menu */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40" 
            onClick={() => setIsProfileOpen(false)}
          ></div>
          
          <div className="lg:hidden absolute top-full right-4 mt-2 z-50">
            {user && (
              <ProfileMenu
                user={user}
                onClose={() => setIsProfileOpen(false)}
                onNavigateToSettings={() => onNavigateToSettings?.()}
                onNavigateToFavorites={() => onNavigateToFavorites?.()}
                onLogout={() => onLogout?.()}
              />
            )}
          </div>
        </>
      )}
    </nav>
  );
}