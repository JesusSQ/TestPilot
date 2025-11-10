'use client';

import React from 'react';
import LoginForm from '@/components/Auth/LoginForm';
import Link from 'next/link'

const LoginPage = () => {
return (
    <main className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            
            {/* Contenedor Flotante del Formulario: Replicando el estilo suave del mockup */}
        <div className="p-8 md:p-10 bg-white rounded-2xl shadow-xl w-full max-w-md">
                    
                    {/* Icono del Coche (Parte superior del mockup) */}
                    <div className="flex justify-center mb-6">
                            <div className="p-3 bg-yellow-100 rounded-full">
                                    {/* Icono de coche grande y dorado */}
                                    <svg className="h-10 w-10 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6zM7 16h10m-3-10h-4M5 10V6a2 2 0 012-2h10a2 2 0 012 2v4" /></svg>
                            </div>
                    </div>
                    
                    {/* Título Principal */}
                    <h1>
                            <span className="block text-center text-3xl font-bold text-gray-800 mb-2">Arranca el viaje</span>
                    </h1>
                    
                    <p className="text-center text-sm text-gray-500 mb-8">
                            Inicia sesión o solicita acceso a un administrador aquí.
                    </p>
 
            <LoginForm />

            {/* Enlace de Registro */}
            <p className="mt-8 text-center text-sm text-gray-600">
                    ¿Aún no tienes cuenta? 
                    <Link href="/register" className="font-semibold text-yellow-700 hover:text-yellow-800 ml-1">
                            Regístrate
                    </Link>
            </p>
        </div>
    </main>
);
};

export default LoginPage;