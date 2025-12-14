import React from 'react';
import { Customer } from '../../types';
import { Plus, Search, Edit2, Trash2, User, Building, Mail, Phone, Eye, ShoppingCart } from 'lucide-react';

interface CustomerListProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filteredCustomers: Customer[];
    handleNewCustomer: () => void;
    handleViewDetails: (customer: Customer) => void;
    handleEditCustomer: (customer: Customer) => void;
    deleteCustomer: (id: string) => void;
    handleOpenOrder: (customer: Customer) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({
    searchTerm,
    setSearchTerm,
    filteredCustomers,
    handleNewCustomer,
    handleViewDetails,
    handleEditCustomer,
    deleteCustomer,
    handleOpenOrder
}) => {
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Controls */}
            <div className="flex flex-col gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar clientes, empresas..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button
                    onClick={handleNewCustomer}
                    className="w-full sm:w-auto sm:self-end flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg transition-colors font-medium shadow-lg shadow-brand-500/20"
                >
                    <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Novo Cliente</span><span className="sm:hidden">Adicionar</span>
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCustomers.map(customer => {
                    const totalSpent = customer.orders.reduce((acc, order) => acc + order.totalValue, 0);
                    const lastOrder = customer.orders.length > 0 ? customer.orders[0] : null;

                    return (
                        <div key={customer.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all group">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white cursor-pointer hover:text-brand-600 transition-colors" onClick={() => handleViewDetails(customer)}>{customer.name}</h3>
                                            {customer.company && (
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Building className="w-3 h-3" /> {customer.company}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={(e) => { e.stopPropagation(); handleViewDetails(customer); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver Detalhes">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleEditCustomer(customer); }} className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Editar">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); deleteCustomer(customer.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    {customer.email && <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><Mail className="w-3 h-3" /> {customer.email}</div>}
                                    {customer.phone && <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><Phone className="w-3 h-3" /> {customer.phone}</div>}
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700 mb-4 cursor-pointer hover:border-brand-200 transition-colors" onClick={() => handleViewDetails(customer)}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-gray-500 uppercase font-semibold">Total em Compras</span>
                                        <span className="text-sm font-bold text-brand-600 dark:text-brand-400">R$ {totalSpent.toFixed(2)}</span>
                                    </div>
                                    {lastOrder && (
                                        <p className="text-xs text-gray-400">Última compra: {new Date(lastOrder.date).toLocaleDateString('pt-BR')}</p>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleOpenOrder(customer)}
                                    className="w-full py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-300 rounded-lg font-medium hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-4 h-4" /> Nova Venda / Serviço
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CustomerList;
