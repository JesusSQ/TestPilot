import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
    dir: './',
});

// Rutas de mock para assets estáticos y CSS
const mockFile = '<rootDir>/__mocks__/fileMock.js';
const mockIdentity = 'identity-obj-proxy';

const baseConfig: Config = {
    coverageProvider: 'v8', 
    moduleDirectories: ['node_modules', '<rootDir>/'],
    
    // **NOTA**: setupFilesAfterEnv se ha ELIMINADO de baseConfig
    // y se ha movido al proyecto 'client' para asegurar la carga.
    // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], 

    moduleNameMapper: {
        // Alias de rutas
        '^@/(.*)$': '<rootDir>/src/$1',
        // Mocks para CSS/Assets
        '\\.(css|less|sass|scss)$': mockIdentity, 
        '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': mockFile, 
    },
    
    // Indica a Jest que use Babel para transpilar JSX/TSX
    transform: {
        '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
    },

    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
};

const jestConfig: Config = {
    ...baseConfig,
    projects: [
        {
            // 1. PROJECT: Frontend (Componentes)
            displayName: 'client',
            testEnvironment: 'jsdom',
            // **AJUSTE CRÍTICO**: Lo movemos aquí para forzar la carga en el entorno JSDOM
            setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], 
            testMatch: ['<rootDir>/src/components/**/*.((test|spec)).(ts|tsx)'],
        },
        {
            // 2. PROJECT: Backend (API Routes)
            displayName: 'server',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/src/app/api/**/*.test.ts'],
        },
    ],
};

export default createJestConfig(jestConfig);