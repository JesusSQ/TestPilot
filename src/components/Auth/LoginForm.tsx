"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Car } from "lucide-react";
import Link from "next/link";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login({
          username: data.user.firstName,
          role: data.user.role,
          email: data.user.email
        });
        router.push("/admin/inicio");
      } else {
        setError(data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      setError("Error de conexión");
    }
  };

  return (
    <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md text-center border border-gray-50">
      {/* Icono del Coche */}
      <div className="flex justify-center mb-6">
        <div className="bg-yellow-50 p-4 rounded-full">
          <Car className="text-yellow-700" size={32} />
        </div>
      </div>
      
      {/* Textos Informativos */}
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Arranca el viaje</h2>
      <p className="text-gray-400 text-sm mb-8">Inicia sesión o solicita acceso a un administrador aquí.</p>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1 tracking-wider">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition text-gray-700"
            placeholder="tu@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1 tracking-wider">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition text-gray-700"
            placeholder="••••••••"
            required
          />
        </div>

        {error && <p className="text-red-500 text-xs mt-2 ml-1 font-medium">{error}</p>}

        <button 
          type="submit" 
          className="w-full bg-yellow-700 text-white py-4 rounded-2xl font-bold text-lg hover:bg-yellow-800 transition shadow-lg shadow-yellow-700/20 mt-4"
        >
          Entrar
        </button>
      </form>

      {/* Pie de Formulario */}
      <p className="mt-8 text-sm text-gray-500">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/register" className="text-yellow-700 font-bold hover:underline transition">
          Regístrate
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;