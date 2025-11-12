import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginForm from './LoginForm'; 

// Mockear el router de Next.js
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

describe('Login Component Frontend Environment Verification', () => {
    it('should confirm the environment is JSDOM and render the core elements', () => {
        
        // 1. Ejecuta una acción de JSDOM (renderizar el componente real)
        render(<LoginForm />);
        
        // 2. Comprobación de JSDOM: 'window' DEBE existir
        // El entorno 'jsdom' se confirma si esta aserción pasa
        // @ts-ignore
        expect(typeof window).toBe('object');
        // @ts-ignore
        expect(window).toBeDefined();

        // 3. Comprobación de JSDOM: Debe encontrar un elemento usando DOM APIs simuladas
        // Buscamos el botón de inicio de sesión que existe en tu JSX
        const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
        const emailInput = screen.getByLabelText(/Correo Electrónico/i);

        expect(submitButton).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();
    });
});