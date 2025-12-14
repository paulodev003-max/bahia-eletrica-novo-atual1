import React, { useState, useEffect } from 'react';
import { Budget, Customer, Product, Service, OrderItem, BudgetStatus } from '../../types';
import { Plus, Trash2, Search, X, PenTool } from 'lucide-react';
import SignaturePad from '../Shared/SignaturePad';

interface BudgetFormProps {
    budget: Budget | null;
    onSave: (budget: Budget) => void;
    onCancel: () => void;
    customers: Customer[];
    products: Product[];
    services: Service[];
}


interface BudgetFormProps {
    budget: Budget | null;
    onSave: (budget: Budget) => void;
    onCancel: () => void;
    customers: Customer[];
    products: Product[];
    services: Service[];
}

const BudgetForm: React.FC<BudgetFormProps> = ({ budget, onSave, onCancel, customers, products, services }) => {
    const [formData, setFormData] = useState<Partial<Budget>>({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        date: new Date().toISOString().split('T')[0],
        validityDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        items: [],
        totalValue: 0,
        notes: '',
        warrantyNotes: '',
        paymentTerms: '',
        paymentMethod: '',
        discount: 0
    });

    const [selectedItemType, setSelectedItemType] = useState<'product' | 'service'>('product');
    const [selectedItemId, setSelectedItemId] = useState('');
    const [itemQuantity, setItemQuantity] = useState(1);
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
    const [isSigning, setIsSigning] = useState(false);

    const isReadOnly = budget?.status === 'approved' || budget?.status === 'converted';

    useEffect(() => {
        if (budget) {
            setFormData(budget);
        }
    }, [budget]);

    // Recalculate total when items or discount changes
    useEffect(() => {
        const itemsTotal = (formData.items || []).reduce((acc, i) => acc + i.total, 0);
        const discount = formData.discount || 0;
        const finalTotal = Math.max(0, itemsTotal - discount);

        if (finalTotal !== formData.totalValue) {
            setFormData(prev => ({ ...prev, totalValue: finalTotal }));
        }
    }, [formData.items, formData.discount]);

    const handleAddItem = () => {
        if (!selectedItemId) return;

        let item: Product | Service | undefined;
        let price = 0;
        let name = '';
        let stock: number | undefined;

        if (selectedItemType === 'product') {
            item = products.find(p => p.id === selectedItemId);
            if (item) {
                price = item.price;
                name = item.name;
                stock = (item as Product).stock;
            }
        } else {
            item = services.find(s => s.id === selectedItemId);
            if (item) {
                price = item.price;
                name = item.name;
            }
        }

        if (!item) return;

        // Stock Validation
        if (selectedItemType === 'product' && stock !== undefined) {
            if (itemQuantity > stock) {
                alert(`Estoque insuficiente! Disponível: ${stock}`);
                return;
            }
        }

        const newItem: OrderItem = {
            itemId: selectedItemId,
            name,
            type: selectedItemType,
            quantity: itemQuantity,
            unitPrice: price,
            total: price * itemQuantity
        };

        let newItems = [...(formData.items || [])];

        if (editingItemIndex !== null) {
            newItems[editingItemIndex] = newItem;
            setEditingItemIndex(null);
        } else {
            newItems.push(newItem);
        }

        setFormData({
            ...formData,
            items: newItems
        });

        setItemQuantity(1);
        setSelectedItemId('');
    };

    const handleEditItem = (index: number) => {
        const itemToEdit = formData.items?.[index];
        if (!itemToEdit) return;

        setSelectedItemType(itemToEdit.type);
        setSelectedItemId(itemToEdit.itemId);
        setItemQuantity(itemToEdit.quantity);
        setEditingItemIndex(index);
    };

    const handleRemoveItem = (index: number) => {
        if (isReadOnly) return;
        const newItems = [...(formData.items || [])];
        newItems.splice(index, 1);
        setFormData({
            ...formData,
            items: newItems
        });
        if (editingItemIndex === index) {
            setEditingItemIndex(null);
            setItemQuantity(1);
            setSelectedItemId('');
        }
    };

    const handleSave = () => {
        if (isReadOnly) return;

        if (!formData.customerName || !formData.items || formData.items.length === 0) {
            alert('Preencha o cliente e adicione pelo menos um item.');
            return;
        }

        const savedBudget: Budget = {
            id: budget?.id || Math.random().toString(36).substr(2, 9),
            ...formData as Budget
        };

        onSave(savedBudget);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl p-4 sm:p-6 md:p-8 animate-in fade-in zoom-in duration-200 my-2 sm:my-8">
                <div className="flex justify-between items-start gap-2 mb-4 sm:mb-6 border-b border-gray-100 dark:border-gray-700 pb-3 sm:pb-4">
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white flex flex-wrap items-center gap-2">
                        <span>{budget ? 'Editar Orçamento' : 'Novo Orçamento'}</span>
                        {isReadOnly && <span className="text-[10px] sm:text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 sm:py-1 rounded-full">Somente Leitura</span>}
                    </h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1 text-lg flex-shrink-0">✕</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
                        <input
                            list="customers"
                            disabled={isReadOnly}
                            className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                            value={formData.customerName}
                            onChange={e => {
                                const customer = customers.find(c => c.name === e.target.value);
                                setFormData({
                                    ...formData,
                                    customerName: e.target.value,
                                    customerId: customer?.id,
                                    customerEmail: customer?.email || '',
                                    customerPhone: customer?.phone || '',
                                    customerAddress: customer?.address || ''
                                });
                            }}
                            placeholder="Nome do Cliente"
                        />
                        <datalist id="customers">
                            {customers.map(c => <option key={c.id} value={c.name} />)}
                        </datalist>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Data Emissão</label>
                        <input
                            type="date"
                            disabled={isReadOnly}
                            className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Validade</label>
                        <input
                            type="date"
                            disabled={isReadOnly}
                            className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                            value={formData.validityDate}
                            onChange={e => setFormData({ ...formData, validityDate: e.target.value })}
                        />
                    </div>
                </div>

                {/* Customer Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                    <h4 className="col-span-full text-sm font-bold text-gray-500 uppercase mb-2">Dados do Cliente</h4>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                        <input
                            type="email"
                            disabled={isReadOnly}
                            className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                            value={formData.customerEmail || ''}
                            onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                            placeholder="email@exemplo.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Telefone</label>
                        <input
                            type="tel"
                            disabled={isReadOnly}
                            className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                            value={formData.customerPhone || ''}
                            onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                            placeholder="(00) 00000-0000"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Endereço</label>
                        <input
                            type="text"
                            disabled={isReadOnly}
                            className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                            value={formData.customerAddress || ''}
                            onChange={e => setFormData({ ...formData, customerAddress: e.target.value })}
                            placeholder="Endereço completo"
                        />
                    </div>
                </div>

                {/* Item Selection */}
                {!isReadOnly && (
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700 mb-6 transition-all ring-1 ring-gray-200 dark:ring-gray-700">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
                                {editingItemIndex !== null ? <span className="text-brand-600">Editando Item #{editingItemIndex + 1}</span> : 'Adicionar Itens'}
                            </h3>
                            {editingItemIndex !== null && (
                                <button
                                    onClick={() => {
                                        setEditingItemIndex(null);
                                        setItemQuantity(1);
                                        setSelectedItemId('');
                                    }}
                                    className="text-xs text-red-500 hover:text-red-700 underline"
                                >
                                    Cancelar Edição
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row gap-3 items-end">
                            <div className="w-full md:w-32">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
                                    value={selectedItemType}
                                    onChange={(e) => {
                                        setSelectedItemType(e.target.value as 'product' | 'service');
                                        setSelectedItemId('');
                                    }}
                                >
                                    <option value="product">Produto</option>
                                    <option value="service">Serviço</option>
                                </select>
                            </div>
                            <div className="flex-1 w-full">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Item</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
                                    value={selectedItemId}
                                    onChange={(e) => setSelectedItemId(e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    {selectedItemType === 'product' ? (
                                        products.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} (Estoque: {p.stock}) - R$ {p.price.toFixed(2)}
                                            </option>
                                        ))
                                    ) : (
                                        services.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} - R$ {s.price.toFixed(2)}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            <div className="w-full md:w-24">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Qtd</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
                                    value={itemQuantity}
                                    onChange={(e) => setItemQuantity(parseInt(e.target.value))}
                                />
                            </div>
                            <button
                                onClick={handleAddItem}
                                disabled={!selectedItemId}
                                className={`w-full md:w-auto px-4 py-2 text-white rounded-lg transition-colors font-medium flex items-center gap-2
                                    ${editingItemIndex !== null ? 'bg-blue-600 hover:bg-blue-700' : 'bg-brand-600 hover:bg-brand-700'}
                                    disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {editingItemIndex !== null ? 'Atualizar' : <><Plus className="w-5 h-5" /></>}
                            </button>
                        </div>
                    </div>
                )}

                {/* Items List */}
                <div className="mb-6 overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                    {/* Desktop Table */}
                    <table className="w-full text-left text-sm hidden md:table">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
                            <tr>
                                <th className="px-4 py-2">Item</th>
                                <th className="px-4 py-2 text-center">Tipo</th>
                                <th className="px-4 py-2 text-center">Qtd</th>
                                <th className="px-4 py-2 text-right">Unitário</th>
                                <th className="px-4 py-2 text-right">Total</th>
                                {!isReadOnly && <th className="px-4 py-2 w-24 text-center">Ações</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {formData.items?.map((item, idx) => (
                                <tr key={idx} className={editingItemIndex === idx ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                                    <td className="px-4 py-2 dark:text-white">{item.name}</td>
                                    <td className="px-4 py-2 text-center text-xs uppercase text-gray-500">{item.type === 'product' ? 'Produto' : 'Serviço'}</td>
                                    <td className="px-4 py-2 text-center dark:text-white">{item.quantity}</td>
                                    <td className="px-4 py-2 text-right dark:text-white">R$ {item.unitPrice.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right font-medium dark:text-white">R$ {item.total.toFixed(2)}</td>
                                    {!isReadOnly && (
                                        <td className="px-4 py-2 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => handleEditItem(idx)} className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded" title="Editar item">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                                </button>
                                                <button onClick={() => handleRemoveItem(idx)} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded" title="Remover item">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {(!formData.items || formData.items.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Nenhum item adicionado.</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-gray-50 dark:bg-gray-700/50 font-bold">
                            <tr>
                                <td colSpan={4} className="px-4 py-3 text-right text-gray-900 dark:text-white">Subtotal:</td>
                                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                                    R$ {((formData.items || []).reduce((acc, i) => acc + i.total, 0)).toFixed(2)}
                                </td>
                                <td></td>
                            </tr>
                            <tr>
                                <td colSpan={4} className="px-4 py-2 text-right text-gray-900 dark:text-white flex items-center justify-end gap-2">
                                    <span>Desconto:</span>
                                </td>
                                <td className="px-4 py-2 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <span className="text-gray-500">R$</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            disabled={isReadOnly}
                                            className="w-24 px-2 py-1 text-right border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white outline-none focus:ring-1 focus:ring-brand-500"
                                            value={formData.discount}
                                            onChange={e => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </td>
                                <td></td>
                            </tr>
                            <tr className="text-lg bg-gray-100 dark:bg-gray-700">
                                <td colSpan={4} className="px-4 py-3 text-right text-gray-900 dark:text-white">Total Final:</td>
                                <td className="px-4 py-3 text-right text-brand-600 dark:text-brand-400">
                                    R$ {formData.totalValue?.toFixed(2)}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Mobile Cards */}
                    <div className="md:hidden">
                        {(!formData.items || formData.items.length === 0) ? (
                            <div className="px-4 py-8 text-center text-gray-500">Nenhum item adicionado.</div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {formData.items?.map((item, idx) => (
                                    <div key={idx} className={`p-3 ${editingItemIndex === idx ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">{item.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-gray-500 uppercase bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                                        {item.type === 'product' ? 'Prod.' : 'Serv.'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">×{item.quantity}</span>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-bold text-gray-800 dark:text-white text-sm">R$ {item.total.toFixed(2)}</p>
                                                <p className="text-[10px] text-gray-400">R$ {item.unitPrice.toFixed(2)} un</p>
                                            </div>
                                            {!isReadOnly && (
                                                <div className="flex flex-col gap-1 flex-shrink-0">
                                                    <button onClick={() => handleEditItem(idx)} className="p-1 text-blue-500 hover:text-blue-700">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                                    </button>
                                                    <button onClick={() => handleRemoveItem(idx)} className="p-1 text-red-500 hover:text-red-700">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Mobile Footer */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                                <span className="text-gray-800 dark:text-white">R$ {((formData.items || []).reduce((acc, i) => acc + i.total, 0)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-300">Desconto:</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-500 text-xs">R$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        disabled={isReadOnly}
                                        className="w-20 px-2 py-1 text-right text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white outline-none focus:ring-1 focus:ring-brand-500"
                                        value={formData.discount}
                                        onChange={e => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200 dark:border-gray-600">
                                <span className="text-gray-900 dark:text-white">Total:</span>
                                <span className="text-brand-600 dark:text-brand-400">R$ {formData.totalValue?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Forma de Pagamento</label>
                        <select
                            disabled={isReadOnly}
                            className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                            value={formData.paymentMethod}
                            onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                        >
                            <option value="">Selecione...</option>
                            <option value="Dinheiro">Dinheiro</option>
                            <option value="Pix">Pix</option>
                            <option value="Cartão Crédito">Cartão Crédito</option>
                            <option value="Cartão Débito">Cartão Débito</option>
                            <option value="Boleto">Boleto</option>
                            <option value="Transferência">Transferência</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Condições de Pagamento</label>
                        <input
                            type="text"
                            disabled={isReadOnly}
                            className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                            value={formData.paymentTerms}
                            onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}
                            placeholder="Ex: 50% entrada + 50% na entrega"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Observações</label>
                    <textarea
                        disabled={isReadOnly}
                        className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none h-20 resize-none ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Observações adicionais..."
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Observações de Garantia</label>
                    <textarea
                        disabled={isReadOnly}
                        className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none h-20 resize-none ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                        value={formData.warrantyNotes}
                        onChange={e => setFormData({ ...formData, warrantyNotes: e.target.value })}
                        placeholder="Garantia conforme especificações do fabricante. Serviços com garantia de 90 dias."
                    />
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={onCancel}
                        className="w-full sm:w-auto px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors text-center"
                    >
                        {isReadOnly ? 'Fechar' : 'Cancelar'}
                    </button>
                    {!isReadOnly && (
                        <button
                            onClick={() => setIsSigning(true)}
                            className="w-full sm:w-auto px-4 py-2.5 text-brand-600 hover:bg-brand-50 rounded-lg font-medium transition-colors border border-brand-200 flex items-center justify-center gap-2"
                        >
                            <PenTool className="w-4 h-4" />
                            <span className="hidden sm:inline">{formData.signature ? 'Assinatura Adicionada' : 'Assinar Digitalmente'}</span>
                            <span className="sm:hidden">{formData.signature ? 'Assinado' : 'Assinar'}</span>
                        </button>
                    )}
                    {!isReadOnly && (
                        <button
                            onClick={handleSave}
                            className="w-full sm:w-auto px-6 py-2.5 bg-brand-600 text-white hover:bg-brand-700 rounded-lg font-medium shadow-lg shadow-brand-500/30 transition-transform active:scale-95 text-center"
                        >
                            <span className="hidden sm:inline">Salvar Orçamento</span>
                            <span className="sm:hidden">Salvar</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Signature Modal */}
            {isSigning && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
                    <SignaturePad
                        onSave={(data) => {
                            setFormData({ ...formData, signature: data.signature });
                            setIsSigning(false);
                        }}
                        onCancel={() => setIsSigning(false)}
                        existingSignature={formData.signature}
                    />
                </div>
            )}
        </div>
    );
};

export default BudgetForm;
