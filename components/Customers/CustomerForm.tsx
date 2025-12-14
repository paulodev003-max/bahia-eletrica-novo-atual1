import React from 'react';
import { Customer } from '../../types';

interface CustomerFormProps {
    customerForm: Partial<Customer>;
    setCustomerForm: (form: Partial<Customer>) => void;
    saveCustomer: () => void;
    onCancel: () => void;
    isEditing: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
    customerForm,
    setCustomerForm,
    saveCustomer,
    onCancel,
    isEditing
}) => {
    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="md:col-span-3">
                    <label className="block text-xs sm:text-sm font-medium mb-1 dark:text-gray-300">Nome Completo *</label>
                    <input
                        value={customerForm.name}
                        onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                        className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium mb-1 dark:text-gray-300">Empresa</label>
                    <input
                        value={customerForm.company}
                        onChange={e => setCustomerForm({ ...customerForm, company: e.target.value })}
                        className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-xs sm:text-sm font-medium mb-1 dark:text-gray-300">CPF / CNPJ</label>
                    <input
                        value={customerForm.document}
                        onChange={e => setCustomerForm({ ...customerForm, document: e.target.value })}
                        className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                    <input
                        value={customerForm.email}
                        onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })}
                        className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-xs sm:text-sm font-medium mb-1 dark:text-gray-300">Telefone</label>
                    <input
                        value={customerForm.phone}
                        onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })}
                        className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    />
                </div>

                <div className="md:col-span-3">
                    <label className="block text-xs sm:text-sm font-medium mb-1 dark:text-gray-300">Endereço</label>
                    <input
                        value={customerForm.address}
                        onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })}
                        className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    />
                </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button onClick={onCancel} className="w-full sm:w-auto px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-center">Cancelar</button>
                <button onClick={saveCustomer} className="w-full sm:w-auto px-4 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-center">Salvar</button>
            </div>
        </div>
    );
};

export default CustomerForm;
