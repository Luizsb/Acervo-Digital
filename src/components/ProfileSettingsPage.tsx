import React, { useEffect, useState } from 'react';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';

interface ProfileSettingsPageProps {
  onBack: () => void;
}

export function ProfileSettingsPage({ onBack }: ProfileSettingsPageProps) {
  const { user, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name ?? '',
        email: user.email ?? '',
      });
    } else {
      setFormData({ name: '', email: '' });
    }
  }, [user]);

  const handleInputChange = (field: 'name' | 'email', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: 'currentPassword' | 'newPassword' | 'confirmPassword', value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setIsSavingProfile(true);

    try {
      const updatedUser = await authService.updateProfile({
        name: formData.name,
      });

      setProfileSuccess('Perfil atualizado com sucesso!');
      
      // Atualizar contexto de autenticação se necessário
      setTimeout(() => {
        setProfileSuccess('');
      }, 3000);
    } catch (error: any) {
      setProfileError(error.message || 'Erro ao atualizar perfil');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validações
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Todos os campos são obrigatórios');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    setIsChangingPassword(true);
    try {
      // TODO: integrar com endpoint de alteração de senha quando disponível
      // await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      // Simulação de sucesso
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setPasswordSuccess('Senha alterada com sucesso!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => {
        setShowPasswordFields(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error: any) {
      setPasswordError(error.message || 'Erro ao alterar senha. Verifique a senha atual.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando perfil...</div>;
  }

  if (!user) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Nenhum usuário autenticado. Faça login novamente para acessar as configurações.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-primary border-b-4 border-white/30 shadow-2xl">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-3 text-white hover:text-white/80 transition-all duration-300 group mb-4"
          >
            <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-all duration-300">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-bold">Voltar</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white/50">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-white mb-1">Configurações da Conta</h2>
              <p className="text-white/80 text-sm">Gerencie suas preferências e informações pessoais</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-xl">
            <h3 className="mb-6 text-primary">Informações Pessoais</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {profileError && (
                <Alert variant="destructive" className="border-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-semibold">{profileError}</AlertDescription>
                </Alert>
              )}
              
              {profileSuccess && (
                <Alert className="border-2 border-green-500 bg-green-50 flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <AlertDescription className="font-semibold text-green-600 m-0">{profileSuccess}</AlertDescription>
                </Alert>
              )}
              {/* Name Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-foreground">
                  <User className="w-4 h-4 text-primary" />
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground"
                />
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 hover:shadow-2xl transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>

          {/* Security Settings */}
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-xl">
            <h3 className="mb-6 text-primary">Segurança</h3>
            
            {!showPasswordFields ? (
              <button
                onClick={() => setShowPasswordFields(true)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 hover:border-primary transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-destructive rounded-full">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-foreground">Alterar Senha</p>
                    <p className="text-xs text-muted-foreground">Atualizar senha de acesso</p>
                  </div>
                </div>
                <ArrowLeft className="w-5 h-5 text-primary rotate-180 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {passwordError && (
                  <Alert variant="destructive" className="border-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-semibold">{passwordError}</AlertDescription>
                  </Alert>
                )}
                
                {passwordSuccess && (
                  <Alert className="border-2 border-green-500 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="font-semibold text-green-600">{passwordSuccess}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-foreground font-semibold">
                    <Lock className="w-4 h-4 text-primary" />
                    Senha Atual
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      placeholder="Digite sua senha atual"
                      className="w-full px-4 py-3 pr-12 bg-white border-2 border-gray-200 rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                      className="absolute inset-y-0 right-0 flex items-center justify-center pr-6 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-foreground font-semibold">
                    <Lock className="w-4 h-4 text-primary" />
                    Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      placeholder="Digite a nova senha (mín. 6 caracteres)"
                      className="w-full px-4 py-3 pr-12 bg-white border-2 border-gray-200 rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                      className="absolute inset-y-0 right-0 flex items-center justify-center pr-6 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-foreground font-semibold">
                    <Lock className="w-4 h-4 text-primary" />
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      placeholder="Confirme a nova senha"
                      className="w-full px-4 py-3 pr-12 bg-white border-2 border-gray-200 rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute inset-y-0 right-0 flex items-center justify-center pr-6 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 hover:shadow-2xl transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordFields(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setPasswordError('');
                      setPasswordSuccess('');
                    }}
                    className="px-6 py-3 border-2 border-gray-200 rounded-full hover:bg-gray-100 transition-all font-bold text-foreground"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
