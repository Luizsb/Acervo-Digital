import React, { useState } from 'react';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      {isLogin ? (
        <LoginPage onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <RegisterPage onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </>
  );
}

