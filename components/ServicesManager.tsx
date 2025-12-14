
import React, { useState } from 'react';
import { Service, ServiceCategory } from '../types';
import { Plus, Edit2, Trash2, Search, Wrench, Clock, DollarSign, CheckCircle, XCircle, Settings, X, History } from 'lucide-react';
import { SupabaseService } from '../services/SupabaseService';

interface ServicesManagerProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
}

const ServicesManager: React.FC<ServicesManagerProps> = ({ services, setServices }) => {
  // State for Services
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // State for Price History
  const [historyService, setHistoryService] = useState<Service | null>(null);

  // State for Categories Management
  const [availableCategories, setAvailableCategories] = useState<string[]>(Object.values(ServiceCategory));
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    category: ServiceCategory.INSTALACAO,
    price: 0,
    cost: 0,
    description: '',
    estimatedHours: 1,
    active: true
  });

  // --- Service Handlers ---

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData(service);
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        category: availableCategories[0] || '',
        price: 0,
        cost: 0,
        description: '',
        estimatedHours: 1,
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) return;
    const now = new Date().toISOString();

    setIsSaving(true);
    try {
      if (editingService) {
        let updatedHistory = editingService.priceHistory ? [...editingService.priceHistory] : [];

        // If price changed, record it in history
        if (formData.price !== editingService.price) {
          if (updatedHistory.length === 0) {
            updatedHistory.push({ date: now, price: editingService.price });
          }
          updatedHistory.push({ date: now, price: formData.price! });
        }

        const updatedService = {
          ...editingService,
          ...formData,
          priceHistory: updatedHistory
        } as Service;

        await SupabaseService.updateService(updatedService);
        setServices(services.map(s => s.id === editingService.id ? updatedService : s));
      } else {
        const newService = await SupabaseService.addService({
          ...formData as Omit<Service, 'id'>,
          priceHistory: [{ date: now, price: formData.price! }]
        });
        setServices([...services, newService]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error saving service:', error);
      alert('Erro ao salvar serviço: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover este serviço?')) return;

    try {
      await SupabaseService.deleteService(id);
      setServices(services.filter(s => s.id !== id));
    } catch (error: any) {
      console.error('Error deleting service:', error);
      alert('Erro ao remover serviço: ' + error.message);
    }
  };

  const toggleStatus = async (service: Service) => {
    try {
      const updatedService = { ...service, active: !service.active };
      await SupabaseService.updateService(updatedService);
      setServices(services.map(s => s.id === service.id ? updatedService : s));
    } catch (error: any) {
      console.error('Error toggling status:', error);
      alert('Erro ao alterar status: ' + error.message);
    }
  };



  // --- Category Handlers ---

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !availableCategories.includes(newCategoryName.trim())) {
      setAvailableCategories([...availableCategories, newCategoryName.trim()]);
      setNewCategoryName('');
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    if (window.confirm(`Deseja remover a categoria "${categoryToRemove}"?`)) {
      setAvailableCategories(availableCategories.filter(c => c !== categoryToRemove));
      // Optional: Update formData if the removed category was selected
      if (formData.category === categoryToRemove) {
        setFormData({ ...formData, category: availableCategories[0] || '' });
      }
    }
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar serviço..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto sm:self-end flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg transition-colors font-medium shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Novo Serviço</span><span className="sm:hidden">Adicionar</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map(service => {
          const margin = service.price > 0 ? ((service.price - service.cost) / service.price) * 100 : 0;


          return (
            <div key={service.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group hover:shadow-md transition-all ${!service.active ? 'opacity-60' : ''}`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-lg text-brand-600 dark:text-brand-400">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleStatus(service)} title={service.active ? "Desativar" : "Ativar"}>
                      {service.active ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-gray-400" />}
                    </button>
                    <button onClick={() => setHistoryService(service)} className="text-gray-400 hover:text-blue-500" title="Histórico de Preços">
                      <History className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleOpenModal(service)} className="text-gray-400 hover:text-brand-500" title="Editar">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(service.id)} className="text-gray-400 hover:text-red-500" title="Excluir">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1" title={service.name}>{service.name}</h3>
                <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 rounded mb-4">
                  {service.category}
                </span>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 h-10">
                  {service.description || 'Sem descrição.'}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Preço (Cliente)</p>
                    <p className="text-lg font-bold text-brand-600 dark:text-brand-400">R$ {service.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Margem Est.</p>
                    <p className={`text-lg font-bold ${margin >= 40 ? 'text-green-500' : 'text-yellow-500'}`}>
                      {margin.toFixed(0)}%
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {service.estimatedHours}h
                    </div>

                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Custo: R$ {service.cost.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl p-4 sm:p-6 md:p-8 animate-in fade-in zoom-in duration-200 my-2 sm:my-8">
            <div className="flex justify-between items-center mb-4 sm:mb-6 border-b border-gray-100 dark:border-gray-700 pb-3 sm:pb-4">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 text-lg">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="col-span-1 md:col-span-3">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nome do Serviço</label>
                <input
                  type="text"
                  className="w-full px-3 sm:px-4 py-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Instalação de Inversor 5cv"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Categoria
                </label>
                <div className="flex gap-2">
                  <select
                    className="w-full flex-1 px-3 sm:px-4 py-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
                    title="Gerenciar Categorias"
                  >
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Tempo Est. (h)</label>
                <input
                  type="number"
                  step="0.5"
                  className="w-full px-3 sm:px-4 py-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                  value={formData.estimatedHours}
                  onChange={e => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) })}
                />
              </div>

              <div className="col-span-1 md:col-span-3">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                <textarea
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none h-20 sm:h-24 resize-none text-sm"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes do que está incluso no serviço..."
                />
              </div>



              <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 border border-gray-100 dark:border-gray-700">
                <h3 className="col-span-1 sm:col-span-2 text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wide">Precificação</h3>
                <div>
                  <div className="flex justify-between items-center mb-1 gap-2">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Custo Interno (R$)</label>
                    <span className="text-[9px] sm:text-[10px] text-gray-400 hidden sm:inline">Mão de obra + deslocamento</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 sm:px-4 py-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    value={formData.cost}
                    onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Preço ao Cliente (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 sm:px-4 py-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-6 sm:mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors text-center"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="w-full sm:w-auto px-6 py-2.5 bg-brand-600 text-white hover:bg-brand-700 rounded-lg font-medium shadow-lg shadow-brand-500/30 transition-transform active:scale-95 text-center"
              >
                <span className="hidden sm:inline">Salvar Serviço</span>
                <span className="sm:hidden">Salvar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-brand-600" /> Histórico de Preços
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[250px]">{historyService.name}</p>
              </div>
              <button onClick={() => setHistoryService(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {(!historyService.priceHistory || historyService.priceHistory.length === 0) ? (
                <p className="text-center text-gray-500 py-8">Nenhum histórico registrado.</p>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase sticky top-0">
                    <tr>
                      <th className="px-4 py-2">Data</th>
                      <th className="px-4 py-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {[...historyService.priceHistory].reverse().map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {new Date(item.date).toLocaleDateString('pt-BR')}
                          {idx === 0 && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Atual</span>}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-brand-600 dark:text-brand-400 text-right">
                          R$ {item.price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Categories Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-500" /> Gerenciar Categorias
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Add New Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="Nova Categoria..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* List */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {availableCategories.map((cat, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat}</span>
                    <button
                      onClick={() => handleRemoveCategory(cat)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-full transition-colors"
                      title="Remover Categoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-4 bg-blue-50 dark:bg-blue-900/10 p-2 rounded text-center">
                Nota: Remover uma categoria não exclui os serviços já criados com ela.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ServicesManager;
