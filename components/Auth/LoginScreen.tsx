import React, { useState } from 'react';
import { Zap, Shield, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { UserProfile } from '../../types';
import { SupabaseService } from '../../services/SupabaseService';

interface LoginScreenProps {
    onLogin: (user: UserProfile) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!email || !password) throw new Error("Preencha email e senha");

            await SupabaseService.login(email, password);

            const user = await SupabaseService.getCurrentUser();

            if (user) {
                onLogin(user as UserProfile);
            } else {
                throw new Error("Usuário autenticado mas perfil não encontrado.");
            }
        } catch (err: any) {
            console.error("Login error:", err);
            setError(err.message || "Erro na autenticação. Verifique suas credenciais.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-brand-900 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-scale-in">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/40 mb-4 transform -rotate-3">
                        <Zap className="w-8 h-8" fill="currentColor" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 text-center">BAHIA ELÉTRICA</h1>
                    <p className="text-xs text-brand-600 font-bold tracking-[0.3em] uppercase mb-2">& AUTOMAÇÃO</p>
                    <p className="text-gray-500 text-sm text-center mt-2">Sistema de Gestão Integrada</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processando...' : (
                            <>
                                <Shield className="w-5 h-5" />
                                Acessar Sistema
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} Bahia Elétrica. Desenvolvido por Chip7 Sistemas Solução em Automação.
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
