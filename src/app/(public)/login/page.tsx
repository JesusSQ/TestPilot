'use client';

import React from 'react';
import LoginForm from '@/components/Auth/LoginForm';

const LoginPage = () => {
  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <LoginForm />
    </main>
  );
};

export default LoginPage;