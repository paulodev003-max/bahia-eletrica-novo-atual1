import React from 'react';
import { Moon, Sun, Menu, X, LogOut } from 'lucide-react';
import { View, UserProfile } from '../../types';

interface HeaderProps {
    user: UserProfile;
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
    currentView: View;
    darkMode: boolean;
    setDarkMode: (mode: boolean) => void;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, toggleSidebar, isSidebarOpen, currentView, darkMode, setDarkMode, onLogout }) => {
    const viewTitles: Record<View, { full: string; short: string }> = {
        [View.DASHBOARD]: { full: 'Dashboard Gerencial', short: 'Dashboard' },
        [View.INVENTORY]: { full: 'Controle de Materiais', short: 'Estoque' },
        [View.SERVICES]: { full: 'Catálogo de Serviços', short: 'Serviços' },
        [View.CUSTOMERS]: { full: 'Gestão de Clientes', short: 'Clientes' },
        [View.AGENDA]: { full: 'Agenda de Serviços', short: 'Agenda' },
        [View.SIMULATOR]: { full: 'Inteligência de Preços', short: 'Simulador' },
        [View.BUDGETS]: { full: 'Orçamentos', short: 'Orçamentos' },
        [View.KANBAN]: { full: 'Gestão de Projetos', short: 'Projetos' },
        [View.EXPENSES]: { full: 'Despesas Operacionais', short: 'Despesas' },
        [View.SETTINGS]: { full: 'Configurações', short: 'Config.' },
    };

    const title = viewTitles[currentView] || { full: '', short: '' };

    return (
        <header className="h-14 sm:h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-3 sm:px-6 z-20 shrink-0">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex-shrink-0"
                    aria-label="Toggle menu"
                >
                    {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                {/* Mobile: short title, Desktop: full title */}
                <h2 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white truncate">
                    <span className="sm:hidden">{title.short}</span>
                    <span className="hidden sm:inline">{title.full}</span>
                </h2>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                {/* User Profile */}
                <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200 dark:border-gray-700">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[120px]">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[120px]">{user.email}</p>
                    </div>
                    {user.picture ? (
                        <img src={user.picture} alt="User" className="w-8 h-8 rounded-full border border-gray-200 flex-shrink-0" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold flex-shrink-0">
                            {user.name.charAt(0)}
                        </div>
                    )}

                    <button
                        onClick={onLogout}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                        title="Sair"
                        aria-label="Logout"
                    >
                        <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>

                <div className="h-6 sm:h-8 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 sm:p-2.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-gray-600 transition-all"
                    aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
                >
                    {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
            </div>
        </header>
    );
};

export default Header;
