import React, { useState } from 'react';
import { Project, ProjectStatus, KanbanColumn } from '../types';
import { Plus, MoreVertical, Calendar, User, Trash2, Edit2, X, Check } from 'lucide-react';
import { SupabaseService } from '../services/SupabaseService';

interface KanbanBoardProps {
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    columns: KanbanColumn[];
    setColumns: React.Dispatch<React.SetStateAction<KanbanColumn[]>>;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ projects, setProjects, columns, setColumns }) => {
    const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
    const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [newProject, setNewProject] = useState<Partial<Project>>({
        title: '',
        customerName: '',
        status: columns[0]?.id || 'waiting_parts',
        priority: 'medium',
        responsible: ''
    });

    const [newColumn, setNewColumn] = useState<Partial<KanbanColumn>>({
        title: '',
        color: 'bg-gray-100 text-gray-800 border-gray-200'
    });

    const handleDragStart = (e: React.DragEvent, projectId: string) => {
        setDraggedProjectId(projectId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, status: ProjectStatus) => {
        e.preventDefault();
        if (!draggedProjectId) return;

        const project = projects.find(p => p.id === draggedProjectId);
        if (!project) return;

        try {
            const updatedProject = { ...project, status };
            await SupabaseService.updateProject(updatedProject);
            setProjects(projects.map(p => p.id === draggedProjectId ? updatedProject : p));
        } catch (error: any) {
            console.error('Error updating project status:', error);
            alert('Erro ao mover projeto: ' + error.message);
        }
        setDraggedProjectId(null);
    };

    const handleSaveProject = async () => {
        if (!newProject.title || !newProject.customerName) return;

        setIsSaving(true);
        try {
            if (editingProject) {
                const updatedProject = { ...editingProject, ...newProject } as Project;
                await SupabaseService.updateProject(updatedProject);
                setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p));
            } else {
                const projectToAdd = await SupabaseService.addProject({
                    title: newProject.title,
                    customerName: newProject.customerName,
                    status: newProject.status as ProjectStatus,
                    priority: newProject.priority as 'low' | 'medium' | 'high',
                    responsible: newProject.responsible,
                    deadline: newProject.deadline,
                    description: newProject.description
                });
                setProjects([...projects, projectToAdd]);
            }

            setIsModalOpen(false);
            setEditingProject(null);
            setNewProject({
                title: '',
                customerName: '',
                status: columns[0]?.id || 'waiting_parts',
                priority: 'medium',
                responsible: ''
            });
        } catch (error: any) {
            console.error('Error saving project:', error);
            alert('Erro ao salvar projeto: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditProject = (project: Project) => {
        setEditingProject(project);
        setNewProject(project);
        setIsModalOpen(true);
    };

    const handleDeleteProject = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este projeto?')) return;

        try {
            await SupabaseService.deleteProject(id);
            setProjects(projects.filter(p => p.id !== id));
        } catch (error: any) {
            console.error('Error deleting project:', error);
            alert('Erro ao excluir projeto: ' + error.message);
        }
    };

    const handleAddColumn = async () => {
        if (!newColumn.title) return;

        try {
            const columnToAdd = await SupabaseService.addKanbanColumn({
                title: newColumn.title,
                color: newColumn.color || 'bg-gray-100 text-gray-800 border-gray-200'
            });
            setColumns([...columns, columnToAdd]);
            setIsColumnModalOpen(false);
            setNewColumn({ title: '', color: 'bg-gray-100 text-gray-800 border-gray-200' });
        } catch (error: any) {
            console.error('Error adding column:', error);
            alert('Erro ao adicionar coluna: ' + error.message);
        }
    };

    const handleEditColumn = (column: KanbanColumn) => {
        setEditingColumn(column);
        setNewColumn(column);
        setIsColumnModalOpen(true);
    };

    const handleSaveColumn = async () => {
        if (!editingColumn || !newColumn.title) return;

        try {
            const updatedColumn = { ...editingColumn, ...newColumn } as KanbanColumn;
            await SupabaseService.updateKanbanColumn(updatedColumn);
            setColumns(columns.map(c => c.id === editingColumn.id ? updatedColumn : c));
            setIsColumnModalOpen(false);
            setEditingColumn(null);
            setNewColumn({ title: '', color: 'bg-gray-100 text-gray-800 border-gray-200' });
        } catch (error: any) {
            console.error('Error saving column:', error);
            alert('Erro ao salvar coluna: ' + error.message);
        }
    };

    const handleDeleteColumn = async (id: string) => {
        if (projects.some(p => p.status === id)) {
            alert('Não é possível excluir uma coluna que contém projetos. Mova os projetos primeiro.');
            return;
        }
        if (!window.confirm('Tem certeza que deseja excluir esta coluna?')) return;

        try {
            await SupabaseService.deleteKanbanColumn(id);
            setColumns(columns.filter(c => c.id !== id));
        } catch (error: any) {
            console.error('Error deleting column:', error);
            alert('Erro ao excluir coluna: ' + error.message);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-orange-100 text-orange-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const colorOptions = [
        { label: 'Amarelo', value: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
        { label: 'Azul', value: 'bg-blue-100 text-blue-800 border-blue-200' },
        { label: 'Indigo', value: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
        { label: 'Roxo', value: 'bg-purple-100 text-purple-800 border-purple-200' },
        { label: 'Verde', value: 'bg-green-100 text-green-800 border-green-200' },
        { label: 'Vermelho', value: 'bg-red-100 text-red-800 border-red-200' },
        { label: 'Cinza', value: 'bg-gray-100 text-gray-800 border-gray-200' },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestão de Projetos</h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setEditingColumn(null);
                            setNewColumn({ title: '', color: 'bg-gray-100 text-gray-800 border-gray-200' });
                            setIsColumnModalOpen(true);
                        }}
                        className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Nova Coluna
                    </button>
                    <button
                        onClick={() => {
                            setEditingProject(null);
                            setNewProject({
                                title: '',
                                customerName: '',
                                status: columns[0]?.id || 'waiting_parts',
                                priority: 'medium',
                                responsible: ''
                            });
                            setIsModalOpen(true);
                        }}
                        className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 flex items-center gap-2 shadow-lg shadow-brand-500/30"
                    >
                        <Plus className="w-5 h-5" /> Novo Projeto
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-full h-full">
                    {columns.map(column => (
                        <div
                            key={column.id}
                            className="flex-1 min-w-[280px] max-w-[350px] bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex flex-col border border-gray-100 dark:border-gray-700"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.id)}
                        >
                            <div className={`flex items-center justify-between mb-4 px-3 py-2 rounded-lg ${column.color} group`}>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-sm uppercase tracking-wide">{column.title}</h3>
                                    <span className="bg-white/50 px-2 py-0.5 rounded text-xs font-bold">
                                        {projects.filter(p => p.status === column.id).length}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditColumn(column)} className="p-1 hover:bg-white/30 rounded">
                                        <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => handleDeleteColumn(column.id)} className="p-1 hover:bg-white/30 rounded text-red-700">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                                {projects.filter(p => p.status === column.id).map(project => (
                                    <div
                                        key={project.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, project.id)}
                                        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-move hover:shadow-md transition-all active:scale-95 group relative"
                                    >
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                            <button
                                                onClick={() => handleEditProject(project)}
                                                className="p-1 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProject(project.id)}
                                                className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 ${getPriorityColor(project.priority)}`}>
                                            {project.priority === 'high' ? 'Alta' : project.priority === 'medium' ? 'Média' : 'Baixa'}
                                        </div>

                                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">{project.title}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{project.customerName}</p>

                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                            {project.deadline && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{new Date(project.deadline).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                            )}
                                            {project.responsible && (
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    <span>{project.responsible}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* New/Edit Column Modal */}
            {isColumnModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            {editingColumn ? 'Editar Coluna' : 'Nova Coluna'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                                    value={newColumn.title}
                                    onChange={e => setNewColumn({ ...newColumn, title: e.target.value })}
                                    placeholder="Ex: Em Análise"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cor</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {colorOptions.map((option) => (
                                        <button
                                            key={option.label}
                                            onClick={() => setNewColumn({ ...newColumn, color: option.value })}
                                            className={`w-8 h-8 rounded-full border-2 ${option.value.split(' ')[0]} ${newColumn.color === option.value ? 'border-gray-600 dark:border-white scale-110' : 'border-transparent'}`}
                                            title={option.label}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsColumnModalOpen(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={editingColumn ? handleSaveColumn : handleAddColumn}
                                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 shadow-lg shadow-brand-500/30"
                            >
                                {editingColumn ? 'Salvar' : 'Criar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New/Edit Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título do Projeto</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                                    value={newProject.title}
                                    onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                                    placeholder="Ex: Automação Painel Solar"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                                    value={newProject.customerName}
                                    onChange={e => setNewProject({ ...newProject, customerName: e.target.value })}
                                    placeholder="Nome do Cliente"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status Inicial</label>
                                <select
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                                    value={newProject.status}
                                    onChange={e => setNewProject({ ...newProject, status: e.target.value })}
                                >
                                    {columns.map(col => (
                                        <option key={col.id} value={col.id}>{col.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridade</label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                                        value={newProject.priority}
                                        onChange={e => setNewProject({ ...newProject, priority: e.target.value as any })}
                                    >
                                        <option value="low">Baixa</option>
                                        <option value="medium">Média</option>
                                        <option value="high">Alta</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Responsável</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                                        value={newProject.responsible}
                                        onChange={e => setNewProject({ ...newProject, responsible: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prazo</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                                    value={newProject.deadline}
                                    onChange={e => setNewProject({ ...newProject, deadline: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveProject}
                                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 shadow-lg shadow-brand-500/30"
                            >
                                {editingProject ? 'Salvar' : 'Criar Projeto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanbanBoard;
