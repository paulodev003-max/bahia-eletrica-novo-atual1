import React, { useState } from 'react';
import { Users, X, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface ResponsibleManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    responsibles: string[];
    setResponsibles: (responsibles: string[]) => void;
    setAppointments: React.Dispatch<React.SetStateAction<any[]>>; // Using any[] to avoid circular dependency with types if not careful, but better use Appointment[]
    appointments: any[];
    formData: any;
    setFormData: (data: any) => void;
}

const ResponsibleManagerModal: React.FC<ResponsibleManagerModalProps> = ({
    isOpen,
    onClose,
    responsibles,
    setResponsibles,
    setAppointments,
    appointments,
    formData,
    setFormData
}) => {
    const [newRespName, setNewRespName] = useState('');
    const [editingRespOriginal, setEditingRespOriginal] = useState<string | null>(null);
    const [editingRespValue, setEditingRespValue] = useState('');

    if (!isOpen) return null;

    const handleAddResponsible = () => {
        if (newRespName.trim() && !responsibles.includes(newRespName.trim())) {
            setResponsibles([...responsibles, newRespName.trim()]);
            setNewRespName('');
        }
    };

    const handleDeleteResponsible = (name: string) => {
        if (window.confirm(`Deseja remover "${name}" da lista de responsáveis? Agendamentos antigos não serão alterados.`)) {
            setResponsibles(responsibles.filter(r => r !== name));
            if (formData.responsible === name) setFormData({ ...formData, responsible: '' });
        }
    };

    const startEditResponsible = (name: string) => {
        setEditingRespOriginal(name);
        setEditingRespValue(name);
    };

    const saveEditResponsible = () => {
        if (editingRespOriginal && editingRespValue.trim() && editingRespValue !== editingRespOriginal) {
            const newValue = editingRespValue.trim();
            setResponsibles(responsibles.map(r => r === editingRespOriginal ? newValue : r));

            // Update appointments
            setAppointments(appointments.map(a =>
                a.responsible === editingRespOriginal
                    ? { ...a, responsible: newValue }
                    : a
            ));

            // Update current form data if applicable
            if (formData.responsible === editingRespOriginal) {
                setFormData({ ...formData, responsible: newValue });
            }
        }
        setEditingRespOriginal(null);
        setEditingRespValue('');
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-4 sm:p-6 animate-in fade-in zoom-in duration-200 my-2 sm:my-8">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                        <span className="hidden sm:inline">Gerenciar Equipe Técnica</span>
                        <span className="sm:hidden">Equipe</span>
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                    {/* Add New Input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                            placeholder="Novo Responsável..."
                            value={newRespName}
                            onChange={(e) => setNewRespName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddResponsible()}
                        />
                        <button
                            onClick={handleAddResponsible}
                            disabled={!newRespName.trim()}
                            className="px-3 sm:px-4 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    {/* List */}
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {responsibles.map((resp, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700 group">

                                {editingRespOriginal === resp ? (
                                    <div className="flex gap-2 flex-1 mr-2">
                                        <input
                                            autoFocus
                                            className="w-full px-2 py-1.5 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={editingRespValue}
                                            onChange={(e) => setEditingRespValue(e.target.value)}
                                        />
                                        <button onClick={saveEditResponsible} className="p-1.5 text-green-600 hover:bg-green-100 rounded"><CheckCircle className="w-4 h-4" /></button>
                                        <button onClick={() => setEditingRespOriginal(null)} className="p-1.5 text-red-600 hover:bg-red-100 rounded"><XCircle className="w-4 h-4" /></button>
                                    </div>
                                ) : (
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{resp}</span>
                                )}

                                {!editingRespOriginal && (
                                    <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEditResponsible(resp)}
                                            className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-full transition-colors"
                                            title="Renomear"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteResponsible(resp)}
                                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors"
                                            title="Remover"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <p className="text-[10px] sm:text-xs text-gray-500 mt-4 bg-blue-50 dark:bg-blue-900/10 p-2 rounded text-center">
                        Dica: Ao editar um nome, todos os agendamentos vinculados serão atualizados.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResponsibleManagerModal;
