import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { TrendingUp, AlertTriangle, DollarSign, Package, Zap, Wrench, Wallet, Calendar, CheckCircle, XCircle, Clock, Activity, ShoppingCart, TrendingDown } from 'lucide-react';
import { Product, Service, Customer, Appointment, Expense } from '../types';

// Helper functions replacing date-fns
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
const subMonths = (date: Date, months: number) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
};
const parseISO = (str: string) => {
  if (!str) return new Date();
  // Handle YYYY-MM-DD to local time
  if (str.length === 10 && str.includes('-')) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(str);
};
const isWithinInterval = (date: Date, interval: { start: Date, end: Date }) => date >= interval.start && date <= interval.end;
const format = (date: Date, fmt: string, options?: any) => {
  if (fmt === 'MMM') {
    const m = date.toLocaleString('pt-BR', { month: 'short' });
    return m.charAt(0).toUpperCase() + m.slice(1);
  }
  return date.toLocaleDateString('pt-BR');
};

interface DashboardProps {
  products: Product[];
  services: Service[];
  customers: Customer[];
  appointments: Appointment[];
  expenses: Expense[];
}

const COLORS = ['#346ba8', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#6366f1'];

// Format currency helper
const toBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const Dashboard: React.FC<DashboardProps> = ({ products, services, customers, appointments, expenses }) => {
  const [analysisMode, setAnalysisMode] = useState<'products' | 'services'>('products');

  // --- CALCULATIONS ---

  // 1. Product Metrics
  const totalStockValue = products.reduce((acc, p) => acc + (p.cost * p.stock), 0);
  const totalPotentialSales = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const potentialProfit = totalPotentialSales - totalStockValue;
  const avgProductMargin = products.length > 0
    ? products.reduce((acc, p) => acc + ((p.price - p.cost) / p.price), 0) / products.length * 100
    : 0;

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const lowMarginProducts = products.filter(p => ((p.price - p.cost) / p.price) < 0.2);

  // 2. Service Metrics
  const activeServices = services.filter(s => s.active);
  const avgServiceMargin = activeServices.length > 0
    ? activeServices.reduce((acc, s) => acc + ((s.price - s.cost) / s.price), 0) / activeServices.length * 100
    : 0;
  // Alert for services with margin below 30%
  const lowMarginServices = activeServices.filter(s => ((s.price - s.cost) / s.price) < 0.3);

  // 3. Realized Revenue (From Customers/Orders)
  const realizedRevenue = customers.reduce((acc, c) =>
    acc + c.orders.reduce((oAcc, o) => oAcc + o.totalValue, 0)
    , 0);

  const totalOrdersCount = customers.reduce((acc, c) => acc + c.orders.length, 0);

  // 4. Appointment Metrics
  const now = new Date();
  const currentMonthInterval = { start: startOfMonth(now), end: endOfMonth(now) };

  const appointmentsThisMonth = appointments.filter(a =>
    isWithinInterval(parseISO(a.date), currentMonthInterval)
  );

  const appointmentsPending = appointments.filter(a => a.status === 'pending').length;
  const appointmentsCanceled = appointments.filter(a => a.status === 'canceled').length;
  const appointmentsCompletedThisMonth = appointmentsThisMonth.filter(a => a.status === 'completed').length;

  // 5. Expenses & Net Profit
  const totalExpensesMonth = expenses
    .filter(e => isWithinInterval(parseISO(e.date), currentMonthInterval))
    .reduce((acc, e) => acc + e.amount, 0);

  const netProfit = realizedRevenue - expenses.reduce((acc, e) => acc + e.amount, 0); // Simplified total net profit
  // For monthly net profit, we would need to filter revenue by month too, but let's stick to total for now or clarify requirement.
  // The user asked for "Calcular automaticamente o lucro líquido real considerando entradas – despesas."
  // Let's assume Total Realized Revenue - Total Expenses for the main KPI.

  const totalExpensesAllTime = expenses.reduce((acc, e) => acc + e.amount, 0);
  const realNetProfit = realizedRevenue - totalExpensesAllTime;


  // 6. Chart Data Preparation

  // Pie Chart: Composition
  const pieData = analysisMode === 'products'
    ? products.reduce((acc: any[], product) => {
      const existing = acc.find((c: any) => c.name === product.category);
      const value = product.price * product.stock;
      if (existing) existing.value += value;
      else acc.push({ name: product.category, value });
      return acc;
    }, [])
    : activeServices.reduce((acc: any[], service) => {
      const existing = acc.find((c: any) => c.name === service.category);
      if (existing) existing.value += 1; // Count for services
      else acc.push({ name: service.category, value: 1 });
      return acc;
    }, []);

  // Bar Chart: Top Items
  const barData = analysisMode === 'products'
    ? [...products]
      .sort((a, b) => (b.price * b.stock) - (a.price * a.stock))
      .slice(0, 5)
      .map(p => ({ name: p.name, value: p.price * p.stock, category: p.category, type: 'Estoque (R$)' }))
    : [...activeServices]
      .sort((a, b) => b.price - a.price)
      .slice(0, 5)
      .map(s => ({ name: s.name, value: s.price, category: s.category, type: 'Preço (R$)' }));

  // Appointment Evolution Chart (Last 6 months)
  const appointmentEvolutionData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      const monthStart = startOfMonth(d);
      const monthEnd = endOfMonth(d);
      const monthApps = appointments.filter(a => isWithinInterval(parseISO(a.date), { start: monthStart, end: monthEnd }));

      data.push({
        name: format(d, 'MMM'),
        completed: monthApps.filter(a => a.status === 'completed').length,
        canceled: monthApps.filter(a => a.status === 'canceled').length,
        pending: monthApps.filter(a => a.status === 'pending').length
      });
    }
    return data;
  }, [appointments]);

  // Dynamic Monthly Data based on Real Orders
  const monthlyData = useMemo(() => {
    // Initialize last 6 months
    const months: any = {};
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = d.toLocaleString('pt-BR', { month: 'short' });
      months[key] = { name: key, revenue: 0, expenses: 0, profit: 0, real: true };
    }
    // Future projection (2 months)
    const next1 = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const next2 = new Date(today.getFullYear(), today.getMonth() + 2, 1);
    months[next1.toLocaleString('pt-BR', { month: 'short' })] = { name: next1.toLocaleString('pt-BR', { month: 'short' }), revenue: realizedRevenue * 0.15, expenses: 0, profit: realizedRevenue * 0.05, real: false };
    months[next2.toLocaleString('pt-BR', { month: 'short' })] = { name: next2.toLocaleString('pt-BR', { month: 'short' }), revenue: realizedRevenue * 0.18, expenses: 0, profit: realizedRevenue * 0.06, real: false };

    // Fill with real data
    customers.forEach(c => {
      c.orders.forEach(o => {
        const date = new Date(o.date);
        const key = date.toLocaleString('pt-BR', { month: 'short' });
        if (months[key] && months[key].real) {
          months[key].revenue += o.totalValue;
        }
      });
    });

    // Fill with expenses
    expenses.forEach(e => {
      const date = new Date(e.date);
      const key = date.toLocaleString('pt-BR', { month: 'short' });
      if (months[key] && months[key].real) {
        months[key].expenses += e.amount;
      }
    });

    // Calculate Profit
    Object.keys(months).forEach(key => {
      if (months[key].real) {
        months[key].profit = months[key].revenue - months[key].expenses;
      }
    });

    // If no data, put some mock base data for visualization so chart isn't empty
    if (realizedRevenue === 0 && expenses.length === 0) {
      return [
        { name: 'Jan', revenue: 45000, expenses: 15000, profit: 30000, real: true },
        { name: 'Fev', revenue: 52000, expenses: 18000, profit: 34000, real: true },
        { name: 'Mar', revenue: 48000, expenses: 16000, profit: 32000, real: true },
        { name: 'Abr', revenue: 61000, expenses: 22000, profit: 39000, real: true },
        { name: 'Mai', revenue: 55000, expenses: 20000, profit: 35000, real: true },
        { name: 'Jun', revenue: 67000, expenses: 25000, profit: 42000, real: true },
        { name: 'Jul', revenue: 72000, expenses: 26000, profit: 46000, real: false }, // Projection
        { name: 'Ago', revenue: 78000, expenses: 28000, profit: 50000, real: false }, // Projection
      ];
    }

    return Object.values(months);
  }, [customers, realizedRevenue, expenses]);

  // --- RECENT ACTIVITY FEED ---
  const recentActivity = useMemo(() => {
    const activities: any[] = [];

    // Add recent orders
    customers.forEach(c => {
      c.orders.forEach(o => {
        activities.push({
          id: o.id,
          type: 'order',
          title: `Nova Venda: ${c.name}`,
          subtitle: `${o.items.length} itens - ${toBRL(o.totalValue)}`,
          date: new Date(o.date),
          status: o.status
        });
      });
    });

    // Add recent appointments
    appointments.forEach(a => {
      activities.push({
        id: a.id,
        type: 'appointment',
        title: `Agendamento: ${a.title}`,
        subtitle: `${a.customerName} - ${a.time}`,
        date: new Date(`${a.date}T${a.time}`),
        status: a.status
      });
    });

    // Sort by date desc and take top 10
    return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);
  }, [customers, appointments]);


  return (
    <div className="space-y-6 animate-fade-in pb-10">

      {/* KPI Cards - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

        {/* Faturamento Realizado */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-4 sm:p-6 rounded-xl shadow-lg border border-transparent relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-20 group-hover:opacity-30 transition-opacity">
            <Wallet className="w-10 h-10 sm:w-16 sm:h-16 text-white" />
          </div>
          <div className="flex flex-col relative z-10">
            <p className="text-xs sm:text-sm font-medium text-green-100">Faturamento Realizado</p>
            <h3 className="text-lg sm:text-2xl font-bold mt-1">
              {toBRL(realizedRevenue)}
            </h3>
            <div className="flex items-center mt-2 text-[10px] sm:text-xs font-medium bg-white/20 w-fit px-2 py-1 rounded-full text-white">
              <Package className="w-3 h-3 mr-1" /> {totalOrdersCount} vendas
            </div>
          </div>
        </div>

        {/* Lucro Líquido Real */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-10 h-10 sm:w-16 sm:h-16 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Lucro Líquido</p>
            <h3 className={`text-lg sm:text-2xl font-bold mt-1 ${realNetProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {toBRL(realNetProfit)}
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-2 hidden sm:block">Receita - Despesas</p>
          </div>
        </div>

        {/* Despesas do Mês */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Despesas (Mês)</p>
              <h3 className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {toBRL(totalExpensesMonth)}
              </h3>
            </div>
            <div className="p-1.5 sm:p-2 bg-red-50 dark:bg-red-900/20 rounded-lg flex-shrink-0">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-2 hidden sm:block">Total de saídas este mês</p>
        </div>

        {/* Produtos Cadastrados */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Produtos</p>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {products.length}
              </h3>
            </div>
            <div className="p-1.5 sm:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-blue-600 mt-2 hidden sm:block">Total de itens registrados</p>
        </div>
      </div>

      {/* Serviços KPI */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Portfólio de Serviços</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {activeServices.length} <span className="text-sm font-normal text-gray-400">ativos</span>
            </h3>
          </div>
          <div className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-lg">
            <Wrench className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Margem Média: <span className="font-bold text-brand-600">{avgServiceMargin.toFixed(1)}%</span></p>
      </div>


      {/* KPI Cards - Agenda Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-l-4 border-l-blue-500 border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Pendentes</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{appointmentsPending}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-l-4 border-l-green-500 border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full text-green-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Realizados (Mês)</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{appointmentsCompletedThisMonth}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-l-4 border-l-red-500 border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full text-red-600">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Cancelados (Total)</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{appointmentsCanceled}</h3>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Projection */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white">Fluxo de Caixa & Projeção</h4>
            <div className="flex gap-2 text-sm">
              <span className="flex items-center gap-1 text-gray-500"><div className="w-3 h-3 bg-brand-500 rounded-full"></div> Realizado</span>
              <span className="flex items-center gap-1 text-gray-500"><div className="w-3 h-3 bg-brand-300 rounded-full border border-dashed border-gray-400"></div> Projeção</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#346ba8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#346ba8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tickFormatter={(val) => `R$${val / 1000}k`} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                  formatter={(value: number) => toBRL(value)}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Receita"
                  stroke="#346ba8"
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution (Toggleable) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col gap-4 mb-2">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white">
              {analysisMode === 'products' ? 'Valor por Categoria' : 'Qtd. por Categoria'}
            </h4>

            {/* Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg self-start">
              <button
                onClick={() => setAnalysisMode('products')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${analysisMode === 'products' ? 'bg-white dark:bg-gray-600 shadow text-brand-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
              >
                Produtos
              </button>
              <button
                onClick={() => setAnalysisMode('services')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${analysisMode === 'services' ? 'bg-white dark:bg-gray-600 shadow text-brand-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
              >
                Serviços
              </button>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => analysisMode === 'products' ? toBRL(value) : value + ' un'}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ABC Curve & Activity History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Curva ABC / Top Items */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            {analysisMode === 'products' ? 'Top Produtos (Valor em Estoque)' : 'Top Serviços (Maior Valor)'}
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} interval={0} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                  formatter={(value: number) => toBRL(value)}
                />
                <Bar dataKey="value" name={analysisMode === 'products' ? 'Valor Total' : 'Preço'} fill="#346ba8" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Evolution Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" /> Evolução de Agendamentos
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentEvolutionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="completed" name="Concluídos" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={30} />
                <Bar dataKey="pending" name="Pendentes" stackId="a" fill="#346ba8" radius={[0, 0, 0, 0]} barSize={30} />
                <Bar dataKey="canceled" name="Cancelados" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>


      </div>

      {/* Expenses Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenses by Category Donut Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Raio-X das Despesas</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Distribuição de gastos por categoria</p>
            </div>
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenses.reduce((acc: any[], curr) => {
                    const found = acc.find(i => i.name === curr.category);
                    if (found) found.value += curr.amount;
                    else acc.push({ name: curr.category, value: curr.amount });
                    return acc;
                  }, []).sort((a, b) => b.value - a.value)}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenses.reduce((acc: any[], curr) => {
                    const found = acc.find(i => i.name === curr.category);
                    if (found) found.value += curr.amount;
                    else acc.push({ name: curr.category, value: curr.amount });
                    return acc;
                  }, []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#06b6d4', '#6366f1', '#d946ef'][index % 7]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => toBRL(value)}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                  itemStyle={{ color: '#f3f4f6' }}
                />
                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Expenses List */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Maiores Gastos</h3>
          <div className="space-y-4">
            {expenses
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5)
              .map((expense, index) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'}`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">{expense.description}</p>
                      <p className="text-xs text-gray-500">{expense.category}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">
                    {toBRL(expense.amount)}
                  </span>
                </div>
              ))}
            {expenses.length === 0 && (
              <p className="text-center text-gray-500 py-8">Nenhuma despesa registrada.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed (Replaces Alerts) */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-y-auto max-h-80">
        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-600" />
          Histórico de Atividade
        </h4>

        <div className="space-y-3">
          {recentActivity.length === 0 && (
            <p className="text-gray-500 text-sm">Nenhuma atividade recente registrada.</p>
          )}

          {recentActivity.map((activity, index) => (
            <div key={`${activity.type}-${activity.id}-${index}`} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700/50 last:border-0 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${activity.type === 'order' ? 'bg-green-100 text-green-600 dark:bg-green-900/20' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20'}`}>
                  {activity.type === 'order' ? <ShoppingCart className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{activity.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.subtitle}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{format(activity.date, 'dd/MM HH:mm')}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                  activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    activity.status === 'canceled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                  }`}>
                  {activity.status === 'completed' ? 'Concluído' :
                    activity.status === 'pending' ? 'Pendente' :
                      activity.status === 'canceled' ? 'Cancelado' : 'Em Andamento'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
