import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { Plus, Search, Filter, Trash2, Edit2, DollarSign, Calendar, Tag, FileText, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { SupabaseService } from '../services/SupabaseService';

interface ExpensesManagerProps {
    expenses: Expense[];
    setExpenses: (expenses: Expense[]) => void;
}

const ExpensesManager: React.FC<ExpensesManagerProps> = ({ expenses, setExpenses }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<Partial<Expense>>({
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        category: ExpenseCategory.FUEL,
        paymentMethod: 'Crédito',
        notes: ''
    });

    // Filter Logic
    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.notes?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
        return matchesSearch && matchesCategory;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Stats
    const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const currentMonth = new Date().getMonth();
    const expensesThisMonth = expenses
        .filter(e => new Date(e.date).getMonth() === currentMonth)
        .reduce((acc, curr) => acc + curr.amount, 0);

    const handleSave = async () => {
        if (!formData.description || !formData.amount || !formData.date) return;

        setIsSaving(true);
        try {
            if (editingExpense) {
                const updatedExpense = { ...editingExpense, ...formData } as Expense;
                await SupabaseService.updateExpense(updatedExpense);
                setExpenses(expenses.map(e => e.id === editingExpense.id ? updatedExpense : e));
            } else {
                const newExpense = await SupabaseService.addExpense(formData as Omit<Expense, 'id'>);
                setExpenses([...expenses, newExpense]);
            }
            handleCloseModal();
        } catch (error: any) {
            console.error('Error saving expense:', error);
            alert('Erro ao salvar despesa: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setFormData(expense);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) return;

        try {
            await SupabaseService.deleteExpense(id);
            setExpenses(expenses.filter(e => e.id !== id));
        } catch (error: any) {
            console.error('Error deleting expense:', error);
            alert('Erro ao excluir despesa: ' + error.message);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingExpense(null);
        setFormData({
            description: '',
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            category: ExpenseCategory.FUEL,
            paymentMethod: 'Crédito',
            notes: ''
        });
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Despesas</h1>
                    <p className="text-gray-500 dark:text-gray-400">Controle de custos operacionais e saídas</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                >
                    <Plus className="w-5 h-5" /> Nova Despesa
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Despesas (Mês)</p>
                            <h3 className="text-base sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expensesThisMonth)}
                            </h3>
                        </div>
                        <div className="p-1.5 sm:p-2 bg-red-50 dark:bg-red-900/20 rounded-lg flex-shrink-0">
                            <TrendingDown className="w-4 h-4 sm:w-6 sm:h-6 text-red-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Filtrado</p>
                            <h3 className="text-base sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpenses)}
                            </h3>
                        </div>
                        <div className="p-1.5 sm:p-2 bg-gray-50 dark:bg-gray-700 rounded-lg flex-shrink-0">
                            <Filter className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar despesas..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    <option value="all">Todas Categorias</option>
                    {Object.values(ExpenseCategory).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Expenses List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Data</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Descrição</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Categoria</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Valor</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Pagamento</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Nenhuma despesa encontrada.</td>
                                </tr>
                            ) : (
                                filteredExpenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(expense.date).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{expense.description}</p>
                                            {expense.notes && <p className="text-xs text-gray-400">{expense.notes}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs font-medium">{expense.category}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-red-600 dark:text-red-400">- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense.amount)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{expense.paymentMethod}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(expense)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(expense.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
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
                    {filteredExpenses.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">Nenhuma despesa encontrada.</div>
                    ) : (
                        filteredExpenses.map((expense) => (
                            <div key={expense.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{expense.description}</p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className="text-[10px] text-gray-500">{new Date(expense.date).toLocaleDateString('pt-BR')}</span>
                                            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-[10px]">{expense.category}</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-bold text-red-600 dark:text-red-400 text-sm">- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense.amount)}</p>
                                        <p className="text-[10px] text-gray-400">{expense.paymentMethod}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-shrink-0">
                                        <button onClick={() => handleEdit(expense)} className="p-1.5 text-blue-600"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(expense.id)} className="p-1.5 text-red-600"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg p-4 sm:p-6 animate-in fade-in zoom-in duration-200 my-2 sm:my-8">
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                                {editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1">✕</button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                    placeholder="Ex: Abastecimento Hilux"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {Object.values(ExpenseCategory).map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pagamento</label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                        value={formData.paymentMethod}
                                        onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    >
                                        <option value="Dinheiro">Dinheiro</option>
                                        <option value="Pix">Pix</option>
                                        <option value="Crédito">Cartão Crédito</option>
                                        <option value="Débito">Cartão Débito</option>
                                        <option value="Boleto">Boleto</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</label>
                                <textarea
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none h-20 resize-none"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button
                                onClick={handleCloseModal}
                                className="w-full sm:w-auto px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-center"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="w-full sm:w-auto px-4 py-2.5 bg-brand-600 text-white hover:bg-brand-700 rounded-lg shadow-lg shadow-brand-500/30 transition-transform active:scale-95 text-center"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpensesManager;
