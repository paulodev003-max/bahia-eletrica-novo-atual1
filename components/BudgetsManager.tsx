import React, { useState } from 'react';
import { Budget, Customer, Product, Service, Order, OrderItem } from '../types';
import { Plus, FileText, CheckCircle, Trash2, Edit2, Search, Printer } from 'lucide-react';
import BudgetForm from './Budgets/BudgetForm';
import { generateBudgetPDF } from './Budgets/BudgetPDF';
import { SupabaseService } from '../services/SupabaseService';

import { UserSettings } from '../types';

interface BudgetsManagerProps {
    budgets: Budget[];
    setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
    products: Product[];
    services: Service[];
    updateStock: (productId: string, quantity: number) => void;
    userSettings?: UserSettings;
}

const BudgetsManager: React.FC<BudgetsManagerProps> = ({
    budgets, setBudgets, customers, setCustomers, products, services, updateStock, userSettings
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleOpenModal = (budget?: Budget) => {
        setEditingBudget(budget || null);
        setIsModalOpen(true);
    };

    const handleSaveBudget = async (budget: Budget) => {
        setIsSaving(true);
        try {
            if (editingBudget) {
                await SupabaseService.updateBudget(budget);
                setBudgets(budgets.map(b => b.id === budget.id ? budget : b));
            } else {
                const newBudget = await SupabaseService.addBudget(budget);
                setBudgets([...budgets, newBudget]);
            }
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Error saving budget:', error);
            alert('Erro ao salvar orçamento: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteBudget = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este orçamento?')) return;

        try {
            await SupabaseService.deleteBudget(id);
            setBudgets(budgets.filter(b => b.id !== id));
        } catch (error: any) {
            console.error('Error deleting budget:', error);
            alert('Erro ao excluir orçamento: ' + error.message);
        }
    };

    const handleApproveBudget = (budget: Budget) => {
        if (budget.status === 'approved' || budget.status === 'converted') return;

        if (window.confirm('Aprovar orçamento? Isso irá gerar uma venda e baixar o estoque.')) {
            // 1. Update Budget Status
            const updatedBudget = { ...budget, status: 'approved' as const };
            setBudgets(budgets.map(b => b.id === budget.id ? updatedBudget : b));

            // 2. Create Order
            const newOrder: Order = {
                id: Math.random().toString(36).substr(2, 9),
                date: new Date().toISOString().split('T')[0],
                status: 'completed',
                items: budget.items,
                totalValue: budget.totalValue,
                notes: `Gerado a partir do orçamento #${budget.id}`
            };

            // 3. Find or Create Customer and Add Order
            let customer = customers.find(c => c.id === budget.customerId || c.name === budget.customerName);

            if (customer) {
                const updatedCustomer = {
                    ...customer,
                    orders: [newOrder, ...customer.orders]
                };
                setCustomers(customers.map(c => c.id === customer.id ? updatedCustomer : c));
            } else {
                // Create new customer if not found
                const newCustomer: Customer = {
                    id: Math.random().toString(36).substr(2, 9),
                    name: budget.customerName,
                    email: '',
                    phone: '',
                    createdAt: new Date().toISOString(),
                    orders: [newOrder]
                };
                setCustomers([...customers, newCustomer]);
            }

            // 4. Update Stock
            budget.items.forEach(item => {
                if (item.type === 'product') {
                    updateStock(item.itemId, item.quantity);
                }
            });

            alert('Orçamento aprovado e venda gerada com sucesso!');
        }
    };

    const filteredBudgets = budgets.filter(b =>
        b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar orçamento..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto sm:self-end flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg transition-colors font-medium shadow-lg shadow-brand-500/20"
                >
                    <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Novo Orçamento</span><span className="sm:hidden">Adicionar</span>
                </button>
            </div>

            {/* Budgets List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Data</th>
                                <th className="px-6 py-4 font-semibold">Cliente</th>
                                <th className="px-6 py-4 font-semibold">Validade</th>
                                <th className="px-6 py-4 font-semibold">Valor Total</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredBudgets.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Nenhum orçamento encontrado.</td></tr>
                            ) : (
                                filteredBudgets.map((budget) => (
                                    <tr key={budget.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{new Date(budget.date).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{budget.customerName}</td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{new Date(budget.validityDate).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-6 py-4 font-bold text-brand-600 dark:text-brand-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.totalValue)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${budget.status === 'approved' ? 'bg-green-100 text-green-700' : budget.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {budget.status === 'approved' ? 'Aprovado' : budget.status === 'rejected' ? 'Rejeitado' : 'Rascunho'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => generateBudgetPDF(budget, userSettings)} className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Gerar PDF"><Printer className="w-4 h-4" /></button>
                                                {budget.status !== 'approved' && (<button onClick={() => handleApproveBudget(budget)} className="p-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded hover:bg-green-100 transition-colors" title="Aprovar"><CheckCircle className="w-4 h-4" /></button>)}
                                                <button onClick={() => handleOpenModal(budget)} className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteBudget(budget.id)} className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-100 transition-colors" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredBudgets.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">Nenhum orçamento encontrado.</div>
                    ) : (
                        filteredBudgets.map((budget) => (
                            <div key={budget.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{budget.customerName}</p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className="text-[10px] text-gray-500">{new Date(budget.date).toLocaleDateString('pt-BR')}</span>
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${budget.status === 'approved' ? 'bg-green-100 text-green-700' : budget.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {budget.status === 'approved' ? 'Aprovado' : budget.status === 'rejected' ? 'Rejeitado' : 'Rascunho'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="font-bold text-brand-600 dark:text-brand-400 text-sm flex-shrink-0">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.totalValue)}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-gray-400">Val: {new Date(budget.validityDate).toLocaleDateString('pt-BR')}</span>
                                    <div className="flex gap-1">
                                        <button onClick={() => generateBudgetPDF(budget, userSettings)} className="p-1.5 text-gray-600"><Printer className="w-4 h-4" /></button>
                                        {budget.status !== 'approved' && (<button onClick={() => handleApproveBudget(budget)} className="p-1.5 text-green-600"><CheckCircle className="w-4 h-4" /></button>)}
                                        <button onClick={() => handleOpenModal(budget)} className="p-1.5 text-blue-600"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteBudget(budget.id)} className="p-1.5 text-red-600"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {isModalOpen && (
                <BudgetForm
                    budget={editingBudget}
                    onSave={handleSaveBudget}
                    onCancel={() => setIsModalOpen(false)}
                    customers={customers}
                    products={products}
                    services={services}
                />
            )}
        </div>
    );
};

export default BudgetsManager;
