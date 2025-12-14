import React from 'react';
import { Customer, OrderItem, Product, Service } from '../../types';
import { ShoppingCart, X, Package, Wrench, Trash2, Check, Percent, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

interface OrderManagerProps {
    selectedCustomer: Customer | null;
    orderItems: OrderItem[];
    orderDate: string;
    setOrderDate: (date: string) => void;
    selectedItemType: 'product' | 'service';
    setSelectedItemType: (type: 'product' | 'service') => void;
    selectedItemId: string;
    setSelectedItemId: (id: string) => void;
    itemQuantity: number;
    setItemQuantity: (qty: number) => void;
    products: Product[];
    services: Service[];
    addItemToOrder: () => void;
    removeOrderItem: (index: number) => void;
    saveOrder: () => void;
    onCancel: () => void;
    subtotal: number;
    orderTotal: number;
    // Discount props
    discountValue: number;
    setDiscountValue: (value: number) => void;
    discountPercent: number;
    setDiscountPercent: (value: number) => void;
    // Surcharge props
    surchargeValue: number;
    setSurchargeValue: (value: number) => void;
    surchargePercent: number;
    setSurchargePercent: (value: number) => void;
}

const OrderManager: React.FC<OrderManagerProps> = ({
    selectedCustomer,
    orderItems,
    orderDate,
    setOrderDate,
    selectedItemType,
    setSelectedItemType,
    selectedItemId,
    setSelectedItemId,
    itemQuantity,
    setItemQuantity,
    products,
    services,
    addItemToOrder,
    removeOrderItem,
    saveOrder,
    onCancel,
    subtotal,
    orderTotal,
    discountValue,
    setDiscountValue,
    discountPercent,
    setDiscountPercent,
    surchargeValue,
    setSurchargeValue,
    surchargePercent,
    setSurchargePercent
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 h-full flex flex-col">
            <div className="flex justify-between items-start gap-2 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="min-w-0">
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600 flex-shrink-0" />
                        <span className="truncate">Novo Pedido</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">Cliente: <span className="font-bold text-gray-800 dark:text-white">{selectedCustomer?.name}</span></p>
                </div>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 flex-1 lg:overflow-hidden">
                {/* Left: Item Selection */}
                <div className="lg:col-span-1 flex flex-col gap-3 sm:gap-4 bg-gray-50 dark:bg-gray-900/50 p-3 sm:p-4 rounded-xl lg:h-full lg:overflow-y-auto">
                    <h3 className="font-bold text-sm sm:text-base text-gray-700 dark:text-gray-300">Adicionar Item</h3>

                    <div className="flex gap-2">
                        <button
                            onClick={() => { setSelectedItemType('product'); setSelectedItemId(''); }}
                            className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-colors ${selectedItemType === 'product' ? 'bg-white dark:bg-gray-700 border-brand-500 text-brand-600 dark:text-white shadow-sm' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
                        >
                            Produto
                        </button>
                        <button
                            onClick={() => { setSelectedItemType('service'); setSelectedItemId(''); }}
                            className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-colors ${selectedItemType === 'service' ? 'bg-white dark:bg-gray-700 border-brand-500 text-brand-600 dark:text-white shadow-sm' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
                        >
                            Serviço
                        </button>
                    </div>

                    <div>
                        <label className="block text-[10px] sm:text-xs font-bold text-gray-500 mb-1">Selecione o {selectedItemType === 'product' ? 'Produto' : 'Serviço'}</label>
                        <select
                            value={selectedItemId}
                            onChange={(e) => setSelectedItemId(e.target.value)}
                            className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                        >
                            <option value="">Selecione...</option>
                            {selectedItemType === 'product'
                                ? products.map(p => <option key={p.id} value={p.id}>{p.name} (R$ {p.price.toFixed(2)})</option>)
                                : services.filter(s => s.active).map(s => <option key={s.id} value={s.id}>{s.name} (R$ {s.price.toFixed(2)})</option>)
                            }
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] sm:text-xs font-bold text-gray-500 mb-1">Quantidade</label>
                        <input
                            type="number"
                            min="1"
                            value={itemQuantity}
                            onChange={(e) => setItemQuantity(parseInt(e.target.value))}
                            className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>

                    <button
                        onClick={addItemToOrder}
                        disabled={!selectedItemId}
                        className="w-full bg-brand-600 text-white py-2.5 rounded-lg hover:bg-brand-700 disabled:opacity-50 font-medium text-sm"
                    >
                        Adicionar
                    </button>
                </div>

                {/* Right: Cart Review */}
                <div className="lg:col-span-2 flex flex-col lg:h-full">
                    <div className="flex-1 overflow-y-auto mb-4 border rounded-xl dark:border-gray-700">
                        {/* Desktop Table */}
                        <table className="w-full text-left text-sm hidden md:table">
                            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 sticky top-0">
                                <tr>
                                    <th className="p-3">Item</th>
                                    <th className="p-3">Tipo</th>
                                    <th className="p-3 text-center">Qtd</th>
                                    <th className="p-3 text-right">Unitário</th>
                                    <th className="p-3 text-right">Total</th>
                                    <th className="p-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {orderItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-400">Nenhum item adicionado ainda.</td>
                                    </tr>
                                ) : (
                                    orderItems.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="p-3 font-medium text-gray-800 dark:text-gray-200">{item.name}</td>
                                            <td className="p-3">
                                                {item.type === 'product'
                                                    ? <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit"><Package className="w-3 h-3" /> Produto</span>
                                                    : <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded w-fit"><Wrench className="w-3 h-3" /> Serviço</span>
                                                }
                                            </td>
                                            <td className="p-3 text-center">{item.quantity}</td>
                                            <td className="p-3 text-right">R$ {item.unitPrice.toFixed(2)}</td>
                                            <td className="p-3 text-right font-bold text-gray-800 dark:text-white">R$ {item.total.toFixed(2)}</td>
                                            <td className="p-3 text-right">
                                                <button onClick={() => removeOrderItem(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Mobile Cards */}
                        <div className="md:hidden">
                            {orderItems.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">Nenhum item adicionado ainda.</div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {orderItems.map((item, idx) => (
                                        <div key={idx} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">{item.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {item.type === 'product'
                                                            ? <span className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded"><Package className="w-2.5 h-2.5" /> Prod.</span>
                                                            : <span className="flex items-center gap-1 text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded"><Wrench className="w-2.5 h-2.5" /> Serv.</span>
                                                        }
                                                        <span className="text-xs text-gray-500">×{item.quantity}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="font-bold text-gray-800 dark:text-white text-sm">R$ {item.total.toFixed(2)}</p>
                                                    <p className="text-[10px] text-gray-400">R$ {item.unitPrice.toFixed(2)} un</p>
                                                </div>
                                                <button onClick={() => removeOrderItem(idx)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Discount and Surcharge Section */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Discount */}
                            <div className="space-y-2">
                                <h4 className="text-xs sm:text-sm font-bold text-red-600 flex items-center gap-1.5 sm:gap-2">
                                    <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Desconto
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[10px] sm:text-xs text-gray-500 mb-1">Valor (R$)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={discountValue || ''}
                                                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                                className="w-full pl-7 pr-2 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-red-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] sm:text-xs text-gray-500 mb-1">Porcent. (%)</label>
                                        <div className="relative">
                                            <Percent className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                value={discountPercent || ''}
                                                onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                                                placeholder="0.0"
                                                className="w-full pl-7 pr-2 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-red-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Surcharge */}
                            <div className="space-y-2">
                                <h4 className="text-xs sm:text-sm font-bold text-green-600 flex items-center gap-1.5 sm:gap-2">
                                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Acréscimo
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[10px] sm:text-xs text-gray-500 mb-1">Valor (R$)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={surchargeValue || ''}
                                                onChange={(e) => setSurchargeValue(parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                                className="w-full pl-7 pr-2 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] sm:text-xs text-gray-500 mb-1">Porcent. (%)</label>
                                        <div className="relative">
                                            <Percent className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                value={surchargePercent || ''}
                                                onChange={(e) => setSurchargePercent(parseFloat(e.target.value) || 0)}
                                                placeholder="0.0"
                                                className="w-full pl-7 pr-2 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary and Actions */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <label className="text-xs sm:text-sm text-gray-500">Data do<br className="sm:hidden" /> Pedido:</label>
                                <input
                                    type="date"
                                    value={orderDate}
                                    onChange={(e) => setOrderDate(e.target.value)}
                                    className="p-1.5 sm:p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs sm:text-sm"
                                />
                            </div>
                            <div className="text-right space-y-0.5 sm:space-y-1">
                                <p className="text-[10px] sm:text-xs text-gray-500">Subtotal: <span className="font-medium">R$ {subtotal.toFixed(2)}</span></p>
                                {(discountValue > 0 || discountPercent > 0) && (
                                    <p className="text-[10px] sm:text-xs text-red-500">Desconto: -R$ {(discountValue + (subtotal * discountPercent / 100)).toFixed(2)}</p>
                                )}
                                {(surchargeValue > 0 || surchargePercent > 0) && (
                                    <p className="text-[10px] sm:text-xs text-green-500">Acréscimo: +R$ {(surchargeValue + (subtotal * surchargePercent / 100)).toFixed(2)}</p>
                                )}
                                <p className="text-xs sm:text-sm text-gray-500">Total do Pedido</p>
                                <p className="text-xl sm:text-3xl font-bold text-brand-600 dark:text-brand-400">R$ {orderTotal.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
                            <button onClick={onCancel} className="w-full sm:w-auto px-4 sm:px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors text-center text-sm">Cancelar</button>
                            <button
                                onClick={saveOrder}
                                disabled={orderItems.length === 0}
                                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg shadow-green-500/30 transition-all disabled:opacity-50 disabled:shadow-none text-sm"
                            >
                                <Check className="w-4 h-4 inline mr-1 sm:mr-2" /> <span className="hidden sm:inline">Finalizar Pedido</span><span className="sm:hidden">Finalizar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderManager;
