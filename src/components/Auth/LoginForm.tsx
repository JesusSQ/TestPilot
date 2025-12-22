import { useRouter } from "next/navigation";
import React from "react";
import { useState } from "react";

interface UserData {
    id: number;
    email: string;
    role: 'ADMIN' | 'STUDENT';
    firstName: string;
    mustChangePassword: boolean;
}

interface LoginResponse {
    message: string;
    token: string;
    user: UserData;
}

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body:JSON.stringify({ email, password })
            })

            const data: LoginResponse = await response.json();

            if (response.ok) {
                localStorage.setItem('auth_token', data.token);

                if (data.user.role === 'ADMIN') {
                    if (data.user.mustChangePassword) {
                        router.push('/admin/cambiar-contrasena');
                    } else {
                        router.push('/admin/inicio');
                    }
                } else if (data.user.role === 'STUDENT') {
                    router.push('/estudiante/inicio')
                }
            } else {
                setError(data.message || 'Login failed. Please check your credentials.')
            }

        } catch (e) {
            setError('A network error ocurred. Check your connection.')
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
                <p className="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
                    {error}
                </p>
            )}
            
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico
                </label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M3 8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /></svg>
                    </span>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Ingrese su correo electrónico"
                        required
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-yellow-700 focus:border-yellow-700 transition duration-150 ease-in-out placeholder-gray-500 text-gray-800"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                </label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v3" /></svg>
                    </span>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ingrese su contraseña"
                        required
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-yellow-700 focus:border-yellow-700 transition duration-150 ease-in-out placeholder-gray-500 text-gray-800"
                    />
                </div>
                <div className="mt-2 text-right">
                    <a href="#" className="text-sm font-medium text-yellow-700 hover:text-yellow-800 transition duration-150 ease-in-out">
                        ¿Olvidaste la contraseña?
                    </a>
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-2 px-4 rounded-full font-semibold text-white transition duration-200 ease-in-out ${
                    loading 
                    ? 'bg-yellow-400 cursor-not-allowed' 
                    : 'bg-yellow-700 hover:bg-yellow-800 shadow-md'
                }`}
            >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
        </form>
    );
};

export default LoginForm;  