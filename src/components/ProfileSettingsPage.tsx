import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Lock, Settings, Heart, LogOut, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiUpdateMe } from '../utils/api';

interface ProfileSettingsPageProps {
  onBack: () => void;
  onNavigateToFavorites?: () => void;
}

export function ProfileSettingsPage({ onBack, onNavigateToFavorites }: ProfileSettingsPageProps) {
  const { user: authUser, updateUser } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [passwordSectionExpanded, setPasswordSectionExpanded] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const PASSWORD_MIN_LENGTH = 6;
  const PASSWORD_MAX_LENGTH = 14;

  // Inicializar com usuário logado ou localStorage (modo offline/demo)
  useEffect(() => {
    if (authUser) {
      setName(authUser.name || '');
      setEmail(authUser.email || '');
      setOriginalName(authUser.name || '');
      setOriginalEmail(authUser.email || '');
    } else {
      const savedName = localStorage.getItem('userName') || '';
      const savedEmail = localStorage.getItem('userEmail') || '';
      setName(savedName || 'Usuário');
      setEmail(savedEmail || '');
      setOriginalName(savedName || 'Usuário');
      setOriginalEmail(savedEmail || '');
    }
  }, [authUser]);

  const handleSave = async () => {
    setSaveError('');
    setSaving(true);
    try {
      if (authUser) {
        const updated = await apiUpdateMe({ name: name.trim() });
        updateUser({
          id: updated.id,
          email: updated.email,
          name: updated.name ?? updated.email.split('@')[0],
          role: updated.role,
        });
      } else {
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);
      }
      setOriginalName(name);
      setOriginalEmail(email);
    } catch (err: any) {
      setSaveError(err.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(originalName);
    setEmail(originalEmail);
  };

  const handleTogglePasswordSection = () => {
    if (!passwordSectionExpanded) {
      setPasswordError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
    setPasswordSectionExpanded((prev) => !prev);
  };

  const handleClosePasswordSection = () => {
    setPasswordSectionExpanded(false);
    setPasswordError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (!currentPassword.trim()) {
      setPasswordError('Informe a senha atual.');
      return;
    }
    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      setPasswordError(`A nova senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`);
      return;
    }
    if (newPassword.length > PASSWORD_MAX_LENGTH) {
      setPasswordError(`A senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres.`);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('A nova senha e a confirmação não coincidem.');
      return;
    }
    setPasswordSaving(true);
    try {
      await apiUpdateMe({ currentPassword: currentPassword, newPassword });
      handleClosePasswordSection();
    } catch (err: any) {
      setPasswordError(err.message || 'Erro ao alterar senha.');
    } finally {
      setPasswordSaving(false);
    }
  };

  // Quando logado, só nome pode ser alterado; sem login, nome e email (localStorage)
  const hasChanges = authUser
    ? name.trim() !== originalName
    : name !== originalName || email !== originalEmail;

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
                className="flex items-center gap-2 text-white hover:bg-white/20 backdrop-blur-sm px-3 py-2 rounded-[20px] transition-all duration-300 border border-white/40 hover:border-white/60 font-semibold text-sm cursor-pointer"
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
                            <p className="font-bold text-gray-900">{name || 'Usuário'}</p>
                            <p className="text-sm text-gray-500">Perfil</p>
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-[20px] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm"
                />
              </div>

              {/* Email Field - somente leitura quando logado (não alteramos email na API) */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-foreground text-sm font-semibold">
                  <Mail className="w-4 h-4 text-primary" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => !authUser && setEmail(e.target.value)}
                  readOnly={!!authUser}
                  className={`w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-[20px] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm ${authUser ? 'bg-gray-50 cursor-default' : ''}`}
                />
              </div>
            </div>

            {saveError && (
              <p className="mt-2 text-sm text-red-600">{saveError}</p>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              <button 
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className={`px-5 py-2.5 rounded-[20px] hover:shadow-md transition-all font-semibold text-sm shadow-sm ${
                  hasChanges && !saving
                    ? 'bg-primary text-white hover:bg-[#013668] cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              {hasChanges && (
                <button 
                  onClick={handleCancel}
                  className="px-5 py-2.5 border-2 border-gray-300 rounded-[20px] hover:bg-gray-50 transition-all font-semibold text-foreground text-sm cursor-pointer"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white border-2 border-gray-200 rounded-[20px] p-6 sm:p-8 shadow-md">
            <h3 className="mb-6 text-primary font-extrabold">Segurança</h3>
            
            <div className="space-y-4">
              <button
                type="button"
                onClick={authUser ? handleTogglePasswordSection : undefined}
                disabled={!authUser}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-[20px] border-2 border-gray-200 hover:border-primary transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary rounded-full">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-foreground">Alterar Senha</p>
                    <p className="text-xs text-muted-foreground">Atualizar senha de acesso</p>
                  </div>
                </div>
                <ArrowLeft className={`w-5 h-5 text-primary transition-transform ${passwordSectionExpanded ? 'rotate-90' : 'rotate-180 group-hover:translate-x-1'}`} />
              </button>

              {/* Seção expandida: formulário de alterar senha */}
              {passwordSectionExpanded && (
                <div className="pt-8 mt-4 border-t border-gray-200">
                  {passwordError && (
                    <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-[20px] text-sm text-red-800">
                      {passwordError}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="space-y-2 mt-2">
                      <label className="flex items-center gap-2 text-foreground text-sm font-semibold">
                        <Lock className="w-4 h-4 text-primary" />
                        Senha atual
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value.slice(0, PASSWORD_MAX_LENGTH))}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          maxLength={PASSWORD_MAX_LENGTH}
                          className="w-full px-4 py-2.5 pr-12 bg-white border-2 border-gray-200 rounded-[20px] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword((v) => !v)}
                          className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-12 text-gray-500 hover:text-primary rounded-r-[18px] transition-colors"
                          aria-label={showCurrentPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-foreground text-sm font-semibold">
                        Nova senha
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value.slice(0, PASSWORD_MAX_LENGTH))}
                          placeholder={`Min. ${PASSWORD_MIN_LENGTH}, max. ${PASSWORD_MAX_LENGTH} caracteres`}
                          autoComplete="new-password"
                          maxLength={PASSWORD_MAX_LENGTH}
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
                      <p className="text-xs text-muted-foreground">{newPassword.length}/{PASSWORD_MAX_LENGTH}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-foreground text-sm font-semibold">
                        Confirmar nova senha
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmNewPassword ? 'text' : 'password'}
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value.slice(0, PASSWORD_MAX_LENGTH))}
                          placeholder="Repita a nova senha"
                          autoComplete="new-password"
                          maxLength={PASSWORD_MAX_LENGTH}
                          className="w-full px-4 py-2.5 pr-12 bg-white border-2 border-gray-200 rounded-[20px] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmNewPassword((v) => !v)}
                          className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-12 text-gray-500 hover:text-primary rounded-r-[18px] transition-colors"
                          aria-label={showConfirmNewPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        >
                          {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">{confirmNewPassword.length}/{PASSWORD_MAX_LENGTH}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      disabled={passwordSaving}
                      className="px-5 py-2.5 rounded-[20px] bg-primary text-white font-semibold hover:bg-[#013668] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {passwordSaving ? 'Salvando...' : 'Alterar senha'}
                    </button>
                    <button
                      type="button"
                      onClick={handleClosePasswordSection}
                      className="px-5 py-2.5 border-2 border-gray-300 rounded-[20px] hover:bg-gray-50 font-semibold text-foreground text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}