import React from 'react';
import { Calendar as CalendarIcon, User, MapPin, Clock, PlayCircle, CheckCircle, XCircle, Edit2, Trash2 } from 'lucide-react';
import { Appointment, AppointmentStatus } from '../../types';
import { format, parseISO } from '../../utils/dateUtils';

interface AgendaListProps {
    viewMode: 'list' | 'calendar';
    selectedDate: Date;
    appointments: Appointment[]; // This will be either filtered or selected date appointments
    handleStatusChange: (id: string, status: AppointmentStatus) => void;
    handleOpenModal: (app: Appointment) => void;
    handleDelete: (id: string) => void;
}

const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
        case 'in_progress': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
        case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
        case 'canceled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
        default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    }
};

const AgendaList: React.FC<AgendaListProps> = ({
    viewMode,
    selectedDate,
    appointments,
    handleStatusChange,
    handleOpenModal,
    handleDelete
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[500px] flex flex-col">

            {/* List Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 rounded-t-xl">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                    {viewMode === 'calendar'
                        ? `Agenda: ${format(selectedDate, "dd 'de' MMMM", { locale: 'pt-BR' })}`
                        : 'Todos os Agendamentos'}
                </h3>
                {viewMode === 'calendar' && (
                    <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                        {appointments.length} eventos
                    </span>
                )}
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {appointments.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60 min-h-[300px]">
                        <CalendarIcon className="w-16 h-16 mb-4 stroke-1" />
                        <p>Nenhum agendamento encontrado.</p>
                    </div>
                ) : (
                    appointments.map(app => (
                        <div
                            key={app.id}
                            className={`
                  relative flex flex-col md:flex-row gap-4 p-4 rounded-xl border-l-4 transition-all hover:shadow-md
                  bg-white dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700
                  ${app.status === 'completed' ? 'border-l-green-500' : app.status === 'in_progress' ? 'border-l-amber-500' : app.status === 'canceled' ? 'border-l-red-500' : 'border-l-blue-500'}
                `}
                        >
                            {/* Time & Status Column */}
                            <div className="min-w-[120px] flex md:flex-col items-center md:items-start gap-2 md:gap-1">
                                <div className="text-xl font-bold text-gray-800 dark:text-white">{app.time}</div>
                                {viewMode === 'list' && <div className="text-xs text-gray-500">{format(parseISO(app.date), 'dd/MM/yyyy')}</div>}
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getStatusColor(app.status)}`}>
                                    {app.status === 'pending' ? 'Pendente' : app.status === 'in_progress' ? 'Andamento' : app.status === 'completed' ? 'Concluído' : 'Cancelado'}
                                </span>
                            </div>

                            {/* Details Column */}
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 dark:text-white text-lg">{app.title}</h4>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {app.customerName}</span>
                                    {app.responsible && <span className="flex items-center gap-1"><User className="w-3 h-3 text-brand-500" /> Resp: {app.responsible}</span>}
                                    {app.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {app.location}</span>}
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {app.duration} min</span>
                                </div>
                                {app.description && (
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                                        {app.description}
                                    </p>
                                )}
                            </div>

                            {/* Actions Column */}
                            <div className="flex items-start md:flex-col gap-2 justify-end md:justify-start pt-4 md:pt-0 pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700">
                                {app.status === 'pending' && (
                                    <button
                                        onClick={() => handleStatusChange(app.id, 'in_progress')}
                                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                        title="Iniciar Atendimento"
                                    >
                                        <PlayCircle className="w-5 h-5" />
                                    </button>
                                )}
                                {app.status === 'in_progress' && (
                                    <button
                                        onClick={() => handleStatusChange(app.id, 'completed')}
                                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                        title="Concluir"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                    </button>
                                )}
                                {app.status !== 'canceled' && app.status !== 'completed' && (
                                    <button
                                        onClick={() => handleStatusChange(app.id, 'canceled')}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Cancelar"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleOpenModal(app)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Editar"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(app.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AgendaList;
