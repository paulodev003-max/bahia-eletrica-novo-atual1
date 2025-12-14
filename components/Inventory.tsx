import React, { useState, useMemo } from 'react';
import { Product, Category } from '../types';
import { Plus, Edit2, Trash2, Search, Filter, Calendar, Tag, Image as ImageIcon, Camera, FileText, X, ChevronDown } from 'lucide-react';
import { SupabaseService } from '../services/SupabaseService';

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const Inventory: React.FC<InventoryProps> = ({ products, setProducts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Dynamic Categories: Base enum + unique categories from existing products
  const availableCategories = useMemo(() => {
    const baseCategories = Object.values(Category);
    const productCategories = products.map(p => p.category);
    return Array.from(new Set([...baseCategories, ...productCategories])).sort();
  }, [products]);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: Category.MATERIAIS,
    stock: 0,
    minStock: 5,
    cost: 0,
    price: 0,
    supplier: '',
    batch: '',
    expiryDate: '',
    entryDate: new Date().toISOString().split('T')[0],
    image: '',
    observation: ''
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: Category.MATERIAIS,
        stock: 0,
        minStock: 5,
        cost: 0,
        price: 0,
        supplier: '',
        batch: '',
        expiryDate: '',
        entryDate: new Date().toISOString().split('T')[0],
        image: '',
        observation: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.cost || !formData.price) return;

    setIsSaving(true);
    try {
      if (editingProduct) {
        const updatedProduct = { ...editingProduct, ...formData } as Product;
        await SupabaseService.updateProduct(updatedProduct);
        setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
      } else {
        const newProduct = await SupabaseService.addProduct({
          ...formData as Omit<Product, 'id'>,
          lastUpdated: new Date().toISOString()
        });
        setProducts([...products, newProduct]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert('Erro ao salvar produto: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover este item do estoque?')) return;

    try {
      await SupabaseService.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert('Erro ao remover produto: ' + error.message);
    }
  };

  const filteredProducts = products.filter(p =>
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplier.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterCategory ? p.category === filterCategory : true)
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome, fornecedor..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter and Add Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:max-w-[200px]">
            <select
              className="appearance-none w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none cursor-pointer pr-10"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Todas Categorias</option>
              {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg transition-colors font-medium shadow-lg shadow-brand-500/20 sm:ml-auto"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Novo Item</span><span className="sm:hidden">Adicionar</span>
          </button>
        </div>
      </div>

      {/* Table for Desktop, Cards for Mobile */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold w-16">Img</th>
                <th className="px-6 py-4 font-semibold">Produto</th>
                <th className="px-6 py-4 font-semibold">Categoria</th>
                <th className="px-6 py-4 font-semibold">Estoque</th>
                <th className="px-6 py-4 font-semibold">Custo Unit.</th>
                <th className="px-6 py-4 font-semibold">Preço Venda</th>
                <th className="px-6 py-4 font-semibold">Margem</th>
                <th className="px-6 py-4 font-semibold">Detalhes</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredProducts.map((product) => {
                const margin = ((product.price - product.cost) / product.price) * 100;
                return (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                      <div className="text-xs text-gray-400">{product.supplier}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-medium ${product.stock <= product.minStock ? 'text-red-500 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                        {product.stock} un
                        {product.stock <= product.minStock && <span className="ml-1 text-[10px] bg-red-100 text-red-600 px-1 rounded">BAIXO</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">R$ {product.cost.toFixed(2)}</td>
                    <td className="px-6 py-4 font-medium text-brand-600 dark:text-brand-400">R$ {product.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${margin < 20 ? 'text-red-500' : margin < 40 ? 'text-yellow-500' : 'text-green-500'}`}>
                        {isFinite(margin) ? margin.toFixed(0) : 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 space-y-1">
                      {product.batch && <div className="flex items-center gap-1"><Tag className="w-3 h-3" /> L: {product.batch}</div>}
                      {product.expiryDate && <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Val: {product.expiryDate}</div>}
                      {product.observation && <div className="flex items-center gap-1 text-blue-500" title={product.observation}><FileText className="w-3 h-3" /> Obs</div>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(product)} className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 transition-colors" title="Editar">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-100 transition-colors" title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-gray-100 dark:divide-gray-700">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhum produto encontrado</div>
          ) : (
            filteredProducts.map((product) => {
              const margin = ((product.price - product.cost) / product.price) * 100;
              return (
                <div key={product.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Image */}
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 flex-shrink-0">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{product.name}</h3>
                          <p className="text-xs text-gray-400">{product.supplier}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap flex-shrink-0">
                          {product.category}
                        </span>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className={`text-sm font-bold ${product.stock <= product.minStock ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                            {product.stock}
                          </div>
                          <div className="text-[10px] text-gray-400 uppercase">Estoque</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="text-sm font-bold text-brand-600 dark:text-brand-400">R$ {product.price.toFixed(0)}</div>
                          <div className="text-[10px] text-gray-400 uppercase">Preço</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className={`text-sm font-bold ${margin < 20 ? 'text-red-500' : margin < 40 ? 'text-yellow-500' : 'text-green-500'}`}>
                            {isFinite(margin) ? margin.toFixed(0) : 0}%
                          </div>
                          <div className="text-[10px] text-gray-400 uppercase">Margem</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-2 mt-3">
                        <button onClick={() => handleOpenModal(product)} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium flex items-center gap-1">
                          <Edit2 className="w-3.5 h-3.5" /> Editar
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium flex items-center gap-1">
                          <Trash2 className="w-3.5 h-3.5" /> Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl p-8 animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingProduct ? 'Editar Produto' : 'Cadastro de Material'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Image Upload */}
              <div className="col-span-2 flex justify-center mb-4">
                <div className="relative group cursor-pointer">
                  <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700 hover:border-brand-500 transition-colors">
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-400">
                        <Camera className="w-8 h-8 mx-auto mb-2" />
                        <span className="text-xs">Adicionar Foto</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {formData.image && (
                    <button
                      onClick={(e) => { e.preventDefault(); setFormData({ ...formData, image: '' }); }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nome do Produto</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Disjuntor Tripolar 63A"
                />
              </div>

              <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                  <div className="relative">
                    <input
                      list="categories"
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none [&::-webkit-calendar-picker-indicator]:opacity-0"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Selecione ou digite..."
                    />
                    <datalist id="categories">
                      {availableCategories.map(c => <option key={c} value={c} />)}
                    </datalist>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 ml-1">
                    * Nova categoria? Basta digitar.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Fornecedor</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    value={formData.supplier}
                    onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg col-span-2 grid grid-cols-2 gap-4 border border-gray-100 dark:border-gray-700">
                <h3 className="col-span-2 text-sm font-bold text-gray-500 uppercase tracking-wide">Financeiro</h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Custo Compra (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    value={formData.cost}
                    onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Preço Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 col-span-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Estoque Atual</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Estoque Mínimo (Alerta)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    value={formData.minStock}
                    onChange={e => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Lote</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    value={formData.batch}
                    onChange={e => setFormData({ ...formData, batch: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Validade</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    value={formData.expiryDate}
                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Observações</label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none"
                  value={formData.observation}
                  onChange={e => setFormData({ ...formData, observation: e.target.value })}
                  placeholder="Detalhes técnicos, localização no estoque, etc."
                />
              </div>

            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-brand-600 text-white hover:bg-brand-700 rounded-lg font-medium shadow-lg shadow-brand-500/30 transition-transform active:scale-95"
              >
                Salvar Produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;