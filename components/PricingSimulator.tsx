import React, { useState, useEffect } from 'react';
import { Product, Service } from '../types';
import { getPricingAdvice, generateInventoryInsight } from '../services/geminiService';
import { Sparkles, RefreshCw, ArrowRight, Zap, TrendingUp, Package, Wrench } from 'lucide-react';

interface PricingSimulatorProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
}

const PricingSimulator: React.FC<PricingSimulatorProps> = ({ products, setProducts, services, setServices }) => {
  const [mode, setMode] = useState<'product' | 'service'>('product');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  
  // Simulation State
  const [targetMargin, setTargetMargin] = useState<number>(40);
  const [costIncrease, setCostIncrease] = useState<number>(0);
  
  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [globalInsight, setGlobalInsight] = useState<string>('');

  // Reset selection when mode changes
  useEffect(() => {
    if (mode === 'product' && products.length > 0) setSelectedItemId(products[0].id);
    if (mode === 'service' && services.length > 0) setSelectedItemId(services[0].id);
    setAiAnalysis(null);
    setTargetMargin(40);
    setCostIncrease(0);
  }, [mode, products, services]);

  const selectedItem = mode === 'product' 
    ? products.find(p => p.id === selectedItemId) 
    : services.find(s => s.id === selectedItemId);

  // Simulation Logic
  const currentCost = selectedItem ? selectedItem.cost : 0;
  const currentPrice = selectedItem ? selectedItem.price : 0;
  
  // "What If" Logic
  const simulatedCost = currentCost * (1 + costIncrease / 100);
  // Prevent division by zero if target margin is 100 (unlikely but possible in UI)
  const safeMargin = targetMargin >= 99 ? 99 : targetMargin;
  const simulatedPrice = simulatedCost / (1 - (safeMargin / 100)); 
  const profitPerUnit = simulatedPrice - simulatedCost;

  const handleAiAnalyze = async () => {
    if (!selectedItem) return;
    setIsLoadingAi(true);
    setAiAnalysis(null);
    try {
      const result = await getPricingAdvice(selectedItem);
      setAiAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleGlobalInsight = async () => {
    setIsLoadingAi(true);
    try {
      const insight = await generateInventoryInsight(products);
      setGlobalInsight(insight);
    } catch(e) { console.error(e)}
    finally { setIsLoadingAi(false); }
  }

  const applySuggestedPrice = () => {
    if (!aiAnalysis || !selectedItem) return;
    
    if (mode === 'product') {
      setProducts(products.map(p => 
        p.id === selectedItem.id ? { ...p, price: aiAnalysis.suggestedPrice } : p
      ));
    } else {
      setServices(services.map(s => 
        s.id === selectedItem.id ? { ...s, price: aiAnalysis.suggestedPrice } : s
      ));
    }
  };

  const applySimulatedPrice = () => {
     if (!selectedItem) return;
     const newPrice = Number(simulatedPrice.toFixed(2));
     
     if (mode === 'product') {
       setProducts(products.map(p => 
        p.id === selectedItem.id ? { ...p, price: newPrice } : p
      ));
     } else {
       setServices(services.map(s => 
        s.id === selectedItem.id ? { ...s, price: newPrice } : s
      ));
     }
  }

  if ((mode === 'product' && products.length === 0) || (mode === 'service' && services.length === 0)) {
    return <div className="p-4">Cadastre itens para utilizar o simulador.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT: Simulation Engine */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-600" /> Simulador de Cenários
            </h3>
            
            {/* Mode Toggle */}
            <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex text-sm font-medium">
              <button
                onClick={() => setMode('product')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                  mode === 'product' 
                    ? 'bg-white dark:bg-gray-600 text-brand-600 dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                <Package className="w-4 h-4" /> Produtos
              </button>
              <button
                onClick={() => setMode('service')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                  mode === 'service' 
                    ? 'bg-white dark:bg-gray-600 text-brand-600 dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                <Wrench className="w-4 h-4" /> Serviços
              </button>
            </div>
          </div>
          
          {/* Item Selector */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              {mode === 'product' ? 'Selecione o Produto' : 'Selecione o Serviço'}
            </label>
            <select 
              className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              value={selectedItemId}
              onChange={(e) => {
                setSelectedItemId(e.target.value);
                setAiAnalysis(null);
                setTargetMargin(40);
                setCostIncrease(0);
              }}
            >
              {mode === 'product' 
                ? products.map(p => {
                    const margin = p.price > 0 ? (((p.price - p.cost)/p.price)*100).toFixed(0) : "0";
                    return <option key={p.id} value={p.id}>{p.name} (Margem: {margin}%)</option>
                  })
                : services.map(s => {
                    const margin = s.price > 0 ? (((s.price - s.cost)/s.price)*100).toFixed(0) : "0";
                    return <option key={s.id} value={s.id}>{s.name} (Margem: {margin}%)</option>
                  })
              }
            </select>
          </div>

          {/* Sliders */}
          <div className="space-y-8">
            
            {/* Margin Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Margem de Lucro Desejada</span>
                <span className="text-sm font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded">{targetMargin}%</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="90" 
                value={targetMargin} 
                onChange={(e) => setTargetMargin(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-brand-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Miníma (5%)</span>
                <span>Alta Rentabilidade (90%)</span>
              </div>
            </div>

            {/* Cost Increase Scenario */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {mode === 'product' ? 'Aumento Custo Fornecedor' : 'Aumento Custo Operacional'}
                </span>
                <span className={`text-sm font-bold px-2 py-1 rounded ${costIncrease > 0 ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-100'}`}>
                  +{costIncrease}%
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="50" 
                value={costIncrease} 
                onChange={(e) => setCostIncrease(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-red-500"
              />
            </div>
          </div>

          {/* Results Comparison */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 opacity-70">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Cenário Atual</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm"><span>Custo:</span> <span>R$ {currentCost.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>Preço:</span> <span>R$ {currentPrice.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-gray-800 dark:text-white mt-2">
                  <span>Lucro:</span>
                  <span>R$ {(currentPrice - currentCost).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-800 relative">
              <div className="absolute -top-3 right-4 bg-brand-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">SIMULAÇÃO</div>
              <p className="text-xs text-brand-700 dark:text-brand-300 uppercase font-semibold mb-2">Novo Cenário</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm"><span>Custo (+{costIncrease}%):</span> <span>R$ {simulatedCost.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>Preço Sugerido:</span> <span className="font-bold text-lg text-brand-700">R$ {simulatedPrice.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-brand-700 dark:text-brand-400 mt-2">
                  <span>Lucro Estimado:</span>
                  <span>R$ {profitPerUnit.toFixed(2)}</span>
                </div>
              </div>
              <button 
                onClick={applySimulatedPrice}
                className="w-full mt-3 bg-white border border-brand-200 text-brand-700 text-xs font-bold py-2 rounded hover:bg-brand-50"
              >
                Aplicar este Preço
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: AI Advisor */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="w-24 h-24" />
          </div>
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              Bahia IA Intelligence
            </h3>
            <button 
              onClick={handleAiAnalyze}
              disabled={isLoadingAi}
              className="text-xs bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
            >
              {isLoadingAi ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Consultar Especialista'}
            </button>
          </div>

          {!aiAnalysis && !isLoadingAi && (
            <p className="text-indigo-100 text-sm leading-relaxed relative z-10">
              {mode === 'product' 
                ? "Utilize nossa IA treinada no mercado elétrico para sugerir o preço ideal baseando-se no custo, concorrência e demanda atual."
                : "Receba sugestões inteligentes para precificar seus serviços, considerando a complexidade da mão de obra, tempo estimado e valor de mercado."
              }
            </p>
          )}

          {isLoadingAi && !aiAnalysis && (
            <div className="space-y-3 animate-pulse relative z-10">
              <div className="h-4 bg-white/30 rounded w-3/4"></div>
              <div className="h-20 bg-white/20 rounded"></div>
            </div>
          )}

          {aiAnalysis && (
            <div className="animate-fade-in relative z-10">
              <div className="mb-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <p className="text-indigo-200 text-xs uppercase mb-1">Preço Recomendado</p>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold text-white">
                    R$ {aiAnalysis.suggestedPrice}
                  </span>
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    aiAnalysis.confidence === 'High' ? 'bg-green-400 text-green-900' : 'bg-yellow-400 text-yellow-900'
                  }`}>
                    Confiança: {aiAnalysis.confidence === 'High' ? 'Alta' : 'Média'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                 <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 mt-0.5 text-yellow-300" />
                    <p className="text-sm text-indigo-50">
                      <span className="font-bold text-white">Tendência:</span> {aiAnalysis.marketTrend}
                    </p>
                 </div>
                 <p className="text-sm text-indigo-100 bg-black/20 p-3 rounded border-l-2 border-yellow-400 italic">
                  "{aiAnalysis.reasoning}"
                </p>
              </div>
              
              <button 
                onClick={applySuggestedPrice}
                className="w-full mt-4 py-2.5 bg-white text-indigo-700 font-bold rounded-lg hover:bg-indigo-50 transition flex justify-center items-center gap-2 shadow-lg"
              >
                Aplicar Recomendação <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Global Inventory Health - Only visible for Products as it generates summary of inventory */}
        {mode === 'product' && (
           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brand-500"/> Diagnóstico de Estoque
                </h3>
                 <button onClick={handleGlobalInsight} className="text-brand-600 text-xs hover:underline">Atualizar</button>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {globalInsight ? globalInsight : "Clique em atualizar para gerar um relatório executivo sobre a saúde do seu estoque e pontos de atenção."}
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default PricingSimulator;