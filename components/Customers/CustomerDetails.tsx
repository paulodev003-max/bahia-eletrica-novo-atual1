import React from 'react';
import { Customer } from '../../types';
import { ArrowLeft, Building, Mail, Phone, MapPin, History, Calendar, Package, Wrench, MessageCircle } from 'lucide-react';

interface CustomerDetailsProps {
    customer: Customer;
    onBack: () => void;
    onEdit: () => void;
    onNewOrder: () => void;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({
    customer,
    onBack,
    onEdit,
    onNewOrder
}) => {
    const totalSpent = customer.orders.reduce((acc, o) => acc + o.totalValue, 0);
    const orderCount = customer.orders.length;
    const ticketMedio = orderCount > 0 ? totalSpent / orderCount : 0;

    // Sort orders by date descending
    const sortedHistory = [...customer.orders].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const getWhatsAppLink = (phone: string, message: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    };

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Header & Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex flex-col gap-4 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </button>
                        <div className="min-w-0">
                            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{customer.name}</h2>
                            {customer.company && (
                                <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 truncate">
                                    <Building className="w-3 h-3 flex-shrink-0" /> {customer.company}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {customer.phone && (
                            <a
                                href={getWhatsAppLink(customer.phone, `Olá ${customer.name}, tudo bem? Gostaria de falar sobre...`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 sm:px-4 py-2 bg-green-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-green-600 shadow-lg shadow-green-500/20 flex items-center justify-center gap-1 sm:gap-2"
                            >
                                <MessageCircle className="w-4 h-4" /> <span className="hidden sm:inline">WhatsApp</span>
                            </a>
                        )}
                        <button onClick={onEdit} className="px-2 sm:px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 text-center">
                            <span className="hidden sm:inline">Editar Dados</span><span className="sm:hidden">Editar</span>
                        </button>
                        <button onClick={onNewOrder} className="px-2 sm:px-4 py-2 bg-brand-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-brand-700 shadow-lg shadow-brand-500/20 text-center">
                            <span className="hidden sm:inline">Nova Venda</span><span className="sm:hidden">Vender</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 pt-4 sm:pt-6 border-t border-gray-100 dark:border-gray-700">
                    <div className="space-y-1 sm:space-y-2 col-span-2 md:col-span-1">
                        <h4 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Contato</h4>
                        {customer.email && <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate"><Mail className="w-3 h-3 flex-shrink-0" /> {customer.email}</div>}
                        {customer.phone && <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300"><Phone className="w-3 h-3 flex-shrink-0" /> {customer.phone}</div>}
                        {customer.address && <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate"><MapPin className="w-3 h-3 flex-shrink-0" /> {customer.address}</div>}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 sm:p-4 rounded-lg">
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Total Consumido</p>
                        <p className="text-base sm:text-xl font-bold text-brand-600 dark:text-brand-400">R$ {totalSpent.toFixed(2)}</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 sm:p-4 rounded-lg">
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Pedidos</p>
                        <p className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">{orderCount}</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 sm:p-4 rounded-lg">
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Ticket Médio</p>
                        <p className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">R$ {ticketMedio.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Complete History */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <History className="w-5 h-5 text-gray-500" /> Histórico Completo
                </h3>

                <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-8 pb-4">
                    {sortedHistory.length === 0 ? (
                        <div className="ml-8 text-gray-400 italic">Nenhum histórico de compras ou serviços encontrado.</div>
                    ) : (
                        sortedHistory.map((order, index) => (
                            <div key={order.id} className="ml-8 relative">
                                {/* Timeline Dot */}
                                <div className="absolute -left-[41px] top-0 w-5 h-5 bg-white dark:bg-gray-800 border-2 border-brand-500 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                                </div>

                                {/* Card */}
                                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 pb-3 border-b border-gray-200 dark:border-gray-700 gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">
                                                    {new Date(order.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                                <p className="text-xs text-gray-500">ID: #{order.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {customer.phone && (
                                                <a
                                                    href={getWhatsAppLink(customer.phone, `Olá ${customer.name}, seguem os detalhes do seu pedido #${order.id}...`)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                    title="Enviar detalhes por WhatsApp"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                </a>
                                            )}
                                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded uppercase">
                                                {order.status === 'completed' ? 'Concluído' : order.status}
                                            </span>
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                R$ {order.totalValue.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Itens do Pedido</p>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm p-2 hover:bg-white dark:hover:bg-gray-800 rounded transition-colors">
                                                <div className="flex items-center gap-2">
                                                    {item.type === 'product' ? (
                                                        <Package className="w-4 h-4 text-blue-500" />
                                                    ) : (
                                                        <Wrench className="w-4 h-4 text-orange-500" />
                                                    )}
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        {item.quantity}x <span className="font-medium">{item.name}</span>
                                                    </span>
                                                </div>
                                                <span className="text-gray-500">R$ {item.total.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerDetails;
