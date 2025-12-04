import React, { useState } from 'react';
import { Search, Menu, X, BookOpen, User, Heart, Settings, LogOut, Video, Gamepad2 } from 'lucide-react';

interface NavigationProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigateToSettings?: () => void;
  onNavigateToFavorites?: () => void;
  onNavigateToGallery?: () => void;
  contentTypeFilter: 'Todos' | 'Audiovisual' | 'OED';
  onContentTypeChange: (type: 'Todos' | 'Audiovisual' | 'OED') => void;
  hideSearch?: boolean;
}

export function Navigation({ searchQuery, onSearchChange, onNavigateToSettings, onNavigateToFavorites, onNavigateToGallery, contentTypeFilter, onContentTypeChange, hideSearch = false }: NavigationProps) {
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
              <div className="relative">
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

            {/* Profile Menu */}
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
                          onNavigateToSettings?.();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                      >
                        <Settings className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
                        <span className="font-semibold text-gray-700 group-hover:text-primary">Minha Conta</span>
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
            
            {/* Mobile Profile Button */}
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300"
            >
              <User className="w-5 h-5 text-gray-700" />
            </button>
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
          
          <div className="lg:hidden absolute top-full right-4 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
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
                  onNavigateToSettings?.();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
              >
                <Settings className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
                <span className="font-semibold text-gray-700 group-hover:text-primary">Minha Conta</span>
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
    </nav>
  );
}