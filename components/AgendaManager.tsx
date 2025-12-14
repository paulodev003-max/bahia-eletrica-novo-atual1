import React, { useState, useMemo } from 'react';
import { Appointment, AppointmentStatus, Customer } from '../types';
import { AlertCircle, Search, Plus, FileText, Download } from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  format,
  parseISO,
  isSameDay
} from '../utils/dateUtils';
import { SupabaseService } from '../services/SupabaseService';

import CalendarView from './Agenda/CalendarView';
import AgendaList from './Agenda/AgendaList';
import AppointmentModal from './Agenda/AppointmentModal';
import ResponsibleManagerModal from './Agenda/ResponsibleManagerModal';

interface AgendaManagerProps {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  customers: Customer[];
  responsibles: string[];
  setResponsibles: React.Dispatch<React.SetStateAction<string[]>>;
}

const AgendaManager: React.FC<AgendaManagerProps> = ({ appointments, setAppointments, customers, responsibles, setResponsibles }) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSaving, setIsSaving] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [responsibleFilter, setResponsibleFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<Partial<Appointment>>({
    title: '',
    customerName: '',
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 60,
    status: 'pending',
    description: '',
    responsible: '',
    location: ''
  });

  // Responsible Management State
  const [isRespManagerOpen, setIsRespManagerOpen] = useState(false);

  // --- Derived Data & Helpers ---

  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      const matchesSearch = app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesResponsible = !responsibleFilter || app.responsible.includes(responsibleFilter);

      return matchesSearch && matchesStatus && matchesResponsible;
    }).sort((a, b) => {
      // Sort by date/time
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  }, [appointments, searchTerm, statusFilter, responsibleFilter]);

  const appointmentsForSelectedDate = filteredAppointments.filter(app =>
    isSameDay(parseISO(app.date), selectedDate)
  );

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return filteredAppointments.filter(app => {
      const appDate = new Date(`${app.date}T${app.time}`);
      return appDate > now && app.status === 'pending';
    }).slice(0, 3);
  }, [filteredAppointments]);

  // --- Export Functions ---

  const handleExportCSV = () => {
    // Defines columns
    const headers = ["Data", "Hora", "Título", "Cliente", "Responsável", "Status", "Local", "Descrição"];

    // Rows
    const rows = filteredAppointments.map(app => [
      format(parseISO(app.date), 'dd/MM/yyyy'),
      app.time,
      `"${app.title.replace(/"/g, '""')}"`, // Escape quotes
      `"${app.customerName.replace(/"/g, '""')}"`,
      app.responsible,
      app.status === 'pending' ? 'Pendente' : app.status === 'in_progress' ? 'Em Andamento' : app.status === 'completed' ? 'Concluído' : 'Cancelado',
      `"${(app.location || '').replace(/"/g, '""')}"`,
      `"${(app.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `agendamentos_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text("Relatório de Agendamentos - Bahia Elétrica", 14, 15);

    doc.setFontSize(10);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 22);

    // Table Data
    const tableColumn = ["Data", "Hora", "Título", "Cliente", "Responsável", "Status"];
    const tableRows = filteredAppointments.map(app => [
      format(parseISO(app.date), 'dd/MM/yyyy'),
      app.time,
      app.title,
      app.customerName,
      app.responsible,
      app.status === 'pending' ? 'Pendente' : app.status === 'in_progress' ? 'Em Andamento' : app.status === 'completed' ? 'Concluído' : 'Cancelado'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [52, 107, 168] }, // Brand color approximation
      styles: { fontSize: 8 },
    });

    doc.save(`agendamentos_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  // --- CRUD Operations (Appointments) ---

  const handleOpenModal = (app?: Appointment) => {
    if (app) {
      setEditingAppointment(app);
      setFormData(app);
    } else {
      setEditingAppointment(null);
      setFormData({
        title: '',
        customerName: '',
        customerId: '',
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: '09:00',
        duration: 60,
        status: 'pending',
        description: '',
        responsible: responsibles[0] || '',
        location: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.date || !formData.time) return;

    setIsSaving(true);
    try {
      if (editingAppointment) {
        const updatedApp = { ...editingAppointment, ...formData } as Appointment;
        await SupabaseService.updateAppointment(updatedApp);
        setAppointments(appointments.map(a => a.id === editingAppointment.id ? updatedApp : a));
      } else {
        const newApp = await SupabaseService.addAppointment(formData as Omit<Appointment, 'id'>);
        setAppointments([...appointments, newApp]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      alert('Erro ao salvar agendamento: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este agendamento?')) return;

    try {
      await SupabaseService.deleteAppointment(id);
      setAppointments(appointments.filter(a => a.id !== id));
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      alert('Erro ao excluir agendamento: ' + error.message);
    }
  };

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    try {
      const app = appointments.find(a => a.id === id);
      if (!app) return;

      const updatedApp = { ...app, status: newStatus };
      await SupabaseService.updateAppointment(updatedApp);
      setAppointments(appointments.map(a => a.id === id ? updatedApp : a));
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert('Erro ao alterar status: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Banner: Upcoming */}
      {upcomingAppointments.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 to-brand-600 rounded-xl p-4 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold">Próximos Compromissos</h3>
              <p className="text-xs text-indigo-100">Você tem {upcomingAppointments.length} agendamentos pendentes em breve.</p>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {upcomingAppointments.map(app => (
              <div key={app.id} className="bg-white/10 backdrop-blur-md rounded-lg p-2 min-w-[200px] border border-white/10">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-sm truncate w-24">{app.title}</span>
                  <span className="text-[10px] bg-white/20 px-1.5 rounded">{app.time}</span>
                </div>
                <p className="text-xs text-indigo-100 truncate">{app.customerName}</p>
                <p className="text-[10px] text-indigo-200 mt-1">{format(parseISO(app.date), 'dd/MM')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 animate-slide-up delay-200">

        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar cliente ou título..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
            <select
              className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Todos Status</option>
              <option value="pending">Pendentes</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluídos</option>
              <option value="canceled">Cancelados</option>
            </select>

            <select
              className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
              value={responsibleFilter}
              onChange={(e) => setResponsibleFilter(e.target.value)}
            >
              <option value="">Responsável (Todos)</option>
              {responsibles.map((r, i) => <option key={i} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">

          {/* View Mode Toggle */}
          <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex text-xs font-medium">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-600 shadow text-brand-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Calendário
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow text-brand-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Lista Geral
            </button>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-1 border-l pl-3 border-gray-200 dark:border-gray-700">
            <button
              onClick={handleExportCSV}
              className="p-2 text-gray-500 hover:text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Exportar CSV"
            >
              <FileText className="w-5 h-5" />
            </button>
            <button
              onClick={handleExportPDF}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Exportar PDF"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" /> Agendar
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Calendar (Only visible in Calendar Mode) */}
        {viewMode === 'calendar' && (
          <div className="lg:col-span-4 xl:col-span-3 space-y-4 animate-slide-in-right delay-300">
            <CalendarView
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              filteredAppointments={filteredAppointments}
            />

            {/* Legend */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Legenda</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> <span className="text-gray-600 dark:text-gray-300">Pendente</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div> <span className="text-gray-600 dark:text-gray-300">Em Andamento</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> <span className="text-gray-600 dark:text-gray-300">Concluído</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> <span className="text-gray-600 dark:text-gray-300">Cancelado</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Right: Agenda List */}
        <div className={`${viewMode === 'calendar' ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'} animate-fade-in delay-300`}>
          <AgendaList
            viewMode={viewMode}
            selectedDate={selectedDate}
            appointments={viewMode === 'calendar' ? appointmentsForSelectedDate : filteredAppointments}
            handleStatusChange={handleStatusChange}
            handleOpenModal={handleOpenModal}
            handleDelete={handleDelete}
          />
        </div>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isEditing={!!editingAppointment}
        formData={formData}
        setFormData={setFormData}
        customers={customers}
        responsibles={responsibles}
        onSave={handleSave}
        onManageResponsibles={() => setIsRespManagerOpen(true)}
      />

      {/* Responsible Management Modal */}
      <ResponsibleManagerModal
        isOpen={isRespManagerOpen}
        onClose={() => setIsRespManagerOpen(false)}
        responsibles={responsibles}
        setResponsibles={setResponsibles}
        setAppointments={setAppointments}
        appointments={appointments}
        formData={formData}
        setFormData={setFormData}
      />

    </div>
  );
};

export default AgendaManager;
