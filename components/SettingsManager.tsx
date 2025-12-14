import React, { useState } from 'react';
import { UserSettings, UserProfile } from '../types';
import { Save, User, Briefcase, Plus, Trash2, Edit2, Lock, Mail, X, Check } from 'lucide-react';
import { SupabaseService } from '../services/SupabaseService';

interface SettingsManagerProps {
    settings: UserSettings;
    onSave: (settings: UserSettings) => void;
    users?: UserProfile[];
    setUsers?: (users: UserProfile[]) => void;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ settings, onSave, users = [], setUsers }) => {
    const [formData, setFormData] = useState<UserSettings>(settings);
    const [showSuccess, setShowSuccess] = useState(false);

    // New User State with password for Supabase Auth
    const [newUser, setNewUser] = useState<{ name: string; email: string; password: string; role: string }>({
        name: '',
        email: '',
        password: '',
        role: 'Usuário'
    });
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [userError, setUserError] = useState('');

    // Edit User State
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

    const handleSave = async () => {
        onSave(formData);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleAddUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            setUserError('Nome, Email e Senha são obrigatórios!');
            return;
        }
        if (newUser.password.length < 6) {
            setUserError('Senha deve ter no mínimo 6 caracteres!');
            return;
        }

        setIsCreatingUser(true);
        setUserError('');

        try {
            // Create user in Supabase Auth
            await SupabaseService.signUp(newUser.email, newUser.password, newUser.name);

            // Refresh users list from database
            const updatedUsers = await SupabaseService.getUsers();
            if (setUsers) {
                setUsers(updatedUsers);
            }

            setNewUser({ name: '', email: '', password: '', role: 'Usuário' });
            setUserError('');
        } catch (error: any) {
            console.error('Error creating user:', error);
            setUserError(error.message || 'Erro ao criar usuário');
        } finally {
            setIsCreatingUser(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm('Remover este usuário?')) return;

        try {
            await SupabaseService.deleteUser(id);
            if (setUsers) {
                setUsers(users.filter(u => u.id !== id));
            }
        } catch (error: any) {
            console.error('Error deleting user:', error);
            alert('Erro ao remover usuário: ' + error.message);
        }
    };

    const handleEditUser = (user: UserProfile) => {
        setEditingUser({ ...user });
    };

    const handleSaveEditUser = async () => {
        if (!editingUser) return;

        try {
            await SupabaseService.saveUser(editingUser);
            if (setUsers) {
                setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
            }
            setEditingUser(null);
        } catch (error: any) {
            console.error('Error updating user:', error);
            alert('Erro ao atualizar usuário: ' + error.message);
        }
    };

    return (
        <div className="animate-fade-in max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Configurações</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Gerencie seus dados e preferências do sistema.</p>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-brand-600" />
                    Dados do Usuário em PDF
                </h2>

                <div className="space-y-6">
                    {/* Company Settings */}
                    <div className="border-b border-gray-100 dark:border-gray-700 pb-6 mb-6">
                        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4">Dados da Empresa (Cabeçalho PDF)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Empresa</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endereço</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                                    value={formData.companyAddress}
                                    onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                                    placeholder="Rua Exemplo, 123"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cidade / Estado / CEP</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                                    value={formData.companyCity}
                                    onChange={(e) => setFormData({ ...formData, companyCity: e.target.value })}
                                    placeholder="Salvador, BA, 40000-000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                                    value={formData.companyPhone}
                                    onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                                    value={formData.companyEmail}
                                    onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* User Profile */}
                    <div>
                        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4">Dados do Usuário (Assinatura)</h3>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome Legível</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                placeholder="Ex: João da Silva"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Este nome aparecerá abaixo da linha de assinatura nos orçamentos.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cargo / Função</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                placeholder="Ex: Consultor Comercial"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Este cargo aparecerá no campo "Vendedor" dos orçamentos.</p>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                            Gerenciar Usuários do Sistema
                        </h3>

                        {/* New User Form */}
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700 mb-4">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Criar Novo Usuário (Supabase Auth)</h4>

                            {userError && (
                                <div className="bg-red-50 text-red-600 p-2 rounded-lg text-sm mb-3">
                                    {userError}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Nome do Usuário"
                                        className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                                        value={newUser.name}
                                        onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                    />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="password"
                                        placeholder="Senha (mín. 6 caracteres)"
                                        className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    />
                                </div>
                                <select
                                    className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="Usuário">Usuário</option>
                                    <option value="Administrador">Administrador</option>
                                    <option value="Técnico">Técnico</option>
                                </select>
                            </div>
                            <button
                                onClick={handleAddUser}
                                disabled={isCreatingUser}
                                className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreatingUser ? 'Criando...' : <><Plus className="w-4 h-4" /> Criar Usuário</>}
                            </button>
                        </div>

                        {/* Users List */}
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {users.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Nenhum usuário cadastrado.</p>}
                            {users.map(user => (
                                <div key={user.id || user.email} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm">
                                    {editingUser?.id === user.id ? (
                                        // Edit Mode
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 mr-2">
                                            <input
                                                type="text"
                                                className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                                value={editingUser.name}
                                                onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                                                placeholder="Nome"
                                            />
                                            <input
                                                type="email"
                                                className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                                value={editingUser.email}
                                                onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                                                placeholder="Email"
                                            />
                                            <select
                                                className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                                value={editingUser.role || 'Usuário'}
                                                onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                                            >
                                                <option value="Usuário">Usuário</option>
                                                <option value="Administrador">Administrador</option>
                                                <option value="Técnico">Técnico</option>
                                            </select>
                                        </div>
                                    ) : (
                                        // View Mode
                                        <div className="flex items-center gap-3">
                                            {user.picture ? (
                                                <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
                                                    {user.name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                                <span className="text-xs px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full">{user.role || 'Usuário'}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1">
                                        {editingUser?.id === user.id ? (
                                            <>
                                                <button
                                                    onClick={handleSaveEditUser}
                                                    className="text-green-500 hover:text-green-700 p-2 hover:bg-green-50 rounded transition-colors"
                                                    title="Salvar"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingUser(null)}
                                                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded transition-colors"
                                                    title="Cancelar"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="text-blue-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => user.id && handleDeleteUser(user.id)}
                                                    className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded transition-colors"
                                                    title="Remover"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        {showSuccess && (
                            <span className="text-green-600 dark:text-green-400 text-sm font-medium animate-fade-in flex items-center gap-2">
                                <Save className="w-4 h-4" /> Configurações salvas com sucesso!
                            </span>
                        )}
                        {!showSuccess && <span></span>}

                        <button
                            onClick={handleSave}
                            className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30 flex items-center gap-2"
                        >
                            <Save className="w-5 h-5" /> Salvar Alterações
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsManager;
