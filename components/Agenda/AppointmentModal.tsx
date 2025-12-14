import React from 'react';
import { Settings, MessageCircle } from 'lucide-react';
import { Appointment, AppointmentStatus, Customer } from '../../types';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEditing: boolean;
    formData: Partial<Appointment>;
    setFormData: (data: Partial<Appointment>) => void;
    customers: Customer[];
    responsibles: string[];
    onSave: () => void;
    onManageResponsibles: () => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
    isOpen,
    onClose,
    isEditing,
    formData,
    setFormData,
    customers,
    responsibles,
    onSave,
    onManageResponsibles
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl p-4 sm:p-6 md:p-8 animate-in fade-in zoom-in duration-200 my-2 sm:my-8">
                <div className="flex justify-between items-start gap-2 mb-4 sm:mb-6 border-b border-gray-100 dark:border-gray-700 pb-3 sm:pb-4">
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                        {isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 text-lg flex-shrink-0">✕</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Título do Evento</label>
                        <input
                            type="text"
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm sm:text-base"
                            placeholder="Ex: Instalação Inversor Cliente X"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {/* Customer Select */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
                        <select
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm sm:text-base"
                            value={formData.customerId}
                            onChange={(e) => {
                                const selected = customers.find(c => c.id === e.target.value);
                                setFormData({
                                    ...formData,
                                    customerId: e.target.value,
                                    customerName: selected ? selected.name : ''
                                });
                            }}
                        >
                            <option value="">Selecione um cliente cadastrado ou c...</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>)}
                        </select>
                        <input
                            type="text"
                            className="w-full mt-2 px-3 sm:px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-xs sm:text-sm"
                            placeholder="Ou digite o nome do cliente avulso"
                            value={formData.customerName}
                            onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                        />
                    </div>

                    {/* Date, Time, Duration Group */}
                    <div className="col-span-1 md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Data</label>
                            <input
                                type="date"
                                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>

                        <div className="col-span-1">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Hora</label>
                            <input
                                type="time"
                                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                value={formData.time}
                                onChange={e => setFormData({ ...formData, time: e.target.value })}
                            />
                        </div>

                        <div className="col-span-1">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Duração (min)</label>
                            <input
                                type="number"
                                step="15"
                                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                value={formData.duration}
                                onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    {/* Responsible and Status Group */}
                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Responsável</label>
                            <div className="flex gap-2">
                                <select
                                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                    value={formData.responsible}
                                    onChange={e => setFormData({ ...formData, responsible: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    {responsibles.map((r, i) => <option key={i} value={r}>{r}</option>)}
                                </select>
                                <button
                                    onClick={onManageResponsibles}
                                    className="p-2 sm:p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
                                    title="Gerenciar Equipe"
                                >
                                    <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select
                                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as AppointmentStatus })}
                            >
                                <option value="pending">Pendente</option>
                                <option value="in_progress">Em Andamento</option>
                                <option value="completed">Concluído</option>
                                <option value="canceled">Cancelado</option>
                            </select>
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Local</label>
                        <input
                            type="text"
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                            placeholder="Endereço ou link da reunião"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                        <textarea
                            className="w-full px-3 sm:px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none h-20 sm:h-24 resize-none text-sm"
                            placeholder="Detalhes adicionais..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 mt-6 sm:mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                    {/* WhatsApp Button - Only on edit with customer */}
                    {isEditing && formData.customerId && (
                        <a
                            href={`https://wa.me/55${customers.find(c => c.id === formData.customerId)?.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${formData.customerName}, sou da Bahia Elétrica. Estou a caminho para o serviço agendado às ${formData.time}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-4 py-2.5 bg-green-500 text-white hover:bg-green-600 rounded-lg font-medium shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 transition-colors text-sm"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Confirmar (WhatsApp)</span>
                            <span className="sm:hidden">WhatsApp</span>
                        </a>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:ml-auto w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors text-center"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onSave}
                            className="w-full sm:w-auto px-6 py-2.5 bg-brand-600 text-white hover:bg-brand-700 rounded-lg font-medium shadow-lg shadow-brand-500/30 transition-transform active:scale-95 text-center"
                        >
                            <span className="hidden sm:inline">Salvar Agendamento</span>
                            <span className="sm:hidden">Salvar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentModal;
