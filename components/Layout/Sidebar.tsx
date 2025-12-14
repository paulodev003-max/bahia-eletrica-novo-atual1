import React from 'react';
import { LayoutDashboard, Package, Calculator, Users, Calendar, Wrench, Zap, FileText, Trello, TrendingDown } from 'lucide-react';
import { View } from '../../types';

interface SidebarProps {
    currentView: View;
    setCurrentView: (view: View) => void;
    isSidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isSidebarOpen, setSidebarOpen }) => {
    const NavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
        <button
            onClick={() => {
                setCurrentView(view);
                setSidebarOpen(false); // Close on mobile select
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${currentView === view
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
        >
            <Icon className={`w-5 h-5 ${currentView === view ? 'animate-pulse' : ''}`} />
            <span className="font-medium z-10">{label}</span>
            {currentView === view && (
                <div className="absolute right-0 top-0 h-full w-1 bg-white/20"></div>
            )}
        </button>
    );

    return (
        <>
            <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col shadow-2xl lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="h-full flex flex-col p-6">
                    <div className="flex flex-col gap-1 mb-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-500/40">
                                <Zap className="w-6 h-6" fill="currentColor" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">BAHIA ELÉTRICA</h1>
                                <p className="text-[10px] text-brand-600 dark:text-brand-400 font-bold tracking-widest uppercase">& AUTOMAÇÃO</p>
                            </div>
                        </div>
                    </div>

                    <nav className="space-y-2 flex-1">
                        <NavItem view={View.DASHBOARD} icon={LayoutDashboard} label="Visão Geral" />
                        <NavItem view={View.AGENDA} icon={Calendar} label="Agenda Técnica" />
                        <NavItem view={View.KANBAN} icon={Trello} label="Gestão de Projetos" />
                        <NavItem view={View.INVENTORY} icon={Package} label="Estoque & Produtos" />
                        <NavItem view={View.SERVICES} icon={Wrench} label="Serviços Técnicos" />
                        <NavItem view={View.CUSTOMERS} icon={Users} label="Clientes & Vendas" />
                        <NavItem view={View.BUDGETS} icon={FileText} label="Orçamentos" />
                        <NavItem view={View.EXPENSES} icon={TrendingDown} label="Despesas Operacionais" />
                        <NavItem view={View.SIMULATOR} icon={Calculator} label="Preços & Simulação" />
                        <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700">
                            <NavItem view={View.SETTINGS} icon={Wrench} label="Configurações" />
                        </div>
                    </nav>

                    <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                        <div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-xl border border-brand-100 dark:border-brand-800/30">
                            <p className="text-xs font-semibold text-brand-800 dark:text-brand-300 mb-1">Status do Sistema</p>
                            <div className="flex items-center gap-2 text-xs text-brand-600 dark:text-brand-400">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                                </span>
                                Online e Seguro
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
